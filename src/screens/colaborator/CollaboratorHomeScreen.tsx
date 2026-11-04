import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../theme/theme";
import { SCREENS } from "../../consts/screens";
import { EDOG_STATUS, IDogResponse } from "../../types/Dog";
import { AudienceType, MessageType } from "../../types/Notification";
import {
  createDogMassageService,
  createDogWeightService,
  createNotificationService,
  getDogsService,
  getLastDogWeightService,
  getPendingNotificationsService,
} from "../../service/api";
import { notificationWebSocket } from "../../service/notificationWebSocket";
import { isPuppyDog } from "../../utils/calculateAge";
import { useAlert } from "../../hooks/useAlert";
import { PuppyCareCard } from "./components/PuppyCareCard";
import { PuppyWeighingModal } from "./components/PuppyWeighingModal";
import { PuppyMassageModal } from "./components/PuppyMassageModal";
import { PuppyVetAlertModal } from "./components/PuppyVetAlertModal";

export const CollaboratorHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showAlert, AlertModal } = useAlert();

  const [puppies, setPuppies] = useState<IDogResponse[]>([]);
  const [weightsByDogId, setWeightsByDogId] = useState<
    Record<string, number | null>
  >({});
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modais de Pesagem, Massagem e Alerta Vet
  const [selectedPuppy, setSelectedPuppy] = useState<IDogResponse | null>(null);
  const [weighingModalVisible, setWeighingModalVisible] =
    useState<boolean>(false);
  const [massageModalVisible, setMassageModalVisible] =
    useState<boolean>(false);
  const [vetModalVisible, setVetModalVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadPuppiesAndWeights = useCallback(async () => {
    try {
      const allDogs = await getDogsService();
      // Calcula no front-end se o cão é filhote (< 12 meses) ou adulto (>= 12 meses)
      const puppyDogs = (allDogs || []).filter(
        (dog) =>
          dog.status !== EDOG_STATUS.FALECIDO &&
          dog.status !== EDOG_STATUS.DOADO &&
          isPuppyDog(dog.dateOfBirth),
      );
      setPuppies(puppyDogs);

      const weightEntries = await Promise.all(
        puppyDogs.map(async (dog) => {
          try {
            const last = await getLastDogWeightService(dog.ID);
            return [dog.ID, last?.weight ?? null] as const;
          } catch (e) {
            return [dog.ID, null] as const;
          }
        }),
      );

      const nextMap: Record<string, number | null> = {};
      weightEntries.forEach(([id, w]) => {
        nextMap[id] = w;
      });
      setWeightsByDogId(nextMap);
    } catch (e) {
      console.log("Erro ao carregar filhotes e pesos:", e);
    }
  }, []);

  const loadAll = useCallback(async () => {
    await loadPuppiesAndWeights();
  }, [loadPuppiesAndWeights]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAll().finally(() => setLoading(false));
    }, [loadAll]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const averageWeight = useMemo(() => {
    const validWeights = puppies
      .map((p) => weightsByDogId[p.ID])
      .filter((w): w is number => typeof w === "number" && w > 0);
    if (validWeights.length === 0) return "0.0";
    const sum = validWeights.reduce((acc, v) => acc + v, 0);
    return (sum / validWeights.length).toFixed(1);
  }, [puppies, weightsByDogId]);

  const handleSaveWeight = async (dogId: string, weight: number) => {
    try {
      setSubmitting(true);
      await createDogWeightService({ dogId, weight });
      setWeightsByDogId((prev) => ({
        ...prev,
        [dogId]: weight,
      }));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Não foi possível salvar a pesagem do filhote.";
      showAlert("error", "Erro ao Salvar Pesagem", msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMassage = async (dogId: string, observations: string) => {
    try {
      setSubmitting(true);
      const nowIso = new Date().toISOString().split(".")[0];
      await createDogMassageService({
        dogId,
        date: nowIso,
        observations,
      });
      setMassageModalVisible(false);
      showAlert(
        "success",
        "Massagem Registrada!",
        `A sessão de massagem de ${
          selectedPuppy?.name || "o filhote"
        } foi registrada com sucesso!`,
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Não foi possível registrar a massagem do filhote.";
      showAlert("error", "Erro ao Registrar Massagem", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendVetAlert = async (dog: IDogResponse, description: string) => {
    try {
      setSubmitting(true);
      const nowIso = new Date().toISOString().split(".")[0];
      await createNotificationService({
        title: `Solicitação Veterinária • Filhote ${dog.name}`,
        message: description,
        messageType: MessageType.HEALTH_ALERT,
        audienceType: AudienceType.ALL,
        eventDate: nowIso,
      });
      setVetModalVisible(false);
      showAlert(
        "success",
        "Alerta Veterinário Enviado!",
        `O alerta de saúde para ${dog.name} foi enviado ao mural veterinário.`,
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Não foi possível enviar o alerta veterinário.";
      showAlert("error", "Erro ao Enviar Alerta", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.careContent}>
        {/* CARD RESUMO DE FILHOTES E PESO MÉDIO */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryMetric}>
            <View style={styles.summaryIconBox}>
              <MaterialDesignIcons name="dog" size={22} color="#2E6B65" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Filhotes</Text>
              <Text style={styles.summaryValue}>{puppies.length}</Text>
            </View>
          </View>

          <View style={styles.summaryMetric}>
            <View style={styles.summaryIconBox}>
              <MaterialDesignIcons
                name="scale-balance"
                size={22}
                color="#2E6B65"
              />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Peso médio</Text>
              <Text style={styles.summaryValue}>{averageWeight} kg</Text>
            </View>
          </View>
        </View>

        {/* LISTA DE FILHOTES */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando filhotes...</Text>
          </View>
        ) : (
          <FlatList
            data={puppies}
            keyExtractor={(item) => item.ID}
            renderItem={({ item }) => (
              <PuppyCareCard
                dog={item}
                currentWeight={weightsByDogId[item.ID]}
                onPressWeighing={(dog) => {
                  setSelectedPuppy(dog);
                  setWeighingModalVisible(true);
                }}
                onPressMassage={(dog) => {
                  setSelectedPuppy(dog);
                  setMassageModalVisible(true);
                }}
                onPressDogDetails={(dog) =>
                  navigation.navigate(SCREENS.DOG_DETAILS_SCREEN, { dog })
                }
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <MaterialDesignIcons
                  name="dog-side"
                  size={44}
                  color="#D1D5DB"
                />
                <Text style={styles.emptyTitle}>
                  Nenhum filhote encontrado
                </Text>
                <Text style={styles.emptySubtitle}>
                  O sistema calcula automaticamente os cães com menos de 12
                  meses de idade como filhotes.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* MODAL DE PESAGEM */}
      <PuppyWeighingModal
        visible={weighingModalVisible}
        dog={selectedPuppy}
        currentWeight={
          selectedPuppy ? weightsByDogId[selectedPuppy.ID] : undefined
        }
        submitting={submitting}
        onClose={() => setWeighingModalVisible(false)}
        onSaveWeight={handleSaveWeight}
      />

      {/* MODAL DE MASSAGEM */}
      <PuppyMassageModal
        visible={massageModalVisible}
        dog={selectedPuppy}
        submitting={submitting}
        onClose={() => setMassageModalVisible(false)}
        onSaveMassage={handleSaveMassage}
      />

      {/* MODAL DE ALERTA VETERINÁRIO */}
      <PuppyVetAlertModal
        visible={vetModalVisible}
        dog={selectedPuppy}
        submitting={submitting}
        onClose={() => setVetModalVisible(false)}
        onSendVetAlert={handleSendVetAlert}
      />

      {/* ALERTA CUSTOMIZADO */}
      <AlertModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F8",
  },
  topTabsBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  topTabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderBottomWidth: 2.5,
    borderBottomColor: "transparent",
  },
  topTabItemActive: {
    borderBottomColor: "#2E6B65",
  },
  topTabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  topTabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 15,
    color: "#6B7280",
  },
  topTabTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#2E6B65",
  },
  notifBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E57373",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  notifBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#FFFFFF",
  },
  careContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    gap: 28,
    ...theme.shadows.sm,
  },
  summaryMetric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#8E95A2",
  },
  summaryValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 20,
    color: "#1F2937",
    marginTop: 1,
  },
  listContent: {
    gap: 14,
    paddingBottom: 28,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: "#6B7280",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 28,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 15,
    color: "#4B5563",
    marginTop: 6,
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
});

