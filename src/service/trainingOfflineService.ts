import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  IDogTest,
  ISyncQueueItem,
  ITrainingReportResponse,
  ITrainingResponse,
} from "../types/Training";

const STORAGE_KEYS = {
  TRAININGS_CACHE: "@dogvisor_trainings_cache",
  TESTS_CACHE: "@dogvisor_tests_cache",
  STAGE_CACHE_PREFIX: "@dogvisor_stage_cache_",
  REPORT_CACHE_PREFIX: "@dogvisor_report_cache_",
  PENDING_SYNC_QUEUE: "@dogvisor_pending_sync_queue",
};

/**
 * Salva a lista de treinamentos em cache local
 */
export const saveCachedTrainings = async (
  trainings: ITrainingResponse[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.TRAININGS_CACHE,
      JSON.stringify(trainings),
    );
  } catch (error) {
    console.log("Erro ao salvar cache de treinamentos:", error);
  }
};

/**
 * Recupera os treinamentos salvos localmente
 */
export const getCachedTrainings = async (): Promise<ITrainingResponse[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.TRAININGS_CACHE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.log("Erro ao ler cache de treinamentos:", error);
    return [];
  }
};

/**
 * Salva a lista de testes em cache local
 */
export const saveCachedTests = async (tests: IDogTest[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.TESTS_CACHE,
      JSON.stringify(tests),
    );
  } catch (error) {
    console.log("Erro ao salvar cache de testes:", error);
  }
};

/**
 * Recupera os testes salvos localmente
 */
export const getCachedTests = async (): Promise<IDogTest[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.TESTS_CACHE);
    if (!raw) return [];
    const list: IDogTest[] = JSON.parse(raw);
    const cleaned = list.filter((t) => !t.id.startsWith("mock_"));
    if (cleaned.length !== list.length) {
      await AsyncStorage.setItem(STORAGE_KEYS.TESTS_CACHE, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (error) {
    console.log("Erro ao ler cache de testes:", error);
    return [];
  }
};

/**
 * Salva dados de etapas em cache local
 */
export const saveCachedStageData = async (
  trainingId: string,
  stageNumber: number,
  data: any[],
): Promise<void> => {
  try {
    const key = `${STORAGE_KEYS.STAGE_CACHE_PREFIX}${trainingId}_${stageNumber}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.log("Erro ao salvar cache de etapa:", error);
  }
};

/**
 * Recupera dados de etapas do cache local
 */
export const getCachedStageData = async (
  trainingId: string,
  stageNumber: number,
): Promise<any[]> => {
  try {
    const key = `${STORAGE_KEYS.STAGE_CACHE_PREFIX}${trainingId}_${stageNumber}`;
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.log("Erro ao ler cache de etapa:", error);
    return [];
  }
};

/**
 * Salva o relatório completo em cache local
 */
export const saveCachedReport = async (
  dogOrTrainingId: string,
  report: ITrainingReportResponse,
): Promise<void> => {
  try {
    const key = `${STORAGE_KEYS.REPORT_CACHE_PREFIX}${dogOrTrainingId}`;
    await AsyncStorage.setItem(key, JSON.stringify(report));
  } catch (error) {
    console.log("Erro ao salvar cache de relatório:", error);
  }
};

/**
 * Recupera o relatório completo do cache local
 */
export const getCachedReport = async (
  dogOrTrainingId: string,
): Promise<ITrainingReportResponse | null> => {
  try {
    const key = `${STORAGE_KEYS.REPORT_CACHE_PREFIX}${dogOrTrainingId}`;
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.log("Erro ao ler cache de relatório:", error);
    return null;
  }
};

/**
 * Enfileira uma ação de sincronização pendente
 */
export const enqueueSyncAction = async (
  item: Omit<ISyncQueueItem, "id" | "createdAt">,
): Promise<ISyncQueueItem> => {
  try {
    const queue = await getPendingSyncQueue();
    const newItem: ISyncQueueItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
    };
    const updatedQueue = [...queue, newItem];
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_SYNC_QUEUE,
      JSON.stringify(updatedQueue),
    );
    return newItem;
  } catch (error) {
    console.log("Erro ao enfileirar ação de sincronização:", error);
    throw error;
  }
};

/**
 * Recupera a fila de ações pendentes de sincronização
 */
export const getPendingSyncQueue = async (): Promise<ISyncQueueItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC_QUEUE);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.log("Erro ao ler fila de sincronização:", error);
    return [];
  }
};

/**
 * Remove um item da fila de sincronização
 */
export const dequeueSyncAction = async (id: string): Promise<void> => {
  try {
    const queue = await getPendingSyncQueue();
    const updated = queue.filter((item) => item.id !== id);
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_SYNC_QUEUE,
      JSON.stringify(updated),
    );
  } catch (error) {
    console.log("Erro ao desenfileirar ação:", error);
  }
};

/**
 * Limpa toda a fila de sincronização
 */
export const clearSyncQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC_QUEUE);
  } catch (error) {
    console.log("Erro ao limpar fila de sincronização:", error);
  }
};
