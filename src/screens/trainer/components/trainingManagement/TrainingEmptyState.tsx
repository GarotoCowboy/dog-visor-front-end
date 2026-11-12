import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import { FilterTab } from "../TrainingFilterBar";

interface TrainingEmptyStateProps {
  searchQuery: string;
  activeTab: FilterTab;
}

export const TrainingEmptyState: React.FC<TrainingEmptyStateProps> = ({
  searchQuery,
  activeTab,
}) => {
  const subtitle = searchQuery
    ? "Tente buscar por outro nome ou termo."
    : activeTab === "CONCLUIDO"
    ? "Nenhum cão concluiu o treinamento ainda."
    : "Toque no botão abaixo para adicionar um cão e iniciar o treinamento.";

  return (
    <View style={styles.emptyContainer}>
      <FontAwesomeFreeSolid name="dog" size={42} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Nenhum cão em treinamento</Text>
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
    color: "#4B5563",
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: "Roboto-Regular",
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});

