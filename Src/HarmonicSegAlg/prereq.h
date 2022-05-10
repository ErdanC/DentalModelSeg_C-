#pragma once
#pragma warning(disable: 4251)


#ifdef _WIN32

	#pragma warning(disable: 4251)

	#ifdef HARMONICSEGALG_EXPORTS
		#define HARMONICSEGALG_API extern "C" __declspec(dllexport)
		#define HARMONICSEGALG_CLASS __declspec(dllexport)
	#else
		#define HARMONICSEGALG_API extern "C" __declspec(dllimport)
		#define HARMONICSEGALG_CLASS __declspec(dllimport)
	#endif

#else
	#ifdef HARMONICSEGALG_EXPORTS
		#define HARMONICSEGALG_API
		#define HARMONICSEGALG_CLASS 
	#else
		#define HARMONICSEGALG_API 
		#define HARMONICSEGALG_CLASS 
	#endif

#endif

