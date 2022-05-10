#ifndef COMMAND_LIST_H
#define COMMAND_LIST_H
#include"prereq.h"
#include<iostream>
#include<list>
#include<boost/shared_ptr.hpp>
#include"command_base.h"
class CManagerContext;
class MANAGER_CLASS CommandList
{

protected:
	std::list<CommandBase*> undo_list_;
	std::list<CommandBase*>redo_list;
	int max_record_num_;
	CManagerContext *manager_context_;
	

public:
	CommandList(CManagerContext*manager_context,int max_record_num = 50);
	
	bool ExecuteCommand(CommandBase *command);
	void Init();
	bool Undo();
	bool Redo();
	void ClearCommands();

};
#endif