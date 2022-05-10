var CRequests=function()
{

}
CRequests.lock = false;
CRequests.AcquireLock=function()
{
    if(CRequests.lock==true)
    {
        alert('please wait until previous operation finish');
        return false;
    }
    CRequests.lock = true;
    return true;
}
CRequests.ReleaseLock=function()
{
    CRequests.lock = false;
}
CRequests.GetFaceTags=function(callback)
{
    if (CRequests.AcquireLock() == false)
    {
        return;
    }
    if (CRequests.session_id === undefined) {
        console.log('GetFaceTags failed! no session id set');
        CRequests.ReleaseLock();
        return;
    }
    var request_data = {
        session_id: CRequests.session_id,
        command_type: "GET_FACE_TAGS"
    };

    var req_json = JSON.stringify(request_data);
    $.ajax({
        type: 'POST',
        url: CConfig.server_root + 'command',
        data: req_json,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },

        async: true,
        success: function (response_data) {
            if (response_data.success != undefined && response_data.success == true) {
                callback(true, response_data.face_tags);
                CRequests.ReleaseLock();
            }
            else {
                callback(false, response_data.message);
                CRequests.ReleaseLock();
            }
        }
    });
}
CRequests.DelTeeth = function (markvid, callback) {
    if (CRequests.AcquireLock() == false) {
        return;
    }
    if (CRequests.session_id === undefined) {
        console.log('ApplyAutoSegmentation failed! no session id set');
        CRequests.ReleaseLock();
        return;
    }
    var request_data = {
        session_id: CRequests.session_id,
        command_type: "DEL_TEETH",
        mark_vid: markvid
    };
    var req_json = JSON.stringify(request_data);
    $.ajax({
        type: 'POST',
        url: CConfig.server_root + 'command',
        data: req_json,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },

        async: true,
        success: function (response_data) {
            if (response_data.success != undefined && response_data.success == true) {
                callback(true, response_data.deled_faces);
                CRequests.ReleaseLock();
            }
            else {
                callback(false, response_data.message);
                CRequests.ReleaseLock();
            }
        }
    });
}
CRequests.ApplyAutoSegmentation = function (callback) {
    if (CRequests.AcquireLock() == false) {
        return;
    }
    if (CRequests.session_id === undefined) {
        console.log('ApplyAutoSegmentation failed! no session id set');
        CRequests.ReleaseLock();
        return;
    }

    var request_data = {
        session_id: CRequests.session_id,
        command_type: "APPLY_AUTO_SEGMENTATION"
    };

    var req_json = JSON.stringify(request_data);
    // var request_data = '{"session_id":"' + CRequests.session_id + '","vmarks":"' + json_vmarks + '","command_type":"APPLY_SEGMENTATION"}';
    $.ajax({
        type: 'POST',
        url: CConfig.server_root + 'command',
        data: req_json,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },

        async: true,
        success: function (response_data) {
            if (response_data.success != undefined && response_data.success == true) {
                callback(true, response_data.tooth_faces, response_data.tooth_ftags);
                CRequests.ReleaseLock();
            }
            else {
                callback(false, response_data.message);
                CRequests.ReleaseLock();
            }
        }
    });
}
CRequests.ComputeCrownMatrixs = function (centers,fapoints,longaxis,callback) {
    if (CRequests.AcquireLock() == false) {
        return;
    }
    if (CRequests.session_id === undefined) {
        console.log('ComputeCrownMatrixs failed! no session id set');
        CRequests.ReleaseLock();
        return;
    }
    var request_data = {
        session_id: CRequests.session_id,
        data: {
            centers: centers,
            fa_points: fapoints,
            long_axises: longaxis
        },
      
        command_type: "COMPUTE_CROWN_MATRIXS"
    };

    var req_json = JSON.stringify(request_data);
    // var request_data = '{"session_id":"' + CRequests.session_id + '","vmarks":"' + json_vmarks + '","command_type":"APPLY_SEGMENTATION"}';
    $.ajax({
        type: 'POST',
        url: CConfig.server_root + 'command',
        data: req_json,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },

        async: true,
        success: function (response_data) {
            console.log('response data ' + response_data);
            if (response_data.success != undefined && response_data.success == true) {
                callback(true, response_data.matrixs, response_data.invmatrixs);
                CRequests.ReleaseLock();
            }
            else {
                callback(false, response_data.message);
                CRequests.ReleaseLock();
            }
        }
    });
}
CRequests.ApplySegmentation=function(vmarks,callback)
{
    if (CRequests.AcquireLock() == false) {
        return;
    }
    if (CRequests.session_id === undefined) {
        console.log('ApplySegmentation failed! no session id set');
        CRequests.ReleaseLock();
        return;
    }

    var request_data = {
        session_id: CRequests.session_id,
        vmarks: vmarks,
        command_type:"APPLY_SEGMENTATION"
    };

    var req_json= JSON.stringify(request_data);
   // var request_data = '{"session_id":"' + CRequests.session_id + '","vmarks":"' + json_vmarks + '","command_type":"APPLY_SEGMENTATION"}';
    $.ajax({
        type: 'POST',
        url: CConfig.server_root + 'command',
        data: req_json,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },

        async: true,
        success: function (response_data) {
            if(response_data.success!=undefined&&response_data.success==true)
            {
                callback(true, response_data.updated_faces, response_data.updated_ftags);
                CRequests.ReleaseLock();
            }
            else
            {
                callback(false, response_data.message);
                CRequests.ReleaseLock();
            }
        }
    });
}
CRequests.UploadFile =function(file_url,callback)
{
    if (CRequests.AcquireLock() == false) {
        return;
    }
    var request_data = {
        file_url: file_url
       
    };
    var req_json = JSON.stringify(request_data);
    $.ajax({
        type: 'POST',
        url: CConfig.server_root + 'upload',
        data: req_json,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        async: true,
        success: function (response_data) {
            if (response_data.success != undefined && response_data.success == true) {
                CRequests.session_id = response_data.session_id
                CRequests.ReleaseLock();
                callback();
              
            }
            else {
                CRequests.ReleaseLock();
                callback(false, response_data.message);
             
            }
        }
    });

}

CRequests.DetectCrownLandmark=function(callback)
{
    if (CRequests.AcquireLock() == false) {
        return;
    }
    if (CRequests.session_id === undefined) {
        console.log('GetCurrentMesh failed! no session id set');
        CRequests.ReleaseLock();
        return;
    }
    var request_data = '{"session_id":"' + CRequests.session_id + '","command_type":"DETECT_CROWN_LANDMARK"}';
    $.ajax({
        type: 'POST',
        url: CConfig.server_root + 'command',
        data: request_data,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },

        async: true,
        success: function (data) {
            if (data.success === undefined || data.success == false) {
                console.log('DetectCrownLandmark failed!' + data.message);
                alert('DetectCrownLandmark failed!' + data.message);
                callback(false, data.message);
                CRequests.ReleaseLock();
            }
            else {
                console.log('DetectCrownLandmark Success!' + data.message);
                landmark_pos = new Array();

                for (var i = 0; i < data.landmark_pos.length; i = i + 3) {
                    landmark_pos.push(new THREE.Vector3(data.landmark_pos[i], data.landmark_pos[i + 1], data.landmark_pos[i + 2]));

                }
                landmark_fids = new Array();
                for (var i = 0; i < data.landmark_fids.length; i = i + 1)
                {
                    landmark_fids.push(data.landmark_fids[i])
                }
                callback(true, landmark_pos, landmark_fids);
                CRequests.ReleaseLock();
            }

        },
    });
}
CRequests.GetCurrentMesh = function (callback)
{
    if (CRequests.AcquireLock() == false) {
        return;
    }
    if (CRequests.session_id === undefined) {
        console.log('GetCurrentMesh failed! no session id set');
        CRequests.ReleaseLock();
        return;
    }
    var request_data = '{"session_id":"' + CRequests.session_id + '","command_type":"GET_CURRENT_MESH"}';
    $.ajax({
        type: 'POST',
        url: CConfig.server_root + 'command',
        data: request_data,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },

        async: true,
        success: function (data) {
            if (data.success === undefined || data.success == false) {
                console.log('GetCurrentMesh failed!' + data.message);
                alert('GetCurrentMesh failed!' + data.message);
                callback(false, data.message);
                CRequests.ReleaseLock();
            }
            else {
                console.log('GetCurrentMesh Success!' + data.message);
                vertices = new Array();
                
                for (var i = 0; i < data.vertexs.length; i=i+3) {
                    vertices.push(new THREE.Vector3(data.vertexs[i], data.vertexs[i + 1], data.vertexs[i + 2]));
                  
                }
                ftags = new Array();
                faces = new Array();
                for (var i = 0; i < data.faces.length; i = i + 3) {
                    var f=new THREE.Face3(data.faces[i], data.faces[i + 1], data.faces[i + 2]);
                  
                    f.color.copy(new THREE.Color(0xaaaaaa));
                    faces.push(f);
                    ftags.push(-1);
                }
                var geometry = new THREE.Geometry;
                geometry.vertices = vertices;
                geometry.faces = faces;
                geometry.ftags = ftags;
                geometry.updir = new THREE.Vector3(data.updir[0], data.updir[1], data.updir[2]);
                console.log('updir ' + geometry.updir.x + ' ' + geometry.updir.y + ' ' + geometry.updir.z);
                geometry.computeBoundingSphere();
                callback(true, geometry);
                CRequests.ReleaseLock();
            }

        },
    });
}
CRequests.InitAlg=function(callback)
{
    if (CRequests.AcquireLock() == false) {
        return;
    }
    if (CRequests.session_id === undefined)
    {
        console.log('Init failed! no session id set');
        alert('Init failed! no session id set');
        CRequests.ReleaseLock();
        return;
    }
    var request_data = '{"session_id":"' + CRequests.session_id + '","command_type":"INIT"}';
    $.ajax({
        type: 'POST',
        url: CConfig.server_root+'command',
        data: request_data,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
       
        crossDomain: true,
       
        async: true,
        success: function (data) {
            if (data.success === undefined || data.success == false)
            {
                console.log('Init failed!' + data.message);
                alert('Init failed!' + data.message);
                callback(false, data.message);
                CRequests.ReleaseLock();
            }
            else {
                console.log('Init Success!' + data.message);
                CRequests.ReleaseLock();
                callback(true, data.message);
             
            }
           
        },
    });
}