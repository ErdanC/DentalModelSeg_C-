// Copyright 2016_9 by ChenNenglun
#ifndef DATA_POOL_H
#define DATA_POOL_H
#include"prereq.h"
#include<iostream>
#include<map>
#include<vector>
#include"mesh_object.h"
#include"curve_object.h"

#include<memory>
class DATACOLLE_CLASS DataPool
{
protected:
	 std::map<int, std::shared_ptr<CMeshObject>> mesh_object_pool_;//pool of CMeshObject
	 int mesh_object_max_id_;// current max id in mesh_object_pool_

	 std::map<int, std::shared_ptr<CCurveObject>>curve_object_pool_;
	 int curve_object_max_id_;


public:
	 int AddMeshObject(CMeshObject *mesh);// add CMeshObject to mesh_object_pool_
	 bool DeleteMeshObject(int id);
	 CMeshObject * GetMeshObject(int id);
	 void Init();//initialization
	 std::map<int, std::shared_ptr<CMeshObject>>& GetMeshObjectPool();


	 int AddCurveObject(CCurveObject *curve);
	 bool DeleteCurveObject(int id);
	 void DeleteAllCurveObjects();
	 CCurveObject *GetCurveObject(int id);
	 std::map<int, std::shared_ptr<CCurveObject>>& GetCurveObjectPool();


	
};
#endif
