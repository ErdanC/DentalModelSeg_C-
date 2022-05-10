///<reference path="/threejs/build/three.min.js"/>
///<reference path="/threejs/examples/js/controls/TrackballControls.js"/>
///<reference path="/scripts/cBoxGeometry.js"/>


function LoadResource(url,common) {
    var req = new XMLHttpRequest();
    req.open('GET', url, false);
    req.overrideMimeType('text/plain; charset=x-user-defined');
    req.send(null); 

    if (req.status != 200) return '';
    var resText = req.responseText;
    if (common != undefined) {
        var commonText = LoadResource(common);
        resText = commonText + "\n" + resText;
    }
    return resText;
}


var CViewer = function () {
    
   

  
   

}






CViewer.prototype.ToggleCamera = function () {
    var tmpcamera = this.camera;
   
    if (this.camera.type == 'PerspectiveCamera') {
        this.camera = new THREE.OrthographicCamera(-1, 1, CContext.glViewContainer.offsetHeight / CContext.glViewContainer.offsetWidth, -CContext.glViewContainer.offsetHeight / CContext.glViewContainer.offsetWidth, 0, 1000);

    }
    else {
        this.camera = new THREE.PerspectiveCamera(45, CContext.glViewContainer.offsetWidth / CContext.glViewContainer.offsetHeight, 0.001, 1000);

    }
    this.camera.position.set(tmpcamera.position.x,tmpcamera.position.y,tmpcamera.position.z);
    this.camera.quaternion.set( tmpcamera.quaternion.x, tmpcamera.quaternion.y, tmpcamera.quaternion.z, tmpcamera.quaternion.w);
    this.camera.up.set(tmpcamera.up.x,tmpcamera.up.y,tmpcamera.up.z);
  
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();
}

//mousepos(THREE.Vector2) is in image space
//return  [key,pixel(Vector4)]
CViewer.prototype.ReadVolumeDataFrontTexCoordRenderTargetPixel = function (mousepos) {
    var pdata =CContext.scene.ReadVolumeDataFrontTexCoordRenderTargetPixel(this.renderer, mousepos);
    return pdata;
}
CViewer.prototype.ResetCamera = function () {
    if (this.camera == undefined || this.camera == null) {
       
            this.camera = new THREE.PerspectiveCamera(45, CContext.glViewContainer.offsetWidth / CContext.glViewContainer.offsetHeight, 0.001, 1000);
    }
  
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 1.6;
    this.camera.up = new THREE.Vector3(0, 1, 0);
   this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();
  

}
CViewer.prototype.Init = function () {


    //var volumeDataLoader = new CVolumeDataLoader();
    // this.volumeDataObject = volumeDataLoader.Load('http://localhost:49975/resources/data.dcm');


    this.ResetCamera();

    CContext.scene = new CScene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xffffff);
    //this.renderer.setClearColor(0x0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(CContext.glViewContainer.offsetWidth, CContext.glViewContainer.offsetHeight);
    CContext.glViewContainer.appendChild(this.renderer.domElement);
    var windowHalfX = CContext.glViewContainer.offsetWidth / 2;
    var windowHalfY = CContext.glViewContainer.offsetHeight / 2;

    this.stats = new Stats();

  










    CContext.glViewContainer.onresize = this.OnResize;







    
   
 
}


CViewer.prototype.OnResize = function () {



    if (CContext.viewer.camera != undefined) {
        CContext.viewer.camera.aspect = CContext.glViewContainer.offsetWidth / CContext.glViewContainer.offsetHeight;
        CContext.viewer.camera.updateProjectionMatrix();
    }
    CContext.viewer.renderer.setSize(CContext.glViewContainer.offsetWidth, CContext.glViewContainer.offsetHeight);

}
CViewer.prototype.Render = function () {

    
   
 
   
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();


    this.stats.begin();


   


    CContext.scene.Render(this.renderer, this.camera);

   


   
 
    this.stats.end();

}






