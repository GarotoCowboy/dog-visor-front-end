import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../theme/theme";
import { IDogResponse } from "../../../types/Dog";

interface PuppyVetAlertModalProps {
  visible: boolean;
  dog: IDogResponse | null;
  submitting: boolean;
  onClose: () => void;
  onSendVetAlert: (dog: IDogResponse, description: string) => Promise<void>;
}

export const PuppyVetAlertModal: React.FC<PuppyVetAlertModalProps> = ({
  visible,
  dog,
  submitting,
  onClose,
  onSendVetAlert,
}) => {
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (visible) {
      setDescription("");
    }
  }, [visible, dog]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBox}>
                <MaterialDesignIcons
                  name="stethoscope"
                  size={20}
                  color="#EF4444"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  Solicitar Veterinário • {dog?.name || "Filhote"}
                </Text>
                <Text style={styles.subtitle}>
                  Envie um alerta de saúde para avaliação veterinária
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialDesignIcons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.label}>Motivo / Observação Clínica *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Descreva o sintoma ou motivo para avaliação veterinária..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!description.trim() || submitting) && { opacity: 0.5 },
              ]}
              disabled={!description.trim() || submitting || !dog}
              onPress={() => dog && onSendVetAlert(dog, description.trim())}
            >
              <MaterialDesignIcons
                name="bell-alert-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.saveBtnText}>
                {submitting ? "Enviando..." : "Enviar Alerta Vet"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 16,
    color: "#1F2937",
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 20,
    gap: 8,
  },
  label: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: "#374151",
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    minHeight: 96,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
  },
  cancelBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 13,
    color: "#4B5563",
  },
  saveBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#EF4444",
  },
  saveBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: "#FFFFFF",
  },
});

