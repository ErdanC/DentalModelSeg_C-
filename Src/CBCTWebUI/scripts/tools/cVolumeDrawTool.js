CVolumeDrawTool = function () {
    CContext.glViewContainer.addEventListener('mousedown', CVolumeDrawTool.OnMouseDown);
    CContext.glViewContainer.addEventListener('mouseup', CVolumeDrawTool.OnMouseUp);
    CContext.glViewContainer.addEventListener('mousemove', CVolumeDrawTool.OnMouseMove);

}
CVolumeDrawTool.isLButtonDown = false;
CVolumeDrawTool.InitTool = function () {
    CVolumeDrawTool();
    CVolumeDrawTool.drawedVoxels = new Array();
    
   
}
CVolumeDrawTool.OnMouseDown = function (e) {
    if (CToolManager.currentActiontype == 'VolumeDraw') {
        var mousepos = new THREE.Vector2(e.clientX, e.clientY);
        if (event.button == 0) {//left button{
            CVolumeDrawTool.isLButtonDown = true;
            CVolumeDrawTool.drawedVoxels = new Array();
            CVolumeDrawTool.lineMaterial = new THREE.LineBasicMaterial({
                color: 0x0000ff
            });

            CVolumeDrawTool.lineGeo = new THREE.Geometry();
            CVolumeDrawTool.line = new THREE.Line(CVolumeDrawTool.lineGeo.clone(), CVolumeDrawTool.lineMaterial);
            //CVolumeDrawTool.line.type = 'line';
            //CVolumeDrawTool.line.dynamic = true;
           

        }
    }
}

CVolumeDrawTool.DrawVoxel=function(mousepos){
    var pdata = CContext.viewer.ReadVolumeDataFrontTexCoordRenderTargetPixel(mousepos);
    if (pdata != null) {
        var tx = pdata.pixel[0];
        var ty = pdata.pixel[1];
        var tz = pdata.pixel[2];
        if (tx >= 0 && tx <= 1 && ty >= 0 && ty <= 1 && tz >= 0 && tz <= 1) {//in volume

            var v = new Object();
            v.voxelCoord = new THREE.Vector3(tx, ty, tz);
            v.value = 100;
            v.key = pdata.key;
            CVolumeDrawTool.drawedVoxels.push(v);
            var cvolumeDataObject = CContext.scene.GetVolumeDataObject(pdata.key);
            CVolumeDrawTool.lineGeo.vertices.push(cvolumeDataObject.GetLocalCoordFrom3dTexCoord(v.voxelCoord));
     
            if (CVolumeDrawTool.drawedVoxels.length >= 2) {
                CContext.scene.RemoveAuxObject(CVolumeDrawTool.line);
                CVolumeDrawTool.line = new THREE.Line(CVolumeDrawTool.lineGeo.clone(), CVolumeDrawTool.lineMaterial);
                CContext.scene.AddAuxObject(CVolumeDrawTool.line);
            }
            

        }
    }
}

CVolumeDrawTool.OnMouseMove = function (e) {
    if (CToolManager.currentActiontype == 'VolumeDraw') {
        var mousepos = new THREE.Vector2(e.clientX, e.clientY);
        if (CVolumeDrawTool.isLButtonDown && CVolumeDrawTool.line != undefined) {
            CVolumeDrawTool.DrawVoxel(mousepos);
        }
    }
}
CVolumeDrawTool.OnMouseUp = function (e) {
    if (CToolManager.currentActiontype == 'VolumeDraw') {
        if (event.button == 0) {//left button{
            if (CVolumeDrawTool.isLButtonDown && CVolumeDrawTool.drawedVoxels.length > 1) {
                //send drawedVoxels back to server to get the result
                //var volumeDataObject = CContext.scene.GetVolumeDataObject(CVolumeDrawTool.drawedVoxels[0].key);
                //var material = new THREE.LineBasicMaterial({
                //    color: 0x0000ff
                //});

                //var geometry = new THREE.Geometry();
                //for (var i = 0; i < CVolumeDrawTool.drawedVoxels.length; i++) {
                //    var v = CVolumeDrawTool.drawedVoxels[i];
                //    geometry.vertices.push(volumeDataObject.GetLocalCoordFrom3dTexCoord(v.voxelCoord));
                //}
              

                //var line = new THREE.Line(geometry, material);
                //line.type = 'line';
                //CContext.scene.AddAuxObject(line);


                //var volumeDataObject = CContext.scene.GetVolumeDataObject(CVolumeDrawTool.drawedVoxels[0].key);
                //volumeDataObject.UpdateVolumeDataFlagUsingNormalizeCoord(CVolumeDrawTool.drawedVoxels);
                //CVolumeDrawTool.drawedVoxels = new Array();
            }
            CVolumeDrawTool.isLButtonDown = false;
        }
    }
}