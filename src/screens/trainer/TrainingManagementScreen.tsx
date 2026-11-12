import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "../../../theme/theme";
import { OfflineStatusBanner } from "./components/OfflineStatusBanner";
import { TrainingDogCard } from "./components/TrainingDogCard";
import { ExecuteTrainingModal } from "./components/ExecuteTrainingModal";
import { TrainingHistoryModal } from "./components/TrainingHistoryModal";
import { DogPickerModal } from "../../shared/components/form/dogPicker";
import { useAlert } from "../../hooks/useAlert";
import { TraningStatus } from "../../types/Training";
import { formatDogRace, IDogResponse } from "../../types/Dog";
import {
  FilterTab,
  TrainingFilterBar,
} from "./components/TrainingFilterBar";
import {
  TrainingBottomBar,
  TrainingEmptyState,
  useTrainingManagement,
} from "./components/trainingManagement";

export const TrainingManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FilterTab>("TODOS");
  const [searchQuery, setSearchQuery] = useState("");

  const { showAlert, AlertModal } = useAlert();

  const {
    trainings,
    availableDogs,
    loading,
    refreshing,
    submitting,
    selectedTraining,
    todaySession,
    executeModalVisible,
    setExecuteModalVisible,
    setTodaySession,
    historyModalVisible,
    setHistoryModalVisible,
    historyItems,
    reportData,
    addDogModalVisible,
    setAddDogModalVisible,
    addDogSearchText,
    setAddDogSearchText,
    onRefresh,
    handleOpenExecuteTraining,
    handleOpenHistory,
    handleSaveSession,
    handleFinalizeStage,
    handleAddDogToTraining,
  } = useTrainingManagement({
    onShowAlert: showAlert,
  });

  const getDogTrainingBadge = (dog: IDogResponse) => {
    const existing = trainings.find(
      (t) => String(t.dogId).toLowerCase() === String(dog.ID).toLowerCase(),
    );
    if (!existing) {
      return {
        status: "NOT_STARTED" as const,
        label: "Sem treinamento iniciado",
      };
    }
    if (
      existing.status === TraningStatus.Apto ||
      existing.status === TraningStatus.Inapto
    ) {
      return {
        status: "COMPLETED" as const,
        label: `Concluído (${existing.status})`,
      };
    }
    return {
      status: "IN_PROGRESS" as const,
      label: `Em treinamento • Etapa ${existing.currentStage || 1}`,
    };
  };

  const filteredPickerDogs = availableDogs.filter((dog) => {
    const q = addDogSearchText.trim().toLowerCase();
    if (!q) return true;
    const name = (dog.name || "").toLowerCase();
    const race = dog.race ? formatDogRace(dog.race).toLowerCase() : "";
    return name.includes(q) || race.includes(q);
  });

  // Filtragem dos cards por busca e tab
  const filteredTrainings = trainings.filter((t) => {
    const matchesSearch =
      t.dogsName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.dogsBreed.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const isCompleted =
      t.status === TraningStatus.Apto || t.status === TraningStatus.Inapto;

    if (activeTab === "EM_TREINAMENTO") {
      return !isCompleted;
    }
    if (activeTab === "CONCLUIDO") {
      return isCompleted;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <OfflineStatusBanner />

      <View style={styles.content}>
        <TrainingFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* LISTA DE CARDS */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando cães em treinamento...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTrainings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TrainingDogCard
                item={item}
                onExecuteTraining={
                  activeTab === "CONCLUIDO" || item.status != null
                    ? handleOpenHistory
                    : handleOpenExecuteTraining
                }
                onViewHistory={handleOpenHistory}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
            ListEmptyComponent={
              <TrainingEmptyState
                searchQuery={searchQuery}
                activeTab={activeTab}
              />
            }
          />
        )}
      </View>

      {/* BARRA INFERIOR PARA ADICIONAR CÃO AO TREINAMENTO */}
      <TrainingBottomBar
        bottomInset={insets.bottom}
        submitting={submitting}
        onAddDog={() => {
          setAddDogSearchText("");
          setAddDogModalVisible(true);
        }}
      />

      {/* MODAL PARA SELECIONAR CÃO E ADICIONAR AO TREINAMENTO */}
      <DogPickerModal
        visible={addDogModalVisible}
        onClose={() => {
          setAddDogModalVisible(false);
          setAddDogSearchText("");
        }}
        onSelectDog={handleAddDogToTraining}
        filteredDogs={filteredPickerDogs}
        activeDog={null}
        loadingDogs={loading}
        searchText={addDogSearchText}
        onSearchChange={setAddDogSearchText}
        getDogTestBadge={getDogTrainingBadge}
        isDogDisabled={(dog) => {
          const existing = trainings.find(
            (t) =>
              String(t.dogId).toLowerCase() === String(dog.ID).toLowerCase(),
          );
          if (existing) {
            return {
              disabled: true,
              reason: existing.status
                ? "Este cão já concluiu o treinamento"
                : "Este cão já está na lista de treinamento",
            };
          }
          return { disabled: false };
        }}
        modalTitle="Adicionar Cão ao Treinamento"
        modalSubtitle="Selecione um cão que ainda não iniciou o treinamento"
      />

      {/* MODAL DE EXECUÇÃO DE TREINAMENTO */}
      <ExecuteTrainingModal
        visible={executeModalVisible}
        training={selectedTraining}
        todaySession={todaySession}
        onClose={() => {
          setExecuteModalVisible(false);
          setTodaySession(null);
        }}
        onSaveSession={handleSaveSession}
        onFinalizeStage={handleFinalizeStage}
        submitting={submitting}
      />

      {/* MODAL DE HISTÓRICO / RELATÓRIO COMPLETO */}
      <TrainingHistoryModal
        visible={historyModalVisible}
        training={selectedTraining}
        report={reportData}
        historyItems={historyItems}
        onClose={() => setHistoryModalVisible(false)}
      />

      <AlertModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: "#6B7280",
  },
});
