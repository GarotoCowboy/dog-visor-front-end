import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";

interface TrainingBottomBarProps {
  bottomInset: number;
  submitting: boolean;
  onAddDog: () => void;
}

export const TrainingBottomBar: React.FC<TrainingBottomBarProps> = ({
  bottomInset,
  submitting,
  onAddDog,
}) => {
  return (
    <View
      style={[
        styles.bottomBar,
        { paddingBottom: Math.max(bottomInset, 12) },
      ]}
    >
      <TouchableOpacity
        style={styles.addTrainingButton}
        onPress={onAddDog}
        activeOpacity={0.85}
        disabled={submitting}
      >
        <MaterialDesignIcons
          name="plus-circle-outline"
          size={20}
          color={theme.colors.white}
        />
        <Text style={styles.addTrainingButtonText} numberOfLines={1}>
          Adicionar Cão para Treinamento
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    ...theme.shadows.md,
  },
  addTrainingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.md,
    gap: 8,
    ...theme.shadows.sm,
  },
  addTrainingButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
});

