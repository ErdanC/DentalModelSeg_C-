CCrownSegTool= function () {
    CContext.glViewContainer.addEventListener('mousedown', CCrownSegTool.OnMouseDown);
    CContext.glViewContainer.addEventListener('mouseup', CCrownSegTool.OnMouseUp);
    CContext.glViewContainer.addEventListener('mousemove', CCrownSegTool.OnMouseMove);
    CContext.glViewContainer.addEventListener('dblclick', CCrownSegTool.OnMouseDoubleClick);

    
    document.addEventListener('keydown', CCrownSegTool.OnKeyPress);
 
}
CCrownSegTool.isLButtonDown = false;

CCrownSegTool.lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0000ff
});
CCrownSegTool.InitTool = function () {
    CCrownSegTool();
  

}

CCrownSegTool.OnKeyPress = function (e) {
    if (CToolManager.currentActiontype == 'CrownSeg') {
        var keyCode = e.keyCode;

        if (keyCode == 83) {//s
            CCrownSegTool.ApplySegmentation();
        }
      
        if(keyCode==65)//a
        {

            {//tmp code for tooth template

                var faceIndices = ['a', 'b', 'c'];
                for (var i = 0; i < CContext.selectedMesh.geometry.faces.length; i++) {
                    var f = CContext.selectedMesh.geometry.faces[i];
                    for (var j = 0; j < 3; j++) {
                        CContext.selectedMesh.geometry.ftags[i] = 1;
                        var ftag = CContext.selectedMesh.geometry.ftags[i];
                        if (CContext.tagColors.has(ftag)) {
                            f.color.copy(CContext.tagColors.get(ftag));
                        }
                        else {
                            var new_color = new THREE.Color(Math.random() * 0xffffff);
                            f.color.copy(new_color);
                            CContext.tagColors.set(ftag, new_color);
                        }

                    }

                    
                }

                CContext.selectedMesh.geometry.dynamic = true;
                CContext.selectedMesh.geometry.colorsNeedUpdate = true
                CCrownSegTool.UpdateCrownFidMap();

            }
            //CCrownSegTool.GetFaceTags();
          // CCrownSegTool.ApplyAutoSegmentation();
        }
    }
}
CCrownSegTool.DelTeeth = function (markvid) {
    CRequests.DelTeeth(markvid, function (flag,data) {
    if(flag==false) {
        var message = data;
        alert('Del teeth failed,' + message);
        console.log('Del teeth failed,' + message);
    }
    else {
        if (CContext.selectedMesh != undefined) {
            del_faces = data;
            for(var i=0;i<del_faces.length;i++)
            {
                CContext.selectedMesh.geometry.faces[del_faces[i]].color.copy(CContext.tagColors.get(-1));
                CContext.selectedMesh.geometry.ftags[del_faces[i]] = -1;
            }
        }
        CContext.selectedMesh.geometry.dynamic = true;
        CContext.selectedMesh.geometry.colorsNeedUpdate = true;
        CCrownSegTool.UpdateCrownFidMap();
    }
    });
   
}
CCrownSegTool.ApplyAutoSegmentation = function () {
    CRequests.ApplyAutoSegmentation(function (flag, data0, data1) {
        if (flag == true) {
            if (data0.length != data1.length) {
                alert('Apply Auto Segmentation failed');
                console.log('Apply Auto Segmentation failed');
                return;
            }


            if (CContext.selectedMesh != undefined) {
                console.log('Apply Auto Segmentation successfully');
                tooth_faces = data0;
                tooth_ftags = data1;
                for (var i = 0; i < CContext.selectedMesh.geometry.ftags.length; i++) {
                    CContext.selectedMesh.geometry.ftags[i] = -1;
                }
                for (var i = 0; i < tooth_faces.length; i++) {
                    var fid = tooth_faces[i];
                    var ftag = tooth_ftags[i];
                    CContext.selectedMesh.geometry.ftags[fid] = ftag;
                }
                
                var faceIndices = ['a', 'b', 'c'];
                for (var i = 0; i < CContext.selectedMesh.geometry.faces.length; i++) {
                    var f = CContext.selectedMesh.geometry.faces[i];
                    for (var j = 0; j < 3; j++) {
                        var ftag = CContext.selectedMesh.geometry.ftags[i];
                        if (CContext.tagColors.has(ftag)) {
                            f.color.copy(CContext.tagColors.get(ftag));
                        }
                        else {
                            var new_color = new THREE.Color(Math.random() * 0xffffff);
                            f.color.copy(new_color);
                            CContext.tagColors.set(ftag, new_color);
                        }

                    }

                    // CContext.selectedMesh.geometry.faces[i].copy(f);
                }
                //CContext.selectedMesh.geometry.__dirtyColors = true;
                CContext.selectedMesh.geometry.dynamic = true;
                CContext.selectedMesh.geometry.colorsNeedUpdate = true;

            }
        }
        else {
            var message = data0;
            alert('Apply Segmentation failed,' + message);
            console.log('Apply Segmentation failed,' + message);
        }
    });
}
CCrownSegTool.GetFaceTags = function () {
    if (CContext.selectedMesh != undefined) {
        CRequests.GetFaceTags(function (flag, data) {
            if (flag == true && data.length == CContext.selectedMesh.geometry.faces.length)
            {
                console.log('get face tags successfully');
                for(var i=0;i<data.length;i++)
                {
                    CContext.selectedMesh.geometry.ftags[i] = data[i];
                    ftag = data[i];
                    CContext.selectedMesh.geometry.faces[i].color.copy(CContext.tagColors.get(ftag));
                }
            }
            else {
                alert('failed to get face tags');
                console.log('failed to get face tags');
            }
            CContext.selectedMesh.geometry.dynamic = true;
            CContext.selectedMesh.geometry.colorsNeedUpdate = true;
        })
       
    }
}
CCrownSegTool.UpdateCrownFidMap = function () {
    CContext.selectedMesh.crownFidMap = {};
    for(var i=0;i<CContext.selectedMesh.geometry.ftags.length;i++)
    {
        var tag = CContext.selectedMesh.geometry.ftags[i];
        if(tag!=-1)
        {
            if (CContext.selectedMesh.crownFidMap[tag]==undefined)
            {
                CContext.selectedMesh.crownFidMap[tag] = new Array();
            }
         
            CContext.selectedMesh.crownFidMap[tag].push(i);

        }
    }
}
CCrownSegTool.ApplySegmentation = function () {
    if (CCrownSegTool.lineGeo != undefined)
    {
        var array_vmarks = new Array();
        var vmark_set = new Set();
        for (var i = 0; i < CCrownSegTool.lineMousePos.length; i++)
        {
            var glprojmousepos = CCrownSegTool.Mouse2GlProjPos(CCrownSegTool.lineMousePos[i]);
            var res_vid = CCrownSegTool.PickVertex(glprojmousepos);
     
            if (res_vid != -1 && (vmark_set.has(res_vid) == false))
            {
                array_vmarks.push(res_vid);
               vmark_set.add(res_vid);
            }
        }
        CRequests.ApplySegmentation(array_vmarks, function (flag, data0, data1) {
            if (flag == true) {
                if(data0.length!=data1.length)
                {
                    console.log('Apply Segmentation failed');
                    alert('Apply Segmentation failed');
                    return;
                }
             
               
                if(CContext.selectedMesh!=undefined)
                {
                    console.log('Apply Segmentation successfully');
                    updated_faces = data0;
                    updated_ftags = data1;

                    for (var i = 0; i < updated_faces.length; i++) {
                        var fid = updated_faces[i];
                        var ftag = updated_ftags[i];
                        CContext.selectedMesh.geometry.ftags[fid] = ftag;
                    }
                    console.log('updated face num ' + updated_faces.length);
                    var faceIndices = [ 'a', 'b', 'c' ];
                    for (var i = 0; i < CContext.selectedMesh.geometry.faces.length; i++) {
                        var f = CContext.selectedMesh.geometry.faces[i];
                        for (var j = 0; j < 3; j++) {
                            var ftag = CContext.selectedMesh.geometry.ftags[i];
                            if (CContext.tagColors.has(ftag)) {
                                f.color.copy(CContext.tagColors.get(ftag));
                            }
                            else {
                                var new_color = new THREE.Color(Math.random() * 0xffffff);
                                f.color.copy(new_color);
                                CContext.tagColors.set(ftag, new_color);
                            }

                        }

                        // CContext.selectedMesh.geometry.faces[i].copy(f);
                    }
                    //CContext.selectedMesh.geometry.__dirtyColors = true;
                    CContext.selectedMesh.geometry.dynamic = true;
                    CContext.selectedMesh.geometry.colorsNeedUpdate = true
                    CCrownSegTool.UpdateCrownFidMap();
                }
            }
            else {
                var message = data0;
                alert('Apply Segmentation failed,' + message);
                console.log('Apply Segmentation failed,' + message);
            }
        });
    }
    else {
        alert('please draw segmentation curve!');
        console.log('please draw segmentation curve!');
    }

}
CCrownSegTool.PickVertex = function (glProjMousePos)
{
   
    var meshArray = CContext.scene.GetMeshArray();
    var intersects = CContext.scene.PickMeshs(glProjMousePos, CContext.viewer.camera);
    var minDis = Number.MAX_VALUE;
    var mi = -1;
    for (var i = 0; i < intersects.length; i++) {
        if (intersects[i].face == undefined)
        {
            continue;
        }
        if (minDis > intersects[i].distance) {
            minDis = intersects[i].distance;
            mi = i;
        }
    }
    var intersect = intersects[mi];
    if (mi != -1 && intersect.object == CContext.selectedMesh)
    {
        var fvs = Array();
        fvs.push(intersect.face.a);
        fvs.push(intersect.face.b);
        fvs.push(intersect.face.c);
        var minDis = Number.MAX_VALUE;
        var mfvi=-1
        for (var fvi = 0; fvi < fvs.length; fvi++)
        {
            pv = CContext.selectedMesh.geometry.vertices[fvs[fvi]];
            var dis = pv.distanceTo(intersect.point);
    
            if (minDis > dis) {
                minDis = dis;
                mfvi = fvi;
            }
        }
        return fvs[mfvi];
    }
    else
    {
        return -1;
    }
}
CCrownSegTool.OnMouseDoubleClick = function (e) {
    if (CToolManager.currentActiontype == 'CrownSeg') {
        var mousepos = new THREE.Vector2(e.clientX, e.clientY);
        var glprojmousepos = CCrownSegTool.Mouse2GlProjPos(mousepos);
        var res_vid = CCrownSegTool.PickVertex(glprojmousepos);
        CCrownSegTool.DelTeeth(res_vid);

    }
}
CCrownSegTool.OnMouseDown = function (e) {
    if (CToolManager.currentActiontype == 'CrownSeg') {
        var mousepos = new THREE.Vector2(e.clientX, e.clientY);
       
       
        if (e.button == 0) {//left button{
            CCrownSegTool.isLButtonDown = true;
            var glpos = CCrownSegTool.Mouse2GlPos(mousepos);
            if (CCrownSegTool.line != undefined)
            {
                CContext.scene.RemoveAuxObject(CCrownSegTool.line);
            }
            CCrownSegTool.lineGeo = new THREE.Geometry();
            CCrownSegTool.lineMousePos= new Array();
            CCrownSegTool.line = new THREE.Line(CCrownSegTool.lineGeo.clone(), CCrownSegTool.lineMaterial);

        }
   
    }
}
CCrownSegTool.Mouse2GlProjPos = function (mousePos) {
    var glprojpos = new THREE.Vector2();
    glprojpos.x = ((mousePos.x - CContext.glViewContainer.offsetLeft) / CContext.glViewContainer.offsetWidth) * 2 - 1;
    glprojpos.y = -((mousePos.y - CContext.glViewContainer.offsetTop) / CContext.glViewContainer.offsetHeight) * 2 + 1;
    return glprojpos;
}
CCrownSegTool.Mouse2GlPos = function (mousePos) {
    var glprojpos = new THREE.Vector3();
    glprojpos.x = ((mousePos.x - CContext.glViewContainer.offsetLeft) / CContext.glViewContainer.offsetWidth) * 2 - 1;
    glprojpos.y = -((mousePos.y - CContext.glViewContainer.offsetTop) / CContext.glViewContainer.offsetHeight) * 2 + 1;
    glprojpos.z = -0.9;
    var glpos = new THREE.Vector3(glprojpos.x, glprojpos.y, glprojpos.z).unproject(CContext.viewer.camera);
  

    return glpos;
}
CCrownSegTool.OnMouseMove = function (e) {
    if (CToolManager.currentActiontype == 'CrownSeg') {
        var mousepos = new THREE.Vector2(e.clientX, e.clientY);
        if (CCrownSegTool.isLButtonDown && CCrownSegTool.line != undefined) {
            var glpos = CCrownSegTool.Mouse2GlPos(mousepos);
 
            CCrownSegTool.lineGeo.vertices.push(glpos);
            CCrownSegTool.lineMousePos.push(mousepos);
            if (CCrownSegTool.lineGeo.vertices.length >= 2) {
                CContext.scene.RemoveAuxObject(CCrownSegTool.line);
                CCrownSegTool.line = new THREE.Line(CCrownSegTool.lineGeo.clone(), CCrownSegTool.lineMaterial);
                CContext.scene.AddAuxObject(CCrownSegTool.line);
            }
        }
    }
}
CCrownSegTool.OnMouseUp = function (e) {
    if (CToolManager.currentActiontype == 'CrownSeg') {
        if (e.button == 0) {//left button{
            CCrownSegTool.isLButtonDown = false;
        }
      
    }
}