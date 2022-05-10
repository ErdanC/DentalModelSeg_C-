// Copyright 2016_9 by ChenNenglun
#ifndef UI_CONTEXT_H
#define UI_CONTEXT_H
#include<iostream>
#include<map>
#include"../Manager/context.h"
class CScene;
class CMainWindow;
class TextureWraper;
class QImage;
class CUIContext
{
protected:
	static CScene* scene_;
	static CMainWindow* main_window_;
	static int selected_mesh_object_id_;
	static int color_stripe_texture_id_;
	static int color_bar_texture_id_;

public:
	static CMainWindow* GetMainWindow() { return main_window_; }
	static CScene* GetScene();
	static void Init();
	static int GetSelectedMeshObjectId();
	static void SetSelectedMeshObjectId(int id);
	static int &ColorStripeTextureId() { return color_stripe_texture_id_; }
	static int &ColorBarTextureId() { return color_bar_texture_id_; }
	static CManagerContext manager_context_;

	static std::map<int, TextureWraper*>textures_;
	static int max_textures_id_;
	static int AddTexture(QImage *texture);
	static bool DeleteTextures(int id);
	static TextureWraper* GetTexture(int id);



};
#endif