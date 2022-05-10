#include "root_reconstruction_commands.h"
#include "../DataColle/data_pool.h"
#include "../DataColle/data_io.h"
#include "../AlgColle/non_rigid_icp.h"
#include "../RootReconstruction/root_reconstruction.h"
#include "context.h"
#include<queue>


bool CRootReconstructionCommand::Execute(CManagerContext * manager_context)
{
	//Read the mesh and seperate to crown meshes
	CMeshObject *mesh_obj = manager_context->GetDataPool().GetMeshObject(this->crown_mesh_id_);
	std::map<int, int> vtags = mesh_obj->GetVertexTags();
	COpenMeshT &mesh = mesh_obj->GetMesh();
	std::vector<int> mesh_tags;
	for (auto i = vtags.begin(); i != vtags.end(); i++){
		mesh_tags.push_back(i->second);
	}
	this->rootReconstruction_->segTeethToIndividual(this->crown_meshes_, mesh, mesh_tags);

	//read the template meshes
	for (auto i = 0; i < this->templates_ids_.size(); i++){
		CMeshObject *template_obj = manager_context->GetDataPool().GetMeshObject(this->templates_ids_[i]);
		this->template_meshes_[i] = &template_obj->GetMesh();
	}

	for (int i = 0; i < this->crown_meshes_.size(); i++){
		int crown_template_id = i;
		this->rootReconstruction_->initTemplatePosition(*this->crown_meshes_[crown_template_id], *this->template_meshes_[crown_template_id]);
		//seperate the template mesh into crown and root
		COpenMeshT template_crown;
		this->rootReconstruction_->templateCrownRootSeperate(*this->template_meshes_[crown_template_id], template_crown);
		//just use rigid icp in the non-rigid icp function
		CNonRigidICP* rigid_icp;
		if (rigid_icp == NULL) {
			delete rigid_icp;
		}
		rigid_icp = new CNonRigidICP(this->template_meshes_[crown_template_id], &template_crown, this->crown_meshes_[crown_template_id]);
		std::map<int, OpenMesh::Vec3d> template_crown_displacement;
		this->rootReconstruction_->templateToCrownDisplacement(*this->template_meshes_[crown_template_id], *this->crown_meshes_[crown_template_id], template_crown_displacement);
		this->rootReconstruction_->templateToCrownFitting(*this->template_meshes_[crown_template_id], template_crown_displacement);
		this->rootReconstruction_->meshSmooth(*this->template_meshes_[crown_template_id]);
	}

	//CMeshObject *template_obj_test;
	//template_obj_test->GetMesh() = *this->template_meshes_[7];
	//template_obj_test->SetMeshColor(OpenMesh::Vec3d(0.8, 0.8, 0.8));
	//int seg_tooth_mesh_id_ = CUIContext::manager_context_.GetDataPool().AddMeshObject(template_obj_test);
	//template_obj_test->SetAttrChanged();
	return false;
}

void CRootReconstructionCommand::Undo()
{
}

void CRootReconstructionCommand::Redo()
{
}

void CRootReconstructionCommand::setCrownMeshID(int mesh_id){
	this->crown_mesh_id_ = mesh_id;
}

void CRootReconstructionCommand::setTemplateMeshID(int mesh_id){
	//this->template_mesh_id_ = mesh_id;
}

CRootReconstructionCommand::CRootReconstructionCommand(int crown_mesh_id, std::vector<int> & templates_ids){
	this->crown_mesh_id_ = crown_mesh_id;
	this->templates_ids_ = templates_ids;
}
