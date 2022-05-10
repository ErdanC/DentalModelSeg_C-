#include "auto_harmonic_field_segmentation_action.h"
#include "../AlgColle/geo_alg.h"
#include "ui_context.h"
#include "../DataColle/data_pool.h"
#include "cmodelviewer.h"
#include "camera.h"
#include "../AlgColle/geo_base_alg.h"
#include <qimage.h>
#include "../HarmonicSegAlg/harmonic_field.h"
#include <OpenMesh/Core/IO/MeshIO.hh>
#include <igl/writeDMAT.h>
#include "../DataColle/cgal_igl_converter.h"
#include <igl/readDMAT.h>
#include <igl/writeSTL.h>
#include <igl/writeOBJ.h>
#include <set>
#include <time.h>
#include "../AlgColle/dental_base_alg.h"
#include "../DataColle/aux_geo_utils.h"
#include "../AlgColle/curve_base_alg.h"
#include "../AlgColle/image_base_alg.h"
#include <opencv2/opencv.hpp>
#include "../AlgColle/numerical_base_alg.h"
#include "../AlgColle/morphlogic_operation.h"
#include "qfiledialog.h"
#include "../DataColle/data_io.h"
#include <sstream>
#include"../Manager/crown_seg_commands.h"
#include"../Manager/context.h"
#include"../Manager/segmentation_functions.h"
#include<igl/writeOff.h>
void CAutoHarmonicFieldSegmentation::MousePressEvent(QMouseEvent *e)
{
	if (is_eliminating_feature_)
	{
		if (e->button() == Qt::LeftButton)
		{

			CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
			if (meshobj != NULL)
			{
				auto camera = viewer_->GetCamera();
				OpenMesh::Vec3d orig, dir;
				camera.ConvertClickToLine(e->pos(), orig, dir);
				COpenMeshT::VertexHandle vh;
				std::cerr << "eliminating_feature0" << std::endl;
				if (CGeoAlg::RayMeshIntersection(orig, dir, *meshobj, vh))
				{
					std::cerr << "eliminating_feature" << std::endl;
					COpenMeshT&mesh = meshobj->GetMesh();
					OpenMesh::Vec3d pickedp = mesh.point(vh);
					double min_dis = std::numeric_limits<double>::max();
					int mi;
					for (int i = 0; i < auto_feature_pts.size(); i++)
					{
						OpenMesh::Vec3d p = mesh.point(auto_feature_pts[i]);
						double dis = (p - pickedp).length();
						if (dis < min_dis)
						{
							min_dis = dis;
							mi = i;
						}
					}


					std::vector<COpenMeshT::VertexHandle>tmp = auto_feature_pts;
					auto_feature_pts.clear();
					for (int i = 0; i < tmp.size(); i++)
					{
						if (i != mi)
						{
							auto_feature_pts.push_back(tmp[i]);
						}
					}
					meshobj->SetMeshColor(OpenMesh::Vec3d(0.8, 0.8, 0.8));
					for (int i = 0; i < auto_feature_pts.size(); i++)
					{
						mesh.set_color(auto_feature_pts[i], OpenMesh::Vec3d(1, 0, 0));
					}
					meshobj->SetAttrChanged();
				}
			}
		}
	}
	else if (is_picking_feature_)
	{
		CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
		if (meshobj != NULL)
		{
			auto camera = viewer_->GetCamera();
			OpenMesh::Vec3d orig, dir;
			camera.ConvertClickToLine(e->pos(), orig, dir);
			COpenMeshT::VertexHandle vh;
			std::cerr << "picking_feature" << std::endl;
			if (CGeoAlg::RayMeshIntersection(orig, dir, *meshobj, vh))
			{

				COpenMeshT&mesh = meshobj->GetMesh();
				OpenMesh::Vec3d pickedp = mesh.point(vh);
				double min_dis = std::numeric_limits<double>::max();
				int mi;
				bool is_found = false;
				for (int i = 0; i < auto_feature_pts.size(); i++)
				{
					if (auto_feature_pts[i].idx() == vh.idx())
					{
						is_found = true;
						break;
					}
				}


				if (is_found == false)
				{
					auto_feature_pts.push_back(vh);
				}
				meshobj->SetMeshColor(OpenMesh::Vec3d(0.8, 0.8, 0.8));
				for (int i = 0; i < auto_feature_pts.size(); i++)
				{
					mesh.set_color(auto_feature_pts[i], OpenMesh::Vec3d(1, 0, 0));
				}
				meshobj->SetAttrChanged();
			}
		}
	}

	

}
void CAutoHarmonicFieldSegmentation::RenderFeature()
{

	CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
	if (meshobj != NULL)
	{
		COpenMeshT &mesh = meshobj->GetMesh();
		for (auto viter = mesh.vertices_begin(); viter != mesh.vertices_end(); viter++)
		{
			mesh.set_color(viter, OpenMesh::Vec3d(0.8, 0.8, 0.8));
		}
		for (int i = 0; i < picked_vhs_fore_.size(); i++)
		{
			mesh.set_color(picked_vhs_fore_[i], OpenMesh::Vec3d(1, 0, 0));
			for (auto vviter = mesh.vv_begin(picked_vhs_fore_[i]); vviter != mesh.vv_end(picked_vhs_fore_[i]); vviter++)
			{
				mesh.set_color(vviter, OpenMesh::Vec3d(1, 0, 0));
			}
	
		}

		for (int i = 0; i < picked_vhs_back_.size(); i++)
		{
			mesh.set_color(picked_vhs_back_[i], OpenMesh::Vec3d(1, 1, 0));
		}
		meshobj->SetAttrChanged();
		meshobj->UseTexture() = false;
	}
}
void CAutoHarmonicFieldSegmentation::MouseMoveEvent(QMouseEvent *e)
{

	if (is_drawing_)
	{
		
		CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
		if (meshobj != NULL)
		{
			auto camera = viewer_->GetCamera();
			OpenMesh::Vec3d orig, dir;
			camera.ConvertClickToLine(e->pos(), orig, dir);

			COpenMeshT::VertexHandle vh;
			if (CGeoAlg::RayMeshIntersection(orig, dir, *meshobj, vh))
			{
				COpenMeshT &mesh = meshobj->GetMesh();
				if (is_pick_fore_)
				{
					if (picked_vhs_fore_mark_.find(vh) == picked_vhs_fore_mark_.end())
					{
						picked_vhs_fore_.push_back(vh);
						picked_vhs_fore_mark_.insert(vh);
					}
				
					
					//std::cerr << "picked fore " << vh.idx()<< std::endl;
				}	
				else
				{
					if (picked_vhs_back_mark_.find(vh) == picked_vhs_back_mark_.end())
					{
						picked_vhs_back_.push_back(vh);
						picked_vhs_back_mark_.insert(vh);
					}
					
				//	std::cerr << "picked back "<<vh.idx() << std::endl;
				}
				
				
			}

			orig = orig + dir*0.01;
		
			p_curve_obj_->GetCurve().push_back(orig);
			p_curve_obj_->SetChanged();
			//std::cerr << porig << std::endl;
		}
	}
}
void CAutoHarmonicFieldSegmentation::MouseReleaseEvent(QMouseEvent *e)
{
	if (is_drawing_&&(!is_seg_teeth_from_gingiva_))
	{
		//is_pick_fore_ = !is_pick_fore_;
	}
}
CAutoHarmonicFieldSegmentation::CAutoHarmonicFieldSegmentation()
{
	type_ = AutoHarmonicFieldSegmentation;

}
OpenMesh::Vec3d CAutoHarmonicFieldSegmentation::GetRandColor()
{

	double r = (rand() % 10000)/11000.0;
	double g = (rand() % 10000) / 11000.0;
	double b = (rand() % 10000) / 11000.0;
	OpenMesh::Vec3d color(r, g, b);
	return color;
}
void CAutoHarmonicFieldSegmentation::Init()
{
	srand((unsigned)time(NULL));
	picked_vhs_fore_.clear();
	picked_vhs_fore_mark_.clear();
	picked_vhs_back_.clear();
	picked_vhs_back_mark_.clear();

	teeth_seg_mark_.clear();
	teeth_seg_color_.clear();
	rand_color_set_.clear();
	teeth_seg_count_.clear();
	teeth_seg_mark_id_ = 0;

	dental_mesh_id_ = CUIContext::GetSelectedMeshObjectId();
	CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
	if (meshobj != NULL)
	{
		meshobj->SetMeshColor(OpenMesh::Vec3d(0.8, 0.8, 0.8));
		meshobj->SetAttrChanged();
	}
	seg_tooth_mesh_id_ = -1;
	auto_feature_pts.clear();
	auto_gvhs.clear();
	auto_tooth_vhs.clear();
}

