#include"segmentation_functions.h"
#include"../HarmonicSegAlg/harmonic_field.h"
#include"../AlgColle/dental_base_alg.h"
#include"../AlgColle/morphlogic_operation.h"
void CSegmentationFunctions::HarmonicSegmentation(CMeshObject&mesh_obj, int new_tag,std::vector<int>&vmarks, std::map<int, int>&vtag_modified)
{
	
	std::map<int, int>&vtags = mesh_obj.GetVertexTags();
	COpenMeshT&mesh = mesh_obj.GetMesh();
	vtag_modified.clear();
	std::map<int, int>tag_counts;
	for (int i = 0; i < vmarks.size(); i++)
	{
		int tag = vtags[vmarks[i]];
		if (tag != -1)
		{
			//std::cerr << "tag " << tag << std::endl;
			if (tag_counts.find(tag) == tag_counts.end())
			{
				tag_counts[tag] = 0;
			}
			else
			{
				tag_counts[tag]++;
			}
		}
		
	}
	int vmark_num = vmarks.size();
	std::set<int>del_tags;
	for (auto iter = tag_counts.begin(); iter != tag_counts.end(); iter++)
	{
		//std::cerr << iter->first<<" tag counts " << iter->second << std::endl;
		if (iter->second > vmark_num*0.1)
		{
			del_tags.insert(iter->first);
		}
	}
	if (new_tag != -1)
	{
		del_tags.insert(new_tag);
	}
	//std::cerr << "del tag size " << del_tags.size() << std::endl;
	int pre_tag = -1;
	std::vector<COpenMeshT::VertexHandle>vhs_mark_pre, vhs_mark;
	std::vector<COpenMeshT::VertexHandle>res_vhs_pre, res_vhs;
	int max_vtag = -1;
	for (auto iter = vtags.begin(); iter != vtags.end(); iter++)
	{
		if (iter->second != -1)
		{
			if (del_tags.find(iter->second) != del_tags.end())
			{
				iter->second = -1;
				vtag_modified[iter->first] = iter->second;
			}
			else
			{
				if (max_vtag < iter->second)
				{
					max_vtag = iter->second;
				}
				if (pre_tag == -1)
				{
					pre_tag = iter->second;
				}
				if (pre_tag != -1&&pre_tag==iter->second)
				{
					COpenMeshT::VertexHandle vh = mesh.vertex_handle(iter->first);
					vhs_mark_pre.push_back(vh);
				}
			}
		}
	}
	if (vhs_mark_pre.size() == 0)
	{
		std::vector<OpenMesh::VertexHandle>&fvhs= mesh_obj.GetFeatureVhs();
	
		double max_sum_len = std::numeric_limits<double>::min();
		int mi = -1;
		for (int i = 0; i < fvhs.size(); i++)
		{
			OpenMesh::Vec3d feature_p = mesh.point(fvhs[i]);
			double sum_len = 0;
			for (int j = 0; j < vmarks.size(); j++)
			{
				OpenMesh::Vec3d p = mesh.point(mesh.vertex_handle(vmarks[j]));
				OpenMesh::Vec3d diff = feature_p - p;
				double len=diff.length();
				sum_len += len;
			
			}
			if (max_sum_len < sum_len)
			{
				max_sum_len = sum_len;
				mi = i;
			}
		}
		if (mi != -1)
		{
			
			std::vector<COpenMeshT::VertexHandle>src_vhs,nei_vhs;
			src_vhs.push_back(fvhs[mi]);
			CGeoBaseAlg::GetNeighborVhs(mesh, src_vhs, 4, nei_vhs);
			for (int i = 0; i < nei_vhs.size(); i++)
			{
				vhs_mark_pre.push_back(nei_vhs[i]);
			}
		}
		
	}
	if (vhs_mark_pre.size() !=0)
	{
		if (new_tag == -1)
		{
			new_tag = max_vtag + 1;
		}
		vhs_mark.reserve(vmarks.size());
		for (int i = 0; i < vmarks.size(); i++)
		{
			COpenMeshT::VertexHandle vh = mesh.vertex_handle(vmarks[i]);
			vhs_mark.push_back(vh);
		}
		CHarmonicFieldSeg harmonicSeg;
		harmonicSeg.SegTwoTooth(mesh_obj.GetMesh(), vhs_mark_pre, vhs_mark, res_vhs_pre, res_vhs);


		for (int i = 0; i < res_vhs.size(); i++)
		{
			int vid = res_vhs[i].idx();
			vtags[vid] = new_tag;
			vtag_modified[vid] = new_tag;
		}

	}
	else
	{
		std::vector<OpenMesh::VertexHandle>featurevhs;
		CDentalBaseAlg::ComputeTeethFeaturePointsUsingSmoothedMesh(mesh, featurevhs, vtags);
		if (new_tag == -1)
		{
			new_tag = 0;
		}
		for (int i = 0; i < vmarks.size(); i++)
		{
			vtags[vmarks[i]] = new_tag;
			vtag_modified[vmarks[i]] = new_tag;
		}
	}
	
}
void CSegmentationFunctions::HarmonicSegmentation(CMeshObject&mesh_obj, std::vector<COpenMeshT::VertexHandle>&vhs, std::vector<COpenMeshT::VertexHandle>&res_tooth_vhs)
{

	std::map<int, int>&vtags = mesh_obj.GetVertexTags();
	COpenMeshT&mesh = mesh_obj.GetMesh();

	std::vector<OpenMesh::VertexHandle>&fvhs = mesh_obj.GetFeatureVhs();
	double max_sum_len = std::numeric_limits<double>::min();
	int mi = -1;
	for (int i = 0; i < fvhs.size(); i++)
	{
		OpenMesh::Vec3d feature_p = mesh.point(fvhs[i]);
		double sum_len = 0;
		for (int j = 0; j < vhs.size(); j++)
		{
			OpenMesh::Vec3d p = mesh.point(vhs[j]);
			OpenMesh::Vec3d diff = feature_p - p;
			double len = diff.length();
			sum_len += len;

		}
		if (max_sum_len < sum_len)
		{
			max_sum_len = sum_len;
			mi = i;
		}
	}
	std::vector<COpenMeshT::VertexHandle>vhs_mark_pre;
	if (mi != -1)
	{

		std::vector<COpenMeshT::VertexHandle> nei_vhs;
	
		CGeoAlg::ExtractNRing(mesh, fvhs[mi], 4, nei_vhs);
		for (int i = 0; i < nei_vhs.size(); i++)
		{
			vhs_mark_pre.push_back(nei_vhs[i]);
		}
	}
		
	res_tooth_vhs.clear();
	
	if (vhs_mark_pre.size() != 0)
	{
		
		CHarmonicFieldSeg harmonicSeg;
		harmonicSeg.SegTwoTooth(mesh, vhs_mark_pre, vhs, std::vector<COpenMeshT::VertexHandle>(), res_tooth_vhs);


	}
	
}
void CSegmentationFunctions::ComputeCrownLocalMatrixFromFaPointAndLongAxis(std::vector<OpenMesh::Vec3d>& fa_points, std::vector<OpenMesh::Vec3d>& means, std::vector<OpenMesh::Vec3d>& longaxis, std::vector<Eigen::MatrixXd>&res_matrixs)
{
	res_matrixs.resize(fa_points.size());
	for (int i = 0; i < res_matrixs.size(); i++)
	{
		res_matrixs[i]=CDentalBaseAlg::ComputeTeethLocalCoordinateFromFaPointAndLongAxis(fa_points[i], means[i], longaxis[i]);
	
		
		
	}
	 
}

void CSegmentationFunctions::ComputeFAPoints(CMeshObject &mesh_obj, std::map<int, int>&vtags, std::vector<std::pair<int, OpenMesh::Vec3d>>&res_fapoints)
{
	COpenMeshT &mesh = mesh_obj.GetMesh();
	std::vector<int>vec_vtags;//set noisy vertexs to -2
	vec_vtags.resize(mesh.n_vertices());
	for (auto iter = vtags.begin(); iter != vtags.end(); iter++)
	{
		vec_vtags[iter->first] = iter->second;
	}
	////detect noisy vertex from gingiva, which has more than 1 neighbor crowns,set tag to -2
	for (auto iter = vtags.begin(); iter != vtags.end(); iter++)
	{
		if (iter->second == -1)//base mesh
		{
			COpenMeshT::VertexHandle vh = mesh.vertex_handle(iter->first);
			std::vector<COpenMeshT::VertexHandle>nei_vhs;
			CGeoBaseAlg::GetNeighborVhs(mesh,vh, 3, nei_vhs);
			std::set<int>nei_crownid_set;
			for (int i = 0; i < nei_vhs.size(); i++)
			{
				if (vec_vtags[nei_vhs[i].idx()]> -1)
				{
					nei_crownid_set.insert(vec_vtags[nei_vhs[i].idx()]);
					if (nei_crownid_set.size() > 1)
					{
						break;
					}
				}
			}
			if (nei_crownid_set.size() > 1)// more than 1 crown neighbors , set noisy vertexs to -2
			{
				vec_vtags[vh.idx()] = -2;//noisy vertex tag
				//mesh.set_color(vh, COpenMeshT::Color(1, 1,1));
			}
		}
	}
	std::vector<bool>is_crown_face(mesh.n_faces(), false);
	for (auto fiter = mesh.faces_begin(); fiter != mesh.faces_end(); fiter++)
	{
		COpenMeshT::FaceHandle fh = mesh.face_handle(fiter->idx());
		int count = 0;
		for (auto fviter = mesh.fv_begin(fh); fviter != mesh.fv_end(fh); fviter++)
		{
			COpenMeshT::VertexHandle vh = mesh.vertex_handle(fviter->idx());
			if (vec_vtags[vh.idx()] >= 0)
			{
				count++;
			}
		}
		if (count == 3)
		{
			is_crown_face[fh.idx()] = true;
		}
	}
	///////////////// computer crown gingiva lines
	std::vector<bool>is_crown_gingiva_bandary;
	is_crown_gingiva_bandary.resize(mesh.n_vertices(), false);
	for (auto viter = mesh.vertices_begin(); viter != mesh.vertices_end(); viter++)
	{
		//std::cout << "vtag " << vec_vtags[viter->idx()] << std::endl;
		if (vec_vtags[viter->idx()] >= 0)
		{
			int vid = viter->idx();
		
			COpenMeshT::VertexHandle vh = mesh.vertex_handle(vid);
			for (auto vviter = mesh.vv_begin(vh); vviter != mesh.vv_end(vh); vviter++)
			{
				int neivid = vviter->idx();
				if (vec_vtags[neivid] == -1)//nei gingiva
				{
					is_crown_gingiva_bandary[vid] = true;
					//mesh.set_color(mesh.vertex_handle(vid), COpenMeshT::Color(0, 0, 0));
				}
			}
		}
	}
	///////
	std::cout << "compute crown_gingiva_lines" << std::endl;
	std::map<int, std::vector<std::vector<int>>>crown_gingiva_lines;
	std::vector<bool>c_g_line_mark;
	c_g_line_mark.resize(mesh.n_vertices(),false);
	for (int vid = 0; vid < mesh.n_vertices(); vid++)
	{
		bool flag = false;
		if (is_crown_gingiva_bandary[vid] && c_g_line_mark[vid] == false)
		{ 
			//std::cout << "find cg vertex "<<vid << std::endl;
			std::vector<int>new_cg_line0, new_cg_line1;
			new_cg_line0.push_back(vid);
			c_g_line_mark[vid] = true;
			int pvid = vid;
			do {
				flag = false;
				COpenMeshT::VertexHandle pvh = mesh.vertex_handle(pvid);
				for (auto vviter = mesh.vv_begin(pvh); vviter != mesh.vv_end(pvh); vviter++)
				{
					//std::cout << "vviter idx " << vviter->idx() << std::endl;
					COpenMeshT::VertexHandle neivh = mesh.vertex_handle(vviter->idx());
				
					if (is_crown_gingiva_bandary[neivh.idx()] && c_g_line_mark[neivh.idx()] == false && vec_vtags[vid] == vec_vtags[neivh.idx()])
					{
						std::vector<COpenMeshT::FaceHandle>nei_fhs;
						CGeoBaseAlg::GetFaceByTwoVertexs(mesh, pvh, neivh, nei_fhs);
						if (is_crown_face[nei_fhs[0].idx()] && is_crown_face[nei_fhs[1].idx()])
						{
							continue;
						}
						c_g_line_mark[neivh.idx()] = true;
						new_cg_line0.push_back(neivh.idx());
						pvid = neivh.idx();
						flag = true;
						break;
					}
				}
			} while (flag);
			if (crown_gingiva_lines.find(vec_vtags[vid]) == crown_gingiva_lines.end())
			{
				crown_gingiva_lines[vec_vtags[vid]] = std::vector<std::vector<int>>();
			}


			pvid = vid;
			do {
				flag = false;
				COpenMeshT::VertexHandle pvh = mesh.vertex_handle(pvid);
				for (auto vviter = mesh.vv_begin(pvh); vviter != mesh.vv_end(pvh); vviter++)
				{
					//std::cout << "vviter idx " << vviter->idx() << std::endl;
					COpenMeshT::VertexHandle neivh = mesh.vertex_handle(vviter->idx());
					if (is_crown_gingiva_bandary[neivh.idx()] && c_g_line_mark[neivh.idx()] == false&& vec_vtags[vid]== vec_vtags[neivh.idx()])
					{
						std::vector<COpenMeshT::FaceHandle>nei_fhs;
						CGeoBaseAlg::GetFaceByTwoVertexs(mesh, pvh, neivh, nei_fhs);
						if (is_crown_face[nei_fhs[0].idx()] && is_crown_face[nei_fhs[1].idx()])
						{
							continue;
						}
						c_g_line_mark[neivh.idx()] = true;
						new_cg_line1.push_back(neivh.idx());
						pvid = neivh.idx();
						flag = true;
						break;
					}
				}
			} while (flag);
			std::reverse(new_cg_line0.begin(), new_cg_line0.end());
			new_cg_line0.insert(new_cg_line0.end(), new_cg_line1.begin(), new_cg_line1.end());
			crown_gingiva_lines[vec_vtags[vid]].push_back(new_cg_line0);
		}
	}	


			//////merge tmp lines
	//std::cout << "merge crown_gingiba_lines" << std::endl;
	//for (auto iter = crown_gingiva_lines.begin(); iter != crown_gingiva_lines.end(); iter++)
	//{
	//	std::vector<std::vector<int>>tmplines = iter->second;
	//	std::vector<bool>tmp_line_marks;
	//	tmp_line_marks.resize(tmplines.size(), true);
	//	std::vector<std::vector<int>>res_lines;
	//	int crwon_id = iter->first;
	//	for (int i = 0; i < tmplines.size(); i++)
	//	{
	//		//std::cout << "i " << i << std::endl;
	//		if (tmp_line_marks[i])
	//		{
	//			for (int j = 0; j < tmplines.size(); j++)
	//			{
	//				//std::cout << "j " << j << std::endl;
	//				if (i!=j&&tmp_line_marks[j])
	//				{
	//					int ibegin = tmplines[i][0];
	//					int jbegin = tmplines[j][0];
	//					int iend = tmplines[i].back();
	//					int jend = tmplines[j].back();
	//					bool need_merge = false;
	//					if (CGeoBaseAlg::IsNeighbor(mesh,ibegin, jbegin))
	//					{
	//						std::reverse(tmplines[i].begin(), tmplines[i].end());
	//						need_merge = true;
	//					}
	//					else if (CGeoBaseAlg::IsNeighbor(mesh, ibegin, jend))
	//					{
	//						std::reverse(tmplines[i].begin(), tmplines[i].end());
	//						std::reverse(tmplines[j].begin(), tmplines[j].end());
	//						need_merge = true;
	//					}
	//					else if (CGeoBaseAlg::IsNeighbor(mesh, iend , jend))
	//					{
	//						std::reverse(tmplines[j].begin(), tmplines[j].end());
	//						need_merge = true;
	//					
	//					}

	//					if (need_merge)
	//					{
	//						std::cout << "need merge " << std::endl;
	//						for (int jid = 0; jid < tmplines[j].size(); jid++)
	//						{
	//							tmplines[i].push_back(tmplines[j][jid]);
	//						}
	//						////j is merged to i
	//						tmp_line_marks[j] = false;
	//						j = 0;
	//					}
	//				
	//				}
	//			}
	//		}	
	//	}
	//	std::vector<std::vector<int>>lines;
	//	for (int i = 0; i < tmplines.size(); i++)
	//	{
	//		if (tmp_line_marks[i])
	//		{
	//			lines.push_back(tmplines[i]);
	//		}
	//	}
	//	iter->second = lines;
	//}


	//std::cout << "merge crown_gingiba_lines finished" << std::endl;
	///////////////////////////////////////get max two cg lines;
	for (auto iter = crown_gingiva_lines.begin(); iter != crown_gingiva_lines.end(); iter++)
	{
		int crown_id = iter->first;
		std::vector<std::vector<int>>&c_g_lines = iter->second;
		if (c_g_lines.size() == 0)
		{
			continue;
		}
		else if (c_g_lines.size() == 1)
		{
			int vid=c_g_lines[0][0];
			COpenMeshT::VertexHandle vh = mesh.vertex_handle(vid);
			OpenMesh::Vec3d p = mesh.point(vh);
			double max_dis = -1;
			int mi = 1;
			for (int i = 1; i < c_g_lines[0].size(); i++)
			{
				int nvid = c_g_lines[0][i];
				COpenMeshT::VertexHandle nvh = mesh.vertex_handle(nvid);
				OpenMesh::Vec3d np= mesh.point(nvh);
				double dis = std::sqrt((np[0] - p[0])*(np[0] - p[0]) + (np[1] - p[1])*(np[1] - p[1]) + (np[2] - p[2])*(np[2] - p[2]));
				if (dis > max_dis)
				{
					max_dis = dis;
					mi = i;
				}
			}
			c_g_lines.push_back(std::vector<int>());
			for (int i = mi; i < c_g_lines[0].size(); i++)
			{
				c_g_lines[1].push_back(c_g_lines[0][i]);
			}
			while (c_g_lines[0].size() > mi)
			{
				c_g_lines[0].pop_back();
			}
			
		}
		else if(c_g_lines.size()>2)
		{
			int max_num=-1, max_num2 = -1;
			int mi = 0, mi2 = 0;
			for (int i = 0; i < c_g_lines.size(); i++)
			{
				if (c_g_lines[i].size() > max_num)
				{
					max_num2 = max_num;
					mi2 = mi;
					max_num = c_g_lines[i].size();
					mi = i;
				}
				else if(c_g_lines[i].size() > max_num2)
				{
					mi2 = i;
					max_num2 = c_g_lines[i].size();
				}
			}
			std::vector<int> tmp_line = c_g_lines[mi];
			std::vector<int> tmp_line1 = c_g_lines[mi2];
		/*	c_g_lines.clear();
			c_g_lines.push_back(tmp_line);
			c_g_lines.push_back(tmp_line1);*/

		}
	}
	/////render crown gingiva lines points
	std::cout << "crown_gingiva_lines size " << crown_gingiva_lines.size() << std::endl;
	srand((unsigned)time(NULL));
	for (auto viter = mesh.vertices_begin(); viter != mesh.vertices_end(); viter++)
	{
		mesh.set_color(viter, COpenMeshT::Color(0.8, 0.8, 0.8));
	}
	for (auto iter = crown_gingiva_lines.begin(); iter != crown_gingiva_lines.end(); iter++)
	{
		int crown_id = iter->first;
		std::vector<std::vector<int>>&c_g_lines = iter->second;
		std::cout << "cg line size " << crown_id << " " << c_g_lines.size() << std::endl;
		for (int i = 0; i < c_g_lines.size(); i++)
		{
			std::cerr<<c_g_lines[i].size() << std::endl;
			COpenMeshT::Color color = GetRandColor();
			for (int j = 0; j < c_g_lines[i].size(); j++)
			{
				int vid = c_g_lines[i][j];
				COpenMeshT::VertexHandle vh = mesh.vertex_handle(vid);
				mesh.set_color(vh, color);
			}
		}
	}


	////////////find mid points



}
OpenMesh::Vec3d CSegmentationFunctions::GetRandColor()
{

	double r = (rand() % 10000) / 11000.0;
	double g = (rand() % 10000) / 11000.0;
	double b = (rand() % 10000) / 11000.0;
	OpenMesh::Vec3d color(r, g, b);
	return color;
}
void CSegmentationFunctions::GenFaceTagFromVTags(COpenMeshT&mesh, std::map<int, int>&vtags, std::vector<int>&res_ftags)
{
	res_ftags.resize(mesh.n_faces());
	std::vector<int>vec_vtags(mesh.n_vertices());
	for (auto iter = vtags.begin(); iter != vtags.end(); iter++)
	{
		vec_vtags[iter->first] = iter->second;
	}
	for (auto fiter = mesh.faces_begin(); fiter != mesh.faces_end(); fiter++)
	{
		std::vector<int>ftags;
		for (auto fviter = mesh.fv_begin(fiter); fviter != mesh.fv_end(fiter); fviter++)
		{
			ftags.push_back(vec_vtags[fviter->idx()]);
		}
		if (ftags[0] == ftags[1] && ftags[1] == ftags[2])
		{
			res_ftags[fiter->idx()] = ftags[0];
		}
		else
		{
			res_ftags[fiter->idx()] = -1;
		}
	}
}
void CSegmentationFunctions::AutoSegmentation(CMeshObject &meshobj, std::vector<int>&res_vmarks)
{
	
	COpenMeshT&mesh = meshobj.GetMesh();
	res_vmarks.resize(mesh.n_vertices(), -1);
	std::vector<OpenMesh::VertexHandle>fvhs= meshobj.GetFeatureVhs();


		std::vector<OpenMesh::VertexHandle> gvhs;
		CDentalBaseAlg::ComputeGingivaVhs(mesh, gvhs);
		CHarmonicFieldSeg harmonic_field_seg;
	
		
		std::set<COpenMeshT::VertexHandle>fvhs_set, gvhs_set;
		for (int i = 0; i < fvhs.size(); i++)
		{
			fvhs_set.insert(fvhs[i]);
		}
		
		for (int i = 0; i < fvhs.size(); i++)
		{
			std::vector<COpenMeshT::VertexHandle>neis;
			CGeoAlg::ExtractNRing(mesh, fvhs[i], 2, neis);
			for (int j = 0; j < neis.size(); j++)
			{
				fvhs_set.insert(neis[j]);
			}
		}
		fvhs.clear();
		for (auto iter = fvhs_set.begin(); iter != fvhs_set.end(); iter++)
		{
			fvhs.push_back(*iter);
		}
		
		std::vector<COpenMeshT::VertexHandle>res_tooth, res_gingiva;
		harmonic_field_seg.SegToothGingiva(mesh, fvhs, gvhs, res_tooth, res_gingiva);

		////refine tooth gingiva seg
		int n_loop = 4;
		while (n_loop--)
		{
			std::vector<bool>is_tooth, is_gingiva;
			is_tooth.resize(mesh.n_vertices(), false);
			is_gingiva.resize(mesh.n_vertices(), false);
			for (int i = 0; i < res_tooth.size(); i++)
			{
				is_tooth[res_tooth[i].idx()] = true;
			}
			for (int i = 0; i < res_gingiva.size(); i++)
			{
				is_gingiva[res_gingiva[i].idx()] = true;
			}
			int mcount = 9;
			while (mcount--)
			{
				CMorphlogicOperation::Erode(mesh, is_tooth);

			}
			mcount = 0;
			while (mcount--)
			{
				CMorphlogicOperation::Erode(mesh, is_gingiva);
			}

			std::vector<COpenMeshT::VertexHandle>toot_handles, gingiva_handles;
			CGeoBaseAlg::GetEdgeVertexs(mesh, is_tooth, toot_handles);
			CGeoBaseAlg::GetEdgeVertexs(mesh, is_gingiva, gingiva_handles);


			harmonic_field_seg.SegToothGingiva(mesh, toot_handles, gingiva_handles, res_tooth, res_gingiva);


		}
		////////////////////////////////////////
		//std::cerr << "seg tooth gingiva finished" << std::endl;
		///*for (int i = 0; i < res_gingiva.size(); i++)
		//{
		//	mesh.set_color(res_gingiva[i], COpenMeshT::Color(0, 1, 1));
		//}*/
		//for (int i = 0; i < res_tooth.size(); i++)
		//{
		//	mesh.set_color(res_tooth[i], COpenMeshT::Color(1, 0, 0));
		//}
		//std::cerr << "res tooth vnum " << res_tooth.size() << std::endl;
		//for (int i = 0; i < fvhs.size(); i++)
		//{
		//	mesh.set_color(fvhs[i], COpenMeshT::Color(1, 0, 0));
		//}
		///*for (int i = 0; i < gvhs.size(); i++)
		//{
		//	mesh.set_color(gvhs[i], COpenMeshT::Color(0, 1, 0));
		//}*/
		////meshobj.SetAttrChanged();
		//return;
		/////////////////////////separate mesh///////////////////////////////////////

		std::map<int, COpenMeshT*>sep_meshes;
		std::map<int, std::map<COpenMeshT::VertexHandle, COpenMeshT::VertexHandle>> vid_org_map_;
		std::vector<int>gingiva_seg_mark(mesh.n_vertices(), -1);
		for (int i = 0; i < res_gingiva.size(); i++)
		{
			gingiva_seg_mark[res_gingiva[i].idx()] = 0;
		}
		std::map<int, std::map<COpenMeshT::VertexHandle, COpenMeshT::VertexHandle>>vid_orig_map;
		CGeoAlg::SeparateMeshByVertexTag(mesh, gingiva_seg_mark, sep_meshes, vid_orig_map);
		std::map<COpenMeshT::VertexHandle, COpenMeshT::VertexHandle>all_seg_tooth_orig_vhs_map;
		CMeshObject total_tooth_meshobj;
		for (auto iter = sep_meshes.begin(); iter != sep_meshes.end(); iter++)
		{
			int tid = iter->first;
			bool has_feature_point = false;
			if (tid == -1)
			{
				for (auto viter = iter->second->vertices_begin(); viter != iter->second->vertices_end(); viter++)
				{
					if (fvhs_set.find(viter) != fvhs_set.end())
					{
						has_feature_point = true;
						break;
					}
				}
			}
			
			if (tid == -1&& has_feature_point&& iter->second->n_vertices()>60)
			{

				total_tooth_meshobj.SetMesh(*iter->second);

				for (auto viter = vid_orig_map[-1].begin(); viter != vid_orig_map[-1].end(); viter++)
				{
					all_seg_tooth_orig_vhs_map[total_tooth_meshobj.GetMesh().vertex_handle(viter->first.idx())] = viter->second;
				}
				break;
			}
			delete sep_meshes[tid];

		}
		///////////////////////////////////////////////////////

		///////////////////////////tag tooth
		std::vector<std::vector<COpenMeshT::VertexHandle>>inside_vhs, outside_vhs;
		CDentalBaseAlg::ComputeBoundCuttingPointsOfToothMesh(total_tooth_meshobj, inside_vhs, outside_vhs);


		CDentalBaseAlg::MergeCuttingPointsByDis(total_tooth_meshobj.GetMesh(), inside_vhs, outside_vhs, 0.02);
		std::vector<CDentalBaseAlg::CCuttingPath>cutting_paths;
		CDentalBaseAlg::ComputeCuttingPath(total_tooth_meshobj, inside_vhs, outside_vhs, cutting_paths);
		/*for (int i = 0; i < cutting_paths.size(); i++)
		{
			CCurveObject *ccobj = new CCurveObject();
			cutting_paths[i].GetPathPoints(ccobj->GetCurve());
			ccobj->SetChanged();
			ccobj->SetColor(OpenMesh::Vec3d(1, 0, 0));
			CUIContext::manager_context_.GetDataPool().AddCurveObject(ccobj);
		}*/
		std::vector<int>tooth_tags;

		int tagnum = CDentalBaseAlg::TagToothByCuttingPath(total_tooth_meshobj.GetMesh(), cutting_paths, tooth_tags);

		std::map<int, int>&orig_tag = meshobj.GetVertexTags();
		for (int i = 0; i < tooth_tags.size(); i++)
		{
			COpenMeshT::VertexHandle vh = total_tooth_meshobj.GetMesh().vertex_handle(i);
			COpenMeshT::VertexHandle orig_vh = all_seg_tooth_orig_vhs_map[vh];
			orig_tag[orig_vh.idx()] = tooth_tags[i];
		}
		
		for (auto iter = orig_tag.begin(); iter != orig_tag.end(); iter++)
		{
			res_vmarks[iter->first] = iter->second;
		}

}