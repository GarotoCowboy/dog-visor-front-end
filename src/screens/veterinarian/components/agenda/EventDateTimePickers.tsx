import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";

import { theme } from "../../../../../theme/theme";

interface EventDateTimePickersProps {
  formEventDate: Date;
  setFormEventDate: (d: Date) => void;
  formEventTime: Date;
  setFormEventTime: (d: Date) => void;
  isDatePickerVisible: boolean;
  setIsDatePickerVisible: (v: boolean) => void;
  isTimePickerVisible: boolean;
  setIsTimePickerVisible: (v: boolean) => void;
  hasLimitDate: boolean;
  setHasLimitDate: (v: boolean) => void;
  formLimitDate: Date;
  setFormLimitDate: (d: Date) => void;
  formLimitTime: Date;
  setFormLimitTime: (d: Date) => void;
  isLimitDatePickerVisible: boolean;
  setIsLimitDatePickerVisible: (v: boolean) => void;
  isLimitTimePickerVisible: boolean;
  setIsLimitTimePickerVisible: (v: boolean) => void;
}

export const EventDateTimePickers: React.FC<EventDateTimePickersProps> = ({
  formEventDate,
  setFormEventDate,
  formEventTime,
  setFormEventTime,
  isDatePickerVisible,
  setIsDatePickerVisible,
  isTimePickerVisible,
  setIsTimePickerVisible,
  hasLimitDate,
  setHasLimitDate,
  formLimitDate,
  setFormLimitDate,
  formLimitTime,
  setFormLimitTime,
  isLimitDatePickerVisible,
  setIsLimitDatePickerVisible,
  isLimitTimePickerVisible,
  setIsLimitTimePickerVisible,
}) => {
  return (
    <>
      {/* DATA E HORA DO EVENTO */}
      <View style={styles.formSection}>
        <Text style={styles.formSectionLabel}>
          Data e Horário do Evento *
        </Text>
        <View style={styles.dateTimePickersRow}>
          <View style={styles.dateTimeColumn}>
            <TouchableOpacity
              style={styles.pickerBox}
              onPress={() => setIsDatePickerVisible(true)}
            >
              <MaterialDesignIcons
                name="calendar"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.pickerBoxText}>
                {`${String(formEventDate.getDate()).padStart(
                  2,
                  "0",
                )}/${String(formEventDate.getMonth() + 1).padStart(
                  2,
                  "0",
                )}/${formEventDate.getFullYear()}`}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateTimeColumn}>
            <TouchableOpacity
              style={styles.pickerBox}
              onPress={() => setIsTimePickerVisible(true)}
            >
              <MaterialDesignIcons
                name="clock-outline"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.pickerBoxText}>
                {`${String(formEventTime.getHours()).padStart(
                  2,
                  "0",
                )}:${String(formEventTime.getMinutes()).padStart(
                  2,
                  "0",
                )}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* TOGGLE DATA LIMITE */}
      <View style={styles.limitToggleContainer}>
        <View style={styles.limitToggleTextContainer}>
          <Text style={styles.limitToggleTitle}>
            Definir Data Limite de Expiração (Opcional)
          </Text>
          <Text style={styles.limitToggleSubtitle}>
            O evento ficará vermelho e avisará atraso após essa data/hora
          </Text>
        </View>
        <Switch
          value={hasLimitDate}
          onValueChange={setHasLimitDate}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.white}
        />
      </View>

      {/* CAMPOS DA DATA LIMITE */}
      {hasLimitDate && (
        <View style={styles.formSection}>
          <Text style={styles.formSectionLabel}>
            Data e Horário Limite
          </Text>
          <View style={styles.dateTimePickersRow}>
            <View style={styles.dateTimeColumn}>
              <TouchableOpacity
                style={styles.pickerBox}
                onPress={() => setIsLimitDatePickerVisible(true)}
              >
                <MaterialDesignIcons
                  name="calendar-clock"
                  size={18}
                  color={theme.colors.warning}
                />
                <Text style={styles.pickerBoxText}>
                  {`${String(formLimitDate.getDate()).padStart(
                    2,
                    "0",
                  )}/${String(formLimitDate.getMonth() + 1).padStart(
                    2,
                    "0",
                  )}/${formLimitDate.getFullYear()}`}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateTimeColumn}>
              <TouchableOpacity
                style={styles.pickerBox}
                onPress={() => setIsLimitTimePickerVisible(true)}
              >
                <MaterialDesignIcons
                  name="clock-alert-outline"
                  size={18}
                  color={theme.colors.warning}
                />
                <Text style={styles.pickerBoxText}>
                  {`${String(formLimitTime.getHours()).padStart(
                    2,
                    "0",
                  )}:${String(formLimitTime.getMinutes()).padStart(
                    2,
                    "0",
                  )}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* PICKERS NATIVOS */}
      {isDatePickerVisible && (
        <DateTimePicker
          value={formEventDate}
          mode="date"
          display="default"
          onChange={(_event: DateTimePickerChangeEvent, date?: Date) => {
            setIsDatePickerVisible(false);
            if (date) setFormEventDate(date);
          }}
        />
      )}

      {isTimePickerVisible && (
        <DateTimePicker
          value={formEventTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(_event: DateTimePickerChangeEvent, date?: Date) => {
            setIsTimePickerVisible(false);
            if (date) setFormEventTime(date);
          }}
        />
      )}

      {isLimitDatePickerVisible && (
        <DateTimePicker
          value={formLimitDate}
          mode="date"
          display="default"
          onChange={(_event: DateTimePickerChangeEvent, date?: Date) => {
            setIsLimitDatePickerVisible(false);
            if (date) setFormLimitDate(date);
          }}
        />
      )}

      {isLimitTimePickerVisible && (
        <DateTimePicker
          value={formLimitTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(_event: DateTimePickerChangeEvent, date?: Date) => {
            setIsLimitTimePickerVisible(false);
            if (date) setFormLimitTime(date);
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  formSection: {
    gap: 8,
  },
  formSectionLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  dateTimePickersRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateTimeColumn: {
    flex: 1,
  },
  pickerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerBoxText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  limitToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 4,
  },
  limitToggleTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  limitToggleTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  limitToggleSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },
});
