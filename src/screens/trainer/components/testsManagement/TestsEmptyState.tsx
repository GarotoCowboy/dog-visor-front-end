import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { TestFilterTab } from "./TestsFilterTabs";

interface TestsEmptyStateProps {
  searchQuery: string;
  activeTab: TestFilterTab;
}

export const TestsEmptyState: React.FC<TestsEmptyStateProps> = ({
  searchQuery,
  activeTab,
}) => {
  const subtitle = searchQuery
    ? "Tente buscar por outro termo ou nome de cão."
    : activeTab === "PENDING"
    ? "Não há testes pendentes no momento."
    : "Nenhum teste cadastrado nesta categoria.";

  return (
    <View style={styles.emptyContainer}>
      <MaterialDesignIcons
        name="clipboard-text-outline"
        size={42}
        color="#D1D5DB"
      />
      <Text style={styles.emptyTitle}>Nenhum teste encontrado</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: "Roboto-Bold",
    fontWeight: "bold",
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  emptySubtitle: {
    fontFamily: "Roboto-Regular",
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 24,
  },
});

