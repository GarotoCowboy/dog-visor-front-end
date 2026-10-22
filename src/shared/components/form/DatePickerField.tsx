import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { theme } from "../../../../theme/theme";
import { IFormProps } from "./types";

export type DatePickerFieldProps = Pick<
  IFormProps,
  "text" | "placeholder" | "value" | "editable" | "onChangeText" | "dateTimeMode"
>;

// Formata a data para o padrão de texto AAAA-MM-DD
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Formata o horário para o padrão de texto HH:mm
const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Converte a string de data de volta para um objeto Date
const parseDate = (value: string) => {
  if (!value || !value.includes("-")) {
    return new Date();
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
};

export const DatePickerField = ({
  text,
  placeholder,
  value,
  editable,
  onChangeText,
  dateTimeMode = "date",
}: DatePickerFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const borderColorActive = isFocused
    ? theme.colors.primary
    : theme.colors.border;

  const openDatePicker = () => {
    if (editable === false) return;
    setIsFocused(true);
    setIsDatePickerOpen(true);
  };

  const closeDatePicker = () => {
    setIsFocused(false);
    setIsDatePickerOpen(false);
  };

  const handleDateValueChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate?: Date,
  ) => {
    if (!selectedDate) {
      closeDatePicker();
      return;
    }

    if (dateTimeMode === "time") {
      onChangeText(formatTime(selectedDate));
    } else {
      onChangeText(formatDate(selectedDate));
    }

    closeDatePicker();
  };

  return (
    <View style={styles.container}>
      {text ? <Text style={styles.formText}>{text}</Text> : null}

      <Pressable onPress={openDatePicker} disabled={editable === false}>
        <View pointerEvents="none">
          <TextInput
            style={[
              styles.formContainer,
              { borderColor: borderColorActive },
            ]}
            value={value}
            placeholder={placeholder}
            editable={false}
          />
        </View>
      </Pressable>

      {isDatePickerOpen ? (
        <DateTimePicker
          value={
            value && dateTimeMode === "date" ? parseDate(value) : new Date()
          }
          mode={dateTimeMode}
          display="default"
          maximumDate={dateTimeMode === "date" ? new Date() : undefined}
          onValueChange={handleDateValueChange}
          onDismiss={closeDatePicker}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
    zIndex: 1,
  },
  formText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    color: theme.colors.text,
  },
});

