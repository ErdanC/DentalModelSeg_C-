import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
import urllib
import urllib.request
import ctypes
from ctypes import *
import json
import math
#from PIL import Image
HOST_NAME = ''
PORT_NUMBER = 8000




landmark_detect_lib = cdll.LoadLibrary('./liblandmarkidentification.so')


class LandmarkDetectWrapper(object):

    def RunDetectLandmark(self,fname,outfname):
       landmark_detect_lib.DetectLandmark(fname,outfname)
       # print(fname)


#fname="local-filename.jpg"
#ldr = LandmarkDetectWrapper();
#ldr.RunDetectLandmark(ctypes.create_string_buffer(fname.encode('utf-8')));



class MyHandler(BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        BaseHTTPRequestHandler.end_headers(self)


    def read_landmark(self,fname):
        #file_object = open(fname, 'r')
        #print(file_object.read())
        data=[]
        count=0
        img_w=0
        img_h=0
        with open(fname, 'r') as f:
            for line in f:
                c=0
                if count==0:
                    img_w=line.split(' ')[0]
                    img_h=line.split(' ')[1]
                else:
                    data.append([])
                    for s in line.split(' '):
                        num = float(s)
                        if num==float('NaN') or num==float('Inf'):
                            num=0
                        data[count-1].append(num)

                count=count+1
        #print(data)
        return {"data":data,"img_size":[img_w,img_h]}

    def do_GET(self):
        try:
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()

            values=urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)

            req=values['req'][0]
            #print(req)
            data=json.loads(req)

            fname=data['imageUrl'].split('/')[-1].split('\\')[-1]
            outfname=fname+".txt"
            urllib.request.urlretrieve(data['imageUrl'], fname)

            print(fname)


         #fname = "001.bmp"
            ldr = LandmarkDetectWrapper();
            ldr.RunDetectLandmark(ctypes.create_string_buffer(fname.encode('utf-8')),ctypes.create_string_buffer(outfname.encode('utf-8')))
            landmark_data=self.read_landmark(outfname)

            land_marks=landmark_data['data']

            response_data={}

            imgid=1
            response_data['coordinates'] = []
            for landmark in land_marks:
                coordinate_data={}
                coordinate_data['landmarkId']='L'+str(imgid)
                coordinate_data['y'] = math.floor(landmark[1])
                coordinate_data['x']=math.floor(landmark[0])
                response_data['coordinates'].append(coordinate_data)
                imgid = imgid + 1

            #img=Image.open(fname)

            response_data['imageWidth']=landmark_data['img_size'][0]
            response_data['apiKey'] = data['apiKey']
            response_data['imageId'] = data['imageId']

            response_string=json.dumps(response_data)
            #print(response_data)

            print("response string")
            print(response_string)

            #print(data['imageUrl'])



            self.wfile.write(bytes(response_string, "utf-8"))
        except:
            self.wfile.write(bytes("server error", "utf-8"))


if __name__ == '__main__':
    server_class = HTTPServer
    httpd = server_class((HOST_NAME, PORT_NUMBER), MyHandler)
    print(time.asctime(), 'Server Starts - %s:%s' % (HOST_NAME, PORT_NUMBER))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print(time.asctime(), 'Server Stops - %s:%s' % (HOST_NAME, PORT_NUMBER))