// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{

	var translateToOrigin = [[1,0,-positionX],
							[0,1,-positionY],
							[0,0,1]];
	var translateBack = [[1,0,0],
					[0,1,-positionY],
					[0,0,1]];						

	var scaleMatrix = [[scale,0,0],
					  [0,scale,0],
					  [0,0,1]];

	var radians = rotation * (Math.PI/180);
	var cosT = Math.cos(radians);
	var sinT = Math.sin(radians);
	var rotationMatrix = [[cosT,-sinT,0],
						 [sinT,cosT,0],
						 [0,0,1]];

	var translationMatrix = [[1,0,positionX],
							[0,1,positionY],
							[0,0,1]];


	var matrix = multiplyMatrices(rotationMatrix, scaleMatrix);

	matrix = multiplyMatrices(translationMatrix, matrix);

	var transformedArray = getArrayFromMatrix(matrix)

	return transformedArray;
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	// console.log('apply trans');

	var t1 = [[trans1[0],trans1[3],trans1[6]],[trans1[1],trans1[4],trans1[7]],[trans1[2],trans1[5],trans1[8]]];
	var t2 = [[trans2[0],trans2[3],trans2[6]],[trans2[1],trans2[4],trans2[7]],[trans2[2],trans2[5],trans2[8]]];
	var t3 = multiplyMatrices(t2,t1);

	return Array(t3[0][0],t3[1][0],t3[2][0],
		t3[0][1],t3[1][1],t3[2][1],
		t3[0][2],t3[1][2],t3[2][2] );
}

function getArrayFromMatrix(matrix){
	return Array(matrix[0][0],matrix[1][0],matrix[2][0],
		matrix[0][1],matrix[1][1],matrix[2][1],
		matrix[0][2],matrix[1][2],matrix[2][2]);
}


function printMatrix(matrix){
	console.log('matrix[0] '+matrix[0])
	console.log('[');
	console.log(matrix[0][0]+','+ matrix[0][1]+','+matrix[0][2]);
	console.log(matrix[1][0]+','+ matrix[1][1]+','+matrix[1][2]);
	console.log(matrix[2][0]+','+ matrix[2][1]+','+matrix[2][2]);
	console.log(']')
}


function multiplyMatrices(matrix1, matrix2){
	var newMatrix = [[0,0,0],[0,0,0],[0,0,0]];

	for(let i = 0; i< matrix1.length; i++){
		for(let j = 0; j<matrix2[0].length; j++){
			let sum = 0; 
			for(let k = 0; k< matrix1[0].length; k++){
				sum += matrix1[i][k] * matrix2[k][j];
			}
			newMatrix[i][j] = sum;
		}
	}
	return newMatrix;
}