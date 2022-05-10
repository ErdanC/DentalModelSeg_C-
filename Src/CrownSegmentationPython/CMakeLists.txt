
set(CrownSegPython_INC_FILES
	crown_segmentation_python.h

	)

set(CrownSegPython_SRC_FILES

	crown_segmentation_python.cpp

	)
	




if(MSVC)
include_directories("${PROJECT_SOURCE_DIR}")
include_directories("$ENV{TEIGEN_ROOT}")
include_directories("$ENV{TLIBIGL_INCLDUEDIR}")
include_directories("$ENV{TLIBIGL_DIR}")
include_directories("$ENV{TOPEN_MESH_DIR}/include")
include_directories("$ENV{TCGAL_DIR}/include")
include_directories("$ENV{BOOST_INCLUDEDIR}")
include_directories("$ENV{TCGAL_DIR}/auxiliary/gmp/include")
include_directories("$ENV{TCGAL_BUILD}/include")
include_directories("$ENV{TOPENCV_DIR}/include")
include_directories("$ENV{PYTHON_DIR}/include")
include_directories("$ENV{pybind11_DIR}/include")
else()
include_directories(${PROJECT_SOURCE_DIR})
include_directories($ENV{TEIGEN_ROOT})
include_directories($ENV{TLIBIGL_INCLDUEDIR})
include_directories($ENV{TLIBIGL_DIR})
include_directories($ENV{TOPEN_MESH_DIR}/src)
include_directories($ENV{PYTHON_DIR}/include)
find_package(OpenCV REQUIRED)
include_directories(${OpenCV_INCLUDE_DIRS})
endif()



if(MSVC)
link_directories(${PROJECT_BINARY_DIR}/lib)
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
link_directories($ENV{TCGAL_BUILD}/lib)
link_directories($ENV{TCGAL_DIR}/auxiliary/gmp/lib)
link_directories($ENV{TOPEN_MESH_DIR}/lib)
link_directories($ENV{TOPENCV_DIR}/x64/vc14/lib)
link_directories($ENV{PYTHON_DIR}/libs)



else()
link_directories(${PROJECT_BINARY_DIR}/lib)
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
link_directories($ENV{TOPEN_MESH_DIR}/build/Build/lib)
link_directories($ENV{PYTHON_DIR}/libs)
link_directories($ENV{BOOST_LIBRARYDIR})

endif()

#add_library(CrownSegmentationPython SHARED ${CrownSegPython_INC_FILES} ${CrownSegPython_SRC_FILES})
add_subdirectory($ENV{pybind11_DIR} ${PROJECT_BINARY_DIR}/pybind11)
pybind11_add_module(CrownSegmentationPython ${CrownSegPython_SRC_FILES})


if(MSVC)
add_definitions(-DNDEBUG)
add_definitions(-D_WINDOWS)
add_definitions(-D_USRDLL)
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
add_definitions(-D_CRT_SECURE_NO_WARNINGS)
add_definitions(-DCGAL_EIGEN3_ENABLED)
add_definitions(-DUSE_FORWARD_DECL)
add_definitions(-D_USE_MATH_DEFINES)
add_definitions(-DINCLUDE_TEMPLATES)
add_definitions(-DCGAL_USE_MPFR)
add_definitions(-DCGAL_USE_GMP)
endif()



if(MSVC)
target_link_libraries(CrownSegmentationPython PUBLIC CGAL_Core-vc140-mt-4.9.lib)
target_link_libraries(CrownSegmentationPython PUBLIC CGAL_ImageIO-vc140-mt-4.9.lib)
target_link_libraries(CrownSegmentationPython PUBLIC CGAL_Qt5-vc140-mt-4.9.lib)
target_link_libraries(CrownSegmentationPython PUBLIC CGAL-vc140-mt-4.9.lib)
target_link_libraries(CrownSegmentationPython PUBLIC libgmp-10.lib)
target_link_libraries(CrownSegmentationPython PUBLIC libmpfr-4.lib)
target_link_libraries(CrownSegmentationPython PUBLIC OpenMeshCore.lib)
target_link_libraries(CrownSegmentationPython PUBLIC OpenMeshTools.lib)
target_link_libraries(CrownSegmentationPython PUBLIC DataColle.lib)
target_link_libraries(CrownSegmentationPython PUBLIC AdditionalLibs.lib)
target_link_libraries(CrownSegmentationPython PUBLIC AlgColle.lib)
target_link_libraries(CrownSegmentationPython PUBLIC Manager.lib)
target_link_libraries(CrownSegmentationPython PUBLIC HarmonicSegAlg.lib)
target_link_libraries(CrownSegmentationPython PUBLIC opencv_world310.lib)
target_link_libraries(CrownSegmentationPython PUBLIC OpenMeshTools.lib)
target_link_libraries(CrownSegmentationPython PUBLIC OpenMeshCore.lib)


else()
target_link_libraries(CrownSegmentationPython PUBLIC libCGAL_Core.so)
target_link_libraries(CrownSegmentationPython PUBLIC libCGAL_ImageIO.so)
target_link_libraries(CrownSegmentationPython PUBLIC libCGAL_Qt5.so)
target_link_libraries(CrownSegmentationPython PUBLIC libCGAL.so)
target_link_libraries(CrownSegmentationPython PUBLIC libgmp.so)
target_link_libraries(CrownSegmentationPython PUBLIC libmpfr.so)
target_link_libraries(CrownSegmentationPython PUBLIC libOpenMeshCore.so)
target_link_libraries(CrownSegmentationPython PUBLIC libOpenMeshTools.so)
target_link_libraries(CrownSegmentationPython PUBLIC DataColle.so)
target_link_libraries(CrownSegmentationPython PUBLIC AlgColle.so)
target_link_libraries(CrownSegmentationPython PUBLIC AdditionalLibs.so)
target_link_libraries(CrownSegmentationPython PUBLIC HarmonicSegAlg.so)
target_link_libraries(CrownSegmentationPython PUBLIC Manager.so)
target_link_libraries(CrownSegmentationPython PUBLIC ${OpenCV_LIBS} )

endif()







