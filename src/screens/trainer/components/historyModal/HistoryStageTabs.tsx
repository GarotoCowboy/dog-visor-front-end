import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../../../../theme/theme";

interface HistoryStageTabsProps {
  selectedStage: number;
  onSelectStage: (stage: number) => void;
}

export const HistoryStageTabs: React.FC<HistoryStageTabsProps> = ({
  selectedStage,
  onSelectStage,
}) => {
  return (
    <View style={styles.stageTabsContainer}>
      {[1, 2, 3, 4].map((stageNum) => {
        const isActive = selectedStage === stageNum;
        return (
          <TouchableOpacity
            key={stageNum}
            style={[
              styles.stageTabButton,
              isActive && styles.stageTabButtonActive,
            ]}
            onPress={() => onSelectStage(stageNum)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.stageTabText,
                isActive && styles.stageTabTextActive,
              ]}
            >
              Etapa {stageNum}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  stageTabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: theme.borderRadius.sm,
    padding: 3,
    gap: 4,
  },
  stageTabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: theme.borderRadius.sm - 2,
  },
  stageTabButtonActive: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  stageTabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 12,
    color: "#6B7280",
  },
  stageTabTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
});

