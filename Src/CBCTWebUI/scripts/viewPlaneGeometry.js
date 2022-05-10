
//proj vec to dir
var ComputeProjectionLen=function(vec,dir){
   var res= vec.dot(dir);
   var len = dir.length();
   res = res / (len * len);
   return res;
}
var ComputeUvFromUvDir=function(pos,center,uvxDir,uvyDir,uvzDir){
    var dir = new THREE.Vector3();
    dir.subVectors(pos, center);
    var res = new THREE.Vector3();
    res.x = ComputeProjectionLen(dir, new THREE.Vector3(uvxDir.x, uvxDir.y, uvxDir.z));
    res.y = ComputeProjectionLen(dir, new THREE.Vector3(uvyDir.x, uvyDir.y, uvyDir.z));
    res.z = ComputeProjectionLen(dir, new THREE.Vector3(uvzDir.x, uvzDir.y, uvzDir.z));
    return res;

}
var CViewPlaneGeometry = function (camera,uvCenter, uvxDir, uvyDir, uvzDir) {


    var width=2;
    var height = 2;

    var Face = function () {

        this.vIndices = new Array(0);
        this.texCoords = new Array(0);//array of vec3
        this.normal;
    }
    function ComputeElements(inputVertices, inputFaces, inputColor) {
        // Create an arrays for vertex coordinates, normals, colors, and indices


        var numIndices = inputFaces.length * 3;
        var numVertices = numIndices;
        var vertices = new Float32Array(numVertices * 3);
        var normals = new Float32Array(numVertices * 3);
        var colors = new Float32Array(numVertices * 4);
        var texCoords = new Float32Array(numVertices * 4);
        var indices = new Uint16Array(inputFaces.length * 3);

        // Set vertex, normal and color
        var index_indices = 0;

        for (var i = 0; i < inputFaces.length; i++) {

            var face = inputFaces[i];
            var color = inputColor;
            var faceNormal = face.normal;
            for (var k = 0; k < face.vIndices.length; k++) {
                // Set index
                indices[index_indices] = index_indices;
                // Copy vertex
                var vIdx = face.vIndices[k];
                var vertex = inputVertices[vIdx];
                vertices[index_indices * 3 + 0] = vertex.x;
                vertices[index_indices * 3 + 1] = vertex.y;
                vertices[index_indices * 3 + 2] = vertex.z;
                // Copy color
                colors[index_indices * 4 + 0] = color.x;
                colors[index_indices * 4 + 1] = color.y;
                colors[index_indices * 4 + 2] = color.z;
                colors[index_indices * 4 + 3] = color.w;

                // Copy texcoord
                if (face.texCoords.length != 0) {
                    texCoords[index_indices * 4 + 0] = face.texCoords[k].x;
                    texCoords[index_indices * 4 + 1] = face.texCoords[k].y;
                    texCoords[index_indices * 4 + 2] = face.texCoords[k].z;
                    texCoords[index_indices * 4 + 3] = face.texCoords[k].w;
                }
                else {
                    texCoords[index_indices * 4 + 0] = 0;
                    texCoords[index_indices * 4 + 1] = 0;
                    texCoords[index_indices * 4 + 2] = 0;
                    texCoords[index_indices * 4 + 3] = 1;
                }

                // Copy normal

                normals[index_indices * 3 + 0] = faceNormal.x;
                normals[index_indices * 3 + 1] = faceNormal.y;
                normals[index_indices * 3 + 2] = faceNormal.z;

                index_indices++;
            }
        }

        var drawingInfo = Object();
        drawingInfo.vertices = vertices;
        drawingInfo.normals = normals;
        drawingInfo.colors = colors;
        drawingInfo.texCoords = texCoords;
        drawingInfo.indices = indices;
        return drawingInfo;
    }


    THREE.BufferGeometry.call(this);
    this.type = 'CViewPlaneBufferGeometry';

    //create plane geo
    var vertices = new Array();
    var texCoords = new Array();

    var pLocal = new THREE.Vector3(0, 0, -1);
    var pWorld = pLocal.applyMatrix4(camera.matrixWorld);
    var frontDir = pWorld.sub(camera.position).normalize();

    var pLocal = new THREE.Vector3(0, 1,0);
    var pWorld = pLocal.applyMatrix4(camera.matrixWorld);
    var upDir = pWorld.sub(camera.position).normalize();

    var pLocal = new THREE.Vector3(1, 0, 0);
    var pWorld = pLocal.applyMatrix4(camera.matrixWorld);
    var rightDir = pWorld.sub(camera.position).normalize();

    var pos = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
    pos.add(new THREE.Vector3(frontDir.x * 0.1, frontDir.y * 0.1, frontDir.z * 0.1));
    rightDir.multiplyScalar(width);
    upDir.multiplyScalar(height);

    vertices.push(new THREE.Vector4(pos.x-rightDir.x-upDir.x, pos.y-rightDir.y-upDir.y, pos.z-rightDir.z-upDir.z));
    //  vertices.push(new THREE.Vector4( - width, - height, pos.z));
    var uv = ComputeUvFromUvDir(vertices[vertices.length-1], uvCenter, uvxDir, uvyDir, uvzDir);
    texCoords.push(uv);
    uv = ComputeUvFromUvDir(uvCenter, uvCenter, uvxDir, uvyDir, uvzDir);
    vertices.push(new THREE.Vector4(pos.x + rightDir.x - upDir.x, pos.y + rightDir.y - upDir.y, pos.z + rightDir.z - upDir.z));
    // vertices.push(new THREE.Vector4(width, -height, 1));
    uv = ComputeUvFromUvDir(vertices[vertices.length - 1], uvCenter, uvxDir, uvyDir, uvzDir);
    texCoords.push(uv);

    vertices.push(new THREE.Vector4(pos.x + rightDir.x + upDir.x, pos.y + rightDir.y + upDir.y, pos.z + rightDir.z + upDir.z));
    // vertices.push(new THREE.Vector3(width, height, 1));
    uv = ComputeUvFromUvDir(vertices[vertices.length - 1], uvCenter, uvxDir, uvyDir, uvzDir);
    texCoords.push(uv);

    vertices.push(new THREE.Vector4(pos.x - rightDir.x + upDir.x, pos.y - rightDir.y + upDir.y, pos.z - rightDir.z + upDir.z));
    //vertices.push(new THREE.Vector3(-width, height, 1));
    uv = ComputeUvFromUvDir(vertices[vertices.length - 1], uvCenter, uvxDir, uvyDir, uvzDir)
    texCoords.push(uv);



  
    var faces = new Array();
    var face = new Face();
    face.vIndices.push(0);
    face.texCoords.push(texCoords[0]);
    face.vIndices.push(1);
    face.texCoords.push(texCoords[1]);
    face.vIndices.push(2);
    face.texCoords.push(texCoords[2]);
    face.normal = new THREE.Vector3(0, 0, 1);
    faces.push(face);
    face = new Face();
    face.vIndices.push(0);
    face.texCoords.push(texCoords[0]);
    face.vIndices.push(2);
    face.texCoords.push(texCoords[2]);
    face.vIndices.push(3);
    face.texCoords.push(texCoords[3]);
    face.normal = new THREE.Vector3(0, 0, 1);
    faces.push(face);

   

    var drawingInfo = ComputeElements(vertices, faces, new THREE.Vector4(1, 0, 0, 1))
    // build geometry

    this.addAttribute('position', new THREE.BufferAttribute(drawingInfo.vertices, 3));
    this.addAttribute('normal', new THREE.BufferAttribute(drawingInfo.normals, 3));
    this.addAttribute('color', new THREE.BufferAttribute(drawingInfo.colors, 4));
    this.addAttribute('uv3', new THREE.BufferAttribute(drawingInfo.texCoords, 4));
    this.setIndex(new THREE.BufferAttribute(drawingInfo.indices, 1));

};


CViewPlaneGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
//CBoxBufferGeometry.prototype.constructor = THREE.CViewPlaneGeometry;

