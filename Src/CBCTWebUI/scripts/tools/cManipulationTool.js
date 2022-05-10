var CManipulationTool = function () {
   // document.addEventListener('keydown', CManipulationTool.OnKeyPress);
   // document.addEventListener('keyup', CManipulationTool.OnKeyUp);
    CContext.glViewContainer.addEventListener('mousedown', CManipulationTool.OnMouseDown);
    CContext.glViewContainer.addEventListener('mouseup', CManipulationTool.OnMouseUp);
    CContext.glViewContainer.addEventListener('mousemove', CManipulationTool.OnMouseMove);
    CContext.glViewContainer.addEventListener('mousewheel', CManipulationTool.OnMouseWheel);

}
CManipulationTool.isLButtonDown = false;
CManipulationTool.isRButtonDown = false;

CManipulationTool.preMouseglPos = null;
CManipulationTool.preMousePos = null;//2d mousepos
CManipulationTool.controls =null;
//CManipulationTool.OnKeyPress = function (e) {
//    var keyCode = e.keyCode;
  
//}

//CManipulationTool.OnKeyUp = function (e) {
//    var keyCode = e.keyCode;
//}
CManipulationTool.InitTool = function () {
    CManipulationTool();
   CManipulationTool.controls = new THREE.TrackballControls(CContext.viewer.camera, CContext.glViewContainer);
   // CManipulationTool.controls.target0.set(0, 0, 0);
}
CManipulationTool.SelectMesh = function (glMousePos) {

    var meshArray = CContext.scene.GetMeshArray();
    for (var i = 0; i < meshArray.length; i++) {
        meshArray[i].material.color.set(0xffffff);
    }
    var intersects = CContext.scene.PickMeshs(glMousePos, CContext.viewer.camera);
    var minDis = Number.MAX_VALUE;
    var mi=-1;
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
    }
       
}

