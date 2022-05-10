var cloneObj = function(obj){
    var str, newobj = obj.constructor === Array ? [] : {};
    if(typeof obj !== 'object'){
        return;
    } else if(window.JSON){
        str = JSON.stringify(obj), //系列化对象
        newobj = JSON.parse(str); //还原
    } else {
        for(var i in obj){
            newobj[i] = typeof obj[i] === 'object' ? 
            cloneObj(obj[i]) : obj[i]; 
        }
    }
    return newobj;
};



var CToolManager = function () {
    console.log('init');
    document.addEventListener('keydown', CToolManager.OnKeyPress);
    document.addEventListener('keyup', CToolManager.OnKeyUp);
    CManipulationTool.InitTool();
    CCrownSegTool.InitTool();
    CLandmarkTool.InitTool();
}
CToolManager.currentActiontype = 'ManipulateCamera';
CToolManager.GetIndividualCrowns = function () {
    console.log('GetIndividualCrowns');
    var CrownsGeos = {};
    var CrownMeshes = {};
    var vidset = {};
    var geo = CContext.selectedMesh.geometry;
    var ftags = geo.ftags;
    var oldF2NewMap = {};
    for (var fi = 0; fi < ftags.length; fi++) {
        //  if(ftags[fi]!=-1)
        {
            var tag = ftags[fi];
            if (CrownsGeos[tag] == undefined) {
                vidset[tag] = {};
                CrownsGeos[tag] = new THREE.Geometry;
                CrownsGeos[tag].faces = new Array();
                CrownsGeos[tag].vertices = new Array();
                var material = new THREE.MeshPhongMaterial({ specular: 0xaaaaaa, shininess: 4, wireframe: false, shading: THREE.FlatShading, side: THREE.DoubleSide, vertexColors: THREE.FaceColors });

                CrownMeshes[tag] = new THREE.Mesh(CrownsGeos[tag], material);
            }
            var f = new THREE.Face3(geo.faces[fi].a, geo.faces[fi].b, geo.faces[fi].c);

            if (vidset[tag][f.a] == undefined) {
                vidset[tag][f.a] = CrownsGeos[tag].vertices.length;
                CrownsGeos[tag].vertices.push(geo.vertices[f.a].clone());
                f.a = vidset[tag][f.a];

            }
            else {
                f.a = vidset[tag][f.a];
            }
            if (vidset[tag][f.b] == undefined) {
                vidset[tag][f.b] = CrownsGeos[tag].vertices.length;
                CrownsGeos[tag].vertices.push(geo.vertices[f.b].clone());
                f.b = vidset[tag][f.b];
            }
            else {
                f.b = vidset[tag][f.b];
            }
            if (vidset[tag][f.c] == undefined) {
                vidset[tag][f.c] = CrownsGeos[tag].vertices.length;
                CrownsGeos[tag].vertices.push(geo.vertices[f.c].clone());
                f.c = vidset[tag][f.c];
            }
            else {
                f.c = vidset[tag][f.c];
            }
            // f.oldId = fi;
            oldF2NewMap[fi] = new Object();
            oldF2NewMap[fi].tag = tag;
            oldF2NewMap[fi].fid = CrownsGeos[tag].faces.length;
            CrownsGeos[tag].faces.push(f);

        }
    }
    for(let landmark of CContext.selectedMesh.toothLandmarks) {
        var fi= landmark.faceIndex;
        landmark.faceIndex = oldF2NewMap[fi].fid;
        landmark.tag = oldF2NewMap[fi].tag;
        if (CrownMeshes[landmark.tag].landmarks == undefined)
        {
            CrownMeshes[landmark.tag].landmarks = new Array();
        }
        CrownMeshes[landmark.tag].landmarks.push((landmark));
    }
    for(let walaPoint of CContext.selectedMesh.walaPoints) {
        var fi = walaPoint.faceIndex;
        walaPoint.faceIndex = oldF2NewMap[fi].fid;
        walaPoint.tag = oldF2NewMap[fi].tag;
        if (CrownMeshes[walaPoint.tag].walaPoints == undefined)
        {
            CrownMeshes[walaPoint.tag].walaPoints = new Array();
        }
        CrownMeshes[walaPoint.tag].walaPoints.push(walaPoint);
    }
    for(let contactPoint of CContext.selectedMesh.contactPoints) {
        var fi = contactPoint.faceIndex;
        contactPoint.faceIndex = oldF2NewMap[fi].fid;
        contactPoint.tag = oldF2NewMap[fi].tag;
        if (CrownMeshes[contactPoint.tag].contactPoints == undefined)
        {
            CrownMeshes[contactPoint.tag].contactPoints = new Array();
        }
        CrownMeshes[contactPoint.tag].contactPoints.push(contactPoint);
    }

    for(let occlusionPoint of CContext.selectedMesh.occlusionPoints) {
        var fi = occlusionPoint.faceIndex;
        occlusionPoint.faceIndex = oldF2NewMap[fi].fid;
        occlusionPoint.tag = oldF2NewMap[fi].tag;
        if (CrownMeshes[occlusionPoint.tag].occlusionPoints == undefined) {
            CrownMeshes[occlusionPoint.tag].occlusionPoints = new Array();
        }
        CrownMeshes[occlusionPoint.tag].occlusionPoints.push(occlusionPoint);
    }
    for (var tag in CContext.selectedMesh.faPoints)
    {
        var faPoint = CContext.selectedMesh.faPoints[tag];
        var fi = faPoint.faceIndex;
        faPoint.faceIndex = oldF2NewMap[fi].fid;
        faPoint.tag = oldF2NewMap[fi].tag;
        CrownMeshes[faPoint.tag].faPoint = faPoint;
    }

    CContext.crowns = {};
    for (var key in CrownMeshes) {
        var tag = key;
      
        if (tag != -1) {
            var mesh = CrownMeshes[tag];
            mesh.geometry.normalsNeedUpdate = true;
            mesh.type = 'crown';
            mesh.geometry.computeBoundingBox();
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            console.log('receiveShadow ' + tag);
            var mat = CContext.selectedMesh.invcrownmatrixs[tag].clone();
            for (var i = 0; i < mesh.geometry.vertices.length; i++) {
                var v = mesh.geometry.vertices[i];
                var matele = mat.elements;
                var tansv = new THREE.Vector3();
                tansv.x = matele[0] * v.x + matele[4] * v.y + matele[8] * v.z + matele[12];
                tansv.y = matele[1] * v.x + matele[5] * v.y + matele[9] * v.z + matele[13];
                tansv.z = matele[2] * v.x + matele[6] * v.y + matele[10] * v.z + matele[14];
                // CContext.selectedMesh.crownmatrixs[tag].applyToVector3Array(v);
                mesh.geometry.vertices[i] = tansv;
            }
            console.log('geometry ' + mesh.landmarks.length);
          //  for (var i = 0; i < mesh.geometry.faces.length; i++) {
                //mesh.geometry.faces[i].color.copy(CContext.tagColors.get(tag));
           // }
        
            CContext.crowns[tag] = mesh;
            CContext.crowns[tag].matrix = CContext.selectedMesh.crownmatrixs[tag].clone();
            CContext.crowns[tag].geometry.dynamic = true;
            CContext.crowns[tag].geometry.colorsNeedUpdate = true;
            CContext.crowns[tag].matrixAutoUpdate = false;
        }
        else {//base mesh
            var mesh = CrownMeshes[tag];
            mesh.geometry.normalsNeedUpdate = true;
            mesh.type = 'base';
            mesh.geometry.computeBoundingBox();
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            for (var i = 0; i < mesh.geometry.faces.length; i++) {
                //  mesh.geometry.faces[i].color.copy(new THREE.Color(0xffaaaa));
            }
            CContext.baseMesh = mesh;
            CContext.baseMesh.matrixAutoUpdate = false;
        }


    }
    CContext.scene.ClearMeshObject();
    CContext.scene.RemoveAuxObject(CContext.selectedMesh);



    var ambient = new THREE.AmbientLight(0xaaaaaa);
    CContext.scene.meshScene.add(ambient);
    var dirLight = new THREE.PointLight(0xffffff, 0.2);
    dirLight.position.set(0, 100, 0);
    CContext.scene.meshScene.add(dirLight);
    var dirLight2 = new THREE.PointLight(0xffffff, 0.2);
    dirLight2.position.set(0, -100, 0);
    CContext.scene.meshScene.add(dirLight2);
    var dirLight3 = new THREE.PointLight(0xffffff, 0.2);
    dirLight3.position.set(100, 0, 0);
    CContext.scene.meshScene.add(dirLight3);
    var dirLight4 = new THREE.PointLight(0xffffff, 0.2);
    dirLight4.position.set(-100, 0, 0);
    CContext.scene.meshScene.add(dirLight4);
    CContext.selectedMesh = undefined;
    for (var key in CContext.crowns) {
        CContext.scene.AddMeshObject(CContext.crowns[key]);
        if (CContext.crowns[key].landmarks != undefined)
        {
            for (var i = 0; i < CContext.crowns[key].landmarks.length; i++) {
                CContext.scene.AddMeshObject(CContext.crowns[key].landmarks[i]);
            }
        }
        if (CContext.crowns[key].contactPoints != undefined) {
            for (var i = 0; i < CContext.crowns[key].contactPoints.length; i++) {
                CContext.scene.AddMeshObject(CContext.crowns[key].contactPoints[i]);
            }
        }
        if (CContext.crowns[key].occlusionPoints != undefined) {
            for (var i = 0; i < CContext.crowns[key].occlusionPoints.length; i++) {
                CContext.scene.AddMeshObject(CContext.crowns[key].occlusionPoints[i]);
            }
        }
        if (CContext.crowns[key].faPoint != undefined) {
            CContext.scene.AddMeshObject(CContext.crowns[key].faPoint);
        }
    }

    CContext.scene.AddMeshObject(CContext.baseMesh);
    if (CContext.baseMesh.walaPoints != undefined) {
        for (var i = 0; i < CContext.baseMesh.walaPoints.length; i++) {
            CContext.scene.AddMeshObject(CContext.baseMesh.walaPoints[i]);
        }
    }

}
CToolManager.ComputeCrownMatrix=function(callback)
{
    var centers = new Array();
    var fapoints = new Array();
    var longaxis = new Array();
    var tags = new Array();
    for (var key in CContext.selectedMesh.crowncenter) {
        var tag = key;
        var centerpoint = CContext.selectedMesh.crowncenter[tag].position;
        centers.push(centerpoint.x);
        centers.push(centerpoint.y);
        centers.push(centerpoint.z);
        tags.push(tag);
        var fapoint = CContext.selectedMesh.faPoints[tag].position;
        fapoints.push(fapoint.x);
        fapoints.push(fapoint.y);
        fapoints.push(fapoint.z);
        var axis = CContext.selectedMesh.longAxises[tag].direction;
        longaxis.push(axis.x);
        longaxis.push(axis.y);
        longaxis.push(axis.z);

    }
    console.log('ComputeCrownMatrixs');
    CRequests.ComputeCrownMatrixs(centers, fapoints, longaxis, function (flag, data,data2) {
        //console.log(data);
       
        if (flag) {
            console.log('compute matrix successfully');
            CContext.selectedMesh.crownmatrixs = {};
            CContext.selectedMesh.invcrownmatrixs = {};
            for (var i = 0; i < tags.length; i++)
            {
                var tag = tags[i];
                CContext.selectedMesh.crownmatrixs[tag] = new THREE.Matrix4();
                CContext.selectedMesh.invcrownmatrixs[tag] = new THREE.Matrix4();
                for(var j=0;j<16;j++)
                {
                    CContext.selectedMesh.crownmatrixs[tag].elements[j] = data[i * 16 + j];
                    CContext.selectedMesh.invcrownmatrixs[tag].elements[j] = data2[i * 16 + j];
                }
               
            }
            callback();

        }
        else {
            console.log('compute matrix failed');
        }


    });
}
CToolManager.OnKeyPress = function (e) {
    var keyCode = e.keyCode;
  
    if (keyCode == 18) {//alt
        CToolManager.currentActiontype = 'ManipulateMesh';
    }
    else if (keyCode == 66) {//reset camera key_b
        CContext.viewer.ResetCamera();
    }
 
    else if (keyCode == 68) {//key_d seg
        if (CToolManager.currentActiontype == 'CrownSeg') {
            CToolManager.currentActiontype = 'ManipulateCamera'
        }
        else
            CToolManager.currentActiontype = 'CrownSeg';
    }
    else if (keyCode == 71) {//key_g ConfirmSegmentation

        CToolManager.ComputeCrownMatrix(function () {
            CToolManager.GetIndividualCrowns()
        });
   
    }
    else if (keyCode==72)
    {
        for (var key in CContext.crowns) {
            var crown = CContext.crowns[key];
            crown.matrix.getInverse(crown.matrix.clone());
         
            crown.matrixAutoUpdate = false;
        }
    }
    else if (keyCode == 48) {//key 0 for zhiming
        console.log('export crown info');
        var geo = CContext.selectedMesh.geometry;
        var ftags = geo.ftags;
    
        var tagstr = '1 ' + geo.ftags.length + ' \n';
        for (var i = 0; i < geo.ftags.length; i++)
        {
            tagstr = tagstr + geo.ftags[i] + ' \n';
        }
        var tagblob = new Blob([tagstr], { type: "text/plain;charset=utf-8" });
        saveAs(tagblob, 'crown.fmat');
        var vtag = new Array(CContext.selectedMesh.geometry.vertices.length);
        for (var i = 0; i < CContext.selectedMesh.geometry.faces.length; i++)
        {
            var f = CContext.selectedMesh.geometry.faces[i];
            vtag[f.a] = ftags[i];
            vtag[f.b] = ftags[i];
            vtag[f.c] = ftags[i];
        }
        var vtagstr = '1 ' + vtag.length + ' \n';
        for (var i = 0; i < vtag.length; i++) {
            vtagstr = vtagstr + vtag[i] + ' \n';
        }
        var vtagblob = new Blob([vtagstr], { type: "text/plain;charset=utf-8" });
        saveAs(vtagblob, 'crown.vmat');


        var tmpmesh = new THREE.Mesh(geo.clone());
       
        var offstr = "OFF\n" + CContext.selectedMesh.geometry.vertices.length + " " + CContext.selectedMesh.geometry.faces.length + " 0\n";
        for (var i = 0; i < CContext.selectedMesh.geometry.vertices.length; i++) {
            var v = CContext.selectedMesh.geometry.vertices[i];
            offstr = offstr +  v.x + " " +v.y + " " +v.z+ "\n";
        }
        for (var i = 0; i < CContext.selectedMesh.geometry.faces.length; i++) {
            var f=CContext.selectedMesh.geometry.faces[i];
            offstr = offstr + "3 " + f.a + " " + f.b + " " + f.c + "\n";
        }
        var offblob = new Blob([offstr], { type: "text/plain;charset=utf-8" });
        saveAs(offblob, 'crown.off');

        var lastr = Object.keys(CContext.selectedMesh.longAxises).length+'\n';
        for (var tag in CContext.selectedMesh.longAxises) {
            var la = CContext.selectedMesh.longAxises[tag].direction;
            lastr = lastr + tag + ' ' + la.x +' '+ la.y+' ' + la.z+'\n';
        }
        var lablob = new Blob([lastr], { type: "text/plain;charset=utf-8" });
        saveAs(lablob, 'crown.la');
    }
   
    else if (keyCode == 79)//key o
    {
        console.log('export stl');
        var stlexporter = new THREE.STLExporter();
        for (var key in CContext.crowns)
        {
            var tmpmat = CContext.crowns[key].matrix.clone();
            CContext.crowns[key].matrix = new THREE.Matrix4();
            var tmpmesh = new THREE.Mesh(CContext.crowns[key].geometry.clone());
            var stlstr = stlexporter.parse(tmpmesh);

            // var stlstr = stlexporter.parse(CContext.scene.meshScene);
            var filename = 'crown'+key+'.stl';
            var blob = new Blob([stlstr], { type: "text/plain;charset=utf-8" });
            saveAs(blob, filename);

            var infofile = 'crown' + key + '.info';
            var matstr = '#local to global matrix,column-major\n';
            matstr=matstr+'matrix: '
            for(var i=0;i<16;i++)
            {
                matstr = matstr + tmpmat.elements[i] + ' ';
            }
            if (CContext.crowns[key].landmarks != undefined) {
                matstr = matstr + '\n#crusp fid x y z\n';
                for (var i = 0; i < CContext.crowns[key].landmarks.length; i++) {
                    matstr = matstr + 'crusp: ' + CContext.crowns[key].landmarks[i].faceIndex + ' ' + CContext.crowns[key].landmarks[i].position.x + ' ' + CContext.crowns[key].landmarks[i].position.y + ' ' + CContext.crowns[key].landmarks[i].position.z + '\n';
                }
            }
            if (CContext.crowns[key].contactPoints != undefined) {
            matstr = matstr + '\n#contact point fid x y z\n';
                for (var i = 0; i < CContext.crowns[key].contactPoints.length; i++) {
                    matstr = matstr + 'contact: ' + CContext.crowns[key].contactPoints[i].faceIndex + ' ' + CContext.crowns[key].contactPoints[i].position.x + ' ' + CContext.crowns[key].contactPoints[i].position.y + ' ' + CContext.crowns[key].contactPoints[i].position.z + '\n';
                }
            }
            if (CContext.crowns[key].occlusionPoints != undefined) {
                matstr = matstr + '\n#occlusion point fid x y z\n';
                for (var i = 0; i < CContext.crowns[key].occlusionPoints.length; i++) {
                    matstr = matstr + 'occlusion: ' + CContext.crowns[key].occlusionPoints[i].faceIndex + ' ' + CContext.crowns[key].occlusionPoints[i].position.x + ' ' + CContext.crowns[key].occlusionPoints[i].position.y + ' ' + CContext.crowns[key].occlusionPoints[i].position.z + '\n';
                }
            }
            if (CContext.crowns[key].faPoint != undefined) {
                matstr = matstr + '\n#fa point fid x y z\n';
                matstr = matstr + 'fa: ' + CContext.crowns[key].faPoint.faceIndex + ' ' + CContext.crowns[key].faPoint.position.x + ' ' + CContext.crowns[key].faPoint.position.y + ' ' + CContext.crowns[key].faPoint.position.z + '\n';
            }

            blob = new Blob([matstr], { type: "text/plain;charset=utf-8" });
            saveAs(blob, infofile);
        }



         {
        
            var tmpmesh = new THREE.Mesh(CContext.baseMesh.geometry.clone());
            var stlstr = stlexporter.parse(tmpmesh);

            // var stlstr = stlexporter.parse(CContext.scene.meshScene);
            var filename = 'basemesh'  + '.stl';
            var blob = new Blob([stlstr], { type: "text/plain;charset=utf-8" });
            saveAs(blob, filename);

            var infofile = 'basemesh' + '.info';
     
            if (CContext.baseMesh.walaPoints != undefined) {
                var basematstr = '\n#wala fid x y z\n';
                for (var i = 0; i < CContext.baseMesh.walaPoints.length; i++) {
                    basematstr = basematstr + 'wala: ' + CContext.baseMesh.walaPoints[i].faceIndex + ' ' + CContext.baseMesh.walaPoints[i].position.x + ' ' + CContext.baseMesh.walaPoints[i].position.y + ' ' + CContext.baseMesh.walaPoints[i].position.z + '\n';
                }
            }


            blob = new Blob([basematstr], { type: "text/plain;charset=utf-8" });
            saveAs(blob, infofile);
        }
       
    }
    if (keyCode == 70)//F tooth feature
    {
        if (CToolManager.currentActiontype == 'ToothFeatureDetection') {
            CToolManager.currentActiontype = 'ManipulateCamera'
        }
        else
            CToolManager.currentActiontype = 'ToothFeatureDetection';
    }

    else if (keyCode == 76) {//L




        //var fname = 'resources/LowerJaw.stl';
        //var loader = new THREE.STLLoader();
        //loader.load(fname, function (geometry) {

        //    var material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xaaaaaa, shininess: 0, wireframe: false, shading: THREE.FlatShading, side: THREE.DoubleSide });
        //    geometry.computeBoundingSphere();
        //    var mesh = new THREE.Mesh(geometry, material);
        //    mesh.geometry.normalsNeedUpdate = true;
        //    //mesh.position.set(0, -0.25, 0.6);
        //    mesh.rotation.set(0, -Math.PI, 0);


        //    mesh.castShadow = true;
        //    mesh.receiveShadow = true;

        //    CContext.scene.AddMeshObject(mesh);
        //    CContext.selectedMesh = mesh;
        //});
    }
}
CToolManager.OnKeyUp = function (e) {
    var keyCode = e.keyCode;
 
    if (keyCode == 18) {//alt
        CToolManager.currentActiontype = 'ManipulateCamera';
    }
    
    
}