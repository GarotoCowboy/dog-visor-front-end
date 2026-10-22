import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

import { theme } from "../../../theme/theme";
import FormComponent from "./FormComponent";
import { Button } from "./ButtonComponent";
import {
  forgotPasswordService,
  resetPasswordService,
} from "../../service/api";

interface IPasswordResetOtpModalProps {
  visible: boolean;
  onClose: () => void;
  initialRegistration?: string;
  lockRegistration?: boolean;
  title?: string;
  onSuccess?: (message: string) => void;
}

type Step = "REQUEST_CODE" | "RESET_PASSWORD";

export const PasswordResetOtpModal: React.FC<IPasswordResetOtpModalProps> = ({
  visible,
  onClose,
  initialRegistration = "",
  lockRegistration = false,
  title = "Recuperar / Alterar Senha",
  onSuccess,
}) => {
  const [step, setStep] = useState<Step>("REQUEST_CODE");
  const [registration, setRegistration] = useState(initialRegistration);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (visible) {
      setStep("REQUEST_CODE");
      setRegistration(initialRegistration || "");
      setCode("");
      setNewPassword("");
      setConfirmationPassword("");
      setFeedback(null);
      setLoading(false);
    }
  }, [visible, initialRegistration]);

  const extractErrorMessage = (error: any, fallback: string): string => {
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }
    if (data?.message) {
      return data.message;
    }
    if (data?.error) {
      return data.error;
    }
    if (error?.response?.status === 404) {
      return "Usuário não encontrado para a matrícula informada.";
    }
    if (error?.response?.status === 429) {
      return "Aguarde alguns segundos antes de solicitar um novo código.";
    }
    return fallback;
  };

  const handleRequestOtp = async () => {
    const trimmedRegistration = registration.trim();
    if (!trimmedRegistration) {
      setFeedback({
        type: "error",
        message: "Por favor, informe a sua matrícula.",
      });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      const response = await forgotPasswordService({
        registration: trimmedRegistration,
      });

      setStep("RESET_PASSWORD");
      setFeedback({
        type: "success",
        message:
          response?.message ||
          "Código de verificação enviado para o seu e-mail cadastrado.",
      });
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: extractErrorMessage(
          error,
          "Não foi possível enviar o código de verificação. Verifique a matrícula informada.",
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToStep2Directly = () => {
    const trimmedRegistration = registration.trim();
    if (!trimmedRegistration) {
      setFeedback({
        type: "error",
        message: "Informe a sua matrícula antes de inserir o código OTP.",
      });
      return;
    }
    setFeedback(null);
    setStep("RESET_PASSWORD");
  };

  const handleResetPassword = async () => {
    const trimmedRegistration = registration.trim();
    const trimmedCode = code.replace(/\D/g, "").trim();

    if (!trimmedRegistration) {
      setFeedback({
        type: "error",
        message: "Matrícula não informada.",
      });
      return;
    }

    if (trimmedCode.length !== 6) {
      setFeedback({
        type: "error",
        message: "O código OTP deve conter exatamente 6 dígitos numéricos.",
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setFeedback({
        type: "error",
        message: "A nova senha deve ter no mínimo 6 caracteres.",
      });
      return;
    }

    if (newPassword !== confirmationPassword) {
      setFeedback({
        type: "error",
        message: "A confirmação de senha não coincide com a nova senha.",
      });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);

      const response = await resetPasswordService({
        registration: trimmedRegistration,
        code: trimmedCode,
        newPassword,
        confirmationPassword,
      });

      const successMessage =
        response?.message || "Senha alterada com sucesso!";
      onClose();
      onSuccess?.(successMessage);
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: extractErrorMessage(
          error,
          "Não foi possível redefinir a senha. Verifique se o código OTP está correto e dentro da validade.",
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const isRegistrationEditable = !lockRegistration || !initialRegistration;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBadge}>
                <MaterialDesignIcons
                  name="shield-key-outline"
                  size={22}
                  color={theme.colors.white}
                />
              </View>
              <Text style={styles.headerTitle}>{title}</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              style={styles.closeBtn}
            >
              <MaterialDesignIcons
                name="close"
                size={22}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Indicador de etapas */}
          <View style={styles.stepIndicatorContainer}>
            <View
              style={[
                styles.stepDot,
                step === "REQUEST_CODE" && styles.stepDotActive,
              ]}
            >
              <Text
                style={[
                  styles.stepDotText,
                  step === "REQUEST_CODE" && styles.stepDotTextActive,
                ]}
              >
                1. Solicitar Código
              </Text>
            </View>
            <View
              style={[
                styles.stepDot,
                step === "RESET_PASSWORD" && styles.stepDotActive,
              ]}
            >
              <Text
                style={[
                  styles.stepDotText,
                  step === "RESET_PASSWORD" && styles.stepDotTextActive,
                ]}
              >
                2. Código OTP & Senha
              </Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {feedback && (
              <View
                style={[
                  styles.feedbackBanner,
                  feedback.type === "error"
                    ? styles.feedbackError
                    : feedback.type === "success"
                    ? styles.feedbackSuccess
                    : styles.feedbackInfo,
                ]}
              >
                <MaterialDesignIcons
                  name={
                    feedback.type === "error"
                      ? "alert-circle-outline"
                      : "check-circle-outline"
                  }
                  size={18}
                  color={
                    feedback.type === "error"
                      ? theme.colors.alert
                      : theme.colors.primary
                  }
                />
                <Text
                  style={[
                    styles.feedbackText,
                    {
                      color:
                        feedback.type === "error"
                          ? theme.colors.alert
                          : theme.colors.text,
                    },
                  ]}
                >
                  {feedback.message}
                </Text>
              </View>
            )}

            {step === "REQUEST_CODE" ? (
              <View style={styles.stepContainer}>
                <Text style={styles.descriptionText}>
                  Informe a sua matrícula abaixo. Enviaremos um código de
                  verificação de 6 dígitos (OTP) para o seu e-mail cadastrado.
                </Text>

                <FormComponent
                  text="Matrícula *"
                  placeholder="Ex: Vet-123"
                  value={registration}
                  editable={isRegistrationEditable}
                  onChangeText={(text) => {
                    setRegistration(text);
                    if (feedback) setFeedback(null);
                  }}
                  leftIcon={
                    <MaterialDesignIcons
                      name="id-card"
                      size={theme.typography.fontSize.lg}
                      color={theme.colors.secondary}
                    />
                  }
                />

                <View style={styles.actionsColumn}>
                  <Button
                    text={
                      loading
                        ? "Enviando código..."
                        : "Enviar Código por E-mail"
                    }
                    onPress={handleRequestOtp}
                    disabled={loading}
                    leftIcon={
                      loading ? (
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.white}
                        />
                      ) : (
                        <MaterialDesignIcons
                          name="email-fast-outline"
                          size={18}
                          color={theme.colors.white}
                        />
                      )
                    }
                  />

                  <Button
                    text="Já possuo um código OTP"
                    variant="outline"
                    onPress={handleGoToStep2Directly}
                    disabled={loading}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.stepContainer}>
                <Text style={styles.descriptionText}>
                  Insira o código de 6 dígitos enviado para o e-mail vinculado à
                  matrícula{" "}
                  <Text style={styles.boldText}>{registration.trim()}</Text> e
                  defina a sua nova senha.
                </Text>

                <FormComponent
                  text="Código OTP (6 dígitos) *"
                  placeholder="000000"
                  keyboardType="numeric"
                  value={code}
                  onChangeText={(text) => {
                    const digitsOnly = text.replace(/\D/g, "").slice(0, 6);
                    setCode(digitsOnly);
                    if (feedback?.type === "error") setFeedback(null);
                  }}
                  leftIcon={
                    <MaterialDesignIcons
                      name="numeric"
                      size={theme.typography.fontSize.lg}
                      color={theme.colors.secondary}
                    />
                  }
                />

                <FormComponent
                  text="Nova Senha (mín. 6 caracteres) *"
                  placeholder="Digite a nova senha"
                  variant="password"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (feedback?.type === "error") setFeedback(null);
                  }}
                  leftIcon={
                    <FontAwesomeFreeSolid
                      name="lock"
                      size={theme.typography.fontSize.base}
                      color={theme.colors.secondary}
                    />
                  }
                />

                <FormComponent
                  text="Confirmar Nova Senha *"
                  placeholder="Repita a nova senha"
                  variant="password"
                  value={confirmationPassword}
                  onChangeText={(text) => {
                    setConfirmationPassword(text);
                    if (feedback?.type === "error") setFeedback(null);
                  }}
                  leftIcon={
                    <FontAwesomeFreeSolid
                      name="lock"
                      size={theme.typography.fontSize.base}
                      color={theme.colors.secondary}
                    />
                  }
                />

                <View style={styles.actionsColumn}>
                  <Button
                    text={loading ? "Salvando..." : "Confirmar Nova Senha"}
                    onPress={handleResetPassword}
                    disabled={loading}
                    leftIcon={
                      loading ? (
                        <ActivityIndicator
                          size="small"
                          color={theme.colors.white}
                        />
                      ) : (
                        <MaterialDesignIcons
                          name="check-circle-outline"
                          size={18}
                          color={theme.colors.white}
                        />
                      )
                    }
                  />

                  <View style={styles.secondaryActionsRow}>
                    <TouchableOpacity
                      onPress={handleRequestOtp}
                      disabled={loading}
                      style={styles.linkButton}
                    >
                      <MaterialDesignIcons
                        name="refresh"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.linkButtonText}>Reenviar código</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setFeedback(null);
                        setStep("REQUEST_CODE");
                      }}
                      disabled={loading}
                      style={styles.linkButton}
                    >
                      <MaterialDesignIcons
                        name="arrow-left"
                        size={16}
                        color={theme.colors.secondary}
                      />
                      <Text
                        style={[
                          styles.linkButtonText,
                          { color: theme.colors.secondary },
                        ]}
                      >
                        Voltar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "90%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  stepDot: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stepDotText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary,
  },
  stepDotTextActive: {
    color: theme.colors.white,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 6,
  },
  stepContainer: {
    gap: 16,
  },
  descriptionText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary,
    lineHeight: 20,
  },
  boldText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  feedbackError: {
    backgroundColor: theme.colors.alertLightColor,
    borderColor: theme.colors.alert,
  },
  feedbackSuccess: {
    backgroundColor: "#ECFDF5",
    borderColor: theme.colors.accent,
  },
  feedbackInfo: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
  },
  feedbackText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
  },
  actionsColumn: {
    gap: 10,
    marginTop: 4,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  linkButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
});

export default PasswordResetOtpModal;
