import type { ClinicalReviewStatus, LayerId, Side } from "../types";

/**
 * Catálogo de estruturas: nome técnico (português, Terminologia Anatômica),
 * nome público (linguagem cotidiana, anatomicamente correta) e descrição
 * curta para o visitante.
 *
 * A chave é o id do nó no GLB, gerado pelo pipeline a partir do nome oficial
 * em inglês do BodyParts3D (ex.: "right_femur"). O FMA ID e o arquivo de
 * origem ficam no manifesto do modelo — nada aqui cria estruturas.
 *
 * TODOS os textos estão "aguardando-revisao": precisam da revisão clínica de
 * Gilvan Landim ou da equipe habilitada antes de publicação definitiva
 * (ver docs/11-revisao-editorial.md).
 */

export interface StructureText {
  technicalPt: string;
  publicName: string;
  description: string;
  keywords?: string[];
  reviewStatus: ClinicalReviewStatus;
}

type Entry = Omit<StructureText, "reviewStatus"> & { reviewStatus?: ClinicalReviewStatus };

const PENDING: ClinicalReviewStatus = "aguardando-revisao";

// ---------------------------------------------------------------------------
// Textos reaproveitados

const QUADRICEPS =
  "Faz parte do quadríceps, o grupo de músculos da frente da coxa que estica o joelho — por exemplo, ao levantar de uma cadeira ou subir um degrau.";
const HAMSTRINGS =
  "Um dos músculos de trás da coxa (isquiotibiais). Participam de dobrar o joelho e de levar a coxa para trás.";
const CALF = "Músculo da panturrilha. Participa de ficar na ponta dos pés e de impulsionar o corpo ao caminhar.";
const DEEP_HIP =
  "Pequeno músculo profundo do quadril. Junto com os vizinhos, participa da rotação da coxa para fora e da estabilidade da articulação.";
const ADDUCTOR = "Músculo do lado de dentro da coxa. Participa de aproximar a coxa da linha do corpo e da estabilidade ao caminhar.";
const DELTOID = "Músculo que dá o contorno arredondado do ombro. Cada parte participa de levantar o braço em uma direção.";
const ROTATOR_CUFF =
  "Um dos quatro músculos do manguito rotador, que envolvem a cabeça do úmero e ajudam a mantê-la centrada no ombro durante os movimentos.";
const TRAPEZIUS = "Parte do trapézio, grande músculo das costas e do pescoço que move e estabiliza a escápula.";
const PECTORALIS = "Parte do peitoral maior, músculo do peito que participa de levar o braço para a frente e em direção ao corpo.";
const ERECTOR =
  "Faz parte do grupo de músculos que ajudam a manter a coluna ereta e participam de estender e inclinar o tronco.";
const DEEP_SPINE = "Pequeno músculo profundo da coluna, que participa de ajustes finos e da estabilidade entre as vértebras.";

