#pragma once
#pragma warning(disable: 4251)




#ifdef _WIN32

#pragma warning(disable: 4251)

#ifdef MANAGER_EXPORTS
#define MANAGER_API extern "C" __declspec(dllexport)
#define MANAGER_CLASS __declspec(dllexport)
#else
#define MANAGER_API extern "C" __declspec(dllimport)
#define MANAGER_CLASS __declspec(dllimport)
#endif

#else
#ifdef MANAGER_EXPORTS
#define MANAGER_API
#define MANAGER_CLASS 
#else
#define MANAGER_API 
#define MANAGER_CLASS 
#endif

#endif