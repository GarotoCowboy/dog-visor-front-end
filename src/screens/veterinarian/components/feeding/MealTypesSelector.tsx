import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { MealType, MealTypeLabel } from "../../../../types/FeedingPlan";

interface MealTypesSelectorProps {
  selectedMealTypes: MealType[];
  onToggleMealType: (type: MealType) => void;
}

export const MealTypesSelector: React.FC<MealTypesSelectorProps> = ({
  selectedMealTypes,
  onToggleMealType,
}) => {
  return (
    <View style={styles.fieldSection}>
      <Text style={styles.fieldLabel}>Refeições do Dia *</Text>
      <View style={styles.mealChipsRow}>
        {Object.values(MealType).map((type) => {
          const isSelected = selectedMealTypes.includes(type);
          return (
            <TouchableOpacity
              key={type}
              style={[styles.mealChip, isSelected && styles.mealChipActive]}
              onPress={() => onToggleMealType(type)}
              activeOpacity={0.7}
            >
              <MaterialDesignIcons
                name={isSelected ? "check-circle" : "circle-outline"}
                size={15}
                color={isSelected ? theme.colors.white : theme.colors.secondary}
              />
              <Text
                style={[
                  styles.mealChipText,
                  isSelected && styles.mealChipTextActive,
                ]}
              >
                {MealTypeLabel[type]}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  mealChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mealChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mealChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  mealChipText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  mealChipTextActive: {
    color: theme.colors.white,
  },
});
