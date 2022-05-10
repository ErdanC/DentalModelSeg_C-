#pragma once
#pragma warning(disable: 4251)


#ifdef _WIN32

	#pragma warning(disable: 4251)
	#ifdef ROOTRECONSTRUCTIONALG_EXPORTS
		#define ROOTRECONSTRUCTIONALG_API extern "C" __declspec(dllexport)
		#define ROOTRECONSTRUCTIONALG_CLASS __declspec(dllexport)
	#else
		#define HARMONICSEGALG_API extern "C" __declspec(dllimport)
		#define ROOTRECONSTRUCTIONALG_CLASS __declspec(dllimport)
	#endif

#else
	#ifdef ROOTRECONSTRUCTIONALG_EXPORTS
		#define ROOTRECONSTRUCTIONALG_API
		#define ROOTRECONSTRUCTIONALG_CLASS 
	#else
		#define ROOTRECONSTRUCTIONALG_API 
		#define ROOTRECONSTRUCTIONALG_CLASS 
	#endif

#endif

