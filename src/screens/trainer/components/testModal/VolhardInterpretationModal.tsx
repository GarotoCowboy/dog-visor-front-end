import React, { memo } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import {
  VOLHARD_MAJORITY_INTERPRETATIONS,
  VOLHARD_NO_PATTERN_NOTE,
  VOLHARD_SPECIAL_SCORES,
} from "../../constants/volhardInterpretationData";

interface VolhardInterpretationModalProps {
  visible: boolean;
  onClose: () => void;
  activeMajorityScore?: number | null;
}

export const VolhardInterpretationModal: React.FC<VolhardInterpretationModalProps> =
  memo(({ visible, onClose, activeMajorityScore }) => {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* CABEÇALHO */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.headerBadge}>
                  <MaterialDesignIcons
                    name="lightbulb-on-outline"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.headerBadgeText}>
                    GUIA TÉCNICO VOLHARD
                  </Text>
                </View>
                <Text style={styles.modalTitle}>
                  Interpretação dos Resultados
                </Text>
                <Text style={styles.modalSubtitle}>
                  Critérios de temperamento, dominância e aptidão segundo o
                  método Volhard
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <MaterialDesignIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* CONTEÚDO SCROLL */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* SEÇÃO 1: MAIORIA DAS NOTAS */}
              <View style={styles.sectionHeader}>
                <MaterialDesignIcons
                  name="numeric"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.sectionTitle}>
                  Classificação por Maioria de Notas
                </Text>
              </View>

              <View style={styles.cardsList}>
                {Object.entries(VOLHARD_MAJORITY_INTERPRETATIONS).map(
                  ([numStr, item]) => {
                    const num = Number(numStr);
                    const isCurrentDogMajority =
                      activeMajorityScore !== undefined &&
                      activeMajorityScore === num;

                    return (
                      <View
                        key={numStr}
                        style={[
                          styles.card,
                          isCurrentDogMajority && styles.cardActiveHighlight,
                        ]}
                      >
                        <View style={styles.cardHeader}>
                          <View
                            style={[
                              styles.scoreBadgeCircle,
                              { backgroundColor: item.badgeColor },
                            ]}
                          >
                            <Text style={styles.scoreBadgeCircleText}>
                              {num}
                            </Text>
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text
                              style={[
                                styles.cardProfile,
                                { color: item.badgeColor },
                              ]}
                            >
                              {item.profile}
                            </Text>
                          </View>

                          {isCurrentDogMajority && (
                            <View style={styles.activeTag}>
                              <MaterialDesignIcons
                                name="star"
                                size={12}
                                color="#15803D"
                              />
                              <Text style={styles.activeTagText}>
                                Nota do Cão
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text style={styles.cardDescription}>
                          {item.description}
                        </Text>
                      </View>
                    );
                  },
                )}
              </View>

              {/* SEÇÃO 2: CASOS ESPECIAIS E COMBINAÇÕES */}
              <View style={[styles.sectionHeader, { marginTop: 12 }]}>
                <MaterialDesignIcons
                  name="alert-decagram-outline"
                  size={20}
                  color="#B45309"
                />
                <Text style={[styles.sectionTitle, { color: "#B45309" }]}>
                  Pontuações e Combinações Específicas
                </Text>
              </View>

              <View style={styles.cardsList}>
                {VOLHARD_SPECIAL_SCORES.map((spec) => (
                  <View key={spec.id} style={styles.specialCard}>
                    <View style={styles.specialCardHeader}>
                      <View
                        style={[
                          styles.specialDot,
                          { backgroundColor: spec.badgeColor || theme.colors.primary },
                        ]}
                      />
                      <Text style={styles.specialCardTitle}>{spec.title}</Text>
                    </View>
                    <Text style={styles.cardDescription}>
                      {spec.description}
                    </Text>
                  </View>
                ))}
              </View>

              {/* SEÇÃO 3: NENHUM PADRÃO CLARO */}
              <View style={[styles.sectionHeader, { marginTop: 12 }]}>
                <MaterialDesignIcons
                  name="help-circle-outline"
                  size={20}
                  color="#4B5563"
                />
                <Text style={[styles.sectionTitle, { color: "#4B5563" }]}>
                  {VOLHARD_NO_PATTERN_NOTE.title}
                </Text>
              </View>

              <View style={[styles.card, styles.noPatternCard]}>
                <Text style={styles.noPatternSubtitle}>
                  {VOLHARD_NO_PATTERN_NOTE.subtitle}
                </Text>
                <Text style={styles.cardDescription}>
                  {VOLHARD_NO_PATTERN_NOTE.description}
                </Text>
              </View>
            </ScrollView>

            {/* FOOTER */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeFooterButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.closeFooterButtonText}>
                  Entendido, Fechar Guia
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  });

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: "90%",
    ...theme.shadows.md,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  headerBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 16,
  },
  closeButton: {
    padding: 6,
  },
  scrollContent: {
    padding: 18,
    gap: 12,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  cardsList: {
    gap: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    gap: 8,
    ...theme.shadows.sm,
  },
  cardActiveHighlight: {
    borderColor: theme.colors.primary,
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scoreBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreBadgeCircleText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 14,
    color: theme.colors.white,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  cardProfile: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    marginTop: 1,
  },
  activeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeTagText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: "#15803D",
  },
  cardDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#374151",
    lineHeight: 18,
  },
  specialCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#FDE68A",
    padding: 12,
    gap: 6,
  },
  specialCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  specialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  specialCardTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: "#92400E",
  },
  noPatternCard: {
    backgroundColor: "#F9FAFB",
    borderColor: "#D1D5DB",
  },
  noPatternSubtitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#4B5563",
  },
  modalFooter: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  closeFooterButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  closeFooterButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
});