const ENTRIES: Record<string, Entry> = {
  // ----------------------------------------------------------------- Joelho
  right_femur: {
    technicalPt: "Fêmur direito",
    publicName: "Fêmur · osso da coxa",
    description:
      "O maior osso do corpo. Liga o quadril ao joelho e recebe o peso do corpo ao ficar de pé, caminhar e subir escadas.",
    keywords: ["coxa", "osso da coxa"],
  },
  right_patella: {
    technicalPt: "Patela direita",
    publicName: "Patela · osso da frente do joelho",
    description:
      "Pequeno osso na frente do joelho, popularmente chamado de rótula. Desliza sobre o fêmur quando o joelho dobra e estica, ajudando os músculos da coxa a trabalhar.",
    keywords: ["rótula", "rotula"],
  },
  right_tibia: {
    technicalPt: "Tíbia direita",
    publicName: "Tíbia · osso principal da perna",
    description: "O osso mais forte da perna, popularmente a canela. Recebe o peso do corpo que vem do fêmur.",
    keywords: ["canela", "perna"],
  },
  right_fibula: {
    technicalPt: "Fíbula direita",
    publicName: "Fíbula · osso fino da perna",
    description: "Osso fino ao lado da tíbia. Serve de apoio para músculos da perna e participa do tornozelo.",
    keywords: ["perônio", "peronio"],
  },
  right_rectus_femoris: {
    technicalPt: "Músculo reto femoral direito",
    publicName: "Reto femoral · frente da coxa",
    description: `${QUADRICEPS} Também participa de levantar a coxa.`,
    keywords: ["quadríceps", "quadriceps"],
  },
  right_vastus_lateralis: {
    technicalPt: "Músculo vasto lateral direito",
    publicName: "Vasto lateral · frente e lado de fora da coxa",
    description: QUADRICEPS,
    keywords: ["quadríceps", "quadriceps"],
  },
  right_vastus_medialis: {
    technicalPt: "Músculo vasto medial direito",
    publicName: "Vasto medial · frente e lado de dentro da coxa",
    description: QUADRICEPS,
    keywords: ["quadríceps", "quadriceps"],
  },
  right_vastus_intermedius: {
    technicalPt: "Músculo vasto intermédio direito",
    publicName: "Vasto intermédio · músculo profundo da frente da coxa",
    description: QUADRICEPS,
    keywords: ["quadríceps", "quadriceps"],
  },
  long_head_of_right_biceps_femoris: {
    technicalPt: "Cabeça longa do músculo bíceps femoral direito",
    publicName: "Bíceps femoral (cabeça longa) · trás da coxa",
    description: HAMSTRINGS,
    keywords: ["isquiotibiais", "posterior da coxa"],
  },
  short_head_of_right_biceps_femoris: {
    technicalPt: "Cabeça curta do músculo bíceps femoral direito",
    publicName: "Bíceps femoral (cabeça curta) · trás da coxa",
    description: "Parte do bíceps femoral, atrás da coxa. Participa de dobrar o joelho.",
    keywords: ["isquiotibiais", "posterior da coxa"],
  },
  right_semitendinosus: {
    technicalPt: "Músculo semitendíneo direito",
    publicName: "Semitendíneo · trás da coxa, lado de dentro",
    description: HAMSTRINGS,
    keywords: ["isquiotibiais", "posterior da coxa"],
  },
  right_semimembranosus: {
    technicalPt: "Músculo semimembranáceo direito",
    publicName: "Semimembranáceo · trás da coxa, lado de dentro",
    description: HAMSTRINGS,
    keywords: ["isquiotibiais", "posterior da coxa"],
  },
  right_sartorius: {
    technicalPt: "Músculo sartório direito",
    publicName: "Sartório · músculo longo que cruza a coxa",
    description: "O músculo mais longo do corpo. Cruza a coxa em diagonal, do quadril até a parte de dentro do joelho.",
  },
  right_gracilis: {
    technicalPt: "Músculo grácil direito",
    publicName: "Grácil · lado de dentro da coxa",
    description: "Músculo fino do lado de dentro da coxa. Vai do púbis até a parte de dentro do joelho.",
  },
  lateral_head_of_right_gastrocnemius: {
    technicalPt: "Cabeça lateral do músculo gastrocnêmio direito",
    publicName: "Gastrocnêmio (cabeça lateral) · panturrilha",
    description: `${CALF} Como começa acima do joelho, também participa de dobrá-lo.`,
    keywords: ["panturrilha", "batata da perna"],
  },
  medial_head_of_right_gastrocnemius: {
    technicalPt: "Cabeça medial do músculo gastrocnêmio direito",
    publicName: "Gastrocnêmio (cabeça medial) · panturrilha",
    description: `${CALF} Como começa acima do joelho, também participa de dobrá-lo.`,
    keywords: ["panturrilha", "batata da perna"],
  },
  right_popliteus: {
    technicalPt: "Músculo poplíteo direito",
    publicName: "Poplíteo · pequeno músculo atrás do joelho",
    description: "Pequeno músculo atrás do joelho. Participa do início do movimento de dobrar o joelho a partir da posição esticada.",
  },
  right_plantaris: {
    technicalPt: "Músculo plantar direito",
    publicName: "Plantar · músculo fino atrás do joelho",
    description: "Músculo pequeno e fino, com um tendão longo, entre o joelho e o calcanhar.",
  },
  right_soleus: {
    technicalPt: "Músculo sóleo direito",
    publicName: "Sóleo · músculo profundo da panturrilha",
    description: "Fica abaixo do gastrocnêmio. Muito usado para manter o corpo de pé e ao caminhar.",
    keywords: ["panturrilha"],
  },
  right_tibialis_anterior: {
    technicalPt: "Músculo tibial anterior direito",
    publicName: "Tibial anterior · frente da perna",
    description: "Músculo da frente da perna que levanta a ponta do pé — por exemplo, para não tropeçar ao caminhar.",
  },
  right_fibularis_longus: {
    technicalPt: "Músculo fibular longo direito",
    publicName: "Fibular longo · lado de fora da perna",
    description: "Músculo do lado de fora da perna. Participa da estabilidade do tornozelo e do pé.",
  },
  right_extensor_digitorum_longus: {
    technicalPt: "Músculo extensor longo dos dedos direito",
    publicName: "Extensor longo dos dedos · frente da perna",
    description: "Músculo da frente da perna que participa de levantar os dedos e a ponta do pé.",
  },
  right_tensor_fasciae_latae: {
    technicalPt: "Músculo tensor da fáscia lata direito",
    publicName: "Tensor da fáscia lata · lado do quadril",
    description: "Pequeno músculo na lateral do quadril, ligado ao trato iliotibial. Participa da estabilidade do quadril e do joelho.",
  },
  right_iliotibial_tract: {
    technicalPt: "Trato iliotibial direito",
    publicName: "Trato iliotibial · faixa do lado de fora da coxa",
    description: "Faixa fibrosa e resistente que desce pelo lado de fora da coxa, do quadril até abaixo do joelho.",
    keywords: ["banda iliotibial"],
  },
  skin: {
    technicalPt: "Pele (recorte da região)",
    publicName: "Pele · aparência externa",
    description: "Superfície externa do corpo de referência, recortada para mostrar apenas a região em estudo.",
  },

  // ----------------------------------------------------------------- Quadril
  right_hip_bone: {
    technicalPt: "Osso do quadril direito",
    publicName: "Osso do quadril · bacia (lado direito)",
    description:
      "Forma a bacia junto com o sacro. Tem a cavidade onde se encaixa a cabeça do fêmur, formando a articulação do quadril.",
    keywords: ["bacia", "pelve", "ilíaco"],
  },
  left_hip_bone: {
    technicalPt: "Osso do quadril esquerdo",
    publicName: "Osso do quadril · bacia (lado esquerdo)",
    description: "Forma a bacia junto com o sacro e o osso do quadril do outro lado.",
    keywords: ["bacia", "pelve"],
  },
  sacrum: {
    technicalPt: "Sacro",
    publicName: "Sacro · osso da base da coluna",
    description: "Osso em forma de triângulo na base da coluna, encaixado entre os dois ossos do quadril.",
    keywords: ["cóccix", "base da coluna"],
  },
  right_gluteus_maximus: {
    technicalPt: "Músculo glúteo máximo direito",
    publicName: "Glúteo máximo · músculo das nádegas",
    description: "O maior músculo das nádegas. Participa de estender o quadril, como ao levantar da cadeira ou subir escadas.",
    keywords: ["bumbum", "nádega"],
  },
  right_gluteus_medius: {
    technicalPt: "Músculo glúteo médio direito",
    publicName: "Glúteo médio · lateral do quadril",
    description:
      "Fica na lateral do quadril. Ajuda a manter a bacia estável quando o peso está em uma perna só, como a cada passo da caminhada.",
  },
  right_gluteus_minimus: {
    technicalPt: "Músculo glúteo mínimo direito",
    publicName: "Glúteo mínimo · lateral do quadril, profundo",
    description: "Músculo profundo, abaixo do glúteo médio, que também participa da estabilidade do quadril.",
  },
  right_piriformis: { technicalPt: "Músculo piriforme direito", publicName: "Piriforme · músculo profundo do quadril", description: DEEP_HIP },
  right_gemellus_superior: { technicalPt: "Músculo gêmeo superior direito", publicName: "Gêmeo superior · músculo profundo do quadril", description: DEEP_HIP },
  right_gemellus_inferior: { technicalPt: "Músculo gêmeo inferior direito", publicName: "Gêmeo inferior · músculo profundo do quadril", description: DEEP_HIP },
  right_obturator_internus: { technicalPt: "Músculo obturador interno direito", publicName: "Obturador interno · músculo profundo do quadril", description: DEEP_HIP },
  right_obturator_externus: { technicalPt: "Músculo obturador externo direito", publicName: "Obturador externo · músculo profundo do quadril", description: DEEP_HIP },
  right_quadratus_femoris: { technicalPt: "Músculo quadrado femoral direito", publicName: "Quadrado femoral · músculo profundo do quadril", description: DEEP_HIP },
  right_iliacus: {
    technicalPt: "Músculo ilíaco direito",
    publicName: "Ilíaco · parte interna da bacia",
    description: "Fica na parte interna da bacia e, junto com o psoas, participa de levantar a coxa.",
  },
  right_psoas_major: {
    technicalPt: "Músculo psoas maior direito",
    publicName: "Psoas maior · liga a coluna à coxa",
    description: "Músculo profundo que liga a parte de baixo da coluna à coxa. Participa de levantar a coxa.",
    keywords: ["iliopsoas"],
  },
  right_pectineus: { technicalPt: "Músculo pectíneo direito", publicName: "Pectíneo · lado de dentro da coxa", description: ADDUCTOR },
  right_adductor_longus: { technicalPt: "Músculo adutor longo direito", publicName: "Adutor longo · lado de dentro da coxa", description: ADDUCTOR, keywords: ["adutores", "virilha"] },
  right_adductor_brevis: { technicalPt: "Músculo adutor curto direito", publicName: "Adutor curto · lado de dentro da coxa", description: ADDUCTOR, keywords: ["adutores"] },
  right_adductor_magnus: { technicalPt: "Músculo adutor magno direito", publicName: "Adutor magno · lado de dentro da coxa", description: ADDUCTOR, keywords: ["adutores"] },
  right_adductor_minimus: { technicalPt: "Músculo adutor mínimo direito", publicName: "Adutor mínimo · lado de dentro da coxa", description: ADDUCTOR, keywords: ["adutores"] },

  // ----------------------------------------------------------------- Ombro
  right_clavicle: {
    technicalPt: "Clavícula direita",
    publicName: "Clavícula · osso entre o peito e o ombro",
    description: "Liga o esterno, no centro do peito, ao ombro. Mantém o braço afastado do tronco e se move quando o braço sobe.",
  },
  right_scapula: {
    technicalPt: "Escápula direita",
    publicName: "Escápula · osso do ombro nas costas",
    description:
      "Osso plano nas costas, popularmente chamado de omoplata. Tem a superfície onde o úmero se encaixa e se move junto com o braço.",
    keywords: ["omoplata"],
  },
  right_humerus: {
    technicalPt: "Úmero direito",
    publicName: "Úmero · osso do braço",
    description: "O osso do braço. Sua extremidade de cima, arredondada, se encaixa na escápula e forma a articulação do ombro.",
    keywords: ["braço"],
  },
  body_of_sternum: {
    technicalPt: "Corpo do esterno",
    publicName: "Esterno · osso do centro do peito",
    description: "Parte central do esterno, onde se unem as cartilagens das costelas.",
  },
  manubrium: {
    technicalPt: "Manúbrio do esterno",
    publicName: "Esterno · parte de cima",
    description: "Parte superior do esterno, onde se articula a clavícula.",
  },
  acromial_part_of_right_deltoid: { technicalPt: "Parte acromial do músculo deltoide direito", publicName: "Deltoide (parte do meio) · contorno do ombro", description: DELTOID, keywords: ["deltoide"] },
  clavicular_part_of_right_deltoid: { technicalPt: "Parte clavicular do músculo deltoide direito", publicName: "Deltoide (parte da frente) · contorno do ombro", description: DELTOID, keywords: ["deltoide"] },
  spinal_part_of_right_deltoid: { technicalPt: "Parte espinal do músculo deltoide direito", publicName: "Deltoide (parte de trás) · contorno do ombro", description: DELTOID, keywords: ["deltoide"] },
  right_supraspinatus: {
    technicalPt: "Músculo supraespinal direito",
    publicName: "Supraespinal · manguito rotador",
    description: `${ROTATOR_CUFF} Fica acima da escápula e participa de levantar o braço para o lado.`,
    keywords: ["manguito rotador", "supraespinhal"],
  },
  right_infraspinatus_muscle: {
    technicalPt: "Músculo infraespinal direito",
    publicName: "Infraespinal · manguito rotador",
    description: `${ROTATOR_CUFF} Fica atrás da escápula e participa de girar o braço para fora.`,
    keywords: ["manguito rotador", "infraespinhal"],
  },
  right_teres_minor: {
    technicalPt: "Músculo redondo menor direito",
    publicName: "Redondo menor · manguito rotador",
    description: `${ROTATOR_CUFF} Participa de girar o braço para fora.`,
    keywords: ["manguito rotador"],
  },
  right_subscapularis: {
    technicalPt: "Músculo subescapular direito",
    publicName: "Subescapular · manguito rotador",
    description: `${ROTATOR_CUFF} Fica na face da escápula voltada para as costelas e participa de girar o braço para dentro.`,
    keywords: ["manguito rotador"],
  },
  right_teres_major: {
    technicalPt: "Músculo redondo maior direito",
    publicName: "Redondo maior · entre a escápula e o braço",
    description: "Músculo entre a borda da escápula e o úmero. Participa de levar o braço para trás e para junto do corpo.",
  },
  long_head_of_right_biceps_brachii: {
    technicalPt: "Cabeça longa do músculo bíceps braquial direito",
    publicName: "Bíceps (cabeça longa) · frente do braço",
    description: "Parte do bíceps cujo tendão passa por cima da cabeça do úmero até a escápula. Participa de dobrar o cotovelo e de mover o ombro.",
    keywords: ["bíceps", "biceps"],
  },
  short_head_of_right_biceps_brachii: {
    technicalPt: "Cabeça curta do músculo bíceps braquial direito",
    publicName: "Bíceps (cabeça curta) · frente do braço",
    description: "Parte do bíceps que nasce no processo coracoide da escápula. Participa de dobrar o cotovelo.",
    keywords: ["bíceps", "biceps"],
  },
  long_head_of_right_triceps_brachii: {
    technicalPt: "Cabeça longa do músculo tríceps braquial direito",
    publicName: "Tríceps (cabeça longa) · trás do braço",
    description: "Parte do tríceps que nasce na escápula. Participa de esticar o cotovelo e de levar o braço para trás.",
    keywords: ["tríceps", "triceps"],
  },
  lateral_head_of_right_triceps_brachii: {
    technicalPt: "Cabeça lateral do músculo tríceps braquial direito",
    publicName: "Tríceps (cabeça lateral) · trás do braço",
    description: "Parte do tríceps, músculo de trás do braço que estica o cotovelo.",
    keywords: ["tríceps", "triceps"],
  },
  medial_head_of_right_triceps_brachii: {
    technicalPt: "Cabeça medial do músculo tríceps braquial direito",
    publicName: "Tríceps (cabeça medial) · trás do braço",
    description: "Parte profunda do tríceps, músculo de trás do braço que estica o cotovelo.",
    keywords: ["tríceps", "triceps"],
  },
  right_coracobrachialis: {
    technicalPt: "Músculo coracobraquial direito",
    publicName: "Coracobraquial · parte de dentro do braço",
    description: "Músculo da parte de cima e de dentro do braço. Participa de levar o braço para a frente e para junto do corpo.",
  },
  right_brachialis: {
    technicalPt: "Músculo braquial direito",
    publicName: "Braquial · frente do braço, profundo",
    description: "Músculo abaixo do bíceps que participa de dobrar o cotovelo.",
  },
  clavicular_part_of_right_pectoralis_major: { technicalPt: "Parte clavicular do músculo peitoral maior direito", publicName: "Peitoral maior (parte de cima) · peito", description: PECTORALIS, keywords: ["peitoral"] },
  sternocostal_part_of_right_pectoralis_major: { technicalPt: "Parte esternocostal do músculo peitoral maior direito", publicName: "Peitoral maior (parte central) · peito", description: PECTORALIS, keywords: ["peitoral"] },
  abdominal_part_of_right_pectoralis_major: { technicalPt: "Parte abdominal do músculo peitoral maior direito", publicName: "Peitoral maior (parte de baixo) · peito", description: PECTORALIS, keywords: ["peitoral"] },
  right_pectoralis_minor: {
    technicalPt: "Músculo peitoral menor direito",
    publicName: "Peitoral menor · peito, profundo",
    description: "Músculo abaixo do peitoral maior, ligado à escápula. Participa de posicionar a escápula.",
  },
  descending_part_of_right_trapezius: { technicalPt: "Parte descendente do músculo trapézio direito", publicName: "Trapézio (parte superior) · pescoço e ombro", description: TRAPEZIUS, keywords: ["trapézio"] },
  transverse_part_of_right_trapezius: { technicalPt: "Parte transversa do músculo trapézio direito", publicName: "Trapézio (parte média) · costas", description: TRAPEZIUS, keywords: ["trapézio"] },
  ascending_part_of_right_trapezius: { technicalPt: "Parte ascendente do músculo trapézio direito", publicName: "Trapézio (parte inferior) · costas", description: TRAPEZIUS, keywords: ["trapézio"] },
  right_serratus_anterior: {
    technicalPt: "Músculo serrátil anterior direito",
    publicName: "Serrátil anterior · lateral das costelas",
    description: "Músculo sobre as costelas que mantém a escápula junto ao tronco e ajuda a girá-la quando o braço sobe.",
  },
  right_rhomboid_major: {
    technicalPt: "Músculo romboide maior direito",
    publicName: "Romboide maior · entre a coluna e a escápula",
    description: "Liga a coluna à borda da escápula. Participa de aproximar a escápula da coluna.",
  },
  right_rhomboid_minor: {
    technicalPt: "Músculo romboide menor direito",
    publicName: "Romboide menor · entre a coluna e a escápula",
    description: "Liga a coluna à borda da escápula, acima do romboide maior.",
  },
  right_levator_scapulae: {
    technicalPt: "Músculo levantador da escápula direito",
    publicName: "Levantador da escápula · pescoço",
    description: "Músculo do pescoço que vai até o canto de cima da escápula. Participa de elevá-la.",
  },

  // ----------------------------------------------------------------- Coluna (nomes especiais)
  atlas: {
    technicalPt: "Atlas (vértebra C1)",
    publicName: "Atlas · primeira vértebra do pescoço (C1)",
    description: "Primeira vértebra do pescoço, em forma de anel. Sustenta a cabeça e participa do movimento de dizer \"sim\".",
  },
  axis: {
    technicalPt: "Áxis (vértebra C2)",
    publicName: "Áxis · segunda vértebra do pescoço (C2)",
    description: "Segunda vértebra do pescoço. Sobre ela a cabeça gira, como no movimento de dizer \"não\".",
  },
  intervertebral_disk: {
    technicalPt: "Disco intervertebral T12–L1 (nível identificado pela posição no modelo)",
    publicName: "Disco entre as vértebras T12 e L1",
    description: "Disco entre duas vértebras. Funciona como uma almofada que permite pequenos movimentos entre elas e distribui as cargas.",
    keywords: ["disco", "hérnia"],
  },
};

// ---------------------------------------------------------------------------
// Séries (vértebras, discos, costelas, músculos da coluna): nomes derivados
// diretamente do nome oficial em inglês, por tabela de tradução fixa.

const ORDINALS: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
};
const ORD_PT_F = ["", "Primeira", "Segunda", "Terceira", "Quarta", "Quinta", "Sexta", "Sétima", "Oitava", "Nona", "Décima", "Décima primeira", "Décima segunda"];
const ORD_SHORT = (n: number) => `${n}ª`;

const VERT_KIND = {
  cervical: { letter: "C", pt: "cervical", publicPlace: "do pescoço", desc: "Vértebra do pescoço. As cervicais são as menores e mais móveis da coluna." },
  thoracic: { letter: "T", pt: "torácica", publicPlace: "do meio das costas", desc: "Vértebra do meio das costas, onde se articulam as costelas." },
  lumbar: { letter: "L", pt: "lombar", publicPlace: "da parte de baixo das costas", desc: "Vértebra da parte de baixo das costas. As lombares são as maiores da coluna e sustentam boa parte do peso do tronco." },
} as const;

const DISK_DESC =
  "Disco entre duas vértebras. Funciona como uma almofada que permite pequenos movimentos entre elas e distribui as cargas.";

function nextLevel(letter: "C" | "T" | "L", n: number): string {
  if (letter === "C") return n === 7 ? "T1" : `C${n + 1}`;
  if (letter === "T") return n === 12 ? "L1" : `T${n + 1}`;
  return n === 5 ? "S1" : `L${n + 1}`;
}

const BACK_MUSCLES: Record<string, { pt: string; public: string; desc: string }> = {
  iliocostalis_lumborum: { pt: "Músculo iliocostal do lombo", public: "Iliocostal (região lombar)", desc: ERECTOR },
  iliocostalis_thoracis: { pt: "Músculo iliocostal do tórax", public: "Iliocostal (meio das costas)", desc: ERECTOR },
  iliocostalis_cervicis: { pt: "Músculo iliocostal do pescoço", public: "Iliocostal (pescoço)", desc: ERECTOR },
  longissimus_thoracis: { pt: "Músculo longuíssimo do tórax", public: "Longuíssimo (costas)", desc: ERECTOR },
  longissimus_cervicis: { pt: "Músculo longuíssimo do pescoço", public: "Longuíssimo (pescoço)", desc: ERECTOR },
  longissimus_capitis: { pt: "Músculo longuíssimo da cabeça", public: "Longuíssimo (cabeça)", desc: ERECTOR },
  spinalis_thoracis: { pt: "Músculo espinal do tórax", public: "Espinal (meio das costas)", desc: ERECTOR },
  semispinalis_thoracis: { pt: "Músculo semiespinal do tórax", public: "Semiespinal (costas)", desc: DEEP_SPINE },
  semispinalis_cervicis: { pt: "Músculo semiespinal do pescoço", public: "Semiespinal (pescoço)", desc: DEEP_SPINE },
  semispinalis_capitis: { pt: "Músculo semiespinal da cabeça", public: "Semiespinal (cabeça)", desc: "Músculo da nuca que participa de estender a cabeça e o pescoço." },
  psoas_major: { pt: "Músculo psoas maior", public: "Psoas maior · liga a coluna à coxa", desc: "Músculo profundo que liga a parte de baixo da coluna à coxa. Participa de levantar a coxa." },
  interspinalis_thoracis: { pt: "Músculo interespinal do tórax", public: "Interespinal (costas)", desc: DEEP_SPINE },
  set_of_interspinales_lumborum: { pt: "Músculos interespinais do lombo", public: "Interespinais (região lombar)", desc: DEEP_SPINE },
  lateral_lumbar_intertransversarius: { pt: "Músculos intertransversários laterais do lombo", public: "Intertransversários laterais (região lombar)", desc: DEEP_SPINE },
  medial_lumbar_intertransversarius: { pt: "Músculos intertransversários mediais do lombo", public: "Intertransversários mediais (região lombar)", desc: DEEP_SPINE },
};

