"use client";

import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
  attribute vec2 aOffset;
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform vec2 uResolution;
  varying float vSeed;

  void main() {
    vSeed = aSeed;
    float drift = sin(uTime * 0.15 + aSeed * 6.283) * 0.06;
    float rise = mod(aOffset.y - uTime * 0.02 * (0.4 + aSeed), 1.2) - 0.1;
    vec2 position = vec2(aOffset.x + drift, rise);
    vec2 clip = position * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = aSize * (uResolution.y / 900.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;
    float falloff = smoothstep(0.5, 0.0, dist);
    float flicker = 0.55 + 0.45 * sin(vSeed * 40.0);
    vec3 color = vec3(0.0, 1.0, 0.62);
    gl_FragColor = vec4(color, falloff * flicker * 0.85);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const PARTICLE_COUNT = 260;

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion && document.documentElement.dataset.motion !== "on") {
      return;
    }

    const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
    if (!gl) return;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const offsets = new Float32Array(PARTICLE_COUNT * 2);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const seeds = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      offsets[i * 2] = Math.random();
      offsets[i * 2 + 1] = Math.random() * 1.2;
      sizes[i] = 1 + Math.random() * 2.4;
      seeds[i] = Math.random();
    }

    function makeBuffer(data: Float32Array, name: string, size: number) {
      const buffer = gl!.createBuffer();
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
      gl!.bufferData(gl!.ARRAY_BUFFER, data, gl!.STATIC_DRAW);
      const location = gl!.getAttribLocation(program!, name);
      gl!.enableVertexAttribArray(location);
      gl!.vertexAttribPointer(location, size, gl!.FLOAT, false, 0, 0);
    }

    makeBuffer(offsets, "aOffset", 2);
    makeBuffer(sizes, "aSize", 1);
    makeBuffer(seeds, "aSeed", 1);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uResolution = gl.getUniformLocation(program, "uResolution");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let raf = 0;
    let running = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth, clientHeight } = canvas!;
      canvas!.width = clientWidth * dpr;
      canvas!.height = clientHeight * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform2f(uResolution, canvas!.width, canvas!.height);
    }

    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    function frame(now: number) {
      if (!running) return;
      const t = (now - start) / 1000;
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform1f(uTime, t);
      gl!.drawArrays(gl!.POINTS, 0, PARTICLE_COUNT);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />;
}
