import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";

interface CreateTestFooterProps {
  onClose: () => void;
  onSave: () => void;
  disabled: boolean;
  isAllCompleted: boolean;
  currentCompletedCount: number;
  currentTotalCount: number;
}

export const CreateTestFooter: React.FC<CreateTestFooterProps> = ({
  onClose,
  onSave,
  disabled,
  isAllCompleted,
  currentCompletedCount,
  currentTotalCount,
}) => {
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Text style={styles.cancelButtonText}>Fechar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveButton, disabled && { opacity: 0.5 }]}
        onPress={onSave}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <MaterialDesignIcons
          name={isAllCompleted ? "check" : "content-save-outline"}
          size={18}
          color={theme.colors.white}
        />
        <Text style={styles.saveButtonText}>
          {isAllCompleted
            ? `Concluir Teste (${currentCompletedCount}/${currentTotalCount})`
            : `Salvar Progresso (${currentCompletedCount}/${currentTotalCount})`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
    color: "#4B5563",
  },
  saveButton: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#2E6B65",
  },
  saveButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
});

