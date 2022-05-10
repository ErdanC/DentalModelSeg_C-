#include "cpqp_obb_wrapper.h"
#include <Eigen/Dense>
#include <algorithm>
#include<set>
CPqpObb::CPqpObb(Eigen::MatrixXd& V, Eigen::MatrixXi& F)
	: V_(V),F_(F)
{
	m_pqp_model.BeginModel();
	int fcount = 0;
	PQP_REAL ps[3][3];
	for (int i = 0; i < F.rows(); i++)
	{
		for (int j = 0; j <F.cols(); j++)
		{
			for (int k = 0; k < 3; k++)
			{
				ps[j][k] = V(F(i, j),k);
			}
		
		}
		m_pqp_model.AddTri(ps[0], ps[1], ps[2], fcount);
		fcount++;
	}
	

	
	
	m_pqp_model.EndModel();
}
Eigen::Vector3d CPqpObb::ComputeFaceNormal(Eigen::MatrixXd&vertexs, Eigen::MatrixXi &faces, int fid)
{
	Eigen::Vector3d pa = Eigen::Vector3d(vertexs(faces(fid, 0), 0), vertexs(faces(fid, 0), 1), vertexs(faces(fid, 0), 2));
	Eigen::Vector3d pb = Eigen::Vector3d(vertexs(faces(fid, 1), 0), vertexs(faces(fid, 1), 1), vertexs(faces(fid, 1), 2));
	Eigen::Vector3d pc = Eigen::Vector3d(vertexs(faces(fid, 2), 0), vertexs(faces(fid, 2), 1), vertexs(faces(fid, 2), 2));
	Eigen::Vector3d vab = pb - pa;
	Eigen::Vector3d vac = pc - pa;
	Eigen::Vector3d normal = vab.cross(vac);
	normal.normalize();
	return normal;
}
CPqpObb::QueryResult CPqpObb::QueryClosestPoint(const Eigen::Vector3d& pt)
{
	PQP_DistanceResult dres;	
	dres.last_tri = m_pqp_model.last_tri;
	PQP_REAL p[3];
	p[0] = pt.x();	p[1] = pt.y();	p[2] = pt.z();
	PQP_Distance(&dres, &m_pqp_model,p,0.0,0.0,1); //PQP_Distance(PQP_DistanceResult *res, PQP_Model *o, PQP_REAL p[3], PQP_REAL rel_err, PQP_REAL abs_err, int qsize)
	CPqpObb::QueryResult qresult;
	qresult.closest_pnt_ = Eigen::Vector3d(dres.p1[0], dres.p1[1], dres.p1[2]);

	qresult.fid_ = dres.last_tri->id;
	qresult.distance = dres.distance;
	return qresult;
}

