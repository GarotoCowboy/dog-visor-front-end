import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../theme/theme";
import { Card } from "../../../shared/components/CardComponent";
import { IDogTest, TestStatus, TestType } from "../../../types/Training";
import { getDogImageSource } from "../../../utils/dogAvatar";
import { TestCardScoreRow, TestCardStatusBadge } from "./testCard";

interface TestItemCardProps {
  test: IDogTest;
  onPress?: () => void;
}

export const TestItemCard: React.FC<TestItemCardProps> = ({
  test,
  onPress,
}) => {
  const imageSource = getDogImageSource(test.avatarKey);
  const isCompleted = test.status === TestStatus.COMPLETED;
  const isInProgress =
    !isCompleted &&
    ((test.completedCount ?? 0) > 0 ||
      Boolean(test.score && test.score.toLowerCase().includes("andamento")) ||
      Boolean(test.description && test.description.toLowerCase().includes("andamento")));
  const isVolhard = test.type === TestType.VOLHARD;

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

  const testTitle = test.title
    ? test.title
        .replace("Teste de Aptidão Volhard", "Teste Volhard")
        .replace("Teste Comportamental", "Teste Behavior")
    : isVolhard
    ? "Teste Volhard"
    : "Teste Behavior";

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.78 : 1}
      disabled={!onPress}
      onPress={onPress}
    >
      <Card>
        <View style={styles.cardContainer}>
          {/* CABEÇALHO: AVATAR, NOME, RAÇA E BADGE DE STATUS */}
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

            <TestCardStatusBadge
              isCompleted={isCompleted}
              isInProgress={isInProgress}
            />
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
                {testTitle}
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

          {/* TREINADOR RESPONSÁVEL */}
          <View style={styles.trainerRow}>
            <MaterialDesignIcons
              name="account-tie-outline"
              size={14}
              color="#4B5563"
            />
            <Text
              style={styles.trainerText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Treinador(a): {test.trainerName || "Não identificado"}
            </Text>
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
          <TestCardScoreRow
            isCompleted={isCompleted}
            displayScore={displayScore}
            hasOnPress={Boolean(onPress)}
          />
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
  trainerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trainerText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
  },
  descriptionText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
    lineHeight: 18,
  },
});
