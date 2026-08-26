export enum MessageType {
  MEDICATION = "MEDICATION",
  GENERAL = "GENERAL",
  HEALTH_ALERT = "HEALTH_ALERT",
}

export enum AudienceType {
  ALL = "ALL",
  ONLY_WHO_SENDED = "ONLY_WHO_SENDED",
}

export const MessageTypeLabel: Record<MessageType, string> = {
  [MessageType.MEDICATION]: "Medicação",
  [MessageType.GENERAL]: "Geral / Evento",
  [MessageType.HEALTH_ALERT]: "Alerta de Saúde",
};

export const AudienceTypeLabel: Record<AudienceType, string> = {
  [AudienceType.ALL]: "Todos",
  [AudienceType.ONLY_WHO_SENDED]: "Apenas Quem Enviou (Privado)",
};

export interface INotificationCreateRequest {
  title: string;
  message: string;
  messageType: MessageType;
  audienceType: AudienceType;
  eventDate: string; // Formato ISO LocalDateTime: "YYYY-MM-DDTHH:mm:ss"
  limitDate?: string; // Formato ISO LocalDateTime: "YYYY-MM-DDTHH:mm:ss" (opcional)
}

export interface INotificationTaskCompletedUpdate {
  id?: string;
  notificationId?: string;
  taskId?: string;
  completed?: boolean;
}

export interface INotificationResponse {
  id: string;
  title: string;
  message: string;
  messageType: MessageType;
  audienceType?: AudienceType;
  eventDate?: string;
  limitDate?: string;
  createdByName?: string;
  createdAt: string;
  finished?: boolean;
  completed?: boolean;
  taskCompleted?: boolean;
  isCompleted?: boolean;
  active?: boolean;
  status?: string;
}

export const isNotificationFinished = (n: any): boolean => {
  if (!n) return false;
  return (
    n.finished === true ||
    n.completed === true ||
    n.taskCompleted === true ||
    n.isCompleted === true ||
    n.isTaskCompleted === true ||
    n.active === false ||
    n.status === "COMPLETED" ||
    n.status === "FINISHED" ||
    n.status === "DONE"
  );
};

export interface INotificationCreatedEvent {
  id: string;
  title: string;
  message: string;
  messageType: MessageType;
  createdByName: string;
  createdAt: string;
  eventDate?: string;
  limitDate?: string;
}

export interface INotificationTaskCompletedEvent {
  id: string;
  completed?: boolean;
  completedByName?: string;
  completedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
