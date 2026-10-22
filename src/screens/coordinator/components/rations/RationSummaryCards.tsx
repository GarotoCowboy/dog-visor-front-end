import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";

interface RationSummaryCardsProps {
  totalDailyConsumptionAll: number;
  allDeductedToday: boolean;
  pendingBatchCount: number;
  onRequestBatchDeduction: () => void;
}

export const RationSummaryCards: React.FC<RationSummaryCardsProps> = ({
  totalDailyConsumptionAll,
  allDeductedToday,
  pendingBatchCount,
  onRequestBatchDeduction,
}) => {
  if (totalDailyConsumptionAll <= 0) return null;

  return (
    <View style={styles.batchBar}>
      <View style={styles.batchTextCol}>
        <Text style={styles.batchTitle}>Gasto Total Diário</Text>
        <Text style={styles.batchSubtitle}>
          {allDeductedToday
            ? "Todas as baixas de hoje já foram realizadas"
            : `${totalDailyConsumptionAll.toFixed(2)} kg/dia (${pendingBatchCount} pendente(s) hoje)`}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.batchBtn, allDeductedToday && styles.batchBtnDone]}
        onPress={onRequestBatchDeduction}
        activeOpacity={0.7}
      >
        <MaterialDesignIcons
          name={allDeductedToday ? "check-circle" : "calendar-check"}
          size={15}
          color={allDeductedToday ? "#15803D" : theme.colors.white}
        />
        <Text
          style={[
            styles.batchBtnText,
            allDeductedToday && styles.batchBtnTextDone,
          ]}
        >
          {allDeductedToday ? "Baixas Concluídas" : "Baixa Geral"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  batchBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  batchTextCol: {
    flex: 1,
    gap: 2,
  },
  batchTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  batchSubtitle: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.secondary,
  },
  batchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
  },
  batchBtnDone: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  batchBtnText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  batchBtnTextDone: {
    color: "#15803D",
  },
});
