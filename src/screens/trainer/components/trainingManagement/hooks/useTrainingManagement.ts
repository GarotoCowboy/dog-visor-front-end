import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../../service/authContext";
import { trainingSyncService } from "../../../../../service/trainingSyncService";
import { getCachedStageData } from "../../../../../service/trainingOfflineService";
import {
  ITrainingReportResponse,
  ITrainingResponse,
  TraningStatus,
} from "../../../../../types/Training";
import { IDogResponse } from "../../../../../types/Dog";
import {
  executeAddDogToTraining,
  executeFinalizeStage,
  executeSaveSession,
  fetchAllTrainingsAndDogs,
  fetchTrainingReportEnriched,
} from "../../../services/trainingManagementService";

interface UseTrainingManagementProps {
  onShowAlert: (
    variant: "success" | "warning" | "error",
    title: string,
    message: string,
  ) => void;
}

export const useTrainingManagement = ({ onShowAlert }: UseTrainingManagementProps) => {
  const { user: authUser } = useContext(AuthContext);
  const [trainings, setTrainings] = useState<ITrainingResponse[]>([]);
  const [availableDogs, setAvailableDogs] = useState<IDogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedTraining, setSelectedTraining] = useState<ITrainingResponse | null>(null);
  const [todaySession, setTodaySession] = useState<any>(null);
  const [executeModalVisible, setExecuteModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [reportData, setReportData] = useState<ITrainingReportResponse | null>(null);

  const [addDogModalVisible, setAddDogModalVisible] = useState(false);
  const [addDogSearchText, setAddDogSearchText] = useState("");

  const loadTrainings = useCallback(async () => {
    try {
      const data = await fetchAllTrainingsAndDogs(authUser);
      setTrainings(data.trainings);
      if (data.availableDogs.length > 0) {
        setAvailableDogs(data.availableDogs);
      }
    } catch (e) {
      console.log("Erro ao carregar treinamentos:", e);
    }
  }, [authUser]);

  useEffect(() => {
    setLoading(true);
    loadTrainings().finally(() => setLoading(false));
  }, [loadTrainings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await trainingSyncService.processQueue();
    await loadTrainings();
    setRefreshing(false);
  };

  const handleOpenExecuteTraining = async (training: ITrainingResponse) => {
    setSelectedTraining(training);
    const stage = training.currentStage || 1;
    const cachedList = await getCachedStageData(training.id, stage);
    const todayIsoDate = new Date().toISOString().split("T")[0];

    const todayMatch = cachedList.find((item: any) => {
      if (!item.trainingDate) return false;
      return item.trainingDate.split("T")[0] === todayIsoDate;
    });

    setTodaySession(todayMatch || null);
    setExecuteModalVisible(true);
  };

  const handleOpenHistory = async (training: ITrainingResponse) => {
    setSelectedTraining(training);
    setHistoryModalVisible(true);
    setReportData(null);
    setHistoryItems([]);

    try {
      const enriched = await fetchTrainingReportEnriched(training);
      setReportData(enriched.reportData);
      setHistoryItems(enriched.historyItems);

      if (enriched.updatedSessionsCount !== undefined) {
        setTrainings((prev) =>
          prev.map((t) =>
            t.id === training.id
              ? {
                  ...t,
                  totalSessionsRecorded: enriched.updatedSessionsCount,
                  status: enriched.reportData?.status || t.status,
                }
              : t,
          ),
        );
      }
    } catch (e) {
      console.log("Erro ao carregar relatório:", e);
    }
  };

  const handleSaveSession = async (stageNumber: number, data: Record<string, boolean>) => {
    if (!selectedTraining) return;

    if (selectedTraining.status) {
      onShowAlert("error", "Ação Bloqueada", "Este treinamento já foi concluído ou encerrado.");
      return;
    }

    const currentSessions = selectedTraining.totalSessionsRecorded || 0;
    const todayIsoDate = new Date().toISOString().split("T")[0];
    const currentList = await getCachedStageData(selectedTraining.id, stageNumber);
    const isUpdatingToday = currentList.some(
      (item: any) => item.trainingDate && item.trainingDate.split("T")[0] === todayIsoDate,
    );

    if (!isUpdatingToday && currentSessions >= 21) {
      onShowAlert(
        "warning",
        "Limite de Sessões Atingido",
        `A Etapa ${stageNumber} já atingiu o limite de 21 dias de treinamento gravados. Finalize a etapa para prosseguir.`,
      );
      return;
    }

    try {
      setSubmitting(true);
      const result = await executeSaveSession(
        stageNumber,
        data,
        selectedTraining,
        trainings,
        authUser,
      );

      setTrainings(result.updatedTrainings);
      setTodaySession(result.savedSessionItem);
      setExecuteModalVisible(false);

      setTimeout(() => {
        onShowAlert(result.alert.variant, result.alert.title, result.alert.message);
      }, 150);
    } catch (e) {
      console.log("Erro ao salvar sessão de treinamento:", e);
      onShowAlert("error", "Erro ao Salvar", "Não foi possível registrar o treinamento.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizeStage = async (
    stageNumber: number,
    status: TraningStatus,
    data: Record<string, boolean>,
  ) => {
    if (!selectedTraining) return;

    if (selectedTraining.status) {
      onShowAlert("error", "Ação Bloqueada", "Este treinamento já foi concluído ou encerrado.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await executeFinalizeStage(
        stageNumber,
        status,
        selectedTraining,
        trainings,
        authUser,
      );

      setTrainings(result.updatedTrainings);
      setTodaySession(null);
      setExecuteModalVisible(false);

      setTimeout(() => {
        onShowAlert(result.alert.variant, result.alert.title, result.alert.message);
      }, 150);
    } catch (e) {
      console.log("Erro ao finalizar etapa:", e);
      onShowAlert("error", "Erro ao Finalizar", "Não foi possível finalizar a etapa.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDogToTraining = async (dog: IDogResponse) => {
    setAddDogModalVisible(false);
    setAddDogSearchText("");

    const existing = trainings.find(
      (t) => String(t.dogId).toLowerCase() === String(dog.ID).toLowerCase(),
    );
    if (existing) {
      if (existing.status) {
        handleOpenHistory(existing);
      } else {
        handleOpenExecuteTraining(existing);
      }
      return;
    }

    try {
      setSubmitting(true);
      const result = await executeAddDogToTraining(dog, trainings, authUser);
      setTrainings(result.updatedTrainings);

      setTimeout(() => {
        onShowAlert(
          "success",
          "Cão Adicionado ao Treinamento!",
          `${dog.name} iniciou o treinamento na Etapa 1. Você já pode registrar as sessões diárias!`,
        );
      }, 150);
    } catch (e) {
      console.log("Erro ao adicionar cão ao treinamento:", e);
      setTimeout(() => {
        onShowAlert("error", "Erro", "Não foi possível adicionar o cão ao treinamento.");
      }, 150);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    trainings,
    availableDogs,
    loading,
    refreshing,
    submitting,
    selectedTraining,
    todaySession,
    executeModalVisible,
    setExecuteModalVisible,
    setTodaySession,
    historyModalVisible,
    setHistoryModalVisible,
    historyItems,
    reportData,
    addDogModalVisible,
    setAddDogModalVisible,
    addDogSearchText,
    setAddDogSearchText,
    onRefresh,
    handleOpenExecuteTraining,
    handleOpenHistory,
    handleSaveSession,
    handleFinalizeStage,
    handleAddDogToTraining,
  };
};
