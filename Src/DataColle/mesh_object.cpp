// Copyright 2016_9 by ChenNenglun
#include"mesh_object.h"
#include<iostream>
#include"obb_type.h"
int CMeshObject::GetId()
{
	return mesh_id_;
}
void CMeshObject::SetId(int id)
{
	mesh_id_ = id;
}
bool CMeshObject::IsChanged()
{
	return is_changed_;
}
void CMeshObject::RestoreCurrentVPos()
{
	for (auto viter = mesh_.vertices_begin(); viter != mesh_.vertices_end(); viter++)
	{
		restore_pos_[viter] = mesh_.point(viter);
		//OpenMesh::Vec3d p = this->TransformPointByLocalMatrix(mesh_.point(viter));
		
	}
	restore_mat_ = this->mat_;
}
void CMeshObject::GetRecoveredMesh(COpenMeshT &res_mesh)
{
	res_mesh = mesh_;
	for (auto iter = restore_pos_.begin(); iter != restore_pos_.end(); iter++)
	{
		res_mesh.set_point(iter->first, iter->second);
	}
	
}
void CMeshObject::RecoverCurrentVPos()
{
	for (auto iter = restore_pos_.begin(); iter != restore_pos_.end(); iter++)
	{
		mesh_.set_point(iter->first, iter->second);
	}
	this->mat_ = restore_mat_;
	SetChanged();
	
}
OpenMesh::Vec3d CMeshObject::TransformPointByLocalMatrix(OpenMesh::Vec3d p)
{
	Eigen::Vector4d p_eigen(p[0], p[1], p[2],1);
	Eigen::Vector4d res_p=mat_*p_eigen;
	return OpenMesh::Vec3d(res_p(0), res_p(1), res_p(2));
}
OpenMesh::Vec3d CMeshObject::TransformPointToLocalMatrix(OpenMesh::Vec3d p)
{
	Eigen::Vector4d p_eigen(p[0], p[1], p[2], 1);
	Eigen::Vector4d res_p = mat_.inverse()*p_eigen;
	return OpenMesh::Vec3d(res_p(0), res_p(1), res_p(2));
}
void CMeshObject::ApplyTransform()
{
	for (auto viter = mesh_.vertices_begin(); viter != mesh_.vertices_end(); viter++)
	{
		OpenMesh::Vec3d p=this->TransformPointByLocalMatrix(mesh_.point(viter));
		mesh_.set_point(viter,p);
	}
	mat_.setIdentity();
}
void CMeshObject::SetAttrChanged(bool is_attrchanged)
{
	is_changed_ = is_attrchanged;

}
void CMeshObject::SetChanged(bool is_changed)
{
	is_changed_ = is_changed;
	if (is_changed)
	{
		
		if (obb_wrapper_ != NULL)
		{
			delete obb_wrapper_;
			obb_wrapper_ = NULL;
		}
		if (geodesic_model_ != NULL)
		{
			delete geodesic_model_;
			geodesic_model_ = NULL;
		}
		tot_surface_area_ = -1;
		mesh_.update_normals();
	}
	
	if (vtag_.size() != mesh_.n_vertices())
	{
		vtag_.clear();

		for (auto viter = mesh_.vertices_begin(); viter != mesh_.vertices_end(); viter++)
		{
			vtag_[viter->idx()] = -1;
		}

	}
	
	
}
void CMeshObject::CopyFrom(CMeshObject& b)
{
	mesh_ = b.mesh_;
	is_visiable_ = b.is_visiable_;
	vtag_ = b.vtag_;
	is_shinning_ = b.is_shinning_;
	feature_vhs_ = b.feature_vhs_;
	SetChanged();
}
CMeshObject::CMeshObject(CMeshObject &b)
{
	mesh_ = b.mesh_;
	texture_id_ = b.TextureId();
	is_visiable_ = b.is_visiable_;
	use_texture_ = false;
	vtag_ = b.vtag_;
	obb_wrapper_ = NULL;
	is_shinning_ = b.is_shinning_;
	feature_vhs_ = b.feature_vhs_;
	SetChanged();
}
CMeshObject::CMeshObject():CBaseObject()
{

	mesh_id_ = -1;
	texture_id_ = -1;
	use_texture_ = false;
	is_changed_ = true;
	tot_surface_area_ = -1;
	obb_wrapper_ = NULL;
	is_visiable_ = true;
	vtag_.clear();
	is_shinning_ = false;
	feature_vhs_.clear();
	for (auto viter = mesh_.vertices_begin(); viter != mesh_.vertices_end(); viter++)
	{
		vtag_[viter->idx()] = -1;
	}
}
void CMeshObject::SetMesh(COpenMeshT& mesh)
{
	mesh_ = mesh;
}
void CMeshObject::GetFaceTagFromVertexTag(std::map<int, int>&res_ftags)
{
	res_ftags.clear();
	for (auto fiter = mesh_.faces_begin(); fiter != mesh_.faces_end(); fiter++)
	{
		
		std::vector<int>ftags;
		for (auto fviter = mesh_.fv_begin(fiter); fviter != mesh_.fv_end(fiter); fviter++)
		{
			int vid = fviter->idx();
			ftags.push_back(vtag_[vid]);

		}
		if (ftags.size() == 3 && ftags[0] == ftags[1] && ftags[1] == ftags[2])
		{
			res_ftags[fiter->idx()] = ftags[0];
		}
		else
		{
			res_ftags[fiter->idx()] = -1;
		}
	}
}
void CMeshObject::SetMeshColor(OpenMesh::Vec3d color)
{
	for (auto viter = mesh_.vertices_begin(); viter != mesh_.vertices_end(); viter++)
	{
		mesh_.set_color(viter, color);
	}
}
void CMeshObject::NormalizeUV()
{
	OpenMesh::Vec2f mmin(std::numeric_limits<float>::max(), std::numeric_limits<float>::max());
	OpenMesh::Vec2f mmax(std::numeric_limits<float>::min(), std::numeric_limits<float>::min());
	for (auto hiter = mesh_.halfedges_begin(); hiter != mesh_.halfedges_end(); hiter++)
	{
		OpenMesh::Vec2f uv=mesh_.data(hiter).GetUV();
		for (int i = 0; i < 2; i++)
		{
			if (mmin[i] > uv[i])
				mmin[i] = uv[i];
			if (mmax[i] < uv[i])
				mmax[i] = uv[i];
		}
	}
	float len0 = mmax[0] - mmin[0];
	float len1 = mmax[1] - mmin[1];
	for (auto hiter = mesh_.halfedges_begin(); hiter != mesh_.halfedges_end(); hiter++)
	{
		OpenMesh::Vec2f uv = mesh_.data(hiter).GetUV();
		if (len0 != 0)
			uv[0] = (uv[0] - mmin[0]) / len0;
		if (len1 != 0)
			uv[1] = (uv[1] - mmin[1]) / len1;
		mesh_.data(hiter).SetUV(uv);
	}
}
double CMeshObject::GetTotSurfaceArea()
{
	if (tot_surface_area_ == -1)
	{
		tot_surface_area_ = 0;
		for (auto fiter = mesh_.faces_begin(); fiter != mesh_.faces_end(); fiter++)
		{
			std::vector<OpenMesh::Vec3d>fvs;
			for (auto fviter = mesh_.fv_begin(fiter); fviter != mesh_.fv_end(fiter); fviter++)
			{
				fvs.push_back(mesh_.point(fviter));
			}
			OpenMesh::Vec3d va = fvs[1] - fvs[0];
			OpenMesh::Vec3d vb = fvs[2] - fvs[0];
			tot_surface_area_+=OpenMesh::cross(va, vb).length()/2;
		}
	}
	return tot_surface_area_;
}
CMeshObject::~CMeshObject()
{
	
	if (obb_wrapper_ != NULL)
	{
		delete obb_wrapper_;
	}
	if (geodesic_model_ != NULL)
		delete geodesic_model_;
}