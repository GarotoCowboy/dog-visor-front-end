import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { IDogTest, TestStatus } from "../../../../types/Training";

interface HistoryTestsSummaryCardProps {
  dogTests: IDogTest[];
  formatDate: (dateStr?: string) => string;
}

export const HistoryTestsSummaryCard: React.FC<HistoryTestsSummaryCardProps> = ({
  dogTests,
  formatDate,
}) => {
  if (dogTests.length === 0) return null;

  return (
    <View style={styles.testsSectionCard}>
      <View style={styles.testsSectionHeader}>
        <MaterialDesignIcons
          name="clipboard-check-outline"
          size={16}
          color="#2E6B65"
        />
        <Text style={styles.testsSectionTitle}>
          Testes Realizados ({dogTests.length})
        </Text>
      </View>

      {dogTests.map((t) => {
        const isCompleted = t.status === TestStatus.COMPLETED;
        return (
          <View key={t.id} style={styles.testHistoryItem}>
            <View style={styles.testHistoryTopRow}>
              <Text style={styles.testHistoryTitle}>{t.title}</Text>
              <Text style={styles.testHistoryDate}>{formatDate(t.date)}</Text>
            </View>
            <View style={styles.testHistoryTrainerRow}>
              <MaterialDesignIcons
                name="account-tie-outline"
                size={13}
                color="#4B5563"
              />
              <Text style={styles.testHistoryTrainerText}>
                Treinador(a): {t.trainerName || "Não identificado"}
              </Text>
            </View>
            {Boolean(t.score) && (
              <Text
                style={[
                  styles.testHistoryScore,
                  { color: isCompleted ? "#15803D" : "#B45309" },
                ]}
              >
                {t.score}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  testsSectionCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 12,
    gap: 8,
  },
  testsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  testsSectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: "#166534",
  },
  testHistoryItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    gap: 4,
  },
  testHistoryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  testHistoryTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: theme.colors.text,
  },
  testHistoryDate: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
  },
  testHistoryTrainerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  testHistoryTrainerText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#374151",
  },
  testHistoryScore: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
  },
});

