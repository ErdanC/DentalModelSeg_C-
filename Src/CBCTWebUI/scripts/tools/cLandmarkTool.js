CLandmarkTool= function () {
    CContext.glViewContainer.addEventListener('mousedown', CLandmarkTool.OnMouseDown);
    CContext.glViewContainer.addEventListener('mouseup', CLandmarkTool.OnMouseUp);
    CContext.glViewContainer.addEventListener('mousemove', CLandmarkTool.OnMouseMove);
}
CLandmarkTool.isLButtonDown = false;
CLandmarkTool.isRButtonDown = false;
CLandmarkTool.InitTool = function () {
    CLandmarkTool();
  

}

CLandmarkTool.PickLandmark = function (mousepos) {

    if (CLandmarkTool.isLButtonDown) {
        var glMousePos = CManipulationTool.Mouse2GlProjPos(mousepos);
        var meshArray = CContext.scene.GetMeshArray();
        var intersects = CContext.scene.PickMeshs(glMousePos, CContext.viewer.camera);
        var minDis = Number.MAX_VALUE;
        var mi = -1;
        for (var i = 0; i < intersects.length; i++) {
            if (minDis > intersects[i].distance) {
                minDis = intersects[i].distance;
                mi = i;
            }
        }

        if (mi == -1)
            CContext.selectedMesh = null;
        else {
            CContext.selectedMesh = intersects[mi].object;
            CContext.selectedMesh.material.color.set(0xdddd00);
            var geometry = new THREE.SphereGeometry(0.006, 20, 20, 0, Math.PI * 2, 0, Math.PI * 2);
            var material = new THREE.MeshPhongMaterial({ color: 0x0000ff, specular: 0xaaaaaa, shininess: 0, wireframe: false, shading: THREE.SmoothShading, side: THREE.DoubleSide });
            var sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(intersects[mi].point.x, intersects[mi].point.y, intersects[mi].point.z);
            sphere.updateMatrix();
            sphere.type = 'surfacelandmark';
            CContext.scene.AddMeshObject(sphere);
        }
    }
    else if (CLandmarkTool.isRButtonDown) {
        var pdata = CContext.viewer.ReadVolumeDataFrontTexCoordRenderTargetPixel(mousepos);
        if (pdata != undefined && pdata != null) {
            var voxelCoord = new THREE.Vector3(pdata.pixel[0], pdata.pixel[1], pdata.pixel[2]);
            var volumeDataObject = CContext.scene.GetVolumeDataObject(pdata.key);
            var loc = volumeDataObject.GetLocalCoordFrom3dTexCoord(voxelCoord);

            var geometry = new THREE.SphereGeometry(0.006, 20, 20, 0, Math.PI * 2, 0, Math.PI * 2);
            var material = new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0xaaaaaa, shininess: 0, wireframe: false, shading: THREE.SmoothShading, side: THREE.DoubleSide });
            var sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(loc.x, loc.y, loc.z);
            sphere.updateMatrix();
            sphere.type = 'volumelandmark';
            CContext.scene.AddMeshObject(sphere);
        }
       
    }
   

}

CLandmarkTool.OnMouseDown = function (e) {
    if (CToolManager.currentActiontype == 'LandmarkPicking') {
        var mousepos = new THREE.Vector2(e.clientX, e.clientY);
       
        var glpos = CManipulationTool.Mouse2GlPos(mousepos);
        if (event.button == 0) {//left button{
            CLandmarkTool.isLButtonDown = true;
            CLandmarkTool.PickLandmark(mousepos);

        }
        else if (event.button == 2) {//right button{
            CLandmarkTool.isRButtonDown = true;
            CLandmarkTool.PickLandmark(mousepos);

        }
    }
}


CLandmarkTool.OnMouseMove = function (e) {
    if (CToolManager.currentActiontype == 'LandmarkPicking') {
        var mousepos = new THREE.Vector2(e.clientX, e.clientY);
        if (CLandmarkTool.isLButtonDown) {
           
        }
    }
}
CLandmarkTool.OnMouseUp = function (e) {
    if (CToolManager.currentActiontype == 'LandmarkPicking') {
        if (event.button == 0) {//left button{
            CLandmarkTool.isLButtonDown = false;
        }
        else if (event.button ==2) {//right button{
            CLandmarkTool.isRButtonDown = false;
        }
    }
}