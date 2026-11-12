import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

interface TestCardStatusBadgeProps {
  isCompleted: boolean;
  isInProgress: boolean;
}

export const TestCardStatusBadge: React.FC<TestCardStatusBadgeProps> = ({
  isCompleted,
  isInProgress,
}) => {
  const statusLabel = isCompleted
    ? "Concluído"
    : isInProgress
    ? "Em andamento"
    : "Não feito";

  const statusIcon = isCompleted
    ? "check-circle-outline"
    : isInProgress
    ? "clock-outline"
    : "alert-circle-outline";

  return (
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
          isCompleted ? "#15803D" : isInProgress ? "#B45309" : "#DC2626"
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
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  statusBadgeText: {
    fontFamily: "Roboto-Bold",
    fontWeight: "bold",
    fontSize: 11,
  },
  statusBadgeTextCompleted: {
    color: "#15803D",
  },
  statusBadgeTextInProgress: {
    color: "#B45309",
  },
  statusBadgeTextPending: {
    color: "#DC2626",
  },
});

