var CScene = function () {
 
    this.meshScene = new THREE.Scene();
    this.renderTarget = null;
 
  
    var ambient = new THREE.AmbientLight(0xaaaaaa);
    this.meshScene.add(ambient);
   var dirLight = new THREE.PointLight(0xffffff, 0.2);
   dirLight.position.set(0, 100, 0);
  
   this.meshScene.add(dirLight);

   var dirLight2 = new THREE.PointLight(0xffffff, 0.2);
   dirLight2.position.set(0, -100, 0);

   this.meshScene.add(dirLight2);
 
   var dirLight3 = new THREE.PointLight(0xffffff, 0.2);
   dirLight3.position.set(100, 0, 0);

   this.meshScene.add(dirLight3);

   var dirLight4 = new THREE.PointLight(0xffffff, 0.2);
   dirLight4.position.set(-100, 0, 0);

   this.meshScene.add(dirLight4);
   

    this.raycaster = new THREE.Raycaster();

}
CScene.prototype.Render = function (renderer, camera) {
    renderer.autoClear = true;
 
    renderer.setClearColor(0xffffff);
    renderer.render(this.meshScene, camera, this.meshScene.renderTarget);
  
   
 
}
CScene.prototype.ClearMeshObject=function()
{
    while (this.meshScene.children.length > 0) {
        this.meshScene.remove(this.meshScene.children[0]);
    }
}
CScene.prototype.AddMeshObject = function (meshObject) {
    this.meshScene.add(meshObject);

 
 
  
}
CScene.prototype.AddAuxObject = function (auxObject) {
    this.meshScene.add(auxObject);

   
}
CScene.prototype.RemoveAuxObject = function (auxObject) {
    this.meshScene.remove(auxObject);
}
//pick all intersected meshes.
//return intersections
CScene.prototype.PickNearestMesh = function (glProjMousePos, camera) {
    this.raycaster.setFromCamera(glProjMousePos, camera);
    var intersects = CContext.scene.PickMeshs(glProjMousePos, camera);
    console.log('hitnum' + intersects.length);
    if (intersects.length != 0)
    {
        var minDis = Number.MAX_VALUE;
        var mi = -1;
        for (var i = 0; i < intersects.length; i++) {
            if (minDis > intersects[i].distance) {
                minDis = intersects[i].distance;
                mi = i;
            }
        }
        return intersects[mi];
    }
    else {
        return null;
    }
  
}

CScene.prototype.PickMeshs = function (glProjMousePos, camera) {
    this.raycaster.setFromCamera(glProjMousePos, camera);

    var intersects = this.raycaster.intersectObjects(this.meshScene.children);
    return intersects;
   

}
CScene.prototype.PickMeshsByRay = function (ray) {
    this.raycaster.set(ray.origin, ray.direction);

    var intersects = this.raycaster.intersectObjects(this.meshScene.children);
    return intersects;


}
CScene.prototype.GetPickRay = function (glProjMousePos, camera) {
    this.raycaster.setFromCamera(glProjMousePos, camera);

   
    return this.raycaster.ray;


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