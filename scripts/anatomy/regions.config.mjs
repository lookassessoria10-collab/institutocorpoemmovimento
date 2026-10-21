// Seleção de estruturas por região, a partir dos arquivos de elemento (FJ)
// do BodyParts3D 4.0 (IS-A). Cada FJ abaixo foi conferido na lista oficial
// isa_element_parts.txt; o nome em inglês e o FMA ID são lidos dessa lista
// pelo pipeline (não são digitados aqui).
//
// budget: limite de triângulos por estrutura, por camada (acima dele a malha
// é simplificada; abaixo, mantida como na fonte).
//
// segment: segmento rígido usado pelos movimentos. Estruturas sem segmento
// permanecem fixas; músculos não se deformam neste acervo, por isso os
// movimentos os ocultam automaticamente (ver docs/04-animacoes.md).
//
// Lado direito do corpo = X negativo no BodyParts3D.

const KNEE_BONES = [
  { fj: "FJ3365", segment: "coxa" }, // right femur
  { fj: "FJ3381", segment: "patela" }, // right patella
  { fj: "FJ3387", segment: "perna" }, // right tibia
  { fj: "FJ3366", segment: "perna" }, // right fibula
];

const KNEE_MUSCLES = [
  "FJ1433", // right rectus femoris
  "FJ1442", // right vastus lateralis
  "FJ1443", // right vastus medialis
  "FJ1441", // right vastus intermedius
  "FJ1395", // long head of right biceps femoris
  "FJ1444", // short head of right biceps femoris
  "FJ1436", // right semitendinosus
  "FJ1435", // right semimembranosus
  "FJ1434", // right sartorius
  "FJ1421", // right gracilis
  "FJ1394", // lateral head of right gastrocnemius
  "FJ1397", // medial head of right gastrocnemius
  "FJ1430", // right popliteus
  "FJ1429", // right plantaris
  "FJ1437", // right soleus
  "FJ1439", // right tibialis anterior
  "FJ1410", // right fibularis longus
  "FJ1406", // right extensor digitorum longus
  "FJ1438", // right tensor fasciae latae
].map((fj) => ({ fj }));

const HIP_MUSCLES = [
  "FJ1418", // right gluteus maximus
  "FJ1419", // right gluteus medius
  "FJ1420", // right gluteus minimus
  "FJ1428", // right piriformis
  "FJ1417", // right gemellus superior
  "FJ1416", // right gemellus inferior
  "FJ1426", // right obturator internus
  "FJ1425", // right obturator externus
  "FJ1432", // right quadratus femoris
  "FJ1422", // right iliacus
  "FJ1431", // right psoas major
  "FJ1438", // right tensor fasciae latae
  "FJ1434", // right sartorius
  "FJ1433", // right rectus femoris
  "FJ1427", // right pectineus
  "FJ1402", // right adductor longus
  "FJ1401", // right adductor brevis
  "FJ1403", // right adductor magnus
  "FJ1404", // right adductor minimus
  "FJ1421", // right gracilis
  "FJ1395", // long head of right biceps femoris
  "FJ1436", // right semitendinosus
  "FJ1435", // right semimembranosus
].map((fj) => ({ fj }));

const SHOULDER_MUSCLES = [
  "FJ1467", // acromial part of right deltoid
  "FJ1468", // clavicular part of right deltoid
  "FJ1513", // spinal part of right deltoid
  "FJ1506", // right supraspinatus
  "FJ1500", // right infraspinatus muscle
  "FJ1508", // right teres minor
  "FJ1504", // right subscapularis
  "FJ1507", // right teres major
  "FJ1478", // long head of right biceps brachii
  "FJ1512", // short head of right biceps brachii
  "FJ1479", // long head of right triceps brachii
  "FJ1477", // lateral head of right triceps brachii
  "FJ1480", // medial head of right triceps brachii
  "FJ1488", // right coracobrachialis
  "FJ1486", // right brachialis
  "FJ1447", // clavicular part of right pectoralis major
  "FJ1464", // sternocostal part of right pectoralis major
  "FJ1446", // abdominal part of right pectoralis major
  "FJ1456", // right pectoralis minor
  "FJ1521", // descending part of right trapezius
  "FJ1554", // transverse part of right trapezius
  "FJ1520", // ascending part of right trapezius
  "FJ1459", // right serratus anterior
  "FJ1536", // right rhomboid major
  "FJ1537", // right rhomboid minor
  "FJ1532", // right levator scapulae
].map((fj) => ({ fj }));

const VERTEBRAE = [
  "FJ3176", "FJ3177", "FJ3161", "FJ3164", "FJ3167", "FJ3170", "FJ3172", // C1–C7
  "FJ3158", "FJ3160", "FJ3163", "FJ3166", "FJ3169", "FJ3171", "FJ3173", "FJ3174", "FJ3175", "FJ3154", "FJ3155", "FJ3156", // T1–T12
  "FJ3157", "FJ3159", "FJ3162", "FJ3165", "FJ3168", // L1–L5
  "FJ3393", // sacrum
];

const DISKS = [
  "FJ3202", "FJ3213", "FJ3218", "FJ3219", "FJ3220", "FJ3221", // axis, C3–C7
  "FJ3222", "FJ3223", "FJ3224", "FJ3203", "FJ3204", "FJ3205", "FJ3206", "FJ3207", "FJ3208", "FJ3209", "FJ3210", // T1–T11
  "FJ3211", // "intervertebral disk" sem nível na fonte; pela posição, entre T12 e L1
  "FJ3212", "FJ3214", "FJ3215", "FJ3216", "FJ3217", // L1–L5 (disco abaixo de cada vértebra)
];

