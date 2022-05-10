#include"crown_seg_commands.h"
#include"context.h"
#include"../DataColle/data_pool.h"
#include"../DataColle/data_io.h"
#include"../HarmonicSegAlg/harmonic_field.h"
#include"segmentation_functions.h"
#include"context.h"
#include<queue>
bool CDelTeethCommand::Execute(CManagerContext*manager_context)
{

	CMeshObject *p_mesh_obj_ = manager_context->GetDataPool().GetMeshObject(mesh_id_);
	if (p_mesh_obj_ == NULL)
	{
		return false;
	}
	COpenMeshT&mesh = p_mesh_obj_->GetMesh();
	if (mark_vid_<0 || mark_vid_>=mesh.n_vertices())
	{
		return false;
	}
	
	std::vector<int>vec_vtags(mesh.n_vertices());
	std::map<int, int>&map_vtags = p_mesh_obj_->GetVertexTags();
	for (auto viter = map_vtags.begin(); viter != map_vtags.end(); viter++)
	{
		vec_vtags[viter->first] = viter->second;
	}

	std::vector<int>deled_vids;
	std::queue<int>Q;
	Q.push(mark_vid_);
	deled_vids.push_back(mark_vid_);
	map_vtags[mark_vid_] = -1;
	int delvtag = vec_vtags[mark_vid_];
	std::cerr << "del vtag " << delvtag << std::endl;

	if (delvtag == -1)
	{
		return false;
	}
	vec_vtags[mark_vid_] = -1;
	while (!Q.empty())
	{
		int vid = Q.front();
		Q.pop();
		COpenMeshT::VertexHandle vh = mesh.vertex_handle(vid);
		for (auto vviter = mesh.vv_begin(vh); vviter != mesh.vv_end(vh); vviter++)
		{
			if (vec_vtags[vviter->idx()] == delvtag )
			{
				Q.push(vviter->idx());
				deled_vids.push_back(vviter->idx());
				vec_vtags[vviter->idx()] = -1;
				map_vtags[vviter->idx()] = -1;
			}
		}
	}
	
	std::set<int>fset;
	for (int i = 0; i < deled_vids.size(); i++)
	{
		COpenMeshT::VertexHandle vh = mesh.vertex_handle(deled_vids[i]);
		for (auto vfiter = mesh.vf_begin(vh); vfiter != mesh.vf_end(vh); vfiter++)
		{
			std::vector<int>fvtags;
			for (auto fviter = mesh.fv_begin(vfiter); fviter != mesh.fv_end(vfiter); fviter++)
			{
				fvtags.push_back(vec_vtags[fviter->idx()]);
			}
			if (fvtags[0] == fvtags[1] && fvtags[0] == fvtags[2]&& fvtags[0]==-1)
			{
				fset.insert(vfiter->idx());
			}
			
		}
	}
	
	res_modified_ftags_.clear();
	for (auto iter = fset.begin(); iter != fset.end(); iter++)
	{
		res_modified_ftags_.push_back(*iter);
	}
	
}
void CDelTeethCommand::Undo()
{

}
void CDelTeethCommand::Redo()
{

}

void CDelTeethCommand::GetDeledFtags(std::vector<int>&res_modified_ftags)
{
	res_modified_ftags = res_modified_ftags_;
}

CDelTeethCommand::CDelTeethCommand(int mesh_id, int mark_vid)
{
	mesh_id_ = mesh_id;
	mark_vid_ = mark_vid;
}

bool CMarkGingivaCommand::Execute(CManagerContext*manager_context)
{
	return false;
}
void CMarkGingivaCommand::Undo()
{

}
void CMarkGingivaCommand::Redo()
{

}
	
void CMarkGingivaCommand::GetModifiedFtags(std::map<int, int>&res_modified_ftags)
{

}

