import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";

interface TestsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TestsSearchBar: React.FC<TestsSearchBarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <View style={styles.searchContainer}>
      <MaterialDesignIcons name="magnify" size={20} color="#9CA3AF" />
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por cão ou tipo de teste..."
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
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    paddingVertical: 0,
  },
});

