// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var cosX = Math.cos(rotationX)
	var sinX = Math.sin(rotationX)
	var cosY = Math.cos(rotationY)
	var sinY = Math.sin(rotationY)

	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var rotX = [
		1, 0, 0, 0,
		0, cosX, sinX, 0,
		0, -sinX, cosX, 0,
		0, 0, 0, 1
	];
	var rotY = [
		cosY, 0, -sinY, 0,
		0, 1, 0, 0,
		sinY, 0, cosY, 0,
		0, 0, 0, 1
	];

	var mvp = MatrixMult(trans,rotX)
	mvp = MatrixMult(mvp,rotY)

	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		this.prog = InitShaderProgram(meshVS,meshFS)

		this.vertexPos = gl.getAttribLocation(this.prog, 'vertexPos');
		this.txc = gl.getAttribLocation(this.prog, 'txc');
		this.normals =gl.getAttribLocation(this.prog,'normals');

		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.mv = gl.getUniformLocation(this.prog, 'mv');
		this.mNormals = gl.getUniformLocation(this.prog, 'mNorm');

		this.vertBuffer = gl.createBuffer();
		this.texCoordBuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();

		this.texture = gl.createTexture();

		this.showTextureBool = true;
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.texCoordsStored = texCoords;
		this.vertPositionStored = vertPos;
		this.normalsStored = normals;
		this.numTriangles = vertPos.length / 3;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos),gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords),gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals),gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		for (let i = 0; i < this.vertPositionStored.length; i += 3){
			let temp = this.vertPositionStored[i+1];
			this.vertPositionStored[i+1] = this.vertPositionStored[i+2];
			this.vertPositionStored[i+2] = temp;
		}
		this.setMesh(this.vertPositionStored, this.texCoordsStored, this.normalsStored);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		this.storedMVP = matrixMVP;
		this.storedMV = matrixMV;
		this.storedNormal = matrixNormal;

		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram( this.prog );
		gl.uniformMatrix4fv(this.mvp, false, matrixMVP);
		gl.uniformMatrix4fv(this.mv, false, matrixMV );
		gl.uniformMatrix3fv(this.mNormals, false, matrixNormal);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.vertexAttribPointer( this.vertexPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(this.vertexPos);
		gl.uniform1i(this.showTextureLoc, this.showTextureBool);
		
		gl.bindBuffer(gl.ARRAY_BUFFER,this.texCoordBuffer);
		gl.vertexAttribPointer(this.txc, 2 , gl.FLOAT, false, 0,0);
		gl.enableVertexAttribArray(this.txc);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(this.normals,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(this.normals);
		gl.uniform3fv(this.lightDirLoc, this.lightDir);
		gl.uniform1f(this.shininessLoc, this.shininess);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture

		// You can set the texture image data using the following command.
		// [TO-DO] Bind the texture
		// this.prog = InitShaderProgram(meshVS,meshFS);
		//Texture setup: data
		this.texture = gl.createTexture();
		gl.bindTexture(
			gl.TEXTURE_2D,
			this.texture
		);
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
		gl.generateMipmap(gl.TEXTURE_2D);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			gl.LINEAR_MIPMAP_LINEAR
		);

		
		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.

		//Texture setup: Binding
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(
			gl.TEXTURE_2D,
			this.texture
		);
		//Texture setup: Texture Unit
		this.sampler = gl.getUniformLocation(this.prog,'tex');
		this.showTextureLoc = gl.getUniformLocation(this.prog,'showTexture');
		gl.useProgram(this.prog);
		gl.uniform1i(this.sampler, 0);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		console.log('show '+show);
		if (show){
			this.showTextureBool = true; 
			this.draw(this.storedMVP,this.storedMV, this.storedNormal);
		}
		else{
			this.showTextureBool = false;
			this.draw(this.storedMVP,this.storedMV, this.storedNormal);

		}
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		this.lightDirLoc = gl.getUniformLocation(this.prog,'lightDir');
		this.lightDir = [x,y,z];
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		this.shininessLoc = gl.getUniformLocation(this.prog, 'shininess');
		this.shininess = shininess;
	}
}

//Vertex shader source code
var meshVS = `
attribute vec3 vertexPos;
attribute vec2 txc;
attribute vec3 normals;
uniform vec3 lightDir;
uniform mat4 mv;
uniform float shininess;
uniform mat3 mNorm;
uniform mat4 mvp;
varying vec2 texCoord;
varying vec3 normal;
varying vec4 pos;
varying vec3 lightDirection;
varying float alpha;
varying mat4 matrixMV;
void main()
{
	gl_Position = mvp * vec4(vertexPos,1.0);
	texCoord = txc;
	normal = normalize(mNorm * normals);
	pos = vec4(vertexPos,1.0);
	lightDirection = lightDir;
	alpha = shininess;
	matrixMV = mv;
}
`;
// Fragment shader source code
var meshFS = `
precision mediump float;
uniform sampler2D tex;
uniform bool showTexture; 
varying vec2 texCoord;
varying vec3 lightDirection;
varying vec3 normal;
varying vec4 pos;
varying float alpha;
varying mat4 matrixMV;
void main()
{
	//diffuse
	float diffuse = max(dot(normal, lightDirection),0.0);

	//specular
	vec3 viewspace = (matrixMV * pos).xyz;
	vec3 cameraPosition = vec3(0,0,0); 
	vec3 viewDir = normalize(cameraPosition- viewspace );
	vec3 halfDir = normalize(lightDirection + viewDir);
	float specular = pow(max(dot(normal, halfDir), 0.0), alpha);
	vec3 specularLight = vec3(1,1,1);

	float ambienceLevel = 0.05;

	//texture
	vec4 texColor = texture2D(tex,texCoord);
	if (showTexture == true){
		texColor= texture2D(tex,texCoord);
	}
	else{
		texColor= vec4(1,1,1,1);
	}
	//color
	vec3 color = (texColor.rgb * diffuse)+(texColor.rgb * ambienceLevel) + (specular * specularLight);
	gl_FragColor = vec4(color,1);
}
`;

