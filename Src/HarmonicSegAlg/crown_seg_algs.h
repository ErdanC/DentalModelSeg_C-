#ifndef CROWN_SEG_ALGS_H
#define CROWN_SEG_ALGS_H
#include"Eigen/Core"
#include <Eigen/Sparse>
#include<iostream>
#include<vector>
#include"../DataColle/custom_openmesh_type.h"
#include "../AlgColle/geo_alg.h"
#include "../AlgColle/geo_base_alg.h"
#include "../AlgColle/curve_base_alg.h"
#include "../DataColle/data_pool.h"
#include <igl/writeDMAT.h>
#include "../DataColle/cgal_igl_converter.h"
#include <igl/readDMAT.h>
#include <igl/writeSTL.h>
#include <igl/writeOBJ.h>
#include"prereq.h"

class HARMONICSEGALG_CLASS CrownSegAlgs
{

private:
	double EulerDistance(OpenMesh::Vec3d vec1, OpenMesh::Vec3d vec2);

public:
	void GetCrownBounds(std::map<int, int>& vtags, COpenMeshT& mesh, std::map<int, std::vector<COpenMeshT::VertexHandle>> &bounds_map);
	void LaplaceSmoothBounds(COpenMeshT& mesh, std::map<int, std::vector<COpenMeshT::VertexHandle>> &bounds_map);
	void LaplaceSmooth(COpenMeshT& mesh, std::map<int, std::vector<COpenMeshT::VertexHandle>> &bounds_map);
	void OutputTooth(int i, CMeshObject& meshobj, COpenMeshT& mesh, std::map<int, int>& vtags);
};


#endif