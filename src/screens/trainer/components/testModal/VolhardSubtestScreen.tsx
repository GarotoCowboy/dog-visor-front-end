import React, { memo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { IDogResponse } from "../../../../types/Dog";
import {
  IVolhardSubtestDefinition,
  VOLHARD_SUBTESTS,
  VolhardScoreFieldKey,
} from "../../constants/testQuestionsData";
import { SelectedDogBanner } from "./SelectedDogBanner";
import { VolhardInterpretationModal } from "./VolhardInterpretationModal";

export type VolhardScoresState = Record<VolhardScoreFieldKey, number | null>;

interface VolhardSubtestScreenProps {
  subtestIndex: number;
  selectedDog?: IDogResponse | null;
  volhardScores: VolhardScoresState;
  onBackToMenu: () => void;
  onSelectScore: (key: VolhardScoreFieldKey, score: number) => void;
  onNavigateSubtest: (nextIndex: number) => void;
  onOpenStructureScreen?: () => void;
}

export const VolhardSubtestScreen: React.FC<VolhardSubtestScreenProps> = memo(
  ({
    subtestIndex,
    selectedDog,
    volhardScores,
    onBackToMenu,
    onSelectScore,
    onNavigateSubtest,
    onOpenStructureScreen,
  }) => {
    const [showInterpretationModal, setShowInterpretationModal] =
      useState<boolean>(false);
    const subtest: IVolhardSubtestDefinition = VOLHARD_SUBTESTS[subtestIndex];
    const currentScore = volhardScores[subtest.key];

    return (
      <View style={styles.subScreenContainer}>
        {/* Cabeçalho da tela do subteste */}
        <View style={styles.subScreenHeader}>
          <TouchableOpacity
            style={styles.backToMenuButton}
            onPress={onBackToMenu}
          >
            <MaterialDesignIcons
              name="arrow-left"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.backToMenuText}>Menu Volhard</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              style={styles.guideHeaderButton}
              onPress={() => setShowInterpretationModal(true)}
              activeOpacity={0.75}
            >
              <MaterialDesignIcons
                name="lightbulb-outline"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.guideHeaderButtonText}>Guia</Text>
            </TouchableOpacity>

            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>
                Subteste {subtest.number} de {VOLHARD_SUBTESTS.length}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.subScreenScroll}
        >
          {/* BANNER COM A FOTO DO CÃO SELECIONADO */}
          <SelectedDogBanner dog={selectedDog} />

          {/* TÍTULO DO TESTE */}
          <View style={styles.subtestTitleBanner}>
            <Text style={styles.subtestNumberBadge}>
              SUBTESTE {subtest.number}
            </Text>
            <Text style={styles.subtestMainTitle}>{subtest.title}</Text>
          </View>

          {/* DESCRIÇÃO DO TESTE */}
          <View style={styles.infoBox}>
            <View style={styles.infoBoxHeader}>
              <MaterialDesignIcons
                name="clipboard-text-outline"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.infoBoxTitle}>Descrição do Teste</Text>
            </View>
            <Text style={styles.infoBoxBody}>{subtest.description}</Text>
          </View>

          {/* PROPOSTA / PROPÓSITO DO TESTE */}
          <View style={[styles.infoBox, styles.purposeBox]}>
            <View style={styles.infoBoxHeader}>
              <MaterialDesignIcons name="target" size={18} color="#0F766E" />
              <Text style={[styles.infoBoxTitle, { color: "#0F766E" }]}>
                Proposta / Propósito do Teste
              </Text>
            </View>
            <Text style={styles.infoBoxBody}>{subtest.purpose}</Text>
          </View>

          {/* PONTUAÇÃO (CHECKBOX DE MARCAÇÃO ÚNICA) */}
          <View style={styles.scoreSection}>
            <Text style={styles.scoreSectionTitle}>
              Pontuação (Marcação única)
            </Text>
            <Text style={styles.scoreSectionSubtitle}>
              Selecione apenas uma opção abaixo correspondente à reação do
              filhote:
            </Text>

            <View style={styles.checkboxList}>
              {subtest.options.map((opt) => {
                const isChecked = currentScore === opt.score;
                return (
                  <TouchableOpacity
                    key={opt.score}
                    style={[
                      styles.checkboxRow,
                      isChecked && styles.checkboxRowSelected,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => {
                      onSelectScore(subtest.key, opt.score);
                    }}
                  >
                    <MaterialDesignIcons
                      name={
                        isChecked
                          ? "checkbox-marked"
                          : "checkbox-blank-outline"
                      }
                      size={24}
                      color={isChecked ? theme.colors.primary : "#9CA3AF"}
                    />
                    <View style={styles.checkboxTextWrapper}>
                      <Text
                        style={[
                          styles.checkboxLabel,
                          isChecked && styles.checkboxLabelSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.scoreNumberCircle,
                        isChecked && styles.scoreNumberCircleSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.scoreNumberCircleText,
                          isChecked && styles.scoreNumberCircleTextSelected,
                        ]}
                      >
                        {opt.score}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Navegação entre os testes do Volhard */}
        <View style={styles.subScreenFooter}>
          <TouchableOpacity
            style={[
              styles.navStepButton,
              subtestIndex === 0 && styles.navStepButtonDisabled,
            ]}
            disabled={subtestIndex === 0}
            onPress={() => onNavigateSubtest(subtestIndex - 1)}
          >
            <MaterialDesignIcons
              name="chevron-left"
              size={20}
              color={subtestIndex === 0 ? "#9CA3AF" : theme.colors.text}
            />
            <Text
              style={[
                styles.navStepButtonText,
                subtestIndex === 0 && { color: "#9CA3AF" },
              ]}
            >
              Anterior
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navMenuCenterButton}
            onPress={onBackToMenu}
          >
            <MaterialDesignIcons
              name="view-grid-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={styles.navMenuCenterText}>Menu</Text>
          </TouchableOpacity>

          {subtestIndex < VOLHARD_SUBTESTS.length - 1 ? (
            <TouchableOpacity
              style={[styles.navStepButton, styles.navStepButtonPrimary]}
              onPress={() => onNavigateSubtest(subtestIndex + 1)}
            >
              <Text style={styles.navStepButtonTextPrimary}>Próximo</Text>
              <MaterialDesignIcons
                name="chevron-right"
                size={20}
                color={theme.colors.white}
              />
            </TouchableOpacity>
          ) : onOpenStructureScreen ? (
            <TouchableOpacity
              style={[
                styles.navStepButton,
                styles.navStepButtonPrimary,
                { backgroundColor: "#0F766E", borderColor: "#0F766E" },
              ]}
              onPress={onOpenStructureScreen}
            >
              <Text style={styles.navStepButtonTextPrimary}>Ir p/ Estrutura</Text>
              <MaterialDesignIcons
                name="chevron-right"
                size={20}
                color={theme.colors.white}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navStepButton, styles.navStepButtonPrimary]}
              onPress={onBackToMenu}
            >
              <MaterialDesignIcons
                name="check"
                size={18}
                color={theme.colors.white}
              />
              <Text style={styles.navStepButtonTextPrimary}>Menu</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* MODAL DO GUIA DE INTERPRETAÇÃO */}
        <VolhardInterpretationModal
          visible={showInterpretationModal}
          onClose={() => setShowInterpretationModal(false)}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  subScreenContainer: {
    flex: 1,
  },
  subScreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  guideHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BEE3DB",
  },
  guideHeaderButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
  backToMenuButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  backToMenuText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  stepPill: {
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  stepPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
  subScreenScroll: {
    padding: 18,
    gap: 16,
    paddingBottom: 32,
  },
  subtestTitleBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
    ...theme.shadows.sm,
  },
  subtestNumberBadge: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  subtestMainTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  infoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  purposeBox: {
    backgroundColor: "#F0FDFA",
    borderColor: "#99F6E4",
  },
  infoBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoBoxTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  infoBoxBody: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: "#374151",
    lineHeight: 20,
  },
  scoreSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
    ...theme.shadows.sm,
  },
  scoreSectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  scoreSectionSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    marginTop: -6,
  },
  checkboxList: {
    gap: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 12,
  },
  checkboxRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "#E6F4F1",
  },
  checkboxTextWrapper: {
    flex: 1,
  },
  checkboxLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  checkboxLabelSelected: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
  },
  scoreNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumberCircleSelected: {
    backgroundColor: theme.colors.primary,
  },
  scoreNumberCircleText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: "#4B5563",
  },
  scoreNumberCircleTextSelected: {
    color: theme.colors.white,
  },
  subScreenFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  navStepButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  navStepButtonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  navStepButtonDisabled: {
    opacity: 0.4,
  },
  navStepButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  navStepButtonTextPrimary: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
  navMenuCenterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  navMenuCenterText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
});