CMarkGingivaCommand::CMarkGingivaCommand(int mesh_id,int mark_vid)
{
	mesh_id_ = mesh_id;
	mark_vid_ = mark_vid;

}
CHarmonicSegmentationCommand::CHarmonicSegmentationCommand(int mesh_id, std::vector<int>&new_tooth_marks, int new_teeth_id )
{
	mesh_id_ = mesh_id;
	new_teeth_marks_ = new_tooth_marks;
	new_teeth_id_ = new_teeth_id;
}
void CHarmonicSegmentationCommand::GetModifiedFtags(std::map<int, int>&res_modified_ftags)
{
	res_modified_ftags = modified_ftags_;
}
void CHarmonicSegmentationCommand::GetModifiedVtags(std::map<int, int>&res_modified_vtags)
{
	res_modified_vtags = modified_vtags_;
}
bool CHarmonicSegmentationCommand::Execute(CManagerContext*manager_context)
{
	CMeshObject *p_mesh_obj_ = manager_context->GetDataPool().GetMeshObject(mesh_id_);
	CSegmentationFunctions::HarmonicSegmentation(*p_mesh_obj_, new_teeth_id_, new_teeth_marks_, modified_vtags_);
	COpenMeshT&mesh = p_mesh_obj_->GetMesh();
	std::vector<int>vec_vtags(mesh.n_vertices());
	std::map<int, int>&vtags = p_mesh_obj_->GetVertexTags();
	for (auto iter = vtags.begin(); iter!= vtags.end(); iter++)
	{
		vec_vtags[iter->first] = iter->second;
	}
	std::set<int>modified_fids;
	for (auto iter = modified_vtags_.begin(); iter != modified_vtags_.end(); iter++)
	{
		int vid = iter->first;
		COpenMeshT::VertexHandle vh = mesh.vertex_handle(vid);
		for (auto vfiter = mesh.vf_begin(vh); vfiter != mesh.vf_end(vh); vfiter++)
		{
			modified_fids.insert(vfiter->idx());
		}
	}
	modified_ftags_.clear();
	for (auto fiter = modified_fids.begin(); fiter != modified_fids.end(); fiter++)
	{
		int fid = *fiter;
		std::vector<int>fvtags;
		COpenMeshT::FaceHandle fh = mesh.face_handle(fid);
		for (auto fviter = mesh.fv_begin(fh); fviter != mesh.fv_end(fh); fviter++)
		{
			fvtags.push_back(vec_vtags[fviter->idx()]);
		}
		if (fvtags[0] == fvtags[1] && fvtags[1] == fvtags[2])
		{
			modified_ftags_[fid] = fvtags[0];
		}
		else
		{
			modified_ftags_[fid] = -1;
		}
	}
	//modified_vtags_ = p_mesh_obj_->GetVertexTags();
	return true;
	
}
void CHarmonicSegmentationCommand::Undo()
{

}
void CHarmonicSegmentationCommand::Redo()
{

}













bool CAutoSegmentationCommand::Execute(CManagerContext*manager_context)
{
	CMeshObject *p_mesh_obj_ = manager_context->GetDataPool().GetMeshObject(mesh_id_);
	std::vector<int>res_vtags;
	CSegmentationFunctions::AutoSegmentation(*p_mesh_obj_, res_vtags);
	modified_vtags_ = p_mesh_obj_->GetVertexTags();
	COpenMeshT&mesh = p_mesh_obj_->GetMesh();
	modified_ftags_.clear();
	for (auto fiter = mesh.faces_begin(); fiter != mesh.faces_end(); fiter++)
	{
		std::vector<int>ftags;
		for (auto fviter = mesh.fv_begin(fiter); fviter != mesh.fv_end(fiter); fviter++)
		{
			ftags.push_back(res_vtags[fviter->idx()]);
		}
		if (ftags[0] == ftags[1] && ftags[1] == ftags[2])
		{
			modified_ftags_[fiter->idx()] = ftags[0];
		}
		else
		{
			modified_ftags_[fiter->idx()] = -1;
		}
	}
	p_mesh_obj_->SetChanged();

	return true;
}
void CAutoSegmentationCommand::Undo()
{

}
void CAutoSegmentationCommand::Redo()
{

}
void CAutoSegmentationCommand::GetModifiedFtags(std::map<int, int>&res_modified_ftags)
{
	res_modified_ftags = modified_ftags_;
}
void CAutoSegmentationCommand::GetModifiedVtags(std::map<int, int>&res_modified_vtags)
{
	res_modified_vtags = modified_vtags_;
}
CAutoSegmentationCommand::CAutoSegmentationCommand(int mesh_id)
{
	mesh_id_ = mesh_id;
}




bool CComputeFAPointCommand::Execute(CManagerContext*manager_context)
{
	CMeshObject *p_mesh_obj_ = manager_context->GetDataPool().GetMeshObject(mesh_id_);
	std::vector<std::pair<int, OpenMesh::Vec3d>>res_fapoints;
	CSegmentationFunctions::ComputeFAPoints(*p_mesh_obj_, vtags_, res_fapoints);
	return true;
}
void CComputeFAPointCommand::Undo()
{

}
void CComputeFAPointCommand::Redo()
{

}

CComputeFAPointCommand::CComputeFAPointCommand(int mesh_id, std::map<int, int>&vtags)
{
	mesh_id_ = mesh_id;
	vtags_ = vtags;
}