import { useEffect, useMemo, useState } from "react";
import { InteractionManager } from "react-native";
import {
  CharacteristicCategory,
  DualHandler,
  ICreateStructureRequest,
  IDogTest,
  MovementGait,
  RelationshipSkill,
  ScoreComparison,
  StructureType,
  TestStatus,
  TestType,
  WorkSpeed,
} from "../../../../../types/Training";
import { IDogResponse } from "../../../../../types/Dog";
import {
  BEHAVIOR_CHECKLIST_ITEMS,
  IBehaviorItemDefinition,
  StructureFieldKey,
  VOLHARD_TOTAL_ITEMS_COUNT,
  VolhardScoreFieldKey,
} from "../../../constants/testQuestionsData";
import { VolhardScoresState } from "../VolhardSubtestScreen";
import {
  INITIAL_STRUCTURE_ANSWERED_FIELDS,
  INITIAL_STRUCTURE_STATE,
  INITIAL_VOLHARD_SCORES,
  parseBehaviorRecord,
  parseVolhardRecord,
  resolveBehaviorItemLabel,
  resolveBehaviorItemValue,
  toIsoDateInput,
} from "../../../utils/testStateLoader";
import { buildDogTestSavePayload } from "../../../utils/testPayloadBuilder";

interface UseCreateTestFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (test: Omit<IDogTest, "id">, existingId?: string) => void;
  availableDogs: IDogResponse[];
  initialTestType?: TestType;
  editingTest?: IDogTest | null;
  existingTests?: IDogTest[];
}

