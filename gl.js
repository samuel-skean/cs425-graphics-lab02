import vertexShaderSrc from './vertex.glsl.js';
import fragmentShaderSrc from './fragment.glsl.js'

var gl;
var program;
var vao;
var uniformLoc;
var currColor;
var newColor;
var currTri;
var animRunning = false;
var start;

window.updateTriangles = function() {
    currTri = parseInt(document.querySelector("#triangles").value);
}

window.updateColor = function() {
    var r = parseInt(document.querySelector("#sliderR").value)/255.0;
    var g = parseInt(document.querySelector("#sliderG").value)/255.0;
    var b = parseInt(document.querySelector("#sliderB").value)/255.0;
    var a = parseInt(document.querySelector("#sliderA").value)/255.0;
    currColor = [r,g,b,a];
}

window.startAnimation = function() {
    animRunning = true;
}

window.stopAnimation = function() {
    animRunning = false;
}

function updateCurrentColor() {

    // 0
    // currColor[0] += (2.0*Math.random()-1.0)*0.1;
    // currColor[1] += (2.0*Math.random()-1.0)*0.1;
    // currColor[2] += (2.0*Math.random()-1.0)*0.1;
    // currColor[0] = Math.min(Math.max(0, currColor[0]), 1);
    // currColor[1] = Math.min(Math.max(0, currColor[1]), 1);
    // currColor[2] = Math.min(Math.max(0, currColor[2]), 1);

    // 1
    currColor[0] += (newColor[0]-currColor[0])*0.01;
    currColor[1] += (newColor[1]-currColor[1])*0.01;
    currColor[2] += (newColor[2]-currColor[2])*0.01;

    document.querySelector("#sliderR").value = currColor[0]*255;
    document.querySelector("#sliderG").value = currColor[1]*255;
    document.querySelector("#sliderB").value = currColor[2]*255;
    document.querySelector("#sliderA").value = currColor[3]*255;
}

function randomColor() {

    var r = Math.random();
    var g = Math.random();
    var b = Math.random();

    return [r, g, b];
}

function createShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        var info = gl.getShaderInfoLog(shader);
        console.log('Could not compile WebGL program:' + info);
    }

    return shader;
}

function createProgram(vertexShader, fragmentShader) {
    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var info = gl.getProgramInfoLog(program);
        console.log('Could not compile WebGL program:' + info);
    }

    return program;
}

function createBuffer(vertices) {
    var buffer= gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    return buffer;
}

function createVAO(posAttribLoc, colorAttribLoc, posBuffer, colorBuffer, posColorBuffer) {

    var vao = gl.createVertexArray();

    // Two buffers approach
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(posAttribLoc);
    var size = 3; // number of components per attribute
    var type = gl.FLOAT;
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(posAttribLoc, size, type, false, 0, 0);

    gl.enableVertexAttribArray(colorAttribLoc);
    size = 4;
    type = gl.FLOAT;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttribLoc, size, type, false, 0, 0);


    // Single buffer approach
    // gl.bindVertexArray(vao);
    // gl.bindBuffer(gl.ARRAY_BUFFER, posColorBuffer);
    // gl.enableVertexAttribArray(posAttribLoc);
    // var size = 2; // number of components per attribute
    // var type = gl.FLOAT;
    // var normalization = false;
    // var stride = 6 * 4; // offset in bytes to next attribute
    // var offset = 0;
    // gl.vertexAttribPointer(posAttribLoc, size, type, false, stride, offset);

    // gl.enableVertexAttribArray(colorAttribLoc);
    // size = 4;
    // type = gl.FLOAT;
    // normalization = false;
    // stride = 6 * 4;
    // offset = 2 * 4;
    // gl.vertexAttribPointer(colorAttribLoc, size, type, normalization, stride, offset);


    return vao;
}

function draw(timestamp) {

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if(start == undefined) {
        start = timestamp;
    }
    var elapsed = timestamp - start;
    if(elapsed >= 1000) {
        newColor = randomColor();
        start = timestamp;
    }

    if(animRunning) {
        updateCurrentColor();
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.useProgram(program);
    gl.uniform4fv(uniformLoc, new Float32Array(currColor));
    gl.bindVertexArray(vao);
    var primitiveType = gl.TRIANGLES;
    var count = 3*currTri; // number of elements (vertices)
    gl.drawArrays(primitiveType, 0, count);

    requestAnimationFrame(draw);
}

function createTriangles(nTriangles) {

    function rand() {
        return (2 * Math.random() - 1.0);
    }

    var positions = []
    var colors = []
    var poscolors = [];
    for(var i = 0; i < nTriangles; ++i) {
        var x = rand();
        var y = rand();
        var size = Math.random() * 0.25;
        //
        var pos = [
                 x, y+size, 0,
            x-size, y-size, 0,
            x+size, y-size, 0,
        ];
        var color = [
            1,0,0,0.5,
            0,1,0,1,
            0,0,1,1
        ];

        positions = positions.concat(pos);
        colors = colors.concat(color);

        //
        var poscolor = [
            x, y+size, 0, 1,0,0,0.5,
            x-size, y-size, 0, 1,0,0,1,
            x+size, y-size, 0, 1,0,0,1
        ];

        poscolors = poscolors.concat(poscolor);
    }

    return {'positions': positions, 'colors': colors, 'poscolors': poscolors};

}

function initialize() {
    var canvas = document.querySelector("#glcanvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl = canvas.getContext("webgl2");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    currTri = 1;
    var triangles = createTriangles(100);
    console.log(triangles);
    currColor = [0, 0, 0, 1];
    newColor = currColor;

    var vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSrc);
    var fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);
    program = createProgram(vertexShader, fragmentShader);

    var posAttribLoc = gl.getAttribLocation(program, "position");
    var colorAttribLoc = gl.getAttribLocation(program, "color");
    uniformLoc = gl.getUniformLocation(program, 'uColor');

    var posBuffer = createBuffer(triangles['positions']);
    var colorBuffer = createBuffer(triangles['colors']);
    var posColorBuffer = createBuffer(triangles['poscolors']);
    vao = createVAO(posAttribLoc, colorAttribLoc, posBuffer, colorBuffer, posColorBuffer);

    window.requestAnimationFrame(draw);
}

window.onload = initialize;