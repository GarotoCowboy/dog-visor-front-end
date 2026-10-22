import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";

interface MealQuantityStepperProps {
  mealQuantityGrams: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const MealQuantityStepper: React.FC<MealQuantityStepperProps> = ({
  mealQuantityGrams,
  onIncrement,
  onDecrement,
}) => {
  return (
    <View style={styles.fieldSection}>
      <Text style={styles.fieldLabel}>Quantidade por Refeição (gramas) *</Text>
      <View style={styles.quantityInputRow}>
        <TouchableOpacity
          style={styles.quantityStepBtn}
          onPress={onDecrement}
          activeOpacity={0.7}
        >
          <MaterialDesignIcons
            name="minus"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <View style={styles.quantityDisplayBox}>
          <Text style={styles.quantityDisplayText}>{mealQuantityGrams} g</Text>
        </View>

        <TouchableOpacity
          style={[styles.quantityStepBtn, styles.quantityStepBtnPlus]}
          onPress={onIncrement}
          activeOpacity={0.7}
        >
          <MaterialDesignIcons
            name="plus"
            size={20}
            color={theme.colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldSection: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  quantityInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: theme.colors.white,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quantityStepBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F4F6F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  quantityStepBtnPlus: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  quantityDisplayBox: {
    minWidth: 90,
    alignItems: "center",
  },
  quantityDisplayText: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
});
