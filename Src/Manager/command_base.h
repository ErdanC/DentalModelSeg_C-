#ifndef COMMAND_BASE_H
#define COMMAND_BASE_H
#include<iostream>
#include"prereq.h"
class CManagerContext;
class MANAGER_CLASS CommandBase
{

protected:
	bool is_passive_ = false;//if it is set to true, when we undo the previous command, this command will be undoed automatically
public:
	virtual bool Execute(CManagerContext * manager_context) = 0;
	virtual void Undo() = 0;
	virtual void Redo() = 0;
	virtual std::string GetCommandName() { return "CommandBase"; };
	virtual ~CommandBase() {};
	bool IsPassive() { return is_passive_; }
};
#endif