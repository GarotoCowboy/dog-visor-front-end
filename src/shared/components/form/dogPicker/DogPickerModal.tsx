import React, { useState } from "react";
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
  modalTitle,
  modalSubtitle,
}) => {
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
            ) : filteredDogs.length === 0 ? (
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

