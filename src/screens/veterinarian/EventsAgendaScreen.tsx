import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../theme/theme";
import {
  createNotificationService,
  getPendingNotificationsService,
  toggleNotificationCompletedService,
} from "../../service/api";
import { notificationWebSocket } from "../../service/notificationWebSocket";
import { useAlert } from "../../hooks/useAlert";
import {
  INotificationCreateRequest,
  INotificationResponse,
  MessageType,
} from "../../types/Notification";
import { AgendaMonthHeader } from "./components/agenda/AgendaMonthHeader";
import {
  AgendaCalendarGrid,
  isSameDay,
  parseEventDate,
} from "./components/agenda/AgendaCalendarGrid";
import { AgendaFilterBar } from "./components/agenda/AgendaFilterBar";
import { AgendaEventCard } from "./components/agenda/AgendaEventCard";
import { CreateEventModal } from "./components/agenda/CreateEventModal";

export const EventsAgendaScreen = () => {
  const { showAlert, showConfirm, AlertModal } = useAlert();
  const today = new Date();
  const [currentMonthDate, setCurrentMonthDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState<INotificationResponse[]>([]);
  const [finishedEventIds, setFinishedEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterView, setFilterView] = useState<"day" | "all">("day");

  // Modal de Criação de Evento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getPendingNotificationsService(0, 100);
      if (data && Array.isArray(data)) {
        setEvents(data);
      }
    } catch (err) {
      console.log("Erro ao carregar notificações/eventos:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();

      // Conecta ao WebSocket do RabbitMQ para escutar eventos em tempo real
      notificationWebSocket.connect();

      const unsubscribeCreated = notificationWebSocket.onNotification(
        (newEvent: any) => {
          if (!newEvent || !newEvent.id) return;
          setEvents((prev) => {
            if (prev.some((e) => e.id === newEvent.id)) return prev;
            return [newEvent, ...prev];
          });
        },
      );

      const unsubscribeCompleted = notificationWebSocket.onTaskCompleted(
        (completedEvent: any) => {
          if (!completedEvent || !completedEvent.id) return;
          const targetId = completedEvent.id;
          const isComp = completedEvent.completed !== false;

          setFinishedEventIds((prev) =>
            isComp
              ? [...new Set([...prev, targetId])]
              : prev.filter((id) => id !== targetId),
          );

          setEvents((prev) =>
            prev.map((e) =>
              e.id === targetId
                ? { ...e, finished: isComp, completed: isComp }
                : e,
            ),
          );
        },
      );

      return () => {
        unsubscribeCreated();
        unsubscribeCompleted();
      };
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const changeMonth = (direction: "prev" | "next") => {
    setCurrentMonthDate(
      new Date(
        currentMonthDate.getFullYear(),
        currentMonthDate.getMonth() + (direction === "next" ? 1 : -1),
        1,
      ),
    );
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((ev) => {
      const evDate = parseEventDate(
        ev.eventDate || ev.limitDate || ev.createdAt,
      );
      return evDate ? isSameDay(evDate, date) : false;
    });
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

  const handleToggleFinishEvent = (eventItem: INotificationResponse) => {
    showConfirm(
      "Finalizar Evento",
      `Deseja realmente marcar "${eventItem.title}" como concluído? Ele será removido da agenda.`,
      async () => {
        if (!eventItem?.id) return;

        setEvents((prev) => prev.filter((e) => e.id !== eventItem.id));
        setFinishedEventIds((prev) => [...prev, eventItem.id]);

        try {
          await toggleNotificationCompletedService(eventItem.id);
        } catch (error) {
          console.log("Aviso ao sincronizar toggle no backend:", error);
        }
      },
      "Finalizar",
      "Cancelar",
    );
  };

  const handleCreateEvent = async (payload: INotificationCreateRequest) => {
    try {
      setSubmitting(true);
      const created = await createNotificationService(payload);

      if (created) {
        setEvents((prev) => [created, ...prev]);
      } else {
        await loadNotifications();
      }

      setIsModalOpen(false);

      showAlert(
        "success",
        "Evento Publicado",
        "O evento foi criado e publicado via RabbitMQ com sucesso!",
      );
    } catch (err: any) {
      console.error("Erro ao criar notificação/evento:", err);

      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "O módulo veterinário não opera em modo offline. Verifique sua conexão com a internet e tente novamente.";

      showAlert(
        "error",
        "Erro de Comunicação",
        errorMessage,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayedEvents =
    filterView === "day"
      ? getEventsForDate(selectedDate)
      : [...events].sort((a, b) => {
          const dA =
            parseEventDate(
              a.eventDate || a.limitDate || a.createdAt,
            )?.getTime() || 0;
          const dB =
            parseEventDate(
              b.eventDate || b.limitDate || b.createdAt,
            )?.getTime() || 0;
          return dA - dB;
        });

  return (
    <View style={styles.container}>
      {/* HEADER DO MÊS */}
      <AgendaMonthHeader
        currentMonthDate={currentMonthDate}
        onPrevMonth={() => changeMonth("prev")}
        onNextMonth={() => changeMonth("next")}
        onToday={jumpToToday}
      />

      {/* GRADE DO CALENDÁRIO */}
      <AgendaCalendarGrid
        currentMonthDate={currentMonthDate}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setFilterView("day");
        }}
        events={events}
        finishedEventIds={finishedEventIds}
        today={today}
        getMessageTypeColor={getMessageTypeColor}
      />

      {/* BARRA DE FILTROS DA LISTA */}
      <AgendaFilterBar
        selectedDate={selectedDate}
        filterView={filterView}
        onFilterChange={setFilterView}
        eventsCount={displayedEvents.length}
      />

      {/* LISTA DE EVENTOS */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedEvents}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.eventsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <AgendaEventCard
              item={item}
              finishedEventIds={finishedEventIds}
              onToggleFinish={handleToggleFinishEvent}
              getMessageTypeColor={getMessageTypeColor}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialDesignIcons
                name="calendar-blank-outline"
                size={48}
                color={theme.colors.text}
                style={{ opacity: 0.3 }}
              />
              <Text style={styles.emptyTitle}>Nenhum evento agendado</Text>
              <Text style={styles.emptySubtitle}>
                Clique no botão "Novo Evento" abaixo para criar e publicar um
                novo evento.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB - BOTÃO NOVO EVENTO */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setIsModalOpen(true)}
        activeOpacity={0.85}
      >
        <FontAwesomeFreeSolid
          name="plus"
          size={16}
          color={theme.colors.white}
        />
        <Text style={styles.fabButtonText}>Novo Evento</Text>
      </TouchableOpacity>

      {/* MODAL DE CRIAÇÃO */}
      <CreateEventModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEvent}
        submitting={submitting}
        initialDate={selectedDate}
        getMessageTypeColor={getMessageTypeColor}
        onValidationAlert={(title, message) =>
          showAlert("warning", title, message)
        }
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
  eventsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
    gap: 10,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  fabButton: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.md,
  },
  fabButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
});

export default EventsAgendaScreen;
