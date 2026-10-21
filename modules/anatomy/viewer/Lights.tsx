"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { DirectionalLight, Group } from "three";

/**
 * Iluminação de estúdio que acompanha a câmera: qualquer vista (frente,
 * lateral, posterior) recebe luz principal, preenchimento e recorte, sem
 * regiões escuras ao girar o modelo. O ambiente gera reflexos suaves sem
 * baixar arquivos HDR externos.
 */
export function Lights() {
  const rig = useRef<Group>(null);
  const key = useRef<DirectionalLight>(null);
  const fill = useRef<DirectionalLight>(null);
  const rim = useRef<DirectionalLight>(null);
  const { camera } = useThree();

  useEffect(() => {
    // Alvos das luzes direcionais presos ao mesmo grupo (apontam para a frente da câmera).
    for (const l of [key.current, fill.current, rim.current]) {
      if (l && rig.current) {
        rig.current.add(l.target);
        l.target.position.set(0, 0, -3);
      }
    }
  }, []);

  useFrame(() => {
    if (!rig.current) return;
    rig.current.position.copy(camera.position);
    rig.current.quaternion.copy(camera.quaternion);
  });

  return (
    <>
      <hemisphereLight args={["#fff4ea", "#2a1733", 0.5]} />
      <group ref={rig}>
        <directionalLight ref={key} position={[-1.2, 1.4, 0.4]} intensity={2.4} color="#fff7ef" />
        <directionalLight ref={fill} position={[1.6, 0.2, 0.2]} intensity={0.75} color="#e9e2ff" />
        {/* Recorte: vem de trás do modelo, em tom dourado discreto da marca. */}
        <directionalLight ref={rim} position={[0.6, 1.2, -5]} intensity={1.6} color="#ffd9a0" />
      </group>
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[0, 3, 2]} scale={[6, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={0.8} position={[-4, 1, -1]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} color="#f3e6ff" />
        <Lightformer form="rect" intensity={0.6} position={[4, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[4, 2, 1]} color="#ffe8c4" />
      </Environment>
    </>
  );
}
