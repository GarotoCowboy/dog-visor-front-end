import { Pressable, StyleSheet, Text } from "react-native";
import { ReactElement } from "react";
import { theme } from "../../../theme/theme";

interface IButtonProps {
  text?: string;
  onPress: () => void;
  children?: ReactElement | ReactElement[];
  disabled?: boolean;
  variant?: "primary" | "outline" | "transparent" | "warning" | "FAB";
}

export const Button = ({
  disabled = false,
  text,
  onPress,
  children,
  variant = "primary",
}: IButtonProps) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        ...styles.buttonContainer,
        ...(pressed ? styles.buttonPressed : {}),
        ...(variant === "primary" ? styles.primary : {}),
        ...(variant === "outline" ? styles.outlined : {}),
        ...(variant === "outline" && pressed ? styles.outlinedPressed : {}),
        ...(variant === "transparent" ? styles.transparent : {}),
        ...(variant === "warning" ? styles.warning : {}),
        ...(variant === "FAB" ? styles.fab : {}),
      })}
    >
      {children}

      {!children && (
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
          }}
        >
          {text}
        </Text>
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
  primary: {
    backgroundColor: theme.colors.primary,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
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
    zIndex:10,
    ...theme.shadows.md,
  },
  buttonPressed: {
    opacity:0.8
  },
  outlinedPressed:{
    backgroundColor:"rgba(0,0,0,0.1)"
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.base,
  },
  buttonTextColorPrimary: {
    color: theme.colors.white,
  },
  buttonTextColorSecondary: {
    color: theme.colors.primary,
  },
});
