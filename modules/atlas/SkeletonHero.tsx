"use client";

import { advance, Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Color, Group, Mesh, MeshPhysicalMaterial, NeutralToneMapping } from "three";
import { getModel, OVERVIEW_MODEL } from "@/modules/anatomy/assets/registry";
import type { RegionId } from "@/modules/anatomy/types";
import { STAGE_BG_CSS } from "@/modules/anatomy/viewer/background";
import { detectWebGL } from "@/modules/anatomy/viewer/AnatomyStage";
import { Lights } from "@/modules/anatomy/viewer/Lights";
import { usePrefersReducedMotion } from "@/modules/anatomy/viewer/usePrefersReducedMotion";

/** Ossos que representam cada região no esqueleto da tela de entrada. */
const REGION_BONES: Partial<Record<RegionId, RegExp>> = {
  shoulder: /^right_(humerus|scapula|clavicle)$/,
  knee: /^right_(femur|patella|tibia|fibula)$/,
  spine: /(vertebra|^atlas$|^axis$|^sacrum$)/,
  hip: /^(right_hip_bone|left_hip_bone|sacrum|right_femur)$/,
};

const BONE = new Color("#E7DCC6");
const GOLD = new Color("#D6B469");

function Skeleton({ highlight }: { highlight: RegionId | null }) {
  const manifest = getModel(OVERVIEW_MODEL);
  const gltf = useGLTF(manifest.file);
  const group = useRef<Group>(null);
  const reduced = usePrefersReducedMotion();

  const scene = useMemo(() => {
    const s = gltf.scene.clone(true);
    s.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh) m.material = new MeshPhysicalMaterial({ color: BONE.clone(), roughness: 0.6, clearcoat: 0.08 });
    });
    return s;
  }, [gltf]);

  useEffect(() => {
    const re = highlight ? REGION_BONES[highlight] : null;
    scene.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      const mat = m.material as MeshPhysicalMaterial;
      const on = re ? re.test(m.name) : false;
      mat.emissive.copy(on ? GOLD : new Color(0));
      mat.emissiveIntensity = on ? 0.45 : 0;
      mat.color.copy(BONE).multiplyScalar(re && !on ? 0.55 : 1);
    });
  }, [highlight, scene]);

  // Rotação lenta (≈ 1 volta a cada 50 s); parada com movimento reduzido.
  useFrame((_, dt) => {
    if (group.current && !reduced) group.current.rotation.y += dt * 0.125;
  });

  return (
    <group ref={group} position={[0, -0.82, 0]}>
      <primitive object={scene} position={[0, 0, -manifest.focus[2]]} />
    </group>
  );
}

export function SkeletonHero({ highlight, className = "" }: { highlight: RegionId | null; className?: string }) {
  const [ok, setOk] = useState(true);
  useEffect(() => setOk(detectWebGL()), []);
  return (
    <div className={className || "relative"} style={{ background: STAGE_BG_CSS }}>
      {ok ? (
        <Canvas
          dpr={[1, 2]}
          camera={{ fov: 26, position: [0, 0.02, 4.25], near: 0.05, far: 20 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => {
            gl.toneMapping = NeutralToneMapping;
            gl.setClearColor(0x000000, 0);
            // Somente desenvolvimento: avanço manual de quadros para testes automatizados.
            if (process.env.NODE_ENV !== "production") (window as unknown as { __advance?: (t: number) => void }).__advance = (t: number) => advance(t);
          }}
          aria-label="Esqueleto humano de referência (BodyParts3D) girando lentamente"
          role="img"
        >
          <Lights />
          <Suspense fallback={null}>
            <Skeleton highlight={highlight} />
          </Suspense>
        </Canvas>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/anatomy/previews/esqueleto-frente.webp" alt="Esqueleto humano de referência, vista frontal" className="h-full w-full object-contain" />
      )}
    </div>
  );
}
