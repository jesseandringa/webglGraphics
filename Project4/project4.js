// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
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
	mvp = MatrixMult(projectionMatrix,mvp)

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

		//TODO: change these to actual unifomr and atrribs
		this.vertexPos = gl.getAttribLocation(this.prog, 'vertexPos');
		this.txc = gl.getAttribLocation(this.prog, 'txc');
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		// this.texCoordLoc = gl.getAttribLocation(this.prog,'texCoord');
		this.vertBuffer = gl.createBuffer();
		this.texCoordBuffer = gl.createBuffer();
		this.texture = gl.createTexture();

		this.showTextureBool = true;
		//TODO: is this done here? 
		//what should pos be
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		//TODO: maybe texture misaligned in here somewhere
		this.texCoordsStored = texCoords;
		this.vertPositionStored = vertPos;
		this.numTriangles = vertPos.length / 3;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos),gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords),gl.STATIC_DRAW);

	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{

		// console.log('vertex shader params '+ this.vertPositionStored);
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		for (let i = 0; i < this.vertPositionStored.length; i += 3){
			let temp = this.vertPositionStored[i+1];
			this.vertPositionStored[i+1] = this.vertPositionStored[i+2];
			this.vertPositionStored[i+2] = temp;
		}
		this.setMesh(this.vertPositionStored, this.texCoordsStored);
	}
	
	
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		///TRIANGLE MESH
		this.transStored = trans;
		gl.useProgram( this.prog );
		gl.uniformMatrix4fv(this.mvp, false, trans);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);

		gl.vertexAttribPointer( this.vertexPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(this.vertexPos);
		gl.uniform1i(this.showTextureLoc, this.showTextureBool);
		
		gl.bindBuffer(gl.ARRAY_BUFFER,this.texCoordBuffer);
		gl.vertexAttribPointer(this.txc, 2 , gl.FLOAT, false, 0,0);
		gl.enableVertexAttribArray(this.txc);
		// gl.vertexAttribPointer(this.texCoordLoc,2,gl.FLOAT,false,0,0);
		// gl.enableVertexAttribArray(this.texCoordLoc);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
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
	
		// gl.texParameteri(
		// 	gl.TEXTURE_2D,
		// 	gl.TEXTURE_WRAP_T,
		// 	gl.REPEAT
		// );

		// gl.texParameteri(
		// 	gl.TEXTURE_2D,
		// 	gl.TEXTURE_WRAP_S,
		// 	gl.REPEAT
		// );

		
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
		// gl.uniform1i(this.showTextureLoc, this.showTextureBool);
		
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
			this.draw(this.transStored);
		}
		else{
			this.showTextureBool = false;
			this.draw(this.transStored);

		}
	}
}

// Vertex shader source code
var meshVS = `
attribute vec3 vertexPos;
attribute vec2 txc;
uniform mat4 mvp;
varying vec2 texCoord;
void main()
{
	gl_Position = mvp * vec4(vertexPos,1);
	texCoord = txc;
}
`;
// Fragment shader source code
var meshFS = `
precision mediump float;
uniform sampler2D tex;
uniform bool showTexture; 
varying vec2 texCoord;
void main()
{
	if (showTexture == true){
		gl_FragColor = texture2D(tex,texCoord);
	}
	else{
		gl_FragColor =  vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1);
	}
}
`;

