import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { theme } from "../../../../theme/theme";
import { ITrainingResponse, TraningStatus } from "../../../types/Training";
import { useAlert } from "../../../hooks/useAlert";
import { STAGE_EXERCISES } from "../constants/stageExercisesData";
import {
  ExecuteExerciseItem,
  ExecuteModalActions,
  ExecuteModalBanners,
  ExecuteModalHeader,
} from "./executeModal";

interface ExecuteTrainingModalProps {
  visible: boolean;
  training: ITrainingResponse | null;
  todaySession?: any;
  onClose: () => void;
  onSaveSession: (stageNumber: number, data: Record<string, boolean>) => Promise<void>;
  onFinalizeStage: (stageNumber: number, status: TraningStatus, data: Record<string, boolean>) => Promise<void>;
  submitting: boolean;
}

export const ExecuteTrainingModal: React.FC<ExecuteTrainingModalProps> = ({
  visible,
  training,
  todaySession,
  onClose,
  onSaveSession,
  onFinalizeStage,
  submitting,
}) => {
  const { showConfirm, AlertModal } = useAlert();
  const stage = training?.currentStage || 1;
  const exercises = STAGE_EXERCISES[stage] || STAGE_EXERCISES[1];
  const sessionsCount = training?.totalSessionsRecorded || 0;
  const isTodaySessionRecorded = Boolean(todaySession);
  const todaySessionNumber = todaySession?.sessionNumber || (sessionsCount > 0 ? sessionsCount : 1);
  const nextSessionNumber = isTodaySessionRecorded
    ? todaySessionNumber
    : Math.min(sessionsCount + 1, 21);
  const isMaxSessionsReached = sessionsCount >= 21;

  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (visible) {
      if (todaySession) {
        const initial: Record<string, boolean> = {};
        exercises.forEach((ex) => {
          initial[ex.key] = Boolean(todaySession[ex.key]);
        });
        setChecks(initial);
      } else {
        setChecks({});
      }
    }
  }, [visible, training, todaySession]);

  const handleToggle = (key: string, value: boolean) => {
    setChecks((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleConfirmApto = () => {
    showConfirm(
      stage >= 4 ? "Concluir Cão-Guia" : `Aprovar Etapa ${stage}`,
      stage >= 4
        ? `Deseja confirmar a aprovação (Apto) para ${training?.dogsName || "o cão"}? Isso encerrará com sucesso o treinamento completo de Cão-Guia!`
        : `Deseja aprovar (Apto) a Etapa ${stage}? ${training?.dogsName || "O cão"} avançará para a Etapa ${stage + 1}.`,
      () => {
        setTimeout(() => {
          onFinalizeStage(stage, TraningStatus.Apto, checks);
        }, 120);
      },
      stage >= 4 ? "Concluir Treinamento" : "Aprovar Etapa",
      "Cancelar",
    );
  };

  const handleConfirmInapto = () => {
    showConfirm(
      `Finalizar como Inapto`,
      `Deseja realmente finalizar a Etapa ${stage} como INAPTO para ${training?.dogsName || "o cão"}? Esta ação encerrará definitivamente o treinamento no sistema.`,
      () => {
        setTimeout(() => {
          onFinalizeStage(stage, TraningStatus.Inapto, checks);
        }, 120);
      },
      "Confirmar Inapto",
      "Cancelar",
    );
  };

  const completedCount = exercises.filter((e) => checks[e.key]).length;
  const progressPercent = Math.round((completedCount / exercises.length) * 100);
  const todayFormatted = new Date().toLocaleDateString("pt-BR");

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={onClose} />
          <View style={styles.modalContentCard}>
            <ExecuteModalHeader
              dogName={training?.dogsName}
              stage={stage}
              isTodaySessionRecorded={isTodaySessionRecorded}
              todaySessionNumber={todaySessionNumber}
              nextSessionNumber={nextSessionNumber}
              isMaxSessionsReached={isMaxSessionsReached}
              todayFormatted={todayFormatted}
              onClose={onClose}
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}
              keyboardShouldPersistTaps="handled"
            >
              <ExecuteModalBanners
                isTodaySessionRecorded={isTodaySessionRecorded}
                todaySessionNumber={todaySessionNumber}
                isMaxSessionsReached={isMaxSessionsReached}
                completedCount={completedCount}
                totalExercises={exercises.length}
                progressPercent={progressPercent}
              />

              {exercises.map((item) => (
                <ExecuteExerciseItem
                  key={item.key}
                  itemKey={item.key}
                  label={item.label}
                  isChecked={Boolean(checks[item.key])}
                  onToggle={handleToggle}
                />
              ))}

              <ExecuteModalActions
                stage={stage}
                submitting={submitting}
                isTodaySessionRecorded={isTodaySessionRecorded}
                todaySessionNumber={todaySessionNumber}
                nextSessionNumber={nextSessionNumber}
                isMaxSessionsReached={isMaxSessionsReached}
                onSaveDailySession={() => onSaveSession(stage, checks)}
                onConfirmApto={handleConfirmApto}
                onConfirmInapto={handleConfirmInapto}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AlertModal />
    </>
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
    maxHeight: "90%",
    paddingBottom: 20,
    ...theme.shadows.md,
  },
  scrollList: {
    padding: 16,
    gap: 8,
  },
});
