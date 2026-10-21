"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, Mesh, ShaderMaterial } from "three";
import { useViewerStore } from "../store";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * Região de desconforto: halo difuso, em tom quente, sobre a área onde a dor
 * costuma ser percebida. É uma representação educativa — não marca lesão,
 * inflamação nem estrutura específica. Pulsação lenta e suave (sem flashes),
 * desligada com movimento reduzido.
 */
export function PainAreaMesh() {
  const pain = useViewerStore((s) => s.painArea);
  const reduced = usePrefersReducedMotion();
  const ref = useRef<Mesh>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uColor: { value: new Color("#E07A5F") }, uStrength: { value: 0.85 } },
        vertexShader: /* glsl */ `
          varying vec3 vN;
          varying vec3 vV;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uStrength;
          varying vec3 vN;
          varying vec3 vV;
          void main() {
            float facing = clamp(dot(vN, vV), 0.0, 1.0);
            float a = pow(facing, 1.6) * 0.55 * uStrength;
            gl_FragColor = vec4(uColor, a);
          }`,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: AdditiveBlending,
      }),
    []
  );

  useFrame((state) => {
    if (!ref.current) return;
    const k = reduced ? 1 : 0.9 + 0.1 * Math.sin(state.clock.elapsedTime * 1.6);
    material.uniforms.uStrength.value = k;
  });

  if (!pain) return null;
  return (
    <mesh ref={ref} position={pain.center} renderOrder={999} material={material}>
      <sphereGeometry args={[pain.radius, 48, 32]} />
    </mesh>
  );
}
