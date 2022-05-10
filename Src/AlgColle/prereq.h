#pragma once
#pragma warning(disable: 4251)


#ifdef _WIN32

	#pragma warning(disable: 4251)

	#ifdef ALGCOLLE_EXPORTS
		#define ALGCOLLE_API extern "C" __declspec(dllexport)
		#define ALGCOLLE_CLASS __declspec(dllexport)
	#else
		#define ALGCOLLE_API extern "C" __declspec(dllimport)
		#define ALGCOLLE_CLASS __declspec(dllimport)
	#endif

#else
	#ifdef ALGCOLLE_EXPORTS
		#define ALGCOLLE_API
		#define ALGCOLLE_CLASS 
	#else
		#define ALGCOLLE_API 
		#define ALGCOLLE_CLASS 
	#endif

#endif


