import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { Button } from "../../shared/components/ButtonComponent";
import { RootStackParamList } from "../../routes";
import { SCREENS } from "../../consts/screens";
import {
  DogRaceLabel,
  DogStatusLabel,
  EDOG_STATUS,
  IDogResponse,
} from "../../types/Dog";
import { useCallback, useState } from "react";
import { getDogsService } from "../../service/api";
import { theme } from "../../../theme/theme";
import { Card } from "../../shared/components/CardComponent";
import { femaleDogIcons, maleDogIcons } from "../../consts/dogIcons";
import { calculateAge } from "../../utils/calculateAge";
import FormComponent from "../../shared/components/FormComponent";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import { CustomAlertComponent } from "../../shared/components/CustomAlertComponent";

type AlertVariant = "warning" | "error" | "success";

type AlertData = {
  visible: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
};

const avatarMap = [...femaleDogIcons, ...maleDogIcons].reduce(
  (acc, item) => {
    acc[item.key] = item.image;
    return acc;
  },
  {} as Record<string, any>
);

export const DogsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [dogs, setDogs] = useState<IDogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [alertData, setAlertData] = useState<AlertData>({
    visible: false,
    variant: "warning",
    title: "",
    message: "",
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

  const loadingDogs = async () => {
    try {
      setLoading(true);

      const data = await getDogsService();

      setDogs(data);
    } catch (error) {
      console.error("Erro ao buscar cães", error);

      showAlert(
        "error",
        "Erro ao buscar cães",
        "Não foi possível carregar a lista de cães. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadingDogs();
    }, [])
  );

  const handleToCreateDogScreen = () => {
    navigation.navigate(SCREENS.CREATE_DOG_SCREEN);
  };

  const filteredDogs = dogs.filter((item) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    const racaTexto = item.race
      ? DogRaceLabel[item.race].toLowerCase()
      : "não informado";

    const nomeCao = item.name.toLowerCase();

    return nomeCao.includes(searchText) || racaTexto.includes(searchText);
  });

  return (
    <View style={{ flex: 1, marginTop: 5 }}>
      <View style={{ width: "90%", alignSelf: "center", paddingTop: 24 }}>
        <FormComponent
          placeholder="Pesquise por nome ou raça..."
          value={search}
          onChangeText={setSearch}
          leftIcon={
            <FontAwesomeFreeSolid
              name="magnifying-glass"
              size={theme.typography.fontSize.base}
              color={theme.colors.secondary}
            />
          }
        />
      </View>

      {loading === true ? (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : (
        <View style={styles.flatListContainer}>
          <FlatList
            data={filteredDogs}
            keyExtractor={(item) => item.ID.toString()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Nenhum cão encontrado.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const imageSource = avatarMap[item.avatarKey];

              return (
                <View style={styles.cardContainer}>
                  <Card>
                    <View style={styles.rowContainer}>
                      <View style={styles.leftColumn}>
                        {imageSource ? (
                          <Image
                            source={imageSource}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <View
                            style={[
                              styles.avatarImage,
                              styles.placeholderImage,
                            ]}
                          />
                        )}
                      </View>

                      <View style={styles.rightColumn}>
                        <View style={styles.nameAndStatusRow}>
                          <Text style={styles.dogNameText} numberOfLines={2}>
                            {item.name}
                          </Text>

                          <View
                            style={{
                              ...styles.dogStatusContainer,
                              ...(item.status === EDOG_STATUS.CEDIDO ||
                              item.status === EDOG_STATUS.DOACAO
                                ? styles.dogStatusContainerAlert
                                : {}),
                            }}
                          >
                            <Text style={styles.dogStatusText}>
                              {item.status
                                ? DogStatusLabel[item.status]
                                : "Não informado"}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.dogDetailsText}>
                          {item.race
                            ? DogRaceLabel[item.race]
                            : "Não informado"}
                        </Text>

                        <View style={{ ...styles.rowContainer, gap: 12 }}>
                          <Text style={styles.dogDetailsText}>
                            {calculateAge(new Date(item.dateOfBirth))}
                          </Text>

                          <Text style={styles.dogDetailsText}>
                            {item.sex === "M" ? "Macho" : "Fêmea"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Card>
                </View>
              );
            }}
          />
        </View>
      )}

      <Button text="+" onPress={handleToCreateDogScreen} variant="FAB" />

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
  activityIndicatorContainer: {
    position: "absolute",
    width: 100,
    height: 100,
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  icon: {
    alignSelf: "center",
    alignContent: "center",
    verticalAlign: "middle",
  },
  flatListContainer: {
    paddingVertical: 12,
    height: "90%",
    width: "90%",
    alignSelf: "center",
  },
  cardContainer: {
    paddingVertical: 8,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftColumn: {
    justifyContent: "center",
    alignItems: "center",
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "center",
  },
  nameAndStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  dogNameText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: "bold",
  },
  dogStatusContainer: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    ...theme.shadows.sm,
  },
  dogStatusContainerAlert: {
    backgroundColor: theme.colors.alert,
  },
  dogStatusText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
  dogDetailsText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    marginTop: 2,
  },
  avatarImage: {
    width: 75,
    height: 75,
    borderRadius: theme.borderRadius.full,
  },
  placeholderImage: {
    backgroundColor: "#ccc",
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    opacity: 0.6,
  },
});