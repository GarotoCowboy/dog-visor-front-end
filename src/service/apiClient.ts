import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { isTokenExpired } from "../utils/authToken";
import { ADDRESS } from "./backEndAddress";

let unauthorizedHandler: (() => Promise<void>) | null = null;

export const setUnauthorizedHandler = (
  handler: (() => Promise<void>) | null,
) => {
  unauthorizedHandler = handler;
};

const handleUnauthorized = async () => {
  await SecureStore.deleteItemAsync("userToken");
  await unauthorizedHandler?.();
};

const api = axios.create({
  timeout: 15000,
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
