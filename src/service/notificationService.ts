import api from "./apiClient";
import {
  INotificationCreateRequest,
  INotificationResponse,
  PageResponse,
} from "../types/Notification";

// NOTIFICATIONS & EVENTS
export const createNotificationService = async (
  dto: INotificationCreateRequest,
): Promise<INotificationResponse> => {
  const response = await api.post<INotificationResponse>(
    "/api/v1/dogNotification/notifications",
    dto,
  );
  return response.data;
};

export const getNotificationsService = async (
  page: number = 0,
  size: number = 50,
  isCompleted?: boolean,
): Promise<INotificationResponse[]> => {
  const params: Record<string, any> = { page, size };
  if (isCompleted !== undefined) {
    params.isCompleted = isCompleted;
  }

  const response = await api.get<
    PageResponse<INotificationResponse> | INotificationResponse[]
  >("/api/v1/dogNotification/notifications", { params });

  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray((response.data as any).content)) {
    return (response.data as any).content;
  }
  return [];
};

export const getPendingNotificationsService = async (
  page: number = 0,
  size: number = 50,
): Promise<INotificationResponse[]> => {
  const response = await api.get<
    PageResponse<INotificationResponse> | INotificationResponse[]
  >("/api/v1/dogNotification/notifications/pending", {
    params: { page, size },
  });

  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray((response.data as any).content)) {
    return (response.data as any).content;
  }
  return [];
};

export const getCompletedNotificationsService = async (
  page: number = 0,
  size: number = 50,
): Promise<INotificationResponse[]> => {
  const response = await api.get<
    PageResponse<INotificationResponse> | INotificationResponse[]
  >("/api/v1/dogNotification/notifications/completed", {
    params: { page, size },
  });

  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray((response.data as any).content)) {
    return (response.data as any).content;
  }
  return [];
};

export const toggleNotificationCompletedService = async (
  id: string,
  completedByName?: string,
): Promise<INotificationResponse> => {
  const response = await api.patch<INotificationResponse>(
    "/api/v1/dogNotification/notifications/toggle",
    {
      id,
      notificationId: id,
      taskId: id,
      completed: true,
      completedByName,
    },
  );
  return response.data;
};
