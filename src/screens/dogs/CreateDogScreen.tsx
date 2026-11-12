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
import FormComponent from "../../shared/components/FormComponent";
import { useContext, useState } from "react";
import { AuthContext } from "../../service/authContext";
import { EUserRoles } from "../../types/userRoles";
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
import { useAlert } from "../../hooks/useAlert";

export const CreateDogsScreen = () => {
  const navigator = useNavigation();
  const { roles } = useContext(AuthContext);
  const isCoordinator = roles.includes(EUserRoles.ROLE_COORDINATOR);
  const { showAlert, AlertModal } = useAlert();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ICreateDogRequest>({
    name: "",
    race: null,
    dateOfBirth: "",
    sex: "",
    avatarKey: "",
    status: null,
    onKennel: true,
  });

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

    if (
      Boolean(formData.onKennel) &&
      (formData.status === EDOG_STATUS.DOADO ||
        formData.status === EDOG_STATUS.FALECIDO)
    ) {
      showAlert(
        "warning",
        "Aviso",
        "Cães com status Doado ou Falecido não podem estar no canil.",
      );
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
    if (!isCoordinator) {
      showAlert(
        "error",
        "Acesso Restrito",
        "Apenas o coordenador possui permissão para cadastrar um novo cão.",
        { onConfirm: () => navigator.goBack() },
      );
      return;
    }

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
        { onConfirm: () => navigator.goBack() },
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
        "Ocorreu um erro inesperado.",
      );
    } finally {
      setLoading(false);
    }
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
                editable={!loading}
                text="Raça:"
                placeholder="Selecione a raça"
                value={formData.race ? DogRaceLabel[formData.race] : ""}
                onChangeText={() => {}}
                options={[
                  { label: DogRaceLabel[EDOG_RACE.LABRADOR] || "Labrador", value: EDOG_RACE.LABRADOR },
                  { label: DogRaceLabel[EDOG_RACE.BORDER_COLLIER] || "Border Collie", value: EDOG_RACE.BORDER_COLLIER },
                  {
                    label: DogRaceLabel[EDOG_RACE.GOLDEN_RETRIEVER] || "Golden Retriever",
                    value: EDOG_RACE.GOLDEN_RETRIEVER,
                  },
                  { label: DogRaceLabel[EDOG_RACE.PASTOR_ALEMAO] || "Pastor Alemão", value: EDOG_RACE.PASTOR_ALEMAO },
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
                editable={!loading}
                text="Status:"
                placeholder="Selecione o status"
                value={formData.status ? DogStatusLabel[formData.status] : ""}
                onChangeText={() => {}}
                options={[
                  {
                    label: DogStatusLabel[EDOG_STATUS.PRE_SOCIALIZACAO],
                    value: EDOG_STATUS.PRE_SOCIALIZACAO,
                  },
                  {
                    label: DogStatusLabel[EDOG_STATUS.SOCIALIZACAO],
                    value: EDOG_STATUS.SOCIALIZACAO,
                  },
                  {
                    label: DogStatusLabel[EDOG_STATUS.TREINAMENTO],
                    value: EDOG_STATUS.TREINAMENTO,
                  },
                  {
                    label: DogStatusLabel[EDOG_STATUS.ADAPTACAO],
                    value: EDOG_STATUS.ADAPTACAO,
                  },
                  {
                    label: DogStatusLabel[EDOG_STATUS.REPRODUCAO],
                    value: EDOG_STATUS.REPRODUCAO,
                  },
                  {
                    label: DogStatusLabel[EDOG_STATUS.AGUARDANDO_APOSENTADORIA],
                    value: EDOG_STATUS.AGUARDANDO_APOSENTADORIA,
                  },
                  {
                    label: DogStatusLabel[EDOG_STATUS.DOADO],
                    value: EDOG_STATUS.DOADO,
                  },
                  {
                    label: DogStatusLabel[EDOG_STATUS.FALECIDO],
                    value: EDOG_STATUS.FALECIDO,
                  },
                ]}
                onSelect={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: val as EDOG_STATUS,
                  }))
                }
              />

              <CheckBox
                value={Boolean(formData.onKennel)}
                onChangeChecked={(checked) => {
                  setFormData((prev) => ({
                    ...prev,
                    onKennel: checked,
                  }));
                }}
                label="No Canil"
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
  cardHeaderTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
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
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.white,
  },
});