#ifndef CCONTEXT_H
#define CCONTEXT_H
#include"prereq.h"
#include<iostream>
#include<string>
#include<opencv2/opencv.hpp>

#include"../DataColle/data_pool.h"
#include<map>
#include"command_list.h"

class MANAGER_CLASS CManagerContext
{
protected:
	int current_mesh_id_=-1;
	 DataPool data_pool;
	 CommandList command_list_;
public:
	 DataPool &GetDataPool() { return data_pool; }
	 CManagerContext();
	 CommandList &GetCommandList() { return command_list_; }
	 int& GetCurrentMeshId() { return current_mesh_id_; }

};




#endif