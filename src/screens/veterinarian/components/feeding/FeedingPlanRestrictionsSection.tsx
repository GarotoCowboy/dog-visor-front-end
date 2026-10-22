import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../../theme/theme";
import FormComponent from "../../../../shared/components/FormComponent";

interface FeedingPlanRestrictionsSectionProps {
  dietaryRestriction: string;
  setDietaryRestriction: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
}

export const FeedingPlanRestrictionsSection: React.FC<
  FeedingPlanRestrictionsSectionProps
> = ({
  dietaryRestriction,
  setDietaryRestriction,
  notes,
  setNotes,
}) => {
  return (
    <>
      <View style={styles.fieldSection}>
        <View style={styles.labelWithIconRow}>
          <MaterialDesignIcons
            name="alert-circle-outline"
            size={16}
            color="#EF4444"
          />
          <Text style={styles.fieldLabel}>Restrição Alimentar (Opcional)</Text>
        </View>
        <FormComponent
          placeholder="Ex: Intolerância à frango / corantes"
          value={dietaryRestriction}
          onChangeText={setDietaryRestriction}
        />
      </View>

      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Observações / Recomendações</Text>
        <FormComponent
          placeholder="Ex: Adicionar suplemento vitamínico pela manhã"
          value={notes}
          onChangeText={setNotes}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  fieldSection: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  labelWithIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
