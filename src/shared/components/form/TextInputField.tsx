import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import { theme } from "../../../../theme/theme";
import { IFormProps } from "./types";

export type TextInputFieldProps = Pick<
  IFormProps,
  | "keyboardType"
  | "placeholder"
  | "text"
  | "value"
  | "editable"
  | "onChangeText"
  | "onFocus"
  | "leftIcon"
  | "multiline"
  | "numberOfLines"
> & {
  variant?: "normal" | "password";
};

export const TextInputField = ({
  keyboardType = "default",
  placeholder,
  text,
  value,
  editable,
  onChangeText,
  onFocus,
  leftIcon,
  multiline = false,
  numberOfLines = 1,
  variant = "normal",
}: TextInputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  const borderColorActive = isFocused
    ? theme.colors.primary
    : theme.colors.border;

  if (variant === "password") {
    return (
      <View style={styles.container}>
        {text ? <Text style={styles.formText}>{text}</Text> : null}
        <View
          style={[styles.passwordWrapper, { borderColor: borderColorActive }]}
        >
          {leftIcon ? (
            <View style={styles.leftIconContainer}>{leftIcon}</View>
          ) : null}

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
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {text ? <Text style={styles.formText}>{text}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          { borderColor: borderColorActive },
          multiline && { alignItems: "flex-start" },
        ]}
      >
        {leftIcon ? (
          <View
            style={[
              styles.leftIconContainer,
              multiline && { paddingTop: 14 },
            ]}
          >
            {leftIcon}
          </View>
        ) : null}
        <TextInput
          style={[
            styles.inputElement,
            leftIcon ? { paddingLeft: 8 } : { paddingLeft: 16 },
            multiline && {
              minHeight: 40 * numberOfLines,
              textAlignVertical: "top",
            },
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
});

