CLandmarkTool= function () {
    CContext.glViewContainer.addEventListener('mousedown', CLandmarkTool.OnMouseDown);
    CContext.glViewContainer.addEventListener('mouseup', CLandmarkTool.OnMouseUp);
    CContext.glViewContainer.addEventListener('mousemove', CLandmarkTool.OnMouseMove);
    CContext.glViewContainer.addEventListener("dblclick", CLandmarkTool.OnMouseDoubleClick);
    document.addEventListener('keydown', CLandmarkTool.OnKeyPress);
    document.addEventListener('keyup', CLandmarkTool.OnKeyUp);
}
CLandmarkTool.isLButtonDown = false;
CLandmarkTool.isRButtonDown = false;
CLandmarkTool.cancelClicknums = 0;
CLandmarkTool.pickingType='None';// PickCrusp  PickFA 
CLandmarkTool.InitTool = function () {
    CLandmarkTool();
  

}
CLandmarkTool.OnKeyUp = function (e) {
    if (CToolManager.currentActiontype == 'ToothFeatureDetection') {
        var keyCode = e.keyCode;

        if (keyCode == 49) {//release PickCrusp key 1
            CLandmarkTool.pickingType = 'None';
        }
        if (keyCode == 50) {//release PickFA key 2
            CLandmarkTool.pickingType = 'None';
        }
        if (keyCode == 51) {//release PickWala key 3
            CLandmarkTool.pickingType = 'None';
        }
        if (keyCode == 52) {//release PickContact key 4
            CLandmarkTool.pickingType = 'None';
        }
        if (keyCode == 53) {//release PickOcclusion key 5
            CLandmarkTool.pickingType = 'None';
        }
        if (keyCode == 54) {//adjust longaxis key 6
            CLandmarkTool.pickingType = 'None';
        }
    }
}
CLandmarkTool.OnKeyPress = function (e) {
    if (CToolManager.currentActiontype == 'ToothFeatureDetection') {
        var keyCode = e.keyCode;

        if (keyCode == 67) {//C compute crown center and long axis
            CLandmarkTool.ComputeCrownCenters();
            CLandmarkTool.ComputeLongAxises();
            //CLandmarkTool.ComputeCrownFacialPoints();
            
        }
        if (keyCode == 49) {// PickCrusp key 1
            CLandmarkTool.pickingType = 'PickCrusp';
        }
        if (keyCode == 50) {// PickFA key 2
            CLandmarkTool.pickingType = 'PickFA';
        }
        if (keyCode == 51) {// PickWala key 3
            CLandmarkTool.pickingType = 'PickWala';
        }
        if (keyCode == 52) {// PickContact key 4
            CLandmarkTool.pickingType = 'PickContact';
        }
        if (keyCode == 53) {//occlusion point key 5
            CLandmarkTool.pickingType = 'PickOcclusion';
        }
        if (keyCode == 54) {//occlusion point key 6
            CLandmarkTool.pickingType = 'AdjustLongAxis';
        }

       // if(keyCode==86)//V detect landmark
       // {
          //  CLandmarkTool.DetectCrownLandmark();
            //  }

        else if (keyCode == 76)//key l load landmarks
        {
        }
        else if (keyCode == 69)//key e save landmarks
        {
            console.log('export landmarks');
            var fname = 'landmark' + '.info';
            var infostr = "#pick ray\n";

            infostr = infostr + '\n#cusp  ray\n';
            for(let landmark of CContext.selectedMesh.toothLandmarks) {
            // var fi = landmark.faceIndex;
                infostr = infostr + 'cruspray: ' + landmark.ray.origin.x + " " + landmark.ray.origin.y + " " + landmark.ray.origin.z + " " + landmark.ray.direction.x + " " + landmark.ray.direction.y + " " + landmark.ray.direction.z + "\n";
            }
            infostr = infostr + '\n#crusp fid x y z\n';
            for(let landmark of CContext.selectedMesh.toothLandmarks) {
             var fi = landmark.faceIndex;
             infostr = infostr + 'crusp: ' + fi + " " + landmark.position.x + " " + landmark.position.y + " " + landmark.position.z + "\n";
            }




            infostr = infostr + '\n#fa point ray\n';
            for (var tag in CContext.selectedMesh.faPoints) {
                var faPoint = CContext.selectedMesh.faPoints[tag];
                //  var fi = faPoint.faceIndex;
                infostr = infostr + 'faray: ' + faPoint.ray.origin.x + " " + faPoint.ray.origin.y + " " + faPoint.ray.origin.z + " " + faPoint.ray.direction.x + " " + faPoint.ray.direction.y + " " + faPoint.ray.direction.z + "\n";
            }
            infostr = infostr + '\n#fa point fid x y z\n';
            for (var tag in CContext.selectedMesh.faPoints) {
                var faPoint = CContext.selectedMesh.faPoints[tag];
                  var fi = faPoint.faceIndex;
                  infostr = infostr + 'fa: ' + fi + " " + faPoint.position.x + " " + faPoint.position.y + " " + faPoint.position.z + "\n";
            }



            infostr = infostr + '\n#occlusal point  ray\n';
            for(let occlusionPoint of CContext.selectedMesh.occlusionPoints) {
            //var fi = occlusionPoint.faceIndex;
                infostr = infostr + 'occlusalray: ' + occlusionPoint.ray.origin.x + " " + occlusionPoint.ray.origin.y + " " + occlusionPoint.ray.origin.z + " " + occlusionPoint.ray.direction.x + " " + occlusionPoint.ray.direction.y + " " + occlusionPoint.ray.direction.z + "\n";
                
            }
            infostr = infostr + '\n#occlusal point fid x y z\n';
            for(let occlusionPoint of CContext.selectedMesh.occlusionPoints) {
            var fi = occlusionPoint.faceIndex;
                infostr = infostr + 'occlusal: '+" "+fi+" " + occlusionPoint.position.x + " " + occlusionPoint.position.y + " " + occlusionPoint.position.z + "\n";

            }


            infostr = infostr + '\n#contact point  ray\n';
            for(let contactPoint of CContext.selectedMesh.contactPoints) {
            //  var fi = contactPoint.faceIndex;
                infostr = infostr + 'contactray: ' + contactPoint.ray.origin.x + " " + contactPoint.ray.origin.y + " " + contactPoint.ray.origin.z + " " + contactPoint.ray.direction.x + " " + contactPoint.ray.direction.y + " " + contactPoint.ray.direction.z + "\n";
            }
            infostr = infostr + '\n#contact point fid x y z\n';
            for(let contactPoint of CContext.selectedMesh.contactPoints) {
              var fi = contactPoint.faceIndex;
              infostr = infostr + 'contact: '  + fi +" "+ contactPoint.position.x + " " + contactPoint.position.y + " " + contactPoint.position.z + "\n";
            }

            infostr = infostr + '\n#wala point  ray\n';
            for(let walaPoint of CContext.selectedMesh.walaPoints) {
            // var fi = walaPoint.faceIndex;
                infostr = infostr + 'walaray: ' + walaPoint.ray.origin.x + " " + walaPoint.ray.origin.y + " " + walaPoint.ray.origin.z + " " + walaPoint.ray.direction.x + " " + walaPoint.ray.direction.y + " " + walaPoint.ray.direction.z + "\n";
            }
    

            infostr = infostr + '\n#long axis pos dir\n';
            for (var tag in CContext.selectedMesh.longAxises) {
                longaxis = CContext.selectedMesh.longAxises[tag];
                infostr = infostr + 'longaxis: ' + longaxis.position.x + " " + longaxis.position.y + " " + longaxis.position.z + " " + longaxis.direction.x + " " + longaxis.direction.y + " " + longaxis.direction.z + "\n";
            }
            var blob = new Blob([infostr], { type: "text/plain;charset=utf-8" });
            saveAs(blob, fname);




        }

    }
}
//CLandmarkTool.ComputeCrownFacialPoints = function () {
//    var centers = new Array();
   
//    for (var key in CContext.selectedMesh.crowncenter) {
//        var tag = key;
//        var centerpoint = CContext.selectedMesh.crowncenter[tag].position;
//        centers.push(centerpoint);
//    }
//    var curve = new THREE.CatmullRomCurve3(centers);
//    var geometry = new THREE.Geometry();
//    geometry.vertices = curve.getPoints(50);

//    var material = new THREE.LineBasicMaterial({ color: 0xff0000 });

//    // Create the final object to add to the scene
//    var splineObject = new THREE.Line(geometry, material);
//    CContext.scene.AddMeshObject(splineObject);
//    CContext.selectedMesh.crownCenterSpline = splineObject;
//    var vab = geometry.vertices[0].clone();
//    var idx=Math.floor(geometry.vertices.length / 2);
//    var vmid = geometry.vertices[idx].clone();
//    vab.sub(vmid);
//    var vac = geometry.vertices[geometry.vertices.length - 1];
//    vac.sub(vmid);
//    var orientationDir = vac.clone();
//    orientationDir.cross(vab);
//    var needflap = false;
//    if (orientationDir.dot(new THREE.Vector3(0, 1, 0))<0)
//    {
//        needFlag = true;
//    }
//    for (var key in CContext.selectedMesh.crowncenter) {
//        var tag = key;
//        var cp = CContext.selectedMesh.crowncenter[tag].position;
//        var maxDis = -1;
//        var mi = 0;
//        for(var i=0;i<geometry.vertices.length;i++)
//        {
//            var d = cp.distanceTo(geometry.vertices[i]);
//            if(maxDis==-1||maxDis>d)
//            {
//                maxDis = d;
//                mi = i;
//            }
//        }
//        var closestP = geometry.vertices[mi].clone();
//        var tanDir;
//        if(mi==0)
//        {
//            var nextP = geometry.vertices[mi + 1].clone();
//            tanDir = nextP.clone();
//            tanDir.sub(closestP);
//        }
//        else if(mi==geometry.vertices.length-1)
//        {
//            var preP = geometry.vertices[mi - 1].clone();
//            tanDir = closestP.clone();
//            tanDir.sub(preP);
//        }
//        else 
//        {
//            var preP = geometry.vertices[mi - 1].clone();
//            var nextP = geometry.vertices[mi + 1].clone();
//            tanDir = nextP.clone();
//            tanDir.sub(preP);
//        }
//        tanDir.normalize();
//        var frontDir = tanDir.clone();
//        var la = CContext.selectedMesh.longAxises[tag].direction.clone();
//        frontDir.cross(la).normalize();
//        if (needFlag)
//        {
//            frontDir.x = -frontDir.x;
//            frontDir.y = -frontDir.y;
//            frontDir.z = -frontDir.z;
          
//        }
//        CContext.scene.PickMeshs()
//        var arrowHelper = new THREE.ArrowHelper(frontDir, cp, 0.18, 0xbb00f0);
        
//        arrowHelper.updateMatrix();
//        CContext.scene.AddMeshObject(arrowHelper);

//    }
  
//}
CLandmarkTool.DetectCrownLandmark = function () {
    CRequests.DetectCrownLandmark(function (flag, landmark_pos, landmark_fids) {
        if (flag) {
            for(let landmark of CContext.selectedMesh.toothLandmarks) {
                CContext.scene.RemoveAuxObject(landmark);
            }
            CContext.selectedMesh.toothLandmarks = new Set();
            for (var i = 0; i < landmark_pos.length; i++) {
                var geometry = new THREE.SphereGeometry(0.3, 20, 20, 0, Math.PI * 2, 0, Math.PI * 2);
                var material = new THREE.MeshPhongMaterial({ color: 0x0000ff, specular: 0xaaaaaa, shininess: 0, wireframe: false, shading: THREE.SmoothShading, side: THREE.DoubleSide });
                var sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(landmark_pos[i].x, landmark_pos[i].y, landmark_pos[i].z);
                sphere.updateMatrix();
                sphere.type = 'surfacelandmark';
                sphere.faceIndex = landmark_fids[i];
                CContext.scene.AddMeshObject(sphere);
                CContext.selectedMesh.toothLandmarks.add(sphere)

            }
        }
     
    });
}
CLandmarkTool.DeleteLandmark = function (mousepos) {
    if (CLandmarkTool.isLButtonDown) {
        var glMousePos = CManipulationTool.Mouse2GlProjPos(mousepos);
        var meshArray = CContext.scene.GetMeshArray();
        var intersect = CContext.scene.PickNearestMesh(glMousePos, CContext.viewer.camera);
        if (intersect != null && intersect.object.type == 'surfacelandmark')
        {
            if (CContext.selectedMesh.toothLandmarks.has(intersect.object))
            {
                //console.log('del landmark ' + intersect.object.faceIndex);
                CContext.selectedMesh.toothLandmarks.delete(intersect.object);
            }
            CContext.scene.RemoveAuxObject(intersect.object);
        }
        else if (intersect != null && intersect.object.type == 'fapoint') {
            var ftag=CContext.selectedMesh.geometry.ftags[intersect.object.faceIndex];
            if (CContext.selectedMesh.faPoints[ftag]!=undefined) {
                //console.log('del landmark ' + intersect.object.faceIndex);
                CContext.selectedMesh.faPoints[ftag]=undefined;
            }
            CContext.scene.RemoveAuxObject(intersect.object);
        }
        else if (intersect != null && intersect.object.type == 'walapoint') {
            if (CContext.selectedMesh.walaPoints.has(intersect.object)) {
                //console.log('del landmark ' + intersect.object.faceIndex);
                CContext.selectedMesh.walaPoints.delete(intersect.object);
            }
            CContext.scene.RemoveAuxObject(intersect.object);
        }
        else if (intersect != null && intersect.object.type == 'contactpoint') {
            if (CContext.selectedMesh.contactPoints.has(intersect.object)) {
                //console.log('del landmark ' + intersect.object.faceIndex);
                CContext.selectedMesh.contactPoints.delete(intersect.object);
            }
            CContext.scene.RemoveAuxObject(intersect.object);
        }
        else if (intersect != null && intersect.object.type == 'occlusionpoint') {
            if (CContext.selectedMesh.occlusionPoints.has(intersect.object)) {
                //console.log('del landmark ' + intersect.object.faceIndex);
                CContext.selectedMesh.occlusionPoints.delete(intersect.object);
            }
            CContext.scene.RemoveAuxObject(intersect.object);
        }
       
    }
}
CLandmarkTool.AdjustLongAxis = function (mousepos) {
    if ( CLandmarkTool.isLButtonDown) {
        var glMousePos = CManipulationTool.Mouse2GlProjPos(mousepos);
        var meshArray = CContext.scene.GetMeshArray();
        var ray = CContext.scene.GetPickRay(glMousePos, CContext.viewer.camera).clone();
        var intersects = CContext.scene.PickMeshsByRay(ray);
        var minDis = Number.MAX_VALUE;
        var mi = -1;
        for (var i = 0; i < intersects.length; i++) {
            if (minDis > intersects[i].distance && intersects[i].object.type != 'surfacelandmark' && intersects[i].object.type!='fapoint') {
                minDis = intersects[i].distance;
                mi = i;
            }
        }

        if (mi == -1) {

        }
        else {
            var point = intersects[mi].point;
            var tag = CContext.selectedMesh.geometry.ftags[intersects[mi].faceIndex];
            if (CContext.selectedMesh.longAxises[tag] == undefined) {
                return;
            }
            CContext.scene.RemoveAuxObject(CContext.selectedMesh.longAxises[tag]);
            var crowncenter = CContext.selectedMesh.crowncenter[tag];
            var dir =new THREE.Vector3( point.x - crowncenter.position.x,point.y - crowncenter.position.y,point.z - crowncenter.position.z);
            dir = dir.normalize();
            

            var arrowHelper = new THREE.ArrowHelper(dir, crowncenter.position, 20, 0xaa00f0);
            arrowHelper.updateMatrix();
            CContext.scene.AddMeshObject(arrowHelper);
            CContext.selectedMesh.longAxises[tag] = arrowHelper;
            CContext.selectedMesh.longAxises[tag].direction = dir;
        }
    }
}
CLandmarkTool.PickLandmark = function (mousepos, type) {

    if (CLandmarkTool.isRButtonDown || CLandmarkTool.isLButtonDown) {
        var glMousePos = CManipulationTool.Mouse2GlProjPos(mousepos);
        CLandmarkTool.PickLandmarkByProjMousePos(glMousePos, type);
    }
}
CLandmarkTool.PickLandmarkByProjMousePos = function (glMousePos, type) {

    // if (CLandmarkTool.isRButtonDown || CLandmarkTool.isLButtonDown)
    {
        var meshArray = CContext.scene.GetMeshArray();
      
        var ray = CContext.scene.GetPickRay(glMousePos, CContext.viewer.camera).clone();
        CLandmarkTool.PickLandmarkByRay(ray, type);

    }
}
CLandmarkTool.PickLandmarkByRay = function (ray,type) {

   // if (CLandmarkTool.isRButtonDown || CLandmarkTool.isLButtonDown)
    {
        var meshArray = CContext.scene.GetMeshArray();
        var intersects = CContext.scene.PickMeshsByRay(ray);
        var minDis = Number.MAX_VALUE;
        var mi = -1;
        for (var i = 0; i < intersects.length; i++) {
            if (minDis > intersects[i].distance && intersects[i].object.type != 'surfacelandmark' && intersects[i].object.type!='fapoint') {
                minDis = intersects[i].distance;
                mi = i;
            }
        }

        if (mi == -1)
        {

        }

        else {
            var geometry = new THREE.SphereGeometry(0.3, 20, 20, 0, Math.PI * 2, 0, Math.PI * 2);
            console.log('pick');
            var material;
            if (type == 'surfacelandmark')//crusp
            {
                material = new THREE.MeshPhongMaterial({ color: 0x0000ff, specular: 0xaaaaaa, shininess: 0, wireframe: false, shading: THREE.SmoothShading, side: THREE.DoubleSide });
                var sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(intersects[mi].point.x, intersects[mi].point.y, intersects[mi].point.z);
                sphere.updateMatrix();
                sphere.type = type;
                sphere.faceIndex = intersects[mi].faceIndex;
                CContext.scene.AddMeshObject(sphere);
                sphere.ray = ray;
                CContext.selectedMesh.toothLandmarks.add(sphere);
            }
            else if(type=='fapoint')
            {
                material = new THREE.MeshPhongMaterial({ color: 0xff00ff, specular: 0xaaaaaa, shininess: 0, wireframe: false, shading: THREE.SmoothShading, side: THREE.DoubleSide });
                var sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(intersects[mi].point.x, intersects[mi].point.y, intersects[mi].point.z);
                sphere.updateMatrix();
                sphere.type = type;
                var ftag = CContext.selectedMesh.geometry.ftags[intersects[mi].faceIndex];
                sphere.faceIndex = intersects[mi].faceIndex;
                sphere.ray = ray;
                CContext.scene.AddMeshObject(sphere);
                CContext.selectedMesh.faPoints[ftag]=sphere;
            }
            else if(type=='walapoint')
            {
                material = new THREE.MeshPhongMaterial({ color: 0xf0000f, specular: 0xaaaaaa, shininess: 0, wireframe: false, shading: THREE.SmoothShading, side: THREE.DoubleSide });
                var sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(intersects[mi].point.x, intersects[mi].point.y, intersects[mi].point.z);
                sphere.updateMatrix();
                sphere.type = type;
                var ftag = CContext.selectedMesh.geometry.ftags[intersects[mi].faceIndex];
                sphere.faceIndex = intersects[mi].faceIndex;
                sphere.ray = ray;
                CContext.scene.AddMeshObject(sphere);
                CContext.selectedMesh.walaPoints.add(sphere);
            }
            else if (type=='contactpoint')
            {
                material = new THREE.MeshPhongMaterial({ color: 0xffff00, specular: 0xaaaaaa, shininess: 0, wireframe: false, shading: THREE.SmoothShading, side: THREE.DoubleSide });
                var sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(intersects[mi].point.x, intersects[mi].point.y, intersects[mi].point.z);
                sphere.updateMatrix();
                sphere.type = type;
                var ftag = CContext.selectedMesh.geometry.ftags[intersects[mi].faceIndex];
                sphere.faceIndex = intersects[mi].faceIndex;
                sphere.ray = ray;
                CContext.scene.AddMeshObject(sphere);
                CContext.selectedMesh.contactPoints.add(sphere);
            }
            else if (type == 'occlusionpoint') {
                material = new THREE.MeshPhongMaterial({ color: 0xfaaf00, specular: 0xaaaaaa, shininess: 0, wireframe: false, shading: THREE.SmoothShading, side: THREE.DoubleSide });
                var sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(intersects[mi].point.x, intersects[mi].point.y, intersects[mi].point.z);
                sphere.updateMatrix();
                sphere.type = type;
                var ftag = CContext.selectedMesh.geometry.ftags[intersects[mi].faceIndex];
                sphere.faceIndex = intersects[mi].faceIndex;
                sphere.ray = ray;
                CContext.scene.AddMeshObject(sphere);
                CContext.selectedMesh.occlusionPoints.add(sphere);
            }
            
          
        }
    }
    
   

}
CLandmarkTool.OnMouseDoubleClick = function (e) {
    
    clearTimeout(CLandmarkTool.lbuttonclocktimeId);
    CLandmarkTool.cancelClicknums = CLandmarkTool.cancelClicknums+2;
    if (CToolManager.currentActiontype == 'ToothFeatureDetection') {
       
      
        var mousepos = new THREE.Vector2(e.clientX, e.clientY);
        var glpos = CManipulationTool.Mouse2GlPos(mousepos);

       
            CLandmarkTool.isLButtonDown = true;
            CLandmarkTool.DeleteLandmark(mousepos);
      
      

    }
   
}
CLandmarkTool.ComputeLongAxises = function () {
    console.log('ComputeLongAxises');
    landmarkmap = {}
    for(let landmark of CContext.selectedMesh.toothLandmarks) {
       
        var fidx = landmark.faceIndex;
        var tag = CContext.selectedMesh.geometry.ftags[fidx];
        if (tag != undefined)
        {
            if (landmarkmap[tag] == undefined) {
                landmarkmap[tag] = new Array();
            }
            landmarkmap[tag].push(landmark);
        }
       
    }
    CContext.selectedMesh.longAxises = {};//THREE.Vector3
    for (var key in landmarkmap) {
        if (landmarkmap.hasOwnProperty(key)) {
            var tag = key;
            var landmarks = landmarkmap[tag];
            var crowncenter = CContext.selectedMesh.crowncenter[tag];
            var dir = new THREE.Vector3(0, 0, 0);
            if (landmarks.length < 3)
            {
                var landmarkcenter = new THREE.Vector3(0, 0, 0);
                for (var i = 0; i < landmarks.length; i++) {
                    landmarkcenter = new THREE.Vector3(landmarkcenter.x + landmarks[i].position.x, landmarkcenter.y + landmarks[i].position.y, landmarkcenter.z + landmarks[i].position.z);
                }
                landmarkcenter = new THREE.Vector3(landmarkcenter.x / landmarks.length, landmarkcenter.y / landmarks.length, landmarkcenter.z / landmarks.length);
                dir = new THREE.Vector3(landmarkcenter.x - crowncenter.position.x, landmarkcenter.y - crowncenter.position.y, landmarkcenter.z - crowncenter.position.z);
            }
            else
            {
                for (var i = 2; i < landmarks.length; i++) {
                    var la = landmarks[i - 2].position.clone();
                    var lb = landmarks[i - 1].position.clone();
                    var lc = landmarks[i].position.clone();
                    var vab = la.clone().sub(lb);
                    var vac = la.clone().sub(lc);
                    vac.cross(vab);
                    if (vac.y < 0) {
                        vac = new THREE.Vector3(-vac.x, -vac.y, -vac.z);
                    }
                    vac.normalize();
                    dir.add(vac);
                }
                dir = new THREE.Vector3(dir.x / (landmarks.length - 2), dir.y / (landmarks.length - 2), dir.z / (landmarks.length - 2));
                var dirdot = dir.clone();
                if(dirdot.dot(CContext.selectedMesh.geometry.updir)<0)
                {
                    dir = new THREE.Vector3(-dir.x, -dir.y, -dir.z);
                }
            }
            dir=dir.normalize();
           var arrowHelper = new THREE.ArrowHelper(dir, crowncenter.position, 20, 0xaa00f0);

            arrowHelper.updateMatrix();
            if (CContext.selectedMesh.longAxises[tag] != undefined)
            {
                CContext.scene.RemoveAuxObject(CContext.selectedMesh.longAxises[tag]);
            }
            CContext.scene.AddMeshObject(arrowHelper);
            CContext.selectedMesh.longAxises[tag] = arrowHelper;
            CContext.selectedMesh.longAxises[tag].direction = dir;
        }
    }
   
}
CLandmarkTool.ComputeCrownCenters = function () {
    CContext.selectedMesh.crowncenter = {};
    for (var key in CContext.selectedMesh.crownFidMap) {
        if (CContext.selectedMesh.crownFidMap.hasOwnProperty(key)) {
            var tag = key;
            var crownFids = CContext.selectedMesh.crownFidMap[key];
            var crownCenter = new THREE.Vector3(0, 0, 0);
            for(var i=0;i<crownFids.length;i++)
            {
                var fid = crownFids[i];
                var face = CContext.selectedMesh.geometry.faces[fid];
                var va = CContext.selectedMesh.geometry.vertices[face.a];//THREE.Vector3
                var vb = CContext.selectedMesh.geometry.vertices[face.b];
                var vc = CContext.selectedMesh.geometry.vertices[face.c];
                var faceCenter = new THREE.Vector3((va.x + vb.x + vc.x) / 3.0, (va.y + vb.y + vc.y) / 3.0, (va.z + vb.z + vc.z) / 3.0);

                crownCenter.x =crownCenter.x + faceCenter.x;
                crownCenter.y =crownCenter.y + faceCenter.y;
                crownCenter.z =crownCenter.z + faceCenter.z;
            }
            crownCenter.x = crownCenter.x / crownFids.length;
            crownCenter.y = crownCenter.y / crownFids.length;
            crownCenter.z = crownCenter.z / crownFids.length;

            //console.log(crownCenter.x + ' ' + crownCenter.y + ' ' + crownCenter.z);
            var geometry = new THREE.SphereGeometry(0.3, 20, 20, 0, Math.PI * 2, 0, Math.PI * 2);
            var material = new THREE.MeshPhongMaterial({ color: 0xff0000, specular: 0xaaaaaa, shininess: 0, wireframe: false, shading: THREE.SmoothShading, side: THREE.DoubleSide });
            var sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(crownCenter.x, crownCenter.y, crownCenter.z);
            sphere.updateMatrix();
            sphere.type = 'crowncenter';
            CContext.scene.AddMeshObject(sphere);
            CContext.selectedMesh.crowncenter[tag] = sphere;
        }
    }
    
}
CLandmarkTool.OnMouseDown = function (e) {
    setTimeout(function () {
        if (CLandmarkTool.cancelClicknums == 0)
        {
            if (CToolManager.currentActiontype == 'ToothFeatureDetection') {
               
                var mousepos = new THREE.Vector2(e.clientX, e.clientY);

                var glpos = CManipulationTool.Mouse2GlPos(mousepos);
                if (e.button == 0) {//left button{
                    if (CLandmarkTool.pickingType == 'PickCrusp')
                    {
                        CLandmarkTool.isLButtonDown = true;
                        CLandmarkTool.PickLandmark(mousepos, 'surfacelandmark');
                    }
                    else if (CLandmarkTool.pickingType == 'PickFA')
                    {
                        CLandmarkTool.isRButtonDown = true;
                        CLandmarkTool.PickLandmark(mousepos, 'fapoint');
                    }
                    else if(CLandmarkTool.pickingType=='PickWala')
                    {
                        CLandmarkTool.isRButtonDown = true;
                        CLandmarkTool.PickLandmark(mousepos, 'walapoint');
                    }
                    else if(CLandmarkTool.pickingType=='PickContact')
                    {
                        CLandmarkTool.isRButtonDown = true;
                        CLandmarkTool.PickLandmark(mousepos, 'contactpoint');
                    }
                    else if (CLandmarkTool.pickingType == 'PickOcclusion') {
                        CLandmarkTool.isRButtonDown = true;
                        CLandmarkTool.PickLandmark(mousepos, 'occlusionpoint');
                    }
                    else if (CLandmarkTool.pickingType == "AdjustLongAxis") {
                        CLandmarkTool.isLButtonDown = true;
                        CLandmarkTool.AdjustLongAxis(mousepos);
                    }
                    

                  
                }
        }

        
       
        }
        else {
            CLandmarkTool.cancelClicknums = CLandmarkTool.cancelClicknums - 1;
        }
    }, 600);
   
}


CLandmarkTool.OnMouseMove = function (e) {
    if (CToolManager.currentActiontype == 'ToothFeatureDetection') {
       
        var mousepos = new THREE.Vector2(e.clientX, e.clientY );
        if (CLandmarkTool.isLButtonDown) {
           
        }
    }
}
CLandmarkTool.OnMouseUp = function (e) {
    if (CToolManager.currentActiontype == 'ToothFeatureDetection') {
        if (e.button == 0) {//left button{
            CLandmarkTool.isLButtonDown = false;
            CLandmarkTool.isRButtonDown = false;
        }
     
    }
}