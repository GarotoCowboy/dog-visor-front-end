import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../../theme/theme";
import { Card } from "../../../../shared/components/CardComponent";
import {
  IDogMassageResponse,
  IDogWeightResponse,
} from "../../../../types/DogHealth";

interface DogWeightAndMassageCardProps {
  dogName: string;
  weights: IDogWeightResponse[];
  massages: IDogMassageResponse[];
  loading: boolean;
}

const CHART_MAX_BAR_HEIGHT = 105;
const CHART_MIN_BAR_HEIGHT = 24;

export const DogWeightAndMassageCard: React.FC<
  DogWeightAndMassageCardProps
> = ({ dogName, weights, massages, loading }) => {
  const [activeTab, setActiveTab] = useState<"PESO" | "MASSAGENS">("PESO");

  // Ordenação cronológica (mais antigo -> mais recente) para o gráfico de peso
  const chronologicalWeights = useMemo(() => {
    return [...weights].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeA - timeB;
    });
  }, [weights]);

  // Enriquecimento com delta de variação em relação à pesagem anterior
  const enrichedWeights = useMemo(() => {
    return chronologicalWeights.map((item, idx) => {
      const weightVal = Number(item.weight) || 0;
      const prevWeight =
        idx > 0 ? Number(chronologicalWeights[idx - 1].weight) || 0 : null;
      const delta =
        prevWeight !== null
          ? Number((weightVal - prevWeight).toFixed(2))
          : null;
      return {
        ...item,
        weightVal,
        delta,
      };
    });
  }, [chronologicalWeights]);

  const descendingWeights = useMemo(() => {
    return [...enrichedWeights].reverse();
  }, [enrichedWeights]);

  const chartPoints = useMemo(() => {
    return enrichedWeights.slice(-8);
  }, [enrichedWeights]);

  const chartStats = useMemo(() => {
    if (enrichedWeights.length === 0) return null;

    const values = enrichedWeights.map((h) => h.weightVal);
    const minWeight = Math.min(...values);
    const maxWeight = Math.max(...values);
    const firstWeight = values[0];
    const latestItem = enrichedWeights[enrichedWeights.length - 1];
    const latestWeight = latestItem.weightVal;
    const lastDelta = latestItem.delta;
    const totalDelta = Number((latestWeight - firstWeight).toFixed(2));

    let trendType: "GAIN" | "LOSS" | "STABLE" = "STABLE";
    if (lastDelta !== null) {
      if (lastDelta > 0) trendType = "GAIN";
      else if (lastDelta < 0) trendType = "LOSS";
    }

    return {
      minWeight,
      maxWeight,
      firstWeight,
      latestWeight,
      lastDelta,
      totalDelta,
      trendType,
    };
  }, [enrichedWeights]);

  // Ordenação de massagens da mais recente para a mais antiga
  const sortedMassages = useMemo(() => {
    return [...massages].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [massages]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Data não informada";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.split("T")[0];
    return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`;
  };

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return "--/--";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const parts = dateStr.split("T")[0].split("-");
      return parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateStr;
    }
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  const formatDeltaText = (delta: number | null) => {
    if (delta === null) return "Inicial";
    if (delta > 0) return `+${delta.toFixed(2).replace(/\.?0+$/, "")} kg`;
    if (delta < 0) return `${delta.toFixed(2).replace(/\.?0+$/, "")} kg`;
    return "0 kg";
  };

  return (
    <Card>
      <View style={styles.container}>
        {/* TÍTULO DA SEÇÃO */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialDesignIcons
              name="clipboard-pulse-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.sectionTitle}>
              Peso & Massagens
            </Text>
          </View>
        </View>

        {/* ABAS: GRÁFICO DE PESO | HISTÓRICO DE MASSAGENS */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "PESO" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("PESO")}
            activeOpacity={0.8}
          >
            <MaterialDesignIcons
              name="chart-line"
              size={17}
              color={activeTab === "PESO" ? theme.colors.primary : "#4B5563"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "PESO" && styles.tabTextActive,
              ]}
            >
              Peso & Gráfico ({weights.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "MASSAGENS" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("MASSAGENS")}
            activeOpacity={0.8}
          >
            <MaterialDesignIcons
              name="hand-heart-outline"
              size={17}
              color={
                activeTab === "MASSAGENS" ? theme.colors.primary : "#4B5563"
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "MASSAGENS" && styles.tabTextActive,
              ]}
            >
              Massagens ({massages.length})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={{ marginVertical: 20 }}
          />
        ) : activeTab === "PESO" ? (
          <View style={styles.tabContent}>
            {chartPoints.length === 0 ? (
              <View style={styles.emptyBox}>
                <MaterialDesignIcons
                  name="scale-balance"
                  size={30}
                  color="#9CA3AF"
                />
                <Text style={styles.emptyText}>
                  Nenhuma pesagem registrada para {dogName}.
                </Text>
              </View>
            ) : (
              <>
                {/* CABEÇALHO DO GRÁFICO E TENDÊNCIA */}
                <View style={styles.chartBox}>
                  <View style={styles.chartHeaderRow}>
                    <Text style={styles.chartSubtitle}>
                      Curva de Evolução de Peso
                    </Text>

                    {chartStats && enrichedWeights.length >= 2 && (
                      <View
                        style={[
                          styles.trendBadge,
                          chartStats.trendType === "GAIN"
                            ? styles.trendGainBadge
                            : chartStats.trendType === "LOSS"
                              ? styles.trendLossBadge
                              : styles.trendStableBadge,
                        ]}
                      >
                        <MaterialDesignIcons
                          name={
                            chartStats.trendType === "GAIN"
                              ? "arrow-up-bold"
                              : chartStats.trendType === "LOSS"
                                ? "arrow-down-bold"
                                : "minus"
                          }
                          size={12}
                          color={
                            chartStats.trendType === "GAIN"
                              ? "#047857"
                              : chartStats.trendType === "LOSS"
                                ? "#B91C1C"
                                : "#4B5563"
                          }
                        />
                        <Text
                          style={[
                            styles.trendBadgeText,
                            chartStats.trendType === "GAIN"
                              ? { color: "#047857" }
                              : chartStats.trendType === "LOSS"
                                ? { color: "#B91C1C" }
                                : { color: "#4B5563" },
                          ]}
                        >
                          {chartStats.trendType === "GAIN"
                            ? "Ganhando peso"
                            : chartStats.trendType === "LOSS"
                              ? "Perdendo peso"
                              : "Peso estável"}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* RESUMO DE PESO */}
                  {chartStats && (
                    <View style={styles.statsSummaryRow}>
                      <View style={styles.statPill}>
                        <Text style={styles.statPillLabel}>Inicial</Text>
                        <Text style={styles.statPillValue}>
                          {chartStats.firstWeight.toFixed(1)} kg
                        </Text>
                      </View>

                      <View style={styles.statPill}>
                        <Text style={styles.statPillLabel}>Atual</Text>
                        <Text style={styles.statPillValue}>
                          {chartStats.latestWeight.toFixed(1)} kg
                        </Text>
                      </View>

                      <View style={styles.statPill}>
                        <Text style={styles.statPillLabel}>Variação Total</Text>
                        <Text
                          style={[
                            styles.statPillValue,
                            chartStats.totalDelta > 0
                              ? { color: "#047857" }
                              : chartStats.totalDelta < 0
                                ? { color: "#DC2626" }
                                : { color: "#374151" },
                          ]}
                        >
                          {chartStats.totalDelta > 0
                            ? `+${chartStats.totalDelta.toFixed(2).replace(/\.?0+$/, "")} kg`
                            : `${chartStats.totalDelta.toFixed(2).replace(/\.?0+$/, "")} kg`}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* BARRAS DO GRÁFICO */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.barsContainer}
                  >
                    {chartPoints.map((pt, index) => {
                      const minW = chartStats?.minWeight ?? 0;
                      const maxW = chartStats?.maxWeight ?? 1;
                      const range = maxW - minW;

                      const normalized =
                        range > 0 ? (pt.weightVal - minW) / range : 0.65;
                      const barHeight = Math.round(
                        CHART_MIN_BAR_HEIGHT +
                          normalized *
                            (CHART_MAX_BAR_HEIGHT - CHART_MIN_BAR_HEIGHT),
                      );

                      const isGain = pt.delta !== null && pt.delta > 0;
                      const isLoss = pt.delta !== null && pt.delta < 0;

                      const barColor = isGain
                        ? "#10B981"
                        : isLoss
                          ? "#EF4444"
                          : "#2E6B65";

                      return (
                        <View
                          key={pt.id || `${pt.createdAt}-${index}`}
                          style={styles.barColumn}
                        >
                          <Text
                            style={[
                              styles.barDeltaLabel,
                              isGain
                                ? { color: "#047857" }
                                : isLoss
                                  ? { color: "#DC2626" }
                                  : { color: "#6B7280" },
                            ]}
                          >
                            {pt.delta === null
                              ? "Início"
                              : pt.delta > 0
                                ? `+${pt.delta.toFixed(1)}`
                                : pt.delta.toFixed(1)}
                          </Text>

                          <Text style={styles.barWeightLabel}>
                            {pt.weightVal.toFixed(1)}kg
                          </Text>

                          <View style={styles.barTrack}>
                            <View
                              style={[
                                styles.barFill,
                                {
                                  height: barHeight,
                                  backgroundColor: barColor,
                                },
                              ]}
                            />
                          </View>

                          <Text style={styles.barDateLabel}>
                            {formatShortDate(pt.createdAt)}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* LEGENDA */}
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: "#10B981" },
                        ]}
                      />
                      <Text style={styles.legendText}>Ganhou peso</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: "#EF4444" },
                        ]}
                      />
                      <Text style={styles.legendText}>Perdeu peso</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: "#2E6B65" },
                        ]}
                      />
                      <Text style={styles.legendText}>Inicial / Estável</Text>
                    </View>
                  </View>
                </View>

                {/* HISTÓRICO DE PESAGENS */}
                <View style={styles.historyList}>
                  <Text style={styles.historyTitle}>
                    Registros de Pesagem ({descendingWeights.length})
                  </Text>
                  {descendingWeights.slice(0, 6).map((item, idx) => {
                    const isGain = item.delta !== null && item.delta > 0;
                    const isLoss = item.delta !== null && item.delta < 0;

                    return (
                      <View key={item.id || idx} style={styles.historyRow}>
                        <View style={styles.historyDateCol}>
                          <MaterialDesignIcons
                            name="calendar-clock"
                            size={15}
                            color="#6B7280"
                          />
                          <Text style={styles.historyDateText}>
                            {formatDate(item.createdAt)}
                          </Text>
                        </View>

                        <View style={styles.historyRightCol}>
                          <View
                            style={[
                              styles.deltaChip,
                              isGain
                                ? styles.deltaChipGain
                                : isLoss
                                  ? styles.deltaChipLoss
                                  : styles.deltaChipNeutral,
                            ]}
                          >
                            <MaterialDesignIcons
                              name={
                                isGain
                                  ? "trending-up"
                                  : isLoss
                                    ? "trending-down"
                                    : "minus"
                              }
                              size={12}
                              color={
                                isGain
                                  ? "#047857"
                                  : isLoss
                                    ? "#B91C1C"
                                    : "#6B7280"
                              }
                            />
                            <Text
                              style={[
                                styles.deltaChipText,
                                isGain
                                  ? { color: "#047857" }
                                  : isLoss
                                    ? { color: "#B91C1C" }
                                    : { color: "#6B7280" },
                              ]}
                            >
                              {formatDeltaText(item.delta)}
                            </Text>
                          </View>

                          <Text style={styles.historyWeightValue}>
                            {item.weightVal.toFixed(1)} kg
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        ) : (
          /* ABA: HISTÓRICO DE MASSAGENS */
          <View style={styles.tabContent}>
            {sortedMassages.length === 0 ? (
              <View style={styles.emptyBox}>
                <MaterialDesignIcons
                  name="hand-heart-outline"
                  size={30}
                  color="#9CA3AF"
                />
                <Text style={styles.emptyText}>
                  Nenhuma sessão de massagem registrada para {dogName}.
                </Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                <View style={styles.massageSummaryBanner}>
                  <MaterialDesignIcons
                    name="hand-heart"
                    size={18}
                    color="#2E6B65"
                  />
                  <Text style={styles.massageSummaryText}>
                    Total de {sortedMassages.length}{" "}
                    {sortedMassages.length === 1
                      ? "sessão realizada"
                      : "sessões realizadas"}
                  </Text>
                </View>

                {sortedMassages.map((item, idx) => (
                  <View key={item.id || idx} style={styles.massageCard}>
                    <View style={styles.massageHeaderRow}>
                      <View style={styles.historyDateCol}>
                        <MaterialDesignIcons
                          name="calendar-check-outline"
                          size={15}
                          color="#2E6B65"
                        />
                        <Text style={styles.massageDateText}>
                          {formatDate(item.createdAt)}
                        </Text>
                      </View>
                      <View style={styles.massageDoneBadge}>
                        <Text style={styles.massageDoneBadgeText}>
                          Realizada
                        </Text>
                      </View>
                    </View>

                    {item.observations ? (
                      <Text style={styles.massageObsText}>
                        {item.observations}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: theme.borderRadius.md,
    padding: 3,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.white,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  tabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
  },
  tabTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  tabContent: {
    gap: 12,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 6,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    textAlign: "center",
  },
  chartBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  chartHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  chartSubtitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12.5,
    color: "#1F2937",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  trendGainBadge: {
    backgroundColor: "#ECFDF5",
    borderColor: "#6EE7B7",
  },
  trendLossBadge: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  trendStableBadge: {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
  },
  trendBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10.5,
  },
  statsSummaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  statPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  statPillLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: "#6B7280",
  },
  statPillValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12.5,
    color: "#1F2937",
    marginTop: 2,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
    paddingTop: 6,
    paddingBottom: 4,
    paddingHorizontal: 6,
    minWidth: "100%",
    justifyContent: "space-around",
  },
  barColumn: {
    alignItems: "center",
    minWidth: 42,
  },
  barDeltaLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 9.5,
    marginBottom: 2,
  },
  barWeightLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10.5,
    color: "#1F2937",
    marginBottom: 5,
  },
  barTrack: {
    height: CHART_MAX_BAR_HEIGHT,
    width: 20,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 8,
  },
  barDateLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 10,
    color: "#6B7280",
    marginTop: 5,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10.5,
    color: "#6B7280",
  },
  historyList: {
    gap: 8,
  },
  historyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: "#374151",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyDateCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyDateText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: "#4B5563",
  },
  historyRightCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deltaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  deltaChipGain: {
    backgroundColor: "#ECFDF5",
  },
  deltaChipLoss: {
    backgroundColor: "#FEF2F2",
  },
  deltaChipNeutral: {
    backgroundColor: "#F3F4F6",
  },
  deltaChipText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10.5,
  },
  historyWeightValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12.5,
    color: "#2E6B65",
    minWidth: 46,
    textAlign: "right",
  },
  massageSummaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  massageSummaryText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: "#2E6B65",
  },
  massageCard: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 4,
  },
  massageHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  massageDateText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: "#1F2937",
  },
  massageDoneBadge: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  massageDoneBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: "#047857",
  },
  massageObsText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#4B5563",
    marginTop: 2,
  },
});

