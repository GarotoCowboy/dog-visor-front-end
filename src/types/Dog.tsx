
export enum EDOG_STATUS{
PRE_SOCIALIZACAO = 0,
SOCIALIZACAO = 1,
TREINAMENTO = 2,
ADAPTACAO = 3,
DOACAO = 4,
CEDIDO = 5,
}

export enum EDOG_RACE{
GOLDEN_RETRIEVER = "GOLDEN RETRIEVER",
PASTOR_ALEMAO = "PASTOR ALEMÃO",
BORDER_COLLIER = "BORDER COLLIER",
LABRADOR = "LABRADOR",
}

export interface ICreateDogRequest{
name: string
race: EDOG_RACE | null
status: EDOG_STATUS | null
sex: string
dateOfBirth: Date | null
}

