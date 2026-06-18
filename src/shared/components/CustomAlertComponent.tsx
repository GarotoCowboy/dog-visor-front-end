import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
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
}: CustomAlertProps) => {
  const config = variantConfig[variant];

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

          <TouchableOpacity
            style={[styles.button, { backgroundColor: config.color }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Ok</Text>
          </TouchableOpacity>
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
  button: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});