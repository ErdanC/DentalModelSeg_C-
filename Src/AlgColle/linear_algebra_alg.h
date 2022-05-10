#ifndef CLINEAR_ALGEBRA_ALG_H
#define CLINEAR_ALGEBRA_ALG_H
#include"prereq.h"
#include <Eigen/LU>
#include <Eigen/Dense>
#include <Eigen/Sparse>
class ClinearAlgebraAlg
{
public:
	static Eigen::VectorXd SolveLdlt(const Eigen::SparseMatrix<double>& CoeffMat, const Eigen::VectorXd& right, double pinvtoler);
	
};
#endif
