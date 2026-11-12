import React, { useEffect, useState } from "react";
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

import { theme } from "../../../../theme/theme";
import { IDogResponse } from "../../../types/Dog";
import { IDogMassageResponse } from "../../../types/DogHealth";
import { listDogMassagesByDogIdService } from "../../../service/api";

interface PuppyMassageModalProps {
  visible: boolean;
  dog: IDogResponse | null;
  submitting: boolean;
  onClose: () => void;
  onSaveMassage: (dogId: string, observations: string) => Promise<void>;
}

const QUICK_MASSAGE_TEMPLATES = [
  "Massagem realizada com sucesso. Filhote relaxado e receptivo.",
  "Sessão de massagem completa. Boa resposta aos estímulos táteis.",
  "Massagem terapêutica aplicada nas patas e lombar.",
  "Filhote demonstrou calma durante toda a sessão.",
  "Massagem focada na socialização e relaxamento.",
];

export const PuppyMassageModal: React.FC<PuppyMassageModalProps> = ({
  visible,
  dog,
  submitting,
  onClose,
  onSaveMassage,
}) => {
  const [observations, setObservations] = useState("");
  const [history, setHistory] = useState<IDogMassageResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (visible && dog) {
      setObservations("");
      setLoadingHistory(true);
      listDogMassagesByDogIdService(dog.ID)
        .then((res) => {
          setHistory(Array.isArray(res) ? res : []);
        })
        .catch(() => setHistory([]))
        .finally(() => setLoadingHistory(false));
    } else {
      setObservations("");
      setHistory([]);
    }
  }, [visible, dog]);

  const handleSelectTemplate = (template: string) => {
    setObservations(template);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.split("T")[0];
    return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const isValid = observations.trim().length > 0;

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
                  name="hand-back-right-outline"
                  size={20}
                  color="#2E6B65"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  Massagem • {dog?.name || "Filhote"}
                </Text>
                <Text style={styles.subtitle}>
                  Registre a sessão de massagem e dessensibilização do filhote
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialDesignIcons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* MODELOS RÁPIDOS */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Modelos Rápidos (opcional)</Text>
              <View style={styles.templatesContainer}>
                {QUICK_MASSAGE_TEMPLATES.map((template, idx) => {
                  const isSelected = observations.trim() === template;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.templateCard,
                        isSelected && styles.templateCardSelected,
                      ]}
                      onPress={() => handleSelectTemplate(template)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.templateText,
                          isSelected && styles.templateTextSelected,
                        ]}
                      >
                        {template}
                      </Text>
                      {isSelected && (
                        <MaterialDesignIcons
                          name="check-circle"
                          size={18}
                          color="#2E6B65"
                          style={styles.selectedIcon}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* CAMPO DE OBSERVAÇÕES */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Observações *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Descreva a sessão de massagem..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={observations}
                onChangeText={setObservations}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.characterCounter}>
                {observations.length}/500 caracteres
              </Text>
            </View>

            {/* DICAS PARA O REGISTRO */}
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>Dicas para o registro:</Text>
              <Text style={styles.tipItem}>
                • Note a duração aproximada da sessão
              </Text>
              <Text style={styles.tipItem}>
                • Descreva a reação do filhote (calmo, agitado, receptivo)
              </Text>
              <Text style={styles.tipItem}>
                • Mencione áreas específicas massageadas
              </Text>
              <Text style={styles.tipItem}>
                • Registre qualquer comportamento incomum
              </Text>
            </View>

            {/* HISTÓRICO DE MASSAGENS */}
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>
                Últimas Massagens ({history.length})
              </Text>
              {loadingHistory ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ marginVertical: 12 }}
                />
              ) : history.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhuma massagem anterior registrada para este filhote.
                </Text>
              ) : (
                history.slice(0, 5).map((item, idx) => (
                  <View key={item.id || idx} style={styles.historyCard}>
                    <Text style={styles.historyDate}>
                      {formatDate(item.createdAt)}
                    </Text>
                    <Text style={styles.historyObs}>
                      {item.observations || "Massagem realizada sem ressalvas."}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

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
                (!isValid || submitting) && { opacity: 0.5 },
              ]}
              disabled={!isValid || submitting || !dog}
              onPress={() =>
                dog && onSaveMassage(dog.ID, observations.trim())
              }
            >
              <MaterialDesignIcons name="check" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {submitting ? "Registrando..." : "Confirmar Massagem"}
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
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
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
    backgroundColor: "#E6F4F1",
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
    gap: 18,
  },
  sectionContainer: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: "#374151",
  },
  templatesContainer: {
    gap: 8,
  },
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  templateCardSelected: {
    borderColor: "#2E6B65",
    backgroundColor: "#F2F9F8",
  },
  templateText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13.5,
    color: "#1F2937",
    lineHeight: 19,
  },
  templateTextSelected: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: "#1F2937",
  },
  selectedIcon: {
    marginLeft: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    minHeight: 110,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    lineHeight: 20,
  },
  characterCounter: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  tipsBox: {
    backgroundColor: "#D3ECE7",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  tipsTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: "#1B4742",
    marginBottom: 2,
  },
  tipItem: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#285E57",
    lineHeight: 18,
  },
  historySection: {
    gap: 8,
    marginTop: 4,
  },
  historyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: "#374151",
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  historyCard: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 2,
  },
  historyDate: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#2E6B65",
  },
  historyObs: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#4B5563",
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
    backgroundColor: "#2E6B65",
  },
  saveBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: "#FFFFFF",
  },
});
