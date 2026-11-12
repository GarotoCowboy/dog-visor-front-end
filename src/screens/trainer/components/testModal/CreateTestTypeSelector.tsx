import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { TestType } from "../../../../types/Training";

interface CreateTestTypeSelectorProps {
  testType: TestType;
  onSelectTestType: (type: TestType) => void;
}

export const CreateTestTypeSelector: React.FC<CreateTestTypeSelectorProps> = ({
  testType,
  onSelectTestType,
}) => {
  return (
    <View style={styles.fieldSection}>
      <Text style={styles.fieldLabel}>Modalidade de Avaliação</Text>
      <View style={styles.rowChoices}>
        <TouchableOpacity
          style={[
            styles.choiceButton,
            testType === TestType.VOLHARD && styles.choiceButtonActive,
          ]}
          onPress={() => onSelectTestType(TestType.VOLHARD)}
        >
          <MaterialDesignIcons
            name="clipboard-check-outline"
            size={20}
            color={
              testType === TestType.VOLHARD
                ? theme.colors.white
                : theme.colors.primary
            }
          />
          <Text
            style={[
              styles.choiceButtonText,
              testType === TestType.VOLHARD && styles.choiceButtonTextActive,
            ]}
          >
            Teste Volhard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.choiceButton,
            testType === TestType.BEHAVIOR && styles.choiceButtonActive,
          ]}
          onPress={() => onSelectTestType(TestType.BEHAVIOR)}
        >
          <MaterialDesignIcons
            name="paw"
            size={20}
            color={
              testType === TestType.BEHAVIOR
                ? theme.colors.white
                : theme.colors.primary
            }
          />
          <Text
            style={[
              styles.choiceButtonText,
              testType === TestType.BEHAVIOR && styles.choiceButtonTextActive,
            ]}
          >
            Teste Behavior
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fieldSection: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  rowChoices: {
    flexDirection: "row",
    gap: 10,
  },
  choiceButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: "#FFFFFF",
  },
  choiceButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  choiceButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
  choiceButtonTextActive: {
    color: theme.colors.white,
  },
});

