import { VolhardScoresState } from "../components/testModal/VolhardSubtestScreen";

export interface IVolhardInterpretationItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  badgeColor?: string;
}

export const VOLHARD_MAJORITY_INTERPRETATIONS: Record<
  number,
  {
    title: string;
    profile: string;
    description: string;
    badgeColor: string;
  }
> = {
  1: {
    title: "Maioria nº 1",
    profile: "Extremamente Dominante e Agressivo",
    description:
      "Este cão é extremamente dominante e tem tendências agressivas. É rápido para morder e é geralmente considerado não ser bom para crianças ou idosos. Quando combinado com um 1 ou 2 em sensibilidade ao toque, será um cão difícil de treinar. É um cão para o treinador experiente, treinador competente que estabeleça liderança.",
    badgeColor: "#B91C1C",
  },
  2: {
    title: "Maioria nº 2",
    profile: "Dominante com Potencial de Liderança Firme",
    description:
      "Este cão é dominante e quando provocado pode morder. Responde bem ao tratamento firme, consistente e justo em um adulto da família, e é provável que seja um animal de estimação leal uma vez que respeite o seu líder humano. Pode ser muito ativo para idosos e também dominante para crianças pequenas.",
    badgeColor: "#C2410C",
  },
  3: {
    title: "Maioria nº 3",
    profile: "Altamente Adaptável e Amigável (Ideal)",
    description:
      "Este cão aceita líderes humanos facilmente. É a melhor perspectiva para o proprietário médio, adapta-se bem às novas situações e geralmente é bom com crianças e idosos, embora possa estar inclinado a ser ativo. Faz uma boa perspectiva para obediência e, geralmente, tem uma abordagem de senso comum para a vida.",
    badgeColor: "#15803D",
  },
  4: {
    title: "Maioria nº 4",
    profile: "Submisso e Dócil para Famílias",
    description:
      "Este cão é submisso e vai se adaptar à maioria das famílias. Pode ser um pouco menos sociável e ativo do que um cão marcando principalmente de três. Se dá bem com as crianças em geral e com treinamento também.",
    badgeColor: "#0F766E",
  },
  5: {
    title: "Maioria nº 5",
    profile: "Extremamente Dócil e Sensível",
    description:
      "Este cão é extremamente dócil e precisa de tratamento especial para construir confiança e fazê-lo sair de sua concha. Não se adapta bem a mudanças e confusões, precisa de um ambiente muito regular e estruturado. Geralmente é seguro em torno das crianças e morde apenas quando severamente estressado. Não é uma boa escolha para um iniciante, pois assusta-se facilmente e leva muito tempo para se acostumar a novas experiências.",
    badgeColor: "#7C3AED",
  },
  6: {
    title: "Maioria nº 6",
    profile: "Independente e Pouco Afetuoso",
    description:
      "Este cão é independente, não é carinhoso e pode não gostar de carinho e afago. Difícil estabelecer uma relação com ele de trabalho ou como um animal de estimação. Não recomendado para crianças que podem forçar a atenção sobre ele, não é o cão de um novato.",
    badgeColor: "#4B5563",
  },
};

export const VOLHARD_SPECIAL_SCORES: IVolhardInterpretationItem[] = [
  {
    id: "social-3",
    title: "3 em Atração Social e Dominância Social",
    subtitle: "Facilidade de treino e sociabilidade",
    description:
      "O cão socialmente atraído é mais facilmente ensinado a vir e mais simpático. Seu interesse nas pessoas pode ser uma ferramenta útil na formação, apesar de outros escores.",
    badgeColor: "#15803D",
  },
  {
    id: "restraint-touch-1",
    title: "1 em Contenção e 1 em Sensibilidade ao Toque",
    subtitle: "Dominância extrema e insensibilidade",
    description:
      "O cão dominante e agressivo, insensível ao toque, será extremamente difícil para alguém que não seja um condutor excepcionalmente competente.",
    badgeColor: "#B91C1C",
  },
  {
    id: "stability-5",
    title: "5 em Estabilidade",
    subtitle: "Risco de características de pavor",
    description:
      "Este é suscetível de ser um cão com características de pavor, que nunca é desejável. Ele exige uma grande dose de trabalho extra para obter um cão assustador adaptado a novas situações e eles geralmente não podem ser assustados, o que gerará uma crise.",
    badgeColor: "#DC2626",
  },
  {
    id: "touch-sound-5",
    title: "5 em Sensibilidade ao Toque e Som",
    subtitle: "Hipersensibilidade sensorial",
    description:
      "Também pode ser muito difícil e merece um tratamento delicado para evitar que o cão fique assustado.",
    badgeColor: "#D97706",
  },
  {
    id: "majority-6-restraint-1",
    title: "Maioria 6 combinada com 1 na Contenção",
    subtitle: "Risco de mordida sob estresse",
    description:
      "Quando combinado com 1 (especialmente na contenção/restrição), o cão independente é suscetível de morder sob estresse.",
    badgeColor: "#B91C1C",
  },
  {
    id: "majority-6-with-5",
    title: "Maioria 6 combinada com notas 5",
    subtitle: "Comportamento de esquiva ou congelamento",
    description:
      "Quando combinado com o 5, o cão independente provavelmente se esconderá das pessoas, ou congelará quando for abordado por um desconhecido.",
    badgeColor: "#6B7280",
  },
];

export const VOLHARD_NO_PATTERN_NOTE = {
  title: "Nenhum Padrão Claro (Grandes Variações)",
  subtitle: "Vários 1, 2 e 5 sem predominância",
  description:
    "Este cão pode não estar se sentindo bem. Talvez apenas tenha comido ou foi recentemente vermifugado. Aguarde dois dias e re-teste. Se o teste ainda mostra grandes variações (lotes de 1 e 5), isto é, provavelmente, imprevisível e improvável que seja um bom animal de estimação ou cão de obediência.",
};

export interface IVolhardDiagnosisResult {
  hasEnoughData: boolean;
  totalAnswered: number;
  majorityScore: number | null;
  majorityInfo: (typeof VOLHARD_MAJORITY_INTERPRETATIONS)[number] | null;
  isNoClearPattern: boolean;
  scoreCounts: Record<number, number>;
  activeSpecialAlerts: IVolhardInterpretationItem[];
  summaryText: string;
}

export const calculateVolhardInterpretation = (
  scores: VolhardScoresState,
): IVolhardDiagnosisResult => {
  const numericValues = Object.values(scores).filter(
    (v): v is number => typeof v === "number" && v >= 1 && v <= 6,
  );

  const scoreCounts: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  numericValues.forEach((val) => {
    scoreCounts[val] = (scoreCounts[val] || 0) + 1;
  });

  const totalAnswered = numericValues.length;
  if (totalAnswered < 3) {
    return {
      hasEnoughData: false,
      totalAnswered,
      majorityScore: null,
      majorityInfo: null,
      isNoClearPattern: false,
      scoreCounts,
      activeSpecialAlerts: [],
      summaryText: "Preencha ao menos 3 subtestes para visualizar a interpretação.",
    };
  }

  // Identifica a nota mais frequente
  let maxCount = 0;
  let majorityScore: number | null = null;
  let tie = false;

  for (let i = 1; i <= 6; i++) {
    const c = scoreCounts[i];
    if (c > maxCount) {
      maxCount = c;
      majorityScore = i;
      tie = false;
    } else if (c === maxCount && c > 0) {
      tie = true;
    }
  }

  // Verifica se há variação extrema sem padrão claro (ex: vários 1 e 5 misturados)
  const isNoClearPattern =
    (tie && maxCount <= 3) ||
    (scoreCounts[1] >= 2 && scoreCounts[5] >= 2 && maxCount < 4);

  const majorityInfo =
    majorityScore && !isNoClearPattern
      ? VOLHARD_MAJORITY_INTERPRETATIONS[majorityScore] || null
      : null;

  // Analisa combinações especiais de pontuação
  const activeSpecialAlerts: IVolhardInterpretationItem[] = [];

  // 1) 3 em Atração Social e Dominância Social
  if (scores.socialAttraction === 3 && scores.socialDominance === 3) {
    activeSpecialAlerts.push(VOLHARD_SPECIAL_SCORES[0]);
  }

  // 2) 1 em Contenção (restrição) e 1 em Sensibilidade ao Toque
  if (scores.restraint === 1 && scores.touchSensitivity === 1) {
    activeSpecialAlerts.push(VOLHARD_SPECIAL_SCORES[1]);
  }

  // 3) 5 em Estabilidade
  if (scores.stability === 5) {
    activeSpecialAlerts.push(VOLHARD_SPECIAL_SCORES[2]);
  }

  // 4) 5 em Sensibilidade ao Toque e Som
  if (scores.touchSensitivity === 5 && scores.soundSensitivity === 5) {
    activeSpecialAlerts.push(VOLHARD_SPECIAL_SCORES[3]);
  }

  // 5) Maioria 6 com 1 na contenção
  if (majorityScore === 6 && scores.restraint === 1) {
    activeSpecialAlerts.push(VOLHARD_SPECIAL_SCORES[4]);
  }

  // 6) Maioria 6 com alguma nota 5
  if (majorityScore === 6 && scoreCounts[5] > 0) {
    activeSpecialAlerts.push(VOLHARD_SPECIAL_SCORES[5]);
  }

  const summaryText = isNoClearPattern
    ? "Nenhum padrão claro identificado (grandes variações entre notas). Recomenda-se retestar em 2 dias."
    : majorityInfo
    ? `${majorityInfo.title} (${majorityInfo.profile}): ${majorityInfo.description}`
    : "Interpretação inconclusiva.";

  return {
    hasEnoughData: true,
    totalAnswered,
    majorityScore: isNoClearPattern ? null : majorityScore,
    majorityInfo,
    isNoClearPattern,
    scoreCounts,
    activeSpecialAlerts,
    summaryText,
  };
};

