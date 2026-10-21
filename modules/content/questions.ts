import { question, type Question } from "./schema";

/**
 * "O que você quer entender melhor?" — cada pergunta abre uma região, uma
 * cena e uma explicação geral. Nenhuma resposta é diagnóstico.
 */
const RAW: Question[] = [
  {
    id: "joelho-escadas",
    text: "Por que meu joelho pode incomodar ao subir escadas?",
    region: "knee",
    sceneId: "cena-04",
    shortAnswer:
      "Subir um degrau exige que o joelho dobre e depois estique sob o peso do corpo, junto com o quadril e o tornozelo. Quando há incômodo, vários fatores podem estar envolvidos — e precisam ser avaliados caso a caso.",
  },
  {
    id: "ombro-levantar",
    text: "O que acontece no ombro quando levanto o braço?",
    region: "shoulder",
    sceneId: "cena-01",
    shortAnswer:
      "Vários músculos, como o deltoide e os do manguito rotador, trabalham com o úmero, a escápula e a clavícula. A escápula também se move nas costas enquanto o braço sobe.",
  },
  {
    id: "costas-dor",
    text: "Por que a parte de baixo das costas pode doer?",
    region: "spine",
    sceneId: "cena-08",
    shortAnswer:
      "Nessa região há músculos, vértebras, discos, articulações e nervos. A dor pode ter origens diferentes, e o local onde ela é sentida não indica sozinho qual estrutura está envolvida.",
  },
  {
    id: "levantar-cadeira",
    text: "Quais regiões participam quando me levanto de uma cadeira?",
    region: "knee",
    sceneId: "cena-05",
    shortAnswer:
      "Tronco, quadril, joelho e tornozelo trabalham juntos. Quadril e joelho saem da posição dobrada e estendem ao mesmo tempo, com participação de músculos da coxa e dos glúteos.",
  },
  {
    id: "quadril-caminhada",
    text: "O que acontece com o quadril durante uma caminhada?",
    region: "hip",
    sceneId: "cena-10",
    shortAnswer:
      "A cada passo, a coxa vai para a frente e para trás enquanto a cabeça do fêmur gira no encaixe da bacia. Os glúteos ajudam a manter a bacia estável quando o peso fica em uma perna só.",
  },
  {
    id: "movimento-incomoda",
    text: "Por que um movimento pode incomodar em algumas situações e em outras não?",
    region: "knee",
    sceneId: "cena-04",
    shortAnswer:
      "A mesma articulação trabalha de formas diferentes conforme a posição, a carga, a velocidade e o contexto do movimento. Por isso um gesto pode incomodar em uma situação e não em outra — e essa diferença é uma informação útil para a avaliação.",
  },
];

export const QUESTIONS: Question[] = RAW.map((q) => question.parse(q));
