
set(DATA_COLLE_INC_FILES
	prereq.h
	custom_openmesh_type.h
	geodesic_type.h
	aux_geo_utils.h
	geo_primit.h
	base_object.h
	cgal_igl_converter.h
	curve_object.h
	mesh_object.h
	data_io.h
	data_pool.h
	obb_type.h
	Polyhedron_type_fwd.h
	Polyhedron_type.h

	)

set(DATA_COLLE_SRC_FILES
	data_pool.cpp
	data_io.cpp
	cgal_igl_converter.cpp
	mesh_object.cpp
	geo_primit.cpp
	base_object.cpp
	aux_geo_utils.cpp
    	geodesic_type.cpp
	curve_object.cpp
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
include_directories("$ENV{EMBREE_DIR}/include")

else()
include_directories(${PROJECT_SOURCE_DIR})
include_directories($ENV{TEIGEN_ROOT})
include_directories($ENV{TLIBIGL_INCLDUEDIR})
include_directories($ENV{TLIBIGL_DIR})
include_directories($ENV{TOPEN_MESH_DIR}/src)




endif()


if(MSVC)
link_directories(${PROJECT_BINARY_DIR}/lib)
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
link_directories($ENV{TCGAL_BUILD}/lib)
link_directories($ENV{TCGAL_DIR}/auxiliary/gmp/lib)
link_directories($ENV{TOPEN_MESH_DIR}/lib)
link_directories($ENV{EMBREE_DIR}/lib)
link_directories(D:/Embree v2.15.0 x64/lib)
else()
link_directories(${PROJECT_BINARY_DIR}/lib)
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
link_directories($ENV{TOPEN_MESH_DIR}/build/Build/lib)
endif()

add_library(DataColle SHARED ${DATA_COLLE_INC_FILES} ${DATA_COLLE_SRC_FILES})



if(MSVC)
add_definitions(-DNDEBUG)
add_definitions(-D_WINDOWS)
add_definitions(-D_USRDLL)
add_definitions(-DDATACOLLE_EXPORTS)
add_definitions(-D_CRT_SECURE_NO_WARNINGS)
add_definitions(-DCGAL_EIGEN3_ENABLED)
add_definitions(-DUSE_FORWARD_DECL)
add_definitions(-D_USE_MATH_DEFINES)
add_definitions(-D_SCL_SECURE_NO_WARNINGS)
add_definitions(-DOM_STATIC_BUILD)
else()
add_definitions(-DNDEBUG)
add_definitions(-D_USRDLL)
add_definitions(-DDATACOLLE_EXPORTS)
add_definitions(-D_CRT_SECURE_NO_WARNINGS)
add_definitions(-DCGAL_EIGEN3_ENABLED)
add_definitions(-DUSE_FORWARD_DECL)
add_definitions(-D_USE_MATH_DEFINES)
add_definitions(-D_SCL_SECURE_NO_WARNINGS)
add_definitions(-DOM_STATIC_BUILD)
endif()


if(MSVC)
target_link_libraries(DataColle PUBLIC CGAL_Core-vc140-mt-4.9.lib)
target_link_libraries(DataColle PUBLIC CGAL_ImageIO-vc140-mt-4.9.lib)
target_link_libraries(DataColle PUBLIC CGAL_Qt5-vc140-mt-4.9.lib)
target_link_libraries(DataColle PUBLIC CGAL-vc140-mt-4.9.lib)
target_link_libraries(DataColle PUBLIC libgmp-10.lib)
target_link_libraries(DataColle PUBLIC libmpfr-4.lib)
target_link_libraries(DataColle PUBLIC OpenMeshCore.lib)
target_link_libraries(DataColle PUBLIC OpenMeshTools.lib)

else()
target_link_libraries(DataColle PUBLIC libCGAL_Core.so)
target_link_libraries(DataColle PUBLIC libCGAL_ImageIO.so)
target_link_libraries(DataColle PUBLIC libCGAL_Qt5.so)
target_link_libraries(DataColle PUBLIC libCGAL.so)
target_link_libraries(DataColle PUBLIC libgmp.so)
target_link_libraries(DataColle PUBLIC libmpfr.so)
target_link_libraries(DataColle PUBLIC libOpenMeshCore.so)
target_link_libraries(DataColle PUBLIC libOpenMeshTools.so)
endif()
