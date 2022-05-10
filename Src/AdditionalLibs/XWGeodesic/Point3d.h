// Point3D.h: interface for the CPoint3D class.
//
//////////////////////////////////////////////////////////////////////

#ifndef POINT_3D_H
#define POINT_3D_H
#include"../prereq.h"
#include <math.h>
#define _USE_MATH_DEFINES
#include <ostream>
#include <vector>
#include <algorithm>

using namespace std;

class ADDITIONALLIBS_CLASS CPoint3D
{
public:
	double x, y, z;
	CPoint3D();
	CPoint3D(double x, double y, double z);	
	inline CPoint3D& operator +=(const CPoint3D& pt);
	inline CPoint3D& operator -=(const CPoint3D& pt);
	inline CPoint3D& operator *=(double times);
	inline CPoint3D& operator /=(double times);
	inline CPoint3D Rotate() const;
	inline CPoint3D GetOrthogonalDir() const;
	inline double Len() const;
	inline void Normalize();
	bool operator==(const CPoint3D& other) const
	{
		return x == other.x && y == other.y && z == other.z;
	}
	bool operator<(const CPoint3D& other) const
	{
		if (x < other.x)
			return true;
		else if (x > other.x)
			return false;
		else if (y < other.y)
			return true;
		else if (y > other.y)
			return false;
		else if (z < other.z)
			return true;
		else if (z > other.z)
			return false;
		return false;
	}
	friend ostream& operator<<(ostream& out, const CPoint3D& pt)
	{
		out << pt.x << " " << pt.y << " " << pt.z << endl;
		return out;
	}
};
CPoint3D CPoint3D::Rotate() const
{
	return CPoint3D(z, x, y);
}

CPoint3D& CPoint3D::operator +=(const CPoint3D& pt)
{
	x += pt.x;
	y += pt.y;
	z += pt.z;
	return *this;
}

CPoint3D& CPoint3D::operator -=(const CPoint3D& pt)
{
	x -= pt.x;
	y -= pt.y;
	z -= pt.z;
	return *this;
}

CPoint3D& CPoint3D::operator *=(double times)
{
	x *= times;
	y *= times;
	z *= times;
	return *this;
}

CPoint3D& CPoint3D::operator /=(double times)
{
	x /= times;
	y /= times;
	z /= times;
	return *this;
}

double CPoint3D::Len() const
{
	return sqrt(x * x + y * y + z * z);
}

void CPoint3D::Normalize()
{
	double len = Len();
	x /= len;
	y /= len;
	z /= len;
}

CPoint3D CPoint3D::GetOrthogonalDir() const
{
	vector<double> vals;
	vals.push_back(x);
	vals.push_back(y);
	vals.push_back(z);
	int maxPos = max_element(vals.begin(), vals.end()) - vals.begin();
	int minPos = min_element(vals.begin(), vals.end()) - vals.begin();
	if (minPos == maxPos)
		minPos = (maxPos + 1) % 3;
	double tmp = vals[maxPos];
	vals[maxPos] = -vals[minPos];
	vals[minPos] = tmp;
	CPoint3D dir(vals[0], vals[1], vals[2]);
	dir.Normalize();
	return dir;
}

CPoint3D operator +(const CPoint3D& pt1, const CPoint3D& pt2);
CPoint3D operator -(const CPoint3D& pt1, const CPoint3D& pt2);
CPoint3D operator *(const CPoint3D& pt, double times);
CPoint3D operator /(const CPoint3D& pt, double times);
CPoint3D operator *(double times, const CPoint3D& pt);
CPoint3D operator *(const CPoint3D& pt1, const CPoint3D& pt2);
CPoint3D VectorCross(const CPoint3D& pt1, const CPoint3D& pt2, const CPoint3D& pt3);
double operator ^(const CPoint3D& pt1, const CPoint3D& pt2);
double GetTriangleArea(const CPoint3D& pt1, const CPoint3D& pt2, const CPoint3D& pt3);
double AngleBetween(const CPoint3D& pt1, const CPoint3D& pt2);
double AngleBetween(const CPoint3D& pt1, const CPoint3D& pt2, const CPoint3D& pt3);
void VectorCross(const float* u, const float* v, float * n);
float VectorDot(const float* u, const float* v);
float AngleBetween(const float* u, const float* v);
CPoint3D CombinePointAndNormalTo(const CPoint3D& pt, const CPoint3D& normal);
CPoint3D CombineTwoNormalsTo(const CPoint3D& pt1, double coef1, const CPoint3D& pt2, double coef2);	




#endif
