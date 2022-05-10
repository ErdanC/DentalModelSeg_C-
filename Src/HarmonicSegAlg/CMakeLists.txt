
set(HARMONIC_SEG_ALG_INC_FILES

	harmonic_field.h
	prereq.h
	crown_seg_algs.h
	)

set(HARMONIC_SEG_ALG_SRC_FILES

	harmonic_field.cpp
	crown_seg_algs.cpp

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



add_library(HarmonicSegAlg SHARED ${HARMONIC_SEG_ALG_SRC_FILES})


if(MSVC)
add_definitions(-DNDEBUG)
add_definitions(-D_WINDOWS)
add_definitions(-D_USRDLL)
add_definitions(-DHARMONICSEGALG_EXPORTS)
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
add_definitions(-DHARMONICSEGALG_EXPORTS)
add_definitions(-D_CRT_SECURE_NO_WARNINGS)
add_definitions(-DCGAL_EIGEN3_ENABLED)
add_definitions(-DUSE_FORWARD_DECL)
add_definitions(-D_USE_MATH_DEFINES)
add_definitions(-DINCLUDE_TEMPLATES)
add_definitions(-DCGAL_USE_MPFR)
add_definitions(-DCGAL_USE_GMP)
endif()







if(MSVC)
target_link_libraries(HarmonicSegAlg PUBLIC CGAL_ImageIO-vc140-mt-4.9.lib)
target_link_libraries(HarmonicSegAlg PUBLIC CGAL_Qt5-vc140-mt-4.9.lib)
target_link_libraries(HarmonicSegAlg PUBLIC CGAL-vc140-mt-4.9.lib)
target_link_libraries(HarmonicSegAlg PUBLIC CGAL_Core-vc140-mt-4.9.lib)
target_link_libraries(HarmonicSegAlg PUBLIC libgmp-10.lib)
target_link_libraries(HarmonicSegAlg PUBLIC libmpfr-4.lib)
target_link_libraries(HarmonicSegAlg PUBLIC DataColle.lib)
target_link_libraries(HarmonicSegAlg PUBLIC AlgColle.lib)
target_link_libraries(HarmonicSegAlg PUBLIC AdditionalLibs.lib)
target_link_libraries(HarmonicSegAlg PUBLIC opencv_world310.lib)
target_link_libraries(HarmonicSegAlg PUBLIC OpenMeshTools.lib)
target_link_libraries(HarmonicSegAlg PUBLIC OpenMeshCore.lib)
else()
target_link_libraries(HarmonicSegAlg PUBLIC libCGAL_Core.so)
target_link_libraries(HarmonicSegAlg PUBLIC libCGAL_ImageIO.so)
target_link_libraries(HarmonicSegAlg PUBLIC libCGAL_Qt5.so)
target_link_libraries(HarmonicSegAlg PUBLIC libCGAL.so)
target_link_libraries(HarmonicSegAlg PUBLIC libgmp.so)
target_link_libraries(HarmonicSegAlg PUBLIC libmpfr.so)
target_link_libraries(HarmonicSegAlg PUBLIC AlgColle.so)
target_link_libraries(HarmonicSegAlg PUBLIC libOpenMeshCore.so)
target_link_libraries(HarmonicSegAlg PUBLIC libOpenMeshTools.so)
target_link_libraries(HarmonicSegAlg PUBLIC DataColle.so)
target_link_libraries(HarmonicSegAlg PUBLIC AdditionalLibs.so)
target_link_libraries(HarmonicSegAlg PUBLIC ${OpenCV_LIBS} )

endif()