const SIDE_PT = { right: { m: "direito", f: "direita", public: "lado direito" }, left: { m: "esquerdo", f: "esquerda", public: "lado esquerdo" } } as const;

function seriesEntry(id: string): Entry | null {
  // Vértebras
  let m = id.match(/^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)_(cervical|thoracic|lumbar)_vertebra$/);
  if (m) {
    const n = ORDINALS[m[1]];
    const k = VERT_KIND[m[2] as keyof typeof VERT_KIND];
    return {
      technicalPt: `${ORD_PT_F[n]} vértebra ${k.pt} (${k.letter}${n})`,
      publicName: `Vértebra ${k.publicPlace} (${k.letter}${n})`,
      description: k.desc,
      keywords: [`${k.letter}${n}`, "vértebra", "coluna"],
    };
  }
  // Discos: "intervertebral disk of <ordinal> <kind> vertebra" = disco abaixo dessa vértebra (convenção FMA)
  m = id.match(/^intervertebral_disk_of_(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)_(cervical|thoracic|lumbar)_vertebra$/);
  if (m) {
    const n = ORDINALS[m[1]];
    const k = VERT_KIND[m[2] as keyof typeof VERT_KIND];
    const level = `${k.letter}${n}–${nextLevel(k.letter, n)}`;
    return {
      technicalPt: `Disco intervertebral ${level}`,
      publicName: `Disco entre as vértebras ${level.replace("–", " e ")}`,
      description: DISK_DESC,
      keywords: [level, "disco", "hérnia"],
    };
  }
  if (id === "intervertebral_disk_of_axis") {
    return { technicalPt: "Disco intervertebral C2–C3", publicName: "Disco entre as vértebras C2 e C3", description: DISK_DESC, keywords: ["C2–C3", "disco"] };
  }
  // Costelas
  m = id.match(/^(right|left)_(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)_rib$/);
  if (m) {
    const side = SIDE_PT[m[1] as "right" | "left"];
    const n = ORDINALS[m[2]];
    return {
      technicalPt: `${ORD_SHORT(n)} costela ${side.f}`,
      publicName: `Costela ${ORD_SHORT(n)} (${side.public})`,
      description: n <= 7 ? "Costela que se liga ao esterno por cartilagem e participa da proteção do tórax e da respiração." : "Costela inferior, que participa da proteção do tórax e da respiração.",
      keywords: ["costela"],
    };
  }
  // Músculos da coluna (com lado no nome ou no sufixo calculado pela geometria)
  m = id.match(/^(?:(right|left)_)?([a-z_]+?)(?:__(right|left)_side)?$/);
  if (m) {
    const base = m[2];
    const info = BACK_MUSCLES[base];
    const sideKey = (m[1] || m[3]) as "right" | "left" | undefined;
    if (info && sideKey) {
      const side = SIDE_PT[sideKey];
      const sideFromGeometry = Boolean(m[3] && !m[1]);
      return {
        technicalPt: sideFromGeometry ? `${info.pt}, lado ${side.m} (lado identificado pela posição no modelo)` : `${info.pt} ${side.m}`,
        publicName: `${info.public} · ${side.public}`,
        description: info.desc,
        keywords: ["coluna", "costas", "lombar"],
      };
    }
  }
  return null;
}

