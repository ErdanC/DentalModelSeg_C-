
if(MSVC)



set(CMAKE_INCLUDE_CURRENT_DIR ON)

set(CMAKE_POSITION_INDEPENDENT_CODE ON)

find_package( Qt5Core REQUIRED )
find_package( Qt5Widgets REQUIRED )
find_package( Qt5Gui REQUIRED )
find_package( Qt5OpenGL REQUIRED )
find_package( Qt5Xml REQUIRED )


 if(Qt5Widgets_FOUND)
     MESSAGE(STATUS "Found Qt ${Qt5Widgets_VERSION_STRING}")

    if(UNIX AND NOT APPLE AND "${CMAKE_SYSTEM_PROCESSOR}" STREQUAL "x86_64")
        # FIX: Qt was built with -reduce-relocations
        add_definitions(-fPIC)
    endif() 
    # FIX: Qt was built with -reduce-relocations
    if (Qt5_POSITION_INDEPENDENT_CODE)
       SET(CMAKE_POSITION_INDEPENDENT_CODE ON)
    endif()
endif()



qt5_generate_moc("action_base.h"  "${CMAKE_CURRENT_BINARY_DIR}/moc_action_base.cpp" )
qt5_wrap_ui( Imface_UI_FILE imface.ui )
qt5_add_resources( Imface_RESOURCE_FILES imface.qrc )




set(CROWN_SEG_INC_FILES
	
	imface_window.h
	cmodelviewer.h
	cvmatandqimage.h
	manipulation_action.h
	hot_key_action.h
	harmonic_field_segmentation_action.h
	new_harmonic_field_segmentation_action.h
	action_manager.h
	action_base.h
	scene.h
	ui_context.h
	texture_wrapper.h
	scene_curve_object.h
	scene_mesh_object.h
	camera.h
	visual_utils.h
	ui_imface.h
    root_reconstruction_action.h
	feature_point_action.h
	#${Imface_UI_FILE}
	)



set(CROWN_SEG_SRC_FILES
moc_action_base.cpp
	main.cpp
	imface_window.cpp
	cmodelviewer.cpp
	action_manager.cpp
	harmonic_field_segmentation_action.cpp
	auto_harmonic_field_segmentation_action.cpp
	new_harmonic_field_segmentation_action.cpp
	hot_key_action.cpp
	manipulation_action.cpp
	ui_context.cpp
	scene.cpp
	scene_mesh_object.cpp
	scene_curve_object.cpp
	texture_wrapper.cpp
	cvmatandqimage.cpp
	camera.cpp
	visual_utils.cpp
	qrc_imface.cpp
	feature_point_action.cpp
    root_reconstruction_action.cpp
	${CMAKE_CURRENT_BINARY_DIR}/moc_action_base.cpp
	#${Imface_RESOURCE_FILES}
	)
	


MESSAGE("CROWN_SEG_SRC_FILES ${CROWN_SEG_SRC_FILES}")
MESSAGE("CROWN_SEG_INC_FILES ${CROWN_SEG_INC_FILES}")
                   

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
include_directories("$ENV{TQTDIR}/include")
include_directories("$ENV{TQTDIR}/include/QtCore")
include_directories("$ENV{TQTDIR}/include/QtGui")
include_directories("$ENV{TQTDIR}/include/QtOpenGL")
include_directories("$ENV{TQTDIR}/include/QtWidgets")
include_directories("$ENV{TQGLVIEWER_DIR}")
include_directories("$ENV{TQTDIR}/include/QtXml")
include_directories("${PROJECT_SOURCE_DIR}/GeneratedFiles")
include_directories("${PROJECT_SOURCE_DIR}/GeneratedFiles")
include_directories("$ENV{TANN_DIR}/include")



link_directories(${PROJECT_BINARY_DIR}/lib)
link_directories(${PROJECT_BINARY_DIR}/lib/Release)
link_directories($ENV{TCGAL_BUILD}/lib)
link_directories($ENV{TCGAL_DIR}/auxiliary/gmp/lib)
link_directories($ENV{TOPEN_MESH_DIR}/lib)
link_directories($ENV{TOPENCV_DIR}/x64/vc14/lib)
link_directories($ENV{TQGLVIEWER_DIR}/QGLViewer)
link_directories($ENV{TQTDIR}/lib)




add_executable(CrownSegmentation ${CROWN_SEG_INC_FILES} ${CROWN_SEG_SRC_FILES} )



add_definitions(-DUNICODE)
add_definitions(-DWIN32)
add_definitions(-DQT_NO_DEBUG)
add_definitions(-DNDEBUG)
add_definitions(-DQT_CORE_LIB)
add_definitions(-DQT_GUI_LIB)
add_definitions(-DQT_OPENGL_LIB)
add_definitions(-DQT_WIDGETS_LIB)
add_definitions(-DQT_XML_LIB)
add_definitions(-D_USE_MATH_DEFINES)
add_definitions(-DCGAL_EIGEN3_ENABLED)
add_definitions(-DUSE_FORWARD_DECL)
add_definitions(-DINCLUDE_TEMPLATES)
add_definitions(-DCGAL_USE_MPFR)
add_definitions(-DCGAL_USE_GMP)
add_definitions(-DOM_STATIC_BUILD)
add_definitions(-DQT_DLL)



target_link_libraries(CrownSegmentation PUBLIC CGAL_Core-vc140-mt-4.9.lib)
target_link_libraries(CrownSegmentation PUBLIC CGAL_ImageIO-vc140-mt-4.9.lib)
target_link_libraries(CrownSegmentation PUBLIC CGAL_Qt5-vc140-mt-4.9.lib)
target_link_libraries(CrownSegmentation PUBLIC CGAL-vc140-mt-4.9.lib)
target_link_libraries(CrownSegmentation PUBLIC libgmp-10.lib)
target_link_libraries(CrownSegmentation PUBLIC libmpfr-4.lib)
target_link_libraries(CrownSegmentation PUBLIC OpenMeshCore.lib)
target_link_libraries(CrownSegmentation PUBLIC OpenMeshTools.lib)
target_link_libraries(CrownSegmentation PUBLIC opencv_world310.lib)
target_link_libraries(CrownSegmentation PUBLIC OpenMeshTools.lib)
target_link_libraries(CrownSegmentation PUBLIC OpenMeshCore.lib)
target_link_libraries(CrownSegmentation PUBLIC DataColle.lib)
target_link_libraries(CrownSegmentation PUBLIC AlgColle.lib)
target_link_libraries(CrownSegmentation PUBLIC AdditionalLibs.lib)
target_link_libraries(CrownSegmentation PUBLIC HarmonicSegAlg.lib)
target_link_libraries(CrownSegmentation PUBLIC Manager.lib)
target_link_libraries(CrownSegmentation PUBLIC qtmain.lib)
target_link_libraries(CrownSegmentation PUBLIC Qt5Core.lib)
target_link_libraries(CrownSegmentation PUBLIC Qt5Gui.lib)
target_link_libraries(CrownSegmentation PUBLIC Qt5OpenGL.lib)
target_link_libraries(CrownSegmentation PUBLIC opengl32.lib)
target_link_libraries(CrownSegmentation PUBLIC glu32.lib)
target_link_libraries(CrownSegmentation PUBLIC Qt5Widgets.lib)
target_link_libraries(CrownSegmentation PUBLIC QGLViewer2.lib)
target_link_libraries(CrownSegmentation PUBLIC Qt5Xml.lib)
target_link_libraries(CrownSegmentation PUBLIC RootReconstruction.lib)


else()#########################################################################
if(POLICY CMP0043)
  cmake_policy(SET CMP0043 OLD)
endif()

	set(CMAKE_INCLUDE_CURRENT_DIR ON)

	set(CMAKE_POSITION_INDEPENDENT_CODE ON)

	find_package(CGAL COMPONENTS Qt5)
	include(${CGAL_USE_FILE})
	find_package(Qt5 QUIET COMPONENTS Xml Script OpenGL Svg)
	find_package(OpenCV REQUIRED)

	qt5_generate_moc("action_base.h"  "${CMAKE_CURRENT_BINARY_DIR}/moc_action_base.cpp" )
	qt5_wrap_ui( Imface_UI_FILE imface.ui )
	qt5_add_resources( Imface_RESOURCE_FILES imface.qrc )




	set(CROWN_SEG_INC_FILES
	
	imface_window.h
	cmodelviewer.h
	cvmatandqimage.h
	manipulation_action.h
	hot_key_action.h
	harmonic_field_segmentation_action.h
	auto_harmonic_field_segmentation_action.h
	new_harmonic_field_segmentation_action.h
	action_manager.h
	action_base.h
	scene.h
	ui_context.h
	texture_wrapper.h
	scene_curve_object.h
	scene_mesh_object.h
	camera.h
	visual_utils.h
	ui_imface.h
	#${Imface_UI_FILE}
	)



	set(CROWN_SEG_SRC_FILES
	moc_action_base.cpp
	main.cpp
	imface_window.cpp
	cmodelviewer.cpp
	action_manager.cpp
	harmonic_field_segmentation_action.cpp
	auto_harmonic_field_segmentation_action.cpp
	new_harmonic_field_segmentation_action.cpp
	hot_key_action.cpp
	manipulation_action.cpp
	ui_context.cpp
	scene.cpp
	scene_mesh_object.cpp
	scene_curve_object.cpp
	texture_wrapper.cpp
	cvmatandqimage.cpp
	camera.cpp
	visual_utils.cpp
	qrc_imface.cpp
	${CMAKE_CURRENT_BINARY_DIR}/moc_action_base.cpp
	#${Imface_RESOURCE_FILES}
	)
	



	include_directories(${PROJECT_SOURCE_DIR})
	include_directories(${PROJECT_SOURCE_DIR}/Src/CrownSegmentation)
	include_directories($ENV{TEIGEN_ROOT})
	include_directories($ENV{TLIBIGL_INCLDUEDIR})
	include_directories($ENV{TLIBIGL_DIR})
	include_directories($ENV{TOPEN_MESH_DIR}/include)
	include_directories($ENV{TCGAL_DIR}/include)
	include_directories($ENV{BOOST_INCLUDEDIR})
	include_directories($ENV{TCGAL_DIR}/auxiliary/gmp/include)
	include_directories($ENV{TCGAL_BUILD}/include)
	include_directories($ENV{TOPENCV_DIR}/include)
	include_directories($ENV{TQTDIR}/include)
	include_directories($ENV{TQTDIR}/include/QtCore)
	include_directories($ENV{TQTDIR}/include/QtGui)
	include_directories($ENV{TQTDIR}/include/QtOpenGL)
	include_directories($ENV{TQTDIR}/include/QtWidgets)
	include_directories($ENV{TQGLVIEWER_DIR})
	include_directories($ENV{TQTDIR}/include/QtXml)
	include_directories(${PROJECT_SOURCE_DIR}/GeneratedFiles)

	
	include_directories(${OpenCV_INCLUDE_DIRS})
	

	link_directories(${PROJECT_BINARY_DIR}/lib)
	link_directories(${PROJECT_BINARY_DIR}/lib/Release)
	link_directories($ENV{TOPEN_MESH_DIR}/build/Build/lib)
	link_directories($ENV{TQGLVIEWER_DIR}/QGLViewer)
	

	add_definitions(-DQT_NO_KEYWORDS)
	add_definitions(-DUNICODE)
	add_definitions(-DQT_NO_DEBUG)
	add_definitions(-DNDEBUG)
	add_definitions(-DQT_CORE_LIB)
	add_definitions(-DQT_GUI_LIB)
	add_definitions(-DQT_OPENGL_LIB)
	add_definitions(-DQT_WIDGETS_LIB)
	add_definitions(-DQT_XML_LIB)
	add_definitions(-D_USE_MATH_DEFINES)
	add_definitions(-DCGAL_EIGEN3_ENABLED)
	add_definitions(-DINCLUDE_TEMPLATES)
	add_definitions(-DCGAL_USE_MPFR)
	add_definitions(-DCGAL_USE_GMP)
	add_definitions(-DUSE_FORWARD_DECL)
	add_definitions(-DOM_STATIC_BUILD)


	

	add_executable(CrownSegmentation ${CROWN_SEG_INC_FILES} ${CROWN_SEG_SRC_FILES} )
	qt5_use_modules(CrownSegmentation Xml Widgets Script OpenGL Svg)
	add_to_cached_list( CGAL_EXECUTABLE_TARGETS CrownSegmentation )


	target_link_libraries( CrownSegmentation ${QT_LIBRARIES} )
	target_link_libraries( CrownSegmentation ${CGAL_LIBRARIES} ${CGAL_3RD_PARTY_LIBRARIES})
	target_link_libraries(CrownSegmentation  ${OpenCV_LIBS} )	
	
	target_link_libraries(CrownSegmentation  AlgColle.so)
	target_link_libraries(CrownSegmentation  libOpenMeshCore.so)
	target_link_libraries(CrownSegmentation  libOpenMeshTools.so)
	target_link_libraries(CrownSegmentation  DataColle.so)
	target_link_libraries(CrownSegmentation  HarmonicSegAlg.so)
	target_link_libraries(CrownSegmentation  AdditionalLibs.so)
	target_link_libraries(CrownSegmentation  Manager.so)
	target_link_libraries(CrownSegmentation  libQGLViewer-qt5.so)



		



	


endif()







