import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { theme } from "../../../theme/theme";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

interface IFormProps {
  keyboardType?: "numeric" | "default" | "email-address";
  placeholder: string;
  text: string;
  variant?: "normal" | "password" | "dropdown";
  value: string;
  editable?: boolean;
  options?: { label: string; value: string }[];
  onSelect?: (value: string) => void;
  onChangeText: (text: string) => void;
}

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
}: IFormProps) => {
  const [isSecure, setIsSecure] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const borderColorActive = isFocused
    ? theme.colors.primary
    : theme.colors.border;

  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.formText}>{text}</Text>

      {variant === "normal" ? (
        <TextInput
          style={{ ...styles.formContainer, borderColor: borderColorActive }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
        />
      ) : variant === "password" ? (
        <View style={styles.passwordWrapper}>
          <TextInput
            style={{ ...styles.passwordInput, borderColor: borderColorActive }}
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
        <View style={{ zIndex: 1000 }}>
          <Pressable onPress={() => setIsOpen(!isOpen)}>
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

          {isOpen ? (
            <View
              style={{ ...styles.dropdownList, borderColor: borderColorActive }}
            >
              {options?.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect?.(opt.value);
                    setIsOpen(false);
                  }}
                >
                  <Text>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default FormComponent;

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderStyle: "solid",
    borderWidth: 1,
  },
  formText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingLeft: 16,
    paddingRight: 48,
    paddingVertical: 12,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderStyle: "solid",
    borderWidth: 1,
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
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 8,
    elevation: 7,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
