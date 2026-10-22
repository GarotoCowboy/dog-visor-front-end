import React from "react";
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
  BEHAVIOR_CHECKLIST_ITEMS,
  IBehaviorItemDefinition,
} from "../../constants/testQuestionsData";
import { SelectedDogBanner } from "./SelectedDogBanner";

interface BehaviorItemScreenProps {
  itemIndex: number;
  selectedDog?: IDogResponse | null;
  selectedValue: string | number | null;
  onBackToMenu: () => void;
  onSelectOption: (item: IBehaviorItemDefinition, value: string | number) => void;
  onNavigateItem: (nextIndex: number) => void;
}

export const BehaviorItemScreen: React.FC<BehaviorItemScreenProps> = ({
  itemIndex,
  selectedDog,
  selectedValue,
  onBackToMenu,
  onSelectOption,
  onNavigateItem,
}) => {
  const item: IBehaviorItemDefinition = BEHAVIOR_CHECKLIST_ITEMS[itemIndex];

  return (
    <View style={styles.subScreenContainer}>
      {/* Cabeçalho da tela do aspecto Behavior */}
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
          <Text style={styles.backToMenuText}>Menu Behavior</Text>
        </TouchableOpacity>

        <View style={styles.stepPill}>
          <Text style={styles.stepPillText}>
            Aspecto {item.number} de {BEHAVIOR_CHECKLIST_ITEMS.length}
          </Text>
        </View>
      </View>

      {/* Banner com foto do cão avaliado */}
      <SelectedDogBanner dog={selectedDog} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.subScreenScroll}
      >
        {/* TÍTULO DO ASPECTO */}
        <View style={styles.subtestTitleBanner}>
          <Text style={styles.subtestNumberBadge}>
            ASPECTO {item.number}
          </Text>
          <Text style={styles.subtestMainTitle}>{item.title}</Text>
        </View>

        {/* DESCRIÇÃO DO ASPECTO */}
        <View style={styles.infoBox}>
          <View style={styles.infoBoxHeader}>
            <MaterialDesignIcons
              name="information-outline"
              size={18}
              color={theme.colors.primary}
            />
            <Text style={styles.infoBoxTitle}>
              Descrição / Comportamento Observado
            </Text>
          </View>
          <Text style={styles.infoBoxBody}>{item.description}</Text>
        </View>

        {/* OPÇÕES DE PONTUAÇÃO (CHECKBOX DE MARCAÇÃO ÚNICA) */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreSectionTitle}>
            Classificação (Marcação única)
          </Text>
          <Text style={styles.scoreSectionSubtitle}>
            Marque apenas uma opção para este aspecto comportamental:
          </Text>

          <View style={styles.checkboxList}>
            {item.options.map((opt) => {
              const isChecked = selectedValue === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.checkboxRow,
                    isChecked && styles.checkboxRowSelected,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => onSelectOption(item, opt.value)}
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
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Navegação entre os 51 aspectos do Behavior */}
      <View style={styles.subScreenFooter}>
        <TouchableOpacity
          style={[
            styles.navStepButton,
            itemIndex === 0 && styles.navStepButtonDisabled,
          ]}
          disabled={itemIndex === 0}
          onPress={() => onNavigateItem(itemIndex - 1)}
        >
          <MaterialDesignIcons
            name="chevron-left"
            size={20}
            color={itemIndex === 0 ? "#9CA3AF" : theme.colors.text}
          />
          <Text
            style={[
              styles.navStepButtonText,
              itemIndex === 0 && { color: "#9CA3AF" },
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

        {itemIndex < BEHAVIOR_CHECKLIST_ITEMS.length - 1 ? (
          <TouchableOpacity
            style={[styles.navStepButton, styles.navStepButtonPrimary]}
            onPress={() => onNavigateItem(itemIndex + 1)}
          >
            <Text style={styles.navStepButtonTextPrimary}>Próximo</Text>
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
            <Text style={styles.navStepButtonTextPrimary}>Concluir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

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
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
  subScreenScroll: {
    padding: 18,
    gap: 14,
  },
  subtestTitleBanner: {
    backgroundColor: "#2E6B65",
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    gap: 4,
  },
  subtestNumberBadge: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#A7F3D0",
    letterSpacing: 0.8,
  },
  subtestMainTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: "#FFFFFF",
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  infoBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoBoxTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    textTransform: "uppercase",
  },
  infoBoxBody: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: "#374151",
    lineHeight: 20,
  },
  scoreSection: {
    gap: 10,
    marginTop: 4,
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
  },
  checkboxList: {
    gap: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  checkboxRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "#F0FDF4",
  },
  checkboxTextWrapper: {
    flex: 1,
    gap: 2,
  },
  checkboxLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: "#1F2937",
    lineHeight: 20,
  },
  checkboxLabelSelected: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  subScreenFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 10,
  },
  navStepButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 11,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#F3F4F6",
  },
  navStepButtonDisabled: {
    opacity: 0.5,
  },
  navStepButtonPrimary: {
    backgroundColor: "#2E6B65",
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
    color: "#FFFFFF",
  },
  navMenuCenterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: "#FFFFFF",
  },
  navMenuCenterText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
});

