// Copyright 2016_9 by ChenNenglun
#include"data_io.h"
#include<vector>
#include <OpenMesh/Core/IO/MeshIO.hh>
#include<igl/writeOBJ.h>
#include"cgal_igl_converter.h"
#include<igl/readDMAT.h>

bool CDataIO::ReadMesh(std::string fname, CMeshObject & res_mesh_obj, OpenMesh::IO::Options io_options)
{
	if (io_options != OpenMesh::IO::Options::Default)
	{
		if (!OpenMesh::IO::read_mesh(res_mesh_obj.GetMesh(), fname, io_options))
		{
			std::cerr << "read error\n";
			return false;
		}
	}
	else
	{
		if (!OpenMesh::IO::read_mesh(res_mesh_obj.GetMesh(), fname))
		{
			std::cerr << "read error\n";
			return false;
		}
	}
	
	COpenMeshT &mesh = res_mesh_obj.GetMesh();
	if (io_options== OpenMesh::IO::Options::Default)
	{
		for (auto viter = mesh.vertices_begin(); viter != mesh.vertices_end(); viter++)
		{
			mesh.set_color(viter, OpenMesh::Vec3d(0.8, 0.8, 0.8));
		}
	}
	
	res_mesh_obj.SetChanged();
	return true;
}
void CDataIO::SaveCurveToObj(std::string fname, std::vector<OpenMesh::Vec3d>&curve)
{
	
	std::ofstream out(fname);
	out << "g line" << std::endl;
	for (int i = 0; i < curve.size(); i++)
	{
		out <<"v "<< curve[i] << std::endl;
	}

	for (int i = 0; i < curve.size()-1; i++)
	{
		
		out <<"l "<< i+1<<" "<<i+2<<std::endl;
	}

	out.close();
}
bool CDataIO::LoadCurveFromObj(std::string fname, std::vector<OpenMesh::Vec3d> &curve)
{
	std::ifstream in(fname);
	char buf[256];
	curve.clear();
	while (in.getline(buf, sizeof buf))
	{
		std::istringstream line(buf);
		std::string word;
		line >> word;
		if (word == "v")
		{
			double x, y, z;
			line >> x;
			line >> y;
			line >> z;
			OpenMesh::Vec3d pt(x, y, z);
			curve.push_back(pt);
		}
	}
	return true;
}
void CDataIO::LoadSegmentationResult(std::string fname, std::map<int, int>&res_face_tags)
{
	res_face_tags.clear();
	Eigen::VectorXi eg_ftags;
	igl::readDMAT(fname, eg_ftags);
	for (int i = 0; i < eg_ftags.rows(); i++)
	{
		res_face_tags[i] = eg_ftags[i];
	}
}
void CDataIO::SaveFeaturePointInfo(std::string fname, std::map<std::string, std::vector<std::pair<int, OpenMesh::Vec3d>>>&feature_points)
{
	std::ofstream fileout(fname,std::ofstream::out);
	for(auto iter=feature_points.begin();iter!=feature_points.end();iter++)
	{
		std::string tag = iter->first;
		std::vector<std::pair<int, OpenMesh::Vec3d>>&pts = iter->second;
		for (int i = 0; i < pts.size(); i++)
		{
			fileout << tag << ": " << pts[i].first << " " << pts[i].second[0] << " " << pts[i].second[1] << " " << pts[i].second[2] << std::endl;
		}
	}
	fileout.close();
}
void CDataIO::LoadFeaturePointInfo(std::string fname, std::map<std::string, std::vector<std::pair<int,OpenMesh::Vec3d>>>&feature_points)
{
		std::ifstream filein(fname);
		std::string strline;
		std::string fstring;

		

		while (std::getline(filein, strline))
		{
			if (strline.size() > 0)
			{
				std::stringstream sstream(strline);
				std::string tag;
				sstream >> tag;
				if (tag == "crusp:"||tag=="fa:"||tag=="wala:")
				{
					int fid;
					double x, y, z;
					sstream >> fid >> x >> y >> z;
					std::string feature_name = tag.substr(0, tag.size() - 1);
					if (feature_points.find(feature_name) == feature_points.end())
					{
						feature_points[feature_name] = std::vector<std::pair<int, OpenMesh::Vec3d>>();
					}
					feature_points[feature_name].push_back(std::make_pair(fid,OpenMesh::Vec3d(x, y, z)));
				}
				

			}

		}
		filein.close();


}
bool CDataIO::WriteMesh(std::string fname, CMeshObject & res_mesh_obj)
{

	/*Eigen::MatrixXd V;
	Eigen::MatrixXi F;
	CConverter::ConvertFromOpenMeshToIGL(res_mesh_obj.GetMesh(), V, F);
	igl::writeOBJ(fname, V, F);*/

	//std::ofstream fout(fname);
	//COpenMeshT &mesh = res_mesh_obj.GetMesh();
	//for (auto viter = mesh.vertices_begin(); viter != mesh.vertices_end(); viter++)
	//{
	//	OpenMesh::Vec3d color = mesh.color(viter);
	//	fout << "v " << mesh.point(viter)[0] << " " << mesh.point(viter)[1] << " " << mesh.point(viter)[2] << " " << color[0] << " " << color[1] << " " << color[2] << std::endl;

	//}
	//for (auto fiter = mesh.faces_begin(); fiter!= mesh.faces_end(); fiter++)
	//{
	//	fout << "f ";
	//	for (auto fviter = mesh.fv_begin(fiter); fviter != mesh.fv_end(fiter); fviter++)
	//	{
	//		fout << fviter->idx()+1 << " ";
	//	}
	//	fout << std::endl;
	//}
	//fout.close();
		if (!OpenMesh::IO::write_mesh(res_mesh_obj.GetMesh(), fname/*, OpenMesh::IO::Options::VertexColor*/))
	{
		std::cerr << "write error\n";
		return false;
	}

	return true;
}


