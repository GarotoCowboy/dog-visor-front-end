import api from "./apiClient";
import {
  ICreateDogRequest,
  IDogResponse,
  IUpdateDogRequest,
} from "../types/Dog";

/**
 * Formato bruto aceito da API de cães. A camada de serviço normaliza
 * variações de nomenclatura (`ID`/`id`, `onKennel`/`on_kennel`/`inKennel`)
 * em um único ponto, para que as telas consumam sempre `IDogResponse` com `ID`.
 */
type RawDogResponse = Omit<IDogResponse, "ID"> & {
  ID?: string;
  id?: string;
};

const normalizeDog = (raw: RawDogResponse): IDogResponse => {
  const { id, ...rest } = raw;
  return {
    ...rest,
    ID: raw.ID ?? id ?? "",
    onKennel: raw.onKennel ?? raw.on_kennel ?? raw.inKennel,
  };
};

const normalizeDogList = (data: unknown): IDogResponse[] =>
  Array.isArray(data) ? (data as RawDogResponse[]).map(normalizeDog) : [];

//DOGS
export const getDogsService = async (): Promise<IDogResponse[]> => {
  const response = await api.get<RawDogResponse[]>("/api/v1/dogs");
  return normalizeDogList(response.data);
};

export const listDogsService = getDogsService;

export const getDogsCountService = async (): Promise<number> => {
  const dogs = await listDogsService();
  return dogs.length;
};

export const getDogsByIdService = async (id: string): Promise<IDogResponse> => {
  const response = await api.get<RawDogResponse>(`/api/v1/dogs/${id}`);
  return normalizeDog(response.data);
};

export const postDogService = async (
  dogData: ICreateDogRequest,
): Promise<IDogResponse> => {
  const response = await api.post<RawDogResponse>("/api/v1/dogs", dogData);
  return normalizeDog(response.data);
};

export const updateDogService = async (
  id: string,
  dogData: IUpdateDogRequest,
): Promise<IDogResponse> => {
  const response = await api.put<RawDogResponse>(`/api/v1/dogs/${id}`, dogData);
  return normalizeDog(response.data);
};

export const deleteDogService = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/dogs/${id}`);
};
