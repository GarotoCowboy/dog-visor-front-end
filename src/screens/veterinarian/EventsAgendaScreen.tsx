import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";

import { theme } from "../../../theme/theme";
import {
  createNotificationService,
  getNotificationsService,
  getPendingNotificationsService,
  toggleNotificationCompletedService,
} from "../../service/api";
import { notificationWebSocket } from "../../service/notificationWebSocket";
import { Card } from "../../shared/components/CardComponent";
import { Button } from "../../shared/components/ButtonComponent";
import FormComponent from "../../shared/components/FormComponent";
import { CustomAlertComponent } from "../../shared/components/CustomAlertComponent";
import {
  AudienceType,
  AudienceTypeLabel,
  INotificationCreateRequest,
  INotificationResponse,
  MessageType,
  MessageTypeLabel,
} from "../../types/Notification";

const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEKDAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const EventsAgendaScreen = () => {
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
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formMessageType, setFormMessageType] = useState<MessageType>(
    MessageType.GENERAL,
  );
  const [formAudienceType, setFormAudienceType] = useState<AudienceType>(
    AudienceType.ALL,
  );

  // Data e hora do evento (eventDate - obrigatório)
  const [formEventDate, setFormEventDate] = useState<Date>(new Date());
  const [formEventTime, setFormEventTime] = useState<Date>(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

  // Data e hora limite (limitDate - opcional)
  const [hasLimitDate, setHasLimitDate] = useState(false);
  const [formLimitDate, setFormLimitDate] = useState<Date>(new Date());
  const [formLimitTime, setFormLimitTime] = useState<Date>(new Date());
  const [isLimitDatePickerVisible, setIsLimitDatePickerVisible] = useState(false);
  const [isLimitTimePickerVisible, setIsLimitTimePickerVisible] = useState(false);

  // Alerta customizado
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    variant: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({
    visible: false,
    variant: "success",
    title: "",
    message: "",
  });

  // Modal de confirmação para finalizar evento
  const [confirmFinishModal, setConfirmFinishModal] = useState<{
    visible: boolean;
    item: INotificationResponse | null;
  }>({
    visible: false,
    item: null,
  });

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

  // Helper para comparar apenas o dia (AAAA-MM-DD)
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const parseEventDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  // Mapeia dias do mês para o grid do calendário
  const generateMonthDays = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Dias do mês anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, lastDateOfPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= lastDateOfMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Dias do próximo mês para fechar a grade (múltiplo de 7)
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
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
      const evDate = parseEventDate(ev.eventDate || ev.limitDate || ev.createdAt);
      return evDate ? isSameDay(evDate, date) : false;
    });
  };

  const getMessageTypeColor = (type?: MessageType) => {
    switch (type) {
      case MessageType.MEDICATION:
        return "#00897B"; // Verde-azulado / Farmácia
      case MessageType.GENERAL:
        return "#1E88E5"; // Azul
      case MessageType.HEALTH_ALERT:
        return "#FB8C00"; // Laranja
      default:
        return theme.colors.primary;
    }
  };

  // Solicita confirmação para finalizar evento
  const handleToggleFinishEvent = (eventItem: INotificationResponse) => {
    setConfirmFinishModal({
      visible: true,
      item: eventItem,
    });
  };

  // Confirmação e sincronização da finalização do evento
  const handleConfirmFinishEvent = async () => {
    const item = confirmFinishModal.item;
    setConfirmFinishModal({ visible: false, item: null });

    if (!item || !item.id) return;

    // Remove do calendário / agenda local
    setEvents((prev) => prev.filter((e) => e.id !== item.id));
    setFinishedEventIds((prev) => [...prev, item.id]);

    try {
      await toggleNotificationCompletedService(item.id);
    } catch (error) {
      console.log("Aviso ao sincronizar toggle no backend:", error);
    }
  };

  // Submissão do novo evento
  const handleCreateEvent = async () => {
    if (!formTitle.trim()) {
      setAlertConfig({
        visible: true,
        variant: "warning",
        title: "Campo Obrigatório",
        message: "Por favor, informe o título do evento.",
      });
      return;
    }

    if (!formMessage.trim()) {
      setAlertConfig({
        visible: true,
        variant: "warning",
        title: "Campo Obrigatório",
        message: "Por favor, informe a descrição ou mensagem do evento.",
      });
      return;
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatIsoDate = (d: Date, t: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        t.getHours(),
      )}:${pad(t.getMinutes())}:00`;

    const payload: INotificationCreateRequest = {
      title: formTitle.trim(),
      message: formMessage.trim(),
      messageType: formMessageType,
      audienceType: formAudienceType,
      eventDate: formatIsoDate(formEventDate, formEventTime),
      ...(hasLimitDate
        ? { limitDate: formatIsoDate(formLimitDate, formLimitTime) }
        : {}),
    };

    try {
      setSubmitting(true);
      const created = await createNotificationService(payload);

      // Adiciona na lista local
      if (created) {
        setEvents((prev) => [created, ...prev]);
      } else {
        await loadNotifications();
      }

      setIsModalOpen(false);
      resetForm();

      setAlertConfig({
        visible: true,
        variant: "success",
        title: "Evento Publicado",
        message: "O evento foi criado e publicado via RabbitMQ com sucesso!",
      });
    } catch (err: any) {
      console.error("Erro ao criar notificação/evento:", err);

      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "O módulo veterinário não opera em modo offline. Verifique sua conexão com a internet e tente novamente.";

      setAlertConfig({
        visible: true,
        variant: "error",
        title: "Erro de Comunicação",
        message: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormMessage("");
    setFormMessageType(MessageType.GENERAL);
    setFormAudienceType(AudienceType.ALL);
    setFormEventDate(selectedDate);
    setFormEventTime(new Date());
    setHasLimitDate(false);
    setFormLimitDate(new Date());
    setFormLimitTime(new Date());
  };

  const displayedEvents =
    filterView === "day"
      ? getEventsForDate(selectedDate)
      : [...events].sort((a, b) => {
          const dA =
            parseEventDate(a.eventDate || a.limitDate || a.createdAt)?.getTime() || 0;
          const dB =
            parseEventDate(b.eventDate || b.limitDate || b.createdAt)?.getTime() || 0;
          return dA - dB;
        });

  return (
    <View style={styles.container}>
      {/* HEADER DO MÊS / CONTROLES GOOGLE AGENDA */}
      <View style={styles.monthHeader}>
        <View style={styles.monthTitleContainer}>
          <Text style={styles.monthTitle}>
            {MONTHS_PT[currentMonthDate.getMonth()]}{" "}
            <Text style={styles.yearText}>
              {currentMonthDate.getFullYear()}
            </Text>
          </Text>
        </View>

        <View style={styles.headerButtonsRow}>
          <TouchableOpacity
            style={styles.todayButton}
            onPress={jumpToToday}
            activeOpacity={0.7}
          >
            <Text style={styles.todayButtonText}>Hoje</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navIconButton}
            onPress={() => changeMonth("prev")}
          >
            <FontAwesomeFreeSolid
              name="chevron-left"
              size={12}
              color={theme.colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navIconButton}
            onPress={() => changeMonth("next")}
          >
            <FontAwesomeFreeSolid
              name="chevron-right"
              size={12}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* DIAS DA SEMANA */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS_PT.map((w, idx) => (
          <Text key={idx} style={styles.weekdayText}>
            {w}
          </Text>
        ))}
      </View>

      {/* GRADE DO MÊS */}
      <View style={styles.calendarGrid}>
        {generateMonthDays().map((dayItem, index) => {
          const isTodayDay = isSameDay(dayItem.date, today);
          const isSelected = isSameDay(dayItem.date, selectedDate);
          const dayEvents = getEventsForDate(dayItem.date);
          const hasEvents = dayEvents.length > 0;

          return (
            <TouchableOpacity
              key={index}
              style={styles.dayCell}
              onPress={() => {
                setSelectedDate(dayItem.date);
                setFilterView("day");
              }}
              activeOpacity={0.6}
            >
              <View
                style={[
                  styles.dayNumberWrapper,
                  isSelected && styles.selectedDayWrapper,
                  isTodayDay && !isSelected && styles.todayDayWrapper,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !dayItem.isCurrentMonth && styles.otherMonthDayText,
                    isTodayDay && !isSelected && styles.todayDayText,
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {dayItem.date.getDate()}
                </Text>
              </View>

              {/* PONTOS DE EVENTO NO DIA */}
              <View style={styles.eventDotsContainer}>
                {hasEvents &&
                  dayEvents.slice(0, 3).map((ev, i) => {
                    const isFin =
                      ev.finished ||
                      ev.completed ||
                      finishedEventIds.includes(ev.id);
                    const deadline = parseEventDate(ev.limitDate || ev.eventDate);
                    const isOver =
                      !isFin && deadline
                        ? deadline.getTime() < new Date().getTime()
                        : false;

                    return (
                      <View
                        key={i}
                        style={[
                          styles.eventDot,
                          {
                            backgroundColor: isOver
                              ? "#D32F2F"
                              : isFin
                              ? "#2E7D32"
                              : getMessageTypeColor(ev.messageType),
                          },
                        ]}
                      />
                    );
                  })}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* BARRA DE CONTROLE DA LISTA DE EVENTOS */}
      <View style={styles.agendaHeaderBar}>
        <View style={styles.agendaDateInfo}>
          <Text style={styles.agendaDateTitle}>
            {filterView === "day"
              ? `${selectedDate.getDate()} de ${
                  MONTHS_PT[selectedDate.getMonth()]
                }`
              : "Todos os Eventos"}
          </Text>
          <Text style={styles.agendaDateSubtitle}>
            {displayedEvents.length}{" "}
            {displayedEvents.length === 1 ? "evento" : "eventos"}
          </Text>
        </View>

        <View style={styles.viewToggleRow}>
          <TouchableOpacity
            style={[
              styles.viewToggleChip,
              filterView === "day" && styles.viewToggleChipActive,
            ]}
            onPress={() => setFilterView("day")}
          >
            <Text
              style={[
                styles.viewToggleChipText,
                filterView === "day" && styles.viewToggleChipTextActive,
              ]}
            >
              Dia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewToggleChip,
              filterView === "all" && styles.viewToggleChipActive,
            ]}
            onPress={() => setFilterView("all")}
          >
            <Text
              style={[
                styles.viewToggleChipText,
                filterView === "all" && styles.viewToggleChipTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
          renderItem={({ item }) => {
            const isFinished =
              item.finished ||
              item.completed ||
              finishedEventIds.includes(item.id);

            const evDate = parseEventDate(item.eventDate || item.limitDate || item.createdAt);
            const limDate = parseEventDate(item.limitDate);

            // Verifica se o evento está atrasado / expirou a data limite
            const deadlineDate = limDate || evDate;
            const isOverdue =
              !isFinished && deadlineDate
                ? deadlineDate.getTime() < new Date().getTime()
                : false;

            const evColor = isOverdue
              ? "#D32F2F" // Vermelho quando atrasado
              : isFinished
              ? "#2E7D32" // Verde quando finalizado
              : getMessageTypeColor(item.messageType);

            const timeText = evDate
              ? `${String(evDate.getHours()).padStart(2, "0")}:${String(
                  evDate.getMinutes(),
                ).padStart(2, "0")}`
              : "";
            const fullDateText = evDate
              ? `${evDate.getDate()}/${evDate.getMonth() + 1}/${evDate.getFullYear()}`
              : "";

            return (
              <View style={styles.eventCardWrapper}>
                <Card>
                  <View
                    style={[
                      styles.eventCardContent,
                      isOverdue && styles.eventCardOverdueBorder,
                      isFinished && styles.eventCardFinishedBorder,
                    ]}
                  >
                    {/* BARRA LATERAL COLORIDA */}
                    <View
                      style={[
                        styles.eventColorBar,
                        { backgroundColor: evColor },
                      ]}
                    />

                    <View style={styles.eventDetailsBody}>
                      {/* TOPO: CHECKBOX FINALIZAR + HORA/DATA + BADGES */}
                      <View style={styles.eventMetaRow}>
                        <TouchableOpacity
                          style={styles.finishCheckboxRow}
                          onPress={() => handleToggleFinishEvent(item)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.checkboxBox,
                              isFinished && styles.checkboxBoxChecked,
                              isOverdue && !isFinished && styles.checkboxBoxOverdue,
                            ]}
                          >
                            {isFinished && (
                              <FontAwesomeFreeSolid
                                name="check"
                                size={11}
                                color={theme.colors.white}
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.finishLabelText,
                              isFinished && styles.finishLabelTextChecked,
                            ]}
                          >
                            {isFinished ? "Concluído" : "Finalizar"}
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.metaBadgesRight}>
                          {isOverdue && (
                            <View style={styles.overdueBadge}>
                              <MaterialDesignIcons
                                name="alert-circle"
                                size={12}
                                color="#D32F2F"
                              />
                              <Text style={styles.overdueBadgeText}>
                                Atrasado
                              </Text>
                            </View>
                          )}

                          <View
                            style={[
                              styles.messageTypeBadge,
                              {
                                backgroundColor: `${evColor}15`,
                                borderColor: evColor,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.messageTypeBadgeText,
                                { color: evColor },
                              ]}
                            >
                              {MessageTypeLabel[item.messageType] ||
                                item.messageType}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* HORÁRIO DO EVENTO */}
                      <View style={styles.eventTimeBox}>
                        <MaterialDesignIcons
                          name="clock-outline"
                          size={14}
                          color={isOverdue ? "#D32F2F" : evColor}
                        />
                        <Text
                          style={[
                            styles.eventTimeText,
                            { color: isOverdue ? "#D32F2F" : evColor },
                          ]}
                        >
                          {timeText
                            ? `${timeText} (${fullDateText})`
                            : fullDateText}
                        </Text>
                      </View>

                      {/* TÍTULO E MENSAGEM */}
                      <Text
                        style={[
                          styles.eventTitleText,
                          isFinished && styles.eventTitleTextFinished,
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.eventMessageText}>
                        {item.message}
                      </Text>

                      {/* DATA LIMITE / ALERTA DE EXPIRAÇÃO */}
                      {limDate && item.eventDate ? (
                        <View
                          style={[
                            styles.limitDateInfoRow,
                            isOverdue && styles.limitDateInfoRowOverdue,
                          ]}
                        >
                          <MaterialDesignIcons
                            name={
                              isOverdue
                                ? "clock-alert"
                                : "timer-sand"
                            }
                            size={13}
                            color={isOverdue ? "#D32F2F" : theme.colors.warning}
                          />
                          <Text
                            style={[
                              styles.limitDateInfoText,
                              isOverdue && styles.limitDateInfoTextOverdue,
                            ]}
                          >
                            {isOverdue ? "Prazo expirou em: " : "Expira em: "}
                            {`${limDate.getDate()}/${limDate.getMonth() + 1}/${limDate.getFullYear()} às ${String(limDate.getHours()).padStart(2, "0")}:${String(limDate.getMinutes()).padStart(2, "0")}`}
                          </Text>
                        </View>
                      ) : null}

                      {/* RODAPÉ DO CARD: PÚBLICO E AUTOR */}
                      <View style={styles.eventFooterRow}>
                        {item.audienceType ? (
                          <View style={styles.audienceBadge}>
                            <MaterialDesignIcons
                              name="account-group-outline"
                              size={12}
                              color={theme.colors.text}
                            />
                            <Text style={styles.audienceBadgeText}>
                              Para:{" "}
                              {AudienceTypeLabel[item.audienceType] ||
                                item.audienceType}
                            </Text>
                          </View>
                        ) : null}

                        {item.createdByName ? (
                          <Text style={styles.authorText}>
                            Por: {item.createdByName}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </Card>
              </View>
            );
          }}
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
                Clique no botão "Novo Evento" abaixo para criar e publicar um novo evento.
              </Text>
            </View>
          }
        />
      )}

      {/* BOTÃO FLUTUANTE DE CRIAR EVENTO */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        activeOpacity={0.85}
      >
        <FontAwesomeFreeSolid name="plus" size={16} color={theme.colors.white} />
        <Text style={styles.fabButtonText}>Novo Evento</Text>
      </TouchableOpacity>

      {/* MODAL DE CRIAÇÃO DE EVENTO / NOTIFICAÇÃO (RABBITMQ) */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsModalOpen(false)}
          />
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <MaterialDesignIcons
                  name="calendar-plus"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.modalTitle}>Novo Evento na Agenda</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesomeFreeSolid
                  name="xmark"
                  size={16}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalFormBody}
            >
              {/* TÍTULO */}
              <FormComponent
                text="Título do Evento *"
                placeholder="Ex: Medicação - Thor, Vacinação..."
                value={formTitle}
                onChangeText={setFormTitle}
              />

              {/* MENSAGEM / DETALHES */}
              <FormComponent
                text="Descrição / Mensagem *"
                placeholder="Descreva detalhes do evento, dosagem, orientações ou procedimentos..."
                value={formMessage}
                onChangeText={setFormMessage}
                multiline
                numberOfLines={3}
              />

              {/* TIPO DE EVENTO (CHIPS) */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionLabel}>Tipo de Mensagem / Evento *</Text>
                <View style={styles.chipsWrapContainer}>
                  {Object.values(MessageType).map((type) => {
                    const isSelected = formMessageType === type;
                    const color = getMessageTypeColor(type);
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.formChip,
                          isSelected && {
                            backgroundColor: color,
                            borderColor: color,
                          },
                        ]}
                        onPress={() => setFormMessageType(type)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.formChipText,
                            isSelected && styles.formChipTextSelected,
                          ]}
                        >
                          {MessageTypeLabel[type]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* PÚBLICO ALVO (CHIPS) */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionLabel}>Quem pode receber o evento? *</Text>
                <View style={styles.chipsWrapContainer}>
                  {Object.values(AudienceType).map((aud) => {
                    const isSelected = formAudienceType === aud;
                    return (
                      <TouchableOpacity
                        key={aud}
                        style={[
                          styles.formChip,
                          isSelected && {
                            backgroundColor: theme.colors.primary,
                            borderColor: theme.colors.primary,
                          },
                        ]}
                        onPress={() => setFormAudienceType(aud)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.formChipText,
                            isSelected && styles.formChipTextSelected,
                          ]}
                        >
                          {AudienceTypeLabel[aud]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* DATA E HORA DO EVENTO (OBRIGATÓRIO: eventDate) */}
              <View style={styles.formSection}>
                <Text style={styles.formSectionLabel}>Data e Horário do Evento *</Text>
                <View style={styles.dateTimePickersRow}>
                  <View style={styles.dateTimeColumn}>
                    <TouchableOpacity
                      style={styles.pickerBox}
                      onPress={() => setIsDatePickerVisible(true)}
                    >
                      <MaterialDesignIcons
                        name="calendar"
                        size={18}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.pickerBoxText}>
                        {`${String(formEventDate.getDate()).padStart(
                          2,
                          "0",
                        )}/${String(formEventDate.getMonth() + 1).padStart(
                          2,
                          "0",
                        )}/${formEventDate.getFullYear()}`}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateTimeColumn}>
                    <TouchableOpacity
                      style={styles.pickerBox}
                      onPress={() => setIsTimePickerVisible(true)}
                    >
                      <MaterialDesignIcons
                        name="clock-outline"
                        size={18}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.pickerBoxText}>
                        {`${String(formEventTime.getHours()).padStart(
                          2,
                          "0",
                        )}:${String(formEventTime.getMinutes()).padStart(2, "0")}`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* TOGGLE DATA LIMITE (OPCIONAL: limitDate) */}
              <View style={styles.limitToggleContainer}>
                <View style={styles.limitToggleTextContainer}>
                  <Text style={styles.limitToggleTitle}>
                    Definir Data Limite de Expiração (Opcional)
                  </Text>
                  <Text style={styles.limitToggleSubtitle}>
                    O evento ficará vermelho e avisará atraso após essa data/hora
                  </Text>
                </View>
                <Switch
                  value={hasLimitDate}
                  onValueChange={setHasLimitDate}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.white}
                />
              </View>

              {/* CAMPOS DA DATA LIMITE */}
              {hasLimitDate && (
                <View style={styles.formSection}>
                  <Text style={styles.formSectionLabel}>Data e Horário Limite</Text>
                  <View style={styles.dateTimePickersRow}>
                    <View style={styles.dateTimeColumn}>
                      <TouchableOpacity
                        style={styles.pickerBox}
                        onPress={() => setIsLimitDatePickerVisible(true)}
                      >
                        <MaterialDesignIcons
                          name="calendar-clock"
                          size={18}
                          color={theme.colors.warning}
                        />
                        <Text style={styles.pickerBoxText}>
                          {`${String(formLimitDate.getDate()).padStart(
                            2,
                            "0",
                          )}/${String(formLimitDate.getMonth() + 1).padStart(
                            2,
                            "0",
                          )}/${formLimitDate.getFullYear()}`}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.dateTimeColumn}>
                      <TouchableOpacity
                        style={styles.pickerBox}
                        onPress={() => setIsLimitTimePickerVisible(true)}
                      >
                        <MaterialDesignIcons
                          name="clock-alert-outline"
                          size={18}
                          color={theme.colors.warning}
                        />
                        <Text style={styles.pickerBoxText}>
                          {`${String(formLimitTime.getHours()).padStart(
                            2,
                            "0",
                          )}:${String(formLimitTime.getMinutes()).padStart(2, "0")}`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* DATE/TIME PICKERS MODAIS */}
              {isDatePickerVisible && (
                <DateTimePicker
                  value={formEventDate}
                  mode="date"
                  display="default"
                  onChange={(_e: DateTimePickerChangeEvent, date?: Date) => {
                    setIsDatePickerVisible(false);
                    if (date) setFormEventDate(date);
                  }}
                />
              )}

              {isTimePickerVisible && (
                <DateTimePicker
                  value={formEventTime}
                  mode="time"
                  display="default"
                  onChange={(_e: DateTimePickerChangeEvent, time?: Date) => {
                    setIsTimePickerVisible(false);
                    if (time) setFormEventTime(time);
                  }}
                />
              )}

              {isLimitDatePickerVisible && (
                <DateTimePicker
                  value={formLimitDate}
                  mode="date"
                  display="default"
                  onChange={(_e: DateTimePickerChangeEvent, date?: Date) => {
                    setIsLimitDatePickerVisible(false);
                    if (date) setFormLimitDate(date);
                  }}
                />
              )}

              {isLimitTimePickerVisible && (
                <DateTimePicker
                  value={formLimitTime}
                  mode="time"
                  display="default"
                  onChange={(_e: DateTimePickerChangeEvent, time?: Date) => {
                    setIsLimitTimePickerVisible(false);
                    if (time) setFormLimitTime(time);
                  }}
                />
              )}

              {/* BOTÕES DO FORMULÁRIO */}
              <View style={styles.modalButtonsContainer}>
                <Button
                  text="Cancelar"
                  variant="outline"
                  onPress={() => setIsModalOpen(false)}
                />
                <Button
                  text={submitting ? "Publicando..." : "Publicar Evento"}
                  onPress={handleCreateEvent}
                  disabled={submitting}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ALERTA CUSTOMIZADO */}
      <CustomAlertComponent
        visible={alertConfig.visible}
        variant={alertConfig.variant}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />

      {/* CONFIRMAÇÃO DE FINALIZAÇÃO DE EVENTO */}
      <CustomAlertComponent
        visible={confirmFinishModal.visible}
        variant="warning"
        title="Finalizar Evento"
        message={
          confirmFinishModal.item
            ? `Deseja realmente marcar "${confirmFinishModal.item.title}" como concluído? Ele será removido da agenda.`
            : "Deseja realmente concluir este evento?"
        }
        confirmText="Finalizar"
        cancelText="Cancelar"
        showCancel={true}
        onConfirm={handleConfirmFinishEvent}
        onClose={() => setConfirmFinishModal({ visible: false, item: null })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  monthTitleContainer: {
    flex: 1,
  },
  monthTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  yearText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary,
  },
  headerButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  todayButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
  navIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  weekdaysRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dayCell: {
    width: "14.28%",
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumberWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDayWrapper: {
    backgroundColor: theme.colors.primary,
  },
  todayDayWrapper: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  dayText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  otherMonthDayText: {
    opacity: 0.25,
  },
  todayDayText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  selectedDayText: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
  },
  eventDotsContainer: {
    flexDirection: "row",
    gap: 2,
    height: 4,
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  agendaHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.background,
  },
  agendaDateInfo: {
    gap: 2,
  },
  agendaDateTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  agendaDateSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
  },
  viewToggleRow: {
    flexDirection: "row",
    gap: 6,
  },
  viewToggleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  viewToggleChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  viewToggleChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  viewToggleChipTextActive: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
  },
  eventsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
    gap: 10,
  },
  eventCardWrapper: {
    width: "100%",
  },
  eventCardContent: {
    flexDirection: "row",
    overflow: "hidden",
  },
  eventCardOverdueBorder: {
    backgroundColor: "#FFF8F8",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: theme.borderRadius.md,
  },
  eventCardFinishedBorder: {
    opacity: 0.85,
  },
  eventColorBar: {
    width: 6,
    borderTopLeftRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  eventDetailsBody: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  eventMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  finishCheckboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
  },
  checkboxBoxChecked: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  checkboxBoxOverdue: {
    borderColor: "#D32F2F",
  },
  finishLabelText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  finishLabelTextChecked: {
    color: "#2E7D32",
    fontFamily: theme.typography.fontFamily.bold,
  },
  metaBadgesRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  overdueBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: "#D32F2F",
  },
  eventTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventTimeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xs,
  },
  messageTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  messageTypeBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  eventTitleText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  eventTitleTextFinished: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  eventMessageText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    opacity: 0.8,
    lineHeight: 18,
  },
  limitDateInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  limitDateInfoRowOverdue: {
    backgroundColor: "#FFEBEE",
  },
  limitDateInfoText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: "#E65100",
  },
  limitDateInfoTextOverdue: {
    color: "#C62828",
    fontFamily: theme.typography.fontFamily.bold,
  },
  eventFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  audienceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  audienceBadgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: theme.colors.text,
  },
  authorText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: theme.colors.text,
    opacity: 0.6,
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
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContentCard: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "88%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalFormBody: {
    padding: 16,
    gap: 14,
  },
  formSection: {
    gap: 6,
  },
  formSectionLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  chipsWrapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  formChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  formChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  formChipTextSelected: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
  },
  dateTimePickersRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeColumn: {
    flex: 1,
    gap: 6,
  },
  pickerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  pickerBoxText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  limitToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  limitToggleTextContainer: {
    flex: 1,
    paddingRight: 10,
    gap: 2,
  },
  limitToggleTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  limitToggleSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: theme.colors.text,
    opacity: 0.6,
  },
  modalButtonsContainer: {
    marginTop: 8,
    gap: 10,
  },
});

export default EventsAgendaScreen;
