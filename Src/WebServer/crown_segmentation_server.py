import os
from flask import Flask, session, redirect, url_for, escape, request
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
from CrownSegmentationServer import file_uploader,config
from CrownSegmentationServer import crown_segmentation_alg
import json
import uuid
import threading

application = Flask(__name__)
CORS(application,supports_credentials=True)
crown_seg_alg_pool={}
seg_alg_lock = threading.Lock()

@application.route('/download', methods=['GET', 'POST'])
def DownloadFile():
    print('download')


@application.route('/upload', methods=['GET', 'POST'])
def UploadFile():
    print('init file uploader')
    session_id = str(uuid.uuid4())
    fuploder=file_uploader.FileUploader(application,session_id,config.UPLOAD_FOLDER,config.ALLOWED_EXTENSIONS)
    print('init file uploader finished')
    ret=fuploder.UploadFile(request)

    if ret['success']==True:
        if fuploder.fname_!="":
            cs_alg=crown_segmentation_alg.CrownSegmentationAlg(config.UPLOAD_FOLDER+"/"+fuploder.fname_)

            #print(session_id)
            #print(cs_alg.fpath_)

            session['session_id']=session_id

            seg_alg_lock.acquire()
            crown_seg_alg_pool[session_id]=cs_alg
            if seg_alg_lock.locked():
                seg_alg_lock.release()
            ret['session_id']=session_id
            print(session_id)
            response_string = json.dumps(ret)
            return response_string
        else:
            ret['success']=False
            ret['message']='uploading failed'
            response_string = json.dumps(ret)
            return response_string
    else:
        response_string = json.dumps(ret)
        return response_string


@application.route('/command',methods=['GET', 'POST'])
def ExecuteCommand():
    if request.method == 'POST':
        try:
            print('session ')
            print('session id' + session['session_id'])
            req_json=request.get_json(force=True)
            print(req_json)

            if 'session_id' in session:
                seg_alg_lock.acquire()
                if 'session_id' in req_json and req_json['session_id'] in crown_seg_alg_pool and session[
                    'session_id'] == req_json['session_id']:
                    cs_alg = crown_seg_alg_pool[req_json['session_id']]
                    if seg_alg_lock.locked():
                        seg_alg_lock.release()
                    # print(req_json)
                    # print(cs_alg)
                    ret = cs_alg.ExecuteCommand(req_json)
                    response_string = json.dumps(ret)
                    return response_string
                else:
                    if seg_alg_lock.locked():
                        seg_alg_lock.release()
                    ret = {}
                    ret['success'] = False
                    ret['message'] = 'session id doesnt match'
                    response_string = json.dumps(ret)
                    return response_string
            else:
                ret = {}
                ret['success'] = False
                ret['message'] = 'session id not in session, please upload file first'
                response_string = json.dumps(ret)
                return response_string
        except:
            if seg_alg_lock.locked():
                seg_alg_lock.release()
            print('system error')
            session.clear()
            ret = {}
            ret['success'] = False
            ret['message'] = 'System error'
            response_string = json.dumps(ret)
            return response_string
    else:
        ret = {}
        ret['success'] = False
        ret['message'] = 'use POST to send command'
        response_string = json.dumps(ret)
        return response_string

# set the secret key.  keep this really secret:
application.secret_key = 'A0Zr98j/3yXwsdf~XHH!jmN]LWX/,?RT'
if __name__ == '__main__':
    application.run(host='0.0.0.0',threaded=True)