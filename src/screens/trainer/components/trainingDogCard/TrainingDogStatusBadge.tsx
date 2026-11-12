import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

interface TrainingDogStatusBadgeProps {
  isApto: boolean;
  isInapto: boolean;
  currentStage?: number;
}

export const TrainingDogStatusBadge: React.FC<TrainingDogStatusBadgeProps> = ({
  isApto,
  isInapto,
  currentStage,
}) => {
  if (isApto) {
    return (
      <View style={[styles.statusBadge, styles.statusBadgeApto]}>
        <MaterialDesignIcons name="check-circle" size={13} color="#15803D" />
        <Text style={[styles.statusBadgeText, styles.statusBadgeTextApto]}>
          Concluído (Apto)
        </Text>
      </View>
    );
  }

  if (isInapto) {
    return (
      <View style={[styles.statusBadge, styles.statusBadgeInapto]}>
        <MaterialDesignIcons name="close-circle" size={13} color="#B91C1C" />
        <Text style={[styles.statusBadgeText, styles.statusBadgeTextInapto]}>
          Encerrado (Inapto)
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.statusBadge, styles.statusBadgeRunning]}>
      <MaterialDesignIcons name="clock-outline" size={13} color="#D97706" />
      <Text style={[styles.statusBadgeText, styles.statusBadgeTextRunning]}>
        Etapa {currentStage || 1}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeApto: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeInapto: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeRunning: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeText: {
    fontFamily: "Roboto-Bold",
    fontWeight: "bold",
    fontSize: 11,
  },
  statusBadgeTextApto: {
    color: "#15803D",
  },
  statusBadgeTextInapto: {
    color: "#B91C1C",
  },
  statusBadgeTextRunning: {
    color: "#D97706",
  },
});

