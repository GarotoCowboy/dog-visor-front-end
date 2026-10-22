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
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../../theme/theme";
import { Button } from "../../../../shared/components/ButtonComponent";
import FormComponent from "../../../../shared/components/FormComponent";
import {
  AudienceType,
  INotificationCreateRequest,
  MessageType,
} from "../../../../types/Notification";
import { EventTypeSelector } from "./EventTypeSelector";
import { EventAudienceSelector } from "./EventAudienceSelector";
import { EventDateTimePickers } from "./EventDateTimePickers";

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: INotificationCreateRequest) => Promise<void>;
  submitting: boolean;
  initialDate?: Date;
  getMessageTypeColor: (type?: MessageType) => string;
  onValidationAlert: (title: string, message: string) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  onClose,
  onSubmit,
  submitting,
  initialDate,
  getMessageTypeColor,
  onValidationAlert,
}) => {
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formMessageType, setFormMessageType] = useState<MessageType>(
    MessageType.GENERAL,
  );
  const [formAudienceType, setFormAudienceType] = useState<AudienceType>(
    AudienceType.ALL,
  );

  // Data e hora do evento
  const [formEventDate, setFormEventDate] = useState<Date>(
    initialDate || new Date(),
  );
  const [formEventTime, setFormEventTime] = useState<Date>(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

  // Data e hora limite
  const [hasLimitDate, setHasLimitDate] = useState(false);
  const [formLimitDate, setFormLimitDate] = useState<Date>(new Date());
  const [formLimitTime, setFormLimitTime] = useState<Date>(new Date());
  const [isLimitDatePickerVisible, setIsLimitDatePickerVisible] = useState(false);
  const [isLimitTimePickerVisible, setIsLimitTimePickerVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setFormTitle("");
      setFormMessage("");
      setFormMessageType(MessageType.GENERAL);
      setFormAudienceType(AudienceType.ALL);
      setFormEventDate(initialDate || new Date());
      setFormEventTime(new Date());
      setHasLimitDate(false);
      setFormLimitDate(new Date());
      setFormLimitTime(new Date());
    }
  }, [visible, initialDate]);

  const handleCreate = async () => {
    if (!formTitle.trim()) {
      onValidationAlert("Campo Obrigatório", "Por favor, informe o título do evento.");
      return;
    }

    if (!formMessage.trim()) {
      onValidationAlert(
        "Campo Obrigatório",
        "Por favor, informe a descrição ou mensagem do evento.",
      );
      return;
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatIsoDate = (d: Date, t: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        t.getHours(),
      )}:${pad(t.getMinutes())}:00`;

    const payload: INotificationCreateRequest = {
      title: formTitle.trim(),
      message: formMessage.trim(),
      messageType: formMessageType,
      audienceType: formAudienceType,
      eventDate: formatIsoDate(formEventDate, formEventTime),
      ...(hasLimitDate
        ? { limitDate: formatIsoDate(formLimitDate, formLimitTime) }
        : {}),
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalContentCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleRow}>
              <MaterialDesignIcons
                name="calendar-plus"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.modalTitle}>Novo Evento na Agenda</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <FontAwesomeFreeSolid
                name="xmark"
                size={16}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalFormBody}
          >
            {/* TÍTULO */}
            <FormComponent
              text="Título do Evento *"
              placeholder="Ex: Medicação - Thor, Vacinação..."
              value={formTitle}
              onChangeText={setFormTitle}
            />

            {/* MENSAGEM / DETALHES */}
            <FormComponent
              text="Descrição / Mensagem *"
              placeholder="Descreva detalhes do evento, dosagem, orientações ou procedimentos..."
              value={formMessage}
              onChangeText={setFormMessage}
              multiline
              numberOfLines={3}
            />

            {/* TIPO DE EVENTO (CHIPS) */}
            <EventTypeSelector
              selectedType={formMessageType}
              onSelectType={setFormMessageType}
              getMessageTypeColor={getMessageTypeColor}
            />

            {/* PÚBLICO ALVO (CHIPS) */}
            <EventAudienceSelector
              selectedAudience={formAudienceType}
              onSelectAudience={setFormAudienceType}
            />

            {/* DATA E HORA DO EVENTO + DATA LIMITE */}
            <EventDateTimePickers
              formEventDate={formEventDate}
              setFormEventDate={setFormEventDate}
              formEventTime={formEventTime}
              setFormEventTime={setFormEventTime}
              isDatePickerVisible={isDatePickerVisible}
              setIsDatePickerVisible={setIsDatePickerVisible}
              isTimePickerVisible={isTimePickerVisible}
              setIsTimePickerVisible={setIsTimePickerVisible}
              hasLimitDate={hasLimitDate}
              setHasLimitDate={setHasLimitDate}
              formLimitDate={formLimitDate}
              setFormLimitDate={setFormLimitDate}
              formLimitTime={formLimitTime}
              setFormLimitTime={setFormLimitTime}
              isLimitDatePickerVisible={isLimitDatePickerVisible}
              setIsLimitDatePickerVisible={setIsLimitDatePickerVisible}
              isLimitTimePickerVisible={isLimitTimePickerVisible}
              setIsLimitTimePickerVisible={setIsLimitTimePickerVisible}
            />

            {/* BOTÕES DE AÇÃO */}
            <View style={styles.modalActionsRow}>
              <View style={{ flex: 1 }}>
                <Button
                  text="Cancelar"
                  variant="transparent"
                  onPress={onClose}
                  disabled={submitting}
                />
              </View>
              <View style={{ flex: 1.5 }}>
                <Button
                  text={submitting ? "Cadastrando..." : "Criar Evento"}
                  onPress={handleCreate}
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
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContentCard: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: "90%",
    paddingBottom: 24,
    ...theme.shadows.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalHeaderTitleRow: {
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
    padding: 6,
  },
  modalFormBody: {
    padding: 20,
    gap: 16,
  },
  modalActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    marginBottom: 8,
  },
});
