import React from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { theme } from "../../../../theme/theme";
import { IDogTest, TestType } from "../../../types/Training";
import { IDogResponse } from "../../../types/Dog";
import { DogPickerField } from "../../../shared/components/form";
import {
  BehaviorItemScreen,
  BehaviorMenuSection,
  CreateTestFooter,
  CreateTestModalHeader,
  CreateTestStatusRow,
  CreateTestTypeSelector,
  useCreateTestForm,
  VolhardMenuSection,
  VolhardStructureScreen,
  VolhardSubtestScreen,
} from "./testModal";
import { BEHAVIOR_CHECKLIST_ITEMS } from "../constants/testQuestionsData";

interface CreateTestModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (test: Omit<IDogTest, "id">, existingId?: string) => void;
  availableDogs: IDogResponse[];
  initialTestType?: TestType;
  editingTest?: IDogTest | null;
  existingTests?: IDogTest[];
}

export const CreateTestModal: React.FC<CreateTestModalProps> = ({
  visible,
  onClose,
  onSave,
  availableDogs,
  initialTestType = TestType.VOLHARD,
  editingTest = null,
  existingTests = [],
}) => {
  const {
    selectedDogId,
    selectedDog,
    testType,
    date,
    setDate,
    isReady,
    activeVolhardIndex,
    setActiveVolhardIndex,
    isVolhardStructureOpen,
    setIsVolhardStructureOpen,
    activeBehaviorIndex,
    setActiveBehaviorIndex,
    volhardScores,
    handleSelectVolhardScore,
    structureState,
    structureAnsweredFields,
    volhardCompletedCount,
    behaviorCompletedCount,
    currentCompletedCount,
    currentTotalCount,
    isAllCompleted,
    behaviorSearch,
    setBehaviorSearch,
    filteredBehaviorItems,
    getDogTestBadge,
    handleSelectDog,
    handleSelectTestType,
    handleSetAllStructure,
    handleSetSingleStructureField,
    handleSelectBehaviorOption,
    getBehaviorItemSelectedValue,
    getBehaviorItemSelectedLabel,
    handleSave,
  } = useCreateTestForm({
    visible,
    onClose,
    onSave,
    availableDogs,
    initialTestType,
    editingTest,
    existingTests,
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {activeVolhardIndex !== null ? (
            <VolhardSubtestScreen
              subtestIndex={activeVolhardIndex}
              selectedDog={selectedDog}
              volhardScores={volhardScores}
              onBackToMenu={() => setActiveVolhardIndex(null)}
              onSelectScore={handleSelectVolhardScore}
              onNavigateSubtest={(idx) => setActiveVolhardIndex(idx)}
              onOpenStructureScreen={() => {
                setActiveVolhardIndex(null);
                setIsVolhardStructureOpen(true);
              }}
            />
          ) : isVolhardStructureOpen ? (
            <VolhardStructureScreen
              selectedDog={selectedDog}
              structureState={structureState}
              structureAnsweredFields={structureAnsweredFields}
              onBackToMenu={() => setIsVolhardStructureOpen(false)}
              onSetAllStructure={handleSetAllStructure}
              onSetSingleStructureField={handleSetSingleStructureField}
            />
          ) : activeBehaviorIndex !== null ? (
            <BehaviorItemScreen
              itemIndex={activeBehaviorIndex}
              selectedDog={selectedDog}
              selectedValue={getBehaviorItemSelectedValue(
                BEHAVIOR_CHECKLIST_ITEMS[activeBehaviorIndex],
              )}
              onBackToMenu={() => setActiveBehaviorIndex(null)}
              onSelectOption={handleSelectBehaviorOption}
              onNavigateItem={(idx) => setActiveBehaviorIndex(idx)}
            />
          ) : (
            <>
              <CreateTestModalHeader
                testType={testType}
                onClose={onClose}
              />

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* SELEÇÃO DO CÃO COM COMPONENTE COMPARTILHADO DogPickerField */}
                <View style={styles.fieldSection}>
                  <DogPickerField
                    label="Selecione o Cão *"
                    placeholder={
                      availableDogs.length === 0
                        ? "Nenhum cão disponível cadastrado"
                        : "Selecione o cão a ser avaliado..."
                    }
                    dogs={availableDogs}
                    selectedDog={selectedDog}
                    onSelectDog={handleSelectDog}
                    getDogTestBadge={getDogTestBadge}
                    modalTitle={
                      testType === TestType.VOLHARD
                        ? "Selecionar Cão • Teste Volhard"
                        : "Selecionar Cão • Teste Behavior"
                    }
                    modalSubtitle="Cães separados por status do teste"
                    required
                  />
                </View>

                {/* MODALIDADE DE AVALIAÇÃO (VOLHARD / BEHAVIOR) */}
                <CreateTestTypeSelector
                  testType={testType}
                  onSelectTestType={handleSelectTestType}
                />

                {/* DATA E STATUS AUTOMÁTICO */}
                <CreateTestStatusRow
                  date={date}
                  onChangeDate={setDate}
                  isAllCompleted={isAllCompleted}
                  currentCompletedCount={currentCompletedCount}
                  currentTotalCount={currentTotalCount}
                />

                {/* MENU VOLHARD OU BEHAVIOR */}
                {!isReady ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      size="large"
                      color={theme.colors.primary}
                    />
                    <Text style={styles.loadingText}>
                      Carregando itens de avaliação...
                    </Text>
                  </View>
                ) : testType === TestType.VOLHARD ? (
                  <VolhardMenuSection
                    volhardScores={volhardScores}
                    structureState={structureState}
                    structureAnsweredFields={structureAnsweredFields}
                    completedCount={volhardCompletedCount}
                    onOpenSubtest={(idx) => setActiveVolhardIndex(idx)}
                    onOpenStructure={() => setIsVolhardStructureOpen(true)}
                  />
                ) : (
                  <BehaviorMenuSection
                    search={behaviorSearch}
                    onSearchChange={setBehaviorSearch}
                    completedCount={behaviorCompletedCount}
                    filteredItems={filteredBehaviorItems}
                    getItemSelectedLabel={getBehaviorItemSelectedLabel}
                    onOpenItem={(idx) => setActiveBehaviorIndex(idx)}
                  />
                )}
              </ScrollView>

              {/* FOOTER */}
              <CreateTestFooter
                onClose={onClose}
                onSave={handleSave}
                disabled={!selectedDogId || availableDogs.length === 0}
                isAllCompleted={isAllCompleted}
                currentCompletedCount={currentCompletedCount}
                currentTotalCount={currentTotalCount}
              />
            </>
          )}
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
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "93%",
  },
  scrollContent: {
    padding: 18,
    gap: 16,
  },
  fieldSection: {
    gap: 8,
  },
  loadingContainer: {
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.medium,
  },
});
