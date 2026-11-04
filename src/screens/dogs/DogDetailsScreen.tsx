import React, { useCallback, useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { RootStackParamList } from "../../routes";
import { SCREENS } from "../../consts/screens";
import { useAlert } from "../../hooks/useAlert";
import { theme } from "../../../theme/theme";
import { femaleDogIcons, maleDogIcons } from "../../consts/dogIcons";
import {
  EDOG_STATUS,
  IDogResponse,
} from "../../types/Dog";
import {
  IDogMassageResponse,
  IDogReproductionResponse,
  IDogWeightResponse,
} from "../../types/DogHealth";
import {
  getLastDogReproductionByDogIdService,
  getTrainerNamesMapService,
  getTrainingReportByDogIdService,
  listBehaviorTestsByDogIdService,
  listDogMassagesByDogIdService,
  listDogWeightsByDogIdService,
  listTrainingsByDogIdService,
  listVolhardTestsByDogIdService,
  resolveTrainerNameFromMap,
  updateDogReproductionService,
  updateDogService,
} from "../../service/api";
import { appendManualEndObservation } from "../../utils/reproductionStatus";

import {
  getCachedReport,
  getCachedTests,
  getCachedTrainerNamesMap,
  getCachedTrainings,
  saveCachedReport,
} from "../../service/trainingOfflineService";
import { trainingSyncService } from "../../service/trainingSyncService";
import {
  IDogTest,
  ITrainingReportResponse,
  ITrainingResponse,
  ScoreComparisonLabel,
  TestStatus,
  TestType,
} from "../../types/Training";
import {
  decodeBehaviorResultProgress,
  decodeVolhardResultProgress,
} from "../trainer/constants/testQuestionsData";
import { AuthContext } from "../../service/authContext";
import { EUserRoles } from "../../types/userRoles";
import { isDogInKennel } from "./components/DogListItemCard";
import { DogIdentityCard } from "./components/details/DogIdentityCard";
import { DogReproductionCard } from "./components/details/DogReproductionCard";
import { DogTrainingTestsCard } from "./components/details/DogTrainingTestsCard";
import { DogWeightAndMassageCard } from "./components/details/DogWeightAndMassageCard";
import { TrainingHistoryModal } from "../trainer/components/TrainingHistoryModal";
import { EditDogStatusModal } from "./components/details/EditDogStatusModal";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof SCREENS.DOG_DETAILS_SCREEN
>;

const avatarMap = [...femaleDogIcons, ...maleDogIcons].reduce(
  (acc, item) => {
    acc[item.key] = item.image;
    return acc;
  },
  {} as Record<string, any>,
);

export const DogDetailsScreen = ({ route, navigation }: Props) => {
  const { dog: initialDog } = route.params;
  const [dog, setDog] = useState<IDogResponse>(initialDog);
  const [imageSource, setImageSource] = useState(avatarMap[dog.avatarKey]);

  // Permissões de usuário
  const { roles } = useContext(AuthContext);
  const canEditDog =
    roles.includes(EUserRoles.ROLE_VETERINARIAN) ||
    roles.includes(EUserRoles.ROLE_COORDINATOR);

  const isFemale = dog.sex?.toUpperCase() === "F";

  // Estado do controle reprodutivo (se for fêmea)
  const [lastHeat, setLastHeat] = useState<IDogReproductionResponse | null>(null);
  const [loadingHeat, setLoadingHeat] = useState(false);

  // Estado de Treinamento e Testes (Volhard & Behavior)
  const [training, setTraining] = useState<ITrainingResponse | null>(null);
  const [report, setReport] = useState<ITrainingReportResponse | null>(null);
  const [tests, setTests] = useState<IDogTest[]>([]);
  const [loadingTraining, setLoadingTraining] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Estado de Pesagens e Massagens (Informações Avançadas)
  const [weights, setWeights] = useState<IDogWeightResponse[]>([]);
  const [massages, setMassages] = useState<IDogMassageResponse[]>([]);
  const [loadingHealthHistory, setLoadingHealthHistory] = useState(false);

  // Modal de edição de status / canil
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<EDOG_STATUS | null>(
    dog.status || EDOG_STATUS.SOCIALIZACAO,
  );
  const [editOnKennel, setEditOnKennel] = useState<boolean>(isDogInKennel(dog));
  const [updating, setUpdating] = useState(false);

  const { showAlert, showConfirm, AlertModal } = useAlert();

  const fetchTrainingAndTests = useCallback(async () => {
    const dogId = dog.ID;
    if (!dogId) return;

    // 1. Carrega testes do cache local
    let currentTests: IDogTest[] = [];
    const cachedTrainerMap = await getCachedTrainerNamesMap();
    try {
      setLoadingTests(true);
      const cachedTests = await getCachedTests();
      currentTests = (cachedTests || []).map((t) => {
        const tId =
          t.trainerId ||
          t.volhardDetails?.trainerId ||
          t.behaviorDetails?.trainerId ||
          t.volhardPayload?.trainerId ||
          t.behaviorPayload?.trainerId;
        return {
          ...t,
          trainerId: tId,
          trainerName: resolveTrainerNameFromMap(
            tId,
            cachedTrainerMap,
            t.trainerName,
          ),
        };
      });
      setTests(currentTests);
    } catch (e) {
      console.log("Erro ao buscar testes do cão:", e);
    } finally {
      setLoadingTests(false);
    }

    // 2. Carrega treinamento, relatório e testes remotos
    try {
      setLoadingTraining(true);

      // Cache primeiro
      const cachedTrainings = await getCachedTrainings();
      const cachedT = cachedTrainings.find((t) => t.dogId === dogId);
      if (cachedT) {
        setTraining({
          ...cachedT,
          trainerName: resolveTrainerNameFromMap(
            cachedT.trainerId,
            cachedTrainerMap,
            cachedT.trainerName,
          ),
        });
      }

      const cachedRep =
        (await getCachedReport(dogId)) ||
        (cachedT?.id ? await getCachedReport(cachedT.id) : null);
      if (cachedRep) {
        setReport({
          ...cachedRep,
          trainerName: resolveTrainerNameFromMap(
            cachedRep.trainerId,
            cachedTrainerMap,
            cachedRep.trainerName,
          ),
        });
      }

      // Se online, atualiza da API
      const isOnline = await trainingSyncService.checkIsOnline();
      if (isOnline) {
        let fetchedTraining: ITrainingResponse | null = null;
        let fetchedReport: ITrainingReportResponse | null = null;

        try {
          const list = await listTrainingsByDogIdService(dogId);
          if (list && list.length > 0) {
            fetchedTraining = list[0];
            setTraining(list[0]);
          }
        } catch (e) {}

        try {
          const rep = await getTrainingReportByDogIdService(dogId);
          if (rep) {
            fetchedReport = rep;
            setReport(rep);
            await saveCachedReport(dogId, rep);
          }
        } catch (e) {}

        // Busca testes específicos deste cão na API
        try {
          const [volhardsRes, behaviorsRes] = await Promise.allSettled([
            listVolhardTestsByDogIdService(dogId),
            listBehaviorTestsByDogIdService(dogId),
          ]);

          const volhardItems =
            volhardsRes.status === "fulfilled" && Array.isArray(volhardsRes.value)
              ? volhardsRes.value
              : [];

          const behaviorItems =
            behaviorsRes.status === "fulfilled" && Array.isArray(behaviorsRes.value)
              ? behaviorsRes.value
              : [];

          const trainerIdsToResolve = [
            fetchedTraining?.trainerId,
            fetchedReport?.trainerId,
            ...volhardItems.map((v) => v.trainerId),
            ...behaviorItems.map((b) => b.trainerId),
            ...currentTests.map(
              (c) =>
                c.trainerId ||
                c.volhardDetails?.trainerId ||
                c.behaviorDetails?.trainerId ||
                c.volhardPayload?.trainerId ||
                c.behaviorPayload?.trainerId,
            ),
          ];
          const trainerNamesMap =
            await getTrainerNamesMapService(trainerIdsToResolve);

          if (fetchedTraining) {
            setTraining({
              ...fetchedTraining,
              trainerName: resolveTrainerNameFromMap(
                fetchedTraining.trainerId,
                trainerNamesMap,
                fetchedTraining.trainerName,
              ),
            });
          }

          if (fetchedReport) {
            const enrichedRep: ITrainingReportResponse = {
              ...fetchedReport,
              trainerName: resolveTrainerNameFromMap(
                fetchedReport.trainerId,
                trainerNamesMap,
                fetchedReport.trainerName,
              ),
            };
            setReport(enrichedRep);
            await saveCachedReport(dogId, enrichedRep);
          }

          const remoteDogTests: IDogTest[] = [];
          const cachedById = new Map<string, IDogTest>(
            currentTests.map((c) => [c.id, c]),
          );

          volhardItems.forEach((v) => {
            const cachedMatch = cachedById.get(v.id);
            const decoded = decodeVolhardResultProgress(
              v.result,
              cachedMatch?.answeredVolhardKeys,
            );
            remoteDogTests.push({
              id: v.id,
              dogId: v.dogId,
              trainerId: v.trainerId,
              trainerName: resolveTrainerNameFromMap(
                v.trainerId,
                trainerNamesMap,
                cachedMatch?.trainerName,
              ),
              dogsName: dog.name,
              dogsBreed: dog.race || "Raça não informada",
              avatarKey: dog.avatarKey,
              type: TestType.VOLHARD,
              title: "Teste Volhard",
              date: v.date || "",
              description: decoded.cleanDescription,
              score: decoded.isCompleted
                ? `Estabilidade: ${v.stability}/5`
                : `Em andamento: ${decoded.completedCount}/${decoded.totalCount} etapas`,
              status: decoded.isCompleted
                ? TestStatus.COMPLETED
                : TestStatus.PENDING,
              completedCount: decoded.completedCount,
              totalCount: decoded.totalCount,
              answeredVolhardKeys: decoded.answeredKeys,
              isSynced: true,
              volhardDetails: v,
            });
          });

          behaviorItems.forEach((b) => {
            const cachedMatch = cachedById.get(b.id);
            const decoded = decodeBehaviorResultProgress(
              b.result,
              b.characteristics,
              cachedMatch?.answeredBehaviorNumbers,
            );
            const compLabel = b.scoreComparison
              ? ScoreComparisonLabel[b.scoreComparison] || b.scoreComparison
              : "Concluído";
            remoteDogTests.push({
              id: b.id,
              dogId: b.dogId,
              trainerId: b.trainerId,
              trainerName: resolveTrainerNameFromMap(
                b.trainerId,
                trainerNamesMap,
                cachedMatch?.trainerName,
              ),
              dogsName: dog.name,
              dogsBreed: dog.race || "Raça não informada",
              avatarKey: dog.avatarKey,
              type: TestType.BEHAVIOR,
              title: "Teste Behavior",
              date: b.date || "",
              description: decoded.cleanDescription,
              score: decoded.isCompleted
                ? compLabel
                : `Em andamento: ${decoded.completedCount}/${decoded.totalCount} aspectos`,
              status: decoded.isCompleted
                ? TestStatus.COMPLETED
                : TestStatus.PENDING,
              completedCount: decoded.completedCount,
              totalCount: decoded.totalCount,
              answeredBehaviorNumbers: decoded.answeredNumbers,
              isSynced: true,
              behaviorDetails: b,
            });
          });

          if (remoteDogTests.length > 0 || currentTests.length > 0) {
            // Mantém os testes de outros cães ou não sincronizados
            const otherDogsTests = currentTests.filter((t) => t.dogId !== dogId);
            const unsyncedThisDog = currentTests
              .filter((t) => t.dogId === dogId && t.isSynced === false)
              .map((t) => {
                const tId =
                  t.trainerId ||
                  t.volhardPayload?.trainerId ||
                  t.behaviorPayload?.trainerId;
                return {
                  ...t,
                  trainerId: tId,
                  trainerName: resolveTrainerNameFromMap(
                    tId,
                    trainerNamesMap,
                    t.trainerName,
                  ),
                };
              });
            const merged = [...otherDogsTests, ...unsyncedThisDog, ...remoteDogTests];
            const byDogAndType = new Map<string, IDogTest>();
            for (const item of merged) {
              const key = `${String(item.dogId).toLowerCase()}_${item.type}`;
              const existing = byDogAndType.get(key);
              if (
                !existing ||
                (item.completedCount ?? 0) >= (existing.completedCount ?? 0)
              ) {
                byDogAndType.set(key, item);
              }
            }
            setTests(Array.from(byDogAndType.values()));
          }
        } catch (testErr) {
          console.log("Erro ao buscar testes remotos do cão:", testErr);
        }
      }
    } catch (e) {
      console.log("Erro ao carregar dados de treinamento do cão:", e);
    } finally {
      setLoadingTraining(false);
    }

  }, [dog.ID]);

  const fetchWeightsAndMassages = useCallback(async () => {
    if (!dog.ID) return;
    setLoadingHealthHistory(true);
    try {
      const [weightsRes, massagesRes] = await Promise.allSettled([
        listDogWeightsByDogIdService(dog.ID),
        listDogMassagesByDogIdService(dog.ID),
      ]);

      setWeights(
        weightsRes.status === "fulfilled" && Array.isArray(weightsRes.value)
          ? weightsRes.value
          : [],
      );
      setMassages(
        massagesRes.status === "fulfilled" && Array.isArray(massagesRes.value)
          ? massagesRes.value
          : [],
      );
    } catch (e) {
      console.log("Erro ao buscar pesagens e massagens do cão:", e);
    } finally {
      setLoadingHealthHistory(false);
    }
  }, [dog.ID]);

  useEffect(() => {
    setImageSource(avatarMap[dog.avatarKey]);
    if (isFemale) {
      fetchLastHeat();
    }
    fetchTrainingAndTests();
    fetchWeightsAndMassages();
  }, [dog, isFemale, fetchTrainingAndTests, fetchWeightsAndMassages]);

  useFocusEffect(
    useCallback(() => {
      if (isFemale) {
        fetchLastHeat();
      }
      fetchTrainingAndTests();
      fetchWeightsAndMassages();
    }, [isFemale, dog.ID, fetchTrainingAndTests, fetchWeightsAndMassages]),
  );

  const fetchLastHeat = async () => {
    try {
      setLoadingHeat(true);
      const res = await getLastDogReproductionByDogIdService(dog.ID);
      setLastHeat(res);
    } catch (err) {
      console.log("Erro ao buscar último cio da cadela:", err);
    } finally {
      setLoadingHeat(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Não informado";
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleOpenEditModal = () => {
    if (!canEditDog) {
      showAlert(
        "warning",
        "Acesso Restrito",
        "Apenas o médico veterinário ou o coordenador podem alterar o status e presença no canil do cão.",
      );
      return;
    }
    setEditStatus(dog.status || EDOG_STATUS.SOCIALIZACAO);
    setEditOnKennel(isDogInKennel(dog));
    setIsEditModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!editStatus) {
      showAlert(
        "warning",
        "Status Obrigatório",
        "Por favor, selecione um status para o cão.",
      );
      return;
    }

    if (
      editOnKennel &&
      (editStatus === EDOG_STATUS.DOADO || editStatus === EDOG_STATUS.FALECIDO)
    ) {
      showAlert(
        "warning",
        "Restrição de Canil",
        "Cães com status Doado ou Falecido não podem estar no canil.",
      );
      return;
    }

    try {
      setUpdating(true);
      const updatedDog = await updateDogService(dog.ID, {
        ID: dog.ID,
        status: editStatus,
        onKennel: editOnKennel,
      });

      setDog(updatedDog);
      setIsEditModalOpen(false);

      showAlert(
        "success",
        "Atualizado!",
        `Status e presença no canil de ${dog.name} atualizados com sucesso.`,
      );
    } catch (err: any) {
      console.log("Erro ao atualizar cão:", err);
      const message =
        err?.response?.data?.message ||
        "Não foi possível atualizar o cão. Verifique os dados.";
      showAlert("error", "Erro ao Atualizar", message);
    } finally {
      setUpdating(false);
    }
  };

  const handleNavigateToReproduction = (openCreate: boolean = false) => {
    (navigation as any).navigate(SCREENS.REPRODUCTION_MANAGEMENT_SCREEN, {
      preselectedDog: dog,
      openCreate,
    });
  };

  const handleEndHeat = (item: IDogReproductionResponse) => {
    showConfirm(
      "Encerrar Período de Cio",
      `Deseja marcar o período de cio atual de "${dog.name}" como encerrado?`,
      async () => {
        try {
          setLoadingHeat(true);
          const updated = await updateDogReproductionService(item.id, {
            date: item.date,
            expectedNextHeatDate: item.expectedNextHeatDate,
            cycleIntervalInMonths: item.cycleIntervalInMonths,
            observations: appendManualEndObservation(item.observations),
          });
          setLastHeat(updated);
          showAlert(
            "success",
            "Cio Encerrado!",
            `O período de cio de "${dog.name}" foi marcado como encerrado.`,
          );
        } catch (err: any) {
          console.log("Erro ao encerrar cio:", err);
          showAlert(
            "error",
            "Erro ao Encerrar",
            err?.response?.data?.message ||
              "Não foi possível encerrar o período de cio.",
          );
        } finally {
          setLoadingHeat(false);
        }
      },
      { confirmText: "Encerrar Cio", cancelText: "Cancelar" },
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. IDENTIFICAÇÃO E BIOMETRIA */}
      <DogIdentityCard
        dog={dog}
        imageSource={imageSource}
        canEditDog={canEditDog}
        inKennel={isDogInKennel(dog)}
        isFemale={isFemale}
        onEditStatus={handleOpenEditModal}
        formatDate={formatDate}
      />

      {/* 2. TREINAMENTO DE CÃO-GUIA & TESTES VOLHARD / COMPORTAMENTAIS */}
      <DogTrainingTestsCard
        dog={dog}
        training={training}
        report={report}
        tests={tests}
        loadingTraining={loadingTraining}
        loadingTests={loadingTests}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* 3. PESO & MASSAGENS: GRÁFICO DE PESO & HISTÓRICO DE MASSAGENS */}
      <DogWeightAndMassageCard
        dogName={dog.name}
        weights={weights}
        massages={massages}
        loading={loadingHealthHistory}
      />

      {/* 4. CICLO REPRODUTIVO (FÊMEAS) */}
      {isFemale && (
        <DogReproductionCard
          dog={dog}
          canEditDog={canEditDog}
          lastHeat={lastHeat}
          loadingHeat={loadingHeat}
          formatDate={formatDate}
          onNavigateToReproduction={handleNavigateToReproduction}
          onEndHeat={handleEndHeat}
        />
      )}

      {/* 4. MODAL DE RELATÓRIO COMPLETO POR ETAPA */}
      <TrainingHistoryModal
        visible={isReportModalOpen}
        training={
          training || {
            id: `train_${dog.ID}`,
            trainerId: "",
            dogId: dog.ID,
            dogsName: dog.name,
            dogsBreed: dog.race || "",
            monthYear: new Date().getFullYear() * 100 + (new Date().getMonth() + 1),
            day: new Date().getDate(),
            evaluationType: "Guia",
            currentStage: report?.currentStage || 1,
            status: report?.status || null,
          }
        }
        report={report}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* 5. MODAL DE EDIÇÃO DE STATUS E CANIL */}
      <EditDogStatusModal
        visible={isEditModalOpen}
        dogName={dog.name}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        editOnKennel={editOnKennel}
        setEditOnKennel={setEditOnKennel}
        updating={updating}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveStatus}
      />

      {/* 6. ALERTA CUSTOMIZADO */}
      <AlertModal />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
});
