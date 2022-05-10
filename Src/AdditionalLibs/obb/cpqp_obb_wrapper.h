#ifndef CPQP_OBB_WRAPPER
#define CPQP_OBB_WRAPPER



#include<iostream>
#include"../prereq.h"
#include "PQP.h"
#include <Eigen/Sparse>
class ADDITIONALLIBS_CLASS CPqpObb
{
protected:
	Eigen::MatrixXd V_;
	Eigen::MatrixXi F_;
	PQP_Model m_pqp_model;
	
public:
	struct SelfIntersectionResult
	{
		int fida_ = -1;
		int fidb_ = -1;

	};
	struct QueryResult
	{
		int fid_;
		double distance;
		Eigen::Vector3d closest_pnt_;
		QueryResult(){}
		QueryResult(int fid, double distance, const Eigen::Vector3d closest_pnt)
			: fid_(fid), distance(distance), closest_pnt_(closest_pnt)
		{
		}
		bool operator<(const QueryResult& other) const
		{
			if (distance < other.distance)
				return true;
			if (distance > other.distance)
				return false;
			if (fid_ < other.fid_)
				return true;
			if (fid_ > other.fid_)
				return false;
			return false;
		}
	};
	Eigen::Vector3d ComputeFaceNormal(Eigen::MatrixXd&vertexs, Eigen::MatrixXi &faces, int fid);
public:
	CPqpObb(Eigen::MatrixXd& V, Eigen::MatrixXi& F);
	bool DetectSelfIntersection(std::vector<SelfIntersectionResult>&res_self_intersect);
	QueryResult QueryClosestPoint(const Eigen::Vector3d& pt);
	std::vector<QueryResult> QueryRay(const Eigen::Vector3d& pt, const Eigen::Vector3d& dir);
};
#endif

