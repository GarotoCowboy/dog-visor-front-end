import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";

interface TestsBottomBarProps {
  bottomInset: number;
  onNewVolhardTest: () => void;
  onNewBehaviorTest: () => void;
}

export const TestsBottomBar: React.FC<TestsBottomBarProps> = ({
  bottomInset,
  onNewVolhardTest,
  onNewBehaviorTest,
}) => {
  return (
    <View
      style={[
        styles.bottomBar,
        { paddingBottom: Math.max(bottomInset, 12) },
      ]}
    >
      <View style={styles.bottomButtonsRow}>
        <TouchableOpacity
          style={[styles.newTestButton, { flex: 1 }]}
          onPress={onNewVolhardTest}
          activeOpacity={0.85}
        >
          <MaterialDesignIcons
            name="clipboard-check-outline"
            size={18}
            color={theme.colors.white}
          />
          <Text style={styles.newTestButtonText} numberOfLines={1}>
            Teste Volhard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.newTestButton,
            styles.newBehaviorButton,
            { flex: 1 },
          ]}
          onPress={onNewBehaviorTest}
          activeOpacity={0.85}
        >
          <MaterialDesignIcons
            name="paw"
            size={18}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.newTestButtonText,
              { color: theme.colors.primary },
            ]}
            numberOfLines={1}
          >
            Teste Behavior
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    ...theme.shadows.md,
  },
  bottomButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  newTestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    gap: 6,
    ...theme.shadows.sm,
  },
  newBehaviorButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  newTestButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
});

