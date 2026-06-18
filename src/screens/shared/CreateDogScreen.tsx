import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Card } from "../../shared/components/CardComponent";
import FormComponent from "../../shared/components/FormComponent";
import { useState } from "react";
import {
  DogRaceLabel,
  DogStatusLabel,
  EDOG_RACE,
  EDOG_STATUS,
  ICreateDogRequest,
} from "../../types/Dog";
import { CheckBox } from "../../shared/components/CheckBoxComponent";
import { theme } from "../../../theme/theme";
import { Button } from "../../shared/components/ButtonComponent";
import { useNavigation } from "@react-navigation/native";
import { postDogService } from "../../service/api";
import axios from "axios";
import {
  getRandomFemaleDogIcon,
  getRandomMaleDogIcon,
} from "../../utils/getRandomDogIcon";
import { CustomAlertComponent } from "../../shared/components/CustomAlertComponent";

type AlertVariant = "warning" | "error" | "success";

type AlertData = {
  visible: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
  goBackOnClose?: boolean;
};

export const CreateDogsScreen = () => {
  const navigator = useNavigation();
  const [loading, setLoading] = useState(false);

  const [alertData, setAlertData] = useState<AlertData>({
    visible: false,
    variant: "warning",
    title: "",
    message: "",
    goBackOnClose: false,
  });

  const [formData, setFormData] = useState<ICreateDogRequest>({
    name: "",
    race: null,
    dateOfBirth: "",
    sex: "",
    avatarKey: "",
    status: null,
  });

  const showAlert = (
    variant: AlertVariant,
    title: string,
    message: string,
    goBackOnClose = false
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
      formData.race === null ||
      formData.dateOfBirth.trim() === "" ||
      formData.sex === "" ||
      formData.status === null
    ) {
      showAlert("warning", "Aviso", "Preencha todos os campos.");
      return false;
    }

    return true;
  };

  const generateRandomAvatar = (sex: string): string => {
    if (sex === "M") {
      return getRandomMaleDogIcon().key;
    }

    if (sex === "F") {
      return getRandomFemaleDogIcon().key;
    }

    return "";
  };

  const handleCancel = () => {
    navigator.goBack();
  };

  const handleConfirm = async () => {
    if (!verifyValuesIsNotEmpty()) {
      return;
    }

    const generatedAvatarKey = generateRandomAvatar(formData.sex);

    const updatedData = {
      ...formData,
      avatarKey: generatedAvatarKey,
    };

    try {
      setLoading(true);

      await postDogService(updatedData);

      setFormData(updatedData);

      showAlert(
        "success",
        "Sucesso",
        "Cão criado com sucesso.",
        true
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("STATUS:", error.response?.status);
        console.log("DATA:", error.response?.data);

        const errorMessage =
          error.response?.data?.message ||
          "Não foi possível cadastrar o cão. Tente novamente.";

        showAlert("error", "Erro ao cadastrar", errorMessage);
        return;
      }

      console.log("Erro inesperado:", error);

      showAlert(
        "error",
        "Erro ao cadastrar",
        "Ocorreu um erro inesperado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Card>
          <View style={styles.formContainer}>
            <Text style={styles.cardHeaderTitle}>Identificação</Text>

            <FormComponent
              text="Nome:"
              placeholder="Thor"
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
            />

            <FormComponent
              variant="dropdown"
              editable={false}
              text="Raça:"
              placeholder="Selecione a raça"
              value={formData.race ? DogRaceLabel[formData.race] : ""}
              onChangeText={() => {}}
              options={[
                { label: "Labrador", value: EDOG_RACE.LABRADOR },
                { label: "Border Collier", value: EDOG_RACE.BORDER_COLLIER },
                {
                  label: "Golden Retriever",
                  value: EDOG_RACE.GOLDEN_RETRIEVER,
                },
                { label: "Pastor Alemão", value: EDOG_RACE.PASTOR_ALEMAO },
              ]}
              onSelect={(val) =>
                setFormData((prev) => ({ ...prev, race: val as EDOG_RACE }))
              }
            />

            <View style={{ flexDirection: "row", gap: 22 }}>
              <CheckBox
                value={formData.sex === "M"}
                onChangeChecked={() => {
                  setFormData((prev) => ({ ...prev, sex: "M" }));
                }}
                label="Macho"
              />

              <CheckBox
                value={formData.sex === "F"}
                onChangeChecked={() => {
                  setFormData((prev) => ({ ...prev, sex: "F" }));
                }}
                label="Fêmea"
              />
            </View>

            <FormComponent
              variant="date"
              text="Data de Nascimento:"
              placeholder="2026-04-07"
              value={formData.dateOfBirth}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  dateOfBirth: text,
                }))
              }
            />

            <FormComponent
              variant="dropdown"
              editable={false}
              text="Status:"
              placeholder="Selecione o status do cão"
              value={formData.status ? DogStatusLabel[formData.status] : ""}
              onChangeText={() => {}}
              options={[
                { label: "Adaptação", value: EDOG_STATUS.ADAPTACAO },
                { label: "Cedido", value: EDOG_STATUS.CEDIDO },
                { label: "Doação", value: EDOG_STATUS.DOACAO },
                {
                  label: "Pré Socialização",
                  value: EDOG_STATUS.PRE_SOCIALIZACAO,
                },
                { label: "Socialização", value: EDOG_STATUS.SOCIALIZACAO },
                { label: "Treinamento", value: EDOG_STATUS.TREINAMENTO },
              ]}
              onSelect={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  status: val as EDOG_STATUS,
                }))
              }
            />
          </View>
        </Card>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.cancelButton}>
          <Button
            text="Cancelar"
            onPress={handleCancel}
            variant="transparent"
          />
        </View>

        <View style={styles.registerButton}>
          <Button onPress={handleConfirm} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Text style={styles.buttonText}>Cadastrar Cão</Text>
            )}
          </Button>
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
  container: {},
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