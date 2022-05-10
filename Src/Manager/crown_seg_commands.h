#ifndef CMODELING_COMMANDS_H
#define CMODELING_COMMANDS_H
#include"prereq.h"
#include"command_base.h"
#include"context.h"
#include<map>

class MANAGER_CLASS CHarmonicSegmentationCommand:public CommandBase
{
protected:
	int mesh_id_;
	int new_teeth_id_;
	std::vector<int>new_teeth_marks_;
	std::map<int, int>modified_vtags_;
	std::map<int, int>modified_ftags_;
	std::map<int, std::vector<int>>res_tooth_;
	CHarmonicSegmentationCommand() {}
public:
	bool Execute(CManagerContext*manager_context);
	void Undo();
	void Redo();
	std::string GetCommandName() { return "CHarmonicSegmentationCommand"; };
	~CHarmonicSegmentationCommand() {};
	void GetModifiedVtags(std::map<int, int>&res_modified_vtags);
	void GetModifiedFtags(std::map<int, int>&res_modified_ftags);
	CHarmonicSegmentationCommand(int mesh_id, std::vector<int>&new_tooth_marks, int new_teeth_id=-1);
	

};
class MANAGER_CLASS CDelTeethCommand :public CommandBase
{
protected:
	int mesh_id_;
	int mark_vid_;
	std::vector<int>res_modified_ftags_;
	CDelTeethCommand() {}
public:
	bool Execute(CManagerContext*manager_context);
	void Undo();
	void Redo();
	std::string GetCommandName() { return "CDelTeethCommand"; };
	~CDelTeethCommand() {};
	void GetDeledFtags(std::vector<int>&res_deled_ftags);
	CDelTeethCommand(int mesh_id, int mark_vid);
};
class MANAGER_CLASS CMarkGingivaCommand :public CommandBase
{
protected:
	int mesh_id_;
	int mark_vid_;
	CMarkGingivaCommand() {}
public:
	bool Execute(CManagerContext*manager_context);
	void Undo();
	void Redo();
	std::string GetCommandName() { return "CMarkGingivaCommand"; };
	~CMarkGingivaCommand() {};
	void GetModifiedFtags(std::map<int, int>&res_modified_ftags);
	void GetModifiedVtags(std::map<int, int>&res_modified_vtags);
	CMarkGingivaCommand(int mesh_id,int mark_vid);
};
class MANAGER_CLASS CComputeFAPointCommand :public CommandBase
{
protected:
	int mesh_id_;
	std::map<int, int>vtags_;
public:
	bool Execute(CManagerContext*manager_context);
	void Undo();
	void Redo();
	std::string GetCommandName() { return "CComputeFAPointCommand"; };
	~CComputeFAPointCommand() {};
	CComputeFAPointCommand(int mesh_id, std::map<int,int>&vtags);
};
class MANAGER_CLASS CAutoSegmentationCommand :public CommandBase
{
protected:
	int mesh_id_;
	int new_teeth_id_;
	std::vector<int>new_teeth_marks_;
	std::map<int, int>modified_vtags_;
	std::map<int, int>modified_ftags_;
	std::map<int, std::vector<int>>res_tooth_;
	CAutoSegmentationCommand() {}
public:
	bool Execute(CManagerContext*manager_context);
	void Undo();
	void Redo();
	std::string GetCommandName() { return "CAutoSegmentationCommand"; };
	~CAutoSegmentationCommand() {};
	void GetModifiedFtags(std::map<int, int>&res_modified_ftags);
	void GetModifiedVtags(std::map<int, int>&res_modified_vtags);
	CAutoSegmentationCommand(int mesh_id);


};
#endif