









var CContext = function () {
   
}





 
CContext.LoadJsFiles = function (callback) {
    callback();
    return;
    $.getScript(CConfig.server_html_host + "scripts/threejs/three.min.js", function () {
        $.getScript(CConfig.server_html_host + "scripts/threejs/stats.min.js", function () {
            $.getScript(CConfig.server_html_host + "scripts/threejs/TrackballControls.js", function () {
                $.getScript(CConfig.server_html_host + "scripts/threejs/OrbitControls.js", function () {
                    $.getScript(CConfig.server_html_host + "scripts/threejs/STLLoader.js", function () {
                        $.getScript(CConfig.server_html_host + "scripts/threejs/OBJLoader.js", function () {
                            $.getScript(CConfig.server_html_host + "scripts/threejs/FileSaver.js", function () {
                                $.getScript(CConfig.server_html_host + "scripts/threejs/OBJExporter.js", function () {
                                    $.getScript(CConfig.server_html_host + "scripts/threejs/STLExporter.js", function () {
                                    $.getScript(CConfig.server_html_host + "scripts/threejs/MTLLoader.js", function () {
                                        $.getScript(CConfig.server_html_host + "scripts/threejs/DDSLoader.js", function () {
                                            $.getScript(CConfig.server_html_host + "scripts/cMeshObject.js", function () {
                                                $.getScript(CConfig.server_html_host + "scripts/requests.js", function () {
                                                    $.getScript(CConfig.server_html_host + "scripts/tools/cLandmarkTool.js", function () {
                                                        $.getScript(CConfig.server_html_host + "scripts/tools/cCrownSegTool.js", function () {
                                                            $.getScript(CConfig.server_html_host + "scripts/tools/cManipulationTool.js", function () {
                                                                $.getScript(CConfig.server_html_host + "scripts/cToolManager.js", function () {
                                                                    $.getScript(CConfig.server_html_host + "scripts/cScene.js", function () {
                                                                        $.getScript(CConfig.server_html_host + "scripts/CViewer.js", function () {
                                                                            $.getScript(CConfig.server_html_host + "scripts/cToolManager.js", function () { });
                                                                            callback();
                                                                        });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });




}
CContext.Init = function (container_id,init_callback) {
    CContext.LoadJsFiles(function () {

        CContext.glViewContainer = Object;
        CContext.scene = new CScene();
        CContext.viewer = new CViewer();
        CContext.selectedMesh = null;


        CContext.tagColors = new Map();
        CContext.tagColors.set(-1, new THREE.Color(0xaaaaaa));
        CContext.glViewContainer = document.getElementById(container_id);

        CContext.viewer.Init();

        $('#upload-file-btn').click(function () {


            var formData = new FormData($('#stl_uploader')[0]);
            formData.append('file', $('input[type=file]')[0].files[0]);


            // var file = $('#stl_uploader')[0];
            //  var form_data = new FormData($('#stl_uploader')[0]);
            //  var form_data = new FormData();
            //form_data.append('files', file);
            $.ajax({
                type: 'POST',
                url: CConfig.server_root + 'upload',
                data: formData,
                timeout: 1000000,
                contentType: false,
                dataType: 'json',
                processData: false,
                async: true,
                xhrFields: {
                    withCredentials: true
                },

                crossDomain: true,
                success: function (data) {
                    if (data.session_id === undefined || data.success == false) {
                        console.log('upload failed!');
                    }
                    else {
                        console.log('upload success!');
                        CRequests.session_id = data.session_id;
                        CRequests.InitAlg(function (flag, message) {
                            if (flag == true) {
                                CRequests.GetCurrentMesh(function (flag, geometry) {
                                    if (flag == true) {
                                        var material = new THREE.MeshPhongMaterial({ specular: 0xaaaaaa, shininess: 4, wireframe: false, shading: THREE.FlatShading, side: THREE.DoubleSide, vertexColors: THREE.FaceColors });
                                        var mesh = new THREE.Mesh(geometry, material);
                                        mesh.geometry.normalsNeedUpdate = true;
                                        mesh.type = 'dentalmesh';
                                        mesh.geometry.computeBoundingBox();
                                        //mesh.position.set(0, -0.25, 0.6);
                                        // mesh.rotation.set(0, -Math.PI, 0);
                                        mesh.crownFidMap = {};
                                        mesh.longAxises = {};
                                        mesh.toothLandmarks = new Set();
                                        mesh.crowncenter = {};
                                        mesh.faPoints = {};
                                        mesh.walaPoints = new Set();
                                        mesh.contactPoints = new Set();
                                        mesh.occlusionPoints = new Set();
                                        mesh.castShadow = true;
                                        mesh.receiveShadow = true;
                                        CContext.selectedMesh = mesh;
                                        CContext.scene.AddMeshObject(CContext.selectedMesh);


                                    }
                                });
                            }
                            else {

                            }
                        });

                    }

                },
            });
        });

        CToolManager();
        var tick = function () {
            CContext.viewer.Render();
            requestAnimationFrame(tick);
        }
        tick();


        //CRequests.UploadFile(file_url, function (flag) {
        //    if (flag == false)
        //    {
        //        console.log('upload failed');
        //    }
        //    else {
        //        CRequests.InitAlg(function (flag, message) {
        //            if (flag == true) {
        //                CRequests.GetCurrentMesh(function (flag, geometry) {
        //                    if (flag == true) {
        //                        var material = new THREE.MeshPhongMaterial({ specular: 0xaaaaaa, shininess: 4, wireframe: false, shading: THREE.FlatShading, side: THREE.DoubleSide, vertexColors: THREE.FaceColors });
        //                        var mesh = new THREE.Mesh(geometry, material);
        //                        mesh.geometry.normalsNeedUpdate = true;
        //                        mesh.type = 'dentalmesh';
        //                        mesh.geometry.computeBoundingBox();
        //                        //mesh.position.set(0, -0.25, 0.6);
        //                       // mesh.rotation.set(0, -Math.PI, 0);
        //                        mesh.crownFidMap = {};
        //                        mesh.longAxises = {};
        //                        mesh.toothLandmarks = new Set();
        //                        mesh.crowncenter = {};
        //                        mesh.faPoints = {};
        //                        mesh.walaPoints = new Set();
        //                        mesh.contactPoints = new Set();
        //                        mesh.occlusionPoints = new Set();
        //                        mesh.castShadow = true;
        //                        mesh.receiveShadow = true;
        //                        CContext.selectedMesh = mesh;
        //                        CContext.scene.AddMeshObject(CContext.selectedMesh);
        //                        init_callback();

        //                    }
        //                });
        //            }
        //            else {

        //            }
        //        });
        //    }

        //});
    });
    function ReadLandmarks(e) {
        var file = e.target.files[0];
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            var contents = e.target.result;
            var contents_byline = contents.split('\n');
            for(let line of contents_byline) {
                var eles = line.split(' ');
                if(eles[0][0]=='#')
                {
                    continue;
                }
                else if (eles[0] == "cruspray:")
                {
                    var origin = new THREE.Vector3();
                    origin.x = parseFloat(eles[1]);
                    origin.y = parseFloat(eles[2]);
                    origin.z = parseFloat(eles[3]);
                    var direction = new THREE.Vector3();
                    direction.x = parseFloat(eles[4]);
                    direction.y = parseFloat(eles[5]);
                    direction.z = parseFloat(eles[6]);

                    var ray = new THREE.Ray();
                    ray.origin = origin;
                    ray.direction = direction;
                    CLandmarkTool.PickLandmarkByRay(ray, 'surfacelandmark');
                }
                else if (eles[0] == "walaray:") {
                    var origin = new THREE.Vector3();
                    origin.x = parseFloat(eles[1]);
                    origin.y = parseFloat(eles[2]);
                    origin.z = parseFloat(eles[3]);
                    var direction = new THREE.Vector3();
                    direction.x = parseFloat(eles[4]);
                    direction.y = parseFloat(eles[5]);
                    direction.z = parseFloat(eles[6]);

                    var ray = new THREE.Ray();
                    ray.origin = origin;
                    ray.direction = direction;
                    CLandmarkTool.PickLandmarkByRay(ray, 'walapoint');
                }
                else if (eles[0] == "faray:") {
                    var origin = new THREE.Vector3();
                    origin.x = parseFloat(eles[1]);
                    origin.y = parseFloat(eles[2]);
                    origin.z = parseFloat(eles[3]);
                    var direction = new THREE.Vector3();
                    direction.x = parseFloat(eles[4]);
                    direction.y = parseFloat(eles[5]);
                    direction.z = parseFloat(eles[6]);

                    var ray = new THREE.Ray();
                    ray.origin = origin;
                    ray.direction = direction;
                    CLandmarkTool.PickLandmarkByRay(ray, 'fapoint');
                }
                else if (eles[0] == "occlusalray:") {
                    var origin = new THREE.Vector3();
                    origin.x = parseFloat(eles[1]);
                    origin.y = parseFloat(eles[2]);
                    origin.z = parseFloat(eles[3]);
                    var direction = new THREE.Vector3();
                    direction.x = parseFloat(eles[4]);
                    direction.y = parseFloat(eles[5]);
                    direction.z = parseFloat(eles[6]);

                    var ray = new THREE.Ray();
                    ray.origin = origin;
                    ray.direction = direction;

                    CLandmarkTool.PickLandmarkByRay(ray, 'occlusionpoint');
                }
                else if (eles[0] == "contactray:") {
                    var origin = new THREE.Vector3();
                    origin.x = parseFloat(eles[1]);
                    origin.y = parseFloat(eles[2]);
                    origin.z = parseFloat(eles[3]);
                    var direction = new THREE.Vector3();
                    direction.x = parseFloat(eles[4]);
                    direction.y = parseFloat(eles[5]);
                    direction.z = parseFloat(eles[6]);

                    var ray = new THREE.Ray();
                    ray.origin = origin;
                    ray.direction = direction;
                    CLandmarkTool.PickLandmarkByRay(ray, 'contactpoint');
                }
                //else if (eles[0] == "longaxis") {
                //    var position = new THREE.Vector3();
                //    position.x = parseFloat(eles[1]);
                //    position.y = parseFloat(eles[2]);
                //    position.z = parseFloat(eles[3]);
                //    var direction = new THREE.Vector3();
                //    direction.x = parseFloat(eles[4]);
                //    direction.y = parseFloat(eles[5]);
                //    direction.z = parseFloat(eles[6]);
                //}

                
            }
        };
        reader.readAsText(file);
    }
    document.getElementById('landmark_file').addEventListener('change', ReadLandmarks, false);
   
   
}
var InitCrownSeg = function (container_id) {
    InitCrownSeg.container_id = container_id
    return InitCrownSeg;
    
}
InitCrownSeg.GetSegmentationResult = function ()
{

    return CContext.selectedMesh;
}
InitCrownSeg.Init=function(callback)
{
    CContext.Init(InitCrownSeg.container_id,  callback);
    return InitCrownSeg;
}
