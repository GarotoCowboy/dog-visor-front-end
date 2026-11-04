import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../../theme/theme";

export type ReproductionFilterMode = "ALL" | "NEXT_30_DAYS";

interface ReproductionSummaryCardsProps {
  monitoredFemalesCount: number;
  next30DaysCount: number;
  filterMode?: ReproductionFilterMode;
  onSelectFilter?: (mode: ReproductionFilterMode) => void;
}

export const ReproductionSummaryCards: React.FC<
  ReproductionSummaryCardsProps
> = ({
  monitoredFemalesCount,
  next30DaysCount,
  filterMode = "ALL",
  onSelectFilter,
}) => {
  const isAllSelected = filterMode === "ALL";
  const isNext30Selected = filterMode === "NEXT_30_DAYS";

  return (
    <View style={styles.summaryContainer}>
      <TouchableOpacity
        style={[
          styles.summaryCard,
          isAllSelected && styles.summaryCardSelectedPrimary,
        ]}
        onPress={() => onSelectFilter?.("ALL")}
        activeOpacity={0.8}
      >
        <MaterialDesignIcons
          name="dog-side"
          size={20}
          color={theme.colors.primary}
        />
        <Text
          style={[
            styles.summaryNumber,
            isAllSelected && { color: theme.colors.primary },
          ]}
        >
          {monitoredFemalesCount}
        </Text>
        <Text
          style={[
            styles.summaryLabel,
            isAllSelected && {
              color: theme.colors.primary,
              fontWeight: "bold",
            },
          ]}
        >
          Cadelas Monitoradas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.summaryCard,
          isNext30Selected && styles.summaryCardSelectedWarning,
        ]}
        onPress={() =>
          onSelectFilter?.(isNext30Selected ? "ALL" : "NEXT_30_DAYS")
        }
        activeOpacity={0.8}
      >
        <MaterialDesignIcons name="calendar-alert" size={20} color="#D97706" />
        <Text
          style={[
            styles.summaryNumber,
            isNext30Selected && { color: "#B45309" },
          ]}
        >
          {next30DaysCount}
        </Text>
        <Text
          style={[
            styles.summaryLabel,
            isNext30Selected && { color: "#B45309", fontWeight: "bold" },
          ]}
        >
          Cios Próx. 30 Dias
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 6,
    marginBottom: 4,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...theme.shadows.sm,
  },
  summaryCardSelectedPrimary: {
    backgroundColor: "#F0FDF4",
    borderColor: theme.colors.primary,
  },
  summaryCardSelectedWarning: {
    backgroundColor: "#FFFBEB",
    borderColor: "#F59E0B",
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
