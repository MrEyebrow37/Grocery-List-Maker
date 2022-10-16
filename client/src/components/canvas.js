import { startTransition } from "react"
import { useEffect } from "react"

const Canvas = ({location,state,functions}) => {
    // window.onload = () => {
    //     console.log(document.getElementById(`canvas`))
    // }

    // useEffect(() => {
    //     console.log(document.getElementById(`canvas`))
    // })

    //     let canvasHeight = window.innerHeight
    //     let canvasWidth = window.innerWidth
    // const start = () => {
    //     canvasHeight = window.innerHeight
    //     canvasWidth = window.innerWidth
    // }
    // window.onresize = start()
    // let canvas
    // let ctx
    // const getCanvas = (e) => {
    //     const x = e.offsetX
    //     const y = e.offsetY
    //     console.log(e)
    //     canvas = document.getElementById(`canvas`)
    //     ctx = canvas.getContext(`2d`)
    //     ctx.fillStyle = "#FF0000";
    //     ctx.fillRect(0, 0, 150, 75);
    //     ctx.moveTo(0,0)
    //     ctx.lineTo(400,200)
    //     ctx.stroke()
    //     ctx.beginPath();
    //     ctx.arc(95, 50, 40, 0, 2 * Math.PI);
    //     ctx.stroke();
    // }

    function main() {
        const canvas = document.querySelector("#glCanvas");
        const gl = canvas.getContext("webgl");
      
        if (gl === null) {
          alert("Unable to initialize WebGL. Your browser or machine may not support it.");
          return;
        }
      
        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);

        const vsSource = `
            attribute vec4 aVertexPosition;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            }
        `
        const fsSource = `
            void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
        `

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource)
      }

      function initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
      
        // Create the shader program
      
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
      
        // If creating the shader program failed, alert
      
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
          alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
          return null;
        }
      
        return shaderProgram;
      }
      
      //
      // creates a shader of the given type, uploads the source and
      // compiles it.
      //
      function loadShader(gl, type, source) {
        const shader = gl.createShader(type);
      
        // Send the source to the shader object
      
        gl.shaderSource(shader, source);
      
        // Compile the shader program
      
        gl.compileShader(shader);
      
        // See if it compiled successfully
      
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
          gl.deleteShader(shader);
          return null;
        }
      
        return shader;
      }
      
      window.onload = main

    return (
        <div>
            {/* <canvas  className={`canvas`} id={`canvas`} width={canvasWidth} height={canvasHeight - 100} ></canvas> */}
            {/* <button onClick={(e) => {getCanvas(e)}}>Get Canvas</button> */}
            <canvas id="glCanvas" width="640" height="480"></canvas>
        </div>
    )
}

export default Canvas