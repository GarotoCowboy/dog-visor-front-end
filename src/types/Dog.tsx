export enum EDOG_STATUS {
  PRE_SOCIALIZACAO = "PRE_SOCIALIZACAO",
  SOCIALIZACAO = "SOCIALIZACAO",
  TREINAMENTO = "TREINAMENTO",
  ADAPTACAO = "ADAPTACAO",
  REPRODUCAO = "REPRODUCAO",
  AGUARDANDO_APOSENTADORIA = "AGUARDANDO_APOSENTADORIA",
  DOADO = "DOADO",
  FALECIDO = "FALECIDO",
  // Legado para compatibilidade
  DOACAO = "DOACAO",
  CEDIDO = "CEDIDO",
}

export const DogStatusLabel: Record<EDOG_STATUS, string> = {
  [EDOG_STATUS.PRE_SOCIALIZACAO]: "Pré-Socialização",
  [EDOG_STATUS.SOCIALIZACAO]: "Socialização",
  [EDOG_STATUS.TREINAMENTO]: "Treinamento",
  [EDOG_STATUS.ADAPTACAO]: "Adaptação",
  [EDOG_STATUS.REPRODUCAO]: "Reprodução",
  [EDOG_STATUS.AGUARDANDO_APOSENTADORIA]: "Aguardando Aposentadoria",
  [EDOG_STATUS.DOADO]: "Doado",
  [EDOG_STATUS.FALECIDO]: "Falecido",
  [EDOG_STATUS.DOACAO]: "Doação",
  [EDOG_STATUS.CEDIDO]: "Cedido",
};

export const DogStatusColor: Record<
  EDOG_STATUS,
  { bg: string; text: string; border?: string }
> = {
  [EDOG_STATUS.PRE_SOCIALIZACAO]: { bg: "#E0F2FE", text: "#0369A1" }, // Azul suave
  [EDOG_STATUS.SOCIALIZACAO]: { bg: "#EDE9FE", text: "#6D28D9" }, // Roxo suave
  [EDOG_STATUS.TREINAMENTO]: { bg: "#DCFCE7", text: "#15803D" }, // Verde suave
  [EDOG_STATUS.ADAPTACAO]: { bg: "#FEF3C7", text: "#B45309" }, // Âmbar
  [EDOG_STATUS.REPRODUCAO]: { bg: "#FCE7F3", text: "#BE185D" }, // Rosa/Magenta
  [EDOG_STATUS.AGUARDANDO_APOSENTADORIA]: { bg: "#FFEDD5", text: "#C2410C" }, // Laranja
  [EDOG_STATUS.DOADO]: { bg: "#F3F4F6", text: "#4B5563" }, // Cinza neutro
  [EDOG_STATUS.FALECIDO]: { bg: "#1F2937", text: "#F9FAFB" }, // Cinza escuro/preto
  [EDOG_STATUS.DOACAO]: { bg: "#F3F4F6", text: "#4B5563" },
  [EDOG_STATUS.CEDIDO]: { bg: "#F3F4F6", text: "#4B5563" },
};

export enum EDOG_RACE {
  GOLDEN_RETRIEVER = "GOLDEN_RETRIEVER",
  PASTOR_ALEMAO = "PASTOR_ALEMAO",
  BORDER_COLLIER = "BORDER_COLLIER",
  LABRADOR = "LABRADOR",
}

export const DogRaceLabel: Record<EDOG_RACE, string> = {
  [EDOG_RACE.GOLDEN_RETRIEVER]: "Golden Retriever",
  [EDOG_RACE.PASTOR_ALEMAO]: "Pastor Alemão",
  [EDOG_RACE.BORDER_COLLIER]: "Border Collie",
  [EDOG_RACE.LABRADOR]: "Labrador",
};

export const formatDogRace = (race?: string | EDOG_RACE | null): string => {
  if (!race) return "Não informada";

  if (race in DogRaceLabel) {
    return DogRaceLabel[race as EDOG_RACE];
  }

  const upper = String(race).trim().toUpperCase();
  if (upper === "BORDER_COLLIE" || upper === "BORDER_COLLIER") {
    return "Border Collie";
  }
  if (upper === "GOLDEN_RETRIEVER") {
    return "Golden Retriever";
  }
  if (upper === "PASTOR_ALEMAO") {
    return "Pastor Alemão";
  }
  if (upper === "LABRADOR") {
    return "Labrador";
  }

  return String(race)
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export interface ICreateDogRequest {
  name: string;
  race: EDOG_RACE | null;
  status: EDOG_STATUS | null;
  sex: string;
  avatarKey: string;
  dateOfBirth: string;
  onKennel?: boolean;
}

export interface IUpdateDogRequest {
  ID?: string;
  status?: EDOG_STATUS | null;
  onKennel?: boolean;
}

export interface IDogResponse {
  ID: string;
  name: string;
  race: EDOG_RACE | null;
  status: EDOG_STATUS | null;
  sex: string;
  avatarKey: string;
  dateOfBirth: string;
  onKennel?: boolean;
  on_kennel?: boolean;
  inKennel?: boolean;
  createdAt: string;
  updatedAt: string;
}