void CAutoHarmonicFieldSegmentation::KeyPressEvent(QKeyEvent *e)
{
	switch (e->key())
	{


	case Qt::Key_Q:
	{
		std::cerr << "switch to common action" << std::endl;
		manager_->SetCurrentActionType(CActionType::Common);
		break;
	}
	
	case Qt::Key_O:
	{
		CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
		Eigen::MatrixXi faces;
		Eigen::MatrixXd vertexs;
		CMeshObject tmp_meshobj = *meshobj;
		tmp_meshobj.RecoverCurrentVPos();
		CConverter::ConvertFromOpenMeshToIGL(tmp_meshobj.GetMesh(), vertexs, faces);
		igl::writeOFF("res.off", vertexs, faces);
		std::map<int,int>vtags= tmp_meshobj.GetVertexTags();
		
		Eigen::VectorXi eg_vtags(tmp_meshobj.GetMesh().n_vertices());
		for (auto iter = vtags.begin(); iter != vtags.end(); iter++)
		{
			eg_vtags(iter->first) = iter->second;
		}
		igl::writeDMAT("res.mat", eg_vtags);
		break;
	}

	case Qt::Key_A:
	{
	
		is_picking_feature_ = true;
		break;
	}
	case  Qt::Key_C:
	{
		//Init();
		//CUIContext::manager_context_.GetDataPool().DeleteAllCurveObjects();
		std::cerr << "clear" << std::endl;
		break;
	}


	case Qt::Key_Space:
	{
		e->setAccepted(false);
		break;
	}

	case Qt::Key_U:
	{
		
		CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
		if (meshobj != NULL)
		{
			meshobj->UseTexture() = !meshobj->UseTexture();
		}
		if (meshobj->UseTexture())
		{
			std::cout << "switch to texture rendering mode" << std::endl;
		}
		meshobj->SetAttrChanged();
		break;
	}
case Qt::Key_1://detect feature
	{
		CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
		COpenMeshT&mesh = meshobj->GetMesh();
	
		//render feature points
		CDentalBaseAlg::ComputeTeethFeaturePointsUsingSmoothedMesh(mesh, meshobj->GetFeatureVhs(), std::map<int, int>(),30);
		auto_feature_pts = meshobj->GetFeatureVhs();
		for (int i = 0; i < auto_feature_pts.size(); i++)
		{
			mesh.set_color(auto_feature_pts[i], OpenMesh::Vec3d(1, 0, 0));
		}
		meshobj->SetAttrChanged();
	
		break;
	}

	case Qt::Key_Up:
	{
		gingiva_factor += 0.005;
		std::cout << "gingiva_factor " << gingiva_factor << std::endl;
		break;
	}
	case Qt::Key_Down:
	{
		gingiva_factor -= 0.005;
		std::cout << "gingiva_factor " << gingiva_factor << std::endl;
		break;
	}
	case Qt::Key_2://compute gingiva
	{
		CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
		COpenMeshT&mesh = meshobj->GetMesh();
		
		CDentalBaseAlg::ComputeGingivaVhs(mesh, auto_gvhs, gingiva_factor);
		for (int i = 0; i < auto_gvhs.size(); i++)
		{
			mesh.set_color(auto_gvhs[i], OpenMesh::Vec3d(0, 1, 1));
		}
		meshobj->SetAttrChanged();
		break;
	}
	case Qt::Key_4://seg tooth gingiva
	{
		CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
		COpenMeshT&mesh = meshobj->GetMesh();
		CHarmonicFieldSeg harmonic_field_seg;
		
		std::vector<COpenMeshT::VertexHandle>res_teeth, res_others;
		std::set<COpenMeshT::VertexHandle>res_tooth_set;
		for (int i = 0; i < auto_feature_pts.size(); i++)
		{
			if (res_tooth_set.find(auto_feature_pts[i])!= res_tooth_set.end())
			{
				continue;
			}
			int ring_num = 2;
			std::vector<COpenMeshT::VertexHandle>tmp_teeth_vhs;
			do
			{
				ring_num++;  
				CGeoAlg::ExtractNRing(mesh, auto_feature_pts[i], ring_num, tmp_teeth_vhs);
				std::cout << "ring num " << ring_num << std::endl;
				std::cout << "tmp_teeth_vhs " << tmp_teeth_vhs.size() << std::endl;

				CSegmentationFunctions::HarmonicSegmentation(*meshobj, tmp_teeth_vhs, res_teeth);
				std::cout << " res teeth size " << res_teeth.size() << " mesh size " << mesh.n_vertices() << std::endl;
				OpenMesh::Vec3d color = GetRandColor();
				if (res_teeth.size() < mesh.n_vertices() /20.0)
				{
					for (int j = 0; j < res_teeth.size(); j++)
					{
						mesh.set_color(res_teeth[j], color);
						res_tooth_set.insert(res_teeth[j]);
					}
				}
			} while (res_teeth.size() <= tmp_teeth_vhs.size()*1.8);
		}
		


		std::vector<COpenMeshT::VertexHandle>gingiva_vhs;
		for (auto viter = mesh.vertices_begin(); viter != mesh.vertices_end(); viter++)
		{
			if (res_tooth_set.find(viter) == res_tooth_set.end())
			{
				gingiva_vhs.push_back(viter);
			}
		}
		std::vector<std::vector<COpenMeshT::VertexHandle>>tmp_vhs_sep;
		CGeoAlg::SeparateVhsByConnectivity(gingiva_vhs, mesh, tmp_vhs_sep);
		int nmax = -1;
		int mi = 0;
		for (int i = 0; i < tmp_vhs_sep.size(); i++)
		{
			if (nmax < tmp_vhs_sep[i].size())
			{
				nmax = tmp_vhs_sep[i].size();
				mi = i;
			}
		}
		for (int i = 0; i < tmp_vhs_sep.size(); i++)
		{
			if (i != mi)
			{
				for (int j = 0; j < tmp_vhs_sep[i].size(); j++)
				{
					res_tooth_set.insert(tmp_vhs_sep[i][j]);
				}
			}
		}

		auto_tooth_vhs.clear();
		/*for (auto viter = res_tooth_set.begin(); viter != res_tooth_set.end(); viter++)
		{
			mesh.set_color(*viter, OpenMesh::Vec3d(1, 0, 0));
			auto_tooth_vhs.push_back(*viter);
		}*/
		meshobj->SetAttrChanged();
	
		break;
	}
	case Qt::Key_5://sep teeth
	{
		CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
		COpenMeshT&mesh = meshobj->GetMesh();
		std::map<int, COpenMeshT*>sep_meshes;
		std::map<int, std::map<COpenMeshT::VertexHandle, COpenMeshT::VertexHandle>> vid_org_map_;
		std::vector<int>tooth_seg_mark(mesh.n_vertices(), 0);
		for (int i = 0; i < auto_tooth_vhs.size(); i++)
		{
			tooth_seg_mark[auto_tooth_vhs[i].idx()] = -1;
		}
		std::map<int, std::map<COpenMeshT::VertexHandle, COpenMeshT::VertexHandle>>vid_orig_map;
		CGeoAlg::SeparateMeshByVertexTag(mesh, tooth_seg_mark, sep_meshes, vid_orig_map);
		std::map<COpenMeshT::VertexHandle, COpenMeshT::VertexHandle>all_seg_tooth_orig_vhs_map;
		CMeshObject total_tooth_meshobj;
		std::vector<OpenMesh::VertexHandle>fvhs = meshobj->GetFeatureVhs();
		std::set<COpenMeshT::VertexHandle>fvhs_set;
		for (int i = 0; i < fvhs.size(); i++)
		{
			fvhs_set.insert(fvhs[i]);
		}
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

			if (tid == -1 && has_feature_point&& iter->second->n_vertices()>60)
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

		std::map<int, int>&orig_tag = meshobj->GetVertexTags();
		for (int i = 0; i < tooth_tags.size(); i++)
		{
			COpenMeshT::VertexHandle vh = total_tooth_meshobj.GetMesh().vertex_handle(i);
			COpenMeshT::VertexHandle orig_vh = all_seg_tooth_orig_vhs_map[vh];
			orig_tag[orig_vh.idx()] = tooth_tags[i];
		}

		std::map<int, int>&vtags = meshobj->GetVertexTags();
		for (auto iter = vtags.begin(); iter != vtags.end(); iter++)
		{
			if (iter->second != -1)
			{
				if (teeth_seg_color_.find(iter->second) == teeth_seg_color_.end())
				{
					std::cerr << "rand color" << std::endl;
					teeth_seg_color_[iter->second] = GetRandColor();
				}
				COpenMeshT::VertexHandle vh = mesh.vertex_handle(iter->first);
				mesh.set_color(vh, teeth_seg_color_[iter->second]);
			}
			else
			{
				COpenMeshT::VertexHandle vh = mesh.vertex_handle(iter->first);
				mesh.set_color(vh, OpenMesh::Vec3d(0.8, 0.8, 0.8));

			}

		}
		meshobj->SetAttrChanged();
		break;
	}
	case Qt::Key_3://seg tooth gingiva
	{
		CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
		COpenMeshT&mesh = meshobj->GetMesh();

		CHarmonicFieldSeg harmonic_field_seg;


		std::set<COpenMeshT::VertexHandle>fvhs_set, gvhs_set;
		for (int i = 0; i < auto_feature_pts.size(); i++)
		{
			fvhs_set.insert(auto_feature_pts[i]);
		}

		for (int i = 0; i < auto_feature_pts.size(); i++)
		{
			std::vector<COpenMeshT::VertexHandle>neis;
			CGeoAlg::ExtractNRing(mesh, auto_feature_pts[i], 4, neis);
			for (int j = 0; j < neis.size(); j++)
			{
				fvhs_set.insert(neis[j]);
			}
		}
		auto_feature_pts.clear();
		for (auto iter = fvhs_set.begin(); iter != fvhs_set.end(); iter++)
		{
			auto_feature_pts.push_back(*iter);
		}

		std::vector<COpenMeshT::VertexHandle>res_tooth, res_gingiva;
		harmonic_field_seg.SegToothGingiva(mesh, auto_feature_pts, auto_gvhs, res_tooth, res_gingiva);

		////refine tooth gingiva seg
		int n_loop = 3;
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
			int mcount = 6;
			while (mcount--)
			{
				CMorphlogicOperation::Erode(mesh, is_tooth);

			}
			mcount = 2;
			while (mcount--)
			{
				CMorphlogicOperation::Erode(mesh, is_gingiva);
			}

			std::vector<COpenMeshT::VertexHandle>toot_handles, gingiva_handles;
			CGeoBaseAlg::GetEdgeVertexs(mesh, is_tooth, toot_handles);
			CGeoBaseAlg::GetEdgeVertexs(mesh, is_gingiva, gingiva_handles);


			harmonic_field_seg.SegToothGingiva(mesh, toot_handles, gingiva_handles, res_tooth, res_gingiva);


		}
		for (int i = 0; i < res_gingiva.size(); i++)
		{
			mesh.set_color(res_gingiva[i], OpenMesh::Vec3d(0, 1, 1));
		}
		for (int i = 0; i < res_tooth.size(); i++)
		{
			mesh.set_color(res_tooth[i], OpenMesh::Vec3d(1,0,0));
		}
		meshobj->SetAttrChanged();
		break;
	}


		case Qt::Key_L:
		{
			
			QString path = QFileDialog::getOpenFileName(NULL, "load dental mesh", ".", "Stl Files(*.stl)");

			if (path.length() == 0)
			{
				std::cerr << "unable to load mesh\n" << std::endl;
				return;
			}
			CMeshObject *meshobj = new CMeshObject();
			if (!CDataIO::ReadMesh(path.toStdString(), *meshobj))
			{
				std::cerr << "unable to load mesh\n" << std::endl;
			}
		
			COpenMeshT &mesh = meshobj->GetMesh();
	



			

			
			
			CGeoBaseAlg::RemoveNonManifold(mesh);
			CGeoAlg::SimplifyMesh(mesh, 90000);
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

			std::cerr << "start filling hole" << std::endl;
			CGeoAlg::FillHoles(mesh, true);
			

			//CGeoAlg::LaplacianSmooth(mesh, 20, 0.5);
			std::cerr << "vnum " << mesh.n_vertices() << std::endl;
			std::cerr << "fnum " << mesh.n_faces() << std::endl;
			std::cerr << "enum " << mesh.n_edges() << std::endl;
			for (auto viter = mesh.vertices_begin(); viter != mesh.vertices_end(); viter++)
			{
				mesh.set_color(viter, OpenMesh::Vec3d(0.8, 0.8, 0.8));
			}
			meshobj->RestoreCurrentVPos();
			CDentalBaseAlg::PCABasedOrientationCorrection(meshobj->GetMesh());
			//CGeoBaseAlg::NormalizeMeshSize(mesh);
			CDentalBaseAlg::ComputeTeethFeaturePointsUsingSmoothedMesh(mesh, meshobj->GetFeatureVhs(), std::map<int, int>());
			meshobj->SetChanged();
			meshobj->TextureId()=CUIContext::ColorBarTextureId();
			int id = CUIContext::manager_context_.GetDataPool().AddMeshObject(meshobj);
			CUIContext::SetSelectedMeshObjectId(id);

			dental_mesh_id_ = CUIContext::GetSelectedMeshObjectId();
			
			seg_tooth_mesh_id_ = -1;

			break;
		}

	case Qt::Key_F://compute fa points
	{
		CMeshObject *meshobj = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
		std::map<int, int>vtags= meshobj->GetVertexTags();
		CComputeFAPointCommand *p_cmd = new CComputeFAPointCommand(dental_mesh_id_, vtags);
		CUIContext::manager_context_.GetCommandList().ExecuteCommand(p_cmd);
		meshobj->SetAttrChanged();
		break;
	}
	case Qt::Key_R:
	{
		std::set<int>vid_mark_set;
		std::vector<int>vid_marks;
		vid_marks.push_back(auto_feature_pts[0].idx());
		vid_mark_set.insert(auto_feature_pts[0].idx());
		
		CHarmonicSegmentationCommand *p_cmd=new CHarmonicSegmentationCommand(dental_mesh_id_, vid_marks, -1);
		CUIContext::manager_context_.GetCommandList().ExecuteCommand(p_cmd);
		p_mesh_obj_ = CUIContext::manager_context_.GetDataPool().GetMeshObject(dental_mesh_id_);
		std::map<int, int>vtags;
		
		p_cmd->GetModifiedVtags(vtags);
		std::cerr << "modified vnum " << vtags.size() << std::endl;
		COpenMeshT&mesh = p_mesh_obj_->GetMesh();
		for (auto iter = vtags.begin(); iter != vtags.end(); iter++)
		{
			if (iter->second != -1)
			{
				if (teeth_seg_color_.find(iter->second) == teeth_seg_color_.end())
				{
					std::cerr << "rand color" << std::endl;
					teeth_seg_color_[iter->second] = GetRandColor();
				}
				COpenMeshT::VertexHandle vh = mesh.vertex_handle(iter->first);
				mesh.set_color(vh, teeth_seg_color_[iter->second]);
			}
			else
			{
				COpenMeshT::VertexHandle vh = mesh.vertex_handle(iter->first);
				mesh.set_color(vh, OpenMesh::Vec3d(0.8, 0.8, 0.8));
			
			}
			
		}
		p_mesh_obj_->TextureId() = CUIContext::ColorBarTextureId();
		if (p_mesh_obj_->TextureId() == -1)
		{
			std::cerr << "color bar texture is NULL" << std::endl;
		}
		else
		{
			p_mesh_obj_->UseTexture() = true;
		}
		p_mesh_obj_->UseTexture() = false;
		p_mesh_obj_->SetAttrChanged();
		/*p_mesh_obj_ = DataPool::GetMeshObject(dental_mesh_id_);


		
		std::map<int, int>&vtags = p_mesh_obj_->GetVertexTags();

	
		COpenMeshT &mesh = p_mesh_obj_->GetMesh();
		if (teeth_seg_mark_.size() != mesh.n_vertices())
		{
			teeth_seg_mark_.resize(mesh.n_vertices(), -1);
			teeth_seg_color_.clear();
			rand_color_set_.clear();
			teeth_seg_count_.clear();
			teeth_seg_mark_id_ = 0;
		}
		CHarmonicFieldSeg harmonicSeg;
		std::vector<COpenMeshT::VertexHandle>res_vhs0, res_vhs1;
		harmonicSeg.SegTwoTooth(mesh, picked_vhs_fore_, picked_vhs_back_, res_vhs0, res_vhs1);
		for (auto viter = mesh.vertices_begin(); viter != mesh.vertices_end(); viter++)
		{
			for (auto hiter = mesh.vih_begin(viter); hiter != mesh.vih_end(viter); hiter++)
			{
				mesh.data(hiter).SetUV(OpenMesh::Vec2f(0, 0));
			}
		}
		OpenMesh::Vec3d color0, color1;
		std::map<int, int>overlap_mark_count;
		do {
			color0 = GetRandColor();
		} while (rand_color_set_.find(color0) != rand_color_set_.end());
		rand_color_set_.insert(color0);
		teeth_seg_color_[teeth_seg_mark_id_] = color0;
		teeth_seg_count_[teeth_seg_mark_id_] = 0;
		for (int i = 0; i < res_vhs0.size(); i++)
		{
			auto vh = res_vhs0[i];
			int pre_mark = teeth_seg_mark_[vh.idx()];
			if (pre_mark != -1)
			{
				if (overlap_mark_count.find(pre_mark) == overlap_mark_count.end())
				{
					overlap_mark_count[pre_mark] = 1;
				}
				else
				{
					overlap_mark_count[pre_mark] = overlap_mark_count[pre_mark] + 1;
				}
			}
			teeth_seg_mark_[vh.idx()] = teeth_seg_mark_id_;
			vtags[vh.idx()] = teeth_seg_mark_id_;
			teeth_seg_count_[teeth_seg_mark_id_]= teeth_seg_count_[teeth_seg_mark_id_]+1;
		}

		teeth_seg_mark_id_++;
		teeth_seg_count_[teeth_seg_mark_id_] = 0;
		do {
			color1 = GetRandColor();
		} while (rand_color_set_.find(color1) != rand_color_set_.end());
		rand_color_set_.insert(color1);
		teeth_seg_color_[teeth_seg_mark_id_] = color1;
		for (int i = 0; i < res_vhs1.size(); i++)
		{
			auto vh = res_vhs1[i];
			int pre_mark = teeth_seg_mark_[vh.idx()];
			if (pre_mark != -1)
			{
				if (overlap_mark_count.find(pre_mark) == overlap_mark_count.end())
				{
					overlap_mark_count[pre_mark] = 1;
				}
				else
				{
					overlap_mark_count[pre_mark]= overlap_mark_count[pre_mark]+1;
				}
			}
			teeth_seg_mark_[vh.idx()] = teeth_seg_mark_id_;
			vtags[vh.idx()] = teeth_seg_mark_id_;
			teeth_seg_count_[teeth_seg_mark_id_] = teeth_seg_count_[teeth_seg_mark_id_] + 1;
		}
		teeth_seg_mark_id_++;
	
		for (auto viter = mesh.vertices_begin(); viter != mesh.vertices_end(); viter++)
		{
			int seg_id = teeth_seg_mark_[viter->idx()];
			if (overlap_mark_count.find(seg_id)!=overlap_mark_count.end())
			{
			
				if (overlap_mark_count[seg_id]*1.0 / teeth_seg_count_[seg_id] > 0.5)
				{
					teeth_seg_count_[seg_id] = 0;
					seg_id = -1;
					teeth_seg_mark_[viter->idx()] = -1;
					vtags[viter->idx()] = -1;
				}
			
			}
			OpenMesh::Vec3d color(1,1,1);
			if(seg_id !=-1)
				color = teeth_seg_color_[seg_id];
			mesh.set_color(viter, color);
		}
		
		
		p_mesh_obj_->UseTexture() = false;
		p_mesh_obj_->SetAttrChanged();*/
		break;
	}

	case Qt::Key_N:
	{
		is_eliminating_feature_ = true;
		break;
	}


	}
}

void CAutoHarmonicFieldSegmentation::KeyReleaseEvent(QKeyEvent *e)
{
	switch (e->key())
	{

	
		case Qt::Key_N:
		{
			is_eliminating_feature_ = false;
			break;
		}
		case Qt::Key_A:
		{
			is_picking_feature_ = false;
			break;
		}
	}

}

