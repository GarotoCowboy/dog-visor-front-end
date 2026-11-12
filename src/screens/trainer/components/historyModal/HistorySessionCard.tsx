import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { TraningStatus } from "../../../../types/Training";
import { getSessionActiveTasks } from "../../constants/stageExercisesData";

interface HistorySessionCardProps {
  session: any;
  index: number;
  formatDate: (dateStr?: string) => string;
}

export const HistorySessionCard: React.FC<HistorySessionCardProps> = ({
  session,
  index,
  formatDate,
}) => {
  const sessionNum = session.sessionNumber || index + 1;
  const sessionDate = session.trainingDate || session.createdAt;
  const tasks = getSessionActiveTasks(session);

  return (
    <View style={styles.sessionCard}>
      {/* CABEÇALHO DA SESSÃO */}
      <View style={styles.sessionCardHeader}>
        <View style={styles.sessionNumberBadge}>
          <FontAwesomeFreeSolid
            name="calendar-day"
            size={11}
            color="#2E6B65"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.sessionNumberBadgeText}>
            Sessão {sessionNum} de 21
          </Text>
        </View>

        <Text style={styles.sessionDateText}>{formatDate(sessionDate)}</Text>

        {session.status && (
          <View
            style={[
              styles.sessionFinalStatusBadge,
              session.status === TraningStatus.Apto
                ? styles.sessionFinalApto
                : styles.sessionFinalInapto,
            ]}
          >
            <Text
              style={[
                styles.sessionFinalStatusText,
                session.status === TraningStatus.Apto
                  ? { color: "#15803D" }
                  : { color: "#B91C1C" },
              ]}
            >
              {session.status}
            </Text>
          </View>
        )}
      </View>

      {/* TAREFAS CUMPRIDAS */}
      <View style={styles.tasksSection}>
        <Text style={styles.tasksSummaryText}>
          Tarefas cumpridas no dia ({tasks.length}):
        </Text>

        {tasks.length > 0 ? (
          <View style={styles.chipsRow}>
            {tasks.map((taskName, taskIdx) => (
              <View key={taskIdx} style={styles.taskChip}>
                <MaterialDesignIcons
                  name="check"
                  size={12}
                  color="#059669"
                  style={{ marginRight: 2 }}
                />
                <Text style={styles.taskChipText}>{taskName}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noTasksText}>
            Nenhum exercício marcado como concluído nesta sessão.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 8,
  },
  sessionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionNumberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sessionNumberBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#2E6B65",
  },
  sessionDateText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#6B7280",
  },
  sessionFinalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sessionFinalApto: {
    backgroundColor: "#DCFCE7",
  },
  sessionFinalInapto: {
    backgroundColor: "#FEE2E2",
  },
  sessionFinalStatusText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
  },
  tasksSection: {
    gap: 6,
  },
  tasksSummaryText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#4B5563",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  taskChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  taskChipText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: "#374151",
  },
  noTasksText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});

