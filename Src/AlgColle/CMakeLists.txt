
set(ALG_COLLE_INC_FILES

	dental_base_alg.h
	geo_alg.h
	morphlogic_operation.h
	numerical_base_alg.h
	linear_algebra_alg.h
	image_base_alg.h
	geo_base_alg.h
	curve_base_alg.h
        non_rigid_icp.h
	prereq.h

	)

set(ALG_COLLE_SRC_FILES

	dental_base_alg.cpp
	geo_alg.cpp
	geo_base_alg.cpp
	curve_base_alg.cpp
	image_base_alg.cpp
	linear_algebra_alg.cpp
	numerical_base_alg.cpp
	morphlogic_operation.cpp
        non_rigid_icp.cpp

	)
	




if(MSVC)
include_directories("${PROJECT_SOURCE_DIR}")
include_directories("$ENV{TEIGEN_ROOT}")
include_directories("$ENV{TLIBIGL_INCLDUEDIR}")
include_directories("$ENV{TLIBIGL_DIR}")
include_directories("$ENV{TLIBIGL_DIR}/external/embree/include")
include_directories("$ENV{TOPEN_MESH_DIR}/include")
include_directories("$ENV{TCGAL_DIR}/include")
include_directories("$ENV{BOOST_INCLUDEDIR}")
include_directories("$ENV{TCGAL_DIR}/auxiliary/gmp/include")
include_directories("$ENV{TCGAL_BUILD}/include")
include_directories("$ENV{TOPENCV_DIR}/include")
include_directories("$ENV{EMBREE_DIR}/include")
include_directories("$ENV{TANN_DIR}/include")
else()
include_directories(${PROJECT_SOURCE_DIR})
include_directories($ENV{TEIGEN_ROOT})
include_directories($ENV{TLIBIGL_INCLDUEDIR})
include_directories($ENV{TLIBIGL_DIR})
include_directories($ENV{TOPEN_MESH_DIR}/src)

find_package(OpenCV REQUIRED)
include_directories(${OpenCV_INCLUDE_DIRS})
endif()



if(MSVC)
link_directories(${PROJECT_BINARY_DIR}/lib)
link_directories(${BOOST_LIBRARYDIR})
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
link_directories($ENV{TCGAL_BUILD}/lib)
link_directories($ENV{TCGAL_DIR}/auxiliary/gmp/lib)
link_directories($ENV{TOPEN_MESH_DIR}/lib)
link_directories($ENV{TOPENCV_DIR}/x64/vc14/lib)
link_directories($ENV{EMBREE_DIR}/lib)
link_directories($ENV{TANN_DIR}/x64/Release)
link_directories($ENV{BOOST_LIBRARYDIR})
else()
link_directories(${PROJECT_BINARY_DIR}/lib)
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
link_directories($ENV{TOPEN_MESH_DIR}/build/Build/lib)
endif()

add_library(AlgColle SHARED ${ALG_COLLE_INC_FILES} ${ALG_COLLE_SRC_FILES})



if(MSVC)
add_definitions(-DNDEBUG)
add_definitions(-D_WINDOWS)
add_definitions(-D_USRDLL)
add_definitions(-DALGCOLLE_EXPORTS)
add_definitions(-D_CRT_SECURE_NO_WARNINGS)
add_definitions(-DCGAL_EIGEN3_ENABLED)
add_definitions(-DUSE_FORWARD_DECL)
add_definitions(-D_USE_MATH_DEFINES)
add_definitions(-DINCLUDE_TEMPLATES)
add_definitions(-DCGAL_USE_MPFR)
add_definitions(-DCGAL_USE_GMP)
else()
add_definitions(-DNDEBUG)
add_definitions(-D_USRDLL)
add_definitions(-DALGCOLLE_EXPORTS)
add_definitions(-D_CRT_SECURE_NO_WARNINGS)
add_definitions(-DCGAL_EIGEN3_ENABLED)
add_definitions(-DUSE_FORWARD_DECL)
add_definitions(-D_USE_MATH_DEFINES)
add_definitions(-DINCLUDE_TEMPLATES)
add_definitions(-DCGAL_USE_MPFR)
add_definitions(-DCGAL_USE_GMP)
endif()



if(MSVC)
target_link_libraries(AlgColle PUBLIC CGAL_Core-vc140-mt-4.9.lib)
target_link_libraries(AlgColle PUBLIC CGAL_ImageIO-vc140-mt-4.9.lib)
target_link_libraries(AlgColle PUBLIC CGAL_Qt5-vc140-mt-4.9.lib)
target_link_libraries(AlgColle PUBLIC CGAL-vc140-mt-4.9.lib)
target_link_libraries(AlgColle PUBLIC libgmp-10.lib)
target_link_libraries(AlgColle PUBLIC libmpfr-4.lib)
target_link_libraries(AlgColle PUBLIC OpenMeshCore.lib)
target_link_libraries(AlgColle PUBLIC OpenMeshTools.lib)
target_link_libraries(AlgColle PUBLIC DataColle.lib)
target_link_libraries(AlgColle PUBLIC AdditionalLibs.lib)
target_link_libraries(AlgColle PUBLIC opencv_world310.lib)
target_link_libraries(AlgColle PUBLIC OpenMeshTools.lib)
target_link_libraries(AlgColle PUBLIC OpenMeshCore.lib)
target_link_libraries(AlgColle PUBLIC ANN.lib)

else()
target_link_libraries(AlgColle PUBLIC libCGAL_Core.so)
target_link_libraries(AlgColle PUBLIC libCGAL_ImageIO.so)
target_link_libraries(AlgColle PUBLIC libCGAL_Qt5.so)
target_link_libraries(AlgColle PUBLIC libCGAL.so)
target_link_libraries(AlgColle PUBLIC libgmp.so)
target_link_libraries(AlgColle PUBLIC libmpfr.so)
target_link_libraries(AlgColle PUBLIC libOpenMeshCore.so)
target_link_libraries(AlgColle PUBLIC libOpenMeshTools.so)
target_link_libraries(AlgColle PUBLIC DataColle.so)
target_link_libraries(AlgColle PUBLIC AdditionalLibs.so)
target_link_libraries(AlgColle PUBLIC ${OpenCV_LIBS} )

endif()







