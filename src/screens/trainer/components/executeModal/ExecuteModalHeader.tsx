import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";

interface ExecuteModalHeaderProps {
  dogName?: string;
  stage: number;
  isTodaySessionRecorded: boolean;
  todaySessionNumber: number;
  nextSessionNumber: number;
  isMaxSessionsReached: boolean;
  todayFormatted: string;
  onClose: () => void;
}

export const ExecuteModalHeader: React.FC<ExecuteModalHeaderProps> = ({
  dogName,
  stage,
  isTodaySessionRecorded,
  todaySessionNumber,
  nextSessionNumber,
  isMaxSessionsReached,
  todayFormatted,
  onClose,
}) => {
  const subtitle = isTodaySessionRecorded
    ? `Atualizando Sessão de Hoje (${todaySessionNumber}/21) • Data: ${todayFormatted}`
    : isMaxSessionsReached
    ? `Etapa com 21/21 sessões concluídas`
    : `Sessão ${nextSessionNumber} de 21 • Data: ${todayFormatted}`;

  return (
    <View style={styles.modalHeader}>
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <MaterialDesignIcons
            name="school"
            size={22}
            color={theme.colors.primary}
          />
          <Text style={styles.modalTitle} numberOfLines={1}>
            {dogName || "Cão"} • Etapa {stage} de 4
          </Text>
        </View>
        <Text style={styles.modalSubtitle}>{subtitle}</Text>
      </View>

      <TouchableOpacity
        onPress={onClose}
        style={styles.modalCloseButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialDesignIcons
          name="close"
          size={22}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
});

