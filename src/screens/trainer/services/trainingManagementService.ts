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
  listTrainingsByDogIdService,
  resolveTrainerNameFromMap,
} from "../../../service/api";
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
} from "../../../service/trainingOfflineService";
import { trainingSyncService } from "../../../service/trainingSyncService";
import { calculateAge } from "../../../utils/calculateAge";
import { getEmployeeIdentifier } from "../../../types/User";
import { IAuthUser } from "../../../utils/authToken";
import { buildStagePayload, isValidUuid } from "../utils/stagePayloadBuilder";
import {
  ITrainingReportResponse,
  ITrainingResponse,
  TraningStatus,
} from "../../../types/Training";
import { EDOG_STATUS, formatDogRace, IDogResponse } from "../../../types/Dog";

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

export const resolveTrainerId = async (
  candidateId?: string,
  authUser?: IAuthUser | null,
): Promise<string> => {
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
};

export const fetchAllTrainingsAndDogs = async (
  authUser?: IAuthUser | null,
): Promise<{
  trainings: ITrainingResponse[];
  availableDogs: IDogResponse[];
}> => {
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

  let trainings: ITrainingResponse[] =
    validCached.length > 0
      ? validCached.map((c) => ({
          ...c,
          trainerName: resolveTrainerNameFromMap(
            c.trainerId,
            cachedTrainerMap,
            c.trainerName,
          ),
        }))
      : [];

  let dogsList: IDogResponse[] = [];

  const isOnline = await trainingSyncService.checkIsOnline();
  if (!isOnline) {
    return { trainings, availableDogs: dogsList };
  }

  resolveTrainerId(undefined, authUser);
  const trainerNamesMap = await getTrainerNamesMapService();

  const dogsResponse = await getDogsService();
  dogsList = dogsResponse.filter(
    (d) => d.status !== EDOG_STATUS.FALECIDO && d.status !== EDOG_STATUS.DOADO,
  );

  const trainingsResults = await Promise.all(
    dogsResponse.map(async (dog): Promise<ITrainingResponse | null> => {
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
      } catch (e) {}

      if (realTraining) {
        const currentStage = realTraining.currentStage || 1;
        try {
          const rep = await getTrainingReportService(realTraining.id);
          if (rep) {
            const currentStageReport =
              currentStage === 1
                ? rep.stage1
                : currentStage === 2
                ? rep.stage2
                : currentStage === 3
                ? rep.stage3
                : rep.stage4;
            sessionsCount =
              currentStageReport?.totalSessionsRecorded ||
              currentStageReport?.sessions?.length ||
              0;
          }
        } catch (repErr) {}

        return {
          ...realTraining,
          trainerName: resolveTrainerNameFromMap(
            realTraining.trainerId,
            trainerNamesMap,
            existing?.trainerName,
          ),
          dogAge: ageStr,
          dogSex: dog.sex,
          avatarKey: dog.avatarKey,
          totalSessionsRecorded: sessionsCount,
          isSynced: true,
        };
      }

      if (existing) {
        return {
          ...existing,
          trainerName: resolveTrainerNameFromMap(
            existing.trainerId,
            trainerNamesMap,
            existing.trainerName,
          ),
          dogAge: ageStr,
          dogSex: dog.sex,
          avatarKey: dog.avatarKey,
        };
      }

      return null;
    }),
  );

  const activeTrainingsOnly = trainingsResults.filter(
    (t): t is ITrainingResponse => t !== null,
  );

  await saveCachedTrainings(activeTrainingsOnly);
  return { trainings: activeTrainingsOnly, availableDogs: dogsList };
};

export const fetchTrainingReportEnriched = async (
  training: ITrainingResponse,
): Promise<{
  reportData: ITrainingReportResponse | null;
  historyItems: any[];
  updatedSessionsCount?: number;
}> => {
  const stage = training.currentStage || 1;
  const cachedTrainerMap = await getCachedTrainerNamesMap();
  let reportData: ITrainingReportResponse | null =
    (await getCachedReport(training.dogId)) || (await getCachedReport(training.id)) || null;

  if (reportData) {
    reportData = {
      ...reportData,
      trainerName: resolveTrainerNameFromMap(
        reportData.trainerId || training.trainerId,
        cachedTrainerMap,
        reportData.trainerName || training.trainerName,
      ),
    };
  }

  let historyItems = (await getCachedStageData(training.id, stage)) || [];

  const isOnline = await trainingSyncService.checkIsOnline();
  let updatedSessionsCount: number | undefined;

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
        reportData = { ...report, trainerName: resolvedTrainerName };
        await saveCachedReport(training.dogId, reportData);
        await saveCachedReport(training.id, reportData);

        const currentStageReport =
          stage === 1
            ? report.stage1
            : stage === 2
            ? report.stage2
            : stage === 3
            ? report.stage3
            : report.stage4;
        updatedSessionsCount =
          currentStageReport?.totalSessionsRecorded ||
          currentStageReport?.sessions?.length ||
          0;
      }
    } catch (repError) {}
  }

  return { reportData, historyItems, updatedSessionsCount };
};

export interface SaveSessionResult {
  updatedTrainings: ITrainingResponse[];
  savedSessionItem: any;
  alert: {
    variant: "success" | "warning" | "error";
    title: string;
    message: string;
  };
}

export const executeSaveSession = async (
  stageNumber: number,
  data: Record<string, boolean>,
  selectedTraining: ITrainingResponse,
  trainings: ITrainingResponse[],
  authUser?: IAuthUser | null,
): Promise<SaveSessionResult> => {
  const currentSessions = selectedTraining.totalSessionsRecorded || 0;
  const todayFormatted = new Date().toLocaleDateString("pt-BR");
  const todayIsoDate = new Date().toISOString().split("T")[0];

  let realTrainingId = selectedTraining.id;
  const currentList = await getCachedStageData(realTrainingId, stageNumber);

  const existingTodayIndex = currentList.findIndex((item: any) => {
    if (!item.trainingDate) return false;
    return item.trainingDate.split("T")[0] === todayIsoDate;
  });

  const isUpdatingToday = existingTodayIndex >= 0;
  const isOnline = await trainingSyncService.checkIsOnline();

  if (
    (realTrainingId.startsWith("train_") || realTrainingId.startsWith("local_train_")) &&
    isOnline
  ) {
    const extractedTrainerId = await resolveTrainerId(selectedTraining.trainerId, authUser);
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
  }

  const payload: any = buildStagePayload(stageNumber, realTrainingId, todayIsoDate, data);
  const sessionNumber = isUpdatingToday
    ? currentList[existingTodayIndex].sessionNumber || (currentSessions > 0 ? currentSessions : 1)
    : currentSessions + 1;
  payload.sessionNumber = sessionNumber;

  let savedItemResponse: any = null;
  let alert: SaveSessionResult["alert"];

  if (
    isOnline &&
    !realTrainingId.startsWith("train_") &&
    !realTrainingId.startsWith("local_train_")
  ) {
    try {
      if (stageNumber === 1) savedItemResponse = await createStage1Service(payload);
      else if (stageNumber === 2) savedItemResponse = await createStage2Service(payload);
      else if (stageNumber === 3) savedItemResponse = await createStage3Service(payload);
      else if (stageNumber === 4) savedItemResponse = await createStage4Service(payload);

      alert = isUpdatingToday
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
      await enqueueSyncAction({
        actionType: `SAVE_STAGE${stageNumber}` as any,
        endpoint: `/api/v1/dogtraining/stage${stageNumber}`,
        method: "POST",
        payload,
      });
      alert = isUpdatingToday
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
    await enqueueSyncAction({
      actionType: `SAVE_STAGE${stageNumber}` as any,
      endpoint: `/api/v1/dogtraining/stage${stageNumber}`,
      method: "POST",
      payload,
    });
    alert = isUpdatingToday
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

  const itemToSave = {
    ...payload,
    id: savedItemResponse?.id || (isUpdatingToday ? currentList[existingTodayIndex].id : `local_${Date.now()}`),
    sessionNumber: savedItemResponse?.sessionNumber || sessionNumber,
    createdAt: savedItemResponse?.createdAt || new Date().toISOString(),
  };

  const updatedList = isUpdatingToday ? [...currentList] : [...currentList, itemToSave];
  if (isUpdatingToday) updatedList[existingTodayIndex] = itemToSave;

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

  await saveCachedTrainings(updatedTrainings);

  return {
    updatedTrainings,
    savedSessionItem: itemToSave,
    alert,
  };
};

export const executeFinalizeStage = async (
  stageNumber: number,
  status: TraningStatus,
  selectedTraining: ITrainingResponse,
  trainings: ITrainingResponse[],
  authUser?: IAuthUser | null,
): Promise<{
  updatedTrainings: ITrainingResponse[];
  alert: {
    variant: "success" | "warning" | "error";
    title: string;
    message: string;
  };
}> => {
  const isOnline = await trainingSyncService.checkIsOnline();
  let realTrainingId = selectedTraining.id;

  if (
    (realTrainingId.startsWith("train_") || realTrainingId.startsWith("local_train_")) &&
    isOnline
  ) {
    const extractedTrainerId = await resolveTrainerId(selectedTraining.trainerId, authUser);
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
  }

  const nextStage =
    status === TraningStatus.Apto && stageNumber < 4 ? stageNumber + 1 : stageNumber;
  const isFinishedApto = stageNumber === 4 && status === TraningStatus.Apto;
  const isFinishedInapto = status === TraningStatus.Inapto;

  const finalTrainingStatus = isFinishedApto
    ? TraningStatus.Apto
    : isFinishedInapto
    ? TraningStatus.Inapto
    : null;

  const updatedTrainings = trainings.map((t) => {
    if (t.id === selectedTraining.id) {
      return {
        ...t,
        id: realTrainingId,
        currentStage: nextStage,
        status: finalTrainingStatus,
        totalSessionsRecorded:
          status === TraningStatus.Apto && stageNumber < 4 ? 0 : t.totalSessionsRecorded,
        lastTrainingDate: new Date().toLocaleDateString("pt-BR"),
        isSynced: isOnline,
      };
    }
    return t;
  });

  await saveCachedTrainings(updatedTrainings);

  let alert: {
    variant: "success" | "warning" | "error";
    title: string;
    message: string;
  };

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

      alert = {
        variant: "success",
        title: "Etapa Finalizada!",
        message: isFinishedApto
          ? "Parabéns! O cão concluiu com êxito todas as 4 etapas de treinamento de Cão-Guia!"
          : isFinishedInapto
          ? `A Etapa ${stageNumber} foi finalizada como Inapto. O treinamento deste cão foi encerrado.`
          : `Etapa ${stageNumber} aprovada (Apto)! O cão avançou para a Etapa ${nextStage}.`,
      };
    } catch (apiError: any) {
      await enqueueSyncAction({
        actionType: "FINALIZE_STAGE",
        endpoint: `/api/v1/dogtraining/stage${stageNumber}/finalize/${realTrainingId}`,
        method: "PATCH",
        queryParams: { status },
      });
      alert = {
        variant: "warning",
        title: "Finalizado Offline",
        message: "A finalização foi gravada localmente e será enviada quando reconectar.",
      };
    }
  } else {
    await enqueueSyncAction({
      actionType: "FINALIZE_STAGE",
      endpoint: `/api/v1/dogtraining/stage${stageNumber}/finalize/${realTrainingId}`,
      method: "PATCH",
      queryParams: { status },
    });
    alert = {
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

  return { updatedTrainings, alert };
};

export const executeAddDogToTraining = async (
  dog: IDogResponse,
  trainings: ITrainingResponse[],
  authUser?: IAuthUser | null,
): Promise<{ updatedTrainings: ITrainingResponse[] }> => {
  const isOnline = await trainingSyncService.checkIsOnline();
  const extractedTrainerId = await resolveTrainerId(undefined, authUser);
  const cachedMap = await getCachedTrainerNamesMap();
  const trainerName = resolveTrainerNameFromMap(extractedTrainerId, cachedMap);
  const ageStr = dog.dateOfBirth ? calculateAge(new Date(dog.dateOfBirth)) : undefined;
  const monthYear = new Date().getFullYear() * 100 + (new Date().getMonth() + 1);
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

  const updatedTrainings = [newTraining, ...trainings];
  await saveCachedTrainings(updatedTrainings);
  return { updatedTrainings };
};
