import React, { memo } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import {
  BEHAVIOR_CHECKLIST_ITEMS,
  IBehaviorItemDefinition,
} from "../../constants/testQuestionsData";

// Mapa de índice O(1) pré-calculado uma única vez
const ITEM_INDEX_BY_NUMBER = new Map(
  BEHAVIOR_CHECKLIST_ITEMS.map((item, idx) => [item.number, idx]),
);

interface BehaviorMenuItemProps {
  item: IBehaviorItemDefinition;
  realIndex: number;
  selectedLabel: string | null;
  onPress: (index: number) => void;
}

const BehaviorMenuItem: React.FC<BehaviorMenuItemProps> = memo(
  ({ item, realIndex, selectedLabel, onPress }) => {
    const isAnswered = Boolean(selectedLabel);

    return (
      <TouchableOpacity
        style={[
          styles.behaviorMenuButton,
          !isAnswered && styles.behaviorMenuButtonUnanswered,
          isAnswered && styles.behaviorMenuButtonAnswered,
        ]}
        activeOpacity={0.75}
        onPress={() => onPress(realIndex)}
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
            {item.number}
          </Text>
        </View>

        <View style={styles.volhardMenuTextCol}>
          <Text style={styles.behaviorMenuTitle}>{item.title}</Text>
          <Text numberOfLines={2} style={styles.volhardMenuPurpose}>
            {item.description}
          </Text>
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
            numberOfLines={1}
            style={[
              styles.volhardScoreBadgeText,
              !isAnswered
                ? styles.volhardScoreBadgeTextPending
                : styles.volhardScoreBadgeTextDone,
              { maxWidth: 105 },
            ]}
          >
            {isAnswered ? selectedLabel : "Não feito"}
          </Text>
          <MaterialDesignIcons
            name="chevron-right"
            size={18}
            color={!isAnswered ? "#EA580C" : "#15803D"}
          />
        </View>
      </TouchableOpacity>
    );
  },
);

interface BehaviorMenuSectionProps {
  search: string;
  onSearchChange: (text: string) => void;
  completedCount: number;
  filteredItems: IBehaviorItemDefinition[];
  getItemSelectedLabel: (item: IBehaviorItemDefinition) => string | null;
  onQuickFillUnanswered?: () => void;
  onOpenItem: (realIndex: number) => void;
}

export const BehaviorMenuSection: React.FC<BehaviorMenuSectionProps> = memo(
  ({
    search,
    onSearchChange,
    completedCount,
    filteredItems,
    getItemSelectedLabel,
    onOpenItem,
  }) => {
    return (
      <View style={styles.menuSection}>
        <View style={styles.menuHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuSectionTitle}>
              Menu do Behavior Checklist (51 Aspectos)
            </Text>
            <Text style={styles.menuSectionSubtitle}>
              Toque em um aspecto para abrir sua tela e marcar a classificação única
            </Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>
              {completedCount}/{BEHAVIOR_CHECKLIST_ITEMS.length}
            </Text>
          </View>
        </View>

        {/* Busca rápida */}
        <View style={styles.behaviorToolbar}>
          <View style={styles.behaviorSearchBox}>
            <MaterialDesignIcons name="magnify" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.behaviorSearchInput}
              value={search}
              onChangeText={onSearchChange}
              placeholder="Filtrar aspecto (ex: 1, medo, tráfego...)"
              placeholderTextColor="#9CA3AF"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange("")}>
                <MaterialDesignIcons
                  name="close-circle"
                  size={16}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.menuButtonsGrid}>
          {filteredItems.map((item) => {
            const realIndex = ITEM_INDEX_BY_NUMBER.get(item.number) ?? 0;
            const selectedLabel = getItemSelectedLabel(item);

            return (
              <BehaviorMenuItem
                key={item.number}
                item={item}
                realIndex={realIndex}
                selectedLabel={selectedLabel}
                onPress={onOpenItem}
              />
            );
          })}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  menuSection: {
    gap: 12,
  },
  menuHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  menuSectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  menuSectionSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 12,
    color: "#166534",
  },
  absentAlertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  absentAlertBannerText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11.5,
    color: "#DC2626",
  },
  behaviorToolbar: {
    gap: 8,
  },
  behaviorSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  behaviorSearchInput: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.text,
    padding: 0,
    fontFamily: theme.typography.fontFamily.regular,
  },
  quickFillButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDBA74",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quickFillButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#C2410C",
  },
  menuButtonsGrid: {
    gap: 8,
  },
  behaviorMenuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    gap: 10,
    ...theme.shadows.sm,
  },
  behaviorMenuButtonUnanswered: {
    borderColor: "#FDBA74",
    backgroundColor: "#FFF7ED",
  },
  behaviorMenuButtonAnswered: {
    borderColor: "#BBF7D0",
    backgroundColor: "#F7FEE7",
  },
  behaviorMenuButtonAbsent: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  volhardMenuNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  volhardMenuNumberCircleUnanswered: {
    backgroundColor: "#FFEDD5",
  },
  volhardMenuNumberCircleAnswered: {
    backgroundColor: "#DCFCE7",
  },
  volhardMenuNumberCircleAbsent: {
    backgroundColor: "#FEE2E2",
  },
  volhardMenuNumberText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: "#4B5563",
  },
  volhardMenuNumberTextUnanswered: {
    color: "#C2410C",
  },
  volhardMenuNumberTextAnswered: {
    color: "#15803D",
  },
  volhardMenuNumberTextAbsent: {
    color: "#DC2626",
  },
  volhardMenuTextCol: {
    flex: 1,
    gap: 2,
  },
  behaviorMenuTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: theme.colors.text,
  },
  volhardMenuPurpose: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 15,
  },
  absentWarningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  absentWarningText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: "#DC2626",
  },
  volhardScoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
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
