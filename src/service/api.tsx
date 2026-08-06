import axios from "axios";
import { IAuthenticationDTO } from "../types/Authentication";
import { ADDRESS } from "./backEndAddress";
import * as SecureStore from "expo-secure-store";
import { ICreateDogRequest, IDogResponse } from "../types/Dog";
import { jwtDecode } from "jwt-decode";
import { ICreateDogConsultationRequest } from "../types/DogHealth";
import { ICreateRationRequest } from "../types/Ration";

interface JwtPayload {
  exp?: number;
}

let unauthorizedHandler: (() => Promise<void>) | null = null;

export const setUnauthorizedHandler = (
  handler: (() => Promise<void>) | null,
) => {
  unauthorizedHandler = handler;
};

const isTokenExpired = (token: string) => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) {
      return false;
    }

    return decoded.exp <= Date.now() / 1000;
  } catch (error) {
    console.log("Erro ao decodificar token", error);
    return true;
  }
};

const handleUnauthorized = async () => {
  await SecureStore.deleteItemAsync("userToken");
  await unauthorizedHandler?.();
};

const api = axios.create({
  timeout: 5000,
  baseURL: ADDRESS,
});
export default api;

api.interceptors.request.use(
  async (config) => {
    try {
      // Busca o token JWT salvo no dispositivo pelo AuthContext
      const token = await SecureStore.getItemAsync("userToken");
      // Se o token existir, injeta ele no cabeçalho da requisição
      if (token) {
        if (isTokenExpired(token)) {
          await handleUnauthorized();
          return Promise.reject(new Error("Token expirado"));
        }

        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Erro ao buscar o token no SecureStore", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await handleUnauthorized();
    }

    return Promise.reject(error);
  },
);

export const loginService = async (credentials: IAuthenticationDTO) => {
  const response = await api.post("api/v1/auth/login", credentials);
  return response.data;
};

//DOGS
export const getDogsService = async () => {
  const response = await api.get("api/v1/dogs");
  return response.data;
};

export const getDogsByIdService = async (id: string) => {
  const response = await api.get("api/v1/dogs/${id}");
  return response.data;
};

export const postDogService = async (dogData: ICreateDogRequest) => {
  const response = await api.post("api/v1/dogs", dogData);
  return response.data;
};

//DOG HEALTH

export const postDogConsultation = async (
  consultationData: ICreateDogConsultationRequest,
) => {
  const response = await api.post(
    "/api/v1/doghealth/consultation",
    consultationData,
    { timeout: 20000 },
  );
  return response.data;
};

//DOG FEEDING
export const postDogRation = async (rationData: ICreateRationRequest) => {
  const response = await api.post("api/v1/dogfeeding/rations", rationData, {
    timeout: 20000,
  });
  return response.data;
};

export const getDogRation = async () => {
  const response = await api.get("api/v1/dogfeeding/rations");
  return response.data;
};

export const deleteDogRation = async (id: string) => {
  const response = await api.delete(`api/v1/dogfeeding/rations/${id}`)
  return response.data;
}
