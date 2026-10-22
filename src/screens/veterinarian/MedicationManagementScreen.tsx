import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../theme/theme";
import {
  createMedicationService,
  deleteMedicationService,
  listDogsService,
  listMedicationsService,
} from "../../service/api";
import FormComponent from "../../shared/components/FormComponent";
import { useAlert } from "../../hooks/useAlert";
import { IDogResponse } from "../../types/Dog";
import { IMedicationResponse } from "../../types/Medication";
import { MedicationItemCard } from "./components/medications/MedicationItemCard";
import { CreateMedicationModal } from "./components/medications/CreateMedicationModal";

export const MedicationManagementScreen = () => {
  const { showAlert, showConfirm, AlertModal } = useAlert();
  const [medications, setMedications] = useState<IMedicationResponse[]>([]);
  const [dogs, setDogs] = useState<IDogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // Modal de Criação de Medicamento
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateMedication = async (payload: {
    dogsName: string;
    prescription: string;
    limitDate: Date;
  }) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const formattedDate = `${payload.limitDate.getFullYear()}-${pad(
      payload.limitDate.getMonth() + 1,
    )}-${pad(payload.limitDate.getDate())}`;

    try {
      setSubmitting(true);
      const newMed = await createMedicationService({
        dogsName: payload.dogsName,
        prescription: payload.prescription,
        limitDate: formattedDate,
      });

      if (newMed) {
        setMedications((prev) => [newMed, ...prev]);
      } else {
        await loadData();
      }

      setIsModalOpen(false);

      showAlert(
        "success",
        "Sucesso",
        "Prescrição cadastrada e publicada no mural!",
      );
    } catch (err: any) {
      console.log("Erro ao salvar medicamento:", err);
      showAlert(
        "error",
        "Erro ao Cadastrar",
        err?.response?.data?.message ||
          "Não foi possível salvar o medicamento. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestDelete = (item: IMedicationResponse) => {
    showConfirm(
      "Excluir Prescrição",
      `Deseja realmente excluir a prescrição para o cão "${item.dogsName}"?`,
      async () => {
        if (!item?.id) return;

        try {
          setLoading(true);
          await deleteMedicationService(item.id);
          setMedications((prev) => prev.filter((m) => m.id !== item.id));

          showAlert(
            "success",
            "Removido",
            "Prescrição de medicamento excluída com sucesso.",
          );
        } catch (err: any) {
          console.log("Erro ao excluir medicamento:", err);
          showAlert(
            "error",
            "Erro",
            err?.response?.data?.message ||
              "Não foi possível excluir a prescrição.",
          );
        } finally {
          setLoading(false);
        }
      },
      "Excluir",
      "Cancelar",
    );
  };

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
          renderItem={({ item }) => (
            <MedicationItemCard
              item={item}
              onRequestDelete={handleRequestDelete}
              parseLocalDate={parseLocalDate}
            />
          )}
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
      <CreateMedicationModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMedication}
        submitting={submitting}
        dogs={dogs}
        onValidationAlert={(title, message) =>
          showAlert("warning", title, message)
        }
      />

      {/* ALERTA CUSTOMIZADO */}
      <AlertModal />
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
  },
  newButtonText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  summaryRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  summaryText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.secondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.secondary,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.secondary,
    textAlign: "center",
    lineHeight: 18,
  },
});

export default MedicationManagementScreen;
