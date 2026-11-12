import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../../theme/theme";
import { Card } from "../../../../shared/components/CardComponent";
import {
  IDogTest,
  ITrainingReportResponse,
  ITrainingResponse,
  TestStatus,
  TestType,
  TraningStatus,
} from "../../../../types/Training";
import { IDogResponse } from "../../../../types/Dog";

interface DogTrainingTestsCardProps {
  dog: IDogResponse;
  training: ITrainingResponse | null;
  report: ITrainingReportResponse | null;
  tests: IDogTest[];
  loadingTraining: boolean;
  loadingTests: boolean;
  onOpenReport: () => void;
}

export const DogTrainingTestsCard: React.FC<DogTrainingTestsCardProps> = ({
  dog,
  training,
  report,
  tests,
  loadingTraining,
  loadingTests,
  onOpenReport,
}) => {
  const [activeTab, setActiveTab] = useState<"TREINAMENTO" | "TESTES">("TREINAMENTO");

  const currentStage = report?.currentStage || training?.currentStage || 1;
  const trainingStatus = report?.status || training?.status;

  // Filtra testes apenas deste cão
  const dogId = dog.ID;
  const dogTests = tests.filter((t) => t.dogId === dogId);

  const isApto = trainingStatus === TraningStatus.Apto;
  const isInapto = trainingStatus === TraningStatus.Inapto;

  return (
    <Card>
      <View style={styles.container}>
        {/* CABEÇALHO COM ABAS */}
        <View style={styles.header}>
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "TREINAMENTO" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("TREINAMENTO")}
              activeOpacity={0.8}
            >
              <MaterialDesignIcons
                name="school"
                size={18}
                color={
                  activeTab === "TREINAMENTO"
                    ? theme.colors.primary
                    : "#4B5563"
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "TREINAMENTO" && styles.tabTextActive,
                ]}
              >
                Treinamento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "TESTES" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("TESTES")}
              activeOpacity={0.8}
            >
              <MaterialDesignIcons
                name="clipboard-text-outline"
                size={18}
                color={
                  activeTab === "TESTES"
                    ? theme.colors.primary
                    : "#4B5563"
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "TESTES" && styles.tabTextActive,
                ]}
              >
                Testes ({dogTests.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CONTEÚDO DA ABA: TREINAMENTO */}
        {activeTab === "TREINAMENTO" && (
          <View style={styles.contentSection}>
            {loadingTraining ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={{ marginVertical: 14 }}
              />
            ) : (
              <View style={styles.trainingSection}>
                <View style={styles.trainingInfoRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.trainingTitle}>
                      {isApto
                        ? "Treinamento Cão-Guia Concluído"
                        : isInapto
                        ? "Treinamento Encerrado (Inapto)"
                        : `Treinamento de Cão-Guia • Etapa ${currentStage} de 4`}
                    </Text>
                    <Text style={styles.trainingSubtitle}>
                      {isApto
                        ? "Cão habilitado com sucesso em todas as 4 etapas"
                        : isInapto
                        ? "Treinamento finalizado sem aptidão"
                        : "Acompanhamento diário das etapas de aprendizagem"}
                    </Text>
                    {Boolean(training?.trainerName || report?.trainerName) && (
                      <View style={styles.trainerRow}>
                        <MaterialDesignIcons
                          name="account-tie-outline"
                          size={13}
                          color="#2E6B65"
                        />
                        <Text style={styles.trainerLabelText}>
                          Treinador(a):{" "}
                          <Text style={styles.trainerValueText}>
                            {training?.trainerName || report?.trainerName}
                          </Text>
                        </Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      isApto
                        ? styles.statusBadgeApto
                        : isInapto
                        ? styles.statusBadgeInapto
                        : styles.statusBadgeEmAndamento,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        isApto
                          ? styles.statusBadgeTextApto
                          : isInapto
                          ? styles.statusBadgeTextInapto
                          : styles.statusBadgeTextEmAndamento,
                      ]}
                    >
                      {isApto
                        ? "Apto"
                        : isInapto
                        ? "Inapto"
                        : `Etapa ${currentStage}`}
                    </Text>
                  </View>
                </View>

                {/* BOTÃO PARA VISUALIZAR RELATÓRIO COMPLETO */}
                <TouchableOpacity
                  style={styles.viewReportButton}
                  onPress={onOpenReport}
                  activeOpacity={0.8}
                >
                  <MaterialDesignIcons
                    name="file-document-outline"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.viewReportButtonText}>
                    Ver Relatório Completo por Etapa
                  </Text>
                  <MaterialDesignIcons
                    name="chevron-right"
                    size={16}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* CONTEÚDO DA ABA: TESTES (VOLHARD & BEHAVIOR) */}
        {activeTab === "TESTES" && (
          <View style={styles.contentSection}>
            {loadingTests ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={{ marginVertical: 14 }}
              />
            ) : dogTests.length === 0 ? (
              <View style={styles.emptyTestsBox}>
                <MaterialDesignIcons
                  name="clipboard-alert-outline"
                  size={32}
                  color="#9CA3AF"
                />
                <Text style={styles.emptyTestsTitle}>
                  Nenhum teste registrado
                </Text>
                <Text style={styles.emptyTestsText}>
                  Não há testes Volhard ou comportamentais cadastrados para {dog.name}.
                </Text>
              </View>
            ) : (
              <View style={styles.testsList}>
                {dogTests.map((t) => {
                  const isVolhard = t.type === TestType.VOLHARD;
                  const isCompleted = t.status === TestStatus.COMPLETED;

                  return (
                    <View key={t.id} style={styles.testItem}>
                      <View style={styles.testItemHeader}>
                        <View style={styles.testTypeChip}>
                          <MaterialDesignIcons
                            name={isVolhard ? "clipboard-check-outline" : "paw"}
                            size={14}
                            color="#2E6B65"
                          />
                          <Text style={styles.testTypeChipText}>
                            {isVolhard ? "Teste Volhard" : "Teste Behavior"}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.testStatusChip,
                            isCompleted
                              ? styles.testStatusCompleted
                              : styles.testStatusPending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.testStatusChipText,
                              isCompleted
                                ? styles.testStatusTextCompleted
                                : styles.testStatusTextPending,
                            ]}
                          >
                            {isCompleted ? "Concluído" : "Pendente"}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.testTitle}>{t.title}</Text>

                      <View style={styles.testMetaRow}>
                        {Boolean(t.date) && (
                          <View style={styles.testDateRow}>
                            <MaterialDesignIcons
                              name="calendar-month-outline"
                              size={13}
                              color="#6B7280"
                            />
                            <Text style={styles.testDateText}>{t.date}</Text>
                          </View>
                        )}

                        <View style={styles.trainerRow}>
                          <MaterialDesignIcons
                            name="account-tie-outline"
                            size={13}
                            color="#2E6B65"
                          />
                          <Text style={styles.trainerLabelText}>
                            Treinador(a):{" "}
                            <Text style={styles.trainerValueText}>
                              {t.trainerName || "Não identificado"}
                            </Text>
                          </Text>
                        </View>
                      </View>

                      {Boolean(t.description) && (
                        <Text style={styles.testDesc} numberOfLines={3}>
                          {t.description}
                        </Text>
                      )}

                      {Boolean(t.score) && (
                        <View style={styles.scoreRow}>
                          <Text style={styles.scoreLabel}>Resultado:</Text>
                          <Text style={styles.scoreValue}>{t.score}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
  },
  tabTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  contentSection: {
    paddingTop: 4,
  },
  trainingSection: {
    gap: 12,
  },
  trainingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  trainingTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  trainingSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  statusBadgeApto: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeInapto: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeEmAndamento: {
    backgroundColor: "#E0F2FE",
  },
  statusBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
  },
  statusBadgeTextApto: {
    color: "#166534",
  },
  statusBadgeTextInapto: {
    color: "#991B1B",
  },
  statusBadgeTextEmAndamento: {
    color: "#0369A1",
  },
  viewReportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
  },
  viewReportButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
  emptyTestsBox: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 6,
  },
  emptyTestsTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  emptyTestsText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
  testsList: {
    gap: 10,
  },
  testItem: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  testItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  testTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  testTypeChipText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#2E6B65",
  },
  testStatusChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  testStatusCompleted: {
    backgroundColor: "#DCFCE7",
  },
  testStatusPending: {
    backgroundColor: "#FEF3C7",
  },
  testStatusChipText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
  },
  testStatusTextCompleted: {
    color: "#166534",
  },
  testStatusTextPending: {
    color: "#B45309",
  },
  testTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  testMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  testDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  testDateText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: "#6B7280",
  },
  trainerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  trainerLabelText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#4B5563",
  },
  trainerValueText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#2E6B65",
  },
  testDesc: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#4B5563",
    lineHeight: 16,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignSelf: "flex-start",
  },
  scoreLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 10,
    color: "#6B7280",
  },
  scoreValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.primary,
  },
});