//projection space
CManipulationTool.Mouse2GlProjPos = function (mousePos) {
    var glprojpos = new THREE.Vector2();
    glprojpos.x = (mousePos.x / CContext.glViewContainer.offsetWidth) * 2 - 1;
    glprojpos.y = -(mousePos.y / CContext.glViewContainer.offsetHeight) * 2 + 1;
    return glprojpos;
}
CManipulationTool.Mouse2GlPos = function (mousePos) {
    var glprojpos = new THREE.Vector3();
    glprojpos.x = (mousePos.x / CContext.glViewContainer.offsetWidth) * 2 - 1;
    glprojpos.y = -(mousePos.y / CContext.glViewContainer.offsetHeight) * 2 + 1;
    glprojpos.z = 0;
    var glpos = glprojpos.clone();
    glpos.applyMatrix4(CContext.viewer.camera.matrixWorld);

    return glpos;
}
CManipulationTool.OnMouseDown = function (e) {
    if (CToolManager.currentActiontype == 'ManipulateMesh') {
        var mousepos = new THREE.Vector2(e.clientX, e.clientY);
        var glprojpos = CManipulationTool.Mouse2GlProjPos(mousepos);
        var glpos = CManipulationTool.Mouse2GlPos(mousepos);
        if (event.button == 0) {//left button{
            CManipulationTool.isLButtonDown = true;
       
           
        }
        else if (event.button == 2) {//right button
            CManipulationTool.isRButtonDown = true;
        }
       
        CManipulationTool.SelectMesh(glprojpos);
        CManipulationTool.preMouseglPos = glpos;
    }
    else if (CToolManager.currentActiontype == 'ManipulateCamera') {
        var mousepos = new THREE.Vector2(e.clientX, e.clientY);
       
        if (event.button == 0) {//left button{
            CManipulationTool.isLButtonDown = true;


        }
        else if (event.button == 2) {//right button
            CManipulationTool.isRButtonDown = true;
        }

        CManipulationTool.preMousePos = mousepos;
    }
}
CManipulationTool.OnMouseWheel = function (e) {
    
    if (CToolManager.currentActiontype == 'ManipulateMesh') {
        if (e.wheelDelta > 0) {//scale
            if (CContext.selectedMesh != null) {
                var preScale = CContext.selectedMesh.scale.clone();
                var scale = 1.1;
                CContext.selectedMesh.scale.set(preScale.x * scale, preScale.y * scale, preScale.z * scale);
                CContext.selectedMesh.updateMatrix();
                if (CContext.selectedMesh.depthMesh != undefined) {
                    CContext.selectedMesh.depthMesh.scale.set(preScale.x * scale, preScale.y * scale, preScale.z * scale);
                    CContext.selectedMesh.depthMesh.updateMatrix();
                }
            }
        }
        else if (e.wheelDelta < 0) {
            if (CContext.selectedMesh != null) {
                var preScale = CContext.selectedMesh.scale.clone();
                var scale = 0.9;
                CContext.selectedMesh.scale.set(preScale.x * scale, preScale.y * scale, preScale.z * scale);
                CContext.selectedMesh.updateMatrix();
                if (CContext.selectedMesh.depthMesh != undefined) {
                    CContext.selectedMesh.depthMesh.scale.set(preScale.x * scale, preScale.y * scale, preScale.z * scale);
                    CContext.selectedMesh.depthMesh.updateMatrix();
                }
            }
        }
    }
    else if (CToolManager.currentActiontype == 'ManipulateCamera') {
        var cameraViewDir = CContext.viewer.camera.getWorldDirection();
        cameraViewDir.normalize();
        cameraViewDir.multiplyScalar(0.02);
        if (e.wheelDelta > 0) {//move forward
            CContext.viewer.camera.position.add(cameraViewDir);
            CContext.viewer.camera.updateMatrix();
            CContext.viewer.camera.updateMatrixWorld();
        }
        else if (e.wheelDelta < 0) {//move backward
            CContext.viewer.camera.position.sub(cameraViewDir);
            CContext.viewer.camera.updateMatrix();
            CContext.viewer.camera.updateMatrixWorld();
        }
    }

}
CManipulationTool.OnMouseMove = function (e) {
    if (CToolManager.currentActiontype == 'ManipulateMesh') {
        if (CManipulationTool.preMouseglPos == null)
            return;
        var mousepos = new THREE.Vector2(e.clientX, e.clientY);
        var glpos = CManipulationTool.Mouse2GlPos(mousepos);
        var dir = glpos.clone();
        dir.sub(CManipulationTool.preMouseglPos);
        if (CManipulationTool.isLButtonDown) {//trans

      
          
            if (CContext.selectedMesh != null) {
                CContext.selectedMesh.position.set(CContext.selectedMesh.position.x + dir.x, CContext.selectedMesh.position.y + dir.y, CContext.selectedMesh.position.z + dir.z);
                CContext.selectedMesh.updateMatrix();
                if (CContext.selectedMesh.depthMesh != undefined) {
                    CContext.selectedMesh.depthMesh.position.set(CContext.selectedMesh.position.x,CContext.selectedMesh.position.y,CContext.selectedMesh.position.z);
                    CContext.selectedMesh.depthMesh.updateMatrix();
                }
            }
           
        }
        else if (CManipulationTool.isRButtonDown) {//rtotate
          
            if (CContext.selectedMesh != null) {
                var cameraViewDir = CContext.viewer.camera.getWorldDirection();
                var axis = dir.clone();
                axis.cross(cameraViewDir).normalize();
                var angle = 0.01;
                var quaternion = new THREE.Quaternion();
                quaternion.setFromAxisAngle(axis, angle);
                var tq = CContext.selectedMesh.quaternion.clone();
                quaternion.multiply(tq);
                CContext.selectedMesh.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
                CContext.selectedMesh.updateMatrix();
                if (CContext.selectedMesh.depthMesh != undefined) {
                    CContext.selectedMesh.depthMesh.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
                    CContext.selectedMesh.depthMesh.updateMatrix();
                }
            }
        }
        CManipulationTool.preMouseglPos = glpos;
      
    }
    else if (CToolManager.currentActiontype == 'ManipulateCamera') {
        if (CManipulationTool.preMousePos == null)
            return;
       
        
        var mousepos = new THREE.Vector2(e.clientX, e.clientY);
        var glpos = CManipulationTool.Mouse2GlPos(mousepos);
        var preglpos = CManipulationTool.Mouse2GlPos(CManipulationTool.preMousePos);
        var dir = preglpos;
        dir.sub(glpos);
       
        if (CManipulationTool.isLButtonDown) {//trans
            dir.multiplyScalar(0.5);
           
            CContext.viewer.camera.position.set(CContext.viewer.camera.position.x + dir.x, CContext.viewer.camera.position.y + dir.y, CContext.viewer.camera.position.z + dir.z);
  
            CContext.viewer.camera.updateMatrix();
            CContext.viewer.camera.updateMatrixWorld();
        }
        else if (CManipulationTool.isRButtonDown) {//rtotate

            var cameraViewDir = CContext.viewer.camera.getWorldDirection();
            var axis = dir.clone();
            axis.cross(cameraViewDir);
            axis.normalize();
            var angle = 0.01;
            var rot = new THREE.Quaternion();
            rot.setFromAxisAngle(axis, angle);
            var pivot = new THREE.Vector3(0, 0, 0);
            var cp = CContext.viewer.camera.position.clone();
            cp.sub(pivot);
            cp.applyQuaternion(rot);
            var targetP = pivot.clone();
            targetP.add(cp);
            rot.multiply(CContext.viewer.camera.quaternion);
        
           CContext.viewer.camera.quaternion.set(rot.x, rot.y, rot.z, rot.w);
           CContext.viewer.camera.position.set(targetP.x,targetP.y,targetP.z);
          
           CContext.viewer.camera.updateMatrix();
            CContext.viewer.camera.updateMatrixWorld();
        

        }
      CManipulationTool.preMousePos = mousepos;

    }
}
CManipulationTool.OnMouseUp = function (e) {
    if (CToolManager.currentActiontype == 'ManipulateMesh') {
        if (event.button == 0) {//left button{
            CManipulationTool.isLButtonDown = false;
        }
        else if (event.button == 2) {//right button
            CManipulationTool.isRButtonDown = false;
        }
    }
    else if (CToolManager.currentActiontype == 'ManipulateCamera') {
        if (event.button == 0) {//left button{
            CManipulationTool.isLButtonDown = false;
        }
        else if (event.button == 2) {//right button
            CManipulationTool.isRButtonDown = false;
        }
    }
}