var CToolManager = function () {
   
    document.addEventListener('keydown', CToolManager.OnKeyPress);
    document.addEventListener('keyup', CToolManager.OnKeyUp);
    CManipulationTool.InitTool();
    CVolumeDrawTool.InitTool();
    CLandmarkTool.InitTool();
}
CToolManager.currentActiontype = 'ManipulateCamera';
CToolManager.OnKeyPress = function (e) {
    var keyCode = e.keyCode;
    //if (keyCode == 17) {//ctrl
    //    CToolManager.currentActiontype = 'ManipulateCamera';
    //}
    //else 
    if (keyCode == 18) {//alt
        CToolManager.currentActiontype = 'ManipulateMesh';
    }
    else if (keyCode == 66) {//reset camera key_b
        CContext.viewer.ResetCamera();
    }
    else if (keyCode == 68) {//key_d draw
        if (CToolManager.currentActiontype == 'VolumeDraw') {
            CToolManager.currentActiontype = 'ManipulateCamera'
        }
        else
        CToolManager.currentActiontype = 'VolumeDraw';
    }
    else if (keyCode == 80) {//key_p picklandmark
        if (CToolManager.currentActiontype == 'LandmarkPicking') {
            CToolManager.currentActiontype = 'ManipulateCamera'
        }
        else
            CToolManager.currentActiontype = 'LandmarkPicking';
    }
    else if (keyCode == 82) {//key_r toggle render style
        CContext.scene.ToggleRenderVolumeDataStyle();
    }
    else if (keyCode == 84) {//key_t toggle camera
        CContext.viewer.ToggleCamera();
    }
    else if (keyCode == 76) {//L




        var fname = 'resources/LowerJaw.stl';
        var loader = new THREE.STLLoader();
        loader.load(fname, function (geometry) {

            var material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xaaaaaa, shininess: 0, wireframe: false, shading: THREE.FlatShading, side: THREE.DoubleSide });
           
            var mesh = new THREE.Mesh(geometry, material);
            mesh.geometry.normalsNeedUpdate = true;
            //mesh.position.set(0, -0.25, 0.6);
            mesh.rotation.set(0, -Math.PI, 0);


            mesh.castShadow = true;
            mesh.receiveShadow = true;

            CContext.scene.AddMeshObject(mesh);

        });
    }
}
CToolManager.OnKeyUp = function (e) {
    var keyCode = e.keyCode;
    //if (keyCode == 17) {//ctrl
    //    CToolManager.currentActiontype = 'ManipulateCamera';
    //}
    //else 
    if (keyCode == 18) {//alt
        CToolManager.currentActiontype = 'ManipulateCamera';
    }
    
    
}