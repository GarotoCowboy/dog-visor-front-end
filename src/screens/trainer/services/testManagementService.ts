import {
  DualHandler,
  IBehaviorTestResponse,
  ICreateBehaviorTestRequest,
  ICreateVolhardTestRequest,
  IDogTest,
  IVolhardTestResponse,
  MovementGait,
  RelationshipSkill,
  ScoreComparison,
  ScoreComparisonLabel,
  StructureType,
  TestStatus,
  TestType,
  WorkSpeed,
} from "../../../types/Training";
import { formatDogRace, IDogResponse } from "../../../types/Dog";
import { getEmployeeIdentifier } from "../../../types/User";
import {
  createBehaviorTestService,
  createVolhardTestService,
  deleteBehaviorTestService,
  deleteVolhardTestService,
  getDogsService,
  getLoggedUserProfileService,
  getTrainerNamesMapService,
  listBehaviorTestsService,
  listVolhardTestsService,
  resolveTrainerNameFromMap,
  updateBehaviorTestService,
  updateVolhardTestService,
} from "../../../service/api";
import {
  enqueueSyncAction,
  getCachedTests,
  getCachedTrainerId,
  getCachedTrainerNamesMap,
  getCachedTrainings,
  saveCachedTests,
  saveCachedTrainerId,
  saveCachedTrainerNamesMap,
} from "../../../service/trainingOfflineService";
import { trainingSyncService } from "../../../service/trainingSyncService";
import {
  decodeBehaviorResultProgress,
  decodeVolhardResultProgress,
} from "../constants/testQuestionsData";
import { isValidUuid } from "../utils/stagePayloadBuilder";

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

export const isNonZeroUuid = (val?: string | null): val is string =>
  Boolean(val) && isValidUuid(val || undefined) && val !== ZERO_UUID;

export const toIsoDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return dateStr.split("T")[0];
};

export const fetchAllTestsAndDogs = async (): Promise<{
  tests: IDogTest[];
  availableDogs: IDogResponse[];
}> => {
  const cachedTests = await getCachedTests();
  const cachedTrainerMap = await getCachedTrainerNamesMap();
  let tests = cachedTests || [];

  let dogsList: IDogResponse[] = [];
  try {
    dogsList = await getDogsService();
  } catch (dogErr) {
    try {
      const cachedTrainings = await getCachedTrainings();
      if (cachedTrainings && cachedTrainings.length > 0) {
        dogsList = cachedTrainings.map((ct) => ({
          ID: ct.dogId,
          name: ct.dogsName,
          race: ct.dogsBreed as any,
          sex: (ct.dogSex as any) || "M",
          status: null,
          avatarKey: ct.avatarKey || "male-dog-000",
          dateOfBirth: "",
          createdAt: "",
          updatedAt: "",
        }));
      }
    } catch (cacheDogErr) {}
  }

  const dogMap = new Map<string, IDogResponse>();
  dogsList.forEach((d) => {
    if (d.ID) dogMap.set(String(d.ID).toLowerCase(), d);
  });

  const enrichWithDogAvatar = (
    testList: IDogTest[],
    trainerNamesMap: Record<string, string> = cachedTrainerMap,
  ): IDogTest[] =>
    testList.map((t) => {
      const matchedDog = t.dogId
        ? dogMap.get(String(t.dogId).toLowerCase())
        : undefined;
      const resolvedTrainerId =
        t.trainerId ||
        t.volhardDetails?.trainerId ||
        t.behaviorDetails?.trainerId ||
        t.volhardPayload?.trainerId ||
        t.behaviorPayload?.trainerId;
      const resolvedTrainerName = resolveTrainerNameFromMap(
        resolvedTrainerId,
        trainerNamesMap,
        t.trainerName,
      );
      return {
        ...t,
        trainerId: resolvedTrainerId || t.trainerId,
        trainerName: resolvedTrainerName,
        dogsName: matchedDog?.name || t.dogsName,
        dogsBreed: formatDogRace(matchedDog?.race) || t.dogsBreed,
        avatarKey: matchedDog?.avatarKey || t.avatarKey,
      };
    });

  if (cachedTests && cachedTests.length > 0) {
    tests = enrichWithDogAvatar(cachedTests, cachedTrainerMap);
  }

  const isOnline = await trainingSyncService.checkIsOnline();
  if (isOnline) {
    try {
      const userProfile = await getLoggedUserProfileService();
      const resolvedId = getEmployeeIdentifier(userProfile);
      if (isNonZeroUuid(resolvedId)) {
        await saveCachedTrainerId(resolvedId);
        if (userProfile?.name) {
          await saveCachedTrainerNamesMap({
            [resolvedId]: userProfile.name,
            [resolvedId.toLowerCase()]: userProfile.name,
          });
        }
      }
    } catch (profileErr) {}

    try {
      const [volhardsRes, behaviorsRes] = await Promise.allSettled([
        listVolhardTestsService(),
        listBehaviorTestsService(),
      ]);

      const volhardItems: IVolhardTestResponse[] =
        volhardsRes.status === "fulfilled" && Array.isArray(volhardsRes.value)
          ? volhardsRes.value
          : [];

      const behaviorItems: IBehaviorTestResponse[] =
        behaviorsRes.status === "fulfilled" && Array.isArray(behaviorsRes.value)
          ? behaviorsRes.value
          : [];

      const extraTrainerIds = [
        ...volhardItems.map((v) => v.trainerId),
        ...behaviorItems.map((b) => b.trainerId),
      ];
      const trainerNamesMap = await getTrainerNamesMapService(extraTrainerIds);

      const fetchedTests: IDogTest[] = [];
      const cachedById = new Map<string, IDogTest>(
        (cachedTests || []).map((c) => [c.id, c]),
      );

      volhardItems.forEach((v) => {
        const dog = v.dogId ? dogMap.get(String(v.dogId).toLowerCase()) : undefined;
        const cachedMatch = cachedById.get(v.id);
        const decoded = decodeVolhardResultProgress(v.result, cachedMatch?.answeredVolhardKeys);
        fetchedTests.push({
          id: v.id,
          dogId: v.dogId,
          trainerId: v.trainerId || cachedMatch?.trainerId,
          trainerName: resolveTrainerNameFromMap(
            v.trainerId || cachedMatch?.trainerId,
            trainerNamesMap,
            cachedMatch?.trainerName,
          ),
          dogsName: dog?.name || cachedMatch?.dogsName || "Cão",
          dogsBreed: formatDogRace(dog?.race) || cachedMatch?.dogsBreed || "Raça não informada",
          avatarKey: dog?.avatarKey || cachedMatch?.avatarKey,
          type: TestType.VOLHARD,
          title: "Teste Volhard",
          date: v.date || "",
          description: decoded.cleanDescription,
          score: decoded.isCompleted
            ? `Estabilidade: ${v.stability}/5`
            : `Em andamento: ${decoded.completedCount}/${decoded.totalCount} etapas`,
          status: decoded.isCompleted ? TestStatus.COMPLETED : TestStatus.PENDING,
          completedCount: decoded.completedCount,
          totalCount: decoded.totalCount,
          answeredVolhardKeys: decoded.answeredKeys,
          isSynced: true,
          volhardDetails: v,
        });
      });

      behaviorItems.forEach((b) => {
        const dog = b.dogId ? dogMap.get(String(b.dogId).toLowerCase()) : undefined;
        const cachedMatch = cachedById.get(b.id);
        const decoded = decodeBehaviorResultProgress(
          b.result,
          b.characteristics,
          cachedMatch?.answeredBehaviorNumbers,
        );
        const compLabel = b.scoreComparison
          ? ScoreComparisonLabel[b.scoreComparison] || b.scoreComparison
          : "Concluído";
        fetchedTests.push({
          id: b.id,
          dogId: b.dogId,
          trainerId: b.trainerId || cachedMatch?.trainerId,
          trainerName: resolveTrainerNameFromMap(
            b.trainerId || cachedMatch?.trainerId,
            trainerNamesMap,
            cachedMatch?.trainerName,
          ),
          dogsName: dog?.name || cachedMatch?.dogsName || "Cão",
          dogsBreed: formatDogRace(dog?.race) || cachedMatch?.dogsBreed || "Raça não informada",
          avatarKey: dog?.avatarKey || cachedMatch?.avatarKey,
          type: TestType.BEHAVIOR,
          title: "Teste Behavior",
          date: b.date || "",
          description: decoded.cleanDescription,
          score: decoded.isCompleted
            ? compLabel
            : `Em andamento: ${decoded.completedCount}/${decoded.totalCount} aspectos`,
          status: decoded.isCompleted ? TestStatus.COMPLETED : TestStatus.PENDING,
          completedCount: decoded.completedCount,
          totalCount: decoded.totalCount,
          answeredBehaviorNumbers: decoded.answeredNumbers,
          isSynced: true,
          behaviorDetails: b,
        });
      });

      if (fetchedTests.length > 0) {
        const unsyncedLocal = enrichWithDogAvatar(
          (cachedTests || []).filter((t) => t.isSynced === false),
          trainerNamesMap,
        );
        const merged = [...unsyncedLocal, ...fetchedTests];
        const byDogAndType = new Map<string, IDogTest>();
        const duplicateToDelete: IDogTest[] = [];

        for (const item of merged) {
          const key = `${String(item.dogId).toLowerCase()}_${item.type}`;
          const existing = byDogAndType.get(key);
          if (!existing) {
            byDogAndType.set(key, item);
          } else {
            const existingProgress = existing.completedCount ?? 0;
            const itemProgress = item.completedCount ?? 0;
            if (itemProgress >= existingProgress) {
              duplicateToDelete.push(existing);
              byDogAndType.set(key, item);
            } else {
              duplicateToDelete.push(item);
            }
          }
        }

        for (const dup of duplicateToDelete) {
          if (dup.id && !dup.id.startsWith("test_")) {
            if (dup.type === TestType.VOLHARD) {
              deleteVolhardTestService(dup.id).catch(() => {});
            } else {
              deleteBehaviorTestService(dup.id).catch(() => {});
            }
          }
        }

        tests = Array.from(byDogAndType.values());
        await saveCachedTests(tests);
      }
    } catch (apiErr) {
      console.log("Erro ao buscar testes online da API:", apiErr);
    }
  }

  return { tests, availableDogs: dogsList };
};

export const persistDogTest = async (
  testData: Omit<IDogTest, "id">,
  existingTests: IDogTest[],
  existingId?: string,
): Promise<{ updatedTests: IDogTest[]; createdOnline: boolean; isOnline: boolean }> => {
  const isOnline = await trainingSyncService.checkIsOnline();
  const isoDate = toIsoDate(testData.date);

  let trainerId = (await getCachedTrainerId()) || ZERO_UUID;
  let trainerName = testData.trainerName;
  try {
    const userProfile = await getLoggedUserProfileService();
    const resolvedId = getEmployeeIdentifier(userProfile);
    if (isNonZeroUuid(resolvedId)) {
      trainerId = resolvedId;
      await saveCachedTrainerId(resolvedId);
      if (userProfile?.name) {
        trainerName = userProfile.name;
        await saveCachedTrainerNamesMap({
          [resolvedId]: userProfile.name,
          [resolvedId.toLowerCase()]: userProfile.name,
        });
      }
    }
  } catch (profileErr) {}
  if (!trainerName) {
    const cachedMap = await getCachedTrainerNamesMap();
    trainerName = resolveTrainerNameFromMap(trainerId, cachedMap);
  }

  const existingSameDogAndType = existingTests.find(
    (t) =>
      String(t.dogId).toLowerCase() === String(testData.dogId).toLowerCase() &&
      t.type === testData.type,
  );
  const resolvedExistingId =
    existingId && existingSameDogAndType
      ? existingSameDogAndType.id
      : existingId || existingSameDogAndType?.id;

  let createdOnline = false;
  let remoteId: string | null =
    resolvedExistingId && !resolvedExistingId.startsWith("test_")
      ? resolvedExistingId
      : null;
  const isRemoteUpdate = Boolean(remoteId);
  let savedVolhardPayload: ICreateVolhardTestRequest | undefined = testData.volhardPayload;
  let savedBehaviorPayload: ICreateBehaviorTestRequest | undefined = testData.behaviorPayload;

  if (testData.type === TestType.VOLHARD) {
    const payloadTrainerId = isNonZeroUuid(testData.volhardPayload?.trainerId)
      ? testData.volhardPayload!.trainerId
      : trainerId;

    const volhardDto: ICreateVolhardTestRequest = testData.volhardPayload
      ? { ...testData.volhardPayload, trainerId: payloadTrainerId, date: isoDate }
      : {
          trainerId: payloadTrainerId,
          dogId: testData.dogId,
          testType: "VOLHARD",
          date: isoDate,
          result: testData.description || "Apto para socialização",
          socialAttraction: 3,
          following: 3,
          restraint: 3,
          socialDominance: 3,
          elevationDominance: 3,
          retrieving: 3,
          touchSensitivity: 3,
          soundSensitivity: 3,
          stability: 3,
          structure: {
            straightFront: StructureType.BOA,
            shoulderAngulation: StructureType.BOA,
            croupAngulation: StructureType.ACEITAVEL,
            straightRear: StructureType.BOA,
            rearAngulation: StructureType.ACEITAVEL,
            elbowAngulation: StructureType.BOA,
          },
        };
    savedVolhardPayload = volhardDto;

    if (isOnline) {
      try {
        if (isRemoteUpdate && remoteId) {
          const res = await updateVolhardTestService(remoteId, volhardDto);
          createdOnline = true;
          remoteId = res.id || remoteId;
        } else {
          const res = await createVolhardTestService(volhardDto);
          createdOnline = true;
          remoteId = res.id;
        }
      } catch (apiErr) {
        await enqueueSyncAction({
          actionType: isRemoteUpdate ? "UPDATE_VOLHARD_TEST" : "CREATE_VOLHARD_TEST",
          endpoint: isRemoteUpdate
            ? `/api/v1/dogtraining/volhard/update/${remoteId}`
            : "/api/v1/dogtraining/volhard",
          method: isRemoteUpdate ? "PATCH" : "POST",
          payload: volhardDto,
        });
      }
    } else {
      await enqueueSyncAction({
        actionType: isRemoteUpdate ? "UPDATE_VOLHARD_TEST" : "CREATE_VOLHARD_TEST",
        endpoint: isRemoteUpdate
          ? `/api/v1/dogtraining/volhard/update/${remoteId}`
          : "/api/v1/dogtraining/volhard",
        method: isRemoteUpdate ? "PATCH" : "POST",
        payload: volhardDto,
      });
    }
  } else {
    const payloadTrainerId = isNonZeroUuid(testData.behaviorPayload?.trainerId)
      ? testData.behaviorPayload!.trainerId
      : trainerId;

    const behaviorDto: ICreateBehaviorTestRequest = testData.behaviorPayload
      ? { ...testData.behaviorPayload, trainerId: payloadTrainerId, date: isoDate }
      : {
          trainerId: payloadTrainerId,
          dogId: testData.dogId,
          testType: "BEHAVIOR",
          date: isoDate,
          result: testData.description || "Teste Behavior",
          dualHandler: DualHandler.TRABALHA_BEM,
          relationshipSkill: RelationshipSkill.MUITO_HABIL,
          scoreComparison: ScoreComparison.CAO_FLEXIVEL,
          workSpeed: WorkSpeed.MODERADO,
          movementGait: MovementGait.MANTEM_TROTE,
          characteristics: [],
        };
    savedBehaviorPayload = behaviorDto;

    if (isOnline) {
      try {
        if (isRemoteUpdate && remoteId) {
          const res = await updateBehaviorTestService(remoteId, behaviorDto);
          createdOnline = true;
          remoteId = res.id || remoteId;
        } else {
          const res = await createBehaviorTestService(behaviorDto);
          createdOnline = true;
          remoteId = res.id;
        }
      } catch (apiErr) {
        await enqueueSyncAction({
          actionType: isRemoteUpdate ? "UPDATE_BEHAVIOR_TEST" : "CREATE_BEHAVIOR_TEST",
          endpoint: isRemoteUpdate
            ? `/api/v1/dogtraining/behavior/update/${remoteId}`
            : "/api/v1/dogtraining/behavior",
          method: isRemoteUpdate ? "PATCH" : "POST",
          payload: behaviorDto,
        });
      }
    } else {
      await enqueueSyncAction({
        actionType: isRemoteUpdate ? "UPDATE_BEHAVIOR_TEST" : "CREATE_BEHAVIOR_TEST",
        endpoint: isRemoteUpdate
          ? `/api/v1/dogtraining/behavior/update/${remoteId}`
          : "/api/v1/dogtraining/behavior",
        method: isRemoteUpdate ? "PATCH" : "POST",
        payload: behaviorDto,
      });
    }
  }

  const finalId =
    remoteId ||
    resolvedExistingId ||
    `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newTest: IDogTest = {
    ...testData,
    id: finalId,
    trainerId: savedVolhardPayload?.trainerId || savedBehaviorPayload?.trainerId || trainerId,
    trainerName: trainerName || testData.trainerName,
    isSynced: createdOnline,
    volhardPayload: savedVolhardPayload,
    behaviorPayload: savedBehaviorPayload,
  };

  const filteredExisting = existingTests.filter(
    (t) =>
      t.id !== existingId &&
      t.id !== resolvedExistingId &&
      t.id !== finalId &&
      !(String(t.dogId).toLowerCase() === String(testData.dogId).toLowerCase() && t.type === testData.type),
  );

  const updatedTests = [newTest, ...filteredExisting];
  await saveCachedTests(updatedTests);

  return { updatedTests, createdOnline, isOnline };
};

