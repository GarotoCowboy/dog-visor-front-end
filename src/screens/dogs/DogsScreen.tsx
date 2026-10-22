import React, { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

import { SCREENS } from "../../consts/screens";
import { RootStackParamList } from "../../routes";
import { getDogsService } from "../../service/api";
import { AuthContext } from "../../service/authContext";
import { EUserRoles } from "../../types/userRoles";
import { Button } from "../../shared/components/ButtonComponent";
import FormComponent from "../../shared/components/FormComponent";
import { DogRaceLabel, IDogResponse } from "../../types/Dog";
import { theme } from "../../../theme/theme";
import { DogListItemCard } from "./components";
import { useAlert } from "../../hooks/useAlert";

type DogsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof SCREENS.DOG_SCREEN
>;

export const DogsScreen = () => {
  const navigation = useNavigation<DogsScreenNavigationProp>();
  const { showAlert, AlertModal } = useAlert();

  const [dogs, setDogs] = useState<IDogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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
        "Não foi possível carregar a lista de cães. Tente novamente.",
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

  const { roles } = useContext(AuthContext);
  const isCoordinator = roles.includes(EUserRoles.ROLE_COORDINATOR);

  const handleToCreateDogScreen = () => {
    if (!isCoordinator) {
      showAlert(
        "warning",
        "Acesso Restrito",
        "Apenas o coordenador possui permissão para cadastrar um novo cão.",
      );
      return;
    }
    navigation.navigate(SCREENS.CREATE_DOG_SCREEN);
  };

  const handleDogPress = (dog: IDogResponse) => {
    navigation.navigate(SCREENS.DOG_DETAILS_SCREEN, { dog });
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
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

      {loading ? (
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
                <Text style={styles.emptyText}>Nenhum cão encontrado.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <DogListItemCard dog={item} onPress={handleDogPress} />
            )}
          />
        </View>
      )}

      {isCoordinator && (
        <Button text="+" onPress={handleToCreateDogScreen} variant="FAB" />
      )}

      <AlertModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5,
  },
  searchContainer: {
    width: "90%",
    alignSelf: "center",
    paddingTop: 24,
  },
  activityIndicatorContainer: {
    position: "absolute",
    width: 100,
    height: 100,
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  flatListContainer: {
    paddingVertical: 12,
    height: "90%",
    width: "90%",
    alignSelf: "center",
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    opacity: 0.6,
  },
});

export default DogsScreen;
