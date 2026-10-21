"use client";

import { BackSide, Color, Mesh, ShaderMaterial } from "three";

/**
 * Contorno de seleção (casco invertido) com espessura constante na tela.
 *
 * O deslocamento é feito no espaço da câmera, proporcional à distância, e não
 * nas unidades locais da malha: os GLB são quantizados (cada nó tem uma escala
 * própria), então um deslocamento local ficaria enorme em estruturas pequenas.
 */
const OUTLINE_NAME = "__contorno";

function createOutlineMaterial(color: string) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(color) },
      // fração da distância até a câmera (~4–5 px em uma tela comum)
      uThickness: { value: 0.0032 },
    },
    vertexShader: /* glsl */ `
      uniform float uThickness;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        mv.xyz += n * uThickness * max(-mv.z, 0.05);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      void main() {
        gl_FragColor = vec4(uColor, 1.0);
        #include <colorspace_fragment>
      }`,
    side: BackSide,
    depthWrite: true,
  });
}

let shared: ShaderMaterial | null = null;
function material() {
  return (shared ??= createOutlineMaterial("#D6B469"));
}

/** Liga/desliga o contorno de uma malha (o contorno acompanha transformações e movimentos). */
export function setOutline(mesh: Mesh, on: boolean) {
  const existing = mesh.children.find((c) => c.name === OUTLINE_NAME) as Mesh | undefined;
  if (on && !existing) {
    const hull = new Mesh(mesh.geometry, material());
    hull.name = OUTLINE_NAME;
    hull.renderOrder = mesh.renderOrder - 0.5;
    // Não participa de cliques (o raio continua acertando a estrutura).
    hull.raycast = () => undefined;
    mesh.add(hull);
  } else if (!on && existing) {
    mesh.remove(existing);
  }
}

/** Mantém o contorno com a mesma visibilidade da estrutura. */
export function syncOutlineVisibility(mesh: Mesh, allowed: boolean) {
  const hull = mesh.children.find((c) => c.name === OUTLINE_NAME);
  if (hull) hull.visible = mesh.visible && allowed;
}
