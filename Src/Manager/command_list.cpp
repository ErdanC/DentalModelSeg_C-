#include"command_list.h"
#include"context.h"


CommandList::CommandList(CManagerContext*manager_context,int max_record_num)
{
	max_record_num_ = max_record_num;
	manager_context_ = manager_context;
}

bool CommandList::ExecuteCommand(CommandBase *command)
{
	std::cerr<<"executing " + command->GetCommandName()<<std::endl;
	bool flag = command->Execute(manager_context_);
	if (!flag)
	{
		std::cerr<<"failed "<<std::endl;

		return false;
	}


	undo_list_.push_back(command);
	if (undo_list_.size() > max_record_num_)
	{
		if (undo_list_.front() != NULL)
		{
			delete undo_list_.front();
			undo_list_.pop_front();
		}
		else
		{
			std::cerr<<"error: undo_list.front()==NULL"<<std::endl;
			undo_list_.pop_front();

		}
	}
	while (redo_list.size())
	{
		if (redo_list.back() != NULL)
		{
			std::cerr<<"delete " + redo_list.back()->GetCommandName()<<std::endl;
			delete redo_list.back();
			redo_list.pop_back();
			std::cerr<<"delete done"<<std::endl;
		}
		else
		{
			std::cerr << "error: redo_list.back()==NULL" << std::endl;
		}
	}

	std::cerr<<"finish " + command->GetCommandName()<<std::endl;

	return true;

}
void CommandList::Init()
{
	while (redo_list.size())
	{
		if (redo_list.back() != NULL)
		{
			delete redo_list.back();
			redo_list.pop_back();
		}
		else
		{
			std::cerr<<"error: redo_list.back()==NULL"<<std::endl;
		}
	}

	while (undo_list_.size())
	{
		if (undo_list_.back() != NULL)
		{
			delete undo_list_.back();
			undo_list_.pop_back();
		}
		else
		{
			std::cerr << "error: undo_list_.back()==NULL" <<std::endl;
		}
	}

}
void CommandList::ClearCommands()
{

	undo_list_.clear();

	redo_list.clear();

}
bool CommandList::Undo()
{
	if (undo_list_.size() == 0)
	{

		return false;
	}

	CommandBase* cmd = undo_list_.back();
	undo_list_.pop_back();
	std::cerr<<"undo " + cmd->GetCommandName()<<std::endl;
	try
	{
		cmd->Undo();
		redo_list.push_back(cmd);
		bool is_pre_passive = cmd->IsPassive();
		if (undo_list_.size() > 0)
		{

			cmd = undo_list_.back();
			while (is_pre_passive)
			{

				is_pre_passive = cmd->IsPassive();
				undo_list_.pop_back();
				std::cerr<<"undo " + cmd->GetCommandName()<<std::endl;
				cmd->Undo();
				redo_list.push_back(cmd);
				if (undo_list_.size() > 0)
					cmd = undo_list_.back();
				else
					break;
			}
		}




		return true;
	}
	catch (void*)
	{
		std::cerr<<"error: undo failed" << std::endl;
	}


	return true;


}

bool CommandList::Redo()
{
	if (redo_list.size() == 0)
	{

		return false;
	}

	CommandBase* cmd = redo_list.back();
	std::cerr << "redo " + cmd->GetCommandName()<<std::endl;
	redo_list.pop_back();

	try
	{

		cmd->Redo();

		undo_list_.push_back(cmd);
		while (cmd->IsPassive() && redo_list.size()>0)
		{
			cmd = redo_list.back();
			redo_list.pop_back();
			std::cerr<<("redo " + cmd->GetCommandName())<<std::endl;
			cmd->Redo();
			undo_list_.push_back(cmd);

		}


		return true;
	}
	catch (void*)
	{
		std::cerr<<"error: redo failed"<<std::endl;

		return false;
	}

}