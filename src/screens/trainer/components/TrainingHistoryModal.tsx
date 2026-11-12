import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { theme } from "../../../../theme/theme";
import {
  ITrainingReportResponse,
  ITrainingResponse,
  TraningStatus,
} from "../../../types/Training";
import {
  HistoryEmptySessions,
  HistoryModalHeader,
  HistorySessionCard,
  HistoryStageSummaryCard,
  HistoryStageTabs,
  HistoryTestsSummaryCard,
  useTrainingHistoryData,
} from "./historyModal";

interface TrainingHistoryModalProps {
  visible: boolean;
  training: ITrainingResponse | null;
  report: ITrainingReportResponse | null;
  historyItems?: any[];
  onClose: () => void;
}

export const TrainingHistoryModal: React.FC<TrainingHistoryModalProps> = ({
  visible,
  training,
  report,
  historyItems = [],
  onClose,
}) => {
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const { dogTests, resolvedTrainingTrainerName } = useTrainingHistoryData({
    visible,
    training,
    report,
  });

  useEffect(() => {
    if (visible && training?.currentStage) {
      setSelectedStage(Math.min(Math.max(training.currentStage, 1), 4));
    }
  }, [visible, training]);

  // Obtém dados da etapa selecionada a partir do relatório ou fallback de histórico
  const getStageReport = () => {
    if (report) {
      if (selectedStage === 1) return report.stage1;
      if (selectedStage === 2) return report.stage2;
      if (selectedStage === 3) return report.stage3;
      if (selectedStage === 4) return report.stage4;
    }
    return null;
  };

  const currentStageReport = getStageReport();

  const sessions: any[] = currentStageReport
    ? currentStageReport.sessions || []
    : historyItems.filter((i) => (i.stageNumber || 1) === selectedStage);

  const totalSessions = currentStageReport
    ? currentStageReport.totalSessionsRecorded
    : sessions.length;

  const rawStatus =
    currentStageReport?.status ||
    (training?.status === TraningStatus.Apto && (training.currentStage || 1) > selectedStage
      ? "CONCLUIDA"
      : (training?.currentStage || 1) === selectedStage
      ? "EM_ANDAMENTO"
      : (training?.currentStage || 1) > selectedStage
      ? "CONCLUIDA"
      : "NAO_INICIADA");

  const progressPercent = Math.min(Math.round((totalSessions / 21) * 100), 100);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Data não informada";
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalContentCard}>
          <HistoryModalHeader
            training={training}
            resolvedTrainerName={resolvedTrainingTrainerName}
            onClose={onClose}
          />

          <HistoryStageTabs
            selectedStage={selectedStage}
            onSelectStage={setSelectedStage}
          />

          <HistoryStageSummaryCard
            selectedStage={selectedStage}
            rawStatus={rawStatus}
            totalSessions={totalSessions}
            progressPercent={progressPercent}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollList}
          >
            <HistoryTestsSummaryCard
              dogTests={dogTests}
              formatDate={formatDate}
            />

            {sessions.length === 0 ? (
              <HistoryEmptySessions selectedStage={selectedStage} />
            ) : (
              sessions.map((session, idx) => (
                <HistorySessionCard
                  key={session.id || idx}
                  session={session}
                  index={idx}
                  formatDate={formatDate}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContentCard: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: "88%",
    paddingBottom: 24,
    ...theme.shadows.md,
  },
  scrollList: {
    padding: 16,
    gap: 12,
  },
});
