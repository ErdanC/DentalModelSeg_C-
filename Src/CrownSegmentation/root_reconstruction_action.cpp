#include "qfiledialog.h"
#include "ui_context.h"
#include "igl/writeDMAT.h"
#include "igl/readDMAT.h"
#include "igl/writeOFF.h"
#include "igl/readOFF.h"
#include "../DataColle/data_io.h"
#include "../DataColle/data_pool.h"
#include "../AlgColle/geo_alg.h"
#include "../AlgColle/geo_base_alg.h"
#include "../DataColle/cgal_igl_converter.h"
#include "../AlgColle/non_rigid_icp.h"
#include "../RootReconstruction/root_reconstruction.h"
#include "../Manager/root_reconstruction_commands.h"
#include "root_reconstruction_action.h"
#include "new_harmonic_field_segmentation_action.h"

CRootReconstructionAction::CRootReconstructionAction(){
	this->rootReconstruction_ = new CRootReconstruction();
	type_ = CTeethRootReconstruction;
}

OpenMesh::Vec3d CRootReconstructionAction::GetRandomColor()
{

	double r = (rand() % 10000) / 11000.0;
	double g = (rand() % 10000) / 11000.0;
	double b = (rand() % 10000) / 11000.0;
	OpenMesh::Vec3d color(r, g, b);
	return color;
}

void CRootReconstructionAction::KeyPressEvent(QKeyEvent * e){
	switch (e->key()){
	//load the crown mesh
	//case Qt::Key_8: {
	//	//QString path = QFileDialog::getOpenFileName(NULL, "load dental mesh", ".", "Files(*.dmat *.obj *.stl *.off *.mat )");
	//	//if (path.length() == 0) {
	//	//	std::cerr << "Unable to load mesh\n" << std::endl;
	//	//	return;
	//	//}
	//	//CMeshObject *mesh_obj = new CMeshObject();
	//	//COpenMeshT &mesh = mesh_obj->GetMesh();
	//	//std::vector<int> mesh_tags;
	//	//Eigen::VectorXd scalars;
	//	//if (!CDataIO::ReadMesh(path.toStdString(), *mesh_obj)) {
	//	//	std::cerr << "Unable to load mesh\n" << std::endl;
	//	//	break;
	//	//}
	//	//path[path.length() - 3] = 'd';
	//	//path[path.length() - 2] = 'm';
	//	//path[path.length() - 1] = 'a';
	//	//path = path + 't';
	//	//if (igl::readDMAT(path.toStdString(), scalars)){
	//	//	for (int i = 0; i < scalars.size(); i++){
	//	//		mesh_tags.push_back(scalars(i));
	//	//	}
	//	//}
	//	//this->rootReconstruction_->segTeethToIndividual(this->crown_meshes_, mesh, mesh_tags);
	//	//for (auto iter = this->crown_meshes_.begin(); iter != this->crown_meshes_.end(); iter++){
	//	//	this->teeth_center_[iter->first] = CGeoAlg::ComputeMeshCenter(*this->crown_meshes_[iter->first]);
	//	//	CMeshObject* p_seg_tooth_mesh = new CMeshObject();
	//	//	p_seg_tooth_mesh->GetMesh() = *iter->second;
	//	//	p_seg_tooth_mesh->SetChanged();
	//	//	p_seg_tooth_mesh->SetMeshColor(OpenMesh::Vec3d(0.8, 0, 0));
	//	//	p_seg_tooth_mesh->SetAttrChanged();
	//	//	int seg_tooth_mesh_id_ = CUIContext::manager_context_.GetDataPool().AddMeshObject(p_seg_tooth_mesh);
	//	//}
	//	//break;
	//}
	//load the template
	case Qt::Key_2:{
		int id = 3;
		//read the template list
		std::vector<CMeshObject *> template_meshes;
		QStringList filepaths = QFileDialog::getOpenFileNames(NULL, tr("load template teeth"), "", tr("obj files(*.off)"));
		int file_count = filepaths.size();
		if (0 == file_count) {
			std::cerr << "Unable to load the template mesh!" << std::endl;
		}
		for (auto i = 0; i < file_count; i++){
			CMeshObject * template_mesh = new CMeshObject();
			std::cerr << filepaths[i].toStdString() << std::endl;
			CDataIO::ReadMesh(filepaths[i].toStdString(), *template_mesh, OpenMesh::IO::Options::VertexColor);
			template_meshes.push_back(template_mesh);
		}

		this->crown_id = CUIContext::GetSelectedMeshObjectId(); //CUIContext::manager_context_.GetCurrentMeshId();
		for (auto i = 0; i < template_meshes.size(); i++){
			int template_id = CUIContext::manager_context_.GetDataPool().AddMeshObject(template_meshes[i]);
			this->templates_ids.push_back(template_id);
		}
		CRootReconstructionCommand *p_cmd = new CRootReconstructionCommand(crown_id, this->templates_ids);
		CUIContext::manager_context_.GetCommandList().ExecuteCommand(p_cmd);
		//
		//QString path = QFileDialog::getOpenFileName(NULL, "load dental mesh", ".", "Files(*.dmat *.obj *.stl *.off )");
		//if (path.length() == 0){
		//	std::cerr << "unable to load the template mesh!\n" << std::endl;
		//	return;
		//}
		//CMeshObject * template_mesh = new CMeshObject();
		//CDataIO::ReadMesh(path.toStdString(), *template_mesh, OpenMesh::IO::Options::VertexColor);
		////init the position of the template
		//this->rootReconstruction_->initTemplatePosition(*this->crown_meshes_[crown_id], this->teeth_center_[crown_id], template_mesh->GetMesh());
		////seperate the template mesh into crown and root
		//COpenMeshT template_crown;
		//this->rootReconstruction_->templateCrownRootSeperate(template_mesh->GetMesh(), template_crown);
		////just use rigid icp in the non-rigid icp function
		//CNonRigidICP* rigid_icp;
		//if (rigid_icp == NULL) {
		//	delete rigid_icp;
		//}
		//rigid_icp = new CNonRigidICP(&template_mesh->GetMesh(), &template_crown, this->crown_meshes_[crown_id]);
		////calculate the displacement
		//std::map<int, OpenMesh::Vec3d> template_crown_displacement;
		//this->rootReconstruction_->templateToCrownDisplacement(template_mesh->GetMesh(), *this->crown_meshes_[crown_id], template_crown_displacement);
		//this->rootReconstruction_->templateToCrownFitting(template_mesh->GetMesh(), template_crown_displacement);
		//this->rootReconstruction_->meshSmooth(template_mesh->GetMesh());
		for (int i = 0; i < this->templates_ids.size(); i++){
			CMeshObject *template_meshes_obj = CUIContext::manager_context_.GetDataPool().GetMeshObject(this->templates_ids[i]);
			template_meshes_obj->SetMeshColor(OpenMesh::Vec3d(0.8, 0.8, 0.8));
			template_meshes_obj->SetAttrChanged();
		}
		break;
	}
	case Qt::Key_3:{
		for (int i = 0; i < this->templates_ids.size(); i++){
			CMeshObject * template_meshes_obj = CUIContext::manager_context_.GetDataPool().GetMeshObject(this->templates_ids[i]);
			template_meshes_obj->SetMeshColor(this->GetRandomColor());
			template_meshes_obj->SetAttrChanged();
		}
		CMeshObject * mesh_obj = CUIContext::manager_context_.GetDataPool().GetMeshObject(crown_id);
		mesh_obj->IsVisiable() = false;
		break;
	}
	}
}
