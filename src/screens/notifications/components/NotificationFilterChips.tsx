import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../../../theme/theme";
import { MessageType } from "../../../types/Notification";

export type FilterStatus = "PENDING" | "COMPLETED" | "ALL" | MessageType;

interface NotificationFilterChipsProps {
  selectedFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
  filterChips: { label: string; value: FilterStatus }[];
}

export const NotificationFilterChips: React.FC<NotificationFilterChipsProps> = ({
  selectedFilter,
  onSelectFilter,
  filterChips,
}) => {
  return (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filterChips}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => {
          const isSelected = selectedFilter === item.value;
          return (
            <TouchableOpacity
              style={[
                styles.filterChip,
                isSelected && styles.filterChipSelected,
              ]}
              onPress={() => onSelectFilter(item.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    marginVertical: 4,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  filterChipTextSelected: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
