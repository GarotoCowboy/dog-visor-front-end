// [ARCHIVED]
import { useCallback, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { DogRaceLabel, IDogResponse } from "../../../types/Dog";
import { useFocusEffect } from "@react-navigation/native";
import { getDogsService } from "../../../service/api";
import { femaleDogIcons, maleDogIcons } from "../../../consts/dogIcons";
import { ICreateDogConsultationRequest } from "../../../types/DogHealth";
import FormComponent from "../../../shared/components/FormComponent";
import { Card } from "../../../shared/components/CardComponent";

const avatarMap = [...femaleDogIcons, ...maleDogIcons].reduce(
  (acc, item) => {
    acc[item.key] = item.image;
    return acc;
  },
  {} as Record<string, any>,
);

type AlertVariant = "warning" | "error" | "success";

type AlertData = {
  visible: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
};

export const SurgeyComponent = () => {
  const [dogs, setDogs] = useState<IDogResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ICreateDogConsultationRequest>({
    diagnosis: "",
    dogId: "",
    dogsBreed: "",
    dogsName: "",
    treatment: "",
    createdAt: "",
  });

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

  return (
    <ScrollView>
      <Text>Surgey component works</Text>

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
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  selectedDogContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  viewCardContainer: {
    paddingVertical: 12,
    gap: 24,
  },
  cardContainer: {
    width: "90%",
    alignSelf: "center",
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
});

