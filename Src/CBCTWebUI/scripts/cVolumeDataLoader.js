CVolumeDataLoader = function () {

}
CVolumeDataLoader.prototype.LoadDICOMDataFromHttp=function(url,loadDataFunc) {
   
    // since this is a multi-frame example, we need to load the DICOM SOP Instance into memory and parse it
    // so we know the number of frames it has so we can create the stack.  Calling load() will increment the reference
    // count so it will stay in memory until unload() is explicitly called and all other reference counts
    // held by the cornerstone cache are gone.  See below for more info
    cornerstoneWADOImageLoader.dataSetCacheManager.load(url, cornerstoneWADOImageLoader.internal.xhrRequest).then(function (dataSet) {
        // dataset is now loaded, get the # of frames so we can build the array of imageIds
        var numFrames = dataSet.intString('x00280008');
        if (!numFrames) {
            alert('Missing element NumberOfFrames (0028,0008)');
            return;
        }

        var imageIds = [];
        var imageIdRoot = url.replace('http', 'wadouri');
        for (var i = 0; i < numFrames; i++) {
            var imageId = imageIdRoot + "?frame=" + i;
            imageIds.push(imageId);
        }


        var dataFrames = new Array(numFrames);
        var cid = 0;
        var errFunc = function (err) {
            alert(err);
        }
        var loadImgFunc = function (image) {
            var imageData = image.getImageData();
            
            dataFrames[cid] = new Object();
            dataFrames[cid].width = imageData.width;
            dataFrames[cid].height = imageData.height;
            dataFrames[cid].data = new Uint8Array(imageData.data.length);
            for (var i = 0; i < imageData.data.length; i++) {
                dataFrames[cid].data[i] = imageData.data[i];
            }
            cid++;
            //console.log('cid ' + cid);
            if (cid < numFrames)
                cornerstone.loadAndCacheImage(imageIds[cid]).then(loadImgFunc, errFunc);
            else {
                loadDataFunc(dataFrames);
                cornerstoneWADOImageLoader.dataSetCacheManager.unload(url);
            }
        }
        cornerstone.loadAndCacheImage(imageIds[cid]).then(loadImgFunc, errFunc);

    });

}
CVolumeDataLoader.prototype.LoadDICOMDataFromLocal = function (selFile, loadDataFunc) {
    

    var imageId = cornerstoneWADOImageLoader.fileManager.add(selFile);
    var dataFrames = new Array();

    var firstFrameId = imageId + '?frame=0';
    cornerstone.loadImage(firstFrameId).then(function (image) {

        //var element = $('#dicomImage').get(0);
        //cornerstone.enable(element);
       
        //cornerstone.displayImage(element, image);

        var numFrames = image.data.string('x00280008');
        var imageData = image.getImageData();
        dataFrames[0] = new Object();
        dataFrames[0].width = imageData.width;
        dataFrames[0].height = imageData.height;
        dataFrames[0].image = image;
        //dataFrames[0].data = new Uint8Array(imageData.data.length);
        //for (var i = 0; i < imageData.data.length; i++) {
        //    dataFrames[0].data[i] = imageData.data[i];
        //}
        var fcount = 1;
        for (var fid = 1; fid < numFrames; fid++) {
            var frameId = imageId + '?frame=' + fid;
            cornerstone.loadImage(frameId).then(function (image) {
                //cornerstone.displayImage(element, image);
                var imageData = image.getImageData();
                var tmpid = image.imageId.indexOf("?frame=");
                var cid = image.imageId.substring(tmpid + 7, image.imageId.length);
             //   console.log(cid);
                dataFrames[cid] = new Object();
                dataFrames[cid].width = imageData.width;
                dataFrames[cid].height = imageData.height;
                dataFrames[cid].image = image;
              //  dataFrames[cid].data = new Uint8Array(imageData.data.length);
                //for (var i = 0; i < imageData.data.length; i++) {
                //    dataFrames[cid].data[i] = imageData.data[i];
                //}
                fcount++;
                if (fcount == numFrames) {
                    loadDataFunc(dataFrames);

                  
                       // cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
                       // // Set the stack as tool state
                       // cornerstoneTools.addStackStateManager(element, ['stack', 'playClip']);
                       //// cornerstoneTools.addToolState(element, 'stack', stack);
                       // // Start playing the clip
                       // // TODO: extract the frame rate from the dataset
                       // var frameRate = 10;
                       // cornerstoneTools.playClip(element, frameRate);
                 
                }
            });
        }
    });
   

}
//densPacked: packed gray scale image
//colume major
CVolumeDataLoader.prototype.PackToGrayScale = function (dataFrames) {
    var columnNum=Math.floor(Math.sqrt(dataFrames.length));
    var rowNum=Math.ceil(dataFrames.length/columnNum);
    var perFrameWidth=dataFrames[0].width;
    var perFrameHeight = dataFrames[0].height;
    var width=columnNum*perFrameWidth;
    var height = rowNum * perFrameHeight;
    var resImage = new Object();
    resImage.data = new Uint8Array(width * height);//data stored in row major
 
    for(var i=0;i<rowNum;i++){
        for(var j=0;j<columnNum;j++){
            for (var k = 0; k < perFrameHeight; k++) {
                for (var t = 0; t < perFrameWidth; t++) {
                    var frameId=i*rowNum+j;
                    if(frameId<dataFrames.length){
                        var r=i*perFrameHeight+k;
                        var c = j * perFrameWidth + t;
                        var lid = (r * width + c) ;
                        var rid=((perFrameHeight - 1 - k) * perFrameWidth + t) * 4;
                        resImage.data[lid] = dataFrames[frameId].image.getImageData().data[rid];
                        //resImage.data[lid + 1] = dataFrames[frameId].data[rid + 1];
                        //resImage.data[lid + 2] = dataFrames[frameId].data[rid + 2];
                        //resImage.data[lid + 3] = dataFrames[frameId].data[rid + 3];

                   



                    }
                    else{
                        t=width;k=height;i=rowNum;j=columnNum;
                        break;
                    }
                   
                }
            }
        }
    }
    resImage.width=width;
    resImage.height = height;
    resImage.columnNum = columnNum;
    resImage.rowNum = rowNum;
    return resImage;
}
CVolumeDataLoader.prototype.LoadFromLocal = function (selFile,callback) {

    var packedImage = new Object();
    var tex = new Object();
    
    var fatherthis = this;
    var volumeDataObject = new CVolumeDataObject();
    this.LoadDICOMDataFromLocal(selFile, function (dataFrames) {
        packedImage = fatherthis.PackToGrayScale(dataFrames);
        tex = new THREE.DataTexture(packedImage.data, packedImage.width, packedImage.height, THREE.LuminanceFormat, THREE.UnsignedByteType);

        //  tex = new THREE.DataTexture(dataFrames[50].data, dataFrames[50].width, dataFrames[50].height, THREE.RGBAFormat, THREE.UnsignedByteType);

        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        tex.flipY = false;
        var volumeData = new CVolumeData(tex, packedImage.columnNum * packedImage.rowNum, packedImage.columnNum, packedImage.rowNum, dataFrames);
        //volumeData.texture = tex;
        //volumeData.numberOfSlices = packedImage.columnNum * packedImage.rowNum;
        //volumeData.slicesOverX = packedImage.columnNum;
        //volumeData.slicesOverY = packedImage.rowNum;
        //volumeData.dataFrames = dataFrames;
        volumeDataObject.SetVolumeData(volumeData);
        if (callback != undefined) {
            callback(volumeDataObject);
        }


    });

    //  var tex = THREE.ImageUtils.loadTexture(url);

    return volumeDataObject;


}
CVolumeDataLoader.prototype.LoadFromHttp = function (url) {
   
    var packedImage = new Object();
    var tex = new Object();
   
    var fatherthis = this;
    var volumeDataObject = new CVolumeDataObject();
    this.LoadDICOMDataFromHttp(url, function (dataFrames) {
        packedImage = fatherthis.PackToGrayScale(dataFrames);
        tex = new THREE.DataTexture(packedImage.data, packedImage.width, packedImage.height, THREE.LuminanceFormat, THREE.UnsignedByteType);
     
      //  tex = new THREE.DataTexture(dataFrames[50].data, dataFrames[50].width, dataFrames[50].height, THREE.RGBAFormat, THREE.UnsignedByteType);
      
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        tex.flipY = false;
        var volumeData = new CVolumeData(tex, packedImage.columnNum * packedImage.rowNum, packedImage.columnNum, packedImage.rowNum, dataFrames);
        //volumeData.texture = tex;
        //volumeData.numberOfSlices = packedImage.columnNum * packedImage.rowNum;
        //volumeData.slicesOverX = packedImage.columnNum;
        //volumeData.slicesOverY = packedImage.rowNum;
        //volumeData.packedImage = packedImage;
        volumeDataObject.SetVolumeData(volumeData);


       
    });

  //  var tex = THREE.ImageUtils.loadTexture(url);
 
    return volumeDataObject;


}