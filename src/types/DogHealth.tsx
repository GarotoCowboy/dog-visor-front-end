export interface ICreateDogConsultationRequest {
  dogId: string;
  treatment: string;
  dogsName: string;
  dogsBreed: string;
  diagnosis: string;
  createdAt: string;
}

export interface IDogConsultationResponse {
  id: string;
  veterinarianId: string;
  dogId: string;
  treatment: string;
  dogsName: string;
  dogsBreed: string;
  diagnosis: string;
  createdAt: string;
  updatedAt: string;
}

// DOG REPRODUCTION (Controle Reprodutivo / Cio)
export interface ICreateDogReproductionRequest {
  dogId: string;
  dogsName: string;
  dogsBreed: string;
  date: string; // Formato "YYYY-MM-DD"
  expectedNextHeatDate?: string; // Formato "YYYY-MM-DD"
  cycleIntervalInMonths?: number;
  observations?: string;
}

export interface IDogReproductionResponse {
  id: string;
  dogId: string;
  dogsName: string;
  dogsBreed: string;
  veterinarianId: string;
  date: string;
  expectedNextHeatDate?: string;
  cycleIntervalInMonths?: number;
  observations?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IUpdateDogReproductionRequest {
  date?: string;
  expectedNextHeatDate?: string;
  cycleIntervalInMonths?: number;
  observations?: string;
}

// DOG WEIGHT (Pesagens)
export interface ICreateDogWeightRequest {
  dogId: string;
  weight: number;
}

export interface IUpdateDogWeightRequest {
  weight: number;
}

export interface IDogWeightResponse {
  id: string;
  dogId: string;
  collaboratorId: string;
  weight: number;
  createdAt: string;
  updatedAt?: string;
}

// DOG MASSAGE (Massagens)
export interface ICreateDogMassageRequest {
  dogId: string;
  date: string; // ISO LocalDateTime: YYYY-MM-DDTHH:mm:ss
  observations?: string;
}

export interface IUpdateDogMassageRequest {
  date?: string;
  observations?: string;
}

export interface IDogMassageResponse {
  id: string;
  dogId: string;
  observations?: string;
  createdAt: string;
  updatedAt?: string;
}


