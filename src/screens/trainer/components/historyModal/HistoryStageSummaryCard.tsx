import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { STAGE_TITLES } from "../../constants/stageExercisesData";

interface HistoryStageSummaryCardProps {
  selectedStage: number;
  rawStatus: string;
  totalSessions: number;
  progressPercent: number;
}

export const HistoryStageSummaryCard: React.FC<HistoryStageSummaryCardProps> = ({
  selectedStage,
  rawStatus,
  totalSessions,
  progressPercent,
}) => {
  return (
    <View style={styles.stageSummaryCard}>
      <View style={styles.summaryTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.stageTitleText}>
            Etapa {selectedStage}: {STAGE_TITLES[selectedStage] || "Etapa de Treino"}
          </Text>
          <Text style={styles.stageSubtitleText}>
            Controle de até 21 dias de treinamento
          </Text>
        </View>

        {rawStatus === "CONCLUIDA" ? (
          <View style={[styles.stageStatusBadge, styles.statusBadgeConcluida]}>
            <MaterialDesignIcons name="check-circle" size={12} color="#15803D" />
            <Text style={[styles.stageStatusText, { color: "#15803D" }]}>
              Concluída
            </Text>
          </View>
        ) : rawStatus === "EM_ANDAMENTO" ? (
          <View style={[styles.stageStatusBadge, styles.statusBadgeAndamento]}>
            <MaterialDesignIcons name="progress-clock" size={12} color="#B45309" />
            <Text style={[styles.stageStatusText, { color: "#B45309" }]}>
              Em Andamento
            </Text>
          </View>
        ) : (
          <View style={[styles.stageStatusBadge, styles.statusBadgeNaoIniciada]}>
            <MaterialDesignIcons name="clock-outline" size={12} color="#6B7280" />
            <Text style={[styles.stageStatusText, { color: "#6B7280" }]}>
              Não Iniciada
            </Text>
          </View>
        )}
      </View>

      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarHeader}>
          <Text style={styles.progressLabel}>
            {totalSessions} de 21 dias registrados
          </Text>
          <Text style={styles.progressLabel}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor:
                  totalSessions >= 21 ? "#059669" : theme.colors.primary,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stageSummaryCard: {
    backgroundColor: "#F8FAFC",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  stageTitleText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  stageSubtitleText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
  },
  stageStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeConcluida: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeAndamento: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeNaoIniciada: {
    backgroundColor: "#F3F4F6",
  },
  stageStatusText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
  },
  progressBarWrapper: {
    gap: 4,
  },
  progressBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#6B7280",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});

