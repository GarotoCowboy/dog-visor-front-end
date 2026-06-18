import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import { theme } from "../../../theme/theme";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";

interface IFormProps {
  keyboardType?: "numeric" | "default" | "email-address";
  placeholder: string;
  text?: string;
  variant?: "normal" | "password" | "dropdown" | "date";
  value: string;
  editable?: boolean;
  options?: { label: string; value: string }[];
  onSelect?: (value: string) => void;
  onChangeText: (text: string) => void;
  leftIcon?: React.ReactNode;
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
};

export const FormComponent = ({
  onChangeText,
  value,
  text,
  editable,
  placeholder,
  keyboardType = "default",
  variant = "normal",
  options,
  onSelect,
  leftIcon,
}: IFormProps) => {
  const dropdownRef = useRef<View>(null);
  const [isSecure, setIsSecure] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const borderColorActive = isFocused
    ? theme.colors.primary
    : theme.colors.border;

  const closeDropdown = () => {
    setIsOpen(false);
    setIsFocused(false);
  };

  const openDropdown = () => {
    if (isOpen) {
      closeDropdown();
      return;
    }

    dropdownRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPosition({ x, y, width, height });
      setIsFocused(true);
      setIsOpen(true);
    });
  };

  const openDatePicker = () => {
    setIsFocused(true);
    setIsDatePickerOpen(true);
  };

  const closeDatePicker = () => {
    setIsFocused(false);
    setIsDatePickerOpen(false);
  };

  const handleDateValueChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate: Date,
  ) => {
    onChangeText(formatDate(selectedDate));
    closeDatePicker();
  };

  return (
    <View style={[styles.container, isOpen && styles.containerOpen]}>
      {text && <Text style={styles.formText}>{text}</Text>}

      {variant === "normal" ? (
        <View style={[styles.inputWrapper, { borderColor: borderColorActive }]}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <TextInput
            style={[
              styles.inputElement,
              leftIcon ? { paddingLeft: 8 } : { paddingLeft: 16 },
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType={keyboardType}
          />
        </View>
      ) : variant === "password" ? (
        <View style={[styles.passwordWrapper, { borderColor: borderColorActive }]}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

          <TextInput
            style={[
              styles.passwordInputElement,
              leftIcon ? { paddingLeft: 8 } : { paddingLeft: 16 },
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            secureTextEntry={isSecure}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete="current-password"
          />
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.iconContainer}
          >
            <FontAwesomeFreeSolid
              name={isSecure ? "eye-slash" : "eye"}
              size={14}
              color="black"
            />
          </TouchableOpacity>
        </View>
      ) : variant === "dropdown" ? (
        <View ref={dropdownRef} style={styles.dropdownWrapper}>
          <Pressable onPress={openDropdown}>
            <View pointerEvents="none">
              <TextInput
                style={{
                  ...styles.formContainer,
                  borderColor: borderColorActive,
                }}
                value={value}
                placeholder={placeholder}
                editable={false}
              />
            </View>
          </Pressable>

          <Modal
            transparent
            visible={isOpen}
            animationType="none"
            onRequestClose={closeDropdown}
          >
            <View style={styles.modalContainer}>
              <Pressable style={styles.modalBackdrop} onPress={closeDropdown} />
              <View
                style={[
                  styles.dropdownList,
                  {
                    borderColor: borderColorActive,
                    left: dropdownPosition.x,
                    top: dropdownPosition.y + dropdownPosition.height + 4,
                    width: dropdownPosition.width,
                  },
                ]}
              >
                {options?.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      onSelect?.(opt.value);
                      closeDropdown();
                    }}
                  >
                    <Text>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Modal>
        </View>
      ) : variant === "date" ? (
        <View>
          <Pressable onPress={openDatePicker}>
            <View pointerEvents="none">
              <TextInput
                style={{
                  ...styles.formContainer,
                  borderColor: borderColorActive,
                }}
                value={value}
                placeholder={placeholder}
                editable={false}
              />
            </View>
          </Pressable>

          {isDatePickerOpen ? (
            <DateTimePicker
              value={value ? parseDate(value) : new Date()}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onValueChange={handleDateValueChange}
              onDismiss={closeDatePicker}
              onNeutralButtonPress={closeDatePicker}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default FormComponent;

const styles = StyleSheet.create({
  container: {
    gap: 6,
    zIndex: 1,
  },
  containerOpen: {
    elevation: 10,
    zIndex: 1000,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderStyle: "solid",
    borderWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderStyle: "solid",
    borderWidth: 1,
  },
  leftIconContainer: {
    paddingLeft: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  inputElement: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 16,
    color: "black",
  },
  formText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
  },
  passwordWrapper: {
    flexDirection: "row", // ✅ CORREÇÃO: Alinha o ícone e o input em linha reta
    alignItems: "center",
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    position: "relative",
  },
  passwordInputElement: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 48, // Abre espaço para o botão do olho na direita
    color: "black",
  },
  iconContainer: {
    position: "absolute",
    right: 16,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownList: {
    position: "absolute",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 8,
    elevation: 10,
    zIndex: 1000,
  },
  dropdownWrapper: {
    position: "relative",
    zIndex: 1000,
  },
  modalBackdrop: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  modalContainer: {
    flex: 1,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});