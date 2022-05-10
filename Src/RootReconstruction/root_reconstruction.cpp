#include"root_reconstruction.h"
#include "../AlgColle/geo_alg.h"
#include "../DataColle/cgal_igl_converter.h"
#include <igl/grad.h>
#include <igl/harmonic.h>
#include <igl/per_vertex_normals.h>

CRootReconstruction::CRootReconstruction()
{
}

void CRootReconstruction::segTeethToIndividual(std::map<int, COpenMeshT*>& crown_meshes, COpenMeshT & mesh, std::vector<int>& mesh_tags){
	std::map<int, std::map<COpenMeshT::VertexHandle, COpenMeshT::VertexHandle>> vid_org_map_;
	CGeoAlg::SeparateMeshByVertexTag(mesh, mesh_tags, crown_meshes, vid_org_map_);
	for (auto iter = crown_meshes.begin(); iter != crown_meshes.end(); iter++)
	{
		if (vid_org_map_[iter->first].size() < 50 || vid_org_map_[iter->first].size() > 5000)
		{
			//this->gingival_mesh = this->sep_meshes[iter->first];
			crown_meshes.erase(iter->first);
		}
	}
	vid_org_map_.clear();
}

void CRootReconstruction::initTemplatePosition(COpenMeshT & crown_meshes, COpenMeshT & template_mesh){
	OpenMesh::Vec3d teeth_center;
	teeth_center = CGeoAlg::ComputeMeshCenter(crown_meshes);
	std::cerr << teeth_center << std::endl;
	OpenMesh::Vec3d crown_dir = teeth_center;
	OpenMesh::Vec3d crown_up = OpenMesh::Vec3d(0, -1, 0);
	OpenMesh::Vec3d template_dir = OpenMesh::Vec3d(-1, 0, 0);
	OpenMesh::Vec3d template_up = OpenMesh::Vec3d(0, 0, 1);

	Eigen::Vector3d u0, v0;
	Eigen::Vector3d u2, v2;

	u0[0] = template_dir[0];
	u0[1] = template_dir[1];
	u0[2] = template_dir[2];

	v0[0] = template_up[0];
	v0[1] = template_up[1];
	v0[2] = template_up[2];

	u2[0] = crown_dir[0];
	u2[1] = crown_dir[1];
	u2[2] = crown_dir[2];

	v2[0] = crown_up[0];
	v2[1] = crown_up[1];
	v2[2] = crown_up[2];

	Eigen::Quaterniond q2 = Eigen::Quaterniond::FromTwoVectors(u0, u2);
	Eigen::Vector3d v1 = q2._transformVector(v0);
	Eigen::Quaterniond q1 = Eigen::Quaterniond::FromTwoVectors(v1, v2);
	Eigen::Quaterniond q = q2*q1;

	for (auto i = template_mesh.vertices_begin(); i != template_mesh.vertices_end(); i++){
		Eigen::Vector3d temporary;
		temporary[0] = template_mesh.point(i)[0];
		temporary[1] = template_mesh.point(i)[1];
		temporary[2] = template_mesh.point(i)[2];
		temporary = q2._transformVector(temporary);
		temporary = q1._transformVector(temporary);
		template_mesh.point(i)[0] = temporary[0];
		template_mesh.point(i)[1] = temporary[1];
		template_mesh.point(i)[2] = temporary[2];
	}

	OpenMesh::Vec3d template_crown_center = OpenMesh::Vec3d(0, 0, 0);
	int n_vertice = 0;
	for (auto v_iter = template_mesh.vertices_begin(); v_iter != template_mesh.vertices_end(); v_iter++) {
		if (template_mesh.color(v_iter) == OpenMesh::Vec3d(0, 0, 255)) {
			template_crown_center = template_crown_center + template_mesh.point(v_iter);
			n_vertice++;
		}
	}
	template_crown_center = template_crown_center / n_vertice;

	OpenMesh::Vec3d template_translate = teeth_center - template_crown_center;
	for (auto v_iter = template_mesh.vertices_begin(); v_iter != template_mesh.vertices_end(); v_iter++){
		template_mesh.point(v_iter) = template_mesh.point(v_iter) + template_translate;
	}

}

void CRootReconstruction::templateCrownRootSeperate(COpenMeshT & template_mesh, COpenMeshT & template_crown){
	std::vector<int> template_crown_tags;
	std::map<int, COpenMeshT*> template_seperate_mesh;
	std::map<int, std::map<COpenMeshT::VertexHandle, COpenMeshT::VertexHandle>> template_crown_root_map;
	for (auto v_iter = template_mesh.vertices_begin(); v_iter != template_mesh.vertices_end(); v_iter++){
		if (template_mesh.color(v_iter) == OpenMesh::Vec3d(0, 0, 255)){
			template_crown_tags.push_back(1);
		}
		else{
			template_crown_tags.push_back(-1);
		}
	}
	CGeoAlg::SeparateMeshByVertexTag(template_mesh, template_crown_tags, template_seperate_mesh, template_crown_root_map);
	template_crown = *template_seperate_mesh[1];
}

