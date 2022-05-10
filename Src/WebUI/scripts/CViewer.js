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







CViewer.prototype.ResetCamera = function () {
    if (this.camera == undefined || this.camera == null) {
       
            this.camera = new THREE.PerspectiveCamera(45, CContext.glViewContainer.offsetWidth / CContext.glViewContainer.offsetHeight, 0.001, 1000);
    }
  
    this.camera.position.x = 0;
    this.camera.position.y = -40;
    this.camera.position.z = 120;
    this.camera.up = new THREE.Vector3(0, 1, 0);
   this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();
  

}
CViewer.prototype.Init = function () {


  

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






