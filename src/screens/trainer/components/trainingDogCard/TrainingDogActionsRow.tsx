import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { ITrainingResponse } from "../../../../types/Training";

interface TrainingDogActionsRowProps {
  item: ITrainingResponse;
  isFinished: boolean;
  isMaxSessionsReached: boolean;
  onExecuteTraining: (training: ITrainingResponse) => void;
  onViewHistory: (training: ITrainingResponse) => void;
}

export const TrainingDogActionsRow: React.FC<TrainingDogActionsRowProps> = ({
  item,
  isFinished,
  isMaxSessionsReached,
  onExecuteTraining,
  onViewHistory,
}) => {
  if (isFinished) {
    return (
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.viewReportButton}
          onPress={() => onViewHistory(item)}
          activeOpacity={0.8}
        >
          <MaterialDesignIcons
            name="file-document-outline"
            size={18}
            color={theme.colors.white}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.viewReportButtonText}>
            Ver Relatório Completo
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.actionsRow}>
      <TouchableOpacity
        style={[
          styles.executeButton,
          isMaxSessionsReached && styles.executeButtonFinalizeOnly,
        ]}
        onPress={() => onExecuteTraining(item)}
        activeOpacity={0.8}
      >
        <FontAwesomeFreeSolid
          name={isMaxSessionsReached ? "flag-checkered" : "play"}
          size={12}
          color={theme.colors.white}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.executeButtonText}>
          {isMaxSessionsReached
            ? "Finalizar Etapa (21/21)"
            : "Realizar Treinamento"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => onViewHistory(item)}
        activeOpacity={0.8}
        accessibilityLabel="Ver Relatório e Histórico"
      >
        <MaterialDesignIcons
          name="chart-box-outline"
          size={20}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  viewReportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
  },
  viewReportButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
  executeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
  },
  executeButtonFinalizeOnly: {
    backgroundColor: "#16A34A",
  },
  executeButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
  historyButton: {
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});