void CRootReconstruction::templateToCrownDisplacement(COpenMeshT & template_mesh, COpenMeshT & template_crown, std::map<int, OpenMesh::Vec3d> & template_crown_displacement){
	if (template_crown_displacement.size() != NULL)  template_crown_displacement.clear();
	OpenMesh::Vec3d template_crown_vector;
	OpenMesh::Vec3d template_minilen_;
	OpenMesh::Vec3d temp_one, temp_two;
	double template_crown_len;
	double template_crown_templen;
	for (auto viter_crown = template_crown.vertices_begin(); viter_crown != template_crown.vertices_end(); viter_crown++) {
		if (viter_crown->idx() % 5 != 0) continue;
		int viter_crown_id;
		template_crown_len = 1e10;
		for (auto viter_template = template_mesh.vertices_begin(); viter_template != template_mesh.vertices_end(); viter_template++) {
			template_crown_vector = template_crown.point(viter_crown) - template_mesh.point(viter_template);
			template_crown_templen = template_crown_vector.length();
			if (template_crown_len > template_crown_templen) {
				viter_crown_id = viter_template->idx();
				template_minilen_ = template_crown_vector;
				template_crown_len = template_crown_templen;
			}
		}
		template_crown_displacement[viter_crown_id] = template_minilen_;
	}
}

void CRootReconstruction::templateToCrownFitting(COpenMeshT & template_mesh, std::map<int, OpenMesh::Vec3d>& template_crown_displacement){
	std::pair<Eigen::MatrixXd, Eigen::MatrixXi>mean_shapes;
	Eigen::MatrixXd V, U, V_bc, U_bc;
	Eigen::VectorXd Z;
	Eigen::MatrixXi F;
	Eigen::VectorXi b;
	COpenMeshT &mesh_test = template_mesh;

	Eigen::RowVector3d top_displacement;
	CConverter::ConvertFromOpenMeshToIGL(mesh_test, mean_shapes.first, mean_shapes.second);
	V = mean_shapes.first;
	F = mean_shapes.second;
	U = V;
	Eigen::VectorXi S(V.rows());
	for (auto i = 0; i < V.rows(); i++){
		S(i) = -1;
	}
	for (auto iter = template_crown_displacement.begin(); iter != template_crown_displacement.end(); iter++) {
		S(iter->first) = 1;
	}
	igl::colon<int>(0, V.rows() - 1, b);
	b.conservativeResize(std::stable_partition(b.data(), b.data() + b.size(),
		[&S](int i)->bool {return S(i) >= 0; }) - b.data());
	// Boundary conditions directly on deformed positions
	U_bc.resize(b.size(), V.cols());
	V_bc.resize(b.size(), V.cols());
	for (int bi = 0; bi < b.size(); bi++){
		V_bc.row(bi) = V.row(b(bi));
		switch (S(b(bi))){
		case 0:
			// Don't move handle 0
			U_bc.row(bi) = V.row(b(bi));
			break;
		case 1:
			// move handle 1 down
			top_displacement[0] = template_crown_displacement[b(bi)][0];
			top_displacement[1] = template_crown_displacement[b(bi)][1];
			top_displacement[2] = template_crown_displacement[b(bi)][2];
			U_bc.row(bi) = V.row(b(bi)) + top_displacement;

			break;
		case 2:
		default:
			// move other handles forward
			U_bc.row(bi) = V.row(b(bi)) + Eigen::RowVector3d(0, 0, -25);
			break;
		}
		//U_bc.row(bi) = V.row(b(bi)) + Eigen::RowVector3d(0, 0, 0);
	}
	const Eigen::MatrixXd U_bc_anim = V_bc + (U_bc - V_bc);
	Eigen::MatrixXd D;
	Eigen::MatrixXd D_bc = U_bc_anim - V_bc;
	igl::harmonic(V, F, b, D_bc, 2, D);
	U = V + D;
	CConverter::ConvertFromIGLToOpenMesh(U, F, mesh_test);
}

void CRootReconstruction::meshSmooth(COpenMeshT & mesh){
	std::pair<Eigen::MatrixXd, Eigen::MatrixXi>mean_shapes;
	COpenMeshT &mesh_test = mesh;
	Eigen::MatrixXd V, U;
	Eigen::MatrixXi F;
	Eigen::SparseMatrix<double> L;
	CConverter::ConvertFromOpenMeshToIGL(mesh_test, mean_shapes.first, mean_shapes.second);
	V = mean_shapes.first;
	F = mean_shapes.second;
	igl::cotmatrix(V, F, L);
	// Alternative construction of same Laplacian
	Eigen::SparseMatrix<double> G, K;
	// Gradient/Divergence
	igl::grad(V, F, G);
	// Diagonal per-triangle "mass matrix"
	Eigen::VectorXd dblA;
	igl::doublearea(V, F, dblA);
	// Place areas along diagonal #dim times
	const auto & T = 1.*(dblA.replicate(3, 1)*0.5).asDiagonal();
	// Laplacian K built as discrete divergence of gradient or equivalently
	// discrete Dirichelet energy Hessian
	K = -G.transpose() * T * G;
	std::cerr << "|K-L|: " << (K - L).norm() << std::endl;
	// Use original normals as pseudo-colors
	Eigen::MatrixXd N;
	igl::per_vertex_normals(V, F, N);
	Eigen::MatrixXd C = N.rowwise().normalized().array()*0.5 + 0.5;
	// Initialize smoothing with base mesh
	U = V;

	for (int i = 0; i < 40; i++){
		// switch case for interation
		// Recompute just mass matrix on each step
		Eigen::SparseMatrix<double> M;
		igl::massmatrix(U, F, igl::MASSMATRIX_TYPE_BARYCENTRIC, M);
		// Solve (M-delta*L) U = M*U
		const auto & S = (M - 0.001*L);
		Eigen::SimplicialLLT<Eigen::SparseMatrix<double > > solver(S);
		assert(solver.info() == Eigen::Success);
		U = solver.solve(M*U).eval();
	}
	CConverter::ConvertFromIGLToOpenMesh(U, F, mesh_test);

}
