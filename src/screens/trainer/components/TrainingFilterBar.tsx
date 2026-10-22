import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../theme/theme";

export type FilterTab = "TODOS" | "EM_TREINAMENTO" | "RELATORIOS";

interface TrainingFilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
}

export const TrainingFilterBar: React.FC<TrainingFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}) => {
  return (
    <>
      {/* BUSCA */}
      <View style={styles.searchContainer}>
        <MaterialDesignIcons name="magnify" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cão ou raça..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <MaterialDesignIcons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* CHIPS DE FILTRO */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.tabChip,
            activeTab === "TODOS" && styles.tabChipActive,
          ]}
          onPress={() => onTabChange("TODOS")}
        >
          <Text
            style={[
              styles.tabChipText,
              activeTab === "TODOS" && styles.tabChipTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabChip,
            activeTab === "EM_TREINAMENTO" && styles.tabChipActive,
          ]}
          onPress={() => onTabChange("EM_TREINAMENTO")}
        >
          <Text
            style={[
              styles.tabChipText,
              activeTab === "EM_TREINAMENTO" && styles.tabChipTextActive,
            ]}
          >
            Em Treinamento
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabChip,
            activeTab === "RELATORIOS" && styles.tabChipActive,
          ]}
          onPress={() => onTabChange("RELATORIOS")}
        >
          <Text
            style={[
              styles.tabChipText,
              activeTab === "RELATORIOS" && styles.tabChipTextActive,
            ]}
          >
            Relatórios
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabChipActive: {
    backgroundColor: "#2E6B65",
    borderColor: "#2E6B65",
  },
  tabChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
  },
  tabChipTextActive: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

