export interface ICreateMedicationRequest {
  dogsName: string;
  prescription: string;
  limitDate: string; // Formato "YYYY-MM-DD"
}

export interface IMedicationResponse {
  id: string;
  dogsName: string;
  prescription: string;
  limitDate: string;
  createdAt: string;
  updatedAt?: string;
}

