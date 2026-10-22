import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import FormComponent from "../../../../shared/components/FormComponent";
import { IRationResponse, RationTypeLabel } from "../../../../types/Ration";

interface SelectRationModalProps {
  visible: boolean;
  onClose: () => void;
  rations: IRationResponse[];
  selectedRation: IRationResponse | null;
  onSelectRation: (ration: IRationResponse) => void;
}

export const SelectRationModal: React.FC<SelectRationModalProps> = ({
  visible,
  onClose,
  rations,
  selectedRation,
  onSelectRation,
}) => {
  const [rationSearchText, setRationSearchText] = useState("");

  const filteredRations = rations.filter((r) => {
    const text = rationSearchText.toLowerCase();
    const nameMatch = (r.name || "").toLowerCase().includes(text);
    const typeMatch = r.rationType
      ? (RationTypeLabel[r.rationType] || "").toLowerCase().includes(text)
      : false;
    return nameMatch || typeMatch;
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalBody}>
          <View style={styles.modalHeaderRow}>
            <View style={styles.modalHeaderTitleBox}>
              <Text style={styles.modalTitle}>Selecione a Ração</Text>
              <Text style={styles.modalSubtitle}>
                Escolha a ração para associar ao plano alimentar
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialDesignIcons
                name="close"
                size={22}
                color={theme.colors.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* CAMPO DE PESQUISA DE RAÇÃO */}
          <View style={styles.modalSearchContainer}>
            <FormComponent
              placeholder="Procurar ração pelo nome ou tipo..."
              value={rationSearchText}
              onChangeText={setRationSearchText}
            />
          </View>

          <ScrollView
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
          >
            {filteredRations.length === 0 ? (
              <Text style={styles.modalEmptyText}>Nenhuma ração encontrada.</Text>
            ) : (
              filteredRations.map((rat) => (
                <TouchableOpacity
                  key={String(rat.id)}
                  style={[
                    styles.modalListItem,
                    selectedRation?.id === rat.id && styles.modalListItemActive,
                  ]}
                  onPress={() => {
                    onSelectRation(rat);
                    onClose();
                    setRationSearchText("");
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalDogInfo}>
                    <Text style={styles.modalDogName}>{rat.name}</Text>
                    <Text style={styles.modalDogBreed}>
                      Tipo:{" "}
                      {rat.rationType
                        ? RationTypeLabel[rat.rationType]
                        : "Normal"}{" "}
                      • Estoque:{" "}
                      {Number(rat.currentRationQuantity || 0).toFixed(2)} kg
                    </Text>
                  </View>
                </TouchableOpacity>
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
    padding: 20,
  },
  modalBody: {
    width: "100%",
    maxHeight: "75%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    gap: 12,
  },
  modalHeaderRow: {
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
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: "#6B7280",
  },
  modalSearchContainer: {
    marginTop: 4,
    marginBottom: 2,
  },
  modalList: {
    marginTop: 6,
  },
  modalEmptyText: {
    textAlign: "center",
    paddingVertical: 20,
    fontSize: theme.typography.fontSize.sm,
    color: "#9CA3AF",
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
  },
  modalListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalListItemActive: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
  },
  modalDogInfo: {
    gap: 2,
    flex: 1,
  },
  modalDogName: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  modalDogBreed: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: "#6B7280",
  },
});
