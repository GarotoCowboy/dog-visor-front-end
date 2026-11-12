import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { TestType } from "../../../../types/Training";

interface CreateTestModalHeaderProps {
  testType: TestType;
  onClose: () => void;
}

export const CreateTestModalHeader: React.FC<CreateTestModalHeaderProps> = ({
  testType,
  onClose,
}) => {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>
          {testType === TestType.VOLHARD
            ? "Teste Volhard"
            : "Teste Behavior"}
        </Text>
        <Text style={styles.headerSubtitle}>
          Selecione cada teste no menu abaixo para registrar a pontuação
        </Text>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <MaterialDesignIcons name="close" size={24} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
  },
});

