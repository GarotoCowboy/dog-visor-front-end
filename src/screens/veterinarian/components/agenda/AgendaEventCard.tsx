import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { Card } from "../../../../shared/components/CardComponent";
import {
  AudienceTypeLabel,
  INotificationResponse,
  MessageType,
  MessageTypeLabel,
} from "../../../../types/Notification";
import { parseEventDate } from "./AgendaCalendarGrid";

interface AgendaEventCardProps {
  item: INotificationResponse;
  finishedEventIds: string[];
  onToggleFinish: (item: INotificationResponse) => void;
  getMessageTypeColor: (type?: MessageType) => string;
}

export const AgendaEventCard: React.FC<AgendaEventCardProps> = ({
  item,
  finishedEventIds,
  onToggleFinish,
  getMessageTypeColor,
}) => {
  const isFinished =
    item.finished || item.completed || finishedEventIds.includes(item.id);

  const evDate = parseEventDate(
    item.eventDate || item.limitDate || item.createdAt,
  );
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
          <View style={[styles.eventColorBar, { backgroundColor: evColor }]} />

          <View style={styles.eventDetailsBody}>
            {/* TOPO: CHECKBOX FINALIZAR + HORA/DATA + BADGES */}
            <View style={styles.eventMetaRow}>
              <TouchableOpacity
                style={styles.finishCheckboxRow}
                onPress={() => onToggleFinish(item)}
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
                    <Text style={styles.overdueBadgeText}>Atrasado</Text>
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
                    style={[styles.messageTypeBadgeText, { color: evColor }]}
                  >
                    {MessageTypeLabel[item.messageType] || item.messageType}
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
                {timeText ? `${timeText} (${fullDateText})` : fullDateText}
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
            <Text style={styles.eventMessageText}>{item.message}</Text>

            {/* DATA LIMITE / ALERTA DE EXPIRAÇÃO */}
            {limDate && item.eventDate ? (
              <View
                style={[
                  styles.limitDateInfoRow,
                  isOverdue && styles.limitDateInfoRowOverdue,
                ]}
              >
                <MaterialDesignIcons
                  name={isOverdue ? "clock-alert" : "timer-sand"}
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
                  {`${limDate.getDate()}/${limDate.getMonth() + 1}/${limDate.getFullYear()} às ${String(
                    limDate.getHours(),
                  ).padStart(2, "0")}:${String(limDate.getMinutes()).padStart(
                    2,
                    "0",
                  )}`}
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
                    {AudienceTypeLabel[item.audienceType] || item.audienceType}
                  </Text>
                </View>
              ) : null}

              {item.createdByName ? (
                <Text style={styles.authorText}>Por: {item.createdByName}</Text>
              ) : null}
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontWeight: theme.typography.fontWeight.semiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  finishLabelTextChecked: {
    color: "#2E7D32",
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
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
    fontWeight: theme.typography.fontWeight.bold,
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
    fontWeight: theme.typography.fontWeight.bold,
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
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
  },
  eventTitleText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
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
    fontWeight: theme.typography.fontWeight.semiBold,
    fontSize: 11,
    color: "#E65100",
  },
  limitDateInfoTextOverdue: {
    color: "#C62828",
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
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
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 10,
    color: theme.colors.text,
  },
  authorText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: theme.colors.text,
    opacity: 0.6,
  },
});
