import React from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import happyDog from "../../../assets/warning_images/happyDog.png";
import sadDog from "../../../assets/warning_images/sadDog.png";
import questionDog from "../../../assets/warning_images/QuestionDog.png";
import { theme } from "../../../theme/theme";

type AlertVariant = "warning" | "error" | "success";

type CustomAlertProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  variant: AlertVariant;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
};

const variantConfig = {
  success: {
    color: theme.colors.statusCompleted,
    lightColor: theme.colors.accent,
    image: happyDog,
  },
  error: {
    color: theme.colors.alert,
    lightColor: theme.colors.alertLightColor,
    image: sadDog,
  },
  warning: {
    color: theme.colors.warning,
    lightColor: theme.colors.warningLightColor,
    image: questionDog,
  },
};

export const CustomAlertComponent = ({
  visible,
  title,
  message,
  onClose,
  variant,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  showCancel = false,
}: CustomAlertProps) => {
  const config = variantConfig[variant];

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.alertBox,
            {
              borderTopColor: config.color,
              backgroundColor: config.lightColor,
            },
          ]}
        >
          <Image source={config.image} style={styles.image} />

          <Text style={[styles.title, { color: config.color }]}>
            {title}
          </Text>

          <Text style={styles.message}>{message}</Text>

          {showCancel ? (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: config.color }]}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: config.color, minWidth: 120 }]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: "80%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderTopWidth: 6,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#666",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});