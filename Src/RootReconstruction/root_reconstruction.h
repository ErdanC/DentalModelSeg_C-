#ifndef CROOTRECONSTRUCTION_H
#define CROOTRECONSTRUCTION_H
#include"prereq.h"
#include "../DataColle/data_io.h"

class ROOTRECONSTRUCTIONALG_CLASS CRootReconstruction{
public:
	CRootReconstruction();
public:
	void segTeethToIndividual(std::map<int, COpenMeshT*> & crown_meshes, COpenMeshT & mesh, std::vector<int>& tag_mesh);
	void initTemplatePosition(COpenMeshT &crown_meshes, COpenMeshT &template_mesh);
	void templateCrownRootSeperate(COpenMeshT & template_mesh, COpenMeshT & template_crown);
	void templateToCrownDisplacement(COpenMeshT & template_mesh, COpenMeshT & template_crown, std::map<int, OpenMesh::Vec3d> & template_crown_displacement);
	void templateToCrownFitting(COpenMeshT & template_mesh, std::map<int, OpenMesh::Vec3d> & template_crown_displacement);
	void meshSmooth(COpenMeshT & mesh);
};
#endif

