#ifndef SEGMENTATION_FUNCTIONS_H
#define SEGMENTATION_FUNCTIONS_H
#include"prereq.h"
#include"../DataColle/mesh_object.h"
class MANAGER_CLASS CSegmentationFunctions
{
private:
	static OpenMesh::Vec3d GetRandColor();
public:
	static void HarmonicSegmentation(CMeshObject&mesh_obj, int new_tag,std::vector<int>&vmarks, std::map<int,int>&vtag_modified);
	static void HarmonicSegmentation(CMeshObject&mesh_obj, std::vector<COpenMeshT::VertexHandle>&vhs,std::vector<COpenMeshT::VertexHandle>&res_tooth_vhs);
	static void AutoSegmentation(CMeshObject &mesh_obj, std::vector<int>&res_vmarks);
	static void GenFaceTagFromVTags(COpenMeshT&mesh, std::map<int, int>&vtags, std::vector<int>&res_ftags);
	static void  ComputeCrownLocalMatrixFromFaPointAndLongAxis(std::vector<OpenMesh::Vec3d>& fa_points, std::vector<OpenMesh::Vec3d>& means, std::vector<OpenMesh::Vec3d>& longaxis,std::vector<Eigen::MatrixXd>&res_matrixs);//pair int:fid
	static void ComputeFAPoints(CMeshObject &mesh_obj, std::map<int, int>&vtags, std::vector<std::pair<int, OpenMesh::Vec3d>>&res_fapoints);
};

#endif