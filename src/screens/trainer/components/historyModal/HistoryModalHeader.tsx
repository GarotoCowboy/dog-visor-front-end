import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { ITrainingResponse, TraningStatus } from "../../../../types/Training";

interface HistoryModalHeaderProps {
  training: ITrainingResponse | null;
  resolvedTrainerName?: string;
  onClose: () => void;
}

export const HistoryModalHeader: React.FC<HistoryModalHeaderProps> = ({
  training,
  resolvedTrainerName,
  onClose,
}) => {
  const subtitle =
    training?.status === TraningStatus.Apto
      ? "Treinamento Completo Concluído (Apto)"
      : training?.status === TraningStatus.Inapto
      ? "Treinamento Encerrado (Inapto)"
      : `Etapa atual do cão: ${training?.currentStage || 1} de 4`;

  return (
    <View style={styles.modalHeader}>
      <View style={styles.titleRow}>
        <MaterialDesignIcons
          name="file-document-outline"
          size={22}
          color={theme.colors.primary}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.modalTitle} numberOfLines={1}>
            Relatório • {training?.dogsName || "Cão"}
          </Text>
          <Text style={styles.modalSubtitle}>{subtitle}</Text>
          {Boolean(resolvedTrainerName || training?.trainerName) && (
            <View style={styles.headerTrainerRow}>
              <MaterialDesignIcons
                name="account-tie-outline"
                size={13}
                color="#2E6B65"
              />
              <Text style={styles.headerTrainerText} numberOfLines={1}>
                Treinador(a): {resolvedTrainerName || training?.trainerName}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
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
    gap: 10,
    flex: 1,
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
  headerTrainerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  headerTrainerText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#2E6B65",
  },
  modalCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
});

