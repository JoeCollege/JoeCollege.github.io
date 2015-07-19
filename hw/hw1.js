"use strict";

var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 2;

var thetaRadians = 0;

var program;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    // Make program global, so draw() can getAttrib()
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    draw()

    document.getElementById('numDivisions').addEventListener('input', draw);
    document.getElementById('theta').addEventListener('input', draw);
};

function draw()
{
    //
    //  Initialize our data for the Sierpinski Gasket
    //

    points = []
    numTimesToSubdivide = document.getElementById('numDivisions').value;
    thetaRadians = document.getElementById('theta').value * (Math.PI / 180);

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -0.5, -0.5 ),
        vec2(  0,  0.5 ),
        vec2(  0.5, -0.5 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    numTimesToSubdivide);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
}

function distanceFromOrigin(vec2Point)
{
    return Math.sqrt(Math.pow(vec2Point[0], 2) + Math.pow(vec2Point[1], 2));
}

function twist(vec2Point)
{
    var d = distanceFromOrigin(vec2Point)
    var x = vec2Point[0];
    var y = vec2Point[1];

    var tX = (x * Math.cos(d * thetaRadians)) - (y * Math.sin(d * thetaRadians));
    var tY = (x * Math.sin(d * thetaRadians)) + (y * Math.cos(d * thetaRadians));
    return vec2(tX, tY);
}

function triangle( a, b, c )
{
    points.push( twist(a), twist(b), twist(c) );
    //points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
