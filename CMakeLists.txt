cmake_minimum_required(VERSION 3.1.2)

SET(CROWNSEGMENTATION_VERSION_MAJOR 1)
SET(CROWNSEGMENTATION_VERSION_MINOR 0)
SET(CROWNSEGMENTATION_VERSION_PATCH 0)
SET(CROWNSEGMENTATION_VERSION_NOTE "")
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

SET(CROWNSEGMENTATION_VERSION ${CROWNSEGMENTATION_VERSION_MAJOR}.${CROWNSEGMENTATION_VERSION_MINOR}.${CROWNSEGMENTATION_VERSION_PATCH})
MATH(EXPR CROWNSEGMENTATION_VERSION_NUMBER "10000*${CROWNSEGMENTATION_VERSION_MAJOR} + 100*${CROWNSEGMENTATION_VERSION_MINOR} + ${CROWNSEGMENTATION_VERSION_PATCH}")
SET(CPACK_RPM_PACKAGE_RELEASE 1)

project(CrownSegmentation)

set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${PROJECT_SOURCE_DIR}/cmake")

### Compilation flags: adapt to your needs ###
if(MSVC)
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /MP /bigobj /w") ### Enable parallel compilation
	set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG ${CMAKE_BINARY_DIR} )
	set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE ${CMAKE_BINARY_DIR} )
else()
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11") #### crown segmentation requires a modern C++ compiler that supports c++11
	set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "../" )
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wno-deprecated-declarations -Wno-unused-parameter -Wno-deprecated-register -Wno-return-type-c-linkage")
	set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wno-deprecated-declarations -Wno-unused-parameter -Wno-deprecated-register -Wno-return-type-c-linkage")
endif()





set(CMAKE_LIBRARY_PATH ${CMAKE_LIBRARY_PATH}
	${PROJECT_SOURCE_DIR}/lib
	)

set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CROWNSEGMENTATION_RUNTIME_DIR ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG ${CROWNSEGMENTATION_RUNTIME_DIR}/Debug)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE ${CROWNSEGMENTATION_RUNTIME_DIR}/Release)

MESSAGE("ARCHIVE OUTPUT DIRECTORY ${CMAKE_ARCHIVE_OUTPUT_DIRECTORY}")
MESSAGE("LIBRARY OUTPUT DIRECTORY ${CMAKE_LIBRARY_OUTPUT_DIRECTORY}")
MESSAGE("RUNTIME OUTPUT DIRECTORY ${CROWNSEGMENTATION_RUNTIME_DIR}")



#find_library(TRIANGLE_LIB NAMES triangle.lib)
### macro definition ###
set(AdditionalLibsDir "${PROJECT_SOURCE_DIR}/Src/AdditionalLibs/")
set(DataColleDir "${PROJECT_SOURCE_DIR}/Src/DataColle/")
set(AlgColleDir "${PROJECT_SOURCE_DIR}/Src/AlgColle/")
set(HarmonicSegAlgDir "${PROJECT_SOURCE_DIR}/Src/HarmonicSegAlg/")
set(RootReconstructionDir "${PROJECT_SOURCE_DIR}/Src/RootReconstruction/")
set(Manager "${PROJECT_SOURCE_DIR}/Src/Manager/")
set(CrownSegmentation "${PROJECT_SOURCE_DIR}/Src/CrownSegmentation/")
set(CrownSegmentationPython "${PROJECT_SOURCE_DIR}/Src/CrownSegmentationPython/")

add_subdirectory(${AdditionalLibsDir})
add_subdirectory(${DataColleDir})
add_subdirectory(${AlgColleDir})
add_subdirectory(${HarmonicSegAlgDir})
add_subdirectory(${RootReconstructionDir})
add_subdirectory(${Manager})
add_subdirectory(${CrownSegmentation})
add_subdirectory(${CrownSegmentationPython})
