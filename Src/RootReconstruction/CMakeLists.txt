
set(Root_Reconstruction_INC_FILES

	root_reconstruction.h
	prereq.h

	)

set(Root_Reconstruction_SRC_FILES

	root_reconstruction.cpp

	)
	

if(MSVC)
include_directories("${PROJECT_SOURCE_DIR}")
include_directories("$ENV{TEIGEN_ROOT}")
include_directories("$ENV{TLIBIGL_INCLDUEDIR}")
include_directories("$ENV{TLIBIGL_DIR}")
include_directories("$ENV{TOPEN_MESH_DIR}/include")
include_directories("$ENV(TOPENCV_DIR)/include")
include_directories("$ENV{TCGAL_DIR}/include")
include_directories("$ENV{BOOST_INCLUDEDIR}")
include_directories("$ENV{TCGAL_DIR}/auxiliary/gmp/include")
include_directories("$ENV{TCGAL_BUILD}/include")

else()
include_directories(${PROJECT_SOURCE_DIR})
include_directories($ENV{TEIGEN_ROOT})
include_directories($ENV{TLIBIGL_INCLDUEDIR})
include_directories($ENV{TLIBIGL_DIR})
include_directories($ENV{TOPEN_MESH_DIR}/include)
endif()


if(MSVC)
link_directories(${PROJECT_BINARY_DIR}/lib)
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
link_directories($ENV{TOPEN_MESH_DIR}/lib)
link_directories($ENV{TOPENCV_DIR}/x64/vc14/lib)
link_directories($ENV{TCGAL_BUILD}/lib)
link_directories($ENV{TCGAL_DIR}/auxiliary/gmp/lib)

else()
link_directories(${PROJECT_BINARY_DIR}/lib)
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
link_directories("$ENV{TOPEN_MESH_DIR}/lib")
endif()



add_library(RootReconstruction SHARED ${Root_Reconstruction_SRC_FILES})


if(MSVC)
add_definitions(-DNDEBUG)
add_definitions(-D_WINDOWS)
add_definitions(-D_USRDLL)
add_definitions(-DROOTRECONSTRUCTIONALG_EXPORTS)
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
add_definitions(-DROOTRECONSTRUCTIONALG_EXPORTS)
add_definitions(-D_CRT_SECURE_NO_WARNINGS)
add_definitions(-DCGAL_EIGEN3_ENABLED)
add_definitions(-DUSE_FORWARD_DECL)
add_definitions(-D_USE_MATH_DEFINES)
add_definitions(-DINCLUDE_TEMPLATES)
add_definitions(-DCGAL_USE_MPFR)
add_definitions(-DCGAL_USE_GMP)
endif()







if(MSVC)
target_link_libraries(RootReconstruction PUBLIC CGAL_ImageIO-vc140-mt-4.9.lib)
target_link_libraries(RootReconstruction PUBLIC CGAL_Qt5-vc140-mt-4.9.lib)
target_link_libraries(RootReconstruction PUBLIC CGAL-vc140-mt-4.9.lib)
target_link_libraries(RootReconstruction PUBLIC CGAL_Core-vc140-mt-4.9.lib)
target_link_libraries(RootReconstruction PUBLIC libgmp-10.lib)
target_link_libraries(RootReconstruction PUBLIC libmpfr-4.lib)
target_link_libraries(RootReconstruction PUBLIC DataColle.lib)
target_link_libraries(RootReconstruction PUBLIC AlgColle.lib)
target_link_libraries(RootReconstruction PUBLIC AdditionalLibs.lib)
target_link_libraries(RootReconstruction PUBLIC opencv_world310.lib)
target_link_libraries(RootReconstruction PUBLIC OpenMeshTools.lib)
target_link_libraries(RootReconstruction PUBLIC OpenMeshCore.lib)
else()
target_link_libraries(RootReconstruction PUBLIC libCGAL_Core.so)
target_link_libraries(RootReconstruction PUBLIC libCGAL_ImageIO.so)
target_link_libraries(RootReconstruction PUBLIC libCGAL_Qt5.so)
target_link_libraries(RootReconstruction PUBLIC libCGAL.so)
target_link_libraries(RootReconstruction PUBLIC libgmp.so)
target_link_libraries(RootReconstruction PUBLIC libmpfr.so)
target_link_libraries(RootReconstruction PUBLIC AlgColle.so)
target_link_libraries(RootReconstruction PUBLIC libOpenMeshCore.so)
target_link_libraries(RootReconstruction PUBLIC libOpenMeshTools.so)
target_link_libraries(RootReconstruction PUBLIC DataColle.so)
target_link_libraries(RootReconstruction PUBLIC AdditionalLibs.so)
target_link_libraries(RootReconstruction PUBLIC ${OpenCV_LIBS} )

endif()


