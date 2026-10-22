import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { ReactElement } from "react";
import { theme } from "../../../theme/theme";

interface IButtonProps {
  text?: string;
  onPress: () => void;
  children?: ReactElement | ReactElement[];
  disabled?: boolean;
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
  variant?: "primary" | "outline" | "transparent" | "warning" | "FAB";
  style?: StyleProp<ViewStyle>;
}

export const Button = ({
  disabled = false,
  text,
  onPress,
  children,
  leftIcon,
  rightIcon,
  variant = "primary",
  style,
}: IButtonProps) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonContainer,
        variant === "primary" && styles.primary,
        variant === "outline" && styles.outlined,
        variant === "outline" && pressed && !disabled && styles.outlinedPressed,
        variant === "transparent" && styles.transparent,
        variant === "warning" && styles.warning,
        variant === "FAB" && styles.fab,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.disabledContainer,
        disabled && (variant === "primary" || variant === "warning" || variant === "FAB") && styles.disabledFilled,
        disabled && variant === "outline" && styles.disabledOutlined,
        style,
      ]}
      accessibilityState={{ disabled }}
    >
      {children}

      {!children && (
        <View style={styles.contentRow}>
          {leftIcon}
          <Text
            style={{
              ...styles.buttonText,
              ...(variant === "primary" ? styles.buttonTextColorPrimary : {}),
              ...(variant === "warning" ? styles.buttonTextColorPrimary : {}),
              ...(variant === "outline" ? styles.buttonTextColorSecondary : {}),
              ...(variant === "transparent"
                ? styles.buttonTextColorSecondary
                : {}),
              ...(variant === "FAB" ? styles.buttonTextColorPrimary : {}),
              ...(disabled
                ? variant === "outline" || variant === "transparent"
                  ? styles.buttonTextDisabledOnLight
                  : styles.buttonTextDisabledOnFilled
                : {}),
            }}
          >
            {text}
          </Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: 8,
  },
  transparent: {},
  warning: {
    backgroundColor: theme.colors.alert,
  },
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.accent,
    justifyContent: "center",
    alignItems: "center",
    right: 40,
    bottom: 40,
    zIndex: 10,
    ...theme.shadows.md,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  disabledFilled: {
    backgroundColor: "#9CA3AF",
  },
  disabledOutlined: {
    borderColor: "#9CA3AF",
  },
  buttonTextDisabledOnFilled: {
    color: "#F3F4F6",
  },
  buttonTextDisabledOnLight: {
    color: "#9CA3AF",
  },
  outlinedPressed: {
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.base,
  },
  buttonTextColorPrimary: {
    color: theme.colors.white,
  },
  buttonTextColorSecondary: {
    color: theme.colors.primary,
  },
});
