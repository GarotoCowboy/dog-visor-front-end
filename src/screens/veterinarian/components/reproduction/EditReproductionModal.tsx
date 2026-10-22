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
import FormComponent from "../../../../shared/components/FormComponent";
import { formatDogRace } from "../../../../types/Dog";
import {
  IDogReproductionResponse,
  IUpdateDogReproductionRequest,
} from "../../../../types/DogHealth";

interface EditReproductionModalProps {
  visible: boolean;
  item: IDogReproductionResponse | null;
  onClose: () => void;
  onSubmit: (id: string, payload: IUpdateDogReproductionRequest) => Promise<void>;
  submitting: boolean;
  onValidationAlert: (title: string, message: string) => void;
}

export const EditReproductionModal: React.FC<EditReproductionModalProps> = ({
  visible,
  item,
  onClose,
  onSubmit,
  submitting,
  onValidationAlert,
}) => {
  const [heatDate, setHeatDate] = useState<Date>(new Date());
  const [cycleInterval, setCycleInterval] = useState<string>("6");
  const [observations, setObservations] = useState("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  useEffect(() => {
    if (visible && item) {
      if (item.date) {
        const parts = item.date.split("-");
        if (parts.length === 3) {
          setHeatDate(
            new Date(
              parseInt(parts[0], 10),
              parseInt(parts[1], 10) - 1,
              parseInt(parts[2], 10),
            ),
          );
        } else {
          setHeatDate(new Date(item.date));
        }
      } else {
        setHeatDate(new Date());
      }
      setCycleInterval(
        item.cycleIntervalInMonths ? String(item.cycleIntervalInMonths) : "6",
      );
      setObservations(item.observations || "");
    }
  }, [visible, item]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const formatDateDisplay = (d: Date) => {
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const formatDatePayload = (d: Date) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const calculateExpectedNextDate = (start: Date, intervalMonths: number) => {
    const next = new Date(start);
    next.setMonth(next.getMonth() + intervalMonths);
    return next;
  };

  const intervalNum = parseInt(cycleInterval, 10) || 6;
  const expectedDate = calculateExpectedNextDate(heatDate, intervalNum);

  const handleDateChange = (
    _event: DateTimePickerChangeEvent,
    chosenDate?: Date,
  ) => {
    setIsDatePickerVisible(false);
    if (chosenDate) {
      setHeatDate(chosenDate);
    }
  };

  const handleConfirm = async () => {
    if (!item) return;

    const payload: IUpdateDogReproductionRequest = {
      date: formatDatePayload(heatDate),
      expectedNextHeatDate: formatDatePayload(expectedDate),
      cycleIntervalInMonths: intervalNum,
      observations: observations.trim() || undefined,
    };

    await onSubmit(item.id, payload);
  };

  if (!item) return null;

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
            <View style={styles.headerTitleRow}>
              <MaterialDesignIcons name="pencil" size={20} color={theme.colors.primary} />
              <Text style={styles.modalTitle}>Editar Registro Reprodutivo</Text>
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
            contentContainerStyle={styles.formContent}
          >
            {/* INFORMACOES DA CADELA (SOMENTE LEITURA) */}
            <View style={styles.dogInfoBanner}>
              <MaterialDesignIcons name="gender-female" size={18} color="#BE185D" />
              <Text style={styles.dogInfoText}>
                Cadela: <Text style={{ fontWeight: "bold" }}>{item.dogsName}</Text>
                {item.dogsBreed ? ` (${formatDogRace(item.dogsBreed)})` : ""}
              </Text>
            </View>

            {/* DATA DO CIO */}
            <View style={styles.datePickerContainer}>
              <Text style={styles.fieldLabel}>Data do Cio:</Text>
              <TouchableOpacity
                style={styles.dateInputButton}
                onPress={() => setIsDatePickerVisible(true)}
                activeOpacity={0.8}
              >
                <MaterialDesignIcons
                  name="calendar-month"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.dateInputText}>
                  {formatDateDisplay(heatDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {isDatePickerVisible && (
              <DateTimePicker
                value={heatDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            {/* INTERVALO DO CICLO */}
            <FormComponent
              text="Intervalo do Ciclo (em meses):"
              placeholder="6"
              value={cycleInterval}
              keyboardType="numeric"
              onChangeText={(text) => setCycleInterval(text.replace(/[^0-9]/g, ""))}
            />

            {/* PREVISAO CALCULADA */}
            <View style={styles.forecastPreviewCard}>
              <MaterialDesignIcons name="information-outline" size={18} color="#BE185D" />
              <View style={{ flex: 1 }}>
                <Text style={styles.forecastPreviewTitle}>
                  Nova Previsão do Próximo Cio:
                </Text>
                <Text style={styles.forecastPreviewDate}>
                  {formatDateDisplay(expectedDate)} ({intervalNum} meses após)
                </Text>
              </View>
            </View>

            {/* OBSERVACOES */}
            <FormComponent
              text="Observações Clínicas:"
              placeholder="Atualize as observações clínicas..."
              value={observations}
              multiline={true}
              numberOfLines={3}
              onChangeText={setObservations}
            />

            {/* BOTOES */}
            <View style={styles.actionsContainer}>
              <View style={styles.actionBtnWrapper}>
                <Button
                  text="Cancelar"
                  variant="outline"
                  onPress={onClose}
                  disabled={submitting}
                />
              </View>
              <View style={styles.actionBtnWrapper}>
                <Button
                  text="Salvar Alterações"
                  onPress={handleConfirm}
                  disabled={submitting}
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
    maxHeight: "90%",
    padding: 20,
    ...theme.shadows.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 14,
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  formContent: {
    gap: 14,
    paddingBottom: 10,
  },
  dogInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: theme.borderRadius.sm,
  },
  dogInfoText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  datePickerContainer: {
    gap: 4,
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    marginLeft: 4,
  },
  dateInputButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateInputText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  forecastPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FDF2F8",
    borderWidth: 1,
    borderColor: "#FBCFE8",
    padding: 10,
    borderRadius: 8,
  },
  forecastPreviewTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#BE185D",
  },
  forecastPreviewDate: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: "#9D174D",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionBtnWrapper: {
    flex: 1,
  },
});
