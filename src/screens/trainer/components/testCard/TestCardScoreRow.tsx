import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";

interface TestCardScoreRowProps {
  isCompleted: boolean;
  displayScore: string;
  hasOnPress?: boolean;
}

export const TestCardScoreRow: React.FC<TestCardScoreRowProps> = ({
  isCompleted,
  displayScore,
  hasOnPress,
}) => {
  if (!displayScore) return null;

  return (
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
      {hasOnPress && (
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
  );
};

const styles = StyleSheet.create({
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

