import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
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
import { CustomAlertComponent } from "../../shared/components/CustomAlertComponent";

type AlertVariant = "warning" | "error" | "success";

type AlertData = {
  visible: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
};

export const LoginScreen = () => {
  const { signIn } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  const [alertData, setAlertData] = useState<AlertData>({
    visible: false,
    variant: "warning",
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState<IAuthenticationDTO>({
    registration: "",
    password: "",
  });

  const showAlert = (
    variant: AlertVariant,
    title: string,
    message: string
  ) => {
    setAlertData({
      visible: true,
      variant,
      title,
      message,
    });
  };

  const closeAlert = () => {
    setAlertData((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const handleLogin = async () => {
    if (!formData.registration || !formData.password) {
      showAlert(
        "warning",
        "Aviso",
        "Usuário e senha precisam ser preenchidos."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await loginService(formData);

      if (data && data.token) {
        await signIn(data.token);
      } else {
        showAlert("error", "Erro", "Token não recebido do servidor.");
      }
    } catch (error: any) {
      console.log("Erro completo do axios:", error);

      showAlert(
        "error",
        "Erro de autenticação",
        "Matrícula ou senha incorretos."
      );
    } finally {
      setLoading(false);
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
                name="user"
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
              text="Matrícula"
              value={formData.registration}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  registration: text,
                }))
              }
              leftIcon={
                <MaterialDesignIcons
                  name="id-card"
                  size={theme.typography.fontSize.lg}
                  color={theme.colors.secondary}
                />
              }
            />

            <FormComponent
              placeholder="Digite sua senha"
              text="Senha"
              variant="password"
              value={formData.password}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  password: text,
                }))
              }
              leftIcon={
                <FontAwesomeFreeSolid
                  name="lock-open"
                  size={theme.typography.fontSize.base}
                  color={theme.colors.secondary}
                />
              }
            />

            <View style={{ gap: 8, width: "60%", alignSelf: "center" }}>
              <Button onPress={handleLogin} disabled={loading}>
                <View style={styles.buttonContainer}>
                  <MaterialDesignIcons
                    style={styles.icon}
                    name="login"
                    size={theme.typography.fontSize.xl}
                    color="white"
                  />

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

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {alertData.visible && (
        <CustomAlertComponent
          visible={alertData.visible}
          variant={alertData.variant}
          title={alertData.title}
          message={alertData.message}
          onClose={closeAlert}
        />
      )}
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
    alignItems: "center",
    justifyContent: "center",
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
    textAlign: "center",
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});