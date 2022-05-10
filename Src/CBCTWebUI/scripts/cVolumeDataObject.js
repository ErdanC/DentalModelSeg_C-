///<reference path="/scripts/three.min.js"/>
///<reference path="/scripts/cBoxGeometry.js"/>

var CTransferTextureGen = function () {
    this.MAXVALUES = 256;
    this.MAXGRADS = 128;
}

//compute Levoy's transfer function
//list: a list of objects contains joints, x:(fv) and y:(av)
//return : 2d array 1st dimension: 0-255(density of voxel)  2rd dimension: 0-128(corres alpha)
CTransferTextureGen.prototype.GenerateLevoyTF = function (list) {
    if (list.length < 2) {
        console.log("This function requires at least 2 input points ....");
        return;
    }

    // sort the list in x order
    list.sort(function (a, b) {
        if (a.x < b.x)
            return -1;
        if (a.x > b.x)
            return 1;
        return 0;
    });

    var alpha = new Array(this.MAXVALUES);

    for (var idx = 0; idx < this.MAXVALUES; idx++) {
        alpha[idx] = Array.apply(null, new Array(this.MAXGRADS)).map(Number.prototype.valueOf, 0);
    }

    var fvIndexes = new Array(this.MAXVALUES);
    var curIdx = 0;
    var curFv = list[curIdx].x;
    for (var idx = 0; idx < this.MAXVALUES; idx++) {
        if (idx <= curFv) {
            fvIndexes[idx] = curIdx;
        }
        else {
            curIdx += 1;
            fvIndexes[idx] = curIdx;
            if (curIdx < list.length) {
                curFv = list[curIdx].x;
            }
            else {
                curFv = this.MAXVALUES;
            }
        }
    }

    for (var fi = 0; fi < this.MAXVALUES; fi++) {
        var fvIdx = fvIndexes[fi];
        if ((fvIdx < list.length) && (fvIdx > 0)) {
            var fvIdxPlus1 = fvIdx;
            var fvPlus1 = list[fvIdx].x;
            var fv = list[--fvIdx].x;

            for (var grad = 0; grad < this.MAXGRADS; grad++) {
                var coef = (fvPlus1 != fv) ? 1 / (fvPlus1 - fv) : 1;
                var alphaV = list[fvIdx].y;
                var alphaVPlus1 = list[fvIdxPlus1].y;

                alpha[fi][grad] = (2 * grad * ((alphaVPlus1 * coef * (fi - fv)) + (alphaV * coef * (fvPlus1 - fi))))/255.0;
            }
        }
    }

    return (alpha);
}

CTransferTextureGen.prototype.Generate1DTF = function (list) {
    if (list.length < 2) {
        console.log("This function requires at least 2 input points ....");
        return;
    }

    // sort the list in x order
    list.sort(function (a, b) {
        if (a.x < b.x)
            return -1;
        if (a.x > b.x)
            return 1;
        return 0;
    });

    var alpha = new Array(this.MAXVALUES);

    for (var idx = 0; idx < this.MAXVALUES; idx++) {
        alpha[idx] = Array.apply(null, new Array(this.MAXGRADS)).map(Number.prototype.valueOf, 0);
    }
    var fvIndexes = new Array(this.MAXVALUES);
    var curIdx = 0;
    var curFv = list[curIdx].x;
    for (var idx = 0; idx < this.MAXVALUES; idx++) {
        if (idx <= curFv) {
            fvIndexes[idx] = curIdx;
        }
        else {
            curIdx += 1;
            fvIndexes[idx] = curIdx;
            if (curIdx < list.length) {
                curFv = list[curIdx].x;
            }
            else {
                curFv = this.MAXVALUES;
            }
        }
    }

    for (var fi = 0; fi < this.MAXVALUES; fi++) {
        var fvIdx = fvIndexes[fi];
        if ((fvIdx < list.length) && (fvIdx > 0)) {
      
            var pa = list[fvIdx - 1];
            var pb = list[fvIdx];

            var y = pa.y + ((fi - pa.x) / (pb.x - pa.x)) * (pb.y - pa.y);
           // y *= 255;
            for (var grad = 0; grad < this.MAXGRADS; grad++) {
                alpha[fi][grad] = y;
            }
        }
    }
    var preAlpha=alpha[0][0];
    for (var fi = 1; fi < this.MAXVALUES-1; fi++) {
        var tmpAlpha = alpha[fi][0];
        alpha[fi][0] = (preAlpha + alpha[fi + 1][0]) / 2;
        preAlpha = tmpAlpha;
        for (var grad = 1; grad < this.MAXGRADS; grad++) {
            alpha[fi][grad] =alpha[fi][0];
        }
    }
    return (alpha);

}
CTransferTextureGen.prototype.GenInitialTfTexture = function () {
  

    var list = new Array();
    for (var i = 0; i < CContext.tfData.length; i++) {

        if (CContext.tfData[i].x == undefined)
            list.push({ x: CContext.tfData[i][0], y: CContext.tfData[i][1] });
        else
            list.push({ x: CContext.tfData[i].x, y: CContext.tfData[i].y });
    }
   var levoyTF = this.GenerateLevoyTF(list);
    //var levoyTF = this.Generate1DTF(list);
    return this.GenTextureFromTF(levoyTF);
}
CTransferTextureGen.prototype.GenTextureFromTF = function (tf) {
    var width = this.MAXVALUES;
    var height=this.MAXGRADS;
    var data2D =  new Float32Array(width * height);

    var indexx = 0;
 
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var color = tf[x][y];
            data2D[indexx++] = color;
        }
    }

   
 
   
    var tfTexture = new THREE.DataTexture(data2D, width, height, THREE.LuminanceFormat, THREE.FloatType);
    tfTexture.needsUpdate = true;
    return tfTexture;
}
CTransferTextureGen.prototype.GenTextureFromTFJointPair = function (list) {
     var levoyTF = this.GenerateLevoyTF(list);
    //var levoyTF = this.Generate1DTF(list);
    return this.GenTextureFromTF(levoyTF);

}

CVolumeData = function (gltexture, numberOfSlices, slicesOverX, slicesOverY, dataFrames) {
    this.texture = gltexture;
    this.numberOfSlices = numberOfSlices;
    this.slicesOverX = slicesOverX;
    this.slicesOverY = slicesOverY;
    this.dataFrames = dataFrames;
    this.width = dataFrames[0].width;
    this.height = dataFrames[0].height;
    this.depth = dataFrames.length;
    this.packedDataWidth=this.width*this.slicesOverX;
    this.packedDataHeight=this.height*this.slicesOverY;
    this.volumeDataFlag = new Uint8Array(this.packedDataWidth * this.packedDataHeight);//data stored in row major(packed)
    //for (var i = 0; i < this.volumeDataFlag.length; i++) {
    //    this.volumeDataFlag[i] = 100;
    //}
    this.volumeDataFlagTexture = new THREE.DataTexture(this.volumeDataFlag, this.packedDataWidth, this.packedDataHeight, THREE.LuminanceFormat, THREE.UnsignedByteType);
    this.volumeDataFlag = this.volumeDataFlagTexture.image.data;
    this.volumeDataFlagTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.volumeDataFlagTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.volumeDataFlagTexture.magFilter = THREE.LinearFilter;
    this.volumeDataFlagTexture.minFilter = THREE.LinearFilter;
    this.volumeDataFlagTexture.needsUpdate = true;
    this.volumeDataFlagTexture.flipY = false;
}

CVolumeDataObject = function (volumeData) {
 
    this.isDataReady = false;
    this.volumeBackRender = new THREE.Scene();
    this.volumeBackRender.renderTarget = new THREE.WebGLRenderTarget(CContext.glViewContainer.offsetWidth, CContext.glViewContainer.offsetHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType });

    this.volumeFrontRender = new THREE.Scene();
    this.volumeFrontRender.renderTarget = new THREE.WebGLRenderTarget(CContext.glViewContainer.offsetWidth, CContext.glViewContainer.offsetHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType });

    this.volumeRender = new THREE.Scene();
    this.volumeRender.renderTarget = null;
    




    this.renderAsImage = false;





   
    if (volumeData != undefined) {
        this.SetVolumeData(volumeData);
    }

}
//left bottom is the start point of voxel
//voxelCoord/packedCoord(Vector3),
//return uint
CVolumeDataObject.prototype.ConvertVoxelCoord2PackedCoord = function (voxelCoord) {

    var row = Math.floor(voxelCoord.z / this.volumeData.slicesOverX) * this.volumeData.height + voxelCoord.y;
    var col = (voxelCoord.z % this.volumeData.slicesOverX) * this.volumeData.width + voxelCoord.x;
    return this.volumeData.packedDataWidth * (row - 1) + col;
}
//voxelarray:array of voxels[voxelCoord(Vector3),value(uint8) to be updated
//left bottom is the start point of voxel
CVolumeDataObject.prototype.UpdateVolumeDataFlag = function (voxelarray) {
    for (var i = 0; i < voxelarray.length; i++) {
        var value = voxelarray[i].value;
        var voxelCoord = voxelarray[i].voxelCoord;
        var pixelCoord = this.ConvertVoxelCoord2PackedCoord(voxelCoord);
        this.volumeData.volumeDataFlag[pixelCoord] = value;
    }
    //for (var i = 0; i < this.volumeData.volumeDataFlag.length; i++) {
    //    this.volumeData.volumeDataFlag[i] = 100;
    //}
    //   CContext.viewer.renderer.getContext().deleteTexture(this.volumeData.volumeDataFlagTexture);
  //  this.volumeData.volumeDataFlagTexture.image = this.volumeData.volumeDataFlag;
    //this.volumeData.volumeDataFlagTexture = new THREE.DataTexture(this.volumeData.volumeDataFlag, this.volumeData.packedDataWidth, this.volumeData.packedDataHeight, THREE.LuminanceFormat, THREE.UnsignedByteType);
    //this.volumeData.volumeDataFlagTexture.wrapS = THREE.ClampToEdgeWrapping;
    //this.volumeData.volumeDataFlagTexture.wrapT = THREE.ClampToEdgeWrapping;
    //this.volumeData.volumeDataFlagTexture.magFilter = THREE.LinearFilter;
    //this.volumeData.volumeDataFlagTexture.minFilter = THREE.LinearFilter;
    //this.volumeData.volumeDataFlagTexture.flipY = false;
    this.volumeData.volumeDataFlagTexture.needsUpdate = true;
   
    this.volumeRender.material.uniforms.u_VolumeDataFlag.value = this.volumeData.volumeDataFlagTexture;
}
//voxelarray:array of voxels[voxelCoord(Vector3,normalized),value(uint8) to be updated
//left bottom is the start point of voxel
CVolumeDataObject.prototype.UpdateVolumeDataFlagUsingNormalizeCoord = function (nvoxelarray,radius) {
    var voxelarray = new Array();
    for (var i = 0; i < nvoxelarray.length; i++) {
        var coord = nvoxelarray[i].voxelCoord.clone();
        coord.x = Math.ceil(coord.x * this.volumeData.width);
        coord.y = Math.ceil(coord.y * this.volumeData.height);
        coord.z = Math.ceil(coord.z * this.volumeData.depth);
        var v = new Object();
        v.voxelCoord = coord;
        v.value = nvoxelarray[i].value;
        voxelarray.push(v);
    }
    this.UpdateVolumeDataFlag(voxelarray);
}
//mousepos(THREE.Vector2) is in image space
CVolumeDataObject.prototype.ReadFrontTexCoordRenderTargetPixel = function (render, mousepos) {
    var pixel = new Float32Array(4);
    render.readRenderTargetPixels(this.volumeFrontRender.renderTarget, mousepos.x, CContext.glViewContainer.offsetHeight - mousepos.y, 1, 1, pixel);
    return pixel;
}
CVolumeDataObject.prototype.SetRenderAsImage = function (flag) {
    this.renderAsImage = flag;
    this.volumeRender.material.uniforms.u_RenderAsImage.value = flag;
}
CVolumeDataObject.prototype.ToggleRenderType = function () {//image or raycasting
    if (this.renderAsImage)
        this.renderAsImage = false;
    else
        this.renderAsImage = true;
    this.volumeRender.material.uniforms.u_RenderAsImage.value = this.renderAsImage;
}


CVolumeDataObject.prototype.SetTransferTexture=function(tfTexture){
    this.volumeRender.material.uniforms.uTransferFunction.value = tfTexture;
}
CVolumeDataObject.prototype.GetLocalCoordFrom3dTexCoord = function (texCoord) {
    return this.cubegeo.GetLocalCoordFrom3dTexCoord(texCoord);
}
CVolumeDataObject.prototype.SetVolumeData = function (volumeData) {

    this.volumeData = volumeData;
    var maxlen = this.volumeData.width > this.volumeData.height ? this.volumeData.width : this.volumeData.height;
    if (maxlen < this.volumeData.depth)
        maxlen = this.volumeData.depth;
    var scale = 1.2;
    this.cubegeo = new CBoxBufferGeometry(this.volumeData.width / maxlen * scale, this.volumeData.height / maxlen * scale, this.volumeData.depth / maxlen * scale);
    this.frontTexCoordMaterial = new THREE.ShaderMaterial({



        vertexShader: LoadResource('shaders/frontTexCoordRender.vert'),
        fragmentShader: LoadResource('shaders/frontTexCoordRender.frag'),
        side: THREE.FrontSide,
        depthFunc: THREE.GreaterEqualDepth

    });




    var cubemesh = new THREE.Mesh(this.cubegeo, this.frontTexCoordMaterial);
    this.volumeFrontRender.add(cubemesh);


    var backTexCoordMaterial = new THREE.ShaderMaterial({


        vertexShader: LoadResource('shaders/backTexCoordRender.vert'),
        fragmentShader: LoadResource('shaders/backTexCoordRender.frag'),
        side: THREE.BackSide,
        depthFunc: THREE.LessEqualDepth

    });
    var cubemesh = new THREE.Mesh(this.cubegeo, backTexCoordMaterial);
    this.volumeBackRender.add(cubemesh);


 
    var textureColorBar = THREE.ImageUtils.loadTexture('resources/tf.png');
    textureColorBar.wrapS = THREE.ClampToEdgeWrapping;
    textureColorBar.wrapT = THREE.ClampToEdgeWrapping;
    textureColorBar.magFilter = THREE.LinearFilter;

    var tfGen = new CTransferTextureGen();

    var volumeRenderMaterial = new THREE.ShaderMaterial({

        uniforms: {
            u_FrontTexCoordMap: { value: this.volumeFrontRender.renderTarget.texture },
            u_BackTexCoordMap: { value: this.volumeBackRender.renderTarget.texture },
            u_TextureMap: { value: volumeData.texture },
            u_numberOfSlices: { value: volumeData.numberOfSlices },
            u_SlicesOverX: { value: volumeData.slicesOverX },
            u_SlicesOverY: { value: volumeData.slicesOverY },
            u_RenderAsImage:{value: this.renderAsImage},
            // uTransferFunction: { value: textureColorBar },
            u_VolumeDataFlag: { value: volumeData.volumeDataFlagTexture },
            u_EnvironmentDepth: { value: null},
            u_withEnvDepth: { value: 0 },
            uTransferFunction: { value: tfGen.GenInitialTfTexture() }

        },
        vertexShader: LoadResource('shaders/volumeRender.vert'),
        fragmentShader: LoadResource('shaders/volumeRender.frag'),

        side: THREE.BackSide,
        transparent: true,
        depthFunc: THREE.LessEqualDepth


    });

    cubemesh = new THREE.Mesh(this.cubegeo, volumeRenderMaterial);
    this.volumeRender.add(cubemesh);
    this.volumeRender.material = volumeRenderMaterial;

    this.isDataReady = true;
}

CVolumeDataObject.prototype.SetEnvDepth = function (envDepth) {
    if (this.isDataReady == false)
        return;
    this.volumeRender.material.uniforms.u_EnvironmentDepth.value = envDepth.texture;
    this.volumeRender.material.uniforms.u_withEnvDepth.value = 1;
}
CVolumeDataObject.prototype.Render = function (glRender, camera, sceneDepth) {

    if (this.isDataReady == false)
        return;
    glRender.autoClear = true;
    glRender.state.buffers.depth.setClear(0xff);
    glRender.clearDepth();






    glRender.state.buffers.depth.setClear(0xff);
  

    glRender.render(this.volumeBackRender, camera, this.volumeBackRender.renderTarget);
    glRender.state.buffers.depth.setClear(0);
    glRender.clearDepth();


    for (var i = 0; i < this.volumeFrontRender.children.length; i++) {
        var obj = this.volumeFrontRender.children[i];
        if (obj.isViewPlane != undefined && obj.isViewPlane == true) {
            this.volumeFrontRender.remove(obj);
        }
    }

    var uvCoord = this.cubegeo.GetUVCoord();
    var viewPlane = new THREE.Mesh(new CViewPlaneGeometry(camera, uvCoord.uvCenter, uvCoord.uvxDir, uvCoord.uvyDir, uvCoord.uvzDir), this.frontTexCoordMaterial);
    viewPlane.isViewPlane = true;
    this.volumeFrontRender.add(viewPlane);
   



   //glRender.render(this.volumeFrontRender, camera, null);
    glRender.render(this.volumeFrontRender, camera, this.volumeFrontRender.renderTarget);


    glRender.state.buffers.depth.setClear(0xff);


    glRender.autoClear = false;
    glRender.clearDepth();
    glRender.render(this.volumeRender, camera, this.volumeRender.renderTarget);
}