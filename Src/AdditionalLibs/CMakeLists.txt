


set(ADDITIONAL_LIBS_INC_FILES

#	MeshFix/tmesh_igl_converter.h
#	MeshFix/mesh_fix_wrapper.h
#	MeshFix/TMesh/detectIntersections.h
#	MeshFix/TMesh/marchIntersections.h
#	MeshFix/TMesh/tin.h
#	MeshFix/TMesh/tmesh.h
#	MeshFix/TMesh/edge.h
#	MeshFix/TMesh/triangle.h
#	MeshFix/TMesh/vertex.h
	
#	MeshFix/Kernel/jqsort.h
#	MeshFix/Kernel/tmesh_kernel.h
#	MeshFix/Kernel/point.h
#	MeshFix/Kernel/matrix.h
#	MeshFix/Kernel/graph.h
#	MeshFix/Kernel/list.h
#	MeshFix/Kernel/heap.h
#	MeshFix/Kernel/basics.h
#	MeshFix/Kernel/coordinates.h

	XWGeodesic/xw_geodesic_wrapper.h
	XWGeodesic/Extremity_Point_Utils.h
	XWGeodesic/Xin_Wang.h
	XWGeodesic/ICH_WindowFiltering.h
	XWGeodesic/Chen_Han.h
	XWGeodesic/ExactDGPMethod.h
	XWGeodesic/DistanceApproach.h
	XWGeodesic/FacePoint.h
	XWGeodesic/EdgePoint.h
	XWGeodesic/RichModel.h
	XWGeodesic/ModelWrapper.h
	XWGeodesic/BaseModel.h
	XWGeodesic/Parameters.h
	XWGeodesic/Point3d.h

	obb/cpqp_obb_wrapper.h
	obb/OBB_Disjoint.h
	obb/RectDist.h
	obb/MatVec.h
	obb/TriDist.h
	obb/Build.h
	obb/PQP.h
	obb/PQP_Internal.h
	obb/BV.h
	obb/Tri.h
	obb/BVTQ.h
	obb/PQP_Compile.h
	obb/GetTime.h

        libicp/icp.h
        libicp/icpPointToPlane.h
        libicp/icpPointToPoint.h
        libicp/kdtree.h
        libicp/libicp_wrapper.h
        libicp/matrix.h
	prereq.h
	)

set(ADDITIONAL_LIBS_SRC_FILES
	
#	MeshFix/tmesh_igl_converter.cpp
#	MeshFix/mesh_fix_wrapper.cpp

#	MeshFix/Algorithms/checkAndRepair.cpp
#	MeshFix/Algorithms/detectIntersections.cpp
#	MeshFix/Algorithms/holeFilling.cpp
#	MeshFix/Algorithms/marchIntersections.cpp
#	MeshFix/Algorithms/subdivision.cpp
#	MeshFix/MeshFix/meshfix.cpp
	
#	MeshFix/TMesh/io.cpp
#	MeshFix/TMesh/tin.cpp
#	MeshFix/TMesh/edge.cpp
#	MeshFix/TMesh/triangle.cpp
#	MeshFix/TMesh/vertex.cpp
	
#	MeshFix/Kernel/graph.cpp
#	MeshFix/Kernel/orientation.c
#	MeshFix/Kernel/tmesh.cpp
#	MeshFix/Kernel/point.cpp
#	MeshFix/Kernel/matrix.cpp
#	MeshFix/Kernel/list.cpp
#	MeshFix/Kernel/heap.cpp
#	MeshFix/Kernel/jqsort.cpp
#	MeshFix/Kernel/coordinates.cpp
	
	XWGeodesic/xw_geodesic_wrapper.cpp
	XWGeodesic/Extremity_Point_Utils.cpp
	XWGeodesic/Xin_Wang.cpp
	XWGeodesic/ICH_WindowFiltering.cpp
	XWGeodesic/Chen_Han.cpp
	XWGeodesic/ExactDGPMethod.cpp
	XWGeodesic/DistanceApproach.cpp
	XWGeodesic/RichModel.cpp
	XWGeodesic/ModelWrapper.cpp
	XWGeodesic/BaseModel.cpp
	XWGeodesic/Point3D.cpp

	obb/cpqp_obb_wrapper.cpp
	obb/Build.cpp
	obb/PQP.cpp
	obb/BV.cpp
	obb/TriDist.cpp

        libicp/demo.cpp
        libicp/icp.cpp
        libicp/icpPointToPlane.cpp
        libicp/icpPointToPoint.cpp
        libicp/kdtree.cpp
        libicp/matrix.cpp
        libicp/libicp_wrapper.cpp
	)


	


