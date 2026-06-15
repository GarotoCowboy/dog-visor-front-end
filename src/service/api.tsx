import axios from 'axios';
import { IAuthenticationDTO } from '../types/Authentication';
import { ADDRESS } from './backEndAddress';
import * as SecureStore from 'expo-secure-store';



const api = axios.create({
    timeout:5000,
    baseURL: ADDRESS
})
export default api;

api.interceptors.request.use(
  async (config) => {
    try {
      // Busca o token JWT salvo no dispositivo pelo AuthContext
      const token = await SecureStore.getItemAsync('userToken');
      
      // Se o token existir, injeta ele no cabeçalho da requisição
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Erro ao buscar o token no SecureStore", error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const loginService = async (credentials: IAuthenticationDTO) => {
  const response = await api.post('api/v1/auth/login', credentials);
  return response.data;
};


//DOGS
export const getDogsService = async () => {
  const response = await api.get('api/v1/dogs'); 
  return response.data;
};