export const useCreateTestForm = ({
  visible,
  onClose,
  onSave,
  availableDogs,
  initialTestType = TestType.VOLHARD,
  editingTest = null,
  existingTests = [],
}: UseCreateTestFormProps) => {
  const [selectedDogId, setSelectedDogId] = useState<string>(
    editingTest?.dogId ||
      (availableDogs.length > 0 ? availableDogs[0].ID : ""),
  );
  const [testType, setTestType] = useState<TestType>(initialTestType);
  const [date, setDate] = useState<string>(() => toIsoDateInput());
  const [description, setDescription] = useState<string>("");

  const [activeVolhardIndex, setActiveVolhardIndex] = useState<number | null>(null);
  const [isVolhardStructureOpen, setIsVolhardStructureOpen] = useState(false);
  const [activeBehaviorIndex, setActiveBehaviorIndex] = useState<number | null>(null);

  const [volhardScores, setVolhardScores] = useState<VolhardScoresState>(INITIAL_VOLHARD_SCORES);
  const [structureTouched, setStructureTouched] = useState(false);
  const [structureState, setStructureState] = useState<ICreateStructureRequest>(INITIAL_STRUCTURE_STATE);
  const [structureAnsweredFields, setStructureAnsweredFields] = useState(INITIAL_STRUCTURE_ANSWERED_FIELDS);

  const [behaviorCharacteristicAnswers, setBehaviorCharacteristicAnswers] = useState<Record<number, CharacteristicCategory>>({});
  const [dualHandler, setDualHandler] = useState<DualHandler | null>(null);
  const [relationshipSkill, setRelationshipSkill] = useState<RelationshipSkill | null>(null);
  const [scoreComparison, setScoreComparison] = useState<ScoreComparison | null>(null);
  const [workSpeed, setWorkSpeed] = useState<WorkSpeed | null>(null);
  const [movementGait, setMovementGait] = useState<MovementGait | null>(null);
  const [behaviorSearch, setBehaviorSearch] = useState("");
  const [isReady, setIsReady] = useState(false);

  const resetForm = () => {
    setVolhardScores(INITIAL_VOLHARD_SCORES);
    setStructureState(INITIAL_STRUCTURE_STATE);
    setStructureAnsweredFields(INITIAL_STRUCTURE_ANSWERED_FIELDS);
    setStructureTouched(false);
    setIsVolhardStructureOpen(false);
    setBehaviorCharacteristicAnswers({});
    setDualHandler(null);
    setRelationshipSkill(null);
    setScoreComparison(null);
    setWorkSpeed(null);
    setMovementGait(null);
    setDescription("");
    setBehaviorSearch("");
    setActiveVolhardIndex(null);
    setActiveBehaviorIndex(null);
  };

  const loadFromTestRecord = (record: IDogTest) => {
    if (record.type === TestType.VOLHARD) {
      const parsed = parseVolhardRecord(record);
      setVolhardScores(parsed.volhardScores);
      setStructureState(parsed.structureState);
      setStructureAnsweredFields(parsed.structureAnsweredFields);
      setStructureTouched(parsed.structureTouched);
      setDescription(parsed.description);
      if (parsed.date) setDate(parsed.date);
    } else {
      const parsed = parseBehaviorRecord(record);
      setBehaviorCharacteristicAnswers(parsed.behaviorCharacteristicAnswers);
      setDualHandler(parsed.dualHandler);
      setRelationshipSkill(parsed.relationshipSkill);
      setScoreComparison(parsed.scoreComparison);
      setWorkSpeed(parsed.workSpeed);
      setMovementGait(parsed.movementGait);
      setDescription(parsed.description);
      if (parsed.date) setDate(parsed.date);
    }
  };

  const findExistingForDogAndType = (targetDogId: string, targetType: TestType): IDogTest | null => {
    if (
      editingTest &&
      String(editingTest.dogId).toLowerCase() === String(targetDogId).toLowerCase() &&
      editingTest.type === targetType
    ) {
      return editingTest;
    }
    const matches = existingTests.filter(
      (t) =>
        String(t.dogId).toLowerCase() === String(targetDogId).toLowerCase() &&
        t.type === targetType,
    );
    if (matches.length === 0) return null;
    return (
      matches.find((t) => t.status === TestStatus.COMPLETED) ||
      matches.find((t) => (t.completedCount ?? 0) > 0) ||
      matches[0]
    );
  };

  const activeExistingTest = useMemo(
    () => findExistingForDogAndType(selectedDogId, testType),
    [editingTest, existingTests, selectedDogId, testType],
  );

  useEffect(() => {
    if (visible) {
      const task = InteractionManager.runAfterInteractions(() => setIsReady(true));
      return () => task.cancel();
    }
    setIsReady(false);
  }, [visible]);

  const getDogTestBadge = (dog: IDogResponse) => {
    const existing = findExistingForDogAndType(dog.ID, testType);
    const total =
      testType === TestType.VOLHARD
        ? VOLHARD_TOTAL_ITEMS_COUNT
        : BEHAVIOR_CHECKLIST_ITEMS.length;
    const typeName = testType === TestType.VOLHARD ? "Volhard" : "Behavior";

    if (!existing) {
      return { status: "NOT_STARTED" as const, label: `Sem Teste ${typeName}` };
    }
    if (existing.status === TestStatus.COMPLETED) {
      return { status: "COMPLETED" as const, label: `Já realizou ${typeName}` };
    }
    const done = existing.completedCount ?? 0;
    return {
      status: "IN_PROGRESS" as const,
      label: `Em andamento (${done}/${existing.totalCount || total})`,
    };
  };

  useEffect(() => {
    if (!visible) return;
    setActiveVolhardIndex(null);
    setActiveBehaviorIndex(null);

    if (editingTest) {
      setSelectedDogId(editingTest.dogId);
      setTestType(editingTest.type);
      loadFromTestRecord(editingTest);
    } else {
      const targetType = initialTestType || testType;
      setTestType(targetType);

      const dogWithoutTest = availableDogs.find(
        (d) => !findExistingForDogAndType(d.ID, targetType),
      );
      const dogInProgress = availableDogs.find((d) => {
        const ex = findExistingForDogAndType(d.ID, targetType);
        return ex && ex.status !== TestStatus.COMPLETED;
      });
      const fallbackDogId =
        dogWithoutTest?.ID ||
        dogInProgress?.ID ||
        selectedDogId ||
        (availableDogs.length > 0 ? availableDogs[0].ID : "");

      setSelectedDogId(fallbackDogId);
      const existingForDog = findExistingForDogAndType(fallbackDogId, targetType);
      if (existingForDog) {
        loadFromTestRecord(existingForDog);
      } else {
        resetForm();
      }
    }
  }, [visible, editingTest, initialTestType]);

  const handleSelectDog = (dog: IDogResponse) => {
    setSelectedDogId(dog.ID);
    const existingForDog = findExistingForDogAndType(dog.ID, testType);
    if (existingForDog) {
      loadFromTestRecord(existingForDog);
    } else {
      resetForm();
    }
  };

  const handleSelectTestType = (newType: TestType) => {
    if (newType === testType) return;
    setTestType(newType);
    const existingForDog = findExistingForDogAndType(selectedDogId, newType);
    if (existingForDog) {
      loadFromTestRecord(existingForDog);
    } else {
      resetForm();
    }
  };

  const volhardCompletedCount = useMemo(() => {
    const scoreCount = Object.values(volhardScores).filter((v) => v !== null).length;
    const structureCount = Object.values(structureAnsweredFields).filter(Boolean).length;
    return scoreCount + structureCount;
  }, [volhardScores, structureAnsweredFields]);

  const behaviorCompletedCount = useMemo(() => {
    const charCount = Object.keys(behaviorCharacteristicAnswers).length;
    const specialCount = [
      dualHandler,
      relationshipSkill,
      scoreComparison,
      workSpeed,
      movementGait,
    ].filter((v) => v !== null).length;
    return charCount + specialCount;
  }, [
    behaviorCharacteristicAnswers,
    dualHandler,
    relationshipSkill,
    scoreComparison,
    workSpeed,
    movementGait,
  ]);

  const currentCompletedCount =
    testType === TestType.VOLHARD ? volhardCompletedCount : behaviorCompletedCount;
  const currentTotalCount =
    testType === TestType.VOLHARD ? VOLHARD_TOTAL_ITEMS_COUNT : BEHAVIOR_CHECKLIST_ITEMS.length;
  const isAllCompleted = currentCompletedCount >= currentTotalCount;

  const behaviorValues = {
    characteristicAnswers: behaviorCharacteristicAnswers,
    dualHandler,
    relationshipSkill,
    scoreComparison,
    workSpeed,
    movementGait,
  };

  const getBehaviorItemSelectedLabel = (item: IBehaviorItemDefinition): string | null =>
    resolveBehaviorItemLabel(item, behaviorValues);

  const getBehaviorItemSelectedValue = (item: IBehaviorItemDefinition): string | null =>
    resolveBehaviorItemValue(item, behaviorValues);

  const handleSelectBehaviorOption = (item: IBehaviorItemDefinition, value: string | number) => {
    const strVal = String(value);
    if (item.kind === "CHARACTERISTIC") {
      setBehaviorCharacteristicAnswers((prev) => ({
        ...prev,
        [item.number]: strVal as CharacteristicCategory,
      }));
      return;
    }
    if (item.specialKey === "dualHandler") setDualHandler(strVal as DualHandler);
    else if (item.specialKey === "relationshipSkill") setRelationshipSkill(strVal as RelationshipSkill);
    else if (item.specialKey === "scoreComparison") setScoreComparison(strVal as ScoreComparison);
    else if (item.specialKey === "workSpeed") setWorkSpeed(strVal as WorkSpeed);
    else if (item.specialKey === "movementGait") setMovementGait(strVal as MovementGait);
  };

  const handleSetAllStructure = (val: StructureType) => {
    setStructureTouched(true);
    setStructureState({
      straightFront: val,
      shoulderAngulation: val,
      croupAngulation: val,
      straightRear: val,
      rearAngulation: val,
      elbowAngulation: val,
    });
    setStructureAnsweredFields({
      straightFront: true,
      shoulderAngulation: true,
      elbowAngulation: true,
      croupAngulation: true,
      straightRear: true,
      rearAngulation: true,
    });
  };

  const handleSetSingleStructureField = (key: StructureFieldKey, val: StructureType) => {
    setStructureTouched(true);
    setStructureState((prev) => ({ ...prev, [key]: val }));
    setStructureAnsweredFields((prev) => ({ ...prev, [key]: true }));
  };

  const handleSelectVolhardScore = (k: VolhardScoreFieldKey, score: number) => {
    setVolhardScores((prev) => ({ ...prev, [k]: score }));
  };

  const handleSave = () => {
    const dog = availableDogs.find((d) => d.ID === selectedDogId);
    if (!dog) return;

    const newTest = buildDogTestSavePayload({
      dog,
      testType,
      date,
      description,
      volhardScores,
      structureState,
      structureAnsweredFields,
      volhardCompletedCount,
      behaviorCharacteristicAnswers,
      dualHandler,
      relationshipSkill,
      scoreComparison,
      workSpeed,
      movementGait,
      behaviorCompletedCount,
      currentCompletedCount,
      currentTotalCount,
      isAllCompleted,
      activeExistingTest,
    });

    onSave(newTest, activeExistingTest?.id);
    resetForm();
    onClose();
  };

  const selectedDog = useMemo(
    () => availableDogs.find((d) => d.ID === selectedDogId) || null,
    [availableDogs, selectedDogId],
  );

  const filteredBehaviorItems = useMemo(() => {
    const q = behaviorSearch.trim().toLowerCase();
    if (!q) return BEHAVIOR_CHECKLIST_ITEMS;
    return BEHAVIOR_CHECKLIST_ITEMS.filter(
      (item) =>
        `${item.number}`.includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    );
  }, [behaviorSearch]);

  return {
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
  };
};
