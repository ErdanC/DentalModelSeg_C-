#pragma once

#ifdef _WIN32

	#pragma warning(disable: 4251)

	#ifdef DATACOLLE_EXPORTS
		#define DATACOLLE_API extern "C" __declspec(dllexport)
		#define DATACOLLE_CLASS __declspec(dllexport)
	#else
		#define DATACOLLE_API extern "C" __declspec(dllimport)
		#define DATACOLLE_CLASS __declspec(dllimport)
	#endif

#else
	#ifdef DATACOLLE_EXPORTS
		#define DATACOLLE_API
		#define DATACOLLE_CLASS 
	#else
		#define DATACOLLE_API 
		#define DATACOLLE_CLASS 
	#endif

#endif


