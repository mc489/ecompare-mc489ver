"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMediaQuery } from "react-responsive";
import * as THREE from "three";

function TextureMesh() {
  const mesh = useRef();

  // Your Media Queries
  const isDesktop = useMediaQuery({ query: '(min-width: 1000px)' });
  const isTablet = useMediaQuery({ query: '(min-width: 700px) and (max-width: 999px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 699px)' });

  const uniforms = useMemo(
    () => ({
      u_color: { value: new THREE.Vector3(0.3, 0, 1) },
      u_background: { value: new THREE.Vector4(0, 0, 0, 1) },
      u_speed: { value: 0.1 },
      u_detail: { value: 0.4 },
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_resolution: { value: new THREE.Vector2(1024, 1024) },
      // Added a shift variable to move the center for mobile
      u_mobileShift: { value: 0.0 } 
    }),
    []
  );

  useFrame((state) => {
    const { clock, mouse, size } = state;
    if (mesh.current) {
      uniforms.u_mouse.value.set(mouse.x / 2 + 0.5, mouse.y / 2 + 0.5);
      uniforms.u_time.value = clock.getElapsedTime();
      uniforms.u_resolution.value.set(size.width, size.height);

      // Adjust shift based on device
      if (isMobile) {
        uniforms.u_mobileShift.value = 0.65; // Moves the "blob" up from the bottom
      } else if (isTablet) {
        uniforms.u_mobileShift.value = 0.25;
      } else {
        uniforms.u_mobileShift.value = 0.0; // Desktop remains original
      }
    }
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[100, 100, 1, 1]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

const vertexShader = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_color;
  uniform vec4 u_background;
  uniform float u_speed;
  uniform float u_detail;
  uniform float u_mobileShift; // New uniform

  mat2 m(float a) {
    float c=cos(a), s=sin(a);
    return mat2(c,-s,s,c);
  }

  float map(vec3 p) {
    float t = u_time * u_speed;
    p.xz *= m(t * 0.4);
    p.xy *= m(t * 0.1);
    vec3 q = p * 2.0 + t;
    return length(p + vec3(sin((t*u_speed) * 0.1))) * log(length(p) + 0.9)
      + cos(q.x + sin(q.z + cos(q.y))) * 0.5 - 1.0;
  }

  void main() {
    // We keep your original math: gl_FragCoord.xy / u_resolution.x
    // But we add 'u_mobileShift' to the Y coordinate specifically for mobile
    vec2 a = gl_FragCoord.xy / u_resolution.x - vec2(0.5, 0.5 + u_mobileShift);
    
    vec3 cl = vec3(0.0);
    float d = 2.5;
    
    float maxSteps = 1.0 + 16.0 * u_detail;

    for (float i = 0.; i < 21.; i++) {
      if (i >= maxSteps) break;
      
      vec3 p = vec3(0, 0, 4.0) + normalize(vec3(a, -1.0)) * d;
      float rz = map(p);
      float f = clamp((rz - map(p + 0.1)) * 0.5, -0.1, 1.0);
      vec3 l = vec3(0.1, 0.3, 0.4) + vec3(5.0, 2.5, 3.0) * f;
      cl = cl * l + smoothstep(2.5, 0.0, rz) * 0.6 * l;
      d += min(rz, 1.0);
      
      if (d > 100.0) break;
    }

    vec4 color = vec4(min(u_color, cl),1.0);
    color.r = max(u_background.r,color.r);
    color.g = max(u_background.g,color.g);
    color.b = max(u_background.b,color.b);
    gl_FragColor = color;
  }
`;

export default function ShaderBackground() {
  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
      }}
      dpr={[1, 1]} 
      gl={{
        preserveDrawingBuffer: false,
        premultipliedAlpha: false,
        alpha: true,
        antialias: false,
        precision: "mediump",
        powerPreference: "default",
      }}
      camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}
    >
      <TextureMesh />
    </Canvas>
  );
} 