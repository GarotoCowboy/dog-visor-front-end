import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { Card } from "../../../../shared/components/CardComponent";
import { Button } from "../../../../shared/components/ButtonComponent";
import {
  ERATION_STATUS,
  IRationConsumptionEstimateResponse,
  IRationResponse,
} from "../../../../types/Ration";

interface RationItemCardProps {
  item: IRationResponse;
  estimate?: IRationConsumptionEstimateResponse;
  todayStr: string;
  onPressDetails: () => void;
  onRequestDailyDeduction: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onDelete: () => void;
}

export const RationItemCard: React.FC<RationItemCardProps> = ({
  item,
  estimate,
  todayStr,
  onPressDetails,
  onRequestDailyDeduction,
  onIncrease,
  onDecrease,
  onDelete,
}) => {
  const percent = (() => {
    if (!item.totalRationQuantity || item.totalRationQuantity === 0) return 0;
    const p = (item.currentRationQuantity / item.totalRationQuantity) * 100;
    return Math.min(Math.max(p, 0), 100);
  })();

  const getStatusStyle = (p: number) => {
    if (p > 60) return styles.currentRationNormalView;
    if (p < 25) return styles.currentRationLowView;
    return styles.currentRationWarningView;
  };

  const dailyKg =
    estimate?.totalDailyConsumptionKg ?? estimate?.dailyConsumptionKg ?? 0;
  const daysRemaining = estimate?.estimatedDaysRemaining;
  const isAppliedToday = Boolean(
    estimate?.dailyDeductionAppliedToday ||
      (item.lastDailyDeductionDate &&
        item.lastDailyDeductionDate === todayStr),
  );

  return (
    <TouchableOpacity onPress={onPressDetails} activeOpacity={0.85}>
      <View style={styles.cardContainer}>
        <Card>
          <View style={styles.rowContainer}>
            <View style={styles.leftColumn}>
              <View style={styles.iconWrapper}>
                <FontAwesomeFreeSolid
                  name="box-open"
                  size={theme.typography.fontSize.xl}
                  color={theme.colors.primary}
                />
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.name}</Text>
              </View>

              <Text style={styles.paragraph}>
                Tipo:{" "}
                {item.rationType === ERATION_STATUS.NORMAL
                  ? "Normal"
                  : item.rationType === ERATION_STATUS.SPECIAL
                  ? "Especial"
                  : "Filhote"}
              </Text>

              <Text style={styles.paragraph}>
                Estoque:{" "}
                {Number(item.currentRationQuantity || 0).toFixed(2)} Kg
              </Text>

              {/* PREVISÃO DE GASTO DIÁRIO */}
              <View style={styles.forecastInfoBox}>
                <View style={styles.forecastRow}>
                  <MaterialDesignIcons
                    name="scale"
                    size={13}
                    color={dailyKg > 0 ? theme.colors.primary : "#9CA3AF"}
                  />
                  <Text style={styles.forecastLabel}>Gasto Diário:</Text>
                  <Text
                    style={[
                      styles.forecastValue,
                      dailyKg > 0
                        ? styles.forecastValueActive
                        : styles.forecastValueMuted,
                    ]}
                  >
                    {dailyKg > 0
                      ? `${dailyKg.toFixed(2)} kg/dia`
                      : "Sem consumo previsto"}
                  </Text>
                  {isAppliedToday && (
                    <View style={styles.appliedBadge}>
                      <MaterialDesignIcons
                        name="check"
                        size={11}
                        color="#15803D"
                      />
                      <Text style={styles.appliedBadgeText}>Feita hoje</Text>
                    </View>
                  )}
                </View>

                {daysRemaining !== undefined && daysRemaining !== null && (
                  <View style={styles.forecastRow}>
                    <MaterialDesignIcons
                      name="clock-outline"
                      size={13}
                      color={
                        daysRemaining < 10 ? "#DC2626" : theme.colors.secondary
                      }
                    />
                    <Text style={styles.forecastLabel}>Duração prevista:</Text>
                    <Text
                      style={[
                        styles.forecastValue,
                        daysRemaining < 10 && styles.forecastValueDanger,
                      ]}
                    >
                      ~{Math.floor(daysRemaining)} dias
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.statusBar,
                  getStatusStyle(percent),
                  { width: `${percent}%` },
                ]}
              />
            </View>
          </View>

          <View style={[styles.rowContainer, styles.actionButtonsContainer]}>
            {/* BOTÃO DE BAIXA DIÁRIA */}
            <TouchableOpacity
              style={[
                styles.dailyDeductBtn,
                isAppliedToday
                  ? styles.dailyDeductBtnApplied
                  : dailyKg <= 0
                  ? styles.dailyDeductBtnDisabled
                  : null,
              ]}
              disabled={isAppliedToday || dailyKg <= 0}
              onPress={onRequestDailyDeduction}
              activeOpacity={0.7}
            >
              <MaterialDesignIcons
                name={isAppliedToday ? "check-circle" : "tray-minus"}
                size={14}
                color={
                  isAppliedToday
                    ? "#15803D"
                    : dailyKg > 0
                    ? theme.colors.white
                    : "#9CA3AF"
                }
              />
              <Text
                style={[
                  styles.dailyDeductBtnText,
                  isAppliedToday
                    ? styles.dailyDeductBtnTextApplied
                    : dailyKg <= 0
                    ? styles.dailyDeductBtnTextDisabled
                    : null,
                ]}
              >
                {isAppliedToday ? "Baixa Realizada" : "Baixa Diária"}
              </Text>
            </TouchableOpacity>

            <Button onPress={onIncrease} variant="primary">
              <FontAwesomeFreeSolid
                name="add"
                size={8}
                color={theme.colors.accent}
              />
            </Button>

            <Button onPress={onDecrease} variant="primary">
              <FontAwesomeFreeSolid
                name="minus"
                size={8}
                color={theme.colors.accent}
              />
            </Button>

            <Button onPress={onDelete} variant="warning">
              <FontAwesomeFreeSolid
                name="trash"
                size={8}
                color={theme.colors.accent}
              />
            </Button>
          </View>
        </Card>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 6,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftColumn: {
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  paragraph: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.secondary,
  },
  forecastInfoBox: {
    backgroundColor: "#F9FAFB",
    padding: 8,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
    marginTop: 2,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  forecastRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  forecastLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.secondary,
  },
  forecastValue: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  forecastValueActive: {
    color: theme.colors.primary,
  },
  forecastValueMuted: {
    color: "#9CA3AF",
    fontFamily: theme.typography.fontFamily.regular,
  },
  forecastValueDanger: {
    color: "#DC2626",
  },
  appliedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  appliedBadgeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#15803D",
  },
  statusBar: {
    height: 4,
    borderRadius: theme.borderRadius.full,
    marginTop: 4,
  },
  currentRationNormalView: {
    backgroundColor: theme.colors.primary,
  },
  currentRationWarningView: {
    backgroundColor: "#F59E0B",
  },
  currentRationLowView: {
    backgroundColor: "#EF4444",
  },
  actionButtonsContainer: {
    marginTop: 12,
    justifyContent: "flex-end",
    gap: 8,
  },
  dailyDeductBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    marginRight: "auto",
  },
  dailyDeductBtnApplied: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  dailyDeductBtnDisabled: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dailyDeductBtnText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  dailyDeductBtnTextApplied: {
    color: "#15803D",
  },
  dailyDeductBtnTextDisabled: {
    color: "#9CA3AF",
  },
});