export function structureText(id: string, nameEn?: string): StructureText {
  const e = ENTRIES[id] ?? seriesEntry(id);
  if (e) return { reviewStatus: PENDING, ...e };
  // Sem tradução: mostra o nome oficial da fonte, sem inventar nome público.
  return {
    technicalPt: nameEn ?? id,
    publicName: nameEn ?? id,
    description: "",
    reviewStatus: "rascunho",
  };
}

/** Rótulos das camadas, em linguagem cotidiana. */
export const LAYER_LABELS: Record<LayerId, { label: string; hint: string }> = {
  skin: { label: "Aparência externa", hint: "Pele do corpo de referência" },
  muscles: { label: "Músculos", hint: "Produzem e controlam os movimentos" },
  tendons: { label: "Tendões e fáscias", hint: "Faixas que ligam músculos aos ossos" },
  ligaments: { label: "Ligamentos", hint: "Unem ossos entre si" },
  joints: { label: "Discos e cartilagens", hint: "Estruturas entre os ossos que permitem o movimento" },
  bones: { label: "Ossos", hint: "Estrutura de sustentação" },
  other: { label: "Outras estruturas", hint: "" },
};

export function sideOf(id: string): Side {
  if (/(^|_)right(_|$)/.test(id) || id.endsWith("__right_side")) return "right";
  if (/(^|_)left(_|$)/.test(id) || id.endsWith("__left_side")) return "left";
  return "midline";
}
