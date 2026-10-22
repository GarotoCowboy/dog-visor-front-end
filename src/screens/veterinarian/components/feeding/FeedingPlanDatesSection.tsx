import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";

import { theme } from "../../../../../theme/theme";

interface FeedingPlanDatesSectionProps {
  startDate: Date;
  setStartDate: (date: Date) => void;
  isStartDatePickerVisible: boolean;
  setIsStartDatePickerVisible: (val: boolean) => void;
  hasEndDate: boolean;
  setHasEndDate: (val: boolean) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  isEndDatePickerVisible: boolean;
  setIsEndDatePickerVisible: (val: boolean) => void;
}

export const FeedingPlanDatesSection: React.FC<FeedingPlanDatesSectionProps> = ({
  startDate,
  setStartDate,
  isStartDatePickerVisible,
  setIsStartDatePickerVisible,
  hasEndDate,
  setHasEndDate,
  endDate,
  setEndDate,
  isEndDatePickerVisible,
  setIsEndDatePickerVisible,
}) => {
  return (
    <>
      {/* 9. DATA DE INÍCIO */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Data de Início *</Text>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setIsStartDatePickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.selectorSelectedText}>
            {startDate.toLocaleDateString("pt-BR")}
          </Text>
          <MaterialDesignIcons
            name="calendar"
            size={18}
            color={theme.colors.secondary}
          />
        </TouchableOpacity>

        {isStartDatePickerVisible && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(_event: DateTimePickerChangeEvent, date?: Date) => {
              setIsStartDatePickerVisible(false);
              if (date) setStartDate(date);
            }}
          />
        )}
      </View>

      {/* 10. DATA DE TÉRMINO */}
      <View style={styles.fieldSection}>
        <View style={styles.labelWithIconRow}>
          <Text style={styles.fieldLabel}>Definir Data de Término</Text>
          <Switch
            value={hasEndDate}
            onValueChange={setHasEndDate}
            trackColor={{
              false: "#E5E7EB",
              true: theme.colors.primary,
            }}
            thumbColor={theme.colors.white}
          />
        </View>

        {hasEndDate && (
          <>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setIsEndDatePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.selectorSelectedText}>
                {endDate.toLocaleDateString("pt-BR")}
              </Text>
              <MaterialDesignIcons
                name="calendar"
                size={18}
                color={theme.colors.secondary}
              />
            </TouchableOpacity>

            {isEndDatePickerVisible && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(_event: DateTimePickerChangeEvent, date?: Date) => {
                  setIsEndDatePickerVisible(false);
                  if (date) setEndDate(date);
                }}
              />
            )}
          </>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  fieldSection: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  labelWithIconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectorSelectedText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
});
