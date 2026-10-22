import React, { memo, useState } from "react";
import {
  Image,
  Modal,
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
  ICreateStructureRequest,
  StructureType,
  StructureTypeLabel,
} from "../../../../types/Training";
import {
  IVolhardStructureItemDefinition,
  StructureFieldKey,
  VOLHARD_STRUCTURE_ITEMS,
  VOLHARD_STRUCTURE_OPTIONS,
} from "../../constants/testQuestionsData";
import { SelectedDogBanner } from "./SelectedDogBanner";

interface VolhardStructureScreenProps {
  selectedDog?: IDogResponse | null;
  structureState: ICreateStructureRequest;
  structureAnsweredFields: Record<StructureFieldKey, boolean>;
  onBackToMenu: () => void;
  onSetAllStructure: (value: StructureType) => void;
  onSetSingleStructureField: (
    field: StructureFieldKey,
    value: StructureType,
  ) => void;
}

export const VolhardStructureScreen: React.FC<VolhardStructureScreenProps> = memo(
  ({
    selectedDog,
    structureState,
    structureAnsweredFields,
    onBackToMenu,
    onSetAllStructure,
    onSetSingleStructureField,
  }) => {
    const [previewImage, setPreviewImage] = useState<{
      title: string;
      image: any;
    } | null>(null);

    const answeredCount = Object.values(structureAnsweredFields).filter(
      Boolean,
    ).length;
    const isAllAnswered = answeredCount === VOLHARD_STRUCTURE_ITEMS.length;

    return (
      <View style={styles.container}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackToMenu}
            activeOpacity={0.7}
          >
            <MaterialDesignIcons
              name="arrow-left"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.backText}>Menu Volhard</Text>
          </TouchableOpacity>

          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Estrutura ({answeredCount}/{VOLHARD_STRUCTURE_ITEMS.length})
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* BANNER COM A FOTO DO CÃO SELECIONADO */}
          <SelectedDogBanner dog={selectedDog} />

          {/* BANNER DE TÍTULO */}
          <View style={styles.titleBanner}>
            <View style={styles.titleBannerTopRow}>
              <View style={styles.titleBadge}>
                <MaterialDesignIcons
                  name="bone"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text style={styles.titleBadgeText}>ANÁLISE DE CONFORMAÇÃO</Text>
              </View>
              {isAllAnswered ? (
                <View style={styles.statusPillDone}>
                  <MaterialDesignIcons
                    name="check-circle"
                    size={14}
                    color="#15803D"
                  />
                  <Text style={styles.statusPillDoneText}>Completa (6/6)</Text>
                </View>
              ) : (
                <View style={styles.statusPillPending}>
                  <MaterialDesignIcons
                    name="clock-outline"
                    size={14}
                    color="#B45309"
                  />
                  <Text style={styles.statusPillPendingText}>
                    {answeredCount}/6 avaliados
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.mainTitle}>AVALIAÇÃO DE ESTRUTURA</Text>
            <Text style={styles.mainSubtitle}>
              Avalie as angulações e aprumos do filhote com o suporte das
              ilustrações anatômicas de referência abaixo:
            </Text>
          </View>

          {/* BARRA DE PREENCHIMENTO RÁPIDO */}
          <View style={styles.quickFillCard}>
            <Text style={styles.quickFillLabel}>
              Preenchimento rápido para todos:
            </Text>
            <View style={styles.quickFillButtonsRow}>
              {VOLHARD_STRUCTURE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.quickFillButton,
                    opt.value === StructureType.BOA &&
                      styles.quickFillButtonBoa,
                    opt.value === StructureType.ACEITAVEL &&
                      styles.quickFillButtonAceitavel,
                    opt.value === StructureType.RUIM &&
                      styles.quickFillButtonRuim,
                  ]}
                  onPress={() => onSetAllStructure(opt.value)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.quickFillButtonText,
                      opt.value === StructureType.BOA && { color: "#15803D" },
                      opt.value === StructureType.ACEITAVEL && {
                        color: "#B45309",
                      },
                      opt.value === StructureType.RUIM && { color: "#B91C1C" },
                    ]}
                  >
                    Tudo {opt.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* LISTA DOS 6 TESTES DE ESTRUTURA COM SUAS IMAGENS */}
          <View style={styles.itemsList}>
            {VOLHARD_STRUCTURE_ITEMS.map((item: IVolhardStructureItemDefinition) => {
              const isAnswered = structureAnsweredFields[item.key];
              const selectedValue = structureState[item.key];

              return (
                <View key={item.key} style={styles.structureCard}>
                  {/* CABEÇALHO DO ITEM */}
                  <View style={styles.cardHeader}>
                    <View style={styles.numberBadge}>
                      <Text style={styles.numberBadgeText}>{item.number}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                    </View>
                    {isAnswered ? (
                      <View
                        style={[
                          styles.answeredBadge,
                          selectedValue === StructureType.BOA &&
                            styles.answeredBadgeBoa,
                          selectedValue === StructureType.ACEITAVEL &&
                            styles.answeredBadgeAceitavel,
                          selectedValue === StructureType.RUIM &&
                            styles.answeredBadgeRuim,
                        ]}
                      >
                        <Text
                          style={[
                            styles.answeredBadgeText,
                            selectedValue === StructureType.BOA && {
                              color: "#15803D",
                            },
                            selectedValue === StructureType.ACEITAVEL && {
                              color: "#B45309",
                            },
                            selectedValue === StructureType.RUIM && {
                              color: "#B91C1C",
                            },
                          ]}
                        >
                          {StructureTypeLabel[selectedValue]}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.answeredBadgePending}>
                        <Text style={styles.answeredBadgePendingText}>
                          Pendente
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* DESCRIÇÃO DA REGIÃO ANATÔMICA */}
                  <Text style={styles.cardDescription}>{item.description}</Text>

                  {/* IMAGEM DE REFERÊNCIA ANATÔMICA */}
                  <TouchableOpacity
                    style={styles.imageContainer}
                    activeOpacity={0.9}
                    onPress={() =>
                      setPreviewImage({
                        title: item.title,
                        image: item.image,
                      })
                    }
                  >
                    <Image
                      source={item.image}
                      style={styles.referenceImage}
                      resizeMode="contain"
                    />
                    <View style={styles.imageOverlayHint}>
                      <MaterialDesignIcons
                        name="magnify-plus-outline"
                        size={14}
                        color={theme.colors.white}
                      />
                      <Text style={styles.imageOverlayHintText}>
                        Toque para ampliar
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* BOTÕES DE SELEÇÃO: BOA | ACEITÁVEL | RUIM */}
                  <View style={styles.optionsRow}>
                    {VOLHARD_STRUCTURE_OPTIONS.map((opt) => {
                      const isSelected =
                        isAnswered && selectedValue === opt.value;
                      const isBoa = opt.value === StructureType.BOA;
                      const isAceitavel =
                        opt.value === StructureType.ACEITAVEL;
                      const isRuim = opt.value === StructureType.RUIM;

                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[
                            styles.optionButton,
                            isSelected && styles.optionButtonSelected,
                            isSelected && isBoa && styles.optionButtonSelectedBoa,
                            isSelected &&
                              isAceitavel &&
                              styles.optionButtonSelectedAceitavel,
                            isSelected &&
                              isRuim &&
                              styles.optionButtonSelectedRuim,
                          ]}
                          onPress={() =>
                            onSetSingleStructureField(item.key, opt.value)
                          }
                          activeOpacity={0.75}
                        >
                          <MaterialDesignIcons
                            name={
                              isSelected
                                ? isBoa
                                  ? "check-circle"
                                  : isAceitavel
                                  ? "alert-circle"
                                  : "close-circle"
                                : "circle-outline"
                            }
                            size={18}
                            color={
                              isSelected
                                ? isBoa
                                  ? "#15803D"
                                  : isAceitavel
                                  ? "#B45309"
                                  : "#B91C1C"
                                : "#6B7280"
                            }
                          />
                          <Text
                            style={[
                              styles.optionButtonText,
                              isSelected && styles.optionButtonTextSelected,
                              isSelected && isBoa && { color: "#15803D" },
                              isSelected && isAceitavel && { color: "#B45309" },
                              isSelected && isRuim && { color: "#B91C1C" },
                            ]}
                          >
                            {opt.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.returnButton}
            onPress={onBackToMenu}
            activeOpacity={0.8}
          >
            <MaterialDesignIcons
              name="check"
              size={18}
              color={theme.colors.white}
            />
            <Text style={styles.returnButtonText}>
              {isAllAnswered
                ? "Estrutura Concluída — Voltar ao Menu"
                : `Salvar Estrutura (${answeredCount}/6) — Voltar ao Menu`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* MODAL DE AMPLIAÇÃO DA IMAGEM */}
        <Modal
          visible={previewImage !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewImage(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {previewImage?.title}
                </Text>
                <TouchableOpacity
                  onPress={() => setPreviewImage(null)}
                  style={styles.modalCloseButton}
                >
                  <MaterialDesignIcons
                    name="close"
                    size={22}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalImageContainer}>
                {previewImage && (
                  <Image
                    source={previewImage.image}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                )}
              </View>

              <TouchableOpacity
                style={styles.modalDismissButton}
                onPress={() => setPreviewImage(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalDismissButtonText}>Fechar Imagem</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  backText: {
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
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 28,
  },
  titleBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
    ...theme.shadows.sm,
  },
  titleBannerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  titleBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  statusPillDone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  statusPillDoneText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: "#15803D",
  },
  statusPillPending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
  },
  statusPillPendingText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: "#B45309",
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  mainSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    lineHeight: 18,
  },
  quickFillCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  quickFillLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
  },
  quickFillButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickFillButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  quickFillButtonBoa: {
    borderColor: "#86EFAC",
    backgroundColor: "#F0FDF4",
  },
  quickFillButtonAceitavel: {
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
  },
  quickFillButtonRuim: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  quickFillButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
  },
  itemsList: {
    gap: 16,
  },
  structureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  numberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  numberBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: theme.colors.primary,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  answeredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  answeredBadgeBoa: {
    backgroundColor: "#F0FDF4",
  },
  answeredBadgeAceitavel: {
    backgroundColor: "#FFFBEB",
  },
  answeredBadgeRuim: {
    backgroundColor: "#FEF2F2",
  },
  answeredBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
  },
  answeredBadgePending: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
  },
  answeredBadgePendingText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#9CA3AF",
  },
  cardDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
    lineHeight: 18,
  },
  imageContainer: {
    position: "relative",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  referenceImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlayHint: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  imageOverlayHintText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 10,
    color: theme.colors.white,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  optionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  optionButtonSelected: {
    backgroundColor: "#FFFFFF",
  },
  optionButtonSelectedBoa: {
    borderColor: "#15803D",
    backgroundColor: "#F0FDF4",
  },
  optionButtonSelectedAceitavel: {
    borderColor: "#B45309",
    backgroundColor: "#FFFBEB",
  },
  optionButtonSelectedRuim: {
    borderColor: "#B91C1C",
    backgroundColor: "#FEF2F2",
  },
  optionButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
  },
  optionButtonTextSelected: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  returnButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  returnButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBox: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalImageContainer: {
    width: "100%",
    height: 340,
    backgroundColor: "#F8FAFC",
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalDismissButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  modalDismissButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
});

