import ctypes
from ctypes import *
import json
import math
import os
import urllib
import CrownSegmentationServer.CrownSegmentationPython
PSegAlg=CrownSegmentationServer.CrownSegmentationPython


class CrownSegmentationAlg(object):
    def __init__(self,fpath):
        self.fpath_=fpath
        self.alg_=PSegAlg.CCrownSegPython()
        self.is_inited_=False
        print(self.fpath_)
    def ExecuteCommand(self,req_command):
        print(self.fpath_)
        if 'command_type' not in req_command:
            ret = {}
            ret['success'] = False
            ret['message'] = 'unknow command'
            return ret

        if req_command['command_type']=='INIT':
            ret=self.Init()
            return ret
        elif req_command['command_type']=='GET_FACE_TAGS':
            ret=self.GetFaceTags();
            return ret

        elif req_command['command_type']=='DEL_TEETH':
            if 'mark_vid' not in req_command:
                ret = {}
                ret['success'] = False
                ret['message'] = 'failed to del teeth'
                return ret
            else:
                ret=self.DelTeeth(req_command['mark_vid'])
                return ret
        elif req_command['command_type']=='GET_CURRENT_MESH':
            ret=self.GetCurrentMesh()
            return ret
        elif req_command['command_type']=='DETECT_CROWN_LANDMARK':
            ret=self.DetectCrownLandMark()
            return ret
        elif req_command['command_type']=='APPLY_SEGMENTATION':
            if 'vmarks' not in req_command:
                ret = {}
                ret['success']=False
                ret['message']='failed to apply segmentation'
                return ret
            #print(req_command['vmarks'])
            ret=self.ApplySegmentation(req_command['vmarks'])
            return ret
        elif req_command['command_type']=='COMPUTE_CROWN_MATRIXS':
            print('COMPUTE_CROWN_MATRIXS')
            if 'data' not in req_command or 'centers' not in req_command['data'] or 'long_axises' not in req_command['data'] or 'fa_points' not in req_command['data']:
                ret = {}
                ret['success'] = False
                ret['message'] = 'failed to compute crown matrixs missing info'
                return ret

            return self.ComputeCrownMatrix(req_command['data']['centers'],req_command['data']['long_axises'],req_command['data']['fa_points'])


        elif req_command['command_type']=='APPLY_AUTO_SEGMENTATION':
            return self.ApplyAutoSegmentation()
        else:
            ret={}
            ret['success']=False
            ret['message']='unknow command'
            return ret

    def Init(self):
        ret={}
        if self.alg_.Init(self.fpath_)==True:
            self.is_inited_=True
            ret['success']=True
            ret['message']='init success'
        else:
            self.is_inited_=False
            ret['success']=False
            ret['message']='init failed'


        os.remove(self.fpath_)
        return ret

    def ApplyAutoSegmentation(self):
        res_tooth_vec_fids = PSegAlg.VectorInt()
        res_tooth_vec_ftags = PSegAlg.VectorInt()
        if self.alg_.ApplyAutoSegmentation(res_tooth_vec_fids, res_tooth_vec_ftags) == True:
            list_fids = []
            list_ftags = []
            for fid in res_tooth_vec_fids:
                list_fids.append(fid)
            for ftag in res_tooth_vec_ftags:
                list_ftags.append(ftag)
            ret = {}
            ret['success'] = True
            ret['message'] = 'apply auto segmentation successfully'
            ret['tooth_faces'] = list_fids
            ret['tooth_ftags'] = list_ftags
            return ret
        else:
            ret = {}
            ret['success'] = False
            ret['message'] = 'failed to apply auto segmentation'
            return ret;
    def DetectCrownLandMark(self):
        res_landmark_pos=PSegAlg.VectorDouble()
        res_fids=PSegAlg.VectorInt()
        if self.alg_.DetectLandmark(res_landmark_pos,res_fids)==True:
            list_landmark_pos = []
            for v in res_landmark_pos:
                list_landmark_pos.append(v)
            list_fids=[]
            for fid in res_fids:
                list_fids.append(fid)
            ret = {}
            ret['success'] = True
            ret['message'] = 'detect landmark succeed'
            ret['landmark_pos']=list_landmark_pos
            ret['landmark_fids']=list_fids
            return ret
        else:
            ret = {}
            ret['success'] = False
            ret['message'] = 'detect landmark failed'
            return ret

    def GetFaceTags(self):
        res_vec_ftags = PSegAlg.VectorInt()
        if self.alg_.GetFaceTags( res_vec_ftags) == True:
            list_ftags = []
            for fid in res_vec_ftags:
                list_ftags.append(fid)
            ret = {}
            ret['success'] = True
            ret['message'] = 'apply get face tag successfully'
            ret['face_tags'] = list_ftags
            return ret
        else:
            ret = {}
            ret['success'] = False
            ret['message'] = 'apply get face tag failed'
            return ret
    #def UploadFile(self,file_url):
       # urllib.request.urlretrieve(file_url, fname)

      #  return
    def DelTeeth(self,mark_vid):
        res_vec_fids = PSegAlg.VectorInt()
        if self.alg_.DelTeeth(mark_vid,res_vec_fids)==True:
            list_fids = []
            for fid in res_vec_fids:
                list_fids.append(fid)
            ret = {}
            ret['success'] = True
            ret['message'] = 'apply segmentation successfully'
            ret['deled_faces'] = list_fids
            return ret
        else:
            ret = {}
            ret['success'] = False
            ret['message'] = 'failed to del teeth'
            return ret
    def ComputeCrownMatrix(self,centers,longaxises,fapoints):
        print('ComputeCrownMatrix')
        if len(centers)!=len(longaxises) or len(centers)!=len(fapoints):
            ret = {}
            ret['success'] = False
            ret['message'] = 'failed to compute matrix'
            return ret
        list_centers=[]
        list_longaxises=[]
        list_fapoints=[]

        for v in centers:
            list_centers.append(v)

        for v in longaxises:
            list_longaxises.append(v)

        for v in fapoints:
            list_fapoints.append(v)

        vec_centers = PSegAlg.VectorDouble(list_centers)
        vec_longaxises=PSegAlg.VectorDouble(list_longaxises)
        vec_fapoints = PSegAlg.VectorDouble(list_fapoints)

        res_vec_matrixs = PSegAlg.VectorDouble()
        res_vec_inv_matrixs= PSegAlg.VectorDouble()
        if self.alg_.GetCrownLocalMatrix(vec_fapoints,vec_longaxises,vec_centers,res_vec_matrixs,res_vec_inv_matrixs):

            list_matrixs=[]
            list_invmatrixs=[]
            for v in res_vec_matrixs:
                list_matrixs.append(v)
            for v in res_vec_inv_matrixs:
                list_invmatrixs.append(v)
            ret = {}
            ret['success'] = True
            ret['message'] = 'compute matrix successfully'
            ret['matrixs'] = list_matrixs
            ret['invmatrixs']=list_invmatrixs
            return ret
        else:
            ret = {}
            ret['success'] = False
            ret['message'] = 'failed to compute matrix'
            return ret


    def ApplySegmentation(self,mark_vids):
        if len(mark_vids)==0:
            ret={}
            ret['success']=False
            ret['message']='failed to apply segmentation'
            return ret
        list_vids=[]
        for v in mark_vids:
           # print(type(v))
            list_vids.append(v)

        vec_mark_vids=PSegAlg.VectorInt(list_vids)

        res_vec_fids=PSegAlg.VectorInt()
        res_vec_ftags=PSegAlg.VectorInt()
        if self.alg_.ApplySegmentation(vec_mark_vids,res_vec_fids,res_vec_ftags)==True:
            list_fids=[]
            list_ftags=[]
            for fid in res_vec_fids:
                list_fids.append(fid)
            for ftag in res_vec_ftags:
                list_ftags.append(ftag)

            print('modified fids ', len(list_fids))
            print('modified ftags ',len(list_ftags))
            ret = {}
            ret['success'] = True
            ret['message'] = 'apply segmentation successfully'
            ret['updated_faces']=list_fids
            ret['updated_ftags']=list_ftags
            return ret

        else:
            ret = {}
            ret['success'] = False
            ret['message'] = 'fail to apply segmentation'
            return ret


    def GetCurrentMesh(self):
        ret={}
        if self.is_inited_==True:
            vertexs = PSegAlg.VectorDouble()
            faces=PSegAlg.VectorInt()
            updir=PSegAlg.VectorDouble()
            if self.alg_.GetCurrentMesh(vertexs,faces,updir)==False:
                ret['success']=False
                ret['message']='fail to get mesh'
                return ret
            else:
                ret['success'] = True
                ret['message'] = 'get mesh successfully'
                list_vertexs = []
                for v in vertexs:
                    list_vertexs.append(v)

                list_faces = []
                for f in faces:
                    list_faces.append(f)

                list_updir=[]
                for v in updir:
                    list_updir.append(v)

                ret['vertexs']=list_vertexs
                ret['faces']=list_faces
                ret['updir']=list_updir
                return ret
        else:
            ret['success']=False
            ret['message']='object need to be inited'
            return ret






