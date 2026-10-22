import React, { useCallback, useContext, useState } from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

import { theme } from "../../../theme/theme";
import { AuthContext } from "../../service/authContext";
import {
  deleteMedicationService,
  getCompletedNotificationsService,
  getNotificationsService,
  getPendingNotificationsService,
  listMedicationsService,
  toggleNotificationCompletedService,
} from "../../service/api";
import { notificationWebSocket } from "../../service/notificationWebSocket";
import FormComponent from "../../shared/components/FormComponent";
import { useAlert } from "../../hooks/useAlert";
import {
  INotificationResponse,
  MessageType,
  MessageTypeLabel,
} from "../../types/Notification";
import { IMedicationResponse } from "../../types/Medication";
import {
  MainSection,
  NotificationSectionTabs,
} from "./components/NotificationSectionTabs";
import { FilterStatus } from "./components/NotificationFilterChips";
import { NotificationsListTab } from "./components/NotificationsListTab";
import { PrescriptionsListTab } from "./components/PrescriptionsListTab";

export const NotificationsScreen = () => {
  const { user: authUser } = useContext(AuthContext);
  const { showConfirm, AlertModal } = useAlert();

  // Aba principal selecionada
  const [mainSection, setMainSection] = useState<MainSection>("NOTIFICATIONS");

  // Estado de Notificações
  const [notifications, setNotifications] = useState<INotificationResponse[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifRefreshing, setNotifRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>("PENDING");

  // Estado de Medicamentos Prescritos
  const [medications, setMedications] = useState<IMedicationResponse[]>([]);
  const [medsLoading, setMedsLoading] = useState(false);
  const [medsRefreshing, setMedsRefreshing] = useState(false);

  const loadNotificationsData = async (filter: FilterStatus) => {
    try {
      setNotifLoading(true);
      let data: INotificationResponse[] = [];

      if (
        filter === "PENDING" ||
        filter === MessageType.MEDICATION ||
        filter === MessageType.GENERAL ||
        filter === MessageType.HEALTH_ALERT
      ) {
        data = await getPendingNotificationsService(0, 100);
      } else if (filter === "COMPLETED") {
        data = await getCompletedNotificationsService(0, 100);
      } else {
        data = await getNotificationsService(0, 100);
      }

      if (data && Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.log("Erro ao buscar mural de notificações:", err);
    } finally {
      setNotifLoading(false);
      setNotifRefreshing(false);
    }
  };

  const loadMedicationsData = async () => {
    try {
      setMedsLoading(true);
      const data = await listMedicationsService();
      if (data && Array.isArray(data)) {
        setMedications(data);
      }
    } catch (err) {
      console.log("Erro ao buscar prescrições de medicamentos:", err);
    } finally {
      setMedsLoading(false);
      setMedsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotificationsData(selectedFilter);
      loadMedicationsData();

      // Escuta notificações e tarefas em tempo real via WebSocket/RabbitMQ
      notificationWebSocket.connect();

      const unsubscribeNew = notificationWebSocket.onNotification(
        (newEvent: any) => {
          if (!newEvent || !newEvent.id) return;
          setNotifications((prev) => {
            const exists = prev.some((n) => n.id === newEvent.id);
            if (exists) {
              return prev.map((n) => (n.id === newEvent.id ? newEvent : n));
            }
            return [newEvent, ...prev];
          });
        },
      );

      const unsubscribeFinish = notificationWebSocket.onTaskCompleted(
        (finishEvent: any) => {
          if (!finishEvent || !finishEvent.id) return;
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === finishEvent.id
                ? {
                    ...n,
                    isCompleted: true,
                    completed: true,
                    finished: true,
                    completedByName: finishEvent.completedByName,
                  }
                : n,
            ),
          );
        },
      );

      return () => {
        unsubscribeNew();
        unsubscribeFinish();
      };
    }, [selectedFilter]),
  );

  const onRefreshNotifications = () => {
    setNotifRefreshing(true);
    loadNotificationsData(selectedFilter);
  };

  const onRefreshMedications = () => {
    setMedsRefreshing(true);
    loadMedicationsData();
  };

  const handleFilterSelect = (filter: FilterStatus) => {
    setSelectedFilter(filter);
    loadNotificationsData(filter);
  };

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr);
  };

  const parseLocalDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      return new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10),
      );
    }
    return new Date(dateStr);
  };

  const handleRequestFinish = (item: INotificationResponse) => {
    showConfirm(
      "Finalizar Tarefa",
      `Deseja realmente marcar "${item.title}" como concluída?`,
      async () => {
        if (!item?.id) return;

        if (
          selectedFilter === "PENDING" ||
          selectedFilter === MessageType.MEDICATION ||
          selectedFilter === MessageType.GENERAL ||
          selectedFilter === MessageType.HEALTH_ALERT
        ) {
          setNotifications((prev) => prev.filter((n) => n.id !== item.id));
        } else {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === item.id
                ? { ...n, isCompleted: true, completed: true, finished: true }
                : n,
            ),
          );
        }

        const userName = authUser?.name || authUser?.registration || "Usuário";
        try {
          await toggleNotificationCompletedService(item.id, userName);
        } catch (err) {
          console.log("Erro ao finalizar tarefa no backend:", err);
        }
      },
      "Finalizar",
      "Cancelar",
    );
  };

  const handleRequestFinishMedication = (item: IMedicationResponse) => {
    showConfirm(
      "Concluir Medicamento",
      `Deseja realmente marcar o tratamento de "${item.prescription}" para ${item.dogsName} como concluído?`,
      async () => {
        if (!item?.id) return;
        setMedications((prev) => prev.filter((m) => m.id !== item.id));
        try {
          await deleteMedicationService(item.id);
        } catch (err) {
          console.log("Erro ao concluir medicamento no backend:", err);
          loadMedicationsData();
        }
      },
      "Concluir",
      "Cancelar",
    );
  };

  const getMessageTypeColor = (type?: MessageType) => {
    switch (type) {
      case MessageType.MEDICATION:
        return "#00897B";
      case MessageType.GENERAL:
        return "#1E88E5";
      case MessageType.HEALTH_ALERT:
        return "#FB8C00";
      default:
        return theme.colors.primary;
    }
  };

  // Notificações filtradas
  const filteredNotifications = notifications.filter((item) => {
    let matchesType = true;
    if (
      selectedFilter === MessageType.MEDICATION ||
      selectedFilter === MessageType.GENERAL ||
      selectedFilter === MessageType.HEALTH_ALERT
    ) {
      matchesType = item.messageType === selectedFilter;
    }

    if (!matchesType) return false;
    if (!search.trim()) return true;

    const term = search.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(term);
    const msgMatch = item.message?.toLowerCase().includes(term);
    const typeMatch = item.messageType
      ? MessageTypeLabel[item.messageType]?.toLowerCase().includes(term)
      : false;
    return titleMatch || msgMatch || typeMatch;
  });

  // Medicamentos prescritos filtrados
  const filteredMedications = medications.filter((item) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const dogMatch = item.dogsName?.toLowerCase().includes(term);
    const presMatch = item.prescription?.toLowerCase().includes(term);
    return dogMatch || presMatch;
  });

  const filterChips: { label: string; value: FilterStatus }[] = [
    { label: "Pendentes", value: "PENDING" },
    { label: "Todas", value: "ALL" },
    { label: "Concluídas", value: "COMPLETED" },
    { label: "Geral", value: MessageType.GENERAL },
    { label: "Alerta de Saúde", value: MessageType.HEALTH_ALERT },
  ];

  return (
    <View style={styles.container}>
      {/* SELETOR SUPERIOR DE SEÇÃO */}
      <NotificationSectionTabs
        currentSection={mainSection}
        onSelectSection={setMainSection}
      />

      {/* BARRA DE PESQUISA */}
      <View style={styles.searchWrapper}>
        <FormComponent
          placeholder={
            mainSection === "NOTIFICATIONS"
              ? "Buscar avisos, remédios, cães..."
              : "Buscar por cão ou posologia..."
          }
          value={search}
          onChangeText={setSearch}
          leftIcon={
            <FontAwesomeFreeSolid
              name="magnifying-glass"
              size={theme.typography.fontSize.base}
              color={theme.colors.secondary}
            />
          }
        />
      </View>

      {/* CONTEÚDO: ABA DE AVISOS & TAREFAS */}
      {mainSection === "NOTIFICATIONS" ? (
        <NotificationsListTab
          filteredNotifications={filteredNotifications}
          selectedFilter={selectedFilter}
          onSelectFilter={handleFilterSelect}
          filterChips={filterChips}
          loading={notifLoading}
          refreshing={notifRefreshing}
          onRefresh={onRefreshNotifications}
          search={search}
          onRequestFinish={handleRequestFinish}
          getMessageTypeColor={getMessageTypeColor}
          parseDate={parseDate}
        />
      ) : (
        /* CONTEÚDO: ABA DE PRESCRIÇÕES DE MEDICAMENTOS */
        <PrescriptionsListTab
          filteredMedications={filteredMedications}
          loading={medsLoading}
          refreshing={medsRefreshing}
          onRefresh={onRefreshMedications}
          search={search}
          parseLocalDate={parseLocalDate}
          onFinish={handleRequestFinishMedication}
        />
      )}

      {/* MODAL DE CONFIRMAÇÃO */}
      <AlertModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
});

export default NotificationsScreen;
