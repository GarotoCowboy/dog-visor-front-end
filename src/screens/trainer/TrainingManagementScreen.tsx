import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

import { theme } from "../../../theme/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OfflineStatusBanner } from "./components/OfflineStatusBanner";
import { TrainingDogCard } from "./components/TrainingDogCard";
import { ExecuteTrainingModal } from "./components/ExecuteTrainingModal";
import { TrainingHistoryModal } from "./components/TrainingHistoryModal";
import { DogPickerModal } from "../../shared/components/form/dogPicker";
import { useAlert } from "../../hooks/useAlert";
import {
  ITrainingReportResponse,
  ITrainingResponse,
  TraningStatus,
} from "../../types/Training";
import { EDOG_STATUS, formatDogRace, IDogResponse } from "../../types/Dog";
import {
  createStage1Service,
  createStage2Service,
  createStage3Service,
  createStage4Service,
  createTrainingService,
  finalizeStage1Service,
  finalizeStage2Service,
  finalizeStage3Service,
  finalizeStage4Service,
  getDogsService,
  getLoggedUserProfileService,
  getTrainerNamesMapService,
  getTrainingReportByDogIdService,
  getTrainingReportService,
  listStage1ByTrainingIdService,
  listStage2ByTrainingIdService,
  listStage3ByTrainingIdService,
  listStage4ByTrainingIdService,
  listTrainingsByDogIdService,
  resolveTrainerNameFromMap,
} from "../../service/api";
import {
  enqueueSyncAction,
  getCachedReport,
  getCachedStageData,
  getCachedTrainerId,
  getCachedTrainerNamesMap,
  getCachedTrainings,
  saveCachedReport,
  saveCachedStageData,
  saveCachedTrainerId,
  saveCachedTrainerNamesMap,
  saveCachedTrainings,
} from "../../service/trainingOfflineService";
import { trainingSyncService } from "../../service/trainingSyncService";
import { calculateAge } from "../../utils/calculateAge";
import { AuthContext } from "../../service/authContext";
import { getEmployeeIdentifier } from "../../types/User";
import {
  buildStagePayload,
  isValidUuid,
} from "./utils/stagePayloadBuilder";
import {
  FilterTab,
  TrainingFilterBar,
} from "./components/TrainingFilterBar";

export const TrainingManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user: authUser } = React.useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<FilterTab>("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [trainings, setTrainings] = useState<ITrainingResponse[]>([]);
  const [availableDogs, setAvailableDogs] = useState<IDogResponse[]>([]);
  const [addDogModalVisible, setAddDogModalVisible] = useState(false);
  const [addDogSearchText, setAddDogSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modais
  const [selectedTraining, setSelectedTraining] =
    useState<ITrainingResponse | null>(null);
  const [todaySession, setTodaySession] = useState<any>(null);
  const [executeModalVisible, setExecuteModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [reportData, setReportData] = useState<ITrainingReportResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showAlert, AlertModal } = useAlert();

  const resolveTrainerId = useCallback(
    async (candidateId?: string): Promise<string> => {
      const ZERO_UUID = "00000000-0000-0000-0000-000000000000";
      if (isValidUuid(candidateId) && candidateId !== ZERO_UUID) {
        return candidateId!;
      }
      const tokenCandidate =
        authUser?.employeeId || authUser?.userId || authUser?.registration || "";
      if (isValidUuid(tokenCandidate) && tokenCandidate !== ZERO_UUID) {
        await saveCachedTrainerId(tokenCandidate);
        return tokenCandidate;
      }
      try {
        const userProfile = await getLoggedUserProfileService();
        const resolvedId = getEmployeeIdentifier(userProfile);
        if (isValidUuid(resolvedId) && resolvedId !== ZERO_UUID) {
          await saveCachedTrainerId(resolvedId!);
          if (userProfile?.name) {
            await saveCachedTrainerNamesMap({
              [resolvedId!]: userProfile.name,
              [resolvedId!.toLowerCase()]: userProfile.name,
            });
          }
          return resolvedId!;
        }
      } catch (e) {}
      const cachedId = await getCachedTrainerId();
      if (isValidUuid(cachedId || "") && cachedId !== ZERO_UUID) {
        return cachedId!;
      }
      return ZERO_UUID;
    },
    [authUser],
  );

  /**
   * Carrega os treinamentos do cache local e tenta sincronizar/buscar online
   */
  const loadTrainings = useCallback(async () => {
    try {
      // 1. Carrega imediatamente do cache local apenas os cães que já iniciaram treinamento
      const cached = await getCachedTrainings();
      const cachedTrainerMap = await getCachedTrainerNamesMap();
      const validCached = (cached || []).filter(
        (c) =>
          !c.id.startsWith("train_") ||
          Boolean(c.lastTrainingDate) ||
          (c.totalSessionsRecorded || 0) > 0 ||
          (c.currentStage && c.currentStage > 1) ||
          c.status != null,
      );
      if (validCached.length > 0) {
        setTrainings(
          validCached.map((c) => ({
            ...c,
            trainerName: resolveTrainerNameFromMap(
              c.trainerId,
              cachedTrainerMap,
              c.trainerName,
            ),
          })),
        );
      } else {
        setTrainings([]);
      }

      const isOnline = await trainingSyncService.checkIsOnline();
      if (!isOnline) return;

      resolveTrainerId();
      const trainerNamesMap = await getTrainerNamesMapService();

      // 2. Se online, obtém os cães cadastrados no sistema
      const dogsResponse = await getDogsService();
      const dogsList: IDogResponse[] = dogsResponse.filter(
        (d) =>
          d.status !== EDOG_STATUS.FALECIDO && d.status !== EDOG_STATUS.DOADO,
      );
      setAvailableDogs(dogsList);

      // Busca treinamentos reais do backend para os cães (NÃO cria cards para cães que não iniciaram treinamento)
      const trainingsResults = await Promise.all(
        dogsResponse.map(async (dog) => {
          const dogId = dog.ID;
          const existing = validCached.find((c) => c.dogId === dogId);
          const ageStr = dog.dateOfBirth
            ? calculateAge(new Date(dog.dateOfBirth))
            : existing?.dogAge;

          let realTraining: ITrainingResponse | null = null;
          let sessionsCount = existing?.totalSessionsRecorded || 0;

          try {
            const list = await listTrainingsByDogIdService(dogId);
            if (list && list.length > 0) {
              realTraining = list[0];
            }
          } catch (e) {
            // Se falhar a busca online, mantém o cache local
          }

          if (realTraining) {
            const stage = realTraining.currentStage || 1;
            try {
              // Sincroniza relatório para ter a contagem oficial das sessões e salvar o cache
              const rep = await getTrainingReportService(realTraining.id);
              if (rep) {
                const enrichedRep: ITrainingReportResponse = {
                  ...rep,
                  trainerName: resolveTrainerNameFromMap(
                    rep.trainerId || realTraining.trainerId,
                    trainerNamesMap,
                    rep.trainerName,
                  ),
                };
                await saveCachedReport(dogId, enrichedRep);
                await saveCachedReport(realTraining.id, enrichedRep);
                const currentStageRep =
                  stage === 1
                    ? rep.stage1
                    : stage === 2
                    ? rep.stage2
                    : stage === 3
                    ? rep.stage3
                    : rep.stage4;
                if (currentStageRep?.sessions) {
                  await saveCachedStageData(
                    realTraining.id,
                    stage,
                    currentStageRep.sessions,
                  );
                  sessionsCount =
                    currentStageRep.totalSessionsRecorded ||
                    currentStageRep.sessions.length;
                }
              }
            } catch (repErr) {
              try {
                const cachedStage = await getCachedStageData(
                  realTraining.id,
                  stage,
                );
                sessionsCount = cachedStage.length;
              } catch (e) {}
            }

            return {
              ...realTraining,
              trainerName: resolveTrainerNameFromMap(
                realTraining.trainerId,
                trainerNamesMap,
                existing?.trainerName || realTraining.trainerName,
              ),
              dogId,
              dogsName: dog.name,
              dogsBreed: formatDogRace(dog.race),
              dogAge: ageStr,
              dogSex: dog.sex || existing?.dogSex,
              avatarKey: dog.avatarKey || existing?.avatarKey,
              isSynced: true,
              totalSessionsRecorded: sessionsCount,
              lastTrainingDate:
                existing?.lastTrainingDate || realTraining.lastTrainingDate,
            } as ITrainingResponse;
          }

          if (existing && existing.isSynced === false) {
            let localCount = existing.totalSessionsRecorded || 0;
            try {
              const cs = await getCachedStageData(
                existing.id,
                existing.currentStage || 1,
              );
              if (cs && cs.length > 0) {
                localCount = cs.length;
              }
            } catch (e) {}

            return {
              ...existing,
              trainerName: resolveTrainerNameFromMap(
                existing.trainerId,
                trainerNamesMap,
                existing.trainerName,
              ),
              totalSessionsRecorded: localCount,
              dogsName: dog.name,
              dogsBreed: formatDogRace(dog.race),
              dogAge: ageStr,
              dogSex: dog.sex || existing.dogSex,
              avatarKey: dog.avatarKey || existing.avatarKey,
            } as ITrainingResponse;
          }

          // Cão ainda não iniciou treinamento -> não deve aparecer na lista
          return null;
        }),
      );

      const updatedTrainings = trainingsResults.filter(
        (t): t is ITrainingResponse => t !== null,
      );

      setTrainings(updatedTrainings);
      await saveCachedTrainings(updatedTrainings);
    } catch (error) {
      console.log("Erro ao carregar lista de treinamentos:", error);
    }
  }, []);

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

  /**
   * Abre o modal de realização de treino para o cão selecionado
   */
  const handleOpenExecuteTraining = async (training: ITrainingResponse) => {
    // Bloqueio pós-conclusão ou encerramento
    if (training.status === TraningStatus.Apto) {
      showAlert(
        "warning",
        "Treinamento Concluído",
        "Este cão já concluiu com êxito todas as 4 etapas de treinamento de Cão-Guia e está bloqueado para novas sessões.",
      );
      return;
    }
    if (training.status === TraningStatus.Inapto) {
      showAlert(
        "warning",
        "Treinamento Encerrado",
        "O treinamento deste cão foi encerrado como Inapto e não permite novos registros.",
      );
      return;
    }

    const stage = training.currentStage || 1;
    const todayIsoDate = new Date().toISOString().split("T")[0];

    // Verifica no cache local se já existe sessão registrada hoje
    let cachedSessions = await getCachedStageData(training.id, stage);
    let todayItem = cachedSessions.find((item: any) => {
      if (!item.trainingDate) return false;
      return item.trainingDate.split("T")[0] === todayIsoDate;
    });

    // Abre o modal imediatamente com os dados locais para não travar o clique do botão
    setTodaySession(todayItem || null);
    setSelectedTraining(training);
    setExecuteModalVisible(true);

    // Se não encontrou no cache e estiver online, sincroniza em segundo plano
    if (!todayItem && !training.id.startsWith("train_")) {
      try {
        const isOnline = await trainingSyncService.checkIsOnline();
        if (isOnline) {
          const report = await getTrainingReportService(training.id);
          if (report) {
            await saveCachedReport(training.dogId, report);
            await saveCachedReport(training.id, report);
            const currentStageRep =
              stage === 1
                ? report.stage1
                : stage === 2
                ? report.stage2
                : stage === 3
                ? report.stage3
                : report.stage4;
            if (currentStageRep?.sessions) {
              await saveCachedStageData(training.id, stage, currentStageRep.sessions);
              const syncedTodayItem = currentStageRep.sessions.find((item: any) => {
                if (!item.trainingDate) return false;
                return item.trainingDate.split("T")[0] === todayIsoDate;
              });
              if (syncedTodayItem) {
                setTodaySession(syncedTodayItem);
              }
            }
          }
        }
      } catch (e) {
        console.log("Erro ao buscar relatório ao abrir modal de treino:", e);
      }
    }
  };

  /**
   * Abre o modal de relatório completo por etapa
   */
  const handleOpenHistory = async (training: ITrainingResponse) => {
    setSelectedTraining(training);
    setHistoryModalVisible(true);

    try {
      const stage = training.currentStage || 1;

      // 1. Tenta carregar relatório do cache local
      const cachedTrainerMap = await getCachedTrainerNamesMap();
      const cachedRep =
        (await getCachedReport(training.dogId)) ||
        (await getCachedReport(training.id));
      if (cachedRep) {
        setReportData({
          ...cachedRep,
          trainerName: resolveTrainerNameFromMap(
            cachedRep.trainerId || training.trainerId,
            cachedTrainerMap,
            cachedRep.trainerName || training.trainerName,
          ),
        });
      }

      // 2. Tenta carregar sessões em cache da etapa atual
      const cachedSessions = await getCachedStageData(training.id, stage);
      if (cachedSessions && cachedSessions.length > 0) {
        setHistoryItems(cachedSessions);
      }

      // 3. Se online, busca relatório completo atualizado do backend
      const isOnline = await trainingSyncService.checkIsOnline();
      if (isOnline) {
        try {
          const report = !training.id.startsWith("train_")
            ? await getTrainingReportService(training.id)
            : await getTrainingReportByDogIdService(training.dogId);

          if (report) {
            const trainerNamesMap = await getTrainerNamesMapService([
              report.trainerId,
              training.trainerId,
            ]);
            const resolvedTrainerName = resolveTrainerNameFromMap(
              report.trainerId || training.trainerId,
              trainerNamesMap,
              report.trainerName || training.trainerName,
            );
            const enrichedReport: ITrainingReportResponse = {
              ...report,
              trainerName: resolvedTrainerName,
            };
            setReportData(enrichedReport);
            await saveCachedReport(training.dogId, enrichedReport);
            await saveCachedReport(training.id, enrichedReport);

            // Atualiza a contagem de sessões da etapa ativa no card
            const currentStageReport =
              stage === 1
                ? report.stage1
                : stage === 2
                ? report.stage2
                : stage === 3
                ? report.stage3
                : report.stage4;
            const sessionsCount =
              currentStageReport?.totalSessionsRecorded ||
              currentStageReport?.sessions?.length ||
              0;

            const updatedTrainings = trainings.map((t) =>
              t.id === training.id
                ? {
                    ...t,
                    totalSessionsRecorded: sessionsCount,
                    status: report.status || t.status,
                  }
                : t,
            );
            setTrainings(updatedTrainings);
            await saveCachedTrainings(updatedTrainings);
          }
        } catch (repError) {
          console.log("Erro ao buscar relatório da API:", repError);
        }
      }
    } catch (e) {
      console.log("Erro ao abrir histórico/relatório:", e);
    }
  };

  /**
   * Salva a sessão de treinamento diária (checklist)
   */
  const handleSaveSession = async (
    stageNumber: number,
    data: Record<string, boolean>,
  ) => {
    if (!selectedTraining) return;

    if (selectedTraining.status) {
      showAlert(
        "error",
        "Ação Bloqueada",
        "Este treinamento já foi concluído ou encerrado.",
      );
      return;
    }

    const currentSessions = selectedTraining.totalSessionsRecorded || 0;
    const todayFormatted = new Date().toLocaleDateString("pt-BR");
    const todayIsoDate = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD

    let realTrainingId = selectedTraining.id;

    // Carrega sessões em cache da etapa para conferir idempotência por data
    const currentList = await getCachedStageData(
      realTrainingId,
      stageNumber,
    );

    // Se já existe sessão gravada para o dia de hoje nesta etapa, atualiza em vez de duplicar
    const existingTodayIndex = currentList.findIndex((item: any) => {
      if (!item.trainingDate) return false;
      const itemDateIso = item.trainingDate.split("T")[0];
      return itemDateIso === todayIsoDate;
    });

    const isUpdatingToday = existingTodayIndex >= 0;

    // Apenas bloqueia por 21 sessões se estiver tentando criar uma nova sessão em dia distinto
    if (!isUpdatingToday && currentSessions >= 21) {
      showAlert(
        "warning",
        "Limite de Sessões Atingido",
        `A Etapa ${stageNumber} já atingiu o limite de 21 dias de treinamento gravados. Finalize a etapa para prosseguir.`,
      );
      return;
    }

    try {
      setSubmitting(true);
      const isOnline = await trainingSyncService.checkIsOnline();

      // Se o treino ainda não existe como entidade no backend, inicializa
      if (
        (realTrainingId.startsWith("train_") ||
          realTrainingId.startsWith("local_train_")) &&
        isOnline
      ) {
        const extractedTrainerId = await resolveTrainerId(
          selectedTraining.trainerId,
        );

        try {
          const newTrain = await createTrainingService({
            trainerId: extractedTrainerId,
            dogId: selectedTraining.dogId,
            dogsName: selectedTraining.dogsName,
            dogsBreed: selectedTraining.dogsBreed,
            monthYear: new Date().getFullYear() * 100 + (new Date().getMonth() + 1),
            day: new Date().getDate(),
            evaluationType: "Guia",
          });
          realTrainingId = newTrain.id;
        } catch (createErr: any) {
          const errMsg =
            createErr?.response?.data?.message ||
            createErr?.message ||
            "";
          if (
            errMsg.includes("já completou") ||
            errMsg.includes("já possui treinamento")
          ) {
            showAlert("error", "Bloqueio de Treinamento", errMsg);
            setExecuteModalVisible(false);
            return;
          }
          if (createErr?.response) {
            showAlert(
              "error",
              "Erro ao Iniciar Treinamento",
              errMsg || "O servidor recusou a criação do treinamento.",
            );
            return;
          }
        }
      }

      // Monta payload diário completo com todos os campos booleanos preenchidos
      const payload: any = buildStagePayload(
        stageNumber,
        realTrainingId,
        todayIsoDate,
        data,
      );

      const sessionNumber = isUpdatingToday
        ? currentList[existingTodayIndex].sessionNumber || (currentSessions > 0 ? currentSessions : 1)
        : currentSessions + 1;

      payload.sessionNumber = sessionNumber;

      // Função auxiliar para consolidar o salvamento no cache e estado local
      const commitLocalCache = async (savedItem?: any) => {
        const itemToSave = {
          ...payload,
          id: savedItem?.id || (isUpdatingToday ? currentList[existingTodayIndex].id : `local_${Date.now()}`),
          sessionNumber: savedItem?.sessionNumber || sessionNumber,
          createdAt: savedItem?.createdAt || new Date().toISOString(),
        };

        let updatedList: any[];
        if (isUpdatingToday) {
          updatedList = [...currentList];
          updatedList[existingTodayIndex] = itemToSave;
        } else {
          updatedList = [...currentList, itemToSave];
        }

        // Deduplica por data para garantir unicidade estrita por dia de treino
        const deduplicatedList: any[] = [];
        const seenDates = new Set<string>();
        for (const item of updatedList) {
          const d = item.trainingDate ? item.trainingDate.split("T")[0] : null;
          if (d) {
            if (!seenDates.has(d)) {
              seenDates.add(d);
              deduplicatedList.push(item);
            }
          } else {
            deduplicatedList.push(item);
          }
        }

        await saveCachedStageData(realTrainingId, stageNumber, deduplicatedList);

        const updatedTrainings = trainings.map((t) => {
          if (t.id === selectedTraining.id) {
            return {
              ...t,
              id: realTrainingId,
              lastTrainingDate: todayFormatted,
              totalSessionsRecorded: deduplicatedList.length,
              isSynced: isOnline,
            };
          }
          return t;
        });
        setTrainings(updatedTrainings);
        await saveCachedTrainings(updatedTrainings);
        setTodaySession(itemToSave);
      };

      let alertToDisplay: {
        variant: "success" | "warning" | "error";
        title: string;
        message: string;
      } | null = null;

      if (
        isOnline &&
        !realTrainingId.startsWith("train_") &&
        !realTrainingId.startsWith("local_train_")
      ) {
        try {
          let response: any = null;
          if (stageNumber === 1) response = await createStage1Service(payload);
          else if (stageNumber === 2) response = await createStage2Service(payload);
          else if (stageNumber === 3) response = await createStage3Service(payload);
          else if (stageNumber === 4) response = await createStage4Service(payload);

          // Atualiza o cache local apenas APÓS o sucesso no servidor
          await commitLocalCache(response);

          alertToDisplay = isUpdatingToday
            ? {
                variant: "success",
                title: "Sessão Atualizada",
                message: `O treino de hoje (Sessão ${sessionNumber}) foi atualizado com sucesso!`,
              }
            : {
                variant: "success",
                title: "Sessão Salva",
                message: `Sessão ${sessionNumber} de 21 salva e sincronizada com sucesso!`,
              };
        } catch (apiError: any) {
          if (apiError?.response) {
            const apiMsg =
              apiError?.response?.data?.message ||
              apiError?.response?.data?.error ||
              "Erro na validação do servidor ao salvar sessão.";
            showAlert("error", "Erro do Servidor", apiMsg);
            return;
          }

          await commitLocalCache();
          await enqueueSyncAction({
            actionType: `SAVE_STAGE${stageNumber}` as any,
            endpoint: `/api/v1/dogtraining/stage${stageNumber}`,
            method: "POST",
            payload,
          });
          alertToDisplay = isUpdatingToday
            ? {
                variant: "warning",
                title: "Atualizado no Dispositivo",
                message: `O treino de hoje (Sessão ${sessionNumber}) foi atualizado localmente e será sincronizado assim que a rede estabilizar.`,
              }
            : {
                variant: "warning",
                title: "Salvo Offline",
                message:
                  "Sem conexão com o servidor. A sessão foi gravada no dispositivo e será sincronizada assim que a rede estabilizar.",
              };
        }
      } else {
        await commitLocalCache();
        await enqueueSyncAction({
          actionType: `SAVE_STAGE${stageNumber}` as any,
          endpoint: `/api/v1/dogtraining/stage${stageNumber}`,
          method: "POST",
          payload,
        });
        alertToDisplay = isUpdatingToday
          ? {
              variant: "warning",
              title: "Atualizado no Dispositivo",
              message: `O treino de hoje (Sessão ${sessionNumber}) foi atualizado localmente em modo offline.`,
            }
          : {
              variant: "warning",
              title: "Salvo no Dispositivo",
              message: `Sessão ${sessionNumber} de 21 gravada localmente em modo offline.`,
            };
      }

      setExecuteModalVisible(false);
      if (alertToDisplay) {
        const { variant, title, message } = alertToDisplay;
        setTimeout(() => {
          showAlert(variant, title, message);
        }, 150);
      }
    } catch (e: any) {
      console.log("Erro ao salvar sessão de treinamento:", e);
      showAlert("error", "Erro ao Salvar", "Não foi possível registrar o treinamento.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Finaliza uma etapa (Apto ou Inapto)
   */
  const handleFinalizeStage = async (
    stageNumber: number,
    status: TraningStatus,
    data: Record<string, boolean>,
  ) => {
    if (!selectedTraining) return;

    if (selectedTraining.status) {
      showAlert(
        "error",
        "Ação Bloqueada",
        "Este treinamento já foi concluído ou encerrado.",
      );
      return;
    }

    try {
      setSubmitting(true);
      const isOnline = await trainingSyncService.checkIsOnline();

      let realTrainingId = selectedTraining.id;

      // Se ainda não existia treino oficial no backend, garante a criação
      if (
        (realTrainingId.startsWith("train_") ||
          realTrainingId.startsWith("local_train_")) &&
        isOnline
      ) {
        const extractedTrainerId = await resolveTrainerId(
          selectedTraining.trainerId,
        );

        try {
          const newTrain = await createTrainingService({
            trainerId: extractedTrainerId,
            dogId: selectedTraining.dogId,
            dogsName: selectedTraining.dogsName,
            dogsBreed: selectedTraining.dogsBreed,
            monthYear: new Date().getFullYear() * 100 + (new Date().getMonth() + 1),
            day: new Date().getDate(),
            evaluationType: "Guia",
          });
          realTrainingId = newTrain.id;
        } catch (createErr: any) {
          const errMsg =
            createErr?.response?.data?.message ||
            createErr?.message ||
            "";
          if (
            errMsg.includes("já completou") ||
            errMsg.includes("já possui treinamento")
          ) {
            showAlert("error", "Bloqueio de Treinamento", errMsg);
            setExecuteModalVisible(false);
            return;
          }
          if (createErr?.response) {
            showAlert(
              "error",
              "Erro ao Iniciar Treinamento",
              errMsg || "O servidor recusou a criação do treinamento.",
            );
            return;
          }
        }
      }

      const nextStage =
        status === TraningStatus.Apto && stageNumber < 4
          ? stageNumber + 1
          : stageNumber;

      const isFinishedApto = stageNumber === 4 && status === TraningStatus.Apto;
      const isFinishedInapto = status === TraningStatus.Inapto;

      const finalTrainingStatus = isFinishedApto
        ? TraningStatus.Apto
        : isFinishedInapto
        ? TraningStatus.Inapto
        : null;

      // Atualiza o card de treino no estado e cache
      const updatedTrainings = trainings.map((t) => {
        if (t.id === selectedTraining.id) {
          return {
            ...t,
            id: realTrainingId,
            currentStage: nextStage,
            status: finalTrainingStatus,
            totalSessionsRecorded:
              status === TraningStatus.Apto && stageNumber < 4
                ? 0
                : t.totalSessionsRecorded,
            lastTrainingDate: new Date().toLocaleDateString("pt-BR"),
            isSynced: isOnline,
          };
        }
        return t;
      });
      setTrainings(updatedTrainings);
      await saveCachedTrainings(updatedTrainings);

      let finalizeAlert: {
        variant: "success" | "warning" | "error";
        title: string;
        message: string;
      } | null = null;

      if (
        isOnline &&
        !realTrainingId.startsWith("train_") &&
        !realTrainingId.startsWith("local_train_")
      ) {
        try {
          if (stageNumber === 1) await finalizeStage1Service(realTrainingId, status);
          else if (stageNumber === 2) await finalizeStage2Service(realTrainingId, status);
          else if (stageNumber === 3) await finalizeStage3Service(realTrainingId, status);
          else if (stageNumber === 4) await finalizeStage4Service(realTrainingId, status);

          finalizeAlert = {
            variant: "success",
            title: "Etapa Finalizada!",
            message: isFinishedApto
              ? "Parabéns! O cão concluiu com êxito todas as 4 etapas de treinamento de Cão-Guia!"
              : isFinishedInapto
              ? `A Etapa ${stageNumber} foi finalizada como Inapto. O treinamento deste cão foi encerrado.`
              : `Etapa ${stageNumber} aprovada (Apto)! O cão avançou para a Etapa ${nextStage}.`,
          };
        } catch (apiError: any) {
          const apiMsg = apiError?.response?.data?.message || "";
          if (apiMsg) {
            finalizeAlert = {
              variant: "error",
              title: "Erro ao Finalizar",
              message: apiMsg,
            };
          } else {
            await enqueueSyncAction({
              actionType: "FINALIZE_STAGE",
              endpoint: `/api/v1/dogtraining/stage${stageNumber}/finalize/${realTrainingId}`,
              method: "PATCH",
              queryParams: { status },
            });
            finalizeAlert = {
              variant: "warning",
              title: "Finalizado Offline",
              message:
                "A finalização foi gravada localmente e será enviada quando reconectar.",
            };
          }
        }
      } else {
        await enqueueSyncAction({
          actionType: "FINALIZE_STAGE",
          endpoint: `/api/v1/dogtraining/stage${stageNumber}/finalize/${realTrainingId}`,
          method: "PATCH",
          queryParams: { status },
        });
        finalizeAlert = {
          variant: "warning",
          title: "Finalizado no Dispositivo",
          message: `Etapa finalizada localmente. ${
            isFinishedApto
              ? "Treinamento de Cão-Guia concluído!"
              : isFinishedInapto
              ? "Treinamento encerrado como Inapto."
              : `Avanço para a Etapa ${nextStage} aplicado!`
          }`,
        };
      }

      setTodaySession(null);
      setExecuteModalVisible(false);
      if (finalizeAlert) {
        const { variant, title, message } = finalizeAlert;
        setTimeout(() => {
          showAlert(variant, title, message);
        }, 150);
      }
    } catch (e) {
      console.log("Erro ao finalizar etapa:", e);
      showAlert("error", "Erro ao Finalizar", "Não foi possível finalizar a etapa.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Adiciona um novo cão ao treinamento de Cão-Guia
   */
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
      const isOnline = await trainingSyncService.checkIsOnline();
      const extractedTrainerId = await resolveTrainerId();
      const cachedMap = await getCachedTrainerNamesMap();
      const trainerName = resolveTrainerNameFromMap(
        extractedTrainerId,
        cachedMap,
      );
      const ageStr = dog.dateOfBirth
        ? calculateAge(new Date(dog.dateOfBirth))
        : undefined;
      const monthYear =
        new Date().getFullYear() * 100 + (new Date().getMonth() + 1);
      const day = new Date().getDate();
      const dogBreed = formatDogRace(dog.race);

      let newTraining: ITrainingResponse;

      if (isOnline) {
        try {
          const created = await createTrainingService({
            trainerId: extractedTrainerId,
            dogId: dog.ID,
            dogsName: dog.name,
            dogsBreed: dogBreed,
            monthYear,
            day,
            evaluationType: "Guia",
          });
          newTraining = {
            ...created,
            trainerName,
            dogId: dog.ID,
            dogsName: dog.name,
            dogsBreed: dogBreed,
            dogAge: ageStr,
            dogSex: dog.sex,
            avatarKey: dog.avatarKey,
            currentStage: created.currentStage || 1,
            status: created.status || null,
            totalSessionsRecorded: 0,
            isSynced: true,
          };
        } catch (err: any) {
          const errMsg =
            err?.response?.data?.message || err?.message || "";
          if (err?.response) {
            showAlert(
              "error",
              "Não foi possível adicionar",
              errMsg || "O servidor recusou a criação do treinamento.",
            );
            return;
          }
          newTraining = {
            id: `local_train_${dog.ID}`,
            trainerId: extractedTrainerId,
            trainerName,
            dogId: dog.ID,
            dogsName: dog.name,
            dogsBreed: dogBreed,
            monthYear,
            day,
            evaluationType: "Guia",
            currentStage: 1,
            status: null,
            dogAge: ageStr,
            dogSex: dog.sex,
            avatarKey: dog.avatarKey,
            totalSessionsRecorded: 0,
            isSynced: false,
          };
          await enqueueSyncAction({
            actionType: "CREATE_TRAINING",
            endpoint: "/api/v1/dogtraining/training",
            method: "POST",
            payload: {
              trainerId: extractedTrainerId,
              dogId: dog.ID,
              dogsName: dog.name,
              dogsBreed: dogBreed,
              monthYear,
              day,
              evaluationType: "Guia",
            },
          });
        }
      } else {
        newTraining = {
          id: `local_train_${dog.ID}`,
          trainerId: extractedTrainerId,
          trainerName,
          dogId: dog.ID,
          dogsName: dog.name,
          dogsBreed: dogBreed,
          monthYear,
          day,
          evaluationType: "Guia",
          currentStage: 1,
          status: null,
          dogAge: ageStr,
          dogSex: dog.sex,
          avatarKey: dog.avatarKey,
          totalSessionsRecorded: 0,
          isSynced: false,
        };
        await enqueueSyncAction({
          actionType: "CREATE_TRAINING",
          endpoint: "/api/v1/dogtraining/training",
          method: "POST",
          payload: {
            trainerId: extractedTrainerId,
            dogId: dog.ID,
            dogsName: dog.name,
            dogsBreed: dogBreed,
            monthYear,
            day,
            evaluationType: "Guia",
          },
        });
      }

      const updated = [newTraining, ...trainings];
      setTrainings(updated);
      await saveCachedTrainings(updated);

      setTimeout(() => {
        showAlert(
          "success",
          "Cão Adicionado ao Treinamento!",
          `${dog.name} iniciou o treinamento na Etapa 1. Você já pode registrar as sessões diárias!`,
        );
      }, 150);
    } catch (e) {
      console.log("Erro ao adicionar cão ao treinamento:", e);
      setTimeout(() => {
        showAlert(
          "error",
          "Erro",
          "Não foi possível adicionar o cão ao treinamento.",
        );
      }, 150);
    } finally {
      setSubmitting(false);
    }
  };

  const getDogTrainingBadge = (dog: IDogResponse) => {
    const existing = trainings.find(
      (t) => String(t.dogId).toLowerCase() === String(dog.ID).toLowerCase(),
    );
    if (!existing) {
      return {
        status: "NOT_STARTED" as const,
        label: "Sem treinamento iniciado",
      };
    }
    if (
      existing.status === TraningStatus.Apto ||
      existing.status === TraningStatus.Inapto
    ) {
      return {
        status: "COMPLETED" as const,
        label: `Concluído (${existing.status})`,
      };
    }
    return {
      status: "IN_PROGRESS" as const,
      label: `Em treinamento • Etapa ${existing.currentStage || 1}`,
    };
  };

  const filteredPickerDogs = availableDogs.filter((dog) => {
    const q = addDogSearchText.trim().toLowerCase();
    if (!q) return true;
    const name = (dog.name || "").toLowerCase();
    const race = dog.race ? formatDogRace(dog.race).toLowerCase() : "";
    return name.includes(q) || race.includes(q);
  });

  // Filtragem dos cards
  const filteredTrainings = trainings.filter((t) => {
    // Filtro por texto
    const matchesSearch =
      t.dogsName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.dogsBreed.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const isCompleted =
      t.status === TraningStatus.Apto || t.status === TraningStatus.Inapto;

    // Filtro por aba
    if (activeTab === "EM_TREINAMENTO") {
      return !isCompleted;
    }
    if (activeTab === "CONCLUIDO") {
      return isCompleted;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <OfflineStatusBanner />

      <View style={styles.content}>
        <TrainingFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* LISTA DE CARDS */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando cães em treinamento...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTrainings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TrainingDogCard
                item={item}
                onExecuteTraining={
                  activeTab === "CONCLUIDO" || item.status != null
                    ? handleOpenHistory
                    : handleOpenExecuteTraining
                }
                onViewHistory={handleOpenHistory}
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
              <View style={styles.emptyContainer}>
                <FontAwesomeFreeSolid name="dog" size={42} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Nenhum cão em treinamento</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? "Tente buscar por outro nome ou termo."
                    : activeTab === "CONCLUIDO"
                    ? "Nenhum cão concluiu o treinamento ainda."
                    : "Toque no botão abaixo para adicionar um cão e iniciar o treinamento."}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* BARRA INFERIOR PARA ADICIONAR CÃO AO TREINAMENTO */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TouchableOpacity
          style={styles.addTrainingButton}
          onPress={() => {
            setAddDogSearchText("");
            setAddDogModalVisible(true);
          }}
          activeOpacity={0.85}
          disabled={submitting}
        >
          <MaterialDesignIcons
            name="plus-circle-outline"
            size={20}
            color={theme.colors.white}
          />
          <Text style={styles.addTrainingButtonText} numberOfLines={1}>
            Adicionar Cão para Treinamento
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL PARA SELECIONAR CÃO E ADICIONAR AO TREINAMENTO */}
      <DogPickerModal
        visible={addDogModalVisible}
        onClose={() => {
          setAddDogModalVisible(false);
          setAddDogSearchText("");
        }}
        onSelectDog={handleAddDogToTraining}
        filteredDogs={filteredPickerDogs}
        activeDog={null}
        loadingDogs={loading}
        searchText={addDogSearchText}
        onSearchChange={setAddDogSearchText}
        getDogTestBadge={getDogTrainingBadge}
        isDogDisabled={(dog) => {
          const existing = trainings.find(
            (t) =>
              String(t.dogId).toLowerCase() === String(dog.ID).toLowerCase(),
          );
          if (existing) {
            return {
              disabled: true,
              reason: existing.status
                ? "Este cão já concluiu o treinamento"
                : "Este cão já está na lista de treinamento",
            };
          }
          return { disabled: false };
        }}
        modalTitle="Adicionar Cão ao Treinamento"
        modalSubtitle="Selecione um cão que ainda não iniciou o treinamento"
      />

      {/* MODAL DE EXECUÇÃO DE TREINAMENTO */}
      <ExecuteTrainingModal
        visible={executeModalVisible}
        training={selectedTraining}
        todaySession={todaySession}
        onClose={() => {
          setExecuteModalVisible(false);
          setTodaySession(null);
        }}
        onSaveSession={handleSaveSession}
        onFinalizeStage={handleFinalizeStage}
        submitting={submitting}
      />

      {/* MODAL DE HISTÓRICO / RELATÓRIO COMPLETO */}
      <TrainingHistoryModal
        visible={historyModalVisible}
        training={selectedTraining}
        report={reportData}
        historyItems={historyItems}
        onClose={() => setHistoryModalVisible(false)}
      />

      {/* ALERTA CUSTOMIZADO */}
      <AlertModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: "#6B7280",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: "#4B5563",
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  bottomBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    ...theme.shadows.md,
  },
  addTrainingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.md,
    gap: 8,
    ...theme.shadows.sm,
  },
  addTrainingButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
});
