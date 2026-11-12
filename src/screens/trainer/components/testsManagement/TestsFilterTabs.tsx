import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../../../../theme/theme";

export type TestFilterTab = "PENDING" | "COMPLETED" | "ALL";

interface TestsFilterTabsProps {
  activeTab: TestFilterTab;
  onSelectTab: (tab: TestFilterTab) => void;
}

export const TestsFilterTabs: React.FC<TestsFilterTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <View style={styles.tabsRow}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "PENDING" && styles.tabButtonActive,
        ]}
        onPress={() => onSelectTab("PENDING")}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "PENDING" && styles.tabButtonTextActive,
          ]}
        >
          Pendentes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "COMPLETED" && styles.tabButtonActive,
        ]}
        onPress={() => onSelectTab("COMPLETED")}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "COMPLETED" && styles.tabButtonTextActive,
          ]}
        >
          Concluídos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "ALL" && styles.tabButtonActive,
        ]}
        onPress={() => onSelectTab("ALL")}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === "ALL" && styles.tabButtonTextActive,
          ]}
        >
          Todos
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
  },
  tabButtonTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
});