if(MSVC)
include_directories("${PROJECT_SOURCE_DIR}/Src/AdditionalLibs")
include_directories("$ENV{BOOST_INCLUDEDIR}")
#include_directories("${PROJECT_SOURCE_DIR}/Src/AdditionalLibs/MeshFix/Algorithms")
#include_directories("${PROJECT_SOURCE_DIR}/Src/AdditionalLibs/MeshFix/Kernel")
#include_directories("${PROJECT_SOURCE_DIR}/Src/AdditionalLibs/MeshFix/MeshFix")
#include_directories("${PROJECT_SOURCE_DIR}/Src/AdditionalLibs/MeshFix/TMesh")
#include_directories("${PROJECT_SOURCE_DIR}/Src/AdditionalLibs/MeshFix")

include_directories("$ENV{TEIGEN_ROOT}")
include_directories("$ENV{TLIBIGL_INCLDUEDIR}")
include_directories("$ENV{TLIBIGL_DIR}")
else()
include_directories(${PROJECT_SOURCE_DIR}/Src/AdditionalLibs)
#include_directories(${PROJECT_SOURCE_DIR}/Src/AdditionalLibs/MeshFix/Algorithms)
#include_directories(${PROJECT_SOURCE_DIR}/Src/AdditionalLibs/MeshFix/Kernel)
#include_directories(${PROJECT_SOURCE_DIR}/Src/AdditionalLibs/MeshFix/MeshFix)
#include_directories(${PROJECT_SOURCE_DIR}/Src/AdditionalLibs/MeshFix/TMesh)
#include_directories(${PROJECT_SOURCE_DIR}/Src/AdditionalLibs/MeshFix)
include_directories($ENV{TEIGEN_ROOT})
include_directories($ENV{TLIBIGL_INCLDUEDIR})
include_directories($ENV{TLIBIGL_DIR})
include_directories("/home/cnl/WorkSpace/CrownSegmentation/Src/AdditionalLibs")


endif()


if(MSVC)
link_directories(${PROJECT_BINARY_DIR}/lib)
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
else()
link_directories(${PROJECT_BINARY_DIR}/lib)
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
endif()



add_library(AdditionalLibs SHARED   ${ADDITIONAL_LIBS_INC_FILES} ${ADDITIONAL_LIBS_SRC_FILES} )




if(MSVC)
add_definitions(-DNDEBUG)
add_definitions(-D_USRDLL)
add_definitions(-D_CRT_SECURE_NO_WARNINGS)
add_definitions(-DCGAL_EIGEN3_ENABLED)
add_definitions(-DUSE_FORWARD_DECL)
add_definitions(-D_USE_MATH_DEFINES)
add_definitions(-D_SCL_SECURE_NO_WARNINGS)
add_definitions(-DOM_STATIC_BUILD)
add_definitions(-DADDITIONALLIBS_EXPORTS)
else()
add_definitions(-DNDEBUG)
add_definitions(-D_USRDLL)
add_definitions(-DADDITIONALLIBS_EXPORTS)
add_definitions(-D_CRT_SECURE_NO_WARNINGS)
add_definitions(-DCGAL_EIGEN3_ENABLED)
add_definitions(-DUSE_FORWARD_DECL)
add_definitions(-D_USE_MATH_DEFINES)
add_definitions(-D_SCL_SECURE_NO_WARNINGS)
add_definitions(-DOM_STATIC_BUILD)
endif()






