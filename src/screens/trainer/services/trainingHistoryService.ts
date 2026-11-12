import {
  IDogTest,
  ScoreComparisonLabel,
  TestStatus,
  TestType,
} from "../../../types/Training";
import {
  getTrainerNamesMapService,
  listBehaviorTestsByDogIdService,
  listVolhardTestsByDogIdService,
  resolveTrainerNameFromMap,
} from "../../../service/api";
import {
  getCachedTests,
  getCachedTrainerNamesMap,
} from "../../../service/trainingOfflineService";
import { trainingSyncService } from "../../../service/trainingSyncService";
import {
  decodeBehaviorResultProgress,
  decodeVolhardResultProgress,
} from "../constants/testQuestionsData";

export const fetchDogTestsAndTrainer = async (
  dogId: string,
  rawTrainerId?: string,
  rawTrainerName?: string,
  dogsName?: string,
  dogsBreed?: string,
): Promise<{
  dogTests: IDogTest[];
  resolvedTrainerName?: string;
}> => {
  const cachedMap = await getCachedTrainerNamesMap();
  const initialTrainerName = resolveTrainerNameFromMap(
    rawTrainerId,
    cachedMap,
    rawTrainerName,
  );

  let localDogTests: IDogTest[] = [];
  try {
    const allCachedTests = await getCachedTests();
    localDogTests = (allCachedTests || [])
      .filter((t: IDogTest) => String(t.dogId).toLowerCase() === String(dogId).toLowerCase())
      .map((t: IDogTest) => {
        const tId =
          t.trainerId ||
          t.volhardDetails?.trainerId ||
          t.behaviorDetails?.trainerId ||
          t.volhardPayload?.trainerId ||
          t.behaviorPayload?.trainerId;
        return {
          ...t,
          trainerId: tId,
          trainerName: resolveTrainerNameFromMap(tId, cachedMap, t.trainerName),
        };
      });
  } catch (e) {}

  let resolvedTrainerName = initialTrainerName;
  let finalTests: IDogTest[] = localDogTests;

  const isOnline = await trainingSyncService.checkIsOnline();
  if (!isOnline) {
    return { dogTests: finalTests, resolvedTrainerName };
  }

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
      rawTrainerId,
      ...volhardItems.map((v) => v.trainerId),
      ...behaviorItems.map((b) => b.trainerId),
      ...localDogTests.map((t) => t.trainerId),
    ];
    const trainerNamesMap = await getTrainerNamesMapService(trainerIdsToResolve);

    resolvedTrainerName = resolveTrainerNameFromMap(
      rawTrainerId,
      trainerNamesMap,
      rawTrainerName,
    );

    const cachedById = new Map<string, IDogTest>(
      localDogTests.map((c) => [c.id, c]),
    );
    const remoteTests: IDogTest[] = [];

    volhardItems.forEach((v) => {
      const cachedMatch = cachedById.get(v.id);
      const decoded = decodeVolhardResultProgress(v.result, cachedMatch?.answeredVolhardKeys);
      remoteTests.push({
        id: v.id,
        dogId: v.dogId,
        trainerId: v.trainerId,
        trainerName: resolveTrainerNameFromMap(
          v.trainerId,
          trainerNamesMap,
          cachedMatch?.trainerName,
        ),
        dogsName: dogsName || "Cão",
        dogsBreed: dogsBreed || "Raça não informada",
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
      remoteTests.push({
        id: b.id,
        dogId: b.dogId,
        trainerId: b.trainerId,
        trainerName: resolveTrainerNameFromMap(
          b.trainerId,
          trainerNamesMap,
          cachedMatch?.trainerName,
        ),
        dogsName: dogsName || "Cão",
        dogsBreed: dogsBreed || "Raça não informada",
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
      });
    });

    if (remoteTests.length > 0 || localDogTests.length > 0) {
      const unsyncedLocal = localDogTests
        .filter((t) => t.isSynced === false)
        .map((t) => ({
          ...t,
          trainerName: resolveTrainerNameFromMap(
            t.trainerId,
            trainerNamesMap,
            t.trainerName,
          ),
        }));
      const merged = [...unsyncedLocal, ...remoteTests];
      const byDogAndType = new Map<string, IDogTest>();
      for (const item of merged) {
        const key = `${String(item.dogId).toLowerCase()}_${item.type}`;
        const existing = byDogAndType.get(key);
        if (!existing || (item.completedCount ?? 0) >= (existing.completedCount ?? 0)) {
          byDogAndType.set(key, item);
        }
      }
      finalTests = Array.from(byDogAndType.values());
    }
  } catch (e) {}

  return { dogTests: finalTests, resolvedTrainerName };
};

