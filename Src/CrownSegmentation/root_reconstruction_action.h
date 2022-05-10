//created by zhiming 11.29.2017
#ifndef CROOT_RECONSTRUCTION_ACTION_H
#define CROOT_RECONSTRUCTION_ACTION_H
#include"action_base.h"
#include"../RootReconstruction/root_reconstruction.h"

class CRootReconstructionAction :public CActionBase
{
public:
	CRootReconstructionAction();
	OpenMesh::Vec3d GetRandomColor();
public:
	CRootReconstruction *rootReconstruction_;
	std::vector<int> templates_ids;
	int crown_id;
protected:
	void KeyPressEvent(QKeyEvent *e);
};
#endif