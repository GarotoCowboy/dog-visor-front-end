import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { Button } from "../../../../shared/components/ButtonComponent";

interface ExecuteModalActionsProps {
  stage: number;
  submitting: boolean;
  isTodaySessionRecorded: boolean;
  todaySessionNumber: number;
  nextSessionNumber: number;
  isMaxSessionsReached: boolean;
  onSaveDailySession: () => void;
  onConfirmApto: () => void;
  onConfirmInapto: () => void;
}

export const ExecuteModalActions: React.FC<ExecuteModalActionsProps> = ({
  stage,
  submitting,
  isTodaySessionRecorded,
  todaySessionNumber,
  nextSessionNumber,
  isMaxSessionsReached,
  onSaveDailySession,
  onConfirmApto,
  onConfirmInapto,
}) => {
  const saveButtonText = submitting
    ? isTodaySessionRecorded
      ? "Atualizando..."
      : "Gravando..."
    : isTodaySessionRecorded
    ? `Atualizar Sessão de Hoje (${todaySessionNumber}/21)`
    : `Salvar Sessão Diária (${nextSessionNumber}/21)`;

  return (
    <View style={styles.actionsContainer}>
      {(!isMaxSessionsReached || isTodaySessionRecorded) && (
        <Button
          text={saveButtonText}
          onPress={onSaveDailySession}
          disabled={submitting}
        />
      )}

      <View style={styles.finalizeRow}>
        <TouchableOpacity
          style={[
            styles.finalizeButton,
            styles.finalizeButtonApto,
            isMaxSessionsReached && { flex: 1 },
          ]}
          onPress={onConfirmApto}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <FontAwesomeFreeSolid
            name="check"
            size={14}
            color={theme.colors.white}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.finalizeButtonText}>
            {stage >= 4
              ? "Concluir Cão-Guia (Apto)"
              : `Aprovar Etapa ${stage} (Apto)`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.finalizeButton, styles.finalizeButtonInapto]}
          onPress={onConfirmInapto}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <MaterialDesignIcons
            name="close"
            size={16}
            color={theme.colors.white}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.finalizeButtonText}>Inapto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    gap: 12,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  finalizeRow: {
    flexDirection: "row",
    gap: 10,
  },
  finalizeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: theme.borderRadius.sm,
  },
  finalizeButtonApto: {
    backgroundColor: "#16A34A",
  },
  finalizeButtonInapto: {
    backgroundColor: "#DC2626",
    flex: 0.8,
  },
  finalizeButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
});

