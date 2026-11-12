import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card } from "../../shared/components/CardComponent";
import { Button } from "../../shared/components/ButtonComponent";
import { useState } from "react";
import {
  ERATION_STATUS,
  ICreateRationRequest,
  RationTypeLabel,
} from "../../types/Ration";
import { useNavigation } from "@react-navigation/native";
import FormComponent from "../../shared/components/FormComponent";
import { postDogRation } from "../../service/api";
import axios from "axios";
import { theme } from "../../../theme/theme";
import { useAlert } from "../../hooks/useAlert";

export const CreateRationsScreen = () => {
  const navigator = useNavigation();
  const { showAlert, AlertModal } = useAlert();

  type RationFormData = {
    name: string;
    totalRationQuantity: string;
    currentRationQuantity: string;
    registrationDate: string;
    rationType: ERATION_STATUS | null;
  };

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<RationFormData>({
    name: "",
    totalRationQuantity: "",
    currentRationQuantity: "",
    registrationDate: "",
    rationType: null,
  });

  const verifyValuesIsNotEmpty = () => {
    if (
      formData.name.trim() === "" ||
      formData.rationType === null ||
      formData.registrationDate.trim() === "" ||
      formData.totalRationQuantity === ""
    ) {
      showAlert("warning", "Aviso", "Preencha todos os campos.");
      return false;
    }

    return true;
  };

  const handleSaveRation = async () => {
    if (!verifyValuesIsNotEmpty()) return;

    const total = Number(formData.totalRationQuantity);
    const requestData: ICreateRationRequest = {
      name: formData.name,
      rationType: formData.rationType,
      currentRationQuantity: total,
      totalRationQuantity: total,
      registrationDate: formData.registrationDate,
    };

    try {
      setLoading(true);
      await postDogRation(requestData);

      showAlert("success", "Sucesso", "Ração criada com sucesso.", {
        onConfirm: () => navigator.goBack(),
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("STATUS:", error.response?.status);
        console.log("DATA:", error.response?.data);

        const errorMessage =
          error.response?.data?.message ||
          "Não foi possível cadastrar a ração. Tente novamente.";

        showAlert("error", "Erro ao cadastrar", errorMessage);
        return;
      }

      console.log("Erro inesperado:", error);

      showAlert("error", "Erro ao cadastrar", "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    return navigator.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <Card>
            <View style={styles.formContainer}>
              <FormComponent
                text="Nome"
                placeholder="Canin"
                value={formData.name}
                onChangeText={(text) => {
                  setFormData((prev) => ({
                    ...prev,
                    name: text,
                  }));
                }}
              />
              <FormComponent
                variant="dropdown"
                editable={!loading}
                text="Tipo da Ração"
                placeholder="Selecione o tipo da ração do cão"
                value={
                  formData.rationType ? RationTypeLabel[formData.rationType] : ""
                }
                onChangeText={() => {}}
                options={[
                  { label: "Normal", value: ERATION_STATUS.NORMAL },
                  { label: "Filhote", value: ERATION_STATUS.PUPPY },
                  { label: "Especial", value: ERATION_STATUS.SPECIAL },
                ]}
                onSelect={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    rationType: val as ERATION_STATUS,
                  }))
                }
              />
              <FormComponent
                keyboardType="numeric"
                text="Quantidade"
                placeholder="15KG"
                value={formData.totalRationQuantity.toString()}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalRationQuantity: text,
                  }))
                }
              />

              <FormComponent
                variant="date"
                text="Data de Registro"
                placeholder="2026-04-07"
                value={formData.registrationDate}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    registrationDate: text,
                  }))
                }
              />
            </View>
          </Card>
          <View style={styles.buttonContainer}>
            <View style={styles.cancelButton}>
              <Button
                text="Cancelar"
                onPress={handleCancel}
                disabled={loading}
                variant="transparent"
              />
            </View>

            <View style={styles.registerButton}>
              <Button
                onPress={handleSaveRation}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Salvar Ração</Text>
                )}
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>

      <AlertModal />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  cardContainer: {
    width: "90%",
    alignSelf: "center",
  },
  formContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  buttonContainer: {
    width: "100%",
    gap: 6,
    flexDirection: "row",
    paddingHorizontal: 18,
    paddingTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    flex: 1,
  },
  registerButton: {
    flex: 2,
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
    textAlign: "center",
  },
});
