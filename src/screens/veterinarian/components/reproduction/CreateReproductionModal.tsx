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
import { formatDogRace, IDogResponse } from "../../../../types/Dog";
import {
  ICreateDogReproductionRequest,
  IDogReproductionResponse,
} from "../../../../types/DogHealth";

interface CreateReproductionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: ICreateDogReproductionRequest) => Promise<void>;
  submitting: boolean;
  dogs: IDogResponse[];
  existingReproductions?: IDogReproductionResponse[];
  preselectedDog?: IDogResponse;
  onValidationAlert: (title: string, message: string) => void;
}

export const CreateReproductionModal: React.FC<CreateReproductionModalProps> = ({
  visible,
  onClose,
  onSubmit,
  submitting,
  dogs,
  existingReproductions = [],
  preselectedDog,
  onValidationAlert,
}) => {
  const [selectedDog, setSelectedDog] = useState<IDogResponse | null>(null);
  const [heatDate, setHeatDate] = useState<Date>(new Date());
  const [cycleInterval, setCycleInterval] = useState<string>("6");
  const [observations, setObservations] = useState("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const hasActiveRecord = (d: IDogResponse) =>
    existingReproductions.some(
      (r) =>
        (r.dogId && d.ID && r.dogId === d.ID) ||
        (r.dogsName &&
          d.name &&
          r.dogsName.trim().toLowerCase() === d.name.trim().toLowerCase()),
    );

  // Filtrar apenas cadelas fêmeas que ainda NÃO possuem controle reprodutivo ativo
  const femaleDogs = dogs.filter(
    (d) => d.sex?.toUpperCase() === "F" && !hasActiveRecord(d),
  );

  useEffect(() => {
    if (visible) {
      if (
        preselectedDog &&
        preselectedDog.sex?.toUpperCase() === "F" &&
        !hasActiveRecord(preselectedDog)
      ) {
        setSelectedDog(preselectedDog);
      } else if (femaleDogs.length === 1) {
        setSelectedDog(femaleDogs[0]);
      } else {
        setSelectedDog(null);
      }
      setHeatDate(new Date());
      setCycleInterval("6");
      setObservations("");
    }
  }, [visible, preselectedDog, existingReproductions.length]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const formatDateDisplay = (d: Date) => {
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const formatDatePayload = (d: Date) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  // Previsao estimada do proximo cio
  const calculateExpectedNextDate = (start: Date, intervalMonths: number) => {
    const next = new Date(start);
    next.setMonth(next.getMonth() + intervalMonths);
    return next;
  };

  const intervalNum = parseInt(cycleInterval, 10) || 6;
  const expectedDate = calculateExpectedNextDate(heatDate, intervalNum);

  const dogDropdownOptions = femaleDogs.map((d) => {
    const formattedRace = d.race ? formatDogRace(d.race) : "";
    return {
      label: `${d.name}${formattedRace ? ` (${formattedRace})` : ""}`,
      value: d.ID,
    };
  });

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
    if (!selectedDog) {
      onValidationAlert(
        "Cadela Obrigatória",
        "Por favor, selecione uma cadela fêmea disponível para registrar o cio.",
      );
      return;
    }

    if (hasActiveRecord(selectedDog)) {
      onValidationAlert(
        "Controle Já Ativo",
        `A cadela "${selectedDog.name}" já possui um controle reprodutivo cadastrado. Edite o registro existente.`,
      );
      return;
    }

    const payload: ICreateDogReproductionRequest = {
      dogId: selectedDog.ID,
      dogsName: selectedDog.name,
      dogsBreed: selectedDog.race ? formatDogRace(selectedDog.race) : "Não informada",
      date: formatDatePayload(heatDate),
      expectedNextHeatDate: formatDatePayload(expectedDate),
      cycleIntervalInMonths: intervalNum,
      observations: observations.trim() || undefined,
    };

    await onSubmit(payload);
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
            <View style={styles.headerTitleRow}>
              <MaterialDesignIcons name="calendar-heart" size={22} color="#BE185D" />
              <Text style={styles.modalTitle}>Registrar Cio / Reprodução</Text>
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
            {/* SELEÇÃO DA CADELA */}
            <DogPickerField
              label="Cadela (Fêmea) *"
              placeholder={
                femaleDogs.length === 0
                  ? "Todas as fêmeas já possuem controle ativo"
                  : "Selecione a cadela..."
              }
              dogs={femaleDogs}
              selectedDog={selectedDog}
              onSelectDog={(dog) => setSelectedDog(dog)}
              modalTitle="Selecionar Cadela"
              modalSubtitle="Apenas fêmeas sem controle reprodutivo ativo são exibidas"
              required
            />

            {/* DATA DO CIO */}
            <View style={styles.datePickerContainer}>
              <Text style={styles.fieldLabel}>Data do Cio Observado: *</Text>
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

            {/* INTERVALO DO CICLO EM MESES */}
            <FormComponent
              text="Intervalo do Ciclo (em meses):"
              placeholder="6"
              value={cycleInterval}
              keyboardType="numeric"
              onChangeText={(text) => setCycleInterval(text.replace(/[^0-9]/g, ""))}
            />

            {/* CARD DE PREVISAO CALCULADA */}
            <View style={styles.forecastPreviewCard}>
              <MaterialDesignIcons name="information-outline" size={18} color="#BE185D" />
              <View style={{ flex: 1 }}>
                <Text style={styles.forecastPreviewTitle}>
                  Previsão do Próximo Cio:
                </Text>
                <Text style={styles.forecastPreviewDate}>
                  {formatDateDisplay(expectedDate)} ({intervalNum} meses após)
                </Text>
              </View>
            </View>

            {/* OBSERVACOES */}
            <FormComponent
              text="Observações Clínicas:"
              placeholder="Ex: Sinais de proestro identificados, comportamento calmo..."
              value={observations}
              multiline={true}
              numberOfLines={3}
              onChangeText={setObservations}
            />

            {/* BOTOES DE ACAO */}
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
                  text="Registrar Cio"
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
