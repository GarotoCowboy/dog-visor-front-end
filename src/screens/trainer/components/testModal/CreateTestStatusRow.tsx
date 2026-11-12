import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { FormComponent } from "../../../../shared/components/FormComponent";

interface CreateTestStatusRowProps {
  date: string;
  onChangeDate: (newDate: string) => void;
  isAllCompleted: boolean;
  currentCompletedCount: number;
  currentTotalCount: number;
}

export const CreateTestStatusRow: React.FC<CreateTestStatusRowProps> = ({
  date,
  onChangeDate,
  isAllCompleted,
  currentCompletedCount,
  currentTotalCount,
}) => {
  return (
    <View style={styles.rowTwoCols}>
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={styles.fieldLabel}>Data do Teste</Text>
        <FormComponent
          variant="date"
          dateTimeMode="date"
          placeholder="AAAA-MM-DD"
          value={date}
          onChangeText={onChangeDate}
        />
      </View>

      <View style={{ flex: 1, gap: 6 }}>
        <Text style={styles.fieldLabel}>Status (Automático)</Text>
        <View
          style={[
            styles.statusChoiceButton,
            isAllCompleted
              ? styles.statusChoiceCompletedActive
              : styles.statusChoicePendingActive,
            {
              flexDirection: "row",
              gap: 6,
              paddingVertical: 11,
            },
          ]}
        >
          <MaterialDesignIcons
            name={isAllCompleted ? "check-circle-outline" : "clock-outline"}
            size={16}
            color={isAllCompleted ? "#15803D" : "#B45309"}
          />
          <Text
            style={[
              styles.statusChoiceText,
              isAllCompleted
                ? styles.statusChoiceTextCompleted
                : styles.statusChoiceTextPending,
            ]}
          >
            {isAllCompleted
              ? `Concluído (${currentCompletedCount}/${currentTotalCount})`
              : `Pendente (${currentCompletedCount}/${currentTotalCount})`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowTwoCols: {
    flexDirection: "row",
    gap: 12,
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  statusChoiceButton: {
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  statusChoicePendingActive: {
    borderColor: "#F59E0B",
    backgroundColor: "#FEF3C7",
  },
  statusChoiceCompletedActive: {
    borderColor: "#10B981",
    backgroundColor: "#D1FAE5",
  },
  statusChoiceText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
  },
  statusChoiceTextPending: {
    color: "#B45309",
  },
  statusChoiceTextCompleted: {
    color: "#15803D",
  },
});

