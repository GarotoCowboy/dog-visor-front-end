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
  getCompletedNotificationsService,
  getNotificationsService,
  getPendingNotificationsService,
  listMedicationsService,
  toggleNotificationCompletedService,
} from "../../service/api";
import { notificationWebSocket } from "../../service/notificationWebSocket";
import { Card } from "../../shared/components/CardComponent";
import FormComponent from "../../shared/components/FormComponent";
import { CustomAlertComponent } from "../../shared/components/CustomAlertComponent";
import {
  AudienceTypeLabel,
  INotificationResponse,
  MessageType,
  MessageTypeLabel,
  isNotificationFinished,
} from "../../types/Notification";
import { IMedicationResponse } from "../../types/Medication";

type MainSection = "NOTIFICATIONS" | "MEDICATIONS";
type FilterStatus = "PENDING" | "COMPLETED" | "ALL" | MessageType;

export const NotificationsScreen = () => {
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

  // Alerta de confirmação para finalizar tarefa
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    item: INotificationResponse | null;
  }>({
    visible: false,
    item: null,
  });

  const loadNotificationsData = async (filter = selectedFilter) => {
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
          if (selectedFilter !== "COMPLETED") {
            setNotifications((prev) => {
              if (prev.some((n) => n.id === newEvent.id)) return prev;
              return [newEvent, ...prev];
            });
          }
        },
      );

      // Quando uma tarefa é concluída em tempo real via WebSocket
      const unsubscribeCompleted = notificationWebSocket.onTaskCompleted(
        (completedEvent: any) => {
          if (!completedEvent || !completedEvent.id) return;
          const targetId = completedEvent.id;

          if (selectedFilter === "PENDING") {
            setNotifications((prev) => prev.filter((n) => n.id !== targetId));
          } else {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === targetId
                  ? { ...n, isCompleted: true, completed: true, finished: true }
                  : n,
              ),
            );
          }
        },
      );

      return () => {
        unsubscribeNew();
        unsubscribeCompleted();
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

  const parseDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  const parseLocalDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
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
    setConfirmModal({
      visible: true,
      item,
    });
  };

  const handleConfirmFinish = async () => {
    const item = confirmModal.item;
    setConfirmModal({ visible: false, item: null });

    if (!item || !item.id) return;

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

    try {
      await toggleNotificationCompletedService(item.id);
    } catch (err) {
      console.log("Erro ao finalizar tarefa no backend:", err);
    }
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

    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      item.title?.toLowerCase().includes(term) ||
      item.message?.toLowerCase().includes(term) ||
      item.createdByName?.toLowerCase().includes(term) ||
      (MessageTypeLabel[item.messageType] &&
        MessageTypeLabel[item.messageType].toLowerCase().includes(term));

    return matchesType && matchesSearch;
  });

  // Medicamentos filtrados
  const filteredMedications = medications.filter((item) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      item.dogsName?.toLowerCase().includes(term) ||
      item.prescription?.toLowerCase().includes(term)
    );
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
      {/* SELETOR SUPERIOR DE SEÇÃO (AVISOS VS MEDICAMENTOS) */}
      <View style={styles.mainTabSwitcher}>
        <TouchableOpacity
          style={[
            styles.mainTabButton,
            mainSection === "NOTIFICATIONS" && styles.mainTabButtonActive,
          ]}
          onPress={() => setMainSection("NOTIFICATIONS")}
          activeOpacity={0.7}
        >
          <FontAwesomeFreeSolid
            name="bell"
            size={14}
            color={
              mainSection === "NOTIFICATIONS"
                ? theme.colors.primary
                : theme.colors.secondary
            }
          />
          <Text
            style={[
              styles.mainTabButtonText,
              mainSection === "NOTIFICATIONS" && styles.mainTabButtonTextActive,
            ]}
          >
            Avisos & Tarefas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.mainTabButton,
            mainSection === "MEDICATIONS" && styles.mainTabButtonActive,
          ]}
          onPress={() => setMainSection("MEDICATIONS")}
          activeOpacity={0.7}
        >
          <FontAwesomeFreeSolid
            name="pills"
            size={14}
            color={
              mainSection === "MEDICATIONS"
                ? theme.colors.primary
                : theme.colors.secondary
            }
          />
          <Text
            style={[
              styles.mainTabButtonText,
              mainSection === "MEDICATIONS" && styles.mainTabButtonTextActive,
            ]}
          >
            Medicamentos Prescritos
          </Text>
        </TouchableOpacity>
      </View>

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
        <>
          {/* CHIPS DE FILTRO */}
          <View style={styles.filterContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={filterChips}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => {
                const isSelected = selectedFilter === item.value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      isSelected && styles.filterChipSelected,
                    ]}
                    onPress={() => handleFilterSelect(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* CONTADOR DE AVISOS */}
          <View style={styles.infoSummaryRow}>
            <Text style={styles.summaryText}>
              {filteredNotifications.length}{" "}
              {selectedFilter === "COMPLETED"
                ? filteredNotifications.length === 1
                  ? "aviso concluído"
                  : "avisos concluídos"
                : filteredNotifications.length === 1
                ? "aviso pendente"
                : "avisos pendentes"}
            </Text>
          </View>

          {/* LISTA DE NOTIFICAÇÕES */}
          {notifLoading && !notifRefreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Carregando avisos...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredNotifications}
              keyExtractor={(item, index) => item.id || index.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={notifRefreshing}
                  onRefresh={onRefreshNotifications}
                  colors={[theme.colors.primary]}
                />
              }
              renderItem={({ item }) => {
                const isFinished = isNotificationFinished(item);

                const evDate = parseDate(
                  item.eventDate || item.limitDate || item.createdAt,
                );
                const limDate = parseDate(item.limitDate);

                const deadline = limDate || evDate;
                const isOverdue =
                  !isFinished && deadline
                    ? deadline.getTime() < new Date().getTime()
                    : false;

                const evColor = isOverdue
                  ? "#D32F2F"
                  : isFinished
                  ? "#2E7D32"
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
                  <View style={styles.cardWrapper}>
                    <Card>
                      <View
                        style={[
                          styles.cardInnerContent,
                          isOverdue && styles.cardOverdueHighlight,
                          isFinished && styles.cardFinishedHighlight,
                        ]}
                      >
                        <View
                          style={[
                            styles.colorIndicatorBar,
                            { backgroundColor: evColor },
                          ]}
                        />

                        <View style={styles.cardMainBody}>
                          <View style={styles.topRow}>
                            {!isFinished ? (
                              <TouchableOpacity
                                style={styles.checkboxAction}
                                onPress={() => handleRequestFinish(item)}
                                activeOpacity={0.7}
                              >
                                <View
                                  style={[
                                    styles.checkboxBox,
                                    isOverdue && styles.checkboxBoxOverdue,
                                  ]}
                                />
                                <Text style={styles.checkboxLabel}>
                                  Finalizar Tarefa
                                </Text>
                              </TouchableOpacity>
                            ) : (
                              <View style={styles.checkboxAction}>
                                <View
                                  style={[
                                    styles.checkboxBox,
                                    styles.checkboxBoxDone,
                                  ]}
                                >
                                  <FontAwesomeFreeSolid
                                    name="check"
                                    size={11}
                                    color={theme.colors.white}
                                  />
                                </View>
                                <Text
                                  style={[
                                    styles.checkboxLabel,
                                    styles.checkboxLabelDone,
                                  ]}
                                >
                                  Concluído
                                </Text>
                              </View>
                            )}

                            <View style={styles.badgesContainer}>
                              {isOverdue && (
                                <View style={styles.overdueChip}>
                                  <MaterialDesignIcons
                                    name="alert-circle"
                                    size={12}
                                    color="#D32F2F"
                                  />
                                  <Text style={styles.overdueChipText}>
                                    Atrasado
                                  </Text>
                                </View>
                              )}

                              <View
                                style={[
                                  styles.typeBadge,
                                  {
                                    backgroundColor: `${evColor}15`,
                                    borderColor: evColor,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.typeBadgeText,
                                    { color: evColor },
                                  ]}
                                >
                                  {MessageTypeLabel[item.messageType] ||
                                    item.messageType}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <View style={styles.timeInfoRow}>
                            <MaterialDesignIcons
                              name="clock-outline"
                              size={14}
                              color={isOverdue ? "#D32F2F" : evColor}
                            />
                            <Text
                              style={[
                                styles.timeInfoText,
                                { color: isOverdue ? "#D32F2F" : evColor },
                              ]}
                            >
                              {timeText
                                ? `${timeText} (${fullDateText})`
                                : fullDateText}
                            </Text>
                          </View>

                          <Text
                            style={[
                              styles.eventTitle,
                              isFinished && styles.eventTitleDone,
                            ]}
                          >
                            {item.title}
                          </Text>

                          <Text style={styles.eventMessage}>
                            {item.message}
                          </Text>

                          {limDate && item.eventDate ? (
                            <View
                              style={[
                                styles.limitBox,
                                isOverdue && styles.limitBoxOverdue,
                              ]}
                            >
                              <MaterialDesignIcons
                                name={isOverdue ? "clock-alert" : "timer-sand"}
                                size={13}
                                color={
                                  isOverdue ? "#D32F2F" : theme.colors.warning
                                }
                              />
                              <Text
                                style={[
                                  styles.limitText,
                                  isOverdue && styles.limitTextOverdue,
                                ]}
                              >
                                {isOverdue ? "Prazo expirou em: " : "Expira em: "}
                                {`${limDate.getDate()}/${limDate.getMonth() + 1}/${limDate.getFullYear()} às ${String(limDate.getHours()).padStart(2, "0")}:${String(limDate.getMinutes()).padStart(2, "0")}`}
                              </Text>
                            </View>
                          ) : null}

                          <View style={styles.footerRow}>
                            {item.audienceType ? (
                              <View style={styles.audienceTag}>
                                <MaterialDesignIcons
                                  name="account-group-outline"
                                  size={12}
                                  color={theme.colors.text}
                                />
                                <Text style={styles.audienceTagText}>
                                  Para:{" "}
                                  {AudienceTypeLabel[item.audienceType] ||
                                    item.audienceType}
                                </Text>
                              </View>
                            ) : null}

                            {item.createdByName ? (
                              <Text style={styles.authorNameText}>
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
                <View style={styles.emptyBox}>
                  <MaterialDesignIcons
                    name={
                      selectedFilter === "COMPLETED"
                        ? "check-all"
                        : "bell-check-outline"
                    }
                    size={54}
                    color={theme.colors.primary}
                    style={{ opacity: 0.6 }}
                  />
                  <Text style={styles.emptyTitle}>
                    {selectedFilter === "COMPLETED"
                      ? "Nenhum histórico de tarefas concluídas"
                      : "Tudo em dia!"}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {search
                      ? "Nenhum aviso encontrado para a pesquisa informada."
                      : selectedFilter === "COMPLETED"
                      ? "As tarefas finalizadas aparecerão aqui."
                      : "Não há notificações ou tarefas pendentes no momento."}
                  </Text>
                </View>
              }
            />
          )}
        </>
      ) : (
        /* CONTEÚDO: ABA DE PRESCRIÇÕES DE MEDICAMENTOS */
        <>
          <View style={styles.infoSummaryRow}>
            <Text style={styles.summaryText}>
              {filteredMedications.length}{" "}
              {filteredMedications.length === 1
                ? "prescrição cadastrada"
                : "prescrições cadastradas"}
            </Text>
          </View>

          {medsLoading && !medsRefreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>
                Carregando prescrições de medicamentos...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredMedications}
              keyExtractor={(item, index) => item.id || index.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={medsRefreshing}
                  onRefresh={onRefreshMedications}
                  colors={[theme.colors.primary]}
                />
              }
              renderItem={({ item }) => {
                const limDate = parseLocalDate(item.limitDate);
                const isExpired = limDate
                  ? limDate.getTime() < new Date().setHours(0, 0, 0, 0)
                  : false;

                return (
                  <View style={styles.cardWrapper}>
                    <Card>
                      <View
                        style={[
                          styles.cardInnerContent,
                          isExpired && styles.cardExpiredHighlight,
                        ]}
                      >
                        <View
                          style={[
                            styles.colorIndicatorBar,
                            {
                              backgroundColor: isExpired
                                ? "#D32F2F"
                                : "#00897B",
                            },
                          ]}
                        />

                        <View style={styles.cardMainBody}>
                          <View style={styles.dogHeaderRow}>
                            <View style={styles.dogNameRow}>
                              <FontAwesomeFreeSolid
                                name="dog"
                                size={15}
                                color={theme.colors.primary}
                              />
                              <Text style={styles.dogNameText}>
                                {item.dogsName}
                              </Text>
                            </View>

                            <View
                              style={[
                                styles.typeBadge,
                                {
                                  backgroundColor: "#E0F2F1",
                                  borderColor: "#00897B",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.typeBadgeText,
                                  { color: "#00897B" },
                                ]}
                              >
                                Medicamento
                              </Text>
                            </View>
                          </View>

                          <View style={styles.medPrescriptionBox}>
                            <FontAwesomeFreeSolid
                              name="pills"
                              size={14}
                              color="#00897B"
                              style={{ marginTop: 2 }}
                            />
                            <Text style={styles.medPrescriptionText}>
                              {item.prescription}
                            </Text>
                          </View>

                          {limDate && (
                            <View
                              style={[
                                styles.medLimitRow,
                                isExpired && styles.medLimitRowExpired,
                              ]}
                            >
                              <MaterialDesignIcons
                                name={
                                  isExpired ? "alert-circle" : "calendar-clock"
                                }
                                size={14}
                                color={
                                  isExpired ? "#D32F2F" : theme.colors.text
                                }
                              />
                              <Text
                                style={[
                                  styles.medLimitText,
                                  isExpired && styles.medLimitTextExpired,
                                ]}
                              >
                                {isExpired
                                  ? "Tratamento expirou em: "
                                  : "Administrar até: "}
                                {`${limDate.getDate()}/${limDate.getMonth() + 1}/${limDate.getFullYear()}`}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </Card>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <MaterialDesignIcons
                    name="pill-off"
                    size={54}
                    color={theme.colors.text}
                    style={{ opacity: 0.3 }}
                  />
                  <Text style={styles.emptyTitle}>
                    Nenhuma prescrição encontrada
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {search
                      ? "Nenhum medicamento encontrado para a busca informada."
                      : "Não há medicamentos prescritos registrados no momento."}
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}

      {/* MODAL DE CONFIRMAÇÃO PARA FINALIZAR TAREFA */}
      <CustomAlertComponent
        visible={confirmModal.visible}
        variant="warning"
        title="Finalizar Tarefa"
        message={
          confirmModal.item
            ? `Deseja realmente marcar "${confirmModal.item.title}" como concluída? Ela será removida da lista de pendentes.`
            : "Deseja realmente concluir esta tarefa?"
        }
        confirmText="Finalizar"
        cancelText="Cancelar"
        showCancel={true}
        onConfirm={handleConfirmFinish}
        onClose={() => setConfirmModal({ visible: false, item: null })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mainTabSwitcher: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 3,
  },
  mainTabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mainTabButtonActive: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  mainTabButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary,
  },
  mainTabButtonTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  filterContainer: {
    paddingVertical: 6,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  filterChipTextSelected: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
  },
  infoSummaryRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  summaryText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  cardWrapper: {
    width: "100%",
  },
  cardInnerContent: {
    flexDirection: "row",
    overflow: "hidden",
  },
  cardOverdueHighlight: {
    backgroundColor: "#FFF8F8",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: theme.borderRadius.md,
  },
  cardFinishedHighlight: {
    opacity: 0.8,
  },
  cardExpiredHighlight: {
    backgroundColor: "#FFF8F8",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: theme.borderRadius.md,
  },
  colorIndicatorBar: {
    width: 6,
    borderTopLeftRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  cardMainBody: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkboxAction: {
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
  checkboxBoxDone: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  checkboxBoxOverdue: {
    borderColor: "#D32F2F",
  },
  checkboxLabel: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  checkboxLabelDone: {
    color: "#2E7D32",
    fontFamily: theme.typography.fontFamily.bold,
  },
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  overdueChip: {
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
  overdueChipText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: "#D32F2F",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  timeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeInfoText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xs,
  },
  eventTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  eventTitleDone: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  eventMessage: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    opacity: 0.8,
    lineHeight: 18,
  },
  limitBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  limitBoxOverdue: {
    backgroundColor: "#FFEBEE",
  },
  limitText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: "#E65100",
  },
  limitTextOverdue: {
    color: "#C62828",
    fontFamily: theme.typography.fontFamily.bold,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  audienceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  audienceTagText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: theme.colors.text,
  },
  authorNameText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: theme.colors.text,
    opacity: 0.6,
  },
  dogHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dogNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dogNameText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  medPrescriptionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#E0F2F1",
    padding: 10,
    borderRadius: 6,
    marginTop: 2,
  },
  medPrescriptionText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 18,
  },
  medLimitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  medLimitRowExpired: {
    backgroundColor: "#FFEBEE",
    padding: 6,
    borderRadius: 4,
  },
  medLimitText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: theme.colors.text,
    opacity: 0.7,
  },
  medLimitTextExpired: {
    color: "#C62828",
    fontFamily: theme.typography.fontFamily.bold,
    opacity: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    opacity: 0.7,
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
    paddingHorizontal: 32,
  },
});

export default NotificationsScreen;
