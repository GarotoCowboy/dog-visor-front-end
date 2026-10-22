import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import * as SecureStore from "expo-secure-store";
import { setUnauthorizedHandler } from "./apiClient";
import {
  decodeAuthUser,
  IAuthUser,
  isTokenExpired,
} from "../utils/authToken";

interface AuthState {
  isLoading: boolean;
  userToken: string | null;
  user: IAuthUser | null;
}

interface AuthContextType {
  userToken: string | null;
  isLoading: boolean;
  /** Roles decodificadas do JWT (atalho para `user.roles`). */
  roles: string[];
  /** Dados do usuário logado, decodificados uma única vez a partir do JWT. */
  user: IAuthUser | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/** Acesso tipado ao contexto de autenticação. */
export const useAuth = () => useContext(AuthContext);

type AuthAction =
  | { type: "RESTORE_TOKEN"; token: string | null }
  | { type: "SIGN_IN"; token: string }
  | { type: "SIGN_OUT" };

const authReducer = (prevState: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        isLoading: false,
        userToken: action.token,
        user: decodeAuthUser(action.token),
      };
    case "SIGN_IN":
      return {
        ...prevState,
        userToken: action.token,
        user: decodeAuthUser(action.token),
      };
    case "SIGN_OUT":
      return { ...prevState, userToken: null, user: null };
  }
};

const EMPTY_ROLES: string[] = [];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isLoading: true,
    userToken: null,
    user: null,
  });

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync("userToken");
    dispatch({ type: "SIGN_OUT" });
  }, []);

  const signIn = useCallback(async (token: string) => {
    await SecureStore.setItemAsync("userToken", token);
    dispatch({ type: "SIGN_IN", token });
  }, []);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token: string | null = null;
      try {
        token = await SecureStore.getItemAsync("userToken");
        if (isTokenExpired(token)) {
          await SecureStore.deleteItemAsync("userToken");
          token = null;
        }
      } catch (e) {
        console.log("Erro ao restaurar token", e);
      }
      dispatch({ type: "RESTORE_TOKEN", token });
    };

    bootstrapAsync();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(signOut);

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [signOut]);

  const value = useMemo<AuthContextType>(
    () => ({
      signIn,
      signOut,
      userToken: state.userToken,
      isLoading: state.isLoading,
      user: state.user,
      roles: state.user?.roles ?? EMPTY_ROLES,
    }),
    [signIn, signOut, state.userToken, state.isLoading, state.user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
