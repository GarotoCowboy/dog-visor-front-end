import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

import { theme } from "../../../../../theme/theme";

interface ReproductionHeaderProps {
  onOpenCreateModal: () => void;
}

export const ReproductionHeader: React.FC<ReproductionHeaderProps> = ({
  onOpenCreateModal,
}) => {
  return (
    <View style={styles.topBar}>
      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Controle Reprodutivo</Text>
        <Text style={styles.screenSubtitle}>
          Acompanhamento de cios e previsões de ciclos
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onOpenCreateModal}
        activeOpacity={0.8}
      >
        <FontAwesomeFreeSolid
          name="plus"
          size={13}
          color={theme.colors.white}
        />
        <Text style={styles.addButtonText}>Registrar Cio</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  screenTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text,
  },
  screenSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#BE185D",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    ...theme.shadows.sm,
  },
  addButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
});
