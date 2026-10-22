import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import { theme } from "../../../../../theme/theme";

export const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const WEEKDAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface AgendaMonthHeaderProps {
  currentMonthDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export const AgendaMonthHeader: React.FC<AgendaMonthHeaderProps> = ({
  currentMonthDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}) => {
  return (
    <View style={styles.monthHeader}>
      <View style={styles.monthTitleContainer}>
        <Text style={styles.monthTitle}>
          {MONTHS_PT[currentMonthDate.getMonth()]}{" "}
          <Text style={styles.yearText}>{currentMonthDate.getFullYear()}</Text>
        </Text>
      </View>

      <View style={styles.headerButtonsRow}>
        <TouchableOpacity
          style={styles.todayButton}
          onPress={onToday}
          activeOpacity={0.7}
        >
          <Text style={styles.todayButtonText}>Hoje</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navIconButton}
          onPress={onPrevMonth}
          activeOpacity={0.7}
        >
          <FontAwesomeFreeSolid
            name="chevron-left"
            size={12}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navIconButton}
          onPress={onNextMonth}
          activeOpacity={0.7}
        >
          <FontAwesomeFreeSolid
            name="chevron-right"
            size={12}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  monthTitleContainer: {
    flex: 1,
  },
  monthTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  yearText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
  },
  headerButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  todayButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
  navIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
