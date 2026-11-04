import React, { memo, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import {
  ICreateStructureRequest,
  StructureType,
  StructureTypeLabel,
} from "../../../../types/Training";
import {
  StructureFieldKey,
  VOLHARD_STRUCTURE_ITEMS,
  VOLHARD_SUBTESTS,
  VOLHARD_TOTAL_ITEMS_COUNT,
  VolhardScoreFieldKey,
} from "../../constants/testQuestionsData";
import { calculateVolhardInterpretation } from "../../constants/volhardInterpretationData";
import { VolhardScoresState } from "./VolhardSubtestScreen";
import { VolhardInterpretationModal } from "./VolhardInterpretationModal";

interface VolhardMenuSectionProps {
  volhardScores: VolhardScoresState;
  structureState: ICreateStructureRequest;
  structureAnsweredFields: Record<StructureFieldKey, boolean>;
  completedCount: number;
  onOpenSubtest: (index: number) => void;
  onOpenStructure: () => void;
}

export const VolhardMenuSection: React.FC<VolhardMenuSectionProps> = memo(
  ({
    volhardScores,
    structureState,
    structureAnsweredFields,
    completedCount,
    onOpenSubtest,
    onOpenStructure,
  }) => {
    const [showInterpretationModal, setShowInterpretationModal] =
      useState<boolean>(false);

    const behavioralCount = Object.values(volhardScores).filter(
      (v) => v !== null,
    ).length;
    const structureCount = Object.values(structureAnsweredFields).filter(
      Boolean,
    ).length;
    const isStructureComplete =
      structureCount === VOLHARD_STRUCTURE_ITEMS.length;

    const interpretation = useMemo(
      () => calculateVolhardInterpretation(volhardScores),
      [volhardScores],
    );

    return (
      <View style={styles.menuSection}>
        {/* CABEÇALHO GERAL VOLHARD */}
        <View style={styles.menuHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuSectionTitle}>Menu de Testes Volhard</Text>
            <Text style={styles.menuSectionSubtitle}>
              Avalie os 9 subtestes comportamentais e a estrutura física
              separadamente
            </Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>
              {completedCount}/{VOLHARD_TOTAL_ITEMS_COUNT}
            </Text>
          </View>
        </View>

        {/* BANNER DE ACESSO AO GUIA DE INTERPRETAÇÃO */}
        <TouchableOpacity
          style={styles.interpretationGuideBanner}
          onPress={() => setShowInterpretationModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.interpretationGuideLeft}>
            <View style={styles.interpretationGuideIconCircle}>
              <MaterialDesignIcons
                name="lightbulb-on"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.interpretationGuideTitle}>
                Interpretação dos Resultados
              </Text>
              <Text style={styles.interpretationGuideSubtitle}>
                Consulte o significado de cada nota (Maioria 1 a 6) e
                combinações
              </Text>
            </View>
          </View>
          <View style={styles.interpretationGuideBadge}>
            <Text style={styles.interpretationGuideBadgeText}>Guia</Text>
            <MaterialDesignIcons
              name="chevron-right"
              size={16}
              color={theme.colors.primary}
            />
          </View>
        </TouchableOpacity>

        {/* ==================================================================== */}
        {/* CARD DINÂMICO DE DIAGNÓSTICO / INTERPRETAÇÃO EM TEMPO REAL */}
        {/* ==================================================================== */}
        {interpretation.hasEnoughData && (
          <View style={styles.diagnosisCard}>
            <View style={styles.diagnosisHeader}>
              <View style={styles.subSectionTitleRow}>
                <MaterialDesignIcons
                  name="shield-check-outline"
                  size={18}
                  color={
                    interpretation.majorityInfo?.badgeColor ||
                    theme.colors.primary
                  }
                />
                <Text style={styles.subSectionTitle}>
                  {behavioralCount === VOLHARD_SUBTESTS.length
                    ? "Diagnóstico do Temperamento"
                    : "Interpretação Preliminar"}
                </Text>
              </View>

              <View
                style={[
                  styles.diagnosisPill,
                  {
                    backgroundColor: interpretation.majorityInfo?.badgeColor
                      ? `${interpretation.majorityInfo.badgeColor}18`
                      : "#E6F4F1",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.diagnosisPillText,
                    {
                      color:
                        interpretation.majorityInfo?.badgeColor ||
                        theme.colors.primary,
                    },
                  ]}
                >
                  {interpretation.majorityInfo
                    ? interpretation.majorityInfo.title
                    : interpretation.isNoClearPattern
                    ? "Sem Padrão Claro"
                    : "Avaliando"}
                </Text>
              </View>
            </View>

            {interpretation.majorityInfo && (
              <View style={styles.diagnosisBody}>
                <Text
                  style={[
                    styles.diagnosisProfileTitle,
                    { color: interpretation.majorityInfo.badgeColor },
                  ]}
                >
                  {interpretation.majorityInfo.profile}
                </Text>
                <Text style={styles.diagnosisDescription}>
                  {interpretation.majorityInfo.description}
                </Text>
              </View>
            )}

            {interpretation.isNoClearPattern && (
              <View style={styles.diagnosisBody}>
                <Text
                  style={[
                    styles.diagnosisProfileTitle,
                    { color: "#B45309" },
                  ]}
                >
                  Nenhum padrão claro (vários 1, 2 e 5)
                </Text>
                <Text style={styles.diagnosisDescription}>
                  Este cão pode não estar se sentindo bem. Talvez apenas tenha
                  comido ou foi recentemente vermifugado. Aguarde dois dias e
                  re-teste. Se o teste ainda mostra grandes variações, é
                  provavelmente imprevisível.
                </Text>
              </View>
            )}

            {/* ALERTAS ESPECÍFICOS ATIVOS */}
            {interpretation.activeSpecialAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertBox}>
                <View style={styles.alertBoxHeader}>
                  <MaterialDesignIcons
                    name="alert-circle"
                    size={16}
                    color={alert.badgeColor || "#B45309"}
                  />
                  <Text
                    style={[
                      styles.alertBoxTitle,
                      { color: alert.badgeColor || "#B45309" },
                    ]}
                  >
                    {alert.title}
                  </Text>
                </View>
                <Text style={styles.alertBoxDescription}>
                  {alert.description}
                </Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.viewFullGuideButton}
              onPress={() => setShowInterpretationModal(true)}
              activeOpacity={0.75}
            >
              <MaterialDesignIcons
                name="book-open-page-variant-outline"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.viewFullGuideButtonText}>
                Ver Tabela e Critérios Completos
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================================== */}
        {/* SEÇÃO 1: SUBTESTES COMPORTAMENTAIS (1 A 9) */}
        {/* ==================================================================== */}
        <View style={styles.subSectionCard}>
          <View style={styles.subSectionHeader}>
            <View style={styles.subSectionTitleRow}>
              <MaterialDesignIcons
                name="clipboard-list-outline"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.subSectionTitle}>
                Subtestes Comportamentais
              </Text>
            </View>
            <View style={styles.subSectionBadge}>
              <Text style={styles.subSectionBadgeText}>
                {behavioralCount}/{VOLHARD_SUBTESTS.length}
              </Text>
            </View>
          </View>

          <View style={styles.menuButtonsGrid}>
            {VOLHARD_SUBTESTS.map((sub, idx) => {
              const scoreVal = volhardScores[sub.key as VolhardScoreFieldKey];
              const isAnswered = scoreVal !== null;

              return (
                <TouchableOpacity
                  key={sub.key}
                  style={[
                    styles.volhardMenuButton,
                    !isAnswered && styles.volhardMenuButtonUnanswered,
                    isAnswered && styles.volhardMenuButtonAnswered,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => onOpenSubtest(idx)}
                >
                  <View
                    style={[
                      styles.volhardMenuNumberCircle,
                      !isAnswered && styles.volhardMenuNumberCircleUnanswered,
                      isAnswered && styles.volhardMenuNumberCircleAnswered,
                    ]}
                  >
                    <Text
                      style={[
                        styles.volhardMenuNumberText,
                        !isAnswered && styles.volhardMenuNumberTextUnanswered,
                        isAnswered && styles.volhardMenuNumberTextAnswered,
                      ]}
                    >
                      {sub.number}
                    </Text>
                  </View>

                  <View style={styles.volhardMenuTextCol}>
                    <Text style={styles.volhardMenuTitle}>{sub.title}</Text>
                    <Text style={styles.volhardMenuPurpose}>{sub.purpose}</Text>
                  </View>

                  <View
                    style={[
                      styles.volhardScoreBadge,
                      !isAnswered
                        ? styles.volhardScoreBadgePending
                        : styles.volhardScoreBadgeDone,
                    ]}
                  >
                    {!isAnswered && (
                      <MaterialDesignIcons
                        name="alert-circle-outline"
                        size={13}
                        color="#C2410C"
                      />
                    )}
                    <Text
                      style={[
                        styles.volhardScoreBadgeText,
                        !isAnswered
                          ? styles.volhardScoreBadgeTextPending
                          : styles.volhardScoreBadgeTextDone,
                      ]}
                    >
                      {isAnswered ? `Nota ${scoreVal}` : "Não feito"}
                    </Text>
                    <MaterialDesignIcons
                      name="chevron-right"
                      size={18}
                      color={!isAnswered ? "#EA580C" : "#15803D"}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ==================================================================== */}
        {/* SEÇÃO 2 (SEPARADA): AVALIAÇÃO DE ESTRUTURA FÍSICA COM IMAGENS */}
        {/* ==================================================================== */}
        <View style={[styles.subSectionCard, styles.structureSectionCard]}>
          <View style={styles.subSectionHeader}>
            <View style={styles.subSectionTitleRow}>
              <MaterialDesignIcons
                name="image-multiple-outline"
                size={18}
                color="#0F766E"
              />
              <Text style={[styles.subSectionTitle, { color: "#0F766E" }]}>
                Avaliação de Estrutura Física
              </Text>
            </View>
            <View
              style={[
                styles.subSectionBadge,
                isStructureComplete
                  ? styles.structureBadgeDone
                  : styles.structureBadgePending,
              ]}
            >
              <Text
                style={[
                  styles.subSectionBadgeText,
                  isStructureComplete
                    ? { color: "#15803D" }
                    : { color: "#C2410C" },
                ]}
              >
                {structureCount}/{VOLHARD_STRUCTURE_ITEMS.length}
              </Text>
            </View>
          </View>

          <Text style={styles.structureNoticeText}>
            Testes com fotos de referência anatômica (Frente reta, angulação de
            ombro, cotovelo, garupa, traseira reta e angulação traseira).
          </Text>

          {/* CHIPS DOS 6 TESTES ESTRUTURAIS */}
          <View style={styles.structureChipsGrid}>
            {VOLHARD_STRUCTURE_ITEMS.map((item) => {
              const isItemAnswered = structureAnsweredFields[item.key];
              const value = structureState[item.key];
              const isRuim = isItemAnswered && value === StructureType.RUIM;

              return (
                <View
                  key={item.key}
                  style={[
                    styles.structureChip,
                    !isItemAnswered && styles.structureChipUnanswered,
                    isItemAnswered && !isRuim && styles.structureChipAnswered,
                    isRuim && styles.structureChipRuim,
                  ]}
                >
                  <MaterialDesignIcons
                    name={
                      !isItemAnswered
                        ? "alert-circle-outline"
                        : isRuim
                        ? "close-circle"
                        : "check-circle"
                    }
                    size={14}
                    color={
                      !isItemAnswered
                        ? "#EA580C"
                        : isRuim
                        ? "#DC2626"
                        : "#15803D"
                    }
                  />
                  <Text
                    style={styles.structureChipLabel}
                    numberOfLines={1}
                  >
                    {item.title}:
                  </Text>
                  <Text
                    style={[
                      styles.structureChipValue,
                      isItemAnswered
                        ? value === StructureType.BOA
                          ? { color: "#15803D" }
                          : value === StructureType.ACEITAVEL
                          ? { color: "#B45309" }
                          : { color: "#DC2626" }
                        : { color: "#C2410C" },
                    ]}
                  >
                    {isItemAnswered
                      ? StructureTypeLabel[value]
                      : "Não feito"}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* BOTÃO PARA ABRIR A TELA DE ESTRUTURA COM AS IMAGENS */}
          <TouchableOpacity
            style={styles.openStructureButton}
            onPress={onOpenStructure}
            activeOpacity={0.8}
          >
            <MaterialDesignIcons
              name="camera-image"
              size={18}
              color={theme.colors.white}
            />
            <Text style={styles.openStructureButtonText}>
              {structureCount > 0
                ? `Continuar Avaliação de Estrutura (${structureCount}/6)`
                : "Abrir Avaliação de Estrutura"}
            </Text>
            <MaterialDesignIcons
              name="chevron-right"
              size={18}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* MODAL COM O GUIA COMPLETO DE INTERPRETAÇÃO */}
        <VolhardInterpretationModal
          visible={showInterpretationModal}
          onClose={() => setShowInterpretationModal(false)}
          activeMajorityScore={interpretation.majorityScore}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  menuSection: {
    gap: 16,
  },
  menuHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  menuSectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  menuSectionSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 16,
  },
  progressBadge: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  progressBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: "#15803D",
  },
  interpretationGuideBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#BEE3DB",
    padding: 12,
    gap: 10,
    ...theme.shadows.sm,
  },
  interpretationGuideLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  interpretationGuideIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  interpretationGuideTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  interpretationGuideSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
  },
  interpretationGuideBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  interpretationGuideBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.primary,
  },
  diagnosisCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.md,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
    gap: 10,
    ...theme.shadows.sm,
  },
  diagnosisHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  diagnosisPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diagnosisPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
  },
  diagnosisBody: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  diagnosisProfileTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
  },
  diagnosisDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#374151",
    lineHeight: 18,
  },
  alertBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 10,
    gap: 4,
  },
  alertBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  alertBoxTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
  },
  alertBoxDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#78350F",
    lineHeight: 16,
  },
  viewFullGuideButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: "#F0FDF4",
    marginTop: 2,
  },
  viewFullGuideButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
  subSectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
    ...theme.shadows.sm,
  },
  structureSectionCard: {
    borderColor: "#99F6E4",
    backgroundColor: "#F0FDFA",
  },
  subSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subSectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subSectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  subSectionBadge: {
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  structureBadgeDone: {
    backgroundColor: "#DCFCE7",
  },
  structureBadgePending: {
    backgroundColor: "#FEF3C7",
  },
  subSectionBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: theme.colors.primary,
  },
  structureNoticeText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
    lineHeight: 16,
  },
  structureChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  structureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  structureChipUnanswered: {
    borderColor: "#FDBA74",
    backgroundColor: "#FFF7ED",
  },
  structureChipAnswered: {
    borderColor: "#A7F3D0",
    backgroundColor: "#F0FDF4",
  },
  structureChipRuim: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  structureChipLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#374151",
  },
  structureChipValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
  },
  openStructureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0F766E",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#0F766E",
    ...theme.shadows.sm,
  },
  openStructureButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
  menuButtonsGrid: {
    gap: 8,
  },
  volhardMenuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    padding: 10,
    gap: 10,
  },
  volhardMenuButtonUnanswered: {
    borderColor: "#FDBA74",
    backgroundColor: "#FFF7ED",
  },
  volhardMenuButtonAnswered: {
    borderColor: "#A7F3D0",
    backgroundColor: "#F0FDF4",
  },
  volhardMenuButtonAbsent: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  volhardMenuNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  volhardMenuNumberCircleUnanswered: {
    backgroundColor: "#FFEDD5",
  },
  volhardMenuNumberCircleAnswered: {
    backgroundColor: "#15803D",
  },
  volhardMenuNumberCircleAbsent: {
    backgroundColor: "#FEE2E2",
  },
  volhardMenuNumberText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: theme.colors.primary,
  },
  volhardMenuNumberTextUnanswered: {
    color: "#C2410C",
  },
  volhardMenuNumberTextAnswered: {
    color: theme.colors.white,
  },
  volhardMenuNumberTextAbsent: {
    color: "#DC2626",
  },
  volhardMenuTextCol: {
    flex: 1,
    gap: 2,
  },
  volhardMenuTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  volhardMenuPurpose: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 15,
  },
  volhardScoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  volhardScoreBadgePending: {
    backgroundColor: "#FFEDD5",
    borderColor: "#FDBA74",
  },
  volhardScoreBadgeDone: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
  },
  volhardScoreBadgeAbsent: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  volhardScoreBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
  },
  volhardScoreBadgeTextPending: {
    color: "#C2410C",
  },
  volhardScoreBadgeTextDone: {
    color: "#15803D",
  },
  volhardScoreBadgeTextAbsent: {
    color: "#DC2626",
  },
});
