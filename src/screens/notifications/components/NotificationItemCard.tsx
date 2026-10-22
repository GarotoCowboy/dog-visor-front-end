import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../theme/theme";
import { Card } from "../../../shared/components/CardComponent";
import {
  AudienceTypeLabel,
  INotificationResponse,
  MessageType,
  MessageTypeLabel,
  isNotificationFinished,
} from "../../../types/Notification";

interface NotificationItemCardProps {
  item: INotificationResponse;
  onRequestFinish: (item: INotificationResponse) => void;
  getMessageTypeColor: (type?: MessageType) => string;
  parseDate: (dateStr?: string) => Date | null;
}

export const NotificationItemCard: React.FC<NotificationItemCardProps> = ({
  item,
  onRequestFinish,
  getMessageTypeColor,
  parseDate,
}) => {
  const isFinished = isNotificationFinished(item);

  const evDate = parseDate(item.eventDate || item.limitDate || item.createdAt);
  const limDate = parseDate(item.limitDate);

  const deadline = limDate || evDate;
  const isOverdue =
    !isFinished && deadline ? deadline.getTime() < new Date().getTime() : false;

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
            style={[styles.colorIndicatorBar, { backgroundColor: evColor }]}
          />

          <View style={styles.cardMainBody}>
            <View style={styles.topRow}>
              {!isFinished ? (
                <TouchableOpacity
                  style={styles.checkboxAction}
                  onPress={() => onRequestFinish(item)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkboxBox,
                      isOverdue && styles.checkboxBoxOverdue,
                    ]}
                  />
                  <Text style={styles.checkboxLabel}>Finalizar Tarefa</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.checkboxAction}>
                  <View style={[styles.checkboxBox, styles.checkboxBoxDone]}>
                    <FontAwesomeFreeSolid
                      name="check"
                      size={11}
                      color={theme.colors.white}
                    />
                  </View>
                  <Text
                    style={[styles.checkboxLabel, styles.checkboxLabelDone]}
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
                    <Text style={styles.overdueChipText}>Atrasado</Text>
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
                  <Text style={[styles.typeBadgeText, { color: evColor }]}>
                    {MessageTypeLabel[item.messageType] || item.messageType}
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
                {timeText ? `${timeText} (${fullDateText})` : fullDateText}
              </Text>
            </View>

            <Text
              style={[styles.eventTitle, isFinished && styles.eventTitleDone]}
            >
              {item.title}
            </Text>

            <Text style={styles.eventMessage}>{item.message}</Text>

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
                  color={isOverdue ? "#D32F2F" : theme.colors.warning}
                />
                <Text
                  style={[
                    styles.limitText,
                    isOverdue && styles.limitTextOverdue,
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

            {isFinished && item.completedByName ? (
              <View style={styles.completedInfoBox}>
                <MaterialDesignIcons
                  name="check-circle-outline"
                  size={14}
                  color="#059669"
                />
                <Text style={styles.completedInfoText}>
                  Concluído por: {item.completedByName}
                  {item.completedAt
                    ? ` em ${(() => {
                        try {
                          const d = new Date(item.completedAt);
                          if (isNaN(d.getTime())) return item.completedAt;
                          const pad = (n: number) => String(n).padStart(2, "0");
                          return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                        } catch {
                          return item.completedAt;
                        }
                      })()}`
                    : ""}
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
                    {AudienceTypeLabel[item.audienceType] || item.audienceType}
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
};

const styles = StyleSheet.create({
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
    opacity: 0.85,
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
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  checkboxLabelDone: {
    color: "#2E7D32",
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
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
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#D32F2F",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  timeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeInfoText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  eventTitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  eventTitleDone: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  eventMessage: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
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
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: "#E65100",
  },
  limitTextOverdue: {
    color: "#C62828",
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  completedInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.sm,
    marginTop: 4,
  },
  completedInfoText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#065F46",
    flex: 1,
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
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  authorNameText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    opacity: 0.6,
  },
});
