import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { Button } from "../../../shared/components/ButtonComponent";
import { CheckBox } from "../../../shared/components/CheckBoxComponent";
import {
  ITrainingResponse,
  TraningStatus,
} from "../../../types/Training";
import { useAlert } from "../../../hooks/useAlert";

interface ExerciseItem {
  key: string;
  label: string;
}

const STAGE_EXERCISES: Record<number, ExerciseItem[]> = {
  1: [
    { key: "availability", label: "Disponibilidade para o trabalho" },
    { key: "sit", label: "Comando Sentar" },
    { key: "lieDown", label: "Comando Deitar" },
    { key: "standUp", label: "Comando Ficar em Pé" },
    { key: "left", label: "Comando Esquerda" },
    { key: "right", label: "Comando Direita" },
    { key: "foodControl", label: "Controle de comida / Refeição" },
    { key: "boxGuides", label: "Guias em Box" },
    { key: "legResistance", label: "Resistência nas pernas" },
    { key: "harnessResistance", label: "Resistência ao arnês" },
    { key: "wearHarness", label: "Uso e colocação do arnês" },
    { key: "submission", label: "Submissão e foco" },
    { key: "openDoor", label: "Passagem por portas abertas" },
  ],
  2: [
    { key: "hallwayAvailability", label: "Disponibilidade em corredores" },
    { key: "wearHarness", label: "Uso do arnês em deslocamento" },
    { key: "left", label: "Comando Esquerda" },
    { key: "right", label: "Comando Direita" },
    { key: "forwardWithHarness", label: "Avançar com arnês" },
    { key: "turning", label: "Voltas e giros" },
    { key: "leftWithHarness", label: "Virar à esquerda com arnês" },
    { key: "rightWithHarness", label: "Virar à direita com arnês" },
    { key: "aerialObstacle", label: "Desvio de obstáculo aéreo" },
    { key: "lateralObstacle", label: "Desvio de obstáculo lateral" },
    { key: "groundObstacle", label: "Desvio de obstáculo de solo" },
    { key: "variedSurfaces", label: "Superfícies variadas" },
    { key: "narrowPassages", label: "Passagens estreitas" },
    { key: "generalObedience", label: "Obediência geral" },
  ],
  3: [
    { key: "wearHarness", label: "Uso do arnês" },
    { key: "aerialObstacle", label: "Obstáculo aéreo" },
    { key: "lateralObstacle", label: "Obstáculo lateral" },
    { key: "back", label: "Comando Voltar / Retorno" },
    { key: "right", label: "Comando Direita" },
    { key: "left", label: "Comando Esquerda" },
    { key: "groundObstacle", label: "Obstáculo de solo" },
    { key: "curb", label: "Meio-fio / Identificação de calçada" },
    { key: "crosswalk", label: "Faixa de pedestres" },
    { key: "fourCorners", label: "Cruzamento em quatro esquinas" },
    { key: "sidewalkReturn", label: "Retorno seguro à calçada" },
    { key: "generalObedience", label: "Obediência geral" },
    { key: "attractionBehavior", label: "Controle de distrações/atrações" },
    { key: "recall", label: "Comando de retorno/chamada" },
  ],
  4: [
    { key: "wearHarness", label: "Uso do arnês" },
    { key: "right", label: "Comando Direita" },
    { key: "left", label: "Comando Esquerda" },
    { key: "back", label: "Retorno" },
    { key: "curb", label: "Meio-fio urbano" },
    { key: "entranceExit", label: "Entrada e saída de recintos" },
    { key: "stairs", label: "Subir e descer escadas" },
    { key: "sidewalkReturn", label: "Retorno à calçada" },
    { key: "searchSeat", label: "Busca e localização de assento" },
    { key: "pedestrianCrossing", label: "Travessia de pedestres" },
    { key: "aerialObstacle", label: "Obstáculo aéreo urbano" },
    { key: "lateralObstacle", label: "Obstáculo lateral urbano" },
    { key: "groundObstacle", label: "Obstáculo de solo urbano" },
    { key: "trafficLightCrossing", label: "Travessia com semáforo" },
    { key: "shoppingCenter", label: "Ambiente de shopping / fluxo" },
    { key: "rolling", label: "Escada rolante / esteira" },
    { key: "elevator", label: "Entrada e saída de elevador" },
    { key: "commercialCenter", label: "Centro comercial" },
    { key: "cityCenter", label: "Centro da cidade" },
    { key: "busTerminal", label: "Terminal rodoviário/urbano" },
    { key: "bus", label: "Viagem de ônibus" },
    { key: "subway", label: "Viagem de metrô/trem" },
    { key: "intelligentDisobedience", label: "Desobediência inteligente (perigo)" },
    { key: "blindfoldedWalk", label: "Caminhada com condutor vendado" },
    { key: "busStop", label: "Ponto de ônibus" },
    { key: "atm", label: "Caixa eletrônico / fila" },
    { key: "bathroomWalk", label: "Condução ao banheiro" },
  ],
};

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
            {/* CABEÇALHO */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <MaterialDesignIcons
                    name="school"
                    size={22}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {training?.dogsName || "Cão"} • Etapa {stage} de 4
                  </Text>
                </View>
                <Text style={styles.modalSubtitle}>
                  {isTodaySessionRecorded
                    ? `Atualizando Sessão de Hoje (${todaySessionNumber}/21) • Data: ${todayFormatted}`
                    : isMaxSessionsReached
                    ? `Etapa com 21/21 sessões concluídas`
                    : `Sessão ${nextSessionNumber} de 21 • Data: ${todayFormatted}`}
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={styles.modalCloseButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialDesignIcons
                  name="close"
                  size={22}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* LISTA DE EXERCÍCIOS DA ETAPA */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}
              keyboardShouldPersistTaps="handled"
            >
              {/* ALERTA DE SESSÃO DO DIA / LIMITE DE 21 SESSÕES */}
              {isTodaySessionRecorded ? (
                <View style={styles.todayBanner}>
                  <MaterialDesignIcons
                    name="calendar-check"
                    size={18}
                    color="#0284C7"
                  />
                  <Text style={styles.todayBannerText}>
                    Treinamento de hoje já registrado. As alterações atualizarão a sessão existente (Sessão {todaySessionNumber} de 21) sem criar registros duplicados.
                  </Text>
                </View>
              ) : isMaxSessionsReached ? (
                <View style={styles.warningBanner}>
                  <MaterialDesignIcons
                    name="alert-circle"
                    size={18}
                    color="#B91C1C"
                  />
                  <Text style={styles.warningBannerText}>
                    Limite máximo de 21 sessões atingido para esta etapa! Não é possível
                    adicionar novos treinos diários. Avalie o cão e finalize a etapa para avançar.
                  </Text>
                </View>
              ) : (
                <View style={styles.infoBanner}>
                  <MaterialDesignIcons
                    name="information-outline"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.infoBannerText}>
                    Marque os exercícios cumpridos na sessão de hoje ({completedCount}/{exercises.length} - {progressPercent}%).
                  </Text>
                </View>
              )}

              {exercises.map((item) => {
                const isChecked = Boolean(checks[item.key]);
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.exerciseRow,
                      isChecked && styles.exerciseRowChecked,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleToggle(item.key, !isChecked)}
                  >
                    <View pointerEvents="none">
                      <CheckBox
                        value={isChecked}
                        onChangeChecked={(val) => handleToggle(item.key, val)}
                        label={item.label}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* BOTÕES DE AÇÃO */}
              <View style={styles.actionsContainer}>
                {(!isMaxSessionsReached || isTodaySessionRecorded) && (
                  <Button
                    text={
                      submitting
                        ? isTodaySessionRecorded
                          ? "Atualizando..."
                          : "Gravando..."
                        : isTodaySessionRecorded
                        ? `Atualizar Sessão de Hoje (${todaySessionNumber}/21)`
                        : `Salvar Sessão Diária (${nextSessionNumber}/21)`
                    }
                    onPress={() => onSaveSession(stage, checks)}
                    disabled={submitting}
                  />
                )}

                <View style={styles.finalizeRow}>
                  <TouchableOpacity
                    style={[
                      styles.finalizeButton,
                      styles.finalizeButtonApto,
                      isMaxSessionsReached && { flex: 1 },
                    ]}
                    onPress={handleConfirmApto}
                    disabled={submitting}
                    activeOpacity={0.8}
                  >
                    <FontAwesomeFreeSolid
                      name="check"
                      size={14}
                      color={theme.colors.white}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.finalizeButtonText}>
                      {stage >= 4
                        ? "Concluir Cão-Guia (Apto)"
                        : `Aprovar Etapa ${stage} (Apto)`}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.finalizeButton,
                      styles.finalizeButtonInapto,
                    ]}
                    onPress={handleConfirmInapto}
                    disabled={submitting}
                    activeOpacity={0.8}
                  >
                    <MaterialDesignIcons
                      name="close"
                      size={16}
                      color={theme.colors.white}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.finalizeButtonText}>
                      Inapto
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL PERSONALIZADO DE CONFIRMAÇÃO (APTO / INAPTO) */}
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
    gap: 8,
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
  },
  scrollList: {
    padding: 20,
    gap: 10,
  },
  todayBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0F9FF",
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    marginBottom: 6,
  },
  todayBannerText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#0369A1",
    flex: 1,
    lineHeight: 16,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 6,
  },
  warningBannerText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#991B1B",
    flex: 1,
    lineHeight: 16,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 6,
  },
  infoBannerText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#166534",
    flex: 1,
  },
  exerciseRow: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  exerciseRowChecked: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  actionsContainer: {
    marginTop: 16,
    gap: 10,
    paddingBottom: 10,
  },
  finalizeRow: {
    flexDirection: "row",
    gap: 10,
  },
  finalizeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
  },
  finalizeButtonApto: {
    flex: 2,
    backgroundColor: "#059669",
  },
  finalizeButtonInapto: {
    flex: 1,
    backgroundColor: "#DC2626",
  },
  finalizeButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
});
