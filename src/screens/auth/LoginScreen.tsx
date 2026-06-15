import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../shared/components/ButtonComponent";
import { Card } from "../../shared/components/CardComponent";
import FormComponent from "../../shared/components/FormComponent";
import { theme } from "../../../theme/theme";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useContext, useState } from "react";
import { AuthContext } from "../../service/authContext";
import { IAuthenticationDTO } from "../../types/Authentication";
import { loginService } from "../../service/api";

export const LoginScreen = () => {
  const { signIn } = useContext(AuthContext);

  const [formData, setFormData] = useState<IAuthenticationDTO>({
    registration: "",
    password: "",
  });

  const handleLogin = async () => {
    if (!formData.registration || !formData.password) {
      Alert.alert("Aviso", "Preencha todos os campos.");
      return;
    }

    try {
      // 1. Chame o seu serviço passando o DTO tipado
      const data = await loginService(formData);

      // 2. Pegue o token que veio do seu backend (ex: data.token ou data.accessToken)
      if (data && data.token) {
        await signIn(data.token); // O Contexto grava no celular e muda a tela!
      } else {
        Alert.alert("Erro", "Token não recebido do servidor.");
      }
    } catch (error: any) {
      console.log("Erro completo do axios:", error);
      Alert.alert("Erro de Autenticação", "Matrícula ou senha incorretos.");
    }
  };

  return (
    <View style={styles.loginContainer}>
      <View style={styles.cardContainer}>
        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <FontAwesomeFreeSolid
                style={styles.icon}
                name={"user"}
                size={theme.typography.fontSize.xxxl}
                color="white"
              />
            </View>
            <Text style={styles.title}>Dog Visor</Text>
            <Text style={styles.subTitle}>Sistema de Gestão de Cães-Guia</Text>
          </View>

          <View style={{ gap: 24 }}>
            <FormComponent 
            placeholder="Vet-123" 
            text="Matricula" 
            value={formData.registration} 
            onChangeText={(text) => setFormData(prev => ({...prev, registration: text}))} />
            <FormComponent
              placeholder="digite sua senha"
              text="senha"
              variant="password"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({...prev,password:text}))}
            />

            <View style={{ gap: 8, width: "60%", alignSelf: "center" }}>
              <Button onPress={handleLogin}>
                <View style={styles.buttonContainer}>
                  <MaterialDesignIcons
                    style={styles.icon}
                    name={"login"}
                    size={theme.typography.fontSize.xl}
                    color="white"                  />
                  <Text style={styles.buttonText}>Entrar</Text>
                </View>
              </Button>
              <Button
                text="Esqueci a minha senha"
                onPress={() => {
                  console.log("clicou esqueci senha");
                }}
                variant="transparent"
              />
            </View>
          </View>
        </Card>
      </View>

      <Text style={styles.subTitle}>
        © 2026 DogVisor. Todos os direitos reservados
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 12,
  },
  cardHeader: {
    alignContent: "center",
    justifyContent: "center",
    padding: 32,
    alignSelf: "center",
    gap: 8,
  },
  cardContainer: {
    width: "90%",
    alignSelf: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 7,
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
  },
  iconContainer: {
    backgroundColor: theme.colors.primary,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
    width: 80,
    height: 80,
    padding: 12,
  },
  icon: {
    alignSelf: "center",
    alignContent: "center",
    verticalAlign: "middle",
  },
  title: {
    textAlign: "center",
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xxl,
  },
  subTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
  },
});
