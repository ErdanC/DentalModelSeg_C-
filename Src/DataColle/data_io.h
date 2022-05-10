// Copyright 2016_9 by ChenNenglun
#ifndef DATA_IO_H
#define DATA_IO_H
#include"prereq.h"
#include<iostream>
#include<string>
#include"mesh_object.h"

class DATACOLLE_CLASS CDataIO
{
protected:

public:
	
	static bool LoadCurveFromObj(std::string fname, std::vector<OpenMesh::Vec3d> &curve);
	static void SaveCurveToObj(std::string fname, std::vector<OpenMesh::Vec3d>&curve);
	static bool ReadMesh(std::string fname, CMeshObject & res_mesh_obj, OpenMesh::IO::Options io_options= OpenMesh::IO::Options::Default);
	static bool WriteMesh(std::string fname, CMeshObject & res_mesh_obj);
	static void LoadFeaturePointInfo(std::string fname, std::map<std::string, std::vector<std::pair<int, OpenMesh::Vec3d>>>&feature_points);
	static void LoadSegmentationResult(std::string fname, std::map<int, int>&res_face_tags);
	static void SaveFeaturePointInfo(std::string fname, std::map<std::string, std::vector<std::pair<int, OpenMesh::Vec3d>>>&feature_points);
	
};
#endif
