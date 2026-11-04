import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../theme/theme";
import { IDogResponse } from "../../../types/Dog";
import { IDogWeightResponse } from "../../../types/DogHealth";
import { listDogWeightsByDogIdService } from "../../../service/api";

interface PuppyWeighingModalProps {
  visible: boolean;
  dog: IDogResponse | null;
  currentWeight?: number | null;
  submitting: boolean;
  onClose: () => void;
  onSaveWeight: (dogId: string, weight: number) => Promise<void>;
}

const CHART_MAX_BAR_HEIGHT = 110;
const CHART_MIN_BAR_HEIGHT = 24;

export const PuppyWeighingModal: React.FC<PuppyWeighingModalProps> = ({
  visible,
  dog,
  currentWeight,
  submitting,
  onClose,
  onSaveWeight,
}) => {
  const [weightInput, setWeightInput] = useState("");
  const [history, setHistory] = useState<IDogWeightResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [savedBannerText, setSavedBannerText] = useState<string | null>(null);

  const fetchWeightHistory = useCallback(async (dogId: string) => {
    setLoadingHistory(true);
    try {
      const res = await listDogWeightsByDogIdService(dogId);
      setHistory(Array.isArray(res) ? res : []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (visible && dog) {
      setSavedBannerText(null);
      setWeightInput(
        currentWeight !== undefined && currentWeight !== null
          ? String(currentWeight)
          : "",
      );
      fetchWeightHistory(dog.ID);
    } else {
      setWeightInput("");
      setHistory([]);
      setSavedBannerText(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, dog?.ID, fetchWeightHistory]);

  const parsedWeight = Number(weightInput.replace(",", ".").trim());
  const isValid = Number.isFinite(parsedWeight) && parsedWeight > 0;

  // Ordena do mais antigo para o mais recente para o gráfico e cálculo de evolução
  const chronologicalHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeA - timeB;
    });
  }, [history]);

  // Enriquecimento de cada registro com a diferença (delta) em relação à pesagem anterior
  const enrichedHistory = useMemo(() => {
    return chronologicalHistory.map((item, idx) => {
      const weightVal = Number(item.weight) || 0;
      const prevWeight =
        idx > 0 ? Number(chronologicalHistory[idx - 1].weight) || 0 : null;
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
  }, [chronologicalHistory]);

  // Lista do mais recente para o mais antigo para exibição no histórico
  const descendingHistory = useMemo(() => {
    return [...enrichedHistory].reverse();
  }, [enrichedHistory]);

  // Pontos exibidos no gráfico (últimas 8 pesagens em ordem cronológica)
  const chartPoints = useMemo(() => {
    return enrichedHistory.slice(-8);
  }, [enrichedHistory]);

  // Estatísticas do gráfico e tendência atual
  const chartStats = useMemo(() => {
    if (enrichedHistory.length === 0) return null;

    const weights = enrichedHistory.map((h) => h.weightVal);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const firstWeight = weights[0];
    const latestItem = enrichedHistory[enrichedHistory.length - 1];
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
  }, [enrichedHistory]);

  // Prévia de ganho/perda ao digitar um novo peso no input
  const inputPreviewDelta = useMemo(() => {
    if (!isValid || !chartStats) return null;
    const diff = Number((parsedWeight - chartStats.latestWeight).toFixed(2));
    return diff;
  }, [isValid, parsedWeight, chartStats]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.split("T")[0];
    return d.toLocaleDateString("pt-BR");
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

  const handleConfirmSave = async () => {
    if (!dog || !isValid) return;
    try {
      await onSaveWeight(dog.ID, parsedWeight);
      setSavedBannerText(
        `Pesagem de ${parsedWeight.toFixed(1)} kg registrada com sucesso! Gráfico atualizado.`,
      );
      await fetchWeightHistory(dog.ID);
    } catch {
      // Erro já tratado pelo callback onSaveWeight
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalCard}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBox}>
                <MaterialDesignIcons
                  name="scale-balance"
                  size={20}
                  color="#2E6B65"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  Pesagem • {dog?.name || "Filhote"}
                </Text>
                <Text style={styles.subtitle}>
                  Registre o peso e acompanhe a curva de crescimento
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialDesignIcons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {savedBannerText ? (
              <View style={[styles.previewDeltaBanner, styles.previewGainBg]}>
                <MaterialDesignIcons
                  name="check-circle"
                  size={16}
                  color="#047857"
                />
                <Text style={[styles.previewDeltaText, styles.previewGainText]}>
                  {savedBannerText}
                </Text>
              </View>
            ) : null}

            {/* INPUT DE NOVA PESAGEM */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Novo Peso (kg) *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 1.4"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={weightInput}
                  onChangeText={(txt) => {
                    setSavedBannerText(null);
                    setWeightInput(txt);
                  }}
                />
                <Text style={styles.unitBadge}>kg</Text>
              </View>

              {/* PRÉVIA EM TEMPO REAL DO NOVO PESO */}
              {inputPreviewDelta !== null && (
                <View
                  style={[
                    styles.previewDeltaBanner,
                    inputPreviewDelta > 0
                      ? styles.previewGainBg
                      : inputPreviewDelta < 0
                        ? styles.previewLossBg
                        : styles.previewStableBg,
                  ]}
                >
                  <MaterialDesignIcons
                    name={
                      inputPreviewDelta > 0
                        ? "trending-up"
                        : inputPreviewDelta < 0
                          ? "trending-down"
                          : "trending-neutral"
                    }
                    size={16}
                    color={
                      inputPreviewDelta > 0
                        ? "#047857"
                        : inputPreviewDelta < 0
                          ? "#B91C1C"
                          : "#374151"
                    }
                  />
                  <Text
                    style={[
                      styles.previewDeltaText,
                      inputPreviewDelta > 0
                        ? styles.previewGainText
                        : inputPreviewDelta < 0
                          ? styles.previewLossText
                          : styles.previewStableText,
                    ]}
                  >
                    {inputPreviewDelta > 0
                      ? `Ganhando +${inputPreviewDelta.toFixed(2).replace(/\.?0+$/, "")} kg em relação ao último peso (${chartStats?.latestWeight.toFixed(1)} kg)`
                      : inputPreviewDelta < 0
                        ? `Perdendo ${inputPreviewDelta.toFixed(2).replace(/\.?0+$/, "")} kg em relação ao último peso (${chartStats?.latestWeight.toFixed(1)} kg)`
                        : `Mesmo peso da última pesagem (${chartStats?.latestWeight.toFixed(1)} kg)`}
                  </Text>
                </View>
              )}
            </View>

            {/* GRÁFICO DE EVOLUÇÃO DE PESO */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeaderRow}>
                <View style={styles.chartTitleGroup}>
                  <MaterialDesignIcons
                    name="chart-line"
                    size={18}
                    color="#2E6B65"
                  />
                  <Text style={styles.chartTitle}>
                    Gráfico de Evolução de Peso
                  </Text>
                </View>

                {chartStats && enrichedHistory.length >= 2 && (
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
                      size={13}
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
                          ? styles.trendGainText
                          : chartStats.trendType === "LOSS"
                            ? styles.trendLossText
                            : styles.trendStableText,
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

              {loadingHistory ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ marginVertical: 20 }}
                />
              ) : chartPoints.length === 0 ? (
                <View style={styles.emptyChartBox}>
                  <MaterialDesignIcons
                    name="chart-bar"
                    size={32}
                    color="#9CA3AF"
                  />
                  <Text style={styles.emptyText}>
                    Registre a primeira pesagem para visualizar o gráfico de
                    evolução de peso.
                  </Text>
                </View>
              ) : (
                <>
                  {/* RESUMO RÁPIDO (INICIAL, ATUAL, VARIAÇÃO TOTAL) */}
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

                  {/* ÁREA DAS BARRAS DE EVOLUÇÃO */}
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
                          {/* DELTA ACIMA DO PESO */}
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

                          {/* PESO NO TOPO DA BARRA */}
                          <Text style={styles.barWeightLabel}>
                            {pt.weightVal.toFixed(1)}kg
                          </Text>

                          {/* TRACK DA BARRA */}
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

                          {/* DATA NA BASE */}
                          <Text style={styles.barDateLabel}>
                            {formatShortDate(pt.createdAt)}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* LEGENDA DO GRÁFICO */}
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
                </>
              )}
            </View>

            {/* LISTA DE HISTÓRICO DE PESAGENS */}
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>
                Histórico de Pesagens ({descendingHistory.length})
              </Text>
              {loadingHistory ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ marginVertical: 12 }}
                />
              ) : descendingHistory.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhuma pesagem anterior registrada para este filhote.
                </Text>
              ) : (
                descendingHistory.slice(0, 10).map((item, idx) => {
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
                        <Text style={styles.historyDate}>
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

                        <Text style={styles.historyWeight}>
                          {item.weightVal.toFixed(1)} kg
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelBtnText}>Fechar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!isValid || submitting) && { opacity: 0.5 },
              ]}
              disabled={!isValid || submitting || !dog}
              onPress={handleConfirmSave}
            >
              <MaterialDesignIcons name="check" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {submitting ? "Salvando..." : "Salvar Pesagem"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 16,
    color: "#1F2937",
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 20,
    gap: 18,
  },
  inputSection: {
    gap: 8,
  },
  label: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: "#374151",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#F9FAFB",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#1F2937",
  },
  unitBadge: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 14,
    color: "#2E6B65",
  },
  previewDeltaBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewGainBg: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  previewLossBg: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  previewStableBg: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  previewDeltaText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11.5,
    flex: 1,
  },
  previewGainText: {
    color: "#047857",
  },
  previewLossText: {
    color: "#B91C1C",
  },
  previewStableText: {
    color: "#374151",
  },
  chartCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
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
  chartTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chartTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13.5,
    color: "#1F2937",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 11,
  },
  trendGainText: {
    color: "#047857",
  },
  trendLossText: {
    color: "#B91C1C",
  },
  trendStableText: {
    color: "#4B5563",
  },
  emptyChartBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 6,
  },
  statsSummaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  statPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  statPillLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10.5,
    color: "#6B7280",
  },
  statPillValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: "#1F2937",
    marginTop: 2,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 6,
    minWidth: "100%",
    justifyContent: "space-around",
  },
  barColumn: {
    alignItems: "center",
    minWidth: 44,
  },
  barDeltaLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    marginBottom: 2,
  },
  barWeightLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#1F2937",
    marginBottom: 6,
  },
  barTrack: {
    height: CHART_MAX_BAR_HEIGHT,
    width: 22,
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
    fontSize: 10.5,
    color: "#6B7280",
    marginTop: 6,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
  },
  historySection: {
    gap: 8,
  },
  historyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: "#374151",
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
    textAlign: "center",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyDateCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyDate: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
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
    paddingHorizontal: 7,
    paddingVertical: 3,
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
    fontSize: 11,
  },
  historyWeight: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13.5,
    color: "#2E6B65",
    minWidth: 50,
    textAlign: "right",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
  },
  cancelBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 13,
    color: "#4B5563",
  },
  saveBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2E6B65",
  },
  saveBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: "#FFFFFF",
  },
});
