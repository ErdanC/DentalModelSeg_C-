
set(MANAGER_INC_FILES
	root_reconstruction_commands.h
	segmentation_functions.h
	context.h
	command_list.h
	command_base.h
	prereq.h

	)

set(MANAGER_SRC_FILES
        root_reconstruction_commands.cpp
	crown_seg_commands.cpp
	segmentation_functions.cpp
	context.cpp
	command_list.cpp

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
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
link_directories($ENV{TCGAL_BUILD}/lib)
link_directories($ENV{TCGAL_DIR}/auxiliary/gmp/lib)
link_directories($ENV{TOPEN_MESH_DIR}/lib)
link_directories($ENV{TOPENCV_DIR}/x64/vc14/lib)

else()
link_directories(${PROJECT_BINARY_DIR}/lib)
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
link_directories($ENV{TOPEN_MESH_DIR}/build/Build/lib)
endif()

add_library(Manager SHARED ${MANAGER_INC_FILES} ${MANAGER_SRC_FILES})



if(MSVC)
add_definitions(-DNDEBUG)
add_definitions(-D_WINDOWS)
add_definitions(-D_USRDLL)
add_definitions(-DMANAGER_EXPORTS)
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
add_definitions(-DMANAGER_EXPORTS)
add_definitions(-D_CRT_SECURE_NO_WARNINGS)
add_definitions(-DCGAL_EIGEN3_ENABLED)
add_definitions(-DUSE_FORWARD_DECL)
add_definitions(-D_USE_MATH_DEFINES)
add_definitions(-DINCLUDE_TEMPLATES)
add_definitions(-DCGAL_USE_MPFR)
add_definitions(-DCGAL_USE_GMP)
endif()



if(MSVC)
target_link_libraries(Manager PUBLIC CGAL_Core-vc140-mt-4.9.lib)
target_link_libraries(Manager PUBLIC CGAL_ImageIO-vc140-mt-4.9.lib)
target_link_libraries(Manager PUBLIC CGAL_Qt5-vc140-mt-4.9.lib)
target_link_libraries(Manager PUBLIC CGAL-vc140-mt-4.9.lib)
target_link_libraries(Manager PUBLIC libgmp-10.lib)
target_link_libraries(Manager PUBLIC libmpfr-4.lib)
target_link_libraries(Manager PUBLIC OpenMeshCore.lib)
target_link_libraries(Manager PUBLIC OpenMeshTools.lib)
target_link_libraries(Manager PUBLIC DataColle.lib)
target_link_libraries(Manager PUBLIC AlgColle.lib)
target_link_libraries(Manager PUBLIC AdditionalLibs.lib)
target_link_libraries(Manager PUBLIC HarmonicSegAlg.lib)
target_link_libraries(Manager PUBLIC opencv_world310.lib)
target_link_libraries(Manager PUBLIC OpenMeshTools.lib)
target_link_libraries(Manager PUBLIC OpenMeshCore.lib)
target_link_libraries(Manager PUBLIC RootReconstruction.lib)
else()
target_link_libraries(Manager PUBLIC libCGAL_Core.so)
target_link_libraries(Manager PUBLIC libCGAL_ImageIO.so)
target_link_libraries(Manager PUBLIC libCGAL_Qt5.so)
target_link_libraries(Manager PUBLIC libCGAL.so)
target_link_libraries(Manager PUBLIC libgmp.so)
target_link_libraries(Manager PUBLIC libmpfr.so)
target_link_libraries(Manager PUBLIC libOpenMeshCore.so)
target_link_libraries(Manager PUBLIC libOpenMeshTools.so)
target_link_libraries(Manager PUBLIC DataColle.so)
target_link_libraries(Manager PUBLIC AlgColle.so)
target_link_libraries(Manager PUBLIC AdditionalLibs.so)
target_link_libraries(Manager PUBLIC HarmonicSegAlg.so)
target_link_libraries(Manager PUBLIC ${OpenCV_LIBS} )

endif()







