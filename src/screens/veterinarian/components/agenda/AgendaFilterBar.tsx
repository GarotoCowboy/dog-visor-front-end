import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../../../../theme/theme";
import { MONTHS_PT } from "./AgendaMonthHeader";

interface AgendaFilterBarProps {
  selectedDate: Date;
  filterView: "day" | "all";
  onFilterChange: (mode: "day" | "all") => void;
  eventsCount: number;
}

export const AgendaFilterBar: React.FC<AgendaFilterBarProps> = ({
  selectedDate,
  filterView,
  onFilterChange,
  eventsCount,
}) => {
  return (
    <View style={styles.agendaHeaderBar}>
      <View style={styles.agendaDateInfo}>
        <Text style={styles.agendaDateTitle}>
          {filterView === "day"
            ? `${selectedDate.getDate()} de ${MONTHS_PT[selectedDate.getMonth()]}`
            : "Todos os Eventos"}
        </Text>
        <Text style={styles.agendaDateSubtitle}>
          {eventsCount} {eventsCount === 1 ? "evento" : "eventos"}
        </Text>
      </View>

      <View style={styles.viewToggleRow}>
        <TouchableOpacity
          style={[
            styles.viewToggleChip,
            filterView === "day" && styles.viewToggleChipActive,
          ]}
          onPress={() => onFilterChange("day")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.viewToggleChipText,
              filterView === "day" && styles.viewToggleChipTextActive,
            ]}
          >
            Dia
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewToggleChip,
            filterView === "all" && styles.viewToggleChipActive,
          ]}
          onPress={() => onFilterChange("all")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.viewToggleChipText,
              filterView === "all" && styles.viewToggleChipTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  agendaHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.background,
  },
  agendaDateInfo: {
    gap: 2,
  },
  agendaDateTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  agendaDateSubtitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
  },
  viewToggleRow: {
    flexDirection: "row",
    gap: 6,
  },
  viewToggleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  viewToggleChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  viewToggleChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  viewToggleChipTextActive: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
