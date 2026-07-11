import {
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
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
  options?: { label: string; value: string; image?: ImageSourcePropType }[];
  onSelect?: (value: string) => void;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  leftIcon?: React.ReactNode;
  dateTimeMode?: "date" | "time";
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyOptionsMessage?: string;
  multiline?: boolean; // Permite múltiplas linhas
  numberOfLines?: number; // Define a altura inicial baseada no número de linhas
}

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
  onFocus,
  leftIcon,
  dateTimeMode = "date",
  searchable = false,
  searchPlaceholder = "Pesquisar",
  emptyOptionsMessage = "Nenhuma opcao encontrada",
  multiline = false,
  numberOfLines = 1,
}: IFormProps) => {
  const dropdownRef = useRef<View>(null);
  const [isSecure, setIsSecure] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
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
    setDropdownSearch("");
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
    selectedDate?: Date,
  ) => {
    if (!selectedDate) {
      closeDatePicker();
      return;
    }

    // Verifica dinamicamente se deve salvar o texto como data ou hora
    if (dateTimeMode === "time") {
      onChangeText(formatTime(selectedDate));
    } else {
      onChangeText(formatDate(selectedDate));
    }

    closeDatePicker();
  };

  const normalizedDropdownSearch = dropdownSearch.toLowerCase().trim();
  const filteredOptions =
    options?.filter((opt) =>
      normalizedDropdownSearch
        ? opt.label.toLowerCase().includes(normalizedDropdownSearch)
        : true,
    ) ?? [];

  return (
    <View style={[styles.container, isOpen && styles.containerOpen]}>
      {text && <Text style={styles.formText}>{text}</Text>}

      {variant === "normal" ? (
        <View
          style={[
            styles.inputWrapper,
            { borderColor: borderColorActive },
            multiline && { alignItems: "flex-start" }, // Alinha o ícone no topo se for multiline
          ]}
        >
          {leftIcon && (
            <View
              style={[
                styles.leftIconContainer,
                multiline && { paddingTop: 14 }, // Dá um espaçamento no ícone se for multiline
              ]}
            >
              {leftIcon}
            </View>
          )}
          <TextInput
            style={[
              styles.inputElement,
              leftIcon ? { paddingLeft: 8 } : { paddingLeft: 16 },
              multiline && { minHeight: 40 * numberOfLines, textAlignVertical: "top" }, // Garante a altura e inicia o texto no topo
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => setIsFocused(false)}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={editable}
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
            editable={editable}
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
                {searchable ? (
                  <TextInput
                    style={styles.dropdownSearchInput}
                    value={dropdownSearch}
                    onChangeText={setDropdownSearch}
                    placeholder={searchPlaceholder}
                    autoFocus
                  />
                ) : null}

                <ScrollView
                  style={styles.dropdownScroll}
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((opt) => (
                      <Pressable
                        key={opt.value}
                        style={styles.dropdownItem}
                        onPress={() => {
                          onSelect?.(opt.value);
                          closeDropdown();
                        }}
                      >
                        <View style={styles.dropdownItemContent}>
                          {opt.image ? (
                            <Image
                              source={opt.image}
                              style={styles.dropdownItemImage}
                            />
                          ) : null}
                          <Text style={styles.dropdownItemText}>
                            {opt.label}
                          </Text>
                        </View>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={styles.emptyOptionsText}>
                      {emptyOptionsMessage}
                    </Text>
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      ) : variant === "date" ? (
        <View>
          <Pressable onPress={openDatePicker} disabled={editable === false}>
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
              value={value && dateTimeMode === "date" ? parseDate(value) : new Date()}
              mode={dateTimeMode}
              display="default"
              maximumDate={dateTimeMode === "date" ? new Date() : undefined}
              onValueChange={handleDateValueChange}
              onDismiss={closeDatePicker}
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
    flexDirection: "row",
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
    paddingRight: 48,
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
  dropdownSearchInput: {
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownScroll: {
    maxHeight: 220,
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
  dropdownItemContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  dropdownItemImage: {
    borderRadius: theme.borderRadius.full,
    height: 36,
    width: 36,
  },
  dropdownItemText: {
    color: theme.colors.text,
    flex: 1,
  },
  emptyOptionsText: {
    color: theme.colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
