import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import { theme } from "../../../../theme/theme";

export type MainSection = "NOTIFICATIONS" | "MEDICATIONS";

interface NotificationSectionTabsProps {
  currentSection: MainSection;
  onSelectSection: (section: MainSection) => void;
}

export const NotificationSectionTabs: React.FC<NotificationSectionTabsProps> = ({
  currentSection,
  onSelectSection,
}) => {
  return (
    <View style={styles.mainTabSwitcher}>
      <TouchableOpacity
        style={[
          styles.mainTabButton,
          currentSection === "NOTIFICATIONS" && styles.mainTabButtonActive,
        ]}
        onPress={() => onSelectSection("NOTIFICATIONS")}
        activeOpacity={0.7}
      >
        <FontAwesomeFreeSolid
          name="bell"
          size={14}
          color={
            currentSection === "NOTIFICATIONS"
              ? theme.colors.primary
              : theme.colors.secondary
          }
        />
        <Text
          style={[
            styles.mainTabButtonText,
            currentSection === "NOTIFICATIONS" && styles.mainTabButtonTextActive,
          ]}
        >
          Avisos & Tarefas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.mainTabButton,
          currentSection === "MEDICATIONS" && styles.mainTabButtonActive,
        ]}
        onPress={() => onSelectSection("MEDICATIONS")}
        activeOpacity={0.7}
      >
        <FontAwesomeFreeSolid
          name="pills"
          size={14}
          color={
            currentSection === "MEDICATIONS"
              ? theme.colors.primary
              : theme.colors.secondary
          }
        />
        <Text
          style={[
            styles.mainTabButtonText,
            currentSection === "MEDICATIONS" && styles.mainTabButtonTextActive,
          ]}
        >
          Medicamentos Prescritos
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainTabSwitcher: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    padding: 6,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  mainTabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 8,
    borderRadius: theme.borderRadius.md,
  },
  mainTabButtonActive: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  mainTabButtonText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.secondary,
  },
  mainTabButtonTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
});
