import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import api from "./api";
import {
  dequeueSyncAction,
  getPendingSyncQueue,
} from "./trainingOfflineService";

type SyncListener = (isSyncing: boolean, pendingCount: number) => void;

class TrainingSyncService {
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();
  private onlineStatusListeners: Set<(isOnline: boolean) => void> = new Set();
  private lastOnlineState = true;

  constructor() {
    this.initNetworkListener();
  }

  private initNetworkListener() {
    NetInfo.addEventListener((state: NetInfoState) => {
      // Em redes locais/emuladores (ex: 192.168.x.x), isInternetReachable pode ser falso
      // mesmo com a API perfeitamente acessível. Consideramos online se isConnected for true.
      const isOnline = state.isConnected !== false;

      const statusChanged = this.lastOnlineState !== isOnline;
      this.lastOnlineState = isOnline;

      this.onlineStatusListeners.forEach((listener) => {
        try {
          listener(isOnline);
        } catch (e) {
          console.log("Erro no listener de status online:", e);
        }
      });

      // Se reconectou, dispara automaticamente a sincronização da fila
      if (statusChanged && isOnline) {
        this.processQueue();
      }
    });
  }

  public subscribeOnlineStatus(
    callback: (isOnline: boolean) => void,
  ): () => void {
    this.onlineStatusListeners.add(callback);
    // Dispara status atual imediatamente
    NetInfo.fetch().then((state) => {
      const isOnline = state.isConnected !== false;
      callback(isOnline);
    });
    return () => {
      this.onlineStatusListeners.delete(callback);
    };
  }

  public subscribeSync(listener: SyncListener): () => void {
    this.listeners.add(listener);
    getPendingSyncQueue().then((q) => listener(this.isSyncing, q.length));
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(pendingCount: number) {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isSyncing, pendingCount);
      } catch (e) {
        console.log("Erro ao notificar listener de sincronização:", e);
      }
    });
  }

  public async checkIsOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected !== false;
  }

  /**
   * Processa a fila de ações pendentes de sincronização
   */
  public async processQueue(): Promise<void> {
    if (this.isSyncing) return;

    const isOnline = await this.checkIsOnline();
    if (!isOnline) return;

    const queue = await getPendingSyncQueue();
    if (queue.length === 0) return;

    try {
      this.isSyncing = true;
      this.notify(queue.length);

      for (const item of queue) {
        try {
          let response;
          if (item.method === "POST") {
            response = await api.post(item.endpoint, item.payload);
          } else if (item.method === "PATCH") {
            response = await api.patch(item.endpoint, item.payload, {
              params: item.queryParams,
            });
          } else if (item.method === "PUT") {
            response = await api.put(item.endpoint, item.payload);
          } else if (item.method === "DELETE") {
            response = await api.delete(item.endpoint);
          }

          if (response && (response.status === 200 || response.status === 201 || response.status === 204)) {
            await dequeueSyncAction(item.id);
          }
        } catch (itemError: any) {
          console.log(
            `Erro ao sincronizar item ${item.actionType} (${item.id}):`,
            itemError?.message || itemError,
          );
          // Se for erro de autenticação ou rede, interrompe para tentar mais tarde
          if (
            !itemError.response ||
            itemError.response.status === 401 ||
            itemError.response.status === 503
          ) {
            break;
          }
          // Se for erro definitivo (ex: 400 Bad Request / duplicidade), descarte para não travar a fila
          if (itemError.response && itemError.response.status >= 400 && itemError.response.status < 500) {
            await dequeueSyncAction(item.id);
          }
        }
      }
    } finally {
      this.isSyncing = false;
      const remaining = await getPendingSyncQueue();
      this.notify(remaining.length);
    }
  }
}

export const trainingSyncService = new TrainingSyncService();
