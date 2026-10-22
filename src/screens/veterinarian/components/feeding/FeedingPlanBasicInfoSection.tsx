import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../../../../theme/theme";
import FormComponent from "../../../../shared/components/FormComponent";

interface FeedingPlanBasicInfoSectionProps {
  planName: string;
  setPlanName: (val: string) => void;
  goal: string;
  setGoal: (val: string) => void;
}

export const FeedingPlanBasicInfoSection: React.FC<
  FeedingPlanBasicInfoSectionProps
> = ({ planName, setPlanName, goal, setGoal }) => {
  return (
    <>
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Nome do Plano *</Text>
        <FormComponent
          placeholder="Ex: Adulto Controle de Peso"
          value={planName}
          onChangeText={setPlanName}
        />
      </View>

      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Objetivo do Plano *</Text>
        <FormComponent
          placeholder="Ex: Manutenção do peso e ganho de saciedade"
          value={goal}
          onChangeText={setGoal}
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
});
