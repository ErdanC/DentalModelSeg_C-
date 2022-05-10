#include"crown_segmentation_python.h"
#include"../DataColle/data_pool.h"
#include"../DataColle/data_io.h"
#include"../AlgColle/geo_alg.h"
#include"../AlgColle/geo_base_alg.h"
#include"../Manager/crown_seg_commands.h"
#include"../Manager/command_list.h"
#include"../DataColle/cgal_igl_converter.h"
#include "../AlgColle/dental_base_alg.h"
#include"../Manager/segmentation_functions.h"
#include<map>
CCrownSegPython::CCrownSegPython() 
{

}
bool CCrownSegPython::Init(std::string fname)
{
	std::cerr << "init" << std::endl;
	CMeshObject *meshobj = new CMeshObject();
	if (!CDataIO::ReadMesh(fname, *meshobj))
	{
		std::cerr << "unable to load mesh\n" << std::endl;
		return false;
	}

	COpenMeshT &mesh = meshobj->GetMesh();




	std::cout << "start process" << std::endl;


	if (true)
	{

	CGeoBaseAlg::RemoveNonManifold(mesh);
	if (mesh.n_vertices() > 150000)
	{
		//CGeoAlg::SimplifyMesh(mesh, 150000);
	}
	
	std::cerr << "start self intersection" << std::endl;
	CGeoAlg::SelfIntersectionRemoval(mesh);
	std::cerr << "end self intersection" << std::endl;
	CGeoBaseAlg::RemoveNonManifold(mesh);

	std::vector<COpenMeshT*>resmeshes;
	std::vector<std::map<COpenMeshT::VertexHandle, COpenMeshT::VertexHandle>>tmpmap;
	CGeoAlg::SeparateDisconnectedParts(mesh, resmeshes, tmpmap);
	int max_vnum = -1;
	int mi;
	for (int i = 0; i < resmeshes.size(); i++)
	{
		int vnum = resmeshes[i]->n_vertices();
		if (max_vnum <vnum)
		{
			max_vnum = vnum;
			mi = i;
		}
	}
	mesh = *resmeshes[mi];
	std::cerr << mesh.n_vertices() << std::endl;
	for (int i = 0; i < resmeshes.size(); i++)
	{
		delete resmeshes[i];
	}


	CGeoAlg::FillHoles(mesh, true);


	std::cerr << "num_vertexs " << mesh.n_vertices() << std::endl;
	std::cerr << "num_faces " << mesh.n_faces() << std::endl;
	
	meshobj->RestoreCurrentVPos();
	

	CDentalBaseAlg::PCABasedOrientationCorrection(meshobj->GetMesh());
	CGeoBaseAlg::NormalizeMeshSize(mesh);
	CDentalBaseAlg::ComputeTeethFeaturePointsUsingSmoothedMesh(mesh, meshobj->GetFeatureVhs(), meshobj->GetVertexTags());
	}
	else
	{
		meshobj->RestoreCurrentVPos();
	}
	
	
	
	meshobj->SetChanged();
	int id = manager_context_.GetDataPool().AddMeshObject(meshobj);
	manager_context_.GetCurrentMeshId() = id;
	manager_context_.GetCommandList().Init();

	std::cout << "Init finished" << std::endl;

	return true;
}
bool CCrownSegPython::ApplyAutoSegmentation(std::vector<int>&res_tooth_fids, std::vector<int>&res_tooth_ftags)
{
	try
	{
		int mesh_id = manager_context_.GetCurrentMeshId();
		if (mesh_id == -1)
		{
			return false;
		}

		CAutoSegmentationCommand *p_segment_command = new CAutoSegmentationCommand(mesh_id);
		if (!manager_context_.GetCommandList().ExecuteCommand(p_segment_command))
		{
			return false;
		}
		CMeshObject *p_meshobj = manager_context_.GetDataPool().GetMeshObject(mesh_id);
		std::map<int, int>ftags;
		p_segment_command->GetModifiedFtags(ftags);
		res_tooth_fids.clear();
		res_tooth_ftags.clear();
		for (auto iter = ftags.begin(); iter != ftags.end(); iter++)
		{
			if (iter->first != -1)
			{
				res_tooth_fids.push_back(iter->first);
				res_tooth_ftags.push_back(iter->second);
			}

		}
		return true;
	}
	catch(...)
	{
		return false;
	}
}
bool CCrownSegPython::ApplySegmentation(std::vector<int>& vmarks, std::vector<int>& res_updated_fids, std::vector<int>&res_updated_ftags)
{
	int mesh_id = manager_context_.GetCurrentMeshId();
	if (mesh_id == -1)
	{
		return false;
	}

	CHarmonicSegmentationCommand *p_segment_command = new CHarmonicSegmentationCommand(mesh_id, vmarks);
	if (!manager_context_.GetCommandList().ExecuteCommand(p_segment_command))
	{
		return false;
	}
	CMeshObject *p_meshobj=manager_context_.GetDataPool().GetMeshObject(mesh_id);
	std::map<int, int>ftags;
	p_segment_command->GetModifiedFtags(ftags);
	res_updated_fids.clear();
	res_updated_ftags.clear();
	for (auto iter = ftags.begin(); iter != ftags.end(); iter++)
	{
		int fid=iter->first;
		int tag = iter->second;
		res_updated_fids.push_back(fid);
		res_updated_ftags.push_back(tag);
	}
//	std::cerr << "modified fnum " << ftags.size() << std::endl;
	return true;
}
bool CCrownSegPython::GetFaceTags(std::vector<int>&res_face_tags)
{
	int mesh_id = manager_context_.GetCurrentMeshId();
	if (mesh_id == -1)
	{
		return false;
	}
	CMeshObject *p_meshobj = manager_context_.GetDataPool().GetMeshObject(mesh_id);
	if (p_meshobj == NULL)
	{
		return false;
	}
	
	std::map<int, int>&vtags = p_meshobj->GetVertexTags();
	COpenMeshT&mesh = p_meshobj->GetMesh();
	CSegmentationFunctions::GenFaceTagFromVTags(mesh, vtags,res_face_tags);

}
bool CCrownSegPython::SaveSegmentationResult(std::string fname)
{
	int mesh_id = manager_context_.GetCurrentMeshId();
	if (mesh_id == -1)
	{
		return false;
	}
	CMeshObject *p_meshobj = manager_context_.GetDataPool().GetMeshObject(mesh_id);
	CMeshObject tmp_meshobj(*p_meshobj);
	tmp_meshobj.RecoverCurrentVPos();
	std::vector<int>ftags;
	CSegmentationFunctions::GenFaceTagFromVTags(tmp_meshobj.GetMesh(),tmp_meshobj.GetVertexTags(), ftags);
	std::map<int, COpenMeshT*>sep_meshes;
	std::map<int, std::map<COpenMeshT::VertexHandle, COpenMeshT::VertexHandle>>vid_orig;
	CGeoAlg::SeparateMeshByFaceTag(tmp_meshobj.GetMesh(), ftags, sep_meshes, vid_orig);

}
bool CCrownSegPython::DetectLandmark(std::vector<double>&res_landmark_pos, std::vector<int>&res_fids)
{
	int mesh_id = manager_context_.GetCurrentMeshId();
	if (mesh_id == -1)
	{
		return false;
	}
	CMeshObject *p_meshobj = manager_context_.GetDataPool().GetMeshObject(mesh_id);

	COpenMeshT mesh;
	p_meshobj->GetRecoveredMesh(mesh);

	CDentalBaseAlg::ComputeTeethFeaturePointsUsingSmoothedMesh(mesh, p_meshobj->GetFeatureVhs(), p_meshobj->GetVertexTags());
	std::vector<COpenMeshT::VertexHandle>& fvhs=p_meshobj->GetFeatureVhs();

	std::vector<std::pair<OpenMesh::Vec3d, int>>face_features;
	std::map<int, int>&vtags = p_meshobj->GetVertexTags();
	for (int i = 0; i < fvhs.size(); i++)
	{
		auto vh = fvhs[i];
		int tag = vtags[vh.idx()];
		if (tag != -1)
		{
			bool flag = true;
			for (auto vviter = mesh.vv_begin(vh); vviter != mesh.vv_end(vh); vviter++)
			{
				int neitag = vtags[vviter->idx()];
				if (neitag != tag)
				{
					flag = false;
					break;
				}
			}
			if (flag)
			{
				face_features.push_back(std::make_pair(mesh.point(vh), mesh.vf_begin(vh)->idx()));
			}
		}
	}
	res_landmark_pos.resize(face_features.size() * 3);
	res_fids.resize(face_features.size());
	for (int i = 0; i < face_features.size(); i++)
	{
		res_fids[i] = face_features[i].second;
		res_landmark_pos[i * 3] = face_features[i].first[0];
		res_landmark_pos[i * 3 + 1] = face_features[i].first[1];
		res_landmark_pos[i * 3 + 2] = face_features[i].first[2];
		
	}
	return true;
}
bool CCrownSegPython::DelTeeth(int mark_vid, std::vector<int>&res_modified_fids)
{
	int mesh_id = manager_context_.GetCurrentMeshId();
	if (mesh_id == -1)
	{
		return false;
	}
	CDelTeethCommand *p_cmd = new CDelTeethCommand(mesh_id, mark_vid);
	if (!manager_context_.GetCommandList().ExecuteCommand(p_cmd))
	{
		return false;
	}
	p_cmd->GetDeledFtags(res_modified_fids);
	return true;
}
bool CCrownSegPython::GetCrownLocalMatrix( std::vector<double>&fa_points, std::vector<double>&long_axis, std::vector<double>&centers, std::vector<double>&res_matrix, std::vector<double>&res_inv_matrix)//res_matrix column major
{
	std::vector<OpenMesh::Vec3d> tmpfa_points, tmpmeans, tmplongaxis;
	std::vector<Eigen::MatrixXd>tmpres_matrixs;
	
	for (int i = 0; i < fa_points.size(); i += 3)
	{
	
		tmpfa_points.push_back(OpenMesh::Vec3d(fa_points[i ], fa_points[i+ 1], fa_points[i + 2]));
	}

	for (int i = 0; i < centers.size(); i += 3)
	{
	
		tmpmeans.push_back(OpenMesh::Vec3d(centers[i], centers[i + 1], centers[i  + 2]));
	}
	std::cerr << std::endl;
	std::cerr << "long_axis size " << long_axis.size() << std::endl;
	for (int i = 0; i < long_axis.size(); i += 3)
	{
	
		tmplongaxis.push_back(OpenMesh::Vec3d(long_axis[i ], long_axis[i + 1], long_axis[i  + 2]));
	}
	std::cerr << std::endl;
	std::cerr << "before ComputeCrownLocalMatrixFromFaPointAndLongAxis" << std::endl;
	CSegmentationFunctions::ComputeCrownLocalMatrixFromFaPointAndLongAxis(tmpfa_points, tmpmeans, tmplongaxis, tmpres_matrixs);
	std::cerr << "after ComputeCrownLocalMatrixFromFaPointAndLongAxis" << std::endl;
	for (int i = 0; i < tmpres_matrixs.size(); i++)
	{
		Eigen::MatrixXd mat = tmpres_matrixs[i];
		Eigen::MatrixXd invmat = mat;
		invmat = invmat.inverse();
		/*std::cerr << "inverse:" << std::endl;
		std::cerr << invmat << std::endl;*/
		for (int t = 0; t < 4; t++)
		{
			for (int k = 0; k < 4; k++)
			{
				res_inv_matrix.push_back(invmat(k, t));
			}
		}
	
		for (int t = 0; t < 4; t++)
		{
			for (int k = 0; k < 4; k++)
			{
				res_matrix.push_back(mat(k, t));
			}
		}
	}
	return true;
}
bool CCrownSegPython::GetCurrentMesh(std::vector<double>&res_vertexs, std::vector<int> &res_faces,std::vector<double>&res_updir)
{
	int mesh_id = manager_context_.GetCurrentMeshId();
	if (mesh_id == -1)
	{
		return false;
	}
	CMeshObject *p_meshobj = manager_context_.GetDataPool().GetMeshObject(mesh_id);
	//COpenMeshT&mesh = p_meshobj->GetMesh();
	COpenMeshT mesh;
	p_meshobj->GetRecoveredMesh(mesh);
	Eigen::MatrixXd eg_vertexs;
	Eigen::MatrixXi eg_faces;
	CConverter::ConvertFromOpenMeshToIGL(mesh, eg_vertexs, eg_faces);
	res_vertexs.resize(eg_vertexs.rows()*3);
	res_faces.resize(eg_faces.rows()*3);
	//std::cerr << "vertex size " << res_vertexs.size() << std::endl;
	//std::cerr << "face size " << res_faces.size() << std::endl;
	for (int i = 0; i < eg_vertexs.rows(); i++)
	{
		for (int j = 0; j < 3; j++)
		{
			res_vertexs[i * 3 + j] = eg_vertexs(i, j);
		}
	}
	for (int i = 0; i < eg_faces.rows(); i++)
	{
		for (int j = 0; j < 3; j++)
		{
			res_faces[i * 3 + j] = eg_faces(i, j);
		}
	}
	OpenMesh::Vec3d mean;
	std::vector<OpenMesh::Vec3d>frame;
	if (true)
	{
		CDentalBaseAlg::ComputePCAFrameFromHighCurvaturePoints(mesh, 10, mean, frame);
		res_updir.push_back(frame[2][0]);
		res_updir.push_back(frame[2][1]);
		res_updir.push_back(frame[2][2]);
	}
	else
	{
		res_updir.push_back(0);
		res_updir.push_back(1);
		res_updir.push_back(0);
	}

	//std::cerr << "end get mesh" << std::endl;
}