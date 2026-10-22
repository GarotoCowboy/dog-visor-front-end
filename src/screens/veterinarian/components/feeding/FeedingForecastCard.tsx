import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { Card } from "../../../../shared/components/CardComponent";

interface FeedingForecastCardProps {
  baseStockKg: number;
  dogDailyIntakeKg: number;
  mealQuantityGrams: number;
  mealsCount: number;
  projectedTotalDailyConsumptionKg: number;
  projectedDaysRemaining: number | null;
  loadingEstimate: boolean;
}

export const FeedingForecastCard: React.FC<FeedingForecastCardProps> = ({
  baseStockKg,
  dogDailyIntakeKg,
  mealQuantityGrams,
  mealsCount,
  projectedTotalDailyConsumptionKg,
  projectedDaysRemaining,
  loadingEstimate,
}) => {
  return (
    <View style={styles.forecastCardWrapper}>
      <Card>
        <View style={styles.forecastContent}>
          <View style={styles.forecastHeader}>
            <MaterialDesignIcons
              name="chart-timeline-variant"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.forecastTitle}>
              Previsão de Gasto Diário da Ração
            </Text>
          </View>

          {loadingEstimate ? (
            <View style={styles.forecastLoadingRow}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.forecastLoadingText}>
                Calculando estimativa de consumo...
              </Text>
            </View>
          ) : (
            <View style={styles.forecastDetailsGrid}>
              <View style={styles.forecastItem}>
                <Text style={styles.forecastItemLabel}>Estoque Atual</Text>
                <Text style={styles.forecastItemValue}>
                  {baseStockKg.toFixed(2)} kg
                </Text>
              </View>

              <View style={styles.forecastItem}>
                <Text style={styles.forecastItemLabel}>Consumo Deste Cão</Text>
                <Text style={styles.forecastItemValue}>
                  {dogDailyIntakeKg.toFixed(2)} kg/dia
                </Text>
                <Text style={styles.forecastItemSub}>
                  ({mealQuantityGrams}g x {mealsCount} ref.)
                </Text>
              </View>

              <View style={styles.forecastItem}>
                <Text style={styles.forecastItemLabel}>Gasto Diário Total</Text>
                <Text
                  style={[
                    styles.forecastItemValue,
                    styles.forecastItemValueHighlight,
                  ]}
                >
                  {projectedTotalDailyConsumptionKg.toFixed(2)} kg/dia
                </Text>
                <Text style={styles.forecastItemSub}>todos os cães</Text>
              </View>

              <View style={styles.forecastItem}>
                <Text style={styles.forecastItemLabel}>Duração Prevista</Text>
                <Text
                  style={[
                    styles.forecastItemValue,
                    projectedDaysRemaining && projectedDaysRemaining < 10
                      ? styles.forecastItemValueDanger
                      : styles.forecastItemValueSuccess,
                  ]}
                >
                  {projectedDaysRemaining !== null
                    ? `~${projectedDaysRemaining} dias`
                    : "Indeterminada"}
                </Text>
                <Text style={styles.forecastItemSub}>de estoque restante</Text>
              </View>
            </View>
          )}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  forecastCardWrapper: {
    marginTop: 4,
    marginBottom: 4,
  },
  forecastContent: {
    padding: 14,
    gap: 12,
  },
  forecastHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  forecastTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  forecastLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  forecastLoadingText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: "#6B7280",
  },
  forecastDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  forecastItem: {
    width: "48%",
    backgroundColor: "#F4F6F6",
    padding: 10,
    borderRadius: theme.borderRadius.md,
    gap: 2,
  },
  forecastItemLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: "#6B7280",
  },
  forecastItemValue: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  forecastItemValueHighlight: {
    color: theme.colors.primary,
  },
  forecastItemValueSuccess: {
    color: "#166534",
  },
  forecastItemValueDanger: {
    color: "#DC2626",
  },
  forecastItemSub: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.regular,
    color: "#9CA3AF",
  },
});