const BACK_MUSCLES_RIGHT = [
  "FJ1527", // right iliocostalis lumborum
  "FJ1528", // right iliocostalis thoracis
  "FJ1526", // right iliocostalis cervicis
  "FJ1535", // right longissimus thoracis
  "FJ1534", // right longissimus cervicis
  "FJ1533", // right longissimus capitis
  "FJ1544", // right spinalis thoracis
  "FJ1540", // right semispinalis thoracis
  "FJ1539", // right semispinalis cervicis
  "FJ1538", // right semispinalis capitis
  "FJ1431", // right psoas major
];
// Lado esquerdo: arquivos espelhados "M" da própria fonte.
const BACK_MUSCLES_LEFT = ["FJ1527M", "FJ1528M", "FJ1526M", "FJ1535M", "FJ1534M", "FJ1533M", "FJ1544M", "FJ1540M", "FJ1539M", "FJ1538M"];
const BACK_MUSCLES_MIDLINE = [
  "FJ1550", "FJ1550M", // set of interspinales lumborum
  "FJ1551", "FJ1551M", // interspinalis thoracis
  "FJ1547", "FJ1547M", // lateral lumbar intertransversarius
  "FJ1548", "FJ1548M", // medial lumbar intertransversarius
];

const RIBS = [
  "FJ3334", "FJ3336", "FJ3338", "FJ3340", "FJ3342", "FJ3344", "FJ3346", "FJ3347", "FJ3348", "FJ3330", "FJ3331", "FJ3332", // direitas, 1ª–12ª
  "FJ3228", "FJ3229", "FJ3230", "FJ3231", "FJ3232", "FJ3233", "FJ3234", "FJ3235", "FJ3236", "FJ3225", "FJ3226", "FJ3227", // esquerdas, 1ª–12ª
];

export const REGIONS = [
  {
    id: "knee",
    file: "knee-right",
    title: "Joelho direito (coxa e perna)",
    side: "right",
    structures: [
      ...KNEE_BONES,
      // Pelve como referência fixa (permite a cadeia quadril → joelho no "sentar e levantar").
      { fj: "FJ3152" }, // right hip bone
      { fj: "FJ3288" }, // left hip bone
      { fj: "FJ3393" }, // sacrum
      ...KNEE_MUSCLES,
      { fj: "FJ1423" }, // right iliotibial tract
    ],
    // Pele até o terço superior da coxa (sem a região genital do corpo de referência).
    skin: { margin: 0.03, medialLimitX: -0.02, maxY: 0.7 },
    budget: { bones: 14000, muscles: 7000, tendons: 5000, skin: 36000 },
    focus: "knee-tea",
    joints: ["knee-tea", "hip-center"],
    // A pele é recortada só ao redor do joelho/coxa/perna (sem a pelve).
    skinBones: ["FJ3365", "FJ3381", "FJ3387", "FJ3366"],
  },
  {
    id: "hip",
    file: "hip-right",
    title: "Quadril (pelve e coxa direita)",
    side: "right",
    structures: [
      { fj: "FJ3152" }, // right hip bone
      { fj: "FJ3288" }, // left hip bone
      { fj: "FJ3393" }, // sacrum
      { fj: "FJ3168" }, // fifth lumbar vertebra
      { fj: "FJ3217" }, // intervertebral disk of fifth lumbar vertebra
      { fj: "FJ3365", segment: "coxa" }, // right femur
      ...HIP_MUSCLES,
      { fj: "FJ1423" }, // right iliotibial tract
    ],
    // Metade direita, afastada 4,5 cm da linha média: sem a coxa esquerda (que não tem
    // anatomia no modelo) e sem a região genital do corpo de referência.
    skin: { margin: 0.05, medialLimitX: -0.045 },
    budget: { bones: 14000, muscles: 7000, tendons: 5000, joints: 5000, skin: 36000 },
    focus: "hip-center",
    joints: ["hip-center"],
  },
  {
    id: "shoulder",
    file: "shoulder-right",
    title: "Ombro direito",
    side: "right",
    structures: [
      { fj: "FJ3362", segment: "clavicula" }, // right clavicle
      { fj: "FJ3384", segment: "escapula" }, // right scapula
      { fj: "FJ3368", segment: "braco" }, // right humerus
      { fj: "FJ3178" }, // body of sternum
      { fj: "FJ3290" }, // manubrium
      ...SHOULDER_MUSCLES,
    ],
    skin: { margin: 0.05, medialLimitX: 0.0 },
    budget: { bones: 12000, muscles: 7000, skin: 36000 },
    focus: "shoulder-gh",
    joints: ["shoulder-gh"],
  },
  {
    id: "spine",
    file: "spine",
    title: "Coluna vertebral",
    side: "midline",
    structures: [
      ...VERTEBRAE.map((fj) => ({ fj })),
      ...DISKS.map((fj) => ({ fj })),
      { fj: "FJ3152" }, // right hip bone
      { fj: "FJ3288" }, // left hip bone
      ...RIBS.map((fj) => ({ fj })),
      ...BACK_MUSCLES_RIGHT.map((fj) => ({ fj })),
      ...BACK_MUSCLES_LEFT.map((fj) => ({ fj })),
      { fj: "FJ1431M" }, // left psoas major
      ...BACK_MUSCLES_MIDLINE.map((fj) => ({ fj })),
    ],
    skin: null,
    budget: { bones: 2600, muscles: 3200, joints: 1400 },
    maxError: 0.004,
    focus: "lumbar",
    joints: [],
  },
];

/** Esqueleto completo, muito simplificado, para a tela de entrada. */
export const BODY_OVERVIEW = {
  id: "body",
  file: "body-skeleton",
  title: "Esqueleto completo (visão geral)",
  conceptBones: "FMA5018", // bone organ
  budget: 700, // triângulos por osso
};
