var CScene = function () {
    this.volumeDataObjects = {};
    this.volumeDataObjectId = 0;
    this.meshScene = new THREE.Scene();
    this.renderTarget = null;
    this.meshSceneDepth = new THREE.Scene();
    this.meshSceneDepth.renderTarget = new THREE.WebGLRenderTarget(CContext.glViewContainer.offsetWidth, CContext.glViewContainer.offsetHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType });

    this.depthRenderMaterial = new THREE.ShaderMaterial({


        vertexShader: LoadResource('shaders/depthRenderer.vert'),
        fragmentShader: LoadResource('shaders/depthRenderer.frag'),
        side: THREE.DoubleSide,
        transparent: false,
       

    });
    var ambient = new THREE.AmbientLight(0xaaaaaa);
    this.meshScene.add(ambient);
    var dirLight = new THREE.PointLight(0xffffff, 0.2);
    dirLight.position.set(100, 100, 50);
    this.meshScene.add(dirLight);

    this.raycaster = new THREE.Raycaster();

}
CScene.prototype.Render = function (renderer, camera) {
    renderer.autoClear = true;
 
    renderer.setClearColor(0xffffff);
    renderer.render(this.meshScene, camera, this.meshScene.renderTarget);
  
    renderer.state.buffers.depth.setClear(0xff);
    renderer.clearDepth();

 
   
    //renderer.render(this.meshSceneDepth, camera, null);
    renderer.setClearColor(0x000000);
  renderer.render(this.meshSceneDepth, camera, this.meshSceneDepth.renderTarget);

  
   for (var key in this.volumeDataObjects) {
       this.volumeDataObjects[key].SetEnvDepth(this.meshSceneDepth.renderTarget);
       this.volumeDataObjects[key].Render(renderer, camera);
   }
 
}
//mousepos(THREE.Vector2) is in image space
//return Array of [key,pixel(Vector4)]
CScene.prototype.ReadVolumeDataFrontTexCoordRenderTargetPixels = function (render, mousepos) {
    var parray = new Array();
    for (var key in this.volumeDataObjects) {
        var pixel = this.volumeDataObjects[key].ReadFrontTexCoordRenderTargetPixel(render, mousepos);
        var po = new Object();
        po.pixel = pixel;
        po.key = key;
        parray.push(po);
    }
    return parray;
}
//mousepos(THREE.Vector2) is in image space
//return  [key,pixel(Vector4)]
CScene.prototype.ReadVolumeDataFrontTexCoordRenderTargetPixel = function (render, mousepos) {
    var parray = this.ReadVolumeDataFrontTexCoordRenderTargetPixels(render, mousepos);
    var mi=-1;
    var mindepth = Number.MAX_VALUE;
    for (var i = 0; i < parray.length; i++) {
        var cdepth = parray[i].pixel[3];
        if (mindepth > cdepth) {
            mindepth = cdepth;
            mi = i;
        }
    }
    if (mi == -1) {
        return null;
    }
    else {
        return parray[mi];
    }
}

CScene.prototype.AddVolumeDataObject = function (volumeDataObject) {
    this.volumeDataObjects[this.volumeDataObjectId] = volumeDataObject;
    
    this.volumeDataObjectId++;
    return this.volumeDataObjectId;

}
CScene.prototype.GetVolumeDataObject = function (key) {
    return this.volumeDataObjects[key];
}
CScene.prototype.AddMeshObject = function (meshObject) {
    this.meshScene.add(meshObject);

    var mesh = meshObject.clone();
    mesh.material = this.depthRenderMaterial;
    meshObject.depthMesh = mesh;
    this.meshSceneDepth.add(mesh);

    //for (var key in meshObject.children) {
    //    var mesh = new THREE.Mesh(meshObject.children[key].geometry, this.depthRenderMaterial);
    //    this.meshSceneDepth.add(mesh);
    //}
 
  
}
CScene.prototype.AddAuxObject = function (auxObject) {
    this.meshScene.add(auxObject);

    var tauxobj = auxObject.clone();
    tauxobj.material = this.depthRenderMaterial;
    auxObject.depthMesh = tauxobj;
    this.meshSceneDepth.add(tauxobj);
}
CScene.prototype.RemoveAuxObject = function (auxObject) {
    this.meshScene.remove(auxObject);
}
//pick all intersected meshes.
//return intersections
CScene.prototype.PickMeshs = function (glMousePos, camera) {
    this.raycaster.setFromCamera(glMousePos, camera);

    var intersects = this.raycaster.intersectObjects(this.meshScene.children);
    return intersects;
   

}
CScene.prototype.SetRenderVolumeDataAsImage = function (flag) {
    for(var key in this.volumeDataObjects){
        this.volumeDataObjects[key].SetRenderAsImage(flag);
        

    }
}
CScene.prototype.ToggleRenderVolumeDataStyle = function () {//image or raycasting
    for (var key in this.volumeDataObjects) {
        this.volumeDataObjects[key].ToggleRenderType();
    }
}
CScene.prototype.GetMeshArray = function () {
    var meshArray = new Array();
    this.meshScene.traverse(function (node) {

        if (node instanceof THREE.Mesh) {
            meshArray.push(node);

        }

    });
    return meshArray;
}