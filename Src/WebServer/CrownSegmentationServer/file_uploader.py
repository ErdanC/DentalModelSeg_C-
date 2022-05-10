import os
from flask import Flask, request, redirect, url_for,send_from_directory
from werkzeug.utils import secure_filename
import urllib

class FileUploader(object):
    def __init__(self,server,session_id,upload_folder,allowed_extensions):
        self.upload_folder_=upload_folder
        self.server_=server
        self.allowed_extensions_=allowed_extensions
        self.fname_=""
        self.session_id_=session_id
    def allowed_file(self,filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions_

    def UploadFile(self,request):
        print('upload file')

        if request.method == 'POST':
            print('post ' );

            print('upload')
            # check if the post request has the file part
            if 'file' not in request.files:
                ret = {}
                ret['success'] = False
                ret['message'] = 'No selected file'
                print(ret['message'])
                return ret
            file = request.files['file']
            # if user does not select file, browser also
            # submit a empty part without filename
            if file.filename == '':
                print('upload 2')
                ret = {}
                ret['success'] = False
                ret['message'] = 'File name is null'
                print(ret['message'])
                return ret
            if file and self.allowed_file(file.filename):
                print('upload 3')
                filename = self.session_id_ + secure_filename(file.filename)
                file.save(os.path.join(self.upload_folder_, filename))
                self.fname_ = filename
                ret = {}
                ret['success'] = True
                ret['message'] = 'file loaded: ' + filename
                print('upload succeed')
                return ret
            else:
                print('upload else')
                ret = {}
                ret['success'] = False
                ret['message'] = 'No Post used'
                print(ret['message'])

         #   req_json = request.get_json(force=True)

          #  if(false and type(req_json)!=type(None) and 'file_url' in req_json):
             #   print('file_url '+req_json['file_url']);
               # self.fname_=self.session_id_+'.stl'
                #urllib.request.urlretrieve(req_json['file_url'], os.path.join(self.upload_folder_, self.fname_))
                #ret={}
                #ret['success'] = True
                #ret['message'] = 'file uploaded: ' + self.fname_
                #return ret
            #else:

        else:
            print('upload 4')
            ret={}
            ret['success']=False
            ret['message']='No Post used'
            print(ret['message'])
        return ret



