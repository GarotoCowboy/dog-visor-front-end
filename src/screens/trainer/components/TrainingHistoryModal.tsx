import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

import { theme } from "../../../../theme/theme";
import {
  ITrainingReportResponse,
  ITrainingResponse,
  TraningStatus,
} from "../../../types/Training";

const STAGE_TITLES: Record<number, string> = {
  1: "Comandos Básicos",
  2: "Guias e Obstáculos",
  3: "Trânsito e Calçadas",
  4: "Ambiente Urbano",
};

const STAGE_EXERCISE_LABELS: Record<string, string> = {
  // Etapa 1
  availability: "Disponibilidade p/ Trabalho",
  sit: "Comando Sentar",
  lieDown: "Comando Deitar",
  standUp: "Comando Ficar em Pé",
  left: "Comando Esquerda",
  right: "Comando Direita",
  foodControl: "Controle de Comida",
  boxGuides: "Guias em Box",
  legResistance: "Resistência nas Pernas",
  harnessResistance: "Resistência ao Arnês",
  wearHarness: "Uso do Arnês",
  submission: "Submissão e Foco",
  openDoor: "Passagem em Portas",
  // Etapa 2
  hallwayAvailability: "Disponibilidade Corredores",
  forwardWithHarness: "Avançar com Arnês",
  turning: "Voltas e Giros",
  leftWithHarness: "Virar Esquerda c/ Arnês",
  rightWithHarness: "Virar Direita c/ Arnês",
  aerialObstacle: "Obstáculo Aéreo",
  lateralObstacle: "Obstáculo Lateral",
  groundObstacle: "Obstáculo de Solo",
  movingObstacle: "Obstáculo em Movimento",
  variedSurfaces: "Superfícies Variadas",
  narrowPassages: "Passagens Estreitas",
  generalObedience: "Obediência Geral",
  // Etapa 3
  back: "Comando Retorno/Voltar",
  curb: "Meio-fio / Calçada",
  crosswalk: "Faixa de Pedestres",
  fourCorners: "Quatro Esquinas",
  sidewalkReturn: "Retorno à Calçada",
  attractionBehavior: "Controle de Distrações",
  recall: "Chamada / Recall",
  // Etapa 4
  entranceExit: "Entrada/Saída de Recintos",
  stairs: "Escadas",
  searchSeat: "Busca de Assento",
  pedestrianCrossing: "Travessia Pedestres",
  trafficLightCrossing: "Travessia Semáforo",
  shoppingCenter: "Shopping / Fluxo",
  rolling: "Escada Rolante",
  elevator: "Elevador",
  commercialCenter: "Centro Comercial",
  cityCenter: "Centro da Cidade",
  busTerminal: "Terminal Rodoviário",
  bus: "Viagem de Ônibus",
  subway: "Metrô/Trem",
  intelligentDisobedience: "Desobediência Inteligente",
  blindfoldedWalk: "Condutor Vendado",
  busStop: "Ponto de Ônibus",
  atm: "Caixa Eletrônico",
  bathroomWalk: "Condução ao Banheiro",
};

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

  const rawStatus = currentStageReport?.status || (
    training?.status === TraningStatus.Apto && (training.currentStage || 1) > selectedStage
      ? "CONCLUIDA"
      : (training?.currentStage || 1) === selectedStage
      ? "EM_ANDAMENTO"
      : (training?.currentStage || 1) > selectedStage
      ? "CONCLUIDA"
      : "NAO_INICIADA"
  );

  const progressPercent = Math.min(Math.round((totalSessions / 21) * 100), 100);

  // Formata data amigável
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

  // Extrai tarefas ativas (boolean === true) da sessão
  const getSessionTasks = (session: any): string[] => {
    const ignoredKeys = [
      "id",
      "trainingId",
      "trainingDate",
      "sessionNumber",
      "status",
      "createdAt",
    ];
    return Object.entries(session)
      .filter(([key, val]) => !ignoredKeys.includes(key) && val === true)
      .map(([key]) => STAGE_EXERCISE_LABELS[key] || key);
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
          {/* CABEÇALHO DO MODAL */}
          <View style={styles.modalHeader}>
            <View style={styles.titleRow}>
              <MaterialDesignIcons
                name="file-document-outline"
                size={22}
                color={theme.colors.primary}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  Relatório • {training?.dogsName || "Cão"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {training?.status === TraningStatus.Apto
                    ? "Treinamento Completo Concluído (Apto)"
                    : training?.status === TraningStatus.Inapto
                    ? "Treinamento Encerrado (Inapto)"
                    : `Etapa atual do cão: ${training?.currentStage || 1} de 4`}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <MaterialDesignIcons
                name="close"
                size={22}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* ABAS DAS 4 ETAPAS */}
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
                  onPress={() => setSelectedStage(stageNum)}
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

          {/* BANNER DE RESUMO DA ETAPA SELECIONADA */}
          <View style={styles.stageSummaryCard}>
            <View style={styles.summaryTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stageTitleText}>
                  Etapa {selectedStage}: {STAGE_TITLES[selectedStage]}
                </Text>
                <Text style={styles.stageSubtitleText}>
                  Controle de até 21 dias de treinamento
                </Text>
              </View>

              {/* BADGE DE STATUS DA ETAPA */}
              {rawStatus === "CONCLUIDA" ? (
                <View style={[styles.stageStatusBadge, styles.statusBadgeConcluida]}>
                  <MaterialDesignIcons name="check-circle" size={12} color="#15803D" />
                  <Text style={[styles.stageStatusText, { color: "#15803D" }]}>
                    Concluída
                  </Text>
                </View>
              ) : rawStatus === "EM_ANDAMENTO" ? (
                <View style={[styles.stageStatusBadge, styles.statusBadgeAndamento]}>
                  <MaterialDesignIcons name="progress-clock" size={12} color="#B45309" />
                  <Text style={[styles.stageStatusText, { color: "#B45309" }]}>
                    Em Andamento
                  </Text>
                </View>
              ) : (
                <View style={[styles.stageStatusBadge, styles.statusBadgeNaoIniciada]}>
                  <MaterialDesignIcons name="clock-outline" size={12} color="#6B7280" />
                  <Text style={[styles.stageStatusText, { color: "#6B7280" }]}>
                    Não Iniciada
                  </Text>
                </View>
              )}
            </View>

            {/* BARRA DE PROGRESSO DE 21 DIAS */}
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBarHeader}>
                <Text style={styles.progressLabel}>
                  {totalSessions} de 21 dias registrados
                </Text>
                <Text style={styles.progressLabel}>
                  {progressPercent}%
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor:
                        totalSessions >= 21
                          ? "#059669"
                          : theme.colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* LISTA DE SESSÕES REGISTRADAS */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollList}
          >
            {sessions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <FontAwesomeFreeSolid
                  name="calendar-times"
                  size={36}
                  color="#D1D5DB"
                />
                <Text style={styles.emptyTitle}>
                  Nenhuma sessão registrada
                </Text>
                <Text style={styles.emptySubtitle}>
                  Não foram registradas sessões de treino para a Etapa {selectedStage} ainda.
                </Text>
              </View>
            ) : (
              sessions.map((session, idx) => {
                const sessionNum =
                  session.sessionNumber || idx + 1;
                const sessionDate =
                  session.trainingDate || session.createdAt;
                const tasks = getSessionTasks(session);

                return (
                  <View key={session.id || idx} style={styles.sessionCard}>
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

                      <Text style={styles.sessionDateText}>
                        {formatDate(sessionDate)}
                      </Text>

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
                              <Text style={styles.taskChipText}>
                                {taskName}
                              </Text>
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
              })
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
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
  stageSummaryCard: {
    backgroundColor: "#F8FAFC",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  stageTitleText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  stageSubtitleText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  stageStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  statusBadgeConcluida: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeAndamento: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeNaoIniciada: {
    backgroundColor: "#F1F5F9",
  },
  stageStatusText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
  },
  progressBarWrapper: {
    gap: 4,
  },
  progressBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#475569",
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  scrollList: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  sessionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    gap: 10,
    ...theme.shadows.sm,
  },
  sessionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
  },
  sessionNumberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  sessionNumberBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#065F46",
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
    borderRadius: theme.borderRadius.full,
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
    gap: 6,
  },
  taskChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  taskChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 10,
    color: "#166534",
  },
  noTasksText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});
