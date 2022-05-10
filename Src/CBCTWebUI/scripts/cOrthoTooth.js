///<reference path="/threejs/build/three.min.js"/>
///<reference path="/scripts/cviewer.js"/>

var CContext = function () {
   
}

CContext.tfUI = new CTransferFuncUI();
CContext.glViewContainer = Object;
CContext.scene = new CScene();
CContext.viewer = new CViewer();
CContext.tfData = [[0, 0], [38.1, 0.083], [76.1, 0.366], [95.3, 0.56], [121.08, 0.734], [154.85, 0.819], [177, 0.75], [198.5, 0.609], [255, 0]];
CContext.selectedMesh = null;
//CContext.cDicomImageViewer = null;
CContext.Init = function () {


    CContext.glViewContainer = document.getElementById('webgl_container');
    CContext.tfUI.Init('transferFuncUIContainer');
    CContext.viewer.Init();

    $('#selectFile').on('change', function (e) {
        var file = e.target.files[0];
        var volumeDataLoader = new CVolumeDataLoader();
       volumeDataLoader.LoadFromLocal(file, function (volumeDataObject) {
           CContext.scene.AddVolumeDataObject(volumeDataObject);
         //  CContext.cDicomImageViewer.SetVolumeData(volumeDataObject.volumeData);
        });
       
       
    });
    CToolManager();
  
   // CContext.cDicomImageViewer = new CDicomImageViewer('dicomImage');
   
}
var main = function () {
   

    CContext.Init();
   

    var tick = function () {
        CContext.viewer.Render();
        requestAnimationFrame(tick);
    }
    tick();
   
}