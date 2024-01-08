//PROJECT 3
//JESSE ANDRINGA
//U1429132
// [TO-DO] Complete the implementation of the following class and the vertex shader below.

class CurveDrawer {
	constructor()
	{
		this.prog   = InitShaderProgram( curvesVS, curvesFS );
		// [TO-DO] Other initializations should be done here.
		// [TO-DO] This is a good place to get the locations of attributes and uniform variables.
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );
		this.p0 = gl.getUniformLocation( this.prog, 'p0' );
		this.p1 = gl.getUniformLocation( this.prog, 'p1' );
		this.p2 = gl.getUniformLocation( this.prog, 'p2' );
		this.p3 = gl.getUniformLocation( this.prog, 'p3' );
		this.t = gl.getAttribLocation( this.prog, 't');

		// Initialize the attribute buffer
		this.steps = 100;
		var tv = [];
		for ( var i=0; i<this.steps; ++i ) {
			tv.push( i / (this.steps-1) );
		}
		// [TO-DO] This is where you can create and set the contents of the vertex buffer object
		// for the vertex attribute we need.

		//buffer holds all t values
		this.t_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.t_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tv),gl.STATIC_DRAW);
	

	}
	setViewport( width, height )
	{
		// [TO-DO] This is where we should set the transformation matrix.
		// [TO-DO] Do not forget to bind the program before you set a uniform variable value.
		// trans is to project matrix onto viewport
		var trans = [ 2/width,0,0,0,  0,-2/height,0,0, 0,0,1,0, -1,1,0,1 ];
		gl.useProgram( this.prog ); 
		gl.bindBuffer(gl.ARRAY_BUFFER, this.t_buffer);
		gl.uniformMatrix4fv( this.mvp, false, trans );
	}
	updatePoints( pt )
	{
		// [TO-DO] The control points have changed, we must update corresponding uniform variables.
		// [TO-DO] Do not forget to bind the program before you set a uniform variable value.
		// [TO-DO] We can access the x and y coordinates of the i^th control points using
		// var x = pt[i].getAttribute("cx");
		// var y = pt[i].getAttribute("cy");
		var p = [];
		for ( var i=0; i<4; ++i ) {
			var x = pt[i].getAttribute("cx");
			var y = pt[i].getAttribute("cy");
			p.push(x);
			p.push(y);
		}
		gl.useProgram(this.prog);
		gl.bindBuffer(gl.ARRAY_BUFFER,this.t_buffer);

		gl.uniform2fv(this.p0, p.slice(0,2));
		gl.uniform2fv(this.p1, p.slice(2,4));
		gl.uniform2fv(this.p2, p.slice(4,6));
		gl.uniform2fv(this.p3, p.slice(6,8));
	}
	draw()
	{
		// [TO-DO] This is where we give the command to draw the curve.
		// [TO-DO] Do not forget to bind the program and set the vertex attribute.
		gl.useProgram( this.prog );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.t_buffer );
		gl.vertexAttribPointer( this.t, 1, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.t );
		gl.drawArrays( gl.LINE_STRIP, 0, 100 );
	}
}

// Vertex Shader
var curvesVS = `
	attribute float t;
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	void main()
	{
		// [TO-DO] Replace the following with the proper vertex shader code
		// Bezier Curve; f(t) = (1-t)^3 *p0 + 3(1-t)^2*t*p1  + 3(1-t)*t^2*p2 + t^3*p3
		
		//create t, t-1 variables
		float tt = t * t;
		float ttt = tt * t;
		float i = 1.0 - t;
		float ii = i * i;
		float iii = ii * i;

		//calculate bezier curve
		vec2 position = iii * p0;
		position += 3.0 * ii * t * p1;
		position += 3.0 * i * tt * p2;
		position += ttt * p3;
		vec4 positionV4 = vec4(position,0.0,1.0);
		
		gl_Position = mvp * positionV4;
		
		}
`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(1,0,0,1);
	}
`;