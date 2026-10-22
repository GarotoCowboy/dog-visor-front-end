import React, { useEffect, useState } from "react";
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
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { theme } from "../../../../../theme/theme";
import { Button } from "../../../../shared/components/ButtonComponent";
import FormComponent, { DogPickerField } from "../../../../shared/components/FormComponent";
import { IDogResponse } from "../../../../types/Dog";

interface CreateMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    dogsName: string;
    prescription: string;
    limitDate: Date;
  }) => Promise<void>;
  submitting: boolean;
  dogs: IDogResponse[];
  onValidationAlert: (title: string, message: string) => void;
}

export const CreateMedicationModal: React.FC<CreateMedicationModalProps> = ({
  visible,
  onClose,
  onSubmit,
  submitting,
  dogs,
  onValidationAlert,
}) => {
  const [selectedDogObj, setSelectedDogObj] = useState<IDogResponse | null>(null);
  const [dogsName, setDogsName] = useState("");
  const [prescription, setPrescription] = useState("");
  const [limitDate, setLimitDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedDogObj(null);
      setDogsName("");
      setPrescription("");
      setLimitDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    }
  }, [visible]);

  const handleCreate = async () => {
    if (!dogsName.trim()) {
      onValidationAlert(
        "Campo Obrigatório",
        "Por favor, selecione ou informe o nome do cão.",
      );
      return;
    }

    if (!prescription.trim()) {
      onValidationAlert(
        "Campo Obrigatório",
        "Por favor, informe a prescrição do medicamento.",
      );
      return;
    }

    await onSubmit({
      dogsName: dogsName.trim(),
      prescription: prescription.trim(),
      limitDate,
    });
  };

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
            <Text style={styles.modalTitle}>Prescrever Medicamento</Text>
            <Pressable onPress={onClose} style={styles.modalCloseButton}>
              <MaterialDesignIcons
                name="close"
                size={22}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* SELEÇÃO DO CÃO */}
            <DogPickerField
              label="Cão *"
              placeholder="Selecione o cão..."
              dogs={dogs}
              selectedDog={selectedDogObj}
              onSelectDog={(dog) => {
                setSelectedDogObj(dog);
                setDogsName(dog.name);
              }}
              required
            />

            {/* PRESCRIÇÃO */}
            <FormComponent
              text="Prescrição / Posologia *"
              placeholder="Ex: Amoxicilina 250mg a cada 12h durante 7 dias"
              value={prescription}
              onChangeText={setPrescription}
              multiline
              numberOfLines={3}
            />

            {/* DATA LIMITE */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>
                Data Limite de Administração *
              </Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setIsDatePickerVisible(true)}
                activeOpacity={0.7}
              >
                <MaterialDesignIcons
                  name="calendar-month"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.pickerButtonText}>
                  {`${limitDate.getDate()}/${limitDate.getMonth() + 1}/${limitDate.getFullYear()}`}
                </Text>
              </TouchableOpacity>
            </View>

            {isDatePickerVisible && (
              <DateTimePicker
                value={limitDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(_e: DateTimePickerChangeEvent, date?: Date) => {
                  setIsDatePickerVisible(false);
                  if (date) setLimitDate(date);
                }}
              />
            )}

            {/* BOTÕES */}
            <View style={styles.modalButtonsContainer}>
              <Button text="Cancelar" variant="outline" onPress={onClose} />
              <Button
                text={submitting ? "Salvando..." : "Salvar Prescrição"}
                onPress={handleCreate}
                disabled={submitting}
              />
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    gap: 14,
  },
  fieldSection: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  modalButtonsContainer: {
    marginTop: 8,
    gap: 10,
  },
});
