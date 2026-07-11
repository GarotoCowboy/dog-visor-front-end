import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../routes";
import { SCREENS } from "../../consts/screens";
import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { EStockStatus, IRationResponse } from "../../types/Ration";
import { getDogRation } from "../../service/api";
import { theme } from "../../../theme/theme";
import { Card } from "../../shared/components/CardComponent";
import { FontAwesomeFreeSolid } from "@react-native-vector-icons/fontawesome-free-solid";
import { Button } from "../../shared/components/ButtonComponent";
import { CustomAlertComponent } from "../../shared/components/CustomAlertComponent";

type AlertVariant = "warning" | "error" | "success";

type AlertData = {
  visible: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
};

type RationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  typeof SCREENS.RATIONS_SCREEN
>;

export const RationScreen = () => {
  const navigation = useNavigation<RationScreenNavigationProp>();

  const [rations, setRations] = useState<IRationResponse[]>([]);
  const [loading, setLoading] = useState(false);

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

  const loadingRations = async () => {
    try {
      setLoading(true);

      const data = await getDogRation();

      setRations(data);
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
      loadingRations();
    }, []),
  );

  const handleToCreateRationScreen = () => {
    navigation.navigate(SCREENS.CREATE_RATIONS_SCREEN);
  };
  return (
    <View>
      {loading === true  ? (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent}></ActivityIndicator>
        </View>
      ) : (
        <View style={styles.flatListContainer}>
          <FlatList
            data={rations}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma ração encontrada.</Text>
              </View>
            }
            renderItem={({ item }) => {
              return (
                <TouchableOpacity onPress={() => {}}>
                  <View style={styles.cardContainer}>
                    <Card>
                      <View style={styles.rowContainer}>
                        <View style={styles.leftColumn}>
                          <FontAwesomeFreeSolid
                            name="bowl-food"
                            size={theme.typography.fontSize.xxxl}
                            color={theme.colors.primary}
                          />
                        </View>
                        <View style={styles.infoContainer}>
                          <View style={styles.cardHeader}>
                            <Text style={styles.title}>{item.name}</Text>
                          </View>
                          <Text style={styles.paragraph}>Tipo: {item.rationType}</Text>
                          <Text style={styles.paragraph}>
                            Quantidade Atual: 
                            <Text style={
                              item.stockStatus === EStockStatus.HEALTH ? styles.currentRationNormal : 
                              item.stockStatus === EStockStatus.LOW ? styles.currentRationLow : styles.currentRationOutOfStock }>
                              {item.currentRationQuantity}</Text> Kg
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </View>
                </TouchableOpacity>
              );
            }}
          ></FlatList>
        </View>
      )}
       <Button text="+" onPress={handleToCreateRationScreen} variant="FAB" />

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

  flatListContainer: {
    paddingVertical: 12,
    height: "90%",
    width: "90%",
    alignSelf: "center",
  },
  cardHeader: {},
  cardContainer: {
    paddingVertical: 8,
  },
  infoContainer: {
    gap: 4,
    paddingLeft: 24,
    flex: 1,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftColumn: {
    justifyContent: "center",
    alignItems: "center",
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
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    textAlign: "center",
  },

  paragraph: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  currentRationNormal:{
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.base
  },
    currentRationLow:{
    color: theme.colors.warning,
    fontSize: theme.typography.fontSize.base
  },
      currentRationOutOfStock:{
    color: theme.colors.alert,
    fontSize: theme.typography.fontSize.base
  }
});
