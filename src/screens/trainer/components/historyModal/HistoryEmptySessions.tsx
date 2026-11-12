import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

interface HistoryEmptySessionsProps {
  selectedStage: number;
}

export const HistoryEmptySessions: React.FC<HistoryEmptySessionsProps> = ({
  selectedStage,
}) => {
  return (
    <View style={styles.emptyContainer}>
      <FontAwesomeFreeSolid
        name="calendar-times"
        size={36}
        color="#D1D5DB"
      />
      <Text style={styles.emptyTitle}>Nenhuma sessão registrada</Text>
      <Text style={styles.emptySubtitle}>
        Não foram registradas sessões de treino para a Etapa {selectedStage} ainda.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
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

