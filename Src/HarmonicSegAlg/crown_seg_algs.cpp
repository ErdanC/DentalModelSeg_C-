#include "crown_seg_algs.h"
#include <stack>
double CrownSegAlgs::EulerDistance(OpenMesh::Vec3d vec1, OpenMesh::Vec3d vec2)
{
	OpenMesh::Vec3d vec;
	vec = vec1 - vec2;

	double distance = vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2];

	return distance;
}
void CrownSegAlgs::GetCrownBounds(std::map<int, int>& vtags, COpenMeshT & mesh, std::map<int, std::vector<COpenMeshT::VertexHandle>>& bounds_map)
{
	std::vector<COpenMeshT::VertexHandle> bound;
	for (auto viter = mesh.vertices_begin(); viter != mesh.vertices_end(); viter++)
	{
		int vtag = vtags[viter->idx()];
		if (vtag != -1)
		{
			auto it = bounds_map.find(vtag);
			bool is_inside = true;

			if (it == bounds_map.end()) {
				bounds_map.insert(std::pair<int, std::vector<COpenMeshT::VertexHandle>>(vtag, bound));
			}

			for (auto vviter = mesh.vv_begin(viter); vviter != mesh.vv_end(viter); vviter++)
			{
				int vvtag = vtags[vviter->idx()];
				if (vtag != vvtag)
				{
					bounds_map[vtag].push_back(viter);
					//mesh.set_color(viter, OpenMesh::Vec3d(0, 0, 0));
					//bounds_map[vtag].push_back(vviter);
					is_inside = false;
					break;
				}
			}

		}

	}

}

void CrownSegAlgs::LaplaceSmoothBounds(COpenMeshT& mesh, std::map<int, std::vector<COpenMeshT::VertexHandle>>& bounds_map)
{
	double lamda = 0.1;
	int times = 80;
	COpenMeshT meshes[2];
	meshes[0] = mesh;
	meshes[1] = mesh;
	int p = 0;

	for (int i = 0; i < times; i++) {
		p = 1 - p;

		for (auto bounds_iter = bounds_map.begin(); bounds_iter != bounds_map.end(); bounds_iter++) {
			int tag = bounds_iter->first;
			std::vector<COpenMeshT::VertexHandle> bounds = bounds_iter->second;

			int length = bounds.size();

			//for every point in the bounds
			for (int i = 0; i < length; i++) {

				//to get mean of the neighbours in bounds of the vertex 
				OpenMesh::Vec3d pos(0, 0, 0);
				int count = 0;

				for (auto vviter = meshes[p].vv_begin(bounds[i]); vviter != meshes[p].vv_end(bounds[i]); vviter++) {
					for (int j = 0; j < length; j++) {
						if (vviter->idx() == bounds[j].idx()) {
							pos = pos + meshes[p].point(vviter);
							count++;
							break;
						}
					}
				}

				OpenMesh::Vec3d mean_pos = pos / (double)count;
				OpenMesh::Vec3d old_pos = meshes[p].point(bounds[i]);
				OpenMesh::Vec3d new_pos = old_pos + lamda * (mean_pos - old_pos);

				meshes[1-p].set_point(bounds[i], new_pos);

			}

		}
	}

	mesh = meshes[1-p];
	
}

void CrownSegAlgs::LaplaceSmooth(COpenMeshT & mesh, std::map<int, std::vector<COpenMeshT::VertexHandle>>& bounds_map)
{

	double lamda = 15; // the large this number is, the larger impact the old point has
	int times = 150;
	double energy_diff_threhold = 1e-7;
	COpenMeshT meshes[2];
	meshes[0] = mesh;
	meshes[1] = mesh;
	int p = 0;
	int i = 0;
	double energy = 100.0;
	double energy_before = 1000.0;

	while(i < times && (energy_before - energy) > energy_diff_threhold){
		p = 1 - p;

		energy_before = energy;
		energy = 0.0;
		for (auto bounds_iter = bounds_map.begin(); bounds_iter != bounds_map.end(); bounds_iter++) {
			int tag = bounds_iter->first;
			std::vector<COpenMeshT::VertexHandle> bounds = bounds_iter->second;

			int length = bounds.size();
	
			//for every point in the bounds
			for (int i = 0; i < length; i++) {

				//to get mean of the neighbours in bounds of the vertex 
				OpenMesh::Vec3d pos(0, 0, 0);
				int count = 0;

				for (auto vviter = meshes[p].vv_begin(bounds[i]); vviter != meshes[p].vv_end(bounds[i]); vviter++) {
					for (int j = 0; j < length; j++) {
						if (vviter->idx() == bounds[j].idx()) {
							pos = pos + meshes[p].point(vviter);
							count++;
							break;
						}
					}
				}

				OpenMesh::Vec3d mean_pos = pos / (double)count;
				OpenMesh::Vec3d old_pos = meshes[p].point(bounds[i]);
				OpenMesh::Vec3d new_pos = (mean_pos + lamda * old_pos) / (1 + lamda);

				energy += EulerDistance(mean_pos, new_pos) + lamda * EulerDistance(old_pos, new_pos);

				meshes[1 - p].set_point(bounds[i], new_pos);
			}
			
		}

		std::cout <<"cout now" << i << "The energy now: " << energy << std::endl;

		i++;
	}

	mesh = meshes[1 - p];
}


void CrownSegAlgs::OutputTooth(int i, CMeshObject& meshobj, COpenMeshT& mesh, std::map<int, int>& vtags)
{
	//COpenMeshT::Vertex v;
	//COpenMeshT::Face f;

	Eigen::MatrixXi faces;
	Eigen::MatrixXd vertexs;

	


	for (int i = -1; i < 18; i++) {
		bool found_one = false;
		COpenMeshT mesh_tmp;

		std::cout << "the tag now: " << i << std::endl;
		for (auto fiter = mesh.faces_begin(); fiter != mesh.faces_end(); fiter++) {
			bool is_crown = true;

			//To test if the vertex on the face are all in the same crown, if true, add the face and vertex.
			//If one of the vertex is not in the crown, it will be false

			for (auto viter = mesh.fv_begin(fiter); viter != mesh.fv_end(fiter); viter++) {
				int vtag = vtags[viter->idx()];

				if (vtag != i) {
					is_crown = false;
					break;
				}
			}

			if (is_crown) {
				std::vector<COpenMeshT::VertexHandle> vertexs_to_add;
				found_one = true;
				//std::cout << "the face to be added: " << fiter->idx()<< std::endl;

				//mesh_tmp.add_face(vertexs_to_add);
				for (auto viter = mesh.fv_begin(fiter); viter != mesh.fv_end(fiter); viter++) {
					OpenMesh::Vec3d pos = mesh.point(viter);
					COpenMeshT::VertexHandle vh = mesh_tmp.add_vertex(pos);
					vertexs_to_add.push_back(vh);
				}

				//std::cout << "vertexes added! " << std::endl;
				//mesh_tmp.add_property()
				mesh_tmp.add_face(vertexs_to_add[0], vertexs_to_add[1], vertexs_to_add[2]);
				//std::cout << "added!" << std::endl;
				//mesh.add_			
			}

		}

		if (found_one) {
			CConverter::ConvertFromOpenMeshToIGL(mesh_tmp, vertexs, faces);

			std::string str = "crown" + std::to_string(i);
			str = str + ".stl";

			igl::writeSTL(str, vertexs, faces);

			std::cout << str << std::endl;
		}
	
	}
	



}


