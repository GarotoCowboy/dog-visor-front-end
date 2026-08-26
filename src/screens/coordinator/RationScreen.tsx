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
import {
  ERATION_STATUS,
  IRationResponse,
} from "../../types/Ration";
import { deleteDogRation, getDogRation } from "../../service/api";
import { theme } from "../../../theme/theme";
import { Card } from "../../shared/components/CardComponent";
import { FontAwesomeFreeSolid } from "@react-native-vector-icons/fontawesome-free-solid";
import { Button } from "../../shared/components/ButtonComponent";
import { CustomAlertComponent } from "../../shared/components/CustomAlertComponent";
import { EditRationFormComponent } from "./components/EditRationFormComponent";

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
  const [openIncreaseRationForm, setOpenIncreaseRationForm] = useState(false);
  const [openDecreaseRationForm, setOpenDecreaseRationForm] = useState(false);

  const [rationToDeleteId, setRationToDeleteId] = useState<string | null>(null);
  const [rationToUpdateId, setRationToUpdateId] = useState<string | null>(null);

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
      console.error("Erro ao buscar ração", error);
      showAlert(
        "error",
        "Erro ao buscar rações",
        "Não foi possível carregar a lista de rações. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteRation = (id: string) => {
    setRationToDeleteId(id);
    showAlert(
      "warning",
      "Confirmar exclusão",
      "Tem certeza que deseja deletar esta ração?",
    );
  };

  const handleDeleteRation = async () => {
    if (!rationToDeleteId) return;

    const id = rationToDeleteId;
    closeAlert();
    setRationToDeleteId(null);

    try {
      setLoading(true);
      await deleteDogRation(id);

      setRations((prev) =>
        prev.filter((item) => String(item.id) !== String(id)),
      );
      showAlert("success", "Sucesso", "Ração deletada com sucesso.");
    } catch (error) {
      console.error("Erro ao deletar ração", error);
      showAlert(
        "error",
        "Erro ao deletar ração",
        "Não foi possível remover a ração. Tente novamente.",
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

  const rationPercent = (totalValue: number, currentValue: number) => {
    if (!totalValue || totalValue === 0) return 0;
    const percent = (currentValue / totalValue) * 100;
    return Math.min(Math.max(percent, 0), 100);
  };

  const getStatusStyle = (percent: number) => {
    if (percent > 60) return styles.currentRationNormalView;
    if (percent < 25) return styles.currentRationLowView;
    return styles.currentRationWarningView;
  };

  const handleToCreateRationScreen = () => {
    navigation.navigate(SCREENS.CREATE_RATIONS_SCREEN);
  };

  const handleIncreaseRation = (id: string) => {
    setRationToUpdateId(id);
    setOpenIncreaseRationForm(true);
  };

  const handleDecreaseRation = (id: string) => {
    setRationToUpdateId(id);
    setOpenDecreaseRationForm(true);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : (
        <View style={styles.flatListContainer}>
          <FlatList
            data={rations}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma ração encontrada.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const percent = rationPercent(
                item.totalRationQuantity,
                item.currentRationQuantity
              );

              return (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(SCREENS.RATION_DETAILS_SCREEN, {
                      ration: item,
                    })
                  }
                >
                  <View style={styles.cardContainer}>
                    <Card>
                      <View style={styles.rowContainer}>
                        <View style={styles.leftColumn}>
                          <View style={styles.iconWrapper}>
                            <FontAwesomeFreeSolid
                              name="box-open"
                              size={theme.typography.fontSize.xl}
                              color={theme.colors.primary}
                            />
                          </View>
                        </View>
                        <View style={styles.infoContainer}>
                          <View style={styles.cardHeader}>
                            <Text style={styles.title}>{item.name}</Text>
                          </View>
                          <Text style={styles.paragraph}>
                            Tipo:{" "}
                            {item.rationType === ERATION_STATUS.NORMAL
                              ? "Normal"
                              : item.rationType === ERATION_STATUS.SPECIAL
                                ? "Especial"
                                : "Filhote"}
                          </Text>

                          <Text style={styles.paragraph}>
                            Estoque: {item.currentRationQuantity} Kg
                          </Text>

                          <View
                            style={[
                              styles.statusBar,
                              getStatusStyle(percent),
                              { width: `${percent}%` },
                            ]}
                          />
                        </View>
                      </View>

                      <View
                        style={[
                          styles.rowContainer,
                          styles.actionButtonsContainer,
                        ]}
                      >
                        <Button
                          onPress={() => handleIncreaseRation(String(item.id))}
                          variant="primary"
                        >
                          <FontAwesomeFreeSolid
                            name="add"
                            size={8}
                            color={theme.colors.accent}
                          />
                        </Button>

                        <Button
                          onPress={() => handleDecreaseRation(String(item.id))}
                          variant="primary"
                        >
                          <FontAwesomeFreeSolid
                            name="minus"
                            size={8}
                            color={theme.colors.accent}
                          />
                        </Button>

                        <Button
                          onPress={() => confirmDeleteRation(String(item.id))}
                          variant="warning"
                        >
                          <FontAwesomeFreeSolid
                            name="trash-can"
                            size={8}
                            color={theme.colors.accent}
                          />
                        </Button>
                      </View>
                    </Card>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      <Button text="+" onPress={handleToCreateRationScreen} variant="FAB" />

      {alertData.visible && (
        <CustomAlertComponent
          visible={alertData.visible}
          variant={alertData.variant}
          title={alertData.title}
          message={alertData.message}
          onClose={() => {
            closeAlert();
            setRationToDeleteId(null);
          }}
          onConfirm={rationToDeleteId ? handleDeleteRation : undefined}
          confirmText="Deletar"
          cancelText="Cancelar"
        />
      )}

<EditRationFormComponent
        isVisible={openIncreaseRationForm}
        type="Increase"
        text="Adicionar Ração"
        rationId={rationToUpdateId}
        onShowAlert={showAlert} 
        onSuccess={() => {
          loadingRations();
          showAlert("success", "Sucesso", "Estoque adicionado com sucesso.");
        }}
        onClose={() => {
          setOpenIncreaseRationForm(false);
          setRationToUpdateId(null);
        }}
      />

      <EditRationFormComponent
        isVisible={openDecreaseRationForm}
        type="Decrease"
        text="Retirar Ração"
        rationId={rationToUpdateId}
        onShowAlert={showAlert} 
        onSuccess={() => {
          loadingRations();
          showAlert("success", "Sucesso", "Estoque reduzido com sucesso.");
        }}
        onClose={() => {
          setOpenDecreaseRationForm(false);
          setRationToUpdateId(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flex: 1,
    width: "90%",
    alignSelf: "center",
  },
  flatListContent: {
    flexGrow: 1,
    paddingTop: 12,
    paddingBottom: 100,
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
  actionButtonsContainer: {
    alignSelf: "flex-end",
    gap: 10,
    paddingVertical: 8,
  },
  iconWrapper: {
    backgroundColor: theme.colors.accent,
    borderRadius: 20,
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
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
  currentRationNormalView: {
    backgroundColor: theme.colors.secondary,
  },
  currentRationWarningView: {
    backgroundColor: theme.colors.warning,
  },
  currentRationLowView: {
    backgroundColor: theme.colors.alert,
  },
  statusBar: {
    marginTop: 5,
    borderRadius: 25,
    height: 5,
    ...theme.shadows.sm,
  },
});