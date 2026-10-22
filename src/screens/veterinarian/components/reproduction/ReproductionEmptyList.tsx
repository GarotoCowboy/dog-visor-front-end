import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../../theme/theme";

interface ReproductionEmptyListProps {
  search: string;
}

export const ReproductionEmptyList: React.FC<ReproductionEmptyListProps> = ({
  search,
}) => {
  return (
    <View style={styles.emptyContainer}>
      <MaterialDesignIcons
        name="calendar-heart"
        size={48}
        color="#CBD5E1"
      />
      <Text style={styles.emptyTitle}>
        Nenhum registro reprodutivo encontrado
      </Text>
      <Text style={styles.emptySubtitle}>
        {search.trim()
          ? "Tente buscar com outro termo."
          : "Toque em 'Registrar Cio' acima para cadastrar o primeiro ciclo reprodutivo."}
      </Text>
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
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
