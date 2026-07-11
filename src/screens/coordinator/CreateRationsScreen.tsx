import { StyleSheet, Text, View } from "react-native";
import { Card } from "../../shared/components/CardComponent";
import { TipsCardsComponent } from "./components/TipsCardsComponent";
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
import { CustomAlertComponent } from "../../shared/components/CustomAlertComponent";
import { theme } from "../../../theme/theme";

export const CreateRationsScreen = () => {
  const navigator = useNavigation();

  type AlertVariant = "warning" | "error" | "success";

  type RationFormData = {
    name: string;
    totalRationQuantity: string;
    currentRationQuantity: string;
    registrationDate: string;
    rationType: ERATION_STATUS | null;
  };

  type AlertData = {
    visible: boolean;
    variant: AlertVariant;
    title: string;
    message: string;
    goBackOnClose?: boolean;
  };
  const [loading, setLoading] = useState(false);

  const [alertData, setAlertData] = useState<AlertData>({
    visible: false,
    variant: "warning",
    title: "",
    message: "",
    goBackOnClose: false,
  });

  const [formData, setFormData] = useState<RationFormData>({
    name: "",
    totalRationQuantity: "",
    currentRationQuantity: "",
    registrationDate: "",
    rationType: null,
  });

  const showAlert = (
    variant: AlertVariant,
    title: string,
    message: string,
    goBackOnClose = false,
  ) => {
    setAlertData({
      visible: true,
      variant,
      title,
      message,
      goBackOnClose,
    });
  };

  const closeAlert = () => {
    const shouldGoBack = alertData.goBackOnClose;

    setAlertData((prev) => ({
      ...prev,
      visible: false,
      goBackOnClose: false,
    }));

    if (shouldGoBack) {
      navigator.goBack();
    }
  };

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

      showAlert("success", "Sucesso", " Ração criado com sucesso.", true);
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

  const handleCancel = ()=>{
    return navigator.goBack();
  }
  return (
    <View>
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
              editable={false}
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
          <View>
            <Button
              text="Cancelar"
              onPress={handleCancel}
              disabled={loading}
              variant="transparent"
            />
          </View>

          <View>
            <Button
              text="Salvar Ração"
              onPress={handleSaveRation}
              disabled={loading}
            />
          </View>
        </View>
      </View>
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
  cardContainer: {
    width: "90%",
    alignSelf: "center",
  },
  formContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  cardHeaderTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    paddingBottom: 16,
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
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
  },
});
