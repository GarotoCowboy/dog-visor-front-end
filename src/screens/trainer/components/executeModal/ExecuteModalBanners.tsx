import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";

interface ExecuteModalBannersProps {
  isTodaySessionRecorded: boolean;
  todaySessionNumber: number;
  isMaxSessionsReached: boolean;
  completedCount: number;
  totalExercises: number;
  progressPercent: number;
}

export const ExecuteModalBanners: React.FC<ExecuteModalBannersProps> = ({
  isTodaySessionRecorded,
  todaySessionNumber,
  isMaxSessionsReached,
  completedCount,
  totalExercises,
  progressPercent,
}) => {
  if (isTodaySessionRecorded) {
    return (
      <View style={styles.todayBanner}>
        <MaterialDesignIcons
          name="calendar-check"
          size={18}
          color="#0284C7"
        />
        <Text style={styles.todayBannerText}>
          Treinamento de hoje já registrado. As alterações atualizarão a sessão existente (Sessão {todaySessionNumber} de 21) sem criar registros duplicados.
        </Text>
      </View>
    );
  }

  if (isMaxSessionsReached) {
    return (
      <View style={styles.warningBanner}>
        <MaterialDesignIcons
          name="alert-circle"
          size={18}
          color="#B91C1C"
        />
        <Text style={styles.warningBannerText}>
          Limite máximo de 21 sessões atingido para esta etapa! Não é possível
          adicionar novos treinos diários. Avalie o cão e finalize a etapa para avançar.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.infoBanner}>
      <MaterialDesignIcons
        name="information-outline"
        size={16}
        color={theme.colors.primary}
      />
      <Text style={styles.infoBannerText}>
        Marque os exercícios cumpridos na sessão de hoje ({completedCount}/{totalExercises} - {progressPercent}%).
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  todayBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    gap: 10,
    marginBottom: 8,
  },
  todayBannerText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 12,
    color: "#0369A1",
    lineHeight: 17,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    gap: 10,
    marginBottom: 8,
  },
  warningBannerText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 12,
    color: "#B91C1C",
    lineHeight: 17,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    gap: 8,
    marginBottom: 8,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 12,
    color: "#15803D",
  },
});

