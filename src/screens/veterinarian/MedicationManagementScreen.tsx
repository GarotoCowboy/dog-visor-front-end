import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";

import { theme } from "../../../theme/theme";
import {
  createMedicationService,
  deleteMedicationService,
  listDogsService,
  listMedicationsService,
} from "../../service/api";
import { Card } from "../../shared/components/CardComponent";
import { Button } from "../../shared/components/ButtonComponent";
import FormComponent from "../../shared/components/FormComponent";
import { CustomAlertComponent } from "../../shared/components/CustomAlertComponent";
import { IDogResponse } from "../../types/Dog";
import { IMedicationResponse } from "../../types/Medication";

export const MedicationManagementScreen = () => {
  const [medications, setMedications] = useState<IMedicationResponse[]>([]);
  const [dogs, setDogs] = useState<IDogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Modal de Criação de Medicamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dogsName, setDogsName] = useState("");
  const [prescription, setPrescription] = useState("");
  const [limitDate, setLimitDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Padrão 7 dias à frente
  );
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Alerta customizado
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    variant: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({
    visible: false,
    variant: "success",
    title: "",
    message: "",
  });

  // Modal de confirmação para excluir
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    item: IMedicationResponse | null;
  }>({
    visible: false,
    item: null,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [medsData, dogsData] = await Promise.allSettled([
        listMedicationsService(),
        listDogsService(),
      ]);

      if (medsData.status === "fulfilled" && Array.isArray(medsData.value)) {
        setMedications(medsData.value);
      }
      if (dogsData.status === "fulfilled" && Array.isArray(dogsData.value)) {
        setDogs(dogsData.value);
      }
    } catch (err) {
      console.log("Erro ao carregar medicamentos:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateMedication = async () => {
    if (!dogsName.trim()) {
      setAlertConfig({
        visible: true,
        variant: "warning",
        title: "Nome do Cão",
        message: "Por favor, selecione ou informe o nome do cão.",
      });
      return;
    }

    if (!prescription.trim()) {
      setAlertConfig({
        visible: true,
        variant: "warning",
        title: "Prescrição Obrigatória",
        message: "Por favor, informe a posologia / prescrição do medicamento.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const formattedDate = limitDate.toISOString().split("T")[0]; // "YYYY-MM-DD"

      const newMed = await createMedicationService({
        dogsName: dogsName.trim(),
        prescription: prescription.trim(),
        limitDate: formattedDate,
      });

      setMedications((prev) => [newMed, ...prev]);
      setIsModalOpen(false);
      setDogsName("");
      setPrescription("");

      setAlertConfig({
        visible: true,
        variant: "success",
        title: "Medicamento Cadastrado",
        message: "A prescrição de medicamento foi cadastrada com sucesso!",
      });
    } catch (err: any) {
      console.log("Erro ao criar medicamento:", err);
      setAlertConfig({
        visible: true,
        variant: "error",
        title: "Erro ao Cadastrar",
        message:
          err.response?.data?.message ||
          "Não foi possível salvar o medicamento. Tente novamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestDelete = (item: IMedicationResponse) => {
    setDeleteModal({
      visible: true,
      item,
    });
  };

  const handleConfirmDelete = async () => {
    const item = deleteModal.item;
    setDeleteModal({ visible: false, item: null });

    if (!item || !item.id) return;

    // Atualização otimista
    setMedications((prev) => prev.filter((m) => m.id !== item.id));

    try {
      await deleteMedicationService(item.id);
    } catch (err) {
      console.log("Erro ao deletar medicamento:", err);
      loadData();
    }
  };

  // Opções para o dropdown de cães
  const dogOptions = dogs.map((dog) => ({
    label: dog.name,
    value: dog.name,
  }));

  const filteredMedications = medications.filter((item) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      item.dogsName?.toLowerCase().includes(term) ||
      item.prescription?.toLowerCase().includes(term)
    );
  });

  const parseLocalDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10),
      );
    }
    return new Date(dateStr);
  };

  return (
    <View style={styles.container}>
      {/* CABEÇALHO COM BUSCA E BOTÃO NOVO */}
      <View style={styles.topActionsContainer}>
        <View style={styles.searchWrapper}>
          <FormComponent
            placeholder="Buscar por cão ou medicamento..."
            value={search}
            onChangeText={setSearch}
            leftIcon={
              <FontAwesomeFreeSolid
                name="magnifying-glass"
                size={theme.typography.fontSize.base}
                color={theme.colors.secondary}
              />
            }
          />
        </View>

        <TouchableOpacity
          style={styles.newButton}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
        >
          <FontAwesomeFreeSolid
            name="plus"
            size={14}
            color={theme.colors.white}
          />
          <Text style={styles.newButtonText}>Novo</Text>
        </TouchableOpacity>
      </View>

      {/* CONTADOR */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          {filteredMedications.length}{" "}
          {filteredMedications.length === 1
            ? "medicamento prescrito"
            : "medicamentos prescritos"}
        </Text>
      </View>

      {/* LISTAGEM DE MEDICAMENTOS */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando medicamentos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMedications}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const limDate = parseLocalDate(item.limitDate);
            const isExpired = limDate
              ? limDate.getTime() < new Date().setHours(0, 0, 0, 0)
              : false;

            return (
              <View style={styles.cardWrapper}>
                <Card>
                  <View
                    style={[
                      styles.cardInnerContent,
                      isExpired && styles.cardExpiredHighlight,
                    ]}
                  >
                    {/* BARRA LATERAL */}
                    <View
                      style={[
                        styles.colorBar,
                        {
                          backgroundColor: isExpired
                            ? "#D32F2F"
                            : theme.colors.secondary,
                        },
                      ]}
                    />

                    <View style={styles.cardBody}>
                      {/* TOPO: NOME DO CÃO + BOTÃO EXCLUIR */}
                      <View style={styles.cardHeader}>
                        <View style={styles.dogNameRow}>
                          <FontAwesomeFreeSolid
                            name="dog"
                            size={16}
                            color={theme.colors.primary}
                          />
                          <Text style={styles.dogNameText}>
                            {item.dogsName}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleRequestDelete(item)}
                          activeOpacity={0.7}
                        >
                          <MaterialDesignIcons
                            name="trash-can-outline"
                            size={18}
                            color="#D32F2F"
                          />
                        </TouchableOpacity>
                      </View>

                      {/* PRESCRIÇÃO */}
                      <View style={styles.prescriptionBox}>
                        <FontAwesomeFreeSolid
                          name="pills"
                          size={13}
                          color={theme.colors.secondary}
                          style={{ marginTop: 2 }}
                        />
                        <Text style={styles.prescriptionText}>
                          {item.prescription}
                        </Text>
                      </View>

                      {/* PRAZO LIMITE */}
                      {limDate && (
                        <View
                          style={[
                            styles.limitDateRow,
                            isExpired && styles.limitDateRowExpired,
                          ]}
                        >
                          <MaterialDesignIcons
                            name={isExpired ? "alert-circle" : "calendar-clock"}
                            size={14}
                            color={isExpired ? "#D32F2F" : theme.colors.text}
                          />
                          <Text
                            style={[
                              styles.limitDateText,
                              isExpired && styles.limitDateTextExpired,
                            ]}
                          >
                            {isExpired
                              ? "Tratamento expirado em: "
                              : "Administrar até: "}
                            {`${limDate.getDate()}/${limDate.getMonth() + 1}/${limDate.getFullYear()}`}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialDesignIcons
                name="pill-off"
                size={54}
                color={theme.colors.text}
                style={{ opacity: 0.3 }}
              />
              <Text style={styles.emptyTitle}>
                Nenhum medicamento encontrado
              </Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? "Tente buscar com outros termos."
                  : "Nenhuma prescrição cadastrada no momento."}
              </Text>
            </View>
          }
        />
      )}

      {/* MODAL DE CRIAÇÃO DE MEDICAMENTO */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prescrever Medicamento</Text>
              <Pressable
                onPress={() => setIsModalOpen(false)}
                style={styles.modalCloseButton}
              >
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
              {dogOptions.length > 0 ? (
                <FormComponent
                  variant="dropdown"
                  text="Cão *"
                  placeholder="Selecione o cão"
                  value={dogsName}
                  onChangeText={setDogsName}
                  options={dogOptions}
                  onSelect={(val) => setDogsName(val)}
                  searchable
                  searchPlaceholder="Pesquisar cão..."
                />
              ) : (
                <FormComponent
                  text="Nome do Cão *"
                  placeholder="Ex: Thor, Rex, Luna..."
                  value={dogsName}
                  onChangeText={setDogsName}
                />
              )}

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
                <Button
                  text="Cancelar"
                  variant="outline"
                  onPress={() => setIsModalOpen(false)}
                />
                <Button
                  text={submitting ? "Salvando..." : "Salvar Prescrição"}
                  onPress={handleCreateMedication}
                  disabled={submitting}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ALERTA CUSTOMIZADO */}
      <CustomAlertComponent
        visible={alertConfig.visible}
        variant={alertConfig.variant}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() =>
          setAlertConfig((prev) => ({ ...prev, visible: false }))
        }
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <CustomAlertComponent
        visible={deleteModal.visible}
        variant="warning"
        title="Excluir Prescrição"
        message={
          deleteModal.item
            ? `Deseja realmente excluir a prescrição para o cão "${deleteModal.item.dogsName}"?`
            : "Deseja realmente excluir esta prescrição?"
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        showCancel={true}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ visible: false, item: null })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  searchWrapper: {
    flex: 1,
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newButtonText: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.sm,
  },
  summaryRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  summaryText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  cardWrapper: {
    width: "100%",
  },
  cardInnerContent: {
    flexDirection: "row",
    overflow: "hidden",
  },
  cardExpiredHighlight: {
    backgroundColor: "#FFF8F8",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: theme.borderRadius.md,
  },
  colorBar: {
    width: 6,
    borderTopLeftRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dogNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dogNameText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  deleteButton: {
    padding: 4,
  },
  prescriptionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: `${theme.colors.secondary}10`,
    padding: 10,
    borderRadius: 6,
  },
  prescriptionText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 18,
  },
  limitDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  limitDateRowExpired: {
    backgroundColor: "#FFEBEE",
    padding: 6,
    borderRadius: 4,
  },
  limitDateText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: theme.colors.text,
    opacity: 0.7,
  },
  limitDateTextExpired: {
    color: "#C62828",
    fontFamily: theme.typography.fontFamily.bold,
    opacity: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  fieldSection: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerButtonText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    opacity: 0.7,
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});

export default MedicationManagementScreen;

