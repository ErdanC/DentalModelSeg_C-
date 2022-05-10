#ifndef CROOTRECONSTRUCTION_COMMANDS_H
#define CROOTRECONSTRUCTION_COMMANDS_H
#include"prereq.h"
#include"command_base.h"
#include"context.h"
#include "../RootReconstruction/root_reconstruction.h"
#include<map>

class MANAGER_CLASS CRootReconstructionCommand :public CommandBase
{
protected:
	int crown_mesh_id_;
	std::vector<int> templates_ids_;
	std::map<int, COpenMeshT*> crown_meshes_;
	std::map<int, COpenMeshT*> template_meshes_;
public:
	CRootReconstruction *rootReconstruction_;
public:
	bool Execute(CManagerContext*manager_context);
	void Undo();
	void Redo();
	std::string GetCommandName() { return "CRootReconstructionCommand"; };
	~CRootReconstructionCommand() {};
	void setCrownMeshID(int mesh_id);
	void setTemplateMeshID(int mesh_id);
	CRootReconstructionCommand(int crown_mesh_id, std::vector<int> & templates_ids);
};
#endif