import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../../theme/theme";

interface ReproductionSummaryCardsProps {
  monitoredFemalesCount: number;
  next30DaysCount: number;
  totalRecords: number;
}

export const ReproductionSummaryCards: React.FC<
  ReproductionSummaryCardsProps
> = ({ monitoredFemalesCount, next30DaysCount, totalRecords }) => {
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <MaterialDesignIcons name="dog-side" size={20} color="#BE185D" />
        <Text style={styles.summaryNumber}>{monitoredFemalesCount}</Text>
        <Text style={styles.summaryLabel}>Cadelas Monitoradas</Text>
      </View>

      <View style={styles.summaryCard}>
        <MaterialDesignIcons name="calendar-alert" size={20} color="#EC4899" />
        <Text style={styles.summaryNumber}>{next30DaysCount}</Text>
        <Text style={styles.summaryLabel}>Cios Próx. 30 Dias</Text>
      </View>

      <View style={styles.summaryCard}>
        <MaterialDesignIcons
          name="format-list-checks"
          size={20}
          color={theme.colors.primary}
        />
        <Text style={styles.summaryNumber}>{totalRecords}</Text>
        <Text style={styles.summaryLabel}>Total de Registros</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    gap: 4,
    ...theme.shadows.sm,
  },
  summaryNumber: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  summaryLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },
});
