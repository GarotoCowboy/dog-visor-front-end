import {
  INotificationCreatedEvent,
  INotificationResponse,
  INotificationTaskCompletedEvent,
} from "../types/Notification";

const backendAddress = process.env.EXPO_PUBLIC_BACKEND_ADDRESS || "localhost";
const backendPort = process.env.EXPO_PUBLIC_BACKEND_PORT || "8080";

type NotificationListener = (notification: INotificationResponse) => void;
type CompletedListener = (event: INotificationTaskCompletedEvent) => void;

class NotificationWebSocketClient {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private shouldReconnect = true;
  private reconnectTimeout: any = null;

  private notificationListeners: Set<NotificationListener> = new Set();
  private completedListeners: Set<CompletedListener> = new Set();

  public connect() {
    this.shouldReconnect = true;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const wsUrl = `ws://${backendAddress}:${backendPort}/api/v1/dogNotification/ws`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Envia comando CONNECT do protocolo STOMP
        const connectFrame = "CONNECT\naccept-version:1.2,1.1,1.0\nheart-beat:10000,10000\n\n\0";
        this.ws?.send(connectFrame);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.log("WebSocket erro de conexão:", error);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch (e) {
      console.log("Falha ao inicializar WebSocket:", e);
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect();
      }
    }, 5000);
  }

  private handleMessage(data: string) {
    if (!data) return;

    // Conectado com sucesso no STOMP
    if (data.startsWith("CONNECTED")) {
      this.isConnected = true;

      // Inscreve nos tópicos de broadcast
      this.subscribe("/topic/notifications", "sub-all");
      this.subscribe("/topic/notifications/created", "sub-created");
      this.subscribe("/topic/notifications/completed", "sub-completed");
      return;
    }

    // Mensagem recebida em um tópico STOMP
    if (data.startsWith("MESSAGE")) {
      const bodyIndex = data.indexOf("\n\n");
      if (bodyIndex !== -1) {
        const rawBody = data.substring(bodyIndex + 2).replace(/\0$/, "");
        try {
          const parsed = JSON.parse(rawBody);

          if (data.includes("/topic/notifications/completed")) {
            this.notifyCompleted(parsed);
          } else {
            this.notifyNewNotification(parsed);
          }
        } catch (err) {
          console.log("Erro ao processar mensagem do WebSocket:", err);
        }
      }
    }
  }

  private subscribe(destination: string, id: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subFrame = `SUBSCRIBE\nid:${id}\ndestination:${destination}\nack:auto\n\n\0`;
      this.ws.send(subFrame);
    }
  }

  private notifyNewNotification(notification: any) {
    this.notificationListeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (err) {
        console.log("Erro no listener de notificação:", err);
      }
    });
  }

  private notifyCompleted(event: INotificationTaskCompletedEvent) {
    this.completedListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.log("Erro no listener de completed:", err);
      }
    });
  }

  public onNotification(listener: NotificationListener) {
    this.notificationListeners.add(listener);
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  public onTaskCompleted(listener: CompletedListener) {
    this.completedListeners.add(listener);
    return () => {
      this.completedListeners.delete(listener);
    };
  }

  public disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const notificationWebSocket = new NotificationWebSocketClient();

