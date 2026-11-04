import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { IDogResponse } from "../../../../types/Dog";
import { theme } from "../../../../../theme/theme";
import { DogPickerItem } from "./DogPickerItem";
import { DogTestBadgeInfo } from "./types";

type PickerFilterTab = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ALL";

interface DogPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDog: (dog: IDogResponse) => void;
  filteredDogs: IDogResponse[];
  activeDog: IDogResponse | null;
  loadingDogs: boolean;
  searchText: string;
  onSearchChange: (text: string) => void;
  isDogDisabled?: (dog: IDogResponse) => { disabled: boolean; reason?: string };
  getDogTestBadge?: (dog: IDogResponse) => DogTestBadgeInfo | undefined;
  modalTitle: string;
  modalSubtitle: string;
}

export const DogPickerModal: React.FC<DogPickerModalProps> = ({
  visible,
  onClose,
  onSelectDog,
  filteredDogs,
  activeDog,
  loadingDogs,
  searchText,
  onSearchChange,
  isDogDisabled,
  getDogTestBadge,
  modalTitle,
  modalSubtitle,
}) => {
  const [activeFilterTab, setActiveFilterTab] =
    useState<PickerFilterTab>("NOT_STARTED");

  useEffect(() => {
    if (visible) {
      setActiveFilterTab("NOT_STARTED");
    }
  }, [visible]);

  const groupedDogs = useMemo(() => {
    if (!getDogTestBadge) {
      return null;
    }
    const notStarted: { dog: IDogResponse; badge: DogTestBadgeInfo }[] = [];
    const inProgress: { dog: IDogResponse; badge: DogTestBadgeInfo }[] = [];
    const completed: { dog: IDogResponse; badge: DogTestBadgeInfo }[] = [];

    filteredDogs.forEach((dog) => {
      const badge = getDogTestBadge(dog) || {
        status: "NOT_STARTED",
        label: "Sem teste",
      };
      if (badge.status === "COMPLETED") {
        completed.push({ dog, badge });
      } else if (badge.status === "IN_PROGRESS") {
        inProgress.push({ dog, badge });
      } else {
        notStarted.push({ dog, badge });
      }
    });

    return { notStarted, inProgress, completed };
  }, [filteredDogs, getDogTestBadge]);

  const notStartedCount = groupedDogs ? groupedDogs.notStarted.length : 0;
  const inProgressCount = groupedDogs ? groupedDogs.inProgress.length : 0;
  const completedCount = groupedDogs ? groupedDogs.completed.length : 0;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* CABEÇALHO */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleBox}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalSubtitle}>{modalSubtitle}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialDesignIcons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* BARRA DE PESQUISA */}
          <View style={styles.searchContainer}>
            <MaterialDesignIcons
              name="magnify"
              size={20}
              color="#6B7280"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome ou raça..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={onSearchChange}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearchChange("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialDesignIcons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* ABAS DE SEPARAÇÃO POR STATUS DO TESTE (SE APLICÁVEL) */}
          {groupedDogs && (
            <View style={styles.filterTabsRow}>
              <TouchableOpacity
                style={[
                  styles.filterTabBtn,
                  activeFilterTab === "NOT_STARTED" &&
                    styles.filterTabBtnActive,
                ]}
                onPress={() => setActiveFilterTab("NOT_STARTED")}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilterTab === "NOT_STARTED" &&
                      styles.filterTabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  A realizar ({notStartedCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterTabBtn,
                  activeFilterTab === "IN_PROGRESS" &&
                    styles.filterTabBtnActive,
                ]}
                onPress={() => setActiveFilterTab("IN_PROGRESS")}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilterTab === "IN_PROGRESS" &&
                      styles.filterTabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  Realizando ({inProgressCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterTabBtn,
                  activeFilterTab === "COMPLETED" && styles.filterTabBtnActive,
                ]}
                onPress={() => setActiveFilterTab("COMPLETED")}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilterTab === "COMPLETED" &&
                      styles.filterTabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  Já realizaram ({completedCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterTabBtn,
                  activeFilterTab === "ALL" && styles.filterTabBtnActive,
                ]}
                onPress={() => setActiveFilterTab("ALL")}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilterTab === "ALL" && styles.filterTabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  Todos ({filteredDogs.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* LISTA DE CÃES */}
          <ScrollView
            style={styles.modalList}
            contentContainerStyle={styles.modalListContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {loadingDogs ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Carregando cães...</Text>
              </View>
            ) : !groupedDogs ? (
              filteredDogs.length === 0 ? (
                <View style={styles.emptyBox}>
                  <MaterialDesignIcons name="dog-side" size={40} color="#D1D5DB" />
                  <Text style={styles.emptyTitle}>Nenhum cão encontrado</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchText
                      ? `Não foram encontrados cães com "${searchText}"`
                      : "Nenhum cão cadastrado ou elegível para esta seleção."}
                  </Text>
                </View>
              ) : (
                filteredDogs.map((dog) => (
                  <DogPickerItem
                    key={dog.ID}
                    dog={dog}
                    isSelected={activeDog?.ID === dog.ID}
                    onSelect={onSelectDog}
                    isDogDisabled={isDogDisabled}
                  />
                ))
              )
            ) : (
              (() => {
                const showNotStarted =
                  activeFilterTab === "NOT_STARTED" ||
                  activeFilterTab === "ALL";
                const showInProgress =
                  activeFilterTab === "IN_PROGRESS" ||
                  activeFilterTab === "ALL";
                const showCompleted =
                  activeFilterTab === "COMPLETED" || activeFilterTab === "ALL";

                const visibleNotStarted = showNotStarted
                  ? groupedDogs.notStarted
                  : [];
                const visibleInProgress = showInProgress
                  ? groupedDogs.inProgress
                  : [];
                const visibleCompleted = showCompleted
                  ? groupedDogs.completed
                  : [];

                const totalVisible =
                  visibleNotStarted.length +
                  visibleInProgress.length +
                  visibleCompleted.length;

                if (totalVisible === 0) {
                  return (
                    <View style={styles.emptyBox}>
                      <MaterialDesignIcons
                        name="dog-side"
                        size={40}
                        color="#D1D5DB"
                      />
                      <Text style={styles.emptyTitle}>
                        Nenhum cão nesta categoria
                      </Text>
                      <Text style={styles.emptySubtitle}>
                        {activeFilterTab === "NOT_STARTED"
                          ? "Não há cães sem teste iniciado no momento."
                          : activeFilterTab === "IN_PROGRESS"
                          ? "Não há cães realizando este teste no momento."
                          : activeFilterTab === "COMPLETED"
                          ? "Nenhum cão concluiu este teste ainda."
                          : "Nenhum cão encontrado."}
                      </Text>
                    </View>
                  );
                }

                return (
                  <>
                    {visibleNotStarted.length > 0 && (
                      <View style={styles.sectionBlock}>
                        <View style={styles.sectionHeaderRow}>
                          <MaterialDesignIcons
                            name="alert-circle-outline"
                            size={14}
                            color="#DC2626"
                          />
                          <Text
                            style={[styles.sectionHeaderText, { color: "#DC2626" }]}
                          >
                            Sem teste iniciado / Não feito ({visibleNotStarted.length})
                          </Text>
                        </View>
                        {visibleNotStarted.map(({ dog, badge }) => (
                          <DogPickerItem
                            key={dog.ID}
                            dog={dog}
                            isSelected={activeDog?.ID === dog.ID}
                            onSelect={onSelectDog}
                            isDogDisabled={isDogDisabled}
                            testBadge={badge}
                          />
                        ))}
                      </View>
                    )}

                    {visibleInProgress.length > 0 && (
                      <View style={styles.sectionBlock}>
                        <View style={styles.sectionHeaderRow}>
                          <MaterialDesignIcons
                            name="progress-clock"
                            size={14}
                            color="#B45309"
                          />
                          <Text
                            style={[styles.sectionHeaderText, { color: "#B45309" }]}
                          >
                            Realizando / Em andamento ({visibleInProgress.length})
                          </Text>
                        </View>
                        {visibleInProgress.map(({ dog, badge }) => (
                          <DogPickerItem
                            key={dog.ID}
                            dog={dog}
                            isSelected={activeDog?.ID === dog.ID}
                            onSelect={onSelectDog}
                            isDogDisabled={isDogDisabled}
                            testBadge={badge}
                          />
                        ))}
                      </View>
                    )}

                    {visibleCompleted.length > 0 && (
                      <View style={styles.sectionBlock}>
                        <View style={styles.sectionHeaderRow}>
                          <MaterialDesignIcons
                            name="check-circle-outline"
                            size={14}
                            color="#15803D"
                          />
                          <Text
                            style={[styles.sectionHeaderText, { color: "#15803D" }]}
                          >
                            Já realizaram / Concluídos ({visibleCompleted.length})
                          </Text>
                        </View>
                        {visibleCompleted.map(({ dog, badge }) => (
                          <DogPickerItem
                            key={dog.ID}
                            dog={dog}
                            isSelected={activeDog?.ID === dog.ID}
                            onSelect={onSelectDog}
                            isDogDisabled={isDogDisabled}
                            testBadge={badge}
                          />
                        ))}
                      </View>
                    )}
                  </>
                );
              })()
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    ...theme.shadows.md,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  modalHeaderTitleBox: {
    flex: 1,
    paddingRight: 8,
    gap: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: "#6B7280",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    padding: 0,
    fontFamily: theme.typography.fontFamily.regular,
  },
  filterTabsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  filterTabBtn: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  filterTabBtnActive: {
    backgroundColor: "#2E6B65",
  },
  filterTabText: {
    fontSize: 10.5,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: "#4B5563",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sectionBlock: {
    gap: 6,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 4,
    paddingTop: 2,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  modalList: {
    maxHeight: 360,
  },
  modalListContent: {
    paddingVertical: 4,
    gap: 8,
  },
  loadingBox: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: theme.typography.fontFamily.medium,
  },
  emptyBox: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#374151",
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

