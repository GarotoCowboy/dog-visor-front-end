import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { theme } from "../../../theme/theme";
import { Card } from "../../shared/components/CardComponent";
import FormComponent from "../../shared/components/FormComponent";
import { ICreateDogConsultationRequest } from "../../types/DogHealth";
import { Button } from "../../shared/components/ButtonComponent";
import { DogRaceLabel, IDogResponse } from "../../types/Dog";
import { getDogsService, postDogConsultation } from "../../service/api";
import { CustomAlertComponent } from "../../shared/components/CustomAlertComponent";
import { femaleDogIcons, maleDogIcons } from "../../consts/dogIcons";
import { SCREENS } from "../../consts/screens";

const avatarMap = [...femaleDogIcons, ...maleDogIcons].reduce(
  (acc, item) => {
    acc[item.key] = item.image;
    return acc;
  },
  {} as Record<string, any>,
);

const buildConsultationCreatedAt = (date: string, time: string) => {
  if (!date || !time) {
    return "";
  }

  return `${date}T${time}:00`;
};

type AlertVariant = "warning" | "error" | "success";

type AlertData = {
  visible: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
};

export const NormalConsultationScreen = ({navigation}: any) => {
  const [dogs, setDogs] = useState<IDogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);
  navigation = useNavigation<any>();

  const [formData, setFormData] = useState<ICreateDogConsultationRequest>({
    diagnosis: "",
    dogId: "",
    dogsBreed: "",
    dogsName: "",
    treatment: "",
    createdAt: "",
  });

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [alertData, setAlertData] = useState<AlertData>({
    visible: false,
    variant: "warning",
    title: "",
    message: "",
  });

  const showAlert = (variant: AlertVariant, title: string, message: string) => {
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

  const verifyValuesIsNotEmpty = () => {
    if (
      formData.diagnosis.trim() === "" ||
      formData.dogId.trim() === "" ||
      formData.dogsName.trim() === "" ||
      formData.dogsBreed.trim() === "" ||
      formData.createdAt.trim() === "" ||
      formData.treatment.trim() === ""
    ) {
      showAlert(
        "warning",
        "Aviso",
        "Todos os valores precisam estar preenchidos.",
      );
      return false;
    }

    return true;
  };

  const loadingDogs = async () => {
    try {
      setLoading(true);

      const data = await getDogsService();

      setDogs(data);
    } catch (error) {
      console.error("Erro ao buscar caes", error);

      showAlert(
        "error",
        "Erro ao buscar caes",
        "Nao foi possivel carregar a lista de caes. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadingDogs();
    }, []),
  );

  const dogOptions = dogs.map((dog) => {
    const breedLabel = dog.race ? DogRaceLabel[dog.race] : "Nao informado";

    return {
      label: `${dog.name} - ${breedLabel}`,
      value: dog.ID,
      image: avatarMap[dog.avatarKey],
    };
  });

  const selectedDog = dogs.find((dog) => dog.ID === formData.dogId);
  const selectedDogImage = selectedDog
    ? avatarMap[selectedDog.avatarKey]
    : null;

  const handleSelectDog = (dogId: string) => {
    const selectedDog = dogs.find((dog) => dog.ID === dogId);

    if (!selectedDog) {
      return;
    }


    setFormData((prev) => ({
      ...prev,
      dogId: String(selectedDog.ID),
      dogsName: selectedDog.name,
      dogsBreed: selectedDog.race ?? "",
    }));
  };

      const handleBackToVeterinarianScreen = () => {
      navigation.navigate("MAIN_TABS",{screen:SCREENS.VETERINARIAN_HOME})
    }

  const handleDateChange = (selectedDate: string) => {
    setDate(selectedDate);
    setFormData((prev) => ({
      ...prev,
      createdAt: buildConsultationCreatedAt(selectedDate, time),
    }));
  };

  const handleTimeChange = (selectedTime: string) => {
    setTime(selectedTime);
    setFormData((prev) => ({
      ...prev,
      createdAt: buildConsultationCreatedAt(date, selectedTime),
    }));
  };

  const handleSaveConsultation = async () => {
    if (savingRef.current) {
      return;
    }

    if (!verifyValuesIsNotEmpty()) {
      return;
    }

    try {
      savingRef.current = true;
      setSaving(true);

      await postDogConsultation(formData);

      showAlert("success", "Sucesso", "Consulta salva com sucesso.");
    } catch (error) {
      console.error("Erro ao salvar consulta", error);

      showAlert(
        "error",
        "Erro ao salvar consulta",
        "Nao foi possivel salvar a consulta. Tente novamente.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const scrollToFormEnd = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 250);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Dados da consulta</Text>
          <View style={styles.cardContainer}>
            <Card>
              <View style={styles.viewCardContainer}>
                <FormComponent
                  variant="dropdown"
                  text="Cao"
                  placeholder={loading ? "Carregando caes..." : "Selecione o cao"}
                  value={formData.dogsName}
                  onChangeText={() => {}}
                  options={dogOptions}
                  onSelect={handleSelectDog}
                  searchable
                  searchPlaceholder="Pesquisar cao pelo nome ou raca"
                  emptyOptionsMessage="Nenhum cao encontrado"
                />

                {selectedDog ? (
                  <View style={styles.selectedDogContainer}>
                    {selectedDogImage ? (
                      <Image source={selectedDogImage} style={styles.dogImage} />
                    ) : (
                      <View style={[styles.dogImage, styles.placeholderImage]} />
                    )}
                    <View style={styles.selectedDogTextContainer}>
                      <Text style={styles.selectedDogName}>{selectedDog.name}</Text>
                      <Text style={styles.selectedDogBreed}>
                        {selectedDog.race
                          ? DogRaceLabel[selectedDog.race]
                          : "Nao informado"}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <FormComponent
                  placeholder="Data da Consulta"
                  value={date}
                  onChangeText={handleDateChange}
                  dateTimeMode="date"
                  text="Data"
                  variant="date"
                />

                <FormComponent
                  keyboardType="numeric"
                  placeholder="Hora da Consulta"
                  value={time}
                  onChangeText={handleTimeChange}
                  dateTimeMode="time"
                  text="Hora"
                  variant="date"
                />

                <FormComponent
                  multiline={true}
                  numberOfLines={3}
                  text="Diagnostico"
                  value={formData.diagnosis}
                  placeholder="Digite o Diagnostico do Cao"
                  onFocus={scrollToFormEnd}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, diagnosis: text }))
                  }
                />
                <FormComponent
                  multiline={true}
                  numberOfLines={2}
                  value={formData.treatment}
                  text="Tratamento"
                  placeholder="Digite o Tratamento do Diagnostico"
                  onFocus={scrollToFormEnd}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, treatment: text }))
                  }
                />
              </View>
            </Card>
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.cancelButton}>
              <Button text="Cancelar" variant="transparent" onPress={handleBackToVeterinarianScreen} />
            </View>
            <View style={styles.saveButton}>
              <Button
                text="Salvar Consulta"
                onPress={handleSaveConsultation}
                disabled={saving}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {saving && (
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
  container: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  buttonContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 14,
    marginBottom: 24,
    paddingHorizontal: 18,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  cardContainer: {
    width: "90%",
    alignSelf: "center",
  },
  viewCardContainer: {
    paddingVertical: 12,
    gap: 24,
  },
  selectedDogContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  dogImage: {
    borderRadius: 32,
    height: 64,
    width: 64,
  },
  placeholderImage: {
    backgroundColor: "#ccc",
  },
  selectedDogTextContainer: {
    flex: 1,
  },
  selectedDogName: {
    fontWeight: "bold",
  },
  selectedDogBreed: {
    marginTop: 2,
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
  title:{
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    paddingHorizontal: 24,
    paddingTop: 24
  }
});
