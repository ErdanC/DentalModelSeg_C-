
var CBoxBufferGeometry = function (width,height,depth) {

    this.width = width;
    this.height = height;
    this.depth = depth;
  
    this.uvcoord = new Object();
   

    var Face = function () {

        this.vIndices = new Array(0);
        this.texCoords = new Array(0);//array of vec3
        this.normal;
    }
    function ComputeElements(inputVertices,inputFaces,inputColor) {
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

        var drawingInfo=Object();
        drawingInfo.vertices = vertices;
        drawingInfo.normals = normals;
        drawingInfo.colors = colors;
        drawingInfo.texCoords = texCoords;
        drawingInfo.indices = indices;
        return drawingInfo;
    }
    THREE.BufferGeometry.call(this);
    this.type = 'CBoxBufferGeometry';

    //create cube geo
    var vertices = new Array();
    var texCoords = new Array();
    
    vertices.push(new THREE.Vector4(-width/2, -height/2, depth/2));
    texCoords.push(new THREE.Vector4(0, 0, 1, 1));
    vertices.push(new THREE.Vector4(width / 2, -height / 2, depth / 2));
    texCoords.push(new THREE.Vector4(1, 0, 1, 1));
    vertices.push(new THREE.Vector3(width / 2, height / 2, depth / 2));
    texCoords.push(new THREE.Vector4(1, 1, 1, 1));
    vertices.push(new THREE.Vector3(-width / 2, height / 2, depth / 2));
    texCoords.push(new THREE.Vector4(0, 1, 1, 1));

    vertices.push(new THREE.Vector3(-width / 2, -height / 2, -depth / 2));
    texCoords.push(new THREE.Vector4(0, 0, 0, 1));
    vertices.push(new THREE.Vector3(width / 2, -height / 2, -depth / 2));
    texCoords.push(new THREE.Vector4(1, 0, 0, 1));
    vertices.push(new THREE.Vector3(width / 2, height / 2, -depth / 2));
    texCoords.push(new THREE.Vector4(1, 1, 0, 1));
    vertices.push(new THREE.Vector3(-width / 2, height / 2, -depth / 2));
    texCoords.push(new THREE.Vector4(0, 1, 0, 1));

    this.uvcoord.uvCenter = new THREE.Vector3(-width / 2, -height / 2, -depth / 2);
    this.uvcoord.uvxDir = new THREE.Vector3(width / 2 * 2, 0, 0);
    this.uvcoord.uvyDir = new THREE.Vector3(0, height / 2 * 2, 0);
    this.uvcoord.uvzDir = new THREE.Vector4(0, 0, depth / 2 * 2);

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

    face = new Face();
    face.vIndices.push(4);
    face.texCoords.push(texCoords[4]);
    face.vIndices.push(6);
    face.texCoords.push(texCoords[6]);
    face.vIndices.push(5);
    face.texCoords.push(texCoords[5]);
    face.normal = new THREE.Vector3(0, 0, -1);
    faces.push(face);
    face = new Face();
    face.vIndices.push(4);
    face.texCoords.push(texCoords[4]);
    face.vIndices.push(7);
    face.texCoords.push(texCoords[7]);
    face.vIndices.push(6);
    face.texCoords.push(texCoords[6]);
    face.normal = new THREE.Vector3(0, 0, -1);
    faces.push(face);

    face = new Face();
    face.vIndices.push(3);
    face.texCoords.push(texCoords[3]);
    face.vIndices.push(2);
    face.texCoords.push(texCoords[2]);
    face.vIndices.push(6);
    face.texCoords.push(texCoords[6]);
    face.normal = new THREE.Vector3(0, 1, 0);
    faces.push(face);
    face = new Face();
    face.vIndices.push(3);
    face.texCoords.push(texCoords[3]);
    face.vIndices.push(6);
    face.texCoords.push(texCoords[6]);
    face.vIndices.push(7);
    face.texCoords.push(texCoords[7]);
    face.normal = new THREE.Vector3(0, 1, 0);
    faces.push(face);

    face = new Face();
    face.vIndices.push(0);
    face.texCoords.push(texCoords[0]);
    face.vIndices.push(5);
    face.texCoords.push(texCoords[5]);
    face.vIndices.push(1);
    face.texCoords.push(texCoords[1]);
    face.normal = new THREE.Vector3(0, -1, 0);
    faces.push(face);
    face = new Face();
    face.vIndices.push(0);
    face.texCoords.push(texCoords[0]);
    face.vIndices.push(4);
    face.texCoords.push(texCoords[4]);
    face.vIndices.push(5);
    face.texCoords.push(texCoords[5]);
    face.normal = new THREE.Vector3(0, -1, 0);
    faces.push(face);

    face = new Face();
    face.vIndices.push(0);
    face.texCoords.push(texCoords[0]);
    face.vIndices.push(3);
    face.texCoords.push(texCoords[3]);
    face.vIndices.push(4);
    face.texCoords.push(texCoords[4]);
    face.normal = new THREE.Vector3(-1, 0, 0);
    faces.push(face);
    face = new Face();
    face.vIndices.push(4);
    face.texCoords.push(texCoords[4]);
    face.vIndices.push(3);
    face.texCoords.push(texCoords[3]);
    face.vIndices.push(7);
    face.texCoords.push(texCoords[7]);
    face.normal = new THREE.Vector3(-1, 0, 0);
    faces.push(face);

    face = new Face();
    face.vIndices.push(1);
    face.texCoords.push(texCoords[1]);
    face.vIndices.push(5);
    face.texCoords.push(texCoords[5]);
    face.vIndices.push(2);
    face.texCoords.push(texCoords[2]);
    face.normal = new THREE.Vector3(1, 0, 0);
    faces.push(face);
    face = new Face();
    face.vIndices.push(2);
    face.texCoords.push(texCoords[2]);
    face.vIndices.push(5);
    face.texCoords.push(texCoords[5]);
    face.vIndices.push(6);
    face.texCoords.push(texCoords[6]);
    face.normal = new THREE.Vector3(1, 0, 0);
    faces.push(face);


    var drawingInfo=ComputeElements(vertices, faces, new THREE.Vector4(1, 0, 0,1))
    // build geometry
    
    this.addAttribute('position', new THREE.BufferAttribute(drawingInfo.vertices, 3));
    this.addAttribute('normal', new THREE.BufferAttribute(drawingInfo.normals, 3));
    this.addAttribute('color', new THREE.BufferAttribute(drawingInfo.colors, 4));
    this.addAttribute('uv3', new THREE.BufferAttribute(drawingInfo.texCoords, 4));
    this.setIndex(new THREE.BufferAttribute(drawingInfo.indices, 1));
    this.pos = new THREE.Vector3(0, 0, 0);

};


CBoxBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
CBoxBufferGeometry.prototype.constructor = THREE.CBoxBufferGeometry;
CBoxBufferGeometry.prototype.Trans=function(x,y,z){
    this.translate(x, y, z);
    this.pos.x += x;
    this.pos.y += y;
    this.pos.z += z;
 

}
//texCoord:Vector3
CBoxBufferGeometry.prototype.GetLocalCoordFrom3dTexCoord = function (texCoord) {
    var v = new THREE.Vector3();
    v.x=this.width * texCoord.x - this.width / 2;
    v.y = this.height * texCoord.y - this.height / 2;
    v.z = -this.depth / 2 + this.depth * texCoord.z;
    return v;
}
CBoxBufferGeometry.prototype.GetUVCoord = function () {
    var res = new Object();
    res.uvCenter = new THREE.Vector3(this.uvcoord.uvCenter.x + this.pos.x, this.uvcoord.uvCenter.y + this.pos.y, this.uvcoord.uvCenter.z + this.pos.z);
    res.uvxDir = this.uvcoord.uvxDir;
    res.uvyDir = this.uvcoord.uvyDir;
    res.uvzDir = this.uvcoord.uvzDir;
    return res;
}