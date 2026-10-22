import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../theme/theme";
import { Card } from "../../../shared/components/CardComponent";
import { IDogTest, TestStatus, TestType } from "../../../types/Training";
import { femaleDogIcons, maleDogIcons } from "../../../consts/dogIcons";

const avatarMap = [...femaleDogIcons, ...maleDogIcons].reduce(
  (acc, item) => {
    acc[item.key] = item.image;
    return acc;
  },
  {} as Record<string, any>,
);

interface TestItemCardProps {
  test: IDogTest;
  onPress?: () => void;
}

export const TestItemCard: React.FC<TestItemCardProps> = ({
  test,
  onPress,
}) => {
  const imageSource =
    (test.avatarKey && avatarMap[test.avatarKey]) ||
    maleDogIcons[0]?.image ||
    femaleDogIcons[0]?.image;
  const isCompleted = test.status === TestStatus.COMPLETED;
  const isInProgress =
    !isCompleted &&
    ((test.completedCount ?? 0) > 0 ||
      (test.score && test.score.toLowerCase().includes("andamento")) ||
      (test.description && test.description.toLowerCase().includes("andamento")));
  const isVolhard = test.type === TestType.VOLHARD;

  const statusLabel = isCompleted
    ? "Concluído"
    : isInProgress
    ? "Em andamento"
    : "Pendente";

  const statusIcon = isCompleted
    ? "check-circle-outline"
    : isInProgress
    ? "clock-outline"
    : "clock-outline";

  let displayScore = test.score || "";
  if (isInProgress) {
    if (test.completedCount != null && test.totalCount != null) {
      displayScore = `${test.completedCount}/${test.totalCount} ${
        isVolhard ? "etapas" : "aspectos"
      }`;
    } else {
      displayScore = displayScore.replace(/^Em andamento:\s*/i, "");
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.78 : 1}
      disabled={!onPress}
      onPress={onPress}
    >
      <Card>
        <View style={styles.cardContainer}>
          {/* CABEÇALHO: AVATAR (FOTO DO CÃO), NOME, RAÇA E BADGE DE STATUS */}
          <View style={styles.headerRow}>
            <View style={styles.avatarWrapper}>
              {imageSource ? (
                <Image source={imageSource} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                  <FontAwesomeFreeSolid name="dog" size={24} color="#9CA3AF" />
                </View>
              )}
            </View>

            <View style={styles.infoWrapper}>
              <Text
                style={styles.dogNameText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {test.dogsName}
              </Text>
              <Text
                style={styles.breedText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {test.dogsBreed}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                isCompleted
                  ? styles.statusBadgeCompleted
                  : isInProgress
                  ? styles.statusBadgeInProgress
                  : styles.statusBadgePending,
              ]}
            >
              <MaterialDesignIcons
                name={statusIcon}
                size={14}
                color={
                  isCompleted
                    ? "#15803D"
                    : isInProgress
                    ? "#B45309"
                    : "#6B7280"
                }
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  isCompleted
                    ? styles.statusBadgeTextCompleted
                    : isInProgress
                    ? styles.statusBadgeTextInProgress
                    : styles.statusBadgeTextPending,
                ]}
              >
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* TIPO DE TESTE E DATA */}
          <View style={styles.metaRow}>
            <View style={styles.typeBadge}>
              <MaterialDesignIcons
                name={isVolhard ? "clipboard-check-outline" : "paw"}
                size={14}
                color="#2E6B65"
              />
              <Text
                style={styles.typeBadgeText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {test.title
                  ? test.title
                      .replace("Teste de Aptidão Volhard", "Teste Volhard")
                      .replace("Teste Comportamental", "Teste Behavior")
                  : isVolhard
                  ? "Teste Volhard"
                  : "Teste Behavior"}
              </Text>
            </View>

            {test.date && (
              <View style={styles.dateRow}>
                <MaterialDesignIcons
                  name="calendar-month-outline"
                  size={14}
                  color="#6B7280"
                />
                <Text style={styles.dateText}>{test.date}</Text>
              </View>
            )}
          </View>

          {/* DESCRIÇÃO / OBSERVAÇÕES */}
          {Boolean(test.description) && (
            <Text
              style={styles.descriptionText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {test.description}
            </Text>
          )}

          {/* NOTA / SCORE / PROGRESSO */}
          {Boolean(displayScore) && (
            <View style={styles.scoreRow}>
              <View style={styles.scoreLeftWrapper}>
                <Text style={styles.scoreLabel}>
                  {isCompleted ? "Resultado:" : "Progresso:"}
                </Text>
                <Text
                  style={styles.scoreValue}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {displayScore}
                </Text>
              </View>
              {onPress && (
                <View style={styles.actionButtonWrapper}>
                  <Text
                    style={{
                      fontFamily: theme.typography.fontFamily.bold,
                      fontWeight: theme.typography.fontWeight.bold,
                      fontSize: 11,
                      color: isCompleted ? "#2E6B65" : "#B45309",
                    }}
                  >
                    {isCompleted ? "Ver / Editar" : "Continuar"}
                  </Text>
                  <MaterialDesignIcons
                    name="chevron-right"
                    size={16}
                    color={isCompleted ? "#2E6B65" : "#B45309"}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    gap: 10,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    width: 52,
    height: 52,
    flexShrink: 0,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  infoWrapper: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  dogNameText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  breedText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  statusBadgeCompleted: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeInProgress: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgePending: {
    backgroundColor: "#F3F4F6",
  },
  statusBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
  },
  statusBadgeTextCompleted: {
    color: "#15803D",
  },
  statusBadgeTextInProgress: {
    color: "#B45309",
  },
  statusBadgeTextPending: {
    color: "#4B5563",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    paddingTop: 2,
  },
  typeBadge: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  typeBadgeText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 12,
    color: "#2E6B65",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  dateText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
  },
  descriptionText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
    lineHeight: 18,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    gap: 8,
  },
  scoreLeftWrapper: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scoreLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
    flexShrink: 0,
  },
  scoreValue: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: "#2E6B65",
  },
  actionButtonWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
});
