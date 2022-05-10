#ifndef CROWN_SEGMENTATION_PYTHON_H
#define CROWN_SEGMENTATION_PYTHON_H
#include <pybind11/pybind11.h>
#include"../Manager/context.h"
#include<string>
#include<pybind11/stl.h>
#include<pybind11/stl_bind.h>

namespace py = pybind11;

PYBIND11_MAKE_OPAQUE(std::vector<int>);
PYBIND11_MAKE_OPAQUE(std::vector<double>);


class CCrownSegPython
{
protected:
	CManagerContext manager_context_;
public:
	CCrownSegPython();
	bool Init(std::string fname);
	bool ApplyAutoSegmentation(std::vector<int>&res_tooth_fids,std::vector<int>&res_tooth_ftags);
	bool ApplySegmentation(std::vector<int>& vmark_ids, std::vector<int>& res_updated_fids,std::vector<int>&res_updated_ftags);
	bool GetCurrentMesh(std::vector<double>&res_vertexs,std::vector<int> &res_faces,std::vector<double>&res_updir);
	bool DelTeeth(int mark_vid, std::vector<int>&res_modified_fids);
	bool SaveSegmentationResult(std::string fname);
	bool DetectLandmark(std::vector<double>&res_landmark_pos, std::vector<int>&res_fids);
	bool GetFaceTags(std::vector<int>&res_face_tags);
	bool GetCrownLocalMatrix(std::vector<double>&fa_points, std::vector<double>&long_axis, std::vector<double>&centers, std::vector<double>&res_matrix, std::vector<double>&res_inv_matrix);
};


PYBIND11_PLUGIN(CrownSegmentationPython) {
	py::module m("CrownSegmentationPython", "CrownSegmentationPython");

	py::bind_vector<std::vector<int>>(m, "VectorInt");
	py::bind_vector<std::vector<double>>(m, "VectorDouble");
	
	py::class_<CCrownSegPython>(m, "CCrownSegPython")
		.def(py::init<>())
		.def("DelTeeth", &CCrownSegPython::DelTeeth)
		.def("ApplySegmentation", &CCrownSegPython::ApplySegmentation)
		.def("ApplyAutoSegmentation", &CCrownSegPython::ApplyAutoSegmentation)
		.def("GetCurrentMesh", &CCrownSegPython::GetCurrentMesh)
		.def("Init", &CCrownSegPython::Init)
		.def("DetectLandmark", &CCrownSegPython::DetectLandmark)
		.def("GetFaceTags", &CCrownSegPython::GetFaceTags)	
		.def("GetCrownLocalMatrix", &CCrownSegPython::GetCrownLocalMatrix);
	
	return m.ptr();
}
#endif