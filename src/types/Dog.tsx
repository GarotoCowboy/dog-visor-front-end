export enum EDOG_STATUS {
  PRE_SOCIALIZACAO = "PRE_SOCIALIZACAO",
  SOCIALIZACAO = "SOCIALIZACAO",
  TREINAMENTO = "TREINAMENTO",
  ADAPTACAO = "ADAPTACAO",
  DOACAO = "DOACAO",
  CEDIDO = "CEDIDO",
}

export const DogStatusLabel: Record<EDOG_STATUS, string> = {
  [EDOG_STATUS.PRE_SOCIALIZACAO]: "Pre Socialização",
  [EDOG_STATUS.SOCIALIZACAO]: "Socialização",
  [EDOG_STATUS.TREINAMENTO]: "Treinamento",
  [EDOG_STATUS.ADAPTACAO]: "Adaptação",
  [EDOG_STATUS.DOACAO]: "Doação",
  [EDOG_STATUS.CEDIDO]: "Cedido",
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
  [EDOG_RACE.BORDER_COLLIER]: "Border Collier",
  [EDOG_RACE.LABRADOR]: "Labrador",
};

export interface ICreateDogRequest {
  name: string;
  race: EDOG_RACE | null;
  status: EDOG_STATUS | null;
  sex: string;
  avatarKey: string;
  dateOfBirth: string;
}

export interface IDogResponse {
  ID: string;
  name: string;
  race: EDOG_RACE | null;
  status: EDOG_STATUS | null;
  sex: string;
  avatarKey: string;
  dateOfBirth: string;
  createdAt: string;
  updatedAt: string;
}
