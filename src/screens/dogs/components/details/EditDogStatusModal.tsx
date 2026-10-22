import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../../theme/theme";
import { Button } from "../../../../shared/components/ButtonComponent";
import FormComponent from "../../../../shared/components/FormComponent";
import { CheckBox } from "../../../../shared/components/CheckBoxComponent";
import { DogStatusLabel, EDOG_STATUS } from "../../../../types/Dog";

interface EditDogStatusModalProps {
  visible: boolean;
  dogName: string;
  editStatus: EDOG_STATUS | null;
  setEditStatus: (status: EDOG_STATUS) => void;
  editOnKennel: boolean;
  setEditOnKennel: (val: boolean) => void;
  updating: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const EditDogStatusModal: React.FC<EditDogStatusModalProps> = ({
  visible,
  dogName,
  editStatus,
  setEditStatus,
  editOnKennel,
  setEditOnKennel,
  updating,
  onClose,
  onSave,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MaterialDesignIcons
                name="tune-variant"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.modalTitle}>Atualizar {dogName}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.modalCloseButton}>
              <MaterialDesignIcons
                name="close"
                size={22}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 14 }}
          >
            <FormComponent
              variant="dropdown"
              editable={false}
              text="Status no Programa: *"
              placeholder="Selecione o status"
              value={editStatus ? DogStatusLabel[editStatus] : ""}
              onChangeText={() => {}}
              options={[
                {
                  label: DogStatusLabel[EDOG_STATUS.PRE_SOCIALIZACAO],
                  value: EDOG_STATUS.PRE_SOCIALIZACAO,
                },
                {
                  label: DogStatusLabel[EDOG_STATUS.SOCIALIZACAO],
                  value: EDOG_STATUS.SOCIALIZACAO,
                },
                {
                  label: DogStatusLabel[EDOG_STATUS.TREINAMENTO],
                  value: EDOG_STATUS.TREINAMENTO,
                },
                {
                  label: DogStatusLabel[EDOG_STATUS.ADAPTACAO],
                  value: EDOG_STATUS.ADAPTACAO,
                },
                {
                  label: DogStatusLabel[EDOG_STATUS.REPRODUCAO],
                  value: EDOG_STATUS.REPRODUCAO,
                },
                {
                  label: DogStatusLabel[EDOG_STATUS.AGUARDANDO_APOSENTADORIA],
                  value: EDOG_STATUS.AGUARDANDO_APOSENTADORIA,
                },
                {
                  label: DogStatusLabel[EDOG_STATUS.DOADO],
                  value: EDOG_STATUS.DOADO,
                },
                {
                  label: DogStatusLabel[EDOG_STATUS.FALECIDO],
                  value: EDOG_STATUS.FALECIDO,
                },
              ]}
              onSelect={(val) => {
                const nextStatus = val as EDOG_STATUS;
                setEditStatus(nextStatus);
                if (
                  nextStatus === EDOG_STATUS.DOADO ||
                  nextStatus === EDOG_STATUS.FALECIDO
                ) {
                  setEditOnKennel(false);
                }
              }}
            />

            <View style={styles.kennelOptionContainer}>
              <Text style={styles.kennelOptionTitle}>Presença no Canil</Text>
              <CheckBox
                value={editOnKennel}
                onChangeChecked={(checked: boolean) => {
                  if (
                    editStatus === EDOG_STATUS.DOADO ||
                    editStatus === EDOG_STATUS.FALECIDO
                  ) {
                    setEditOnKennel(false);
                  } else {
                    setEditOnKennel(checked);
                  }
                }}
                label={
                  editStatus === EDOG_STATUS.DOADO ||
                  editStatus === EDOG_STATUS.FALECIDO
                    ? "No canil (bloqueado para status atual)"
                    : "Presente fisicamente no canil"
                }
              />
            </View>

            <View style={styles.modalActions}>
              <View style={{ flex: 1 }}>
                <Button
                  text="Cancelar"
                  variant="transparent"
                  onPress={onClose}
                  disabled={updating}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  text="Salvar"
                  onPress={onSave}
                  disabled={updating}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    width: "100%",
    padding: 20,
    gap: 14,
    ...theme.shadows.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 12,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  kennelOptionContainer: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  kennelOptionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
});
