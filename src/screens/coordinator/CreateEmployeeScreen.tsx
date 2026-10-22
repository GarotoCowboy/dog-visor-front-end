import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

import { theme } from "../../../theme/theme";
import { Button } from "../../shared/components/ButtonComponent";
import { Card } from "../../shared/components/CardComponent";
import FormComponent from "../../shared/components/FormComponent";
import { createEmployeeService } from "../../service/api";
import {
  EmployeeShift,
  EmployeeShiftLabel,
  EmployeeType,
  EmployeeTypeLabel,
  ICreateEmployeeRequest,
} from "../../types/User";
import { useAlert } from "../../hooks/useAlert";

export const CreateEmployeeScreen = () => {
  const navigation = useNavigation();
  const { showAlert, AlertModal } = useAlert();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [registration, setRegistration] = useState("");
  const [type, setType] = useState<EmployeeType | null>(null);
  const [shift, setShift] = useState<EmployeeShift | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Mascara visual de telefone brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  const formatPhoneInput = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (text: string) => {
    setPhone(formatPhoneInput(text));
  };

  const typeOptions = [
    {
      label: EmployeeTypeLabel[EmployeeType.COLLABORATOR],
      value: EmployeeType.COLLABORATOR,
    },
    {
      label: EmployeeTypeLabel[EmployeeType.TRAINER],
      value: EmployeeType.TRAINER,
    },
    {
      label: EmployeeTypeLabel[EmployeeType.VETERINARIAN],
      value: EmployeeType.VETERINARIAN,
    },
    {
      label: EmployeeTypeLabel[EmployeeType.COORDINATOR],
      value: EmployeeType.COORDINATOR,
    },
  ];

  const shiftOptions = [
    {
      label: EmployeeShiftLabel[EmployeeShift.MORNING],
      value: EmployeeShift.MORNING,
    },
    {
      label: EmployeeShiftLabel[EmployeeShift.AFTERNOON],
      value: EmployeeShift.AFTERNOON,
    },
    {
      label: EmployeeShiftLabel[EmployeeShift.NIGHT],
      value: EmployeeShift.NIGHT,
    },
  ];

  const validateForm = (): boolean => {
    if (!name.trim()) {
      showAlert("warning", "Campo Obrigatório", "Por favor, informe o nome completo do funcionário.");
      return false;
    }

    if (name.trim().length < 3) {
      showAlert("warning", "Nome Inválido", "O nome deve ter no mínimo 3 caracteres.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      showAlert("warning", "E-mail Inválido", "Informe um endereço de e-mail válido para envio das credenciais.");
      return false;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 9 || phoneDigits.length > 11) {
      showAlert(
        "warning",
        "Telefone Inválido",
        "Informe um telefone com DDD válido (9 a 11 dígitos numéricos).",
      );
      return false;
    }

    if (!registration.trim()) {
      showAlert(
        "warning",
        "Matrícula Obrigatória",
        "Informe a matrícula ou código de identificação do funcionário.",
      );
      return false;
    }

    if (!type) {
      showAlert("warning", "Cargo Obrigatório", "Selecione o cargo ou função do funcionário.");
      return false;
    }

    if (!shift) {
      showAlert("warning", "Turno Obrigatório", "Selecione o turno de trabalho do funcionário.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const phoneDigits = phone.replace(/\D/g, "");
    const payload: ICreateEmployeeRequest = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phoneDigits,
      registration: registration.trim().toUpperCase(),
      type: type!,
      shift: shift!,
    };

    try {
      setSubmitting(true);
      const created = await createEmployeeService(payload);

      showAlert(
        "success",
        "Funcionário Cadastrado!",
        `O funcionário ${created.name} foi cadastrado com sucesso. Uma senha temporária foi gerada e enviada para o e-mail ${created.email}.`,
        { onConfirm: () => navigation.goBack() },
      );
    } catch (err: any) {
      console.error("Erro ao cadastrar funcionário:", err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Não foi possível cadastrar o funcionário. Verifique se o e-mail ou matrícula já estão em uso.";
      showAlert("error", "Erro no Cadastro", serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* BANNER INFORMATIVO */}
        <View style={styles.infoBanner}>
          <MaterialDesignIcons
            name="account-plus-outline"
            size={22}
            color={theme.colors.primary}
          />
          <View style={styles.infoBannerTextContainer}>
            <Text style={styles.infoBannerTitle}>
              Novo Cadastro de Funcionário
            </Text>
            <Text style={styles.infoBannerSubtitle}>
              O sistema gerará automaticamente uma senha temporária e enviará as
              instruções de primeiro acesso para o e-mail informado.
            </Text>
          </View>
        </View>

        {/* FORMULÁRIO */}
        <Card>
          <View style={styles.formSection}>
            {/* NOME COMPLETO */}
            <FormComponent
              text="Nome Completo: *"
              placeholder="Ex: Maria dos Santos Oliveira"
              value={name}
              onChangeText={setName}
              editable={!submitting}
            />

            {/* E-MAIL */}
            <FormComponent
              text="E-mail Corporativo / Pessoal: *"
              placeholder="Ex: maria.santos@dogvision.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!submitting}
            />

            {/* TELEFONE */}
            <FormComponent
              text="Telefone com DDD: *"
              placeholder="Ex: (11) 98765-4321"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="numeric"
              editable={!submitting}
            />

            {/* MATRICULA */}
            <FormComponent
              text="Matrícula / Registro de Acesso: *"
              placeholder="Ex: FUNC004 ou VET002"
              value={registration}
              onChangeText={(text) => setRegistration(text.toUpperCase())}
              editable={!submitting}
            />

            {/* CARGO / FUNCAO */}
            <FormComponent
              variant="dropdown"
              editable={!submitting}
              text="Cargo / Função: *"
              placeholder="Selecione o cargo"
              value={type ? EmployeeTypeLabel[type] : ""}
              onChangeText={() => {}}
              options={typeOptions}
              onSelect={(val) => setType(val as EmployeeType)}
            />

            {/* TURNO DE TRABALHO */}
            <FormComponent
              variant="dropdown"
              editable={!submitting}
              text="Turno de Trabalho: *"
              placeholder="Selecione o turno"
              value={shift ? EmployeeShiftLabel[shift] : ""}
              onChangeText={() => {}}
              options={shiftOptions}
              onSelect={(val) => setShift(val as EmployeeShift)}
            />

            {/* BOTOES DE ACAO */}
            <View style={styles.actionsContainer}>
              <View style={styles.buttonWrapper}>
                <Button
                  text="Cancelar"
                  variant="outline"
                  onPress={() => navigation.goBack()}
                  disabled={submitting}
                />
              </View>

              <View style={styles.buttonWrapper}>
                <Button
                  text={submitting ? "Cadastrando..." : "Cadastrar"}
                  variant="primary"
                  onPress={handleSave}
                  disabled={submitting}
                  leftIcon={
                    submitting ? (
                      <ActivityIndicator size="small" color={theme.colors.white} />
                    ) : (
                      <FontAwesomeFreeSolid
                        name="check"
                        size={14}
                        color={theme.colors.white}
                      />
                    )
                  }
                />
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* ALERTA CUSTOMIZADO */}
      <AlertModal />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    gap: 14,
    paddingBottom: 80,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: 14,
    gap: 12,
  },
  infoBannerTextContainer: {
    flex: 1,
    gap: 2,
  },
  infoBannerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  infoBannerSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#1E40AF",
    lineHeight: 18,
  },
  formSection: {
    gap: 14,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default CreateEmployeeScreen;
