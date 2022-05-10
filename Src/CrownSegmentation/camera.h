// Copyright 2016_9 by ChenNenglun
#ifndef CCAMERA_H
#define CCAMERA_H
#include"QGLViewer/camera.h"
#include<Eigen/Dense>
#include"../DataColle/mesh_object.h"
class CCamera :public qglviewer::Camera
{
private:
	CCamera(const qglviewer::Camera &b) {// qglviewer::Camera::Camera(b); 
	};
public:
	CCamera();
	CCamera(const CCamera& c);
	CCamera & operator=(const CCamera &b);
	void ConvertClickToLine(QPoint p, OpenMesh::Vec3d &orig, OpenMesh::Vec3d &dir);
	qreal zNear() const { return 0.001; };
	qreal zFar() const { return 100.0; };
	

};

#endif
