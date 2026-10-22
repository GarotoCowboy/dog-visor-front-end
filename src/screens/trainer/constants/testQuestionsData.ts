import {
  CharacteristicCategory,
  CharacteristicCategoryLabel,
  DualHandler,
  DualHandlerLabel,
  MovementGait,
  RelationshipSkill,
  ScoreComparison,
  StructureType,
} from "../../../types/Training";

export type VolhardScoreFieldKey =
  | "socialAttraction"
  | "following"
  | "restraint"
  | "socialDominance"
  | "elevationDominance"
  | "retrieving"
  | "touchSensitivity"
  | "soundSensitivity"
  | "stability";

export interface IVolhardScoreOption {
  score: number;
  label: string;
}

export interface IVolhardSubtestDefinition {
  key: VolhardScoreFieldKey;
  number: number;
  title: string;
  description: string;
  purpose: string;
  options: IVolhardScoreOption[];
}

export const VOLHARD_SUBTESTS: IVolhardSubtestDefinition[] = [
  {
    key: "socialAttraction",
    number: 1,
    title: "ATRAÇÃO SOCIAL",
    description:
      "Coloque o filhote na área de teste. A alguns metros de distância o analisador persuade o filhote para vir ao seu encontro, ajoelhando-se. O analisador deve estar em linha reta com o filhote por volta de 2 a 3 metros do centro da avaliação.",
    purpose: "Grau de atração social, confiança, ou dependência.",
    options: [
      {
        score: 1,
        label: "1. Veio prontamente, cauda para cima, pulou, lambeu as mãos.",
      },
      {
        score: 2,
        label: "2. Veio prontamente, cauda para cima, lambeu as mãos.",
      },
      {
        score: 3,
        label: "3. Veio prontamente, cauda para cima.",
      },
      {
        score: 4,
        label: "4. Veio prontamente, cauda para baixo.",
      },
      {
        score: 5,
        label: "5. Veio hesitante, cauda para baixo.",
      },
      {
        score: 6,
        label: "6. Não se aproximou.",
      },
    ],
  },
  {
    key: "following",
    number: 2,
    title: "SEGUIR",
    description:
      "Levantar e se afastar do cachorro de uma forma normal. Certifique-se de que o filhote vê você ir embora.",
    purpose: "Grau de atração. Não seguir indica independência.",
    options: [
      {
        score: 1,
        label: "1. Seguido prontamente, cauda para cima, logo atrás.",
      },
      {
        score: 2,
        label:
          "2. Seguido prontamente, cauda para cima, um pouco mais longe.",
      },
      {
        score: 3,
        label: "3. Seguido prontamente, cauda para cima.",
      },
      {
        score: 4,
        label: "4. Seguido prontamente, cauda para baixo.",
      },
      {
        score: 5,
        label: "5. Seguido hesitante, cauda para baixo.",
      },
      {
        score: 6,
        label: "6. Não seguiu, ou foi embora.",
      },
    ],
  },
  {
    key: "restraint",
    number: 3,
    title: "RESTRINGIR",
    description:
      "Colocar o filhote gentilmente de costas para baixo e segurá-lo com a mão por cerca de 30 segundos.",
    purpose:
      "Grau de restrição dominante ou submisso. Como ele aceita o stress quando socialmente e / ou fisicamente dominado.",
    options: [
      {
        score: 1,
        label: "1. Lutou ferozmente, se debateu, pouco.",
      },
      {
        score: 2,
        label: "2. Lutou ferozmente, se debateu.",
      },
      {
        score: 3,
        label: "3. Liquidado, lutou, resolvido com algum contato visual.",
      },
      {
        score: 4,
        label: "4. Lutou, então se estabeleceu.",
      },
      {
        score: 5,
        label: "5. Nenhuma luta.",
      },
      {
        score: 6,
        label: "6. Nenhuma luta, esforço para evitar o contato visual.",
      },
    ],
  },
  {
    key: "socialDominance",
    number: 4,
    title: "DOMINÂNCIA SOCIAL",
    description:
      "Deixe filhote de pé e abaixe-se ao seu lado, suavemente afague suas costas, puxe as orelhas, aperte levemente.",
    purpose:
      "Grau de aceitação da dominância social do filhote pode tentar dominar saltando e beliscando ou ele é independente e vai embora.",
    options: [
      {
        score: 1,
        label: "1. Saltou, pouco, rosnou.",
      },
      {
        score: 2,
        label: "2. Saltou.",
      },
      {
        score: 3,
        label: "3. Aceitou e tentou lamber o rosto do analisador.",
      },
      {
        score: 4,
        label: "4. Se contorceu, lambeu as mãos.",
      },
      {
        score: 5,
        label: "5. Rolou, lambeu as mãos.",
      },
      {
        score: 6,
        label: "6. Foi embora e ficou longe.",
      },
    ],
  },
  {
    key: "elevationDominance",
    number: 5,
    title: "DOMINÂNCIA ELEVAÇÃO",
    description:
      "Elevar o filhote com as duas mãos por cerca de 30 segundos a poucos centímetros do chão.",
    purpose:
      "Grau de aceitar o domínio, enquanto em posição de nenhum controle.",
    options: [
      {
        score: 1,
        label: "1. Lutou ferozmente, rosnou.",
      },
      {
        score: 2,
        label: "2. Lutou ferozmente.",
      },
      {
        score: 3,
        label: "3. Nenhuma luta, relaxado.",
      },
      {
        score: 4,
        label: "4. Lutou, aceitou e lambeu as mãos.",
      },
      {
        score: 5,
        label: "5. Não lutou, lambeu as mãos.",
      },
      {
        score: 6,
        label: "6. Nenhuma luta, congelou.",
      },
    ],
  },
  {
    key: "retrieving",
    number: 6,
    title: "BUSCAR",
    description:
      "Abaixar-se ao lado do filhote e atrair sua atenção com uma bola de papel. Quando ele mostrar interesse, atirar a bola a 1 ou 2 metros a frente.",
    purpose:
      "Grau de vontade de trabalhar com um ser humano. Alta correlação entre a capacidade de recuperar e de cães-guia, cães de sucesso obediência, cães de ensaios de campo.",
    options: [
      {
        score: 1,
        label: "1. Persegue objeto, pega objeto e foge.",
      },
      {
        score: 2,
        label: "2. Persegue objeto, está sobre o objeto, não retorna.",
      },
      {
        score: 3,
        label: "3. Persegue objeto e retorna com objeto para Testor.",
      },
      {
        score: 4,
        label: "4. Persegue objeto e retorna sem objeto a Testor.",
      },
      {
        score: 5,
        label: "5. Começa a perseguição ao objeto, perde o interesse.",
      },
      {
        score: 6,
        label: "6. Não persegue o objeto.",
      },
    ],
  },
  {
    key: "touchSensitivity",
    number: 7,
    title: "SENSIBILIDADE AO TOQUE",
    description:
      "Pegue entre os dedos de uma pata do filhote e aperte entre o seu indicador e polegar de leve, depois com mais firmeza até que você obtenha uma resposta, enquanto você conta lentamente até 10. Pare assim que o filhote se afastar ou mostrar desconforto.",
    purpose: "Grau de sensibilidade.",
    options: [
      {
        score: 1,
        label: "1. 8-10 segundos antes da resposta.",
      },
      {
        score: 2,
        label: "2. 6-7 segundos antes da resposta.",
      },
      {
        score: 3,
        label: "3. 5-6 segundos antes da resposta.",
      },
      {
        score: 4,
        label: "4. 3-4 segundos antes da resposta.",
      },
      {
        score: 5,
        label: "5. 1-2 segundos antes da resposta.",
      },
    ],
  },
  {
    key: "soundSensitivity",
    number: 8,
    title: "SENSIBILIDADE AO SOM",
    description:
      "Coloque o filhote no centro da área. O assistente faz um ruído agudo a poucos metros do filhote. Uma colher grande de metal bateu fortemente em uma panela de metal duas vezes funciona bem.",
    purpose:
      "Grau de sensibilidade ao som (também um teste rudimentar para surdez).",
    options: [
      {
        score: 1,
        label: "1. Escuta, o som localiza, caminha em direção a ele e late.",
      },
      {
        score: 2,
        label: "2. Escuta, som localiza, late.",
      },
      {
        score: 3,
        label: "3. Escuta, som localiza, e caminha com curiosidade.",
      },
      {
        score: 4,
        label: "4. Escuta, som localiza.",
      },
      {
        score: 5,
        label: "5. Se encolhe, se afasta, se esconde.",
      },
      {
        score: 6,
        label: "6. Ignora som, não mostra curiosidade.",
      },
    ],
  },
  {
    key: "stability",
    number: 9,
    title: "ESTABILIDADE",
    description:
      "Coloque filhote no centro da sala. Amarre uma corda em torno de uma toalha grande e jogue no chão a poucos metros de distância do filhote.",
    purpose: "Grau de resposta inteligente para objeto estranho.",
    options: [
      {
        score: 1,
        label: "1. Olha, ataca e morde.",
      },
      {
        score: 2,
        label: "2. Olha, late e levanta a cauda.",
      },
      {
        score: 3,
        label: "3. Olha curiosamente, tenta investigar.",
      },
      {
        score: 4,
        label: "4. Olha, late, com rabo baixo.",
      },
      {
        score: 5,
        label: "5. Foge, se esconde.",
      },
    ],
  },
];

export interface IVolhardStructureOption {
  value: StructureType;
  title: string;
  description: string;
}

export const VOLHARD_STRUCTURE_OPTIONS: IVolhardStructureOption[] = [
  {
    value: StructureType.BOA,
    title: "Boa",
    description: "O filhote está correto em sua estrutura anatômica.",
  },
  {
    value: StructureType.ACEITAVEL,
    title: "Aceitável",
    description: "O filhote tem uma ligeira falha ou desvio aceitável.",
  },
  {
    value: StructureType.RUIM,
    title: "Ruim",
    description: "O filhote apresenta falha grave ou desvio acentuado.",
  },
];

export type StructureFieldKey =
  | "straightFront"
  | "shoulderAngulation"
  | "elbowAngulation"
  | "croupAngulation"
  | "straightRear"
  | "rearAngulation";

export interface IVolhardStructureItemDefinition {
  key: StructureFieldKey;
  number: number;
  title: string;
  image: any;
  description: string;
}

export const VOLHARD_STRUCTURE_ITEMS: IVolhardStructureItemDefinition[] = [
  {
    key: "straightFront",
    number: 1,
    title: "FRENTE RETA",
    image: require("../../../../assets/volhard_images/frente-reta.jpg"),
    description:
      "Alinhamento e retidão dos membros anteriores quando vistos de frente. Observa-se aprumo paralelo, carpos retos e ausência de desvios para dentro ou fora.",
  },
  {
    key: "shoulderAngulation",
    number: 2,
    title: "ANGULAÇÃO OMBRO",
    image: require("../../../../assets/volhard_images/angulacao-ombro.jpg"),
    description:
      "Ângulo entre a escápula e o úmero. Essencial para boa amplitude de passada e absorção correta do impacto anterior.",
  },
  {
    key: "elbowAngulation",
    number: 3,
    title: "ANGULAÇÃO COTOVELO",
    image: require("../../../../assets/volhard_images/angulacao-cotovelo.jpg"),
    description:
      "Encaixe dos cotovelos alinhados e rentes ao tórax, sem desvio para dentro ou abertura para fora.",
  },
  {
    key: "croupAngulation",
    number: 4,
    title: "ANGULAÇÃO DA GARUPA",
    image: require("../../../../assets/volhard_images/angulacao-garupa.jpg"),
    description:
      "Inclinação da garupa da linha dorsal até a inserção da cauda, permitindo transmissão eficiente da força propulsora.",
  },
  {
    key: "straightRear",
    number: 5,
    title: "TRASEIRA RETA",
    image: require("../../../../assets/volhard_images/traseira-reta.jpg"),
    description:
      "Retidão e aprumos dos membros posteriores quando vistos por trás. Jarretes retos e paralelos sem convergência ou divergência.",
  },
  {
    key: "rearAngulation",
    number: 6,
    title: "ANGULAÇÃO TRASEIRA",
    image: require("../../../../assets/volhard_images/angulacao-traseira.jpg"),
    description:
      "Angulações do joelho e jarrete para flexibilidade e potência propulsora nos movimentos.",
  },
];

export const VOLHARD_STRUCTURE_FIELDS = VOLHARD_STRUCTURE_ITEMS;

export const VOLHARD_TOTAL_ITEMS_COUNT =
  VOLHARD_SUBTESTS.length + VOLHARD_STRUCTURE_ITEMS.length; // 9 + 6 = 15

// ============================================================================
// BEHAVIOR CHECKLIST (51 ITENS)
// ============================================================================

export type BehaviorSpecialFieldKey =
  | "dualHandler"
  | "relationshipSkill"
  | "scoreComparison"
  | "workSpeed"
  | "movementGait";

export interface IBehaviorOption {
  value: string;
  label: string;
}

export interface IBehaviorItemDefinition {
  number: number;
  title: string;
  description: string;
  kind: "CHARACTERISTIC" | "SPECIAL";
  specialKey?: BehaviorSpecialFieldKey;
  options: IBehaviorOption[];
}

export const STANDARD_CHARACTERISTIC_OPTIONS: IBehaviorOption[] = [
  {
    value: CharacteristicCategory.AUSENTE,
    label: CharacteristicCategoryLabel[CharacteristicCategory.AUSENTE],
  },
  {
    value: CharacteristicCategory.MUITO_LEVE,
    label: CharacteristicCategoryLabel[CharacteristicCategory.MUITO_LEVE],
  },
  {
    value: CharacteristicCategory.LEVE,
    label: CharacteristicCategoryLabel[CharacteristicCategory.LEVE],
  },
  {
    value: CharacteristicCategory.MODERADO,
    label: CharacteristicCategoryLabel[CharacteristicCategory.MODERADO],
  },
  {
    value: CharacteristicCategory.SEVERO,
    label: CharacteristicCategoryLabel[CharacteristicCategory.SEVERO],
  },
  {
    value: CharacteristicCategory.NA,
    label: CharacteristicCategoryLabel[CharacteristicCategory.NA],
  },
  {
    value: CharacteristicCategory.X,
    label: CharacteristicCategoryLabel[CharacteristicCategory.X],
  },
];

export const BEHAVIOR_CHECKLIST_ITEMS: IBehaviorItemDefinition[] = [
  {
    number: 1,
    title: "ANSIEDADE EM LOCAIS DESCONHECIDOS",
    description:
      "Inicialmente ansioso durante as primeiras visitas a lugares desconhecidos. Exibe atividade acelerada ou inibido/tímido e/ou diminuição de resposta e foco.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 2,
    title: "SENSIBILIDADE AOS RUÍDOS/SONS",
    description:
      "Assusta-se, tensão corporal, comportamento de fuga quando expostos a ruídos, como buzinas, secadores de cabelo, aspiradores ou batidas.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 3,
    title: "TEMOR A OBJETOS NOVOS",
    description:
      "Temeroso, evita ou suspeita de objetos os quais podem ser qualquer coisa, por exemplo, objetos comuns como sacolas plásticas, estátuas, equipamentos de jardim, globos, etc.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 4,
    title: "MEDO DE SUPERFÍCIES",
    description:
      "Receoso, nervoso, apreensivo em relação a caminhar sobre vários tipos de superfícies: pisos escorregadios, gradeamentos e outros.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 5,
    title: "MEDO DE CÃES",
    description:
      "Inibição em relação a outros cães na guia ou soltos, tais como postura corporal submissa (agachar-se), puxar para trás, cabeça baixa, apreensão, evita, eriçamento de pelos do dorso, afastar-se, reluta em prosseguir, observa.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 6,
    title: "MEDO DE ESCADAS",
    description:
      "Se apressa, evita ou hesita em escadas: escadas fechadas, escadas abertas, escadas feitas com grades, escadas subindo e descendo.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 7,
    title: "MEDO DE TRÁFEGO",
    description:
      "Linguagem corporal tensa, cauda baixa ou encolhida, alteração no nível de atividade, se assusta, se retira, foge ao ver e ouvir o tráfego de veículos.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 8,
    title: "ANSIEDADE DE SEPARAÇÃO",
    description:
      "Inquieto, vocaliza e/ou torna-se destrutivo quando é deixado só.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 9,
    title: "HIPER APEGO",
    description:
      "Excessivamente ligado ao condutor principal, procura retornar ao condutor principal quando conduzido por outros.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 10,
    title: "MEDO DE ESTRANHOS",
    description:
      "Temeroso, nervoso, apreensivo com estranhos, cauteloso, evita, eriçamento de pelos do dorso, lenta aproximação, focado, latindo, rosnando, escapando.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 11,
    title: "ANSIOSO QUANDO SE MANIPULA O CORPO",
    description:
      "Evasivo, ansioso, temeroso e/ou agressivo quando manuseado por atividades não invasivas como exames veterinários, higienização e/ou corte de unhas.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 12,
    title: "AFASTA-SE NA TENTATIVA DE ACARICIÁ-LO",
    description:
      "Afasta a cabeça ou a face quando alguém familiar tenta acariciá-lo.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 13,
    title: "SENSIBILIDADE AO ARREIO / EQUIPAMENTO",
    description:
      "Demonstra resistência, desconforto ou esquiva ao colocar ou manusear o arreio, guia ou coleira.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 14,
    title: "EVITA VENTILADORES SOPRANDO",
    description:
      "Temeroso ou evasivo quando passando por um ventilador soprando.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 15,
    title: "SENSIBILIDADE CORPORAL AO TOCAR UM OBJETO",
    description:
      "Inibido no contato físico com outros objetos, que não sejam a alça do arreio sobre as costas. Manifesta uma alteração na energia, abocanha o arreio ou o outro objeto, esquiva-se ou inibe-se, desaceleração e/ou evasão, congelamento quando colocado um objeto sobre a cabeça ou quando veste itens como jaquetas caninas ou peitorais do arreio, super cuidadoso onde coloca as patas, evita lugares estreitos, focado 04/05 metros à frente.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 16,
    title: "ANSIEDADE AO ENTRAR EM VEÍCULOS",
    description:
      "Evita entrar em veículos, não se acalma quando o veículo está em movimento.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 17,
    title: "INIBIDO OU PASSIVAMENTE EVASIVO QUANDO EXPOSTO A POTENCIAIS SITUAÇÕES ESTRESSANTES",
    description:
      "Não lida bem com o estresse, passivamente evidenciado como uma quebra do comportamento, é evasivo, se retira, atitudes de fuga como farejar evitando a situação e/ou deixar de responder devido ao estresse.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 18,
    title: "ATIVADO QUANDO EXPOSTO A POTENCIAIS SITUAÇÕES ESTRESSANTES",
    description:
      "Não lida bem com o estresse, evidenciado por se tornar mais ativo com movimentos rápidos, pega o petisco abruptamente, mais distraído ou outros comportamentos incoerentes/atrapalhados para aliviar a energia emocional.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 19,
    title: "EXCITABILIDADE",
    description:
      "Aumenta os níveis de energia e excitação sem observar sinais de estresse em resposta a estímulos como, mas não limitados a, saudar uma pessoa, ver outro animal, ser acariciado, antecipar a saída ou dar uma volta ou passeio de carro; pode lamentar em resposta ao estímulo.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 20,
    title: "RETORNO LENTO A UM ESTADO EMOCIONAL PRODUTIVO",
    description:
      "O cão demanda um longo tempo para recuperar seu estado emocional produtivo, após ser exposto a uma situação estressante ou um estímulo excitante.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 21,
    title: "INQUIETO QUANDO O CONDUTOR ESTÁ PARADO",
    description:
      "Inquieto e/ou segue seus próprios interesses quando o condutor está parado.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 22,
    title: "MEDO DE ÁREAS ELEVADAS, DESCIDAS ACENTUADAS, etc.",
    description:
      "Temeroso, apreensivo, hesitante próximo às bordas de plataformas e outras áreas elevadas.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 23,
    title: "LATE PERSISTENTEMENTE",
    description: "Late persistentemente quando alarmado ou excitado.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 24,
    title: "NÍVEL DE ENERGIA ALTO",
    description:
      "Requer um maior gasto de energia que a maioria dos cães para conseguir se acalmar.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 25,
    title: "FALTA DE CONCENTRAÇÃO",
    description:
      "Olha ao redor; sua atenção se move de um estímulo para outro sem manter o foco no trabalho; tem dificuldade de manter o foco no trabalho.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 26,
    title: "EXCITAÇÃO POR CAUSA DE MOVIMENTO",
    description:
      "Facilmente distraído por movimentos não animais: folhas voando, luzes de lanternas, aspersores de água, etc., e tem dificuldade de redirecionar a atenção.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 27,
    title: "PERSEGUINDO ANIMAIS",
    description:
      "Excitado com outros animais além de cães (ex. Pássaros, insetos, esquilos, etc.) com interesse persistente.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 28,
    title: "DISTRAÇÃO POR CÃES",
    description:
      "Interesse persistente e elevado nível de excitabilidade com outros cães.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 29,
    title: "FAREJANDO",
    description: "Distração por estímulos olfativos.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 30,
    title: "PROCURAR/FUÇAR",
    description: "Procurar/Fuçar por comida ou outro item o tempo todo.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 31,
    title: "COMPORTAMENTO INAPROPRIADO EM CASA",
    description:
      "Mastiga os objetos domésticos, rouba comida ou outros itens, tenta pegar coisas sobre bancadas, mesas, do cesto de lixo, etc. Transporta ou move os objetos domésticos.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 32,
    title: "FALTA DE INICIATIVA",
    description:
      "Intrínseca falta de iniciativa em buscar soluções enquanto está executando um comando que foi ordenado pelo condutor.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 33,
    title: "FALTA DE VONTADE EM SERVIR",
    description:
      "O cão persegue seus próprios interesses; demonstra falta de interesse em responder ao condutor.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 34,
    title: "RECURSO DE PROTEÇÃO CONTRA PESSOAS",
    description:
      "Exibe sinais de proteção agressiva ou possessão de recursos (objetos, brinquedos, comida) contra pessoas que estão presentes e/ou se aproximando.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 35,
    title: "AGRESSÃO CONTRA ESTRANHOS",
    description:
      "Desconfiado com pessoas desconhecidas; eriça os pelos do dorso, rosna, late, mostra os dentes quando pessoas estranhas se aproximam.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 36,
    title: "AGRESSÃO CONTRA CÃES",
    description:
      "Demonstra agressividade contra outros cães (rosna, corre, morde ou tenta morder).",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 37,
    title: "RECURSO DE PROTEÇÃO CONTRA CÃES OU OUTROS PETS",
    description:
      "Exibe sinais de proteção agressiva ou possessividade (objetos, brinquedos, comida) contra cães ou outros animais de estimação presentes ou que estão se aproximando.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 38,
    title: "DEFECA/URINA INAPROPRIADAMENTE ENQUANTO REALIZA PERCURSO",
    description:
      "Elimina fezes ou urina de maneira inapropriada enquanto está trabalhando ou realizando um percurso.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 39,
    title: "COMPORTAMENTO SOCIAL INAPROPRIADO COM PESSOAS",
    description: "Exibe maus modos com pessoas.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 40,
    title: "INCONSISTENTE",
    description:
      "O comportamento do cão, confiança e habilidade de lidar é inconsistente em muitas avaliações e ambientes.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 41,
    title: "CONDUTOR/DUPLA (CÃO-USUÁRIO)",
    description: "Quão bom é o trabalho da dupla cão-usuário.",
    kind: "SPECIAL",
    specialKey: "dualHandler",
    options: [
      {
        value: DualHandler.TRABALHA_BEM,
        label: DualHandlerLabel[DualHandler.TRABALHA_BEM],
      },
      {
        value: DualHandler.NAO_TRABALHA_BEM,
        label: DualHandlerLabel[DualHandler.NAO_TRABALHA_BEM],
      },
    ],
  },
  {
    number: 42,
    title: "HABILIDADE DE RELACIONAMENTO",
    description:
      "Habilidade do condutor em ajudar a dupla trabalhar bem juntos e/ou de evoluir a autoconfiança e as habilidades do cão.",
    kind: "SPECIAL",
    specialKey: "relationshipSkill",
    options: [
      {
        value: RelationshipSkill.MUITO_HABIL,
        label: "Muito hábil (9-8-7)",
      },
      {
        value: RelationshipSkill.MENOS_QUALIFICADO,
        label: "Menos qualificado (6-5-4)",
      },
      {
        value: RelationshipSkill.NAO_MUITO_HABIL,
        label: "Não muito hábil (3-2-1)",
      },
    ],
  },
  {
    number: 43,
    title: "COMPARATIVO DE PONTUAÇÃO 9 a 1",
    description:
      "Quão apropriado é o cão para o trabalho de cão-guia comparado com outros cães do plantel.",
    kind: "SPECIAL",
    specialKey: "scoreComparison",
    options: [
      {
        value: ScoreComparison.CAO_FLEXIVEL,
        label: "Cão flexível (9-8-7)",
      },
      {
        value: ScoreComparison.MENOS_ADAPTAVEL,
        label: "Menos adaptável (6-5-4)",
      },
      {
        value: ScoreComparison.NAO_UTILIZAVEL,
        label: "Não utilizável (3-2-1)",
      },
    ],
  },
  {
    number: 44,
    title: "COMPORTAMENTO SOCIAL INAPROPRIADO COM CÃES",
    description:
      "Demonstra comportamento social inadequado na interação ou presença de outros cães.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 45,
    title: "REAÇÃO A TROVÕES",
    description:
      "Demonstra medo, ansiedade ou reação comportamental diante de trovões e tempestades.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 46,
    title: "NÃO SE ADAPTA AO CANIL",
    description:
      "Dificuldade de se adaptar ao ambiente de canil, evidenciado pelo estado de estresse emocional e/ou dificuldades para manter uma condição física por causa do canil.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 47,
    title: "VELOCIDADE DE TRABALHO",
    description:
      "Ritmo em que o cão está andando quando está guiando ou realizando outro trabalho no qual é treinado para fazer.",
    kind: "SPECIAL",
    specialKey: "workSpeed",
    options: [
      { value: "LENTO", label: "Lento" },
      { value: "MODERADO_MENOS", label: "Moderado-" },
      { value: "MODERADO", label: "Moderado" },
      { value: "MODERADO_MAIS", label: "Moderado+" },
      { value: "RAPIDO", label: "Rápido" },
    ],
  },
  {
    number: 48,
    title: "MARCHA AO SE MOVIMENTAR",
    description:
      "Quão facilmente o cão mantém um trote quando se move rapidamente.",
    kind: "SPECIAL",
    specialKey: "movementGait",
    options: [
      { value: MovementGait.MANTEM_TROTE, label: "Mantém trote 1" },
      { value: MovementGait.NAO_MANTEM, label: "Não mantém 2" },
      { value: MovementGait.NAO_TROTA, label: "Não trota 3" },
    ],
  },
  {
    number: 49,
    title: "PROBLEMAS DE HOUSEBREAKING",
    description:
      "Frequência na qual o cão elimina fezes/urina em casa ou quando confinado a uma caixa, assumindo que o cão tem a oportunidade apropriada de eliminar excretas e não tem uma condição médica que afete a capacidade do cão de controlar a eliminação em circunstâncias normais.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 50,
    title: "INATO DESEJO DE TRABALHAR",
    description:
      "Carece de motivação intrínseca e motivação para aprender tarefas e estar envolvido com o instrutor.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
  {
    number: 51,
    title: "EVITAR O ESCAPAMENTO DOS VEÍCULOS",
    description:
      "Comportamento de atenção e prevenção ao redor de escapamentos e veículos estacionados ou ligados.",
    kind: "CHARACTERISTIC",
    options: STANDARD_CHARACTERISTIC_OPTIONS,
  },
];

// ============================================================================
// HELPERS PARA SALVAMENTO PARCIAL / PROGRESSO INCREMENTAL (VOLHARD & BEHAVIOR)
// ============================================================================

const VOLHARD_PENDING_REGEX = /^\[PENDENTE:(\d+)\/(\d+)\|([^\]]*)\]\s*(.*)$/s;
const BEHAVIOR_PENDING_REGEX = /^\[PENDENTE:(\d+)\/(\d+)\|([^\]]*)\]\s*(.*)$/s;

export const encodeVolhardResultWithProgress = (
  userComment: string,
  answeredKeys: string[],
  avgVolhard: string,
  stabilityScore: number,
): string => {
  const total = VOLHARD_TOTAL_ITEMS_COUNT;
  const count = answeredKeys.length;
  const cleanComment = userComment.replace(VOLHARD_PENDING_REGEX, "$4").trim();

  if (count < total) {
    const baseText =
      cleanComment || `Em andamento (${count}/${total} etapas realizadas)`;
    return `[PENDENTE:${count}/${total}|${answeredKeys.join(",")}] ${baseText}`;
  }

  return (
    cleanComment ||
    `Média Volhard: ${avgVolhard} - Estabilidade ${stabilityScore}/5`
  );
};

export const decodeVolhardResultProgress = (
  rawResult?: string,
  fallbackAnsweredKeys?: string[],
): {
  isCompleted: boolean;
  completedCount: number;
  totalCount: number;
  answeredKeys: string[];
  cleanDescription: string;
} => {
  const totalCount = VOLHARD_TOTAL_ITEMS_COUNT;
  const text = (rawResult || "").trim();
  const match = text.match(VOLHARD_PENDING_REGEX);

  if (match) {
    const rawKeys = match[3]
      ? match[3]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const keys: string[] = [];
    rawKeys.forEach((k) => {
      if (k === "structure") {
        VOLHARD_STRUCTURE_ITEMS.forEach((item) => {
          if (!keys.includes(item.key)) keys.push(item.key);
        });
      } else {
        if (!keys.includes(k)) keys.push(k);
      }
    });

    const completedCount = keys.length;
    const isCompleted = completedCount >= totalCount;
    const cleanDescription =
      match[4]?.trim() ||
      `Em andamento (${completedCount}/${totalCount} etapas realizadas)`;
    return {
      isCompleted,
      completedCount,
      totalCount,
      answeredKeys: keys,
      cleanDescription,
    };
  }

  if (fallbackAnsweredKeys && fallbackAnsweredKeys.length < totalCount) {
    const completedCount = fallbackAnsweredKeys.length;
    return {
      isCompleted: false,
      completedCount,
      totalCount,
      answeredKeys: fallbackAnsweredKeys,
      cleanDescription:
        text ||
        `Em andamento (${completedCount}/${totalCount} etapas realizadas)`,
    };
  }

  const allKeys = [
    ...VOLHARD_SUBTESTS.map((s) => s.key),
    ...VOLHARD_STRUCTURE_ITEMS.map((s) => s.key),
  ];
  return {
    isCompleted: true,
    completedCount: totalCount,
    totalCount,
    answeredKeys: allKeys,
    cleanDescription: text || "Teste Volhard concluído.",
  };
};

export const encodeBehaviorResultWithProgress = (
  userComment: string,
  answeredNumbers: number[],
  scoreComparisonLabel: string,
): string => {
  const total = BEHAVIOR_CHECKLIST_ITEMS.length;
  const count = answeredNumbers.length;
  const cleanComment = userComment.replace(BEHAVIOR_PENDING_REGEX, "$4").trim();

  if (count < total) {
    const baseText =
      cleanComment || `Em andamento (${count}/${total} aspectos avaliados)`;
    return `[PENDENTE:${count}/${total}|${answeredNumbers.join(",")}] ${baseText}`;
  }

  return cleanComment || scoreComparisonLabel;
};

export const decodeBehaviorResultProgress = (
  rawResult?: string,
  characteristics?: { name: string }[],
  fallbackAnsweredNumbers?: number[],
): {
  isCompleted: boolean;
  completedCount: number;
  totalCount: number;
  answeredNumbers: number[];
  cleanDescription: string;
} => {
  const totalCount = BEHAVIOR_CHECKLIST_ITEMS.length;
  const text = (rawResult || "").trim();
  const match = text.match(BEHAVIOR_PENDING_REGEX);

  const charNumbers = (characteristics || [])
    .map((c) => {
      const prefix = c.name?.split(".")[0]?.trim();
      const num = Number(prefix);
      return Number.isFinite(num) && num >= 1 && num <= 51 ? num : null;
    })
    .filter((n): n is number => n !== null);

  if (match) {
    const tagNumbers = match[3]
      ? match[3]
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => Number.isFinite(n) && n >= 1 && n <= 51)
      : [];
    const mergedNumbers = Array.from(new Set([...tagNumbers, ...charNumbers]));
    const completedCount = mergedNumbers.length;
    const isCompleted = completedCount >= totalCount;
    const cleanDescription =
      match[4]?.trim() ||
      `Em andamento (${completedCount}/${totalCount} aspectos avaliados)`;
    return {
      isCompleted,
      completedCount,
      totalCount,
      answeredNumbers: mergedNumbers,
      cleanDescription,
    };
  }

  if (fallbackAnsweredNumbers && fallbackAnsweredNumbers.length < totalCount) {
    const mergedNumbers = Array.from(
      new Set([...fallbackAnsweredNumbers, ...charNumbers]),
    );
    const completedCount = mergedNumbers.length;
    const isCompleted = completedCount >= totalCount;
    return {
      isCompleted,
      completedCount,
      totalCount,
      answeredNumbers: mergedNumbers,
      cleanDescription:
        text ||
        `Em andamento (${completedCount}/${totalCount} aspectos avaliados)`,
    };
  }

  // Se o servidor retornou menos de 46 características no array, o teste não foi concluído por completo
  if (characteristics && characteristics.length < 46) {
    const completedCount = charNumbers.length;
    return {
      isCompleted: false,
      completedCount,
      totalCount,
      answeredNumbers: charNumbers,
      cleanDescription:
        text ||
        `Em andamento (${completedCount}/${totalCount} aspectos avaliados)`,
    };
  }

  const allNumbers = BEHAVIOR_CHECKLIST_ITEMS.map((b) => b.number);
  return {
    isCompleted: true,
    completedCount: totalCount,
    totalCount,
    answeredNumbers: allNumbers,
    cleanDescription: text || "Teste Behavior concluído.",
  };
};