std::pair<Eigen::Vector3d, double> GetIntersectionPoint(const Eigen::Vector3d& pt1, const Eigen::Vector3d& pt2, const Eigen::Vector3d& pt3,
	const Eigen::Vector3d& pt, const Eigen::Vector3d& dir)
{
	Eigen::MatrixXd M(4, 4);
	M << pt1.x(), pt2.x(), pt3.x(), -dir.x(),
		pt1.y(), pt2.y(), pt3.y(), -dir.y(),
		pt1.z(), pt2.z(), pt3.z(), -dir.z(),
		1, 1, 1, 0;
	Eigen::VectorXd right(4);
	right << pt.x(), pt.y(), pt.z(), 1;
	Eigen::VectorXd res = M.inverse() * right;
	double t = res(3);
	return std::make_pair(pt + t * dir, t);
}
bool CPqpObb::DetectSelfIntersection(std::vector<SelfIntersectionResult>&res_self_intersect)
{
	res_self_intersect.clear();
	PQP_CollideResult result;
	PQP_REAL R1[3][3] = { 1, 0, 0, 0, 1, 0, 0, 0, 1 };
	PQP_REAL T1[3] = { 0, 0, 0 };
	PQP_REAL R2[3][3] = { 1, 0, 0, 0, 1, 0, 0, 0, 1 };
	PQP_REAL T2[3] = { 0, 0, 0 };
	PQP_Model tmp_model;

	tmp_model.BeginModel();
	int fcount = 0;
	PQP_REAL ps[3][3];
	for (int i = 0; i < F_.rows(); i++)
	{
		for (int j = 0; j <F_.cols(); j++)
		{
			for (int k = 0; k < 3; k++)
			{
				ps[j][k] = V_(F_(i, j), k);
			}

		}
		tmp_model.AddTri(ps[0], ps[1], ps[2], fcount);
		fcount++;
	}
	tmp_model.EndModel();

	PQP_Collide(&result, R1, T1, &m_pqp_model, R2, T2, &tmp_model);
	for (int i = 0; i < result.num_pairs; ++i)
	{
		SelfIntersectionResult self_res;
		if (result.Id1(i) != result.Id2(i)&& result.Id1(i)>=0&& result.Id2(i)>=0)
		{
			bool is_nei = false;
			for (int fvi1 = 0; fvi1 < 3; fvi1++)
			{
				int vid1 = F_(result.Id1(i), fvi1);
				for (int fvi2 = 0; fvi2 < 3; fvi2++)
				{
					int vid2=F_(result.Id2(i), fvi2);
					if (vid1 == vid2)
					{
						is_nei = true;
						break;
					}
					if (is_nei)
					{
						break;
					}
				}
			}
			if (!is_nei)
			{
				self_res.fida_ = result.Id1(i);
				self_res.fidb_ = result.Id2(i);
			}
			else
			{
				Eigen::Vector3d normal1=ComputeFaceNormal(V_, F_, result.Id1(i));
				Eigen::Vector3d normal2=ComputeFaceNormal(V_, F_, result.Id2(i));
				if (normal1 == normal2)
				{
					self_res.fida_ = result.Id1(i);
					self_res.fidb_ = result.Id2(i);
				}
			}
		}
		if (self_res.fida_ != -1 && self_res.fidb_ != -1)
		{
			res_self_intersect.push_back(self_res);
		}
		
	}
	if (res_self_intersect.size() == 0)
	{
		return false;
	}
	else
	{
		return true;
	}
}
std::vector<CPqpObb::QueryResult> CPqpObb::QueryRay(const Eigen::Vector3d& pt, const Eigen::Vector3d& dir)
{
	double M = 1000;
	Eigen::Vector3d start = pt + 1e-8 * dir;
	Eigen::Vector3d end = pt + M * dir;
	PQP_Model singleTriangle;
	singleTriangle.BeginModel();
	PQP_REAL p1[3], p2[3], p3[3];
	p1[0] = (PQP_REAL)(start.x());
	p1[1] = (PQP_REAL)(start.y());
	p1[2] = (PQP_REAL)(start.z());
	p2[0] = (PQP_REAL)(end.x());
	p2[1] = (PQP_REAL)(end.y());
	p2[2] = (PQP_REAL)(end.z());
	p3[0] = (PQP_REAL)(end.x());
	p3[1] = (PQP_REAL)(end.y());
	p3[2] = (PQP_REAL)(end.z());
	singleTriangle.AddTri(p1, p2, p3, 0);
	singleTriangle.EndModel();
	PQP_CollideResult result;
	PQP_REAL R1[3][3] = { 1, 0, 0, 0, 1, 0, 0, 0, 1 };
	PQP_REAL T1[3] = { 0, 0, 0 };
	PQP_REAL R2[3][3] = { 1, 0, 0, 0, 1, 0, 0, 0, 1 };
	PQP_REAL T2[3] = { 0, 0, 0 };
	int ret = PQP_Collide(&result, R1, T1, &m_pqp_model, R2, T2, &singleTriangle);
	std::vector<CPqpObb::QueryResult> intersections;
	for (int i = 0; i < result.num_pairs; ++i)
	{
		int fid=result.Id1(i);
		
		std::vector<Eigen::Vector3d>vs;
		for (int j=0;j<F_.cols();j++)
		{
			vs.push_back(V_.row(F_(fid, j)));
		}
		std::pair<Eigen::Vector3d, double> intersection = GetIntersectionPoint(vs[0],vs[1],vs[2],start, dir);
		intersections.push_back(CPqpObb::QueryResult(fid,
			intersection.second, intersection.first));
	}
	std::sort(intersections.begin(), intersections.end());
	return intersections;
}
