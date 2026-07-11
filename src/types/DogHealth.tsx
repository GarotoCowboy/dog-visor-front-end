export interface ICreateDogConsultationRequest {
  dogId: string;
  treatment: string;
  dogsName: string;
  dogsBreed: string;
  diagnosis: string;
  createdAt: string
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
