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
import { ERATION_STATUS, EStockStatus, IRationResponse, RationTypeLabel } from "../../types/Ration";
import { deleteDogRation, getDogRation } from "../../service/api";
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

  // ➕ Guardará o ID do item que está prestes a ser excluído
  const [rationToDeleteId, setRationToDeleteId] = useState<string | null>(null);

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
    // Limpa a seleção caso o alerta feche
    setRationToDeleteId(null);
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

  // 1️⃣ Chamado no clique da lixeira: Abre o alerta de aviso
  const confirmDeleteRation = (id: string) => {
    setRationToDeleteId(id);
    showAlert(
      "warning",
      "Confirmar exclusão",
      "Tem certeza que deseja deletar esta ração?"
    );
  };

  // 2️⃣ Chamado quando o usuário clica em "Confirmar" no Alerta
  const handleDeleteRation = async () => {
    if (!rationToDeleteId) return;

    const id = rationToDeleteId;
    closeAlert(); // Fecha o modal de confirmação

    try {
      setLoading(true);
      await deleteDogRation(id);

      setRations((prev) => prev.filter((item) => String(item.id) !== String(id)));
      showAlert("success", "Sucesso", "Ração deletada com sucesso.");
    } catch (error) {
      console.error("Erro ao deletar ração", error);
      showAlert(
        "error",
        "Erro ao deletar ração",
        "Não foi possível remover a ração. Tente novamente."
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
    if (totalValue === 0) return 0;
    const percent = (currentValue / totalValue) * 100;
    return Math.min(percent, 100);
  };

  const handleToCreateRationScreen = () => {
    navigation.navigate(SCREENS.CREATE_RATIONS_SCREEN);
  };

  return (
    <View style={styles.container}>
      {loading === true ? (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : (
        <View style={styles.flatListContainer}>
          <FlatList
            data={rations}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma ração encontrada.</Text>
              </View>
            }
            renderItem={({ item }) => {
              return (
                <TouchableOpacity onPress={() =>
                  navigation.navigate(SCREENS.RATION_DETAILS_SCREEN,{ration:item})
                }>
                  <View style={styles.cardContainer}>
                    <Card>
                      <View style={styles.rowContainer}>
                        <View style={styles.leftColumn}>
                          <View style={{backgroundColor:theme.colors.accent,borderRadius:20,height:50,width:50,alignItems:"center",justifyContent:"center"}}>
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
                            Estoque: {item.currentRationQuantity} <Text>Kg</Text>
                          </Text>

                          <View
                            style={[
                              rationPercent(item.totalRationQuantity, item.currentRationQuantity) > 60
                                ? styles.currentRationNormalView
                                : rationPercent(item.totalRationQuantity, item.currentRationQuantity) < 25
                                ? styles.currentRationWarningView
                                : styles.currentRationLowView,
                              {
                                width: `${rationPercent(
                                  item.totalRationQuantity,
                                  item.currentRationQuantity
                                )}%`,
                              },
                              { ...styles.statusBar },
                            ]}
                          ></View>
                        </View>
                      </View>

                      <View style={[
                        styles.rowContainer,
                        {alignSelf:"flex-end"},
                        {gap:"10"},
                        {paddingVertical:8},
                  
                      ]}>
                        <View style={{ width: 38, height: 38 }}>
                          <Button onPress={() => console.log("editar")} variant="primary">
                            <View style={{}}>
                              <FontAwesomeFreeSolid
                                name="pen"
                                size={8}
                                color={theme.colors.accent}
                              />
                            </View>
                          </Button>
                        </View>

                        <View style={{ width: 38, height: 38 }}>
                          {/* 🔄 Alterado para chamar a confirmação em vez de deletar direto */}
                          <Button onPress={() => confirmDeleteRation(item.id)} variant="warning">
                            <View style={{}}>
                              <FontAwesomeFreeSolid
                                name="trash-can"
                                size={8}
                                color={theme.colors.accent}
                              />
                            </View>
                          </Button>
                        </View>
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
          onClose={closeAlert}
          // ➕ Se houver um ID selecionado, injeta as ações de confirmação
          onConfirm={rationToDeleteId ? handleDeleteRation : undefined}
          confirmText="Deletar"
          cancelText="Cancelar"
        />
      )}
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