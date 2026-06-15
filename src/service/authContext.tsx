import { createContext, useEffect, useMemo, useReducer } from "react";
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode"; // Lib leve para ler o JWT

// Interface do payload do seu JWT (ajuste conforme sua API envia)
interface CustomJwtPayload {
  roles?: string[]; // ou 'role' se for uma única string
  sub?: string;
  exp?: number;
}

interface AuthState {
  isLoading: boolean;
  userToken: string | null;
  roles: string[]; // Guardamos as roles tratadas no estado
}

interface AuthContextType {
  userToken: string | null;
  isLoading: boolean;
  roles: string[];
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

type AuthAction = 

  | { type: 'RESTORE_TOKEN'; token: string | null; roles: string[] }
  | { type: 'SIGN_IN'; token: string; roles: string[] }
  | { type: 'SIGN_OUT' };

// Função auxiliar para extrair roles com segurança do token
const getRolesFromToken = (token: string | null): string[] => {
  if (!token) return [];
  try {
    const decoded = jwtDecode<CustomJwtPayload>(token);
    // Garante que retorna um array (ajuste se sua API mandar string única)
    return Array.isArray(decoded.roles) ? decoded.roles : decoded.roles ? [decoded.roles] : [];
  } catch (error) {
    console.log("Erro ao decodificar token", error);
    return [];
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(
    (prevState: AuthState, action: AuthAction): AuthState => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return { isLoading: false, userToken: action.token, roles: action.roles };
        case 'SIGN_IN':
          return { ...prevState, userToken: action.token, roles: action.roles };
        case 'SIGN_OUT':
          return { ...prevState, userToken: null, roles: [] };
      }
    },
    { isLoading: true, userToken: null, roles: [] }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token = null;
      let roles: string[] = [];
      try {
        token = await SecureStore.getItemAsync('userToken');
        roles = getRolesFromToken(token);
      } catch (e) {
        console.log('Erro ao restaurar token', e);
      }
      dispatch({ type: 'RESTORE_TOKEN', token, roles });
    };

    bootstrapAsync();
  }, []);

  const authActions = useMemo(() => ({
    signIn: async (token: string) => {
      await SecureStore.setItemAsync('userToken', token);
      const roles = getRolesFromToken(token);
      dispatch({ type: 'SIGN_IN', token, roles });
    },
    signOut: async () => {
      await SecureStore.deleteItemAsync('userToken');
      dispatch({ type: 'SIGN_OUT' });
    },
    userToken: state.userToken,
    isLoading: state.isLoading,
    roles: state.roles // Expondo as roles para os navigators
  }), [state.userToken, state.isLoading, state.roles]);

  return (
    <AuthContext.Provider value={authActions}>
      {children}
    </AuthContext.Provider>
  );
};