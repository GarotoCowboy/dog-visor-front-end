import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  InteractionManager,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../theme/theme";
import { FormComponent } from "../../../shared/components/FormComponent";
import {
  CharacteristicCategory,
  CharacteristicCategoryLabel,
  DualHandler,
  ICreateCharacteristicRequest,
  ICreateStructureRequest,
  IDogTest,
  MovementGait,
  RelationshipSkill,
  ScoreComparison,
  ScoreComparisonLabel,
  StructureType,
  StructureTypeLabel,
  TestStatus,
  TestType,
  WorkSpeed,
} from "../../../types/Training";
import { formatDogRace, IDogResponse } from "../../../types/Dog";
import {
  BEHAVIOR_CHECKLIST_ITEMS,
  decodeBehaviorResultProgress,
  decodeVolhardResultProgress,
  encodeBehaviorResultWithProgress,
  encodeVolhardResultWithProgress,
  IBehaviorItemDefinition,
  StructureFieldKey,
  VOLHARD_STRUCTURE_ITEMS,
  VOLHARD_SUBTESTS,
  VOLHARD_TOTAL_ITEMS_COUNT,
  VolhardScoreFieldKey,
} from "../constants/testQuestionsData";
import { calculateVolhardInterpretation } from "../constants/volhardInterpretationData";
import { DogPickerField } from "../../../shared/components/form";
import {
  BehaviorItemScreen,
  BehaviorMenuSection,
  getDogImageSource,
  SelectedDogBanner,
  VolhardMenuSection,
  VolhardScoresState,
  VolhardStructureScreen,
  VolhardSubtestScreen,
} from "./testModal";

interface CreateTestModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (test: Omit<IDogTest, "id">, existingId?: string) => void;
  availableDogs: IDogResponse[];
  initialTestType?: TestType;
  editingTest?: IDogTest | null;
  existingTests?: IDogTest[];
}

const INITIAL_VOLHARD_SCORES: VolhardScoresState = {
  socialAttraction: null,
  following: null,
  restraint: null,
  socialDominance: null,
  elevationDominance: null,
  retrieving: null,
  touchSensitivity: null,
  soundSensitivity: null,
  stability: null,
};

const INITIAL_STRUCTURE_STATE: ICreateStructureRequest = {
  straightFront: StructureType.BOA,
  shoulderAngulation: StructureType.BOA,
  croupAngulation: StructureType.BOA,
  straightRear: StructureType.BOA,
  rearAngulation: StructureType.BOA,
  elbowAngulation: StructureType.BOA,
};

const INITIAL_STRUCTURE_ANSWERED_FIELDS: Record<StructureFieldKey, boolean> = {
  straightFront: false,
  shoulderAngulation: false,
  elbowAngulation: false,
  croupAngulation: false,
  straightRear: false,
  rearAngulation: false,
};

const toIsoDateInput = (rawDate?: string): string => {
  if (!rawDate) {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    return `${y}-${m}-${d}`;
  }
  const clean = rawDate.split("T")[0];
  if (clean.includes("/")) {
    const parts = clean.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return clean;
};

export const CreateTestModal: React.FC<CreateTestModalProps> = ({
  visible,
  onClose,
  onSave,
  availableDogs,
  initialTestType = TestType.VOLHARD,
  editingTest = null,
  existingTests = [],
}) => {
  const [selectedDogId, setSelectedDogId] = useState<string>(
    editingTest?.dogId ||
      (availableDogs.length > 0 ? availableDogs[0].ID : ""),
  );
  const [testType, setTestType] = useState<TestType>(initialTestType);
  const [date, setDate] = useState<string>(() => toIsoDateInput());
  const [description, setDescription] = useState<string>("");

  const [activeVolhardIndex, setActiveVolhardIndex] = useState<number | null>(
    null,
  );
  const [isVolhardStructureOpen, setIsVolhardStructureOpen] =
    useState<boolean>(false);
  const [activeBehaviorIndex, setActiveBehaviorIndex] = useState<number | null>(
    null,
  );

  const [volhardScores, setVolhardScores] = useState<VolhardScoresState>(
    INITIAL_VOLHARD_SCORES,
  );
  const [structureTouched, setStructureTouched] = useState<boolean>(false);
  const [structureState, setStructureState] = useState<ICreateStructureRequest>(
    INITIAL_STRUCTURE_STATE,
  );
  const [structureAnsweredFields, setStructureAnsweredFields] = useState<
    Record<StructureFieldKey, boolean>
  >(INITIAL_STRUCTURE_ANSWERED_FIELDS);

  const [behaviorCharacteristicAnswers, setBehaviorCharacteristicAnswers] =
    useState<Record<number, CharacteristicCategory>>({});
  const [dualHandler, setDualHandler] = useState<DualHandler | null>(null);
  const [relationshipSkill, setRelationshipSkill] =
    useState<RelationshipSkill | null>(null);
  const [scoreComparison, setScoreComparison] =
    useState<ScoreComparison | null>(null);
  const [workSpeed, setWorkSpeed] = useState<WorkSpeed | null>(null);
  const [movementGait, setMovementGait] = useState<MovementGait | null>(null);
  const [behaviorSearch, setBehaviorSearch] = useState<string>("");

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
    if (record.date) {
      setDate(toIsoDateInput(record.date));
    }

    if (record.type === TestType.VOLHARD) {
      const source = record.volhardDetails || record.volhardPayload;
      const decoded = decodeVolhardResultProgress(
        source?.result || record.description,
        record.answeredVolhardKeys,
      );
      const answeredSet = new Set(decoded.answeredKeys);

      const nextScores: VolhardScoresState = { ...INITIAL_VOLHARD_SCORES };
      (Object.keys(INITIAL_VOLHARD_SCORES) as VolhardScoreFieldKey[]).forEach(
        (key) => {
          if (
            answeredSet.has(key) &&
            source &&
            typeof (source as any)[key] === "number"
          ) {
            nextScores[key] = (source as any)[key];
          }
        },
      );
      setVolhardScores(nextScores);

      const hadLegacyStructure = answeredSet.has("structure");
      const nextStructureAnswered: Record<StructureFieldKey, boolean> = {
        straightFront: hadLegacyStructure || answeredSet.has("straightFront"),
        shoulderAngulation:
          hadLegacyStructure || answeredSet.has("shoulderAngulation"),
        elbowAngulation:
          hadLegacyStructure || answeredSet.has("elbowAngulation"),
        croupAngulation:
          hadLegacyStructure || answeredSet.has("croupAngulation"),
        straightRear: hadLegacyStructure || answeredSet.has("straightRear"),
        rearAngulation: hadLegacyStructure || answeredSet.has("rearAngulation"),
      };
      setStructureAnsweredFields(nextStructureAnswered);
      const isAnyStructureTouched =
        Object.values(nextStructureAnswered).some(Boolean);
      setStructureTouched(isAnyStructureTouched);

      if (source?.structure) {
        setStructureState({
          straightFront:
            source.structure.straightFront || StructureType.BOA,
          shoulderAngulation:
            source.structure.shoulderAngulation || StructureType.BOA,
          croupAngulation:
            source.structure.croupAngulation || StructureType.BOA,
          straightRear:
            source.structure.straightRear || StructureType.BOA,
          rearAngulation:
            source.structure.rearAngulation || StructureType.BOA,
          elbowAngulation:
            source.structure.elbowAngulation || StructureType.BOA,
        });
      } else {
        setStructureState(INITIAL_STRUCTURE_STATE);
      }

      const isDefaultDesc =
        decoded.cleanDescription.startsWith("Em andamento (") ||
        decoded.cleanDescription.startsWith("Média Volhard:") ||
        decoded.cleanDescription === "Teste Volhard concluído." ||
        decoded.cleanDescription === "Teste de Aptidão Volhard concluído.";
      setDescription(isDefaultDesc ? "" : decoded.cleanDescription);
    } else {
      const source = record.behaviorDetails || record.behaviorPayload;
      const decoded = decodeBehaviorResultProgress(
        source?.result || record.description,
        source?.characteristics,
        record.answeredBehaviorNumbers,
      );
      const answeredSet = new Set(decoded.answeredNumbers);

      const nextChars: Record<number, CharacteristicCategory> = {};
      (source?.characteristics || []).forEach((c) => {
        const prefix = c.name?.split(".")[0]?.trim();
        const num = Number(prefix);
        if (
          Number.isFinite(num) &&
          num >= 1 &&
          num <= 51 &&
          c.category &&
          answeredSet.has(num)
        ) {
          nextChars[num] = c.category;
        }
      });
      setBehaviorCharacteristicAnswers(nextChars);

      const hasDual = answeredSet.has(44);
      const hasRel = answeredSet.has(45);
      const hasScoreComp = answeredSet.has(46);
      const hasSpeed = answeredSet.has(47);
      const hasGait = answeredSet.has(48);

      setDualHandler(hasDual && source?.dualHandler ? source.dualHandler : null);
      setRelationshipSkill(
        hasRel && source?.relationshipSkill ? source.relationshipSkill : null,
      );
      setScoreComparison(
        hasScoreComp && source?.scoreComparison
          ? source.scoreComparison
          : null,
      );
      setWorkSpeed(hasSpeed && source?.workSpeed ? source.workSpeed : null);
      setMovementGait(
        hasGait && source?.movementGait ? source.movementGait : null,
      );

      const isDefaultDesc =
        decoded.cleanDescription.startsWith("Em andamento (") ||
        decoded.cleanDescription.startsWith("Comparativo:") ||
        decoded.cleanDescription === "Teste Behavior concluído." ||
        decoded.cleanDescription === "Avaliação comportamental concluída." ||
        decoded.cleanDescription === "Avaliação comportamental" ||
        decoded.cleanDescription === "Teste Behavior";
      setDescription(isDefaultDesc ? "" : decoded.cleanDescription);
    }
  };

  const activeExistingTest = useMemo(() => {
    if (
      editingTest &&
      String(editingTest.dogId).toLowerCase() ===
        String(selectedDogId).toLowerCase() &&
      editingTest.type === testType
    ) {
      return editingTest;
    }
    return (
      existingTests.find(
        (t) =>
          String(t.dogId).toLowerCase() ===
            String(selectedDogId).toLowerCase() &&
          t.type === testType &&
          t.status === TestStatus.PENDING,
      ) || null
    );
  }, [editingTest, existingTests, selectedDogId, testType]);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (visible) {
      const task = InteractionManager.runAfterInteractions(() => {
        setIsReady(true);
      });
      return () => task.cancel();
    } else {
      setIsReady(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    setActiveVolhardIndex(null);
    setActiveBehaviorIndex(null);

    if (editingTest) {
      setSelectedDogId(editingTest.dogId);
      setTestType(editingTest.type);
      loadFromTestRecord(editingTest);
    } else {
      const targetDogId =
        selectedDogId || (availableDogs.length > 0 ? availableDogs[0].ID : "");
      const targetType = initialTestType || testType;

      if (!selectedDogId && targetDogId) {
        setSelectedDogId(targetDogId);
      }
      setTestType(targetType);

      const pendingForDog = existingTests.find(
        (t) =>
          String(t.dogId).toLowerCase() ===
            String(targetDogId).toLowerCase() &&
          t.type === targetType &&
          t.status === TestStatus.PENDING,
      );
      if (pendingForDog) {
        loadFromTestRecord(pendingForDog);
      } else {
        resetForm();
      }
    }
  }, [visible, editingTest, initialTestType]);

  const handleSelectDog = (dog: IDogResponse) => {
    const newDogId = dog.ID;
    setSelectedDogId(newDogId);

    if (
      editingTest &&
      String(editingTest.dogId).toLowerCase() ===
        String(newDogId).toLowerCase() &&
      editingTest.type === testType
    ) {
      loadFromTestRecord(editingTest);
      return;
    }

    const pendingForDog = existingTests.find(
      (t) =>
        String(t.dogId).toLowerCase() === String(newDogId).toLowerCase() &&
        t.type === testType &&
        t.status === TestStatus.PENDING,
    );
    if (pendingForDog) {
      loadFromTestRecord(pendingForDog);
    } else {
      resetForm();
    }
  };

  const handleSelectTestType = (newType: TestType) => {
    if (newType === testType) return;
    setTestType(newType);

    if (
      editingTest &&
      String(editingTest.dogId).toLowerCase() ===
        String(selectedDogId).toLowerCase() &&
      editingTest.type === newType
    ) {
      loadFromTestRecord(editingTest);
      return;
    }

    const pendingForDog = existingTests.find(
      (t) =>
        String(t.dogId).toLowerCase() ===
          String(selectedDogId).toLowerCase() &&
        t.type === newType &&
        t.status === TestStatus.PENDING,
    );
    if (pendingForDog) {
      loadFromTestRecord(pendingForDog);
    } else {
      resetForm();
    }
  };

  const volhardCompletedCount = useMemo(() => {
    const scoreCount = Object.values(volhardScores).filter(
      (v) => v !== null,
    ).length;
    const structureCount = Object.values(structureAnsweredFields).filter(
      Boolean,
    ).length;
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
    testType === TestType.VOLHARD
      ? volhardCompletedCount
      : behaviorCompletedCount;
  const currentTotalCount =
    testType === TestType.VOLHARD
      ? VOLHARD_TOTAL_ITEMS_COUNT
      : BEHAVIOR_CHECKLIST_ITEMS.length;
  const isAllCompleted = currentCompletedCount >= currentTotalCount;
  const status = isAllCompleted ? TestStatus.COMPLETED : TestStatus.PENDING;

  const getBehaviorItemSelectedLabel = (
    item: IBehaviorItemDefinition,
  ): string | null => {
    if (item.kind === "CHARACTERISTIC") {
      const val = behaviorCharacteristicAnswers[item.number];
      return val ? CharacteristicCategoryLabel[val] : null;
    }
    if (item.specialKey === "dualHandler" && dualHandler) {
      return (
        item.options.find((o) => o.value === dualHandler)?.label || dualHandler
      );
    }
    if (item.specialKey === "relationshipSkill" && relationshipSkill) {
      return (
        item.options.find((o) => o.value === relationshipSkill)?.label ||
        relationshipSkill
      );
    }
    if (item.specialKey === "scoreComparison" && scoreComparison) {
      return (
        item.options.find((o) => o.value === scoreComparison)?.label ||
        scoreComparison
      );
    }
    if (item.specialKey === "workSpeed" && workSpeed) {
      return (
        item.options.find((o) => o.value === workSpeed)?.label || workSpeed
      );
    }
    if (item.specialKey === "movementGait" && movementGait) {
      return (
        item.options.find((o) => o.value === movementGait)?.label ||
        movementGait
      );
    }
    return null;
  };

  const getBehaviorItemSelectedValue = (
    item: IBehaviorItemDefinition,
  ): string | null => {
    if (item.kind === "CHARACTERISTIC") {
      return behaviorCharacteristicAnswers[item.number] || null;
    }
    if (item.specialKey === "dualHandler") return dualHandler;
    if (item.specialKey === "relationshipSkill") return relationshipSkill;
    if (item.specialKey === "scoreComparison") return scoreComparison;
    if (item.specialKey === "workSpeed") return workSpeed;
    if (item.specialKey === "movementGait") return movementGait;
    return null;
  };

  const handleSelectBehaviorOption = (
    item: IBehaviorItemDefinition,
    value: string | number,
  ) => {
    const strVal = String(value);
    if (item.kind === "CHARACTERISTIC") {
      setBehaviorCharacteristicAnswers((prev) => ({
        ...prev,
        [item.number]: strVal as CharacteristicCategory,
      }));
      return;
    }
    if (item.specialKey === "dualHandler") {
      setDualHandler(strVal as DualHandler);
    } else if (item.specialKey === "relationshipSkill") {
      setRelationshipSkill(strVal as RelationshipSkill);
    } else if (item.specialKey === "scoreComparison") {
      setScoreComparison(strVal as ScoreComparison);
    } else if (item.specialKey === "workSpeed") {
      setWorkSpeed(strVal as WorkSpeed);
    } else if (item.specialKey === "movementGait") {
      setMovementGait(strVal as MovementGait);
    }
  };

  const handleFillUnansweredBehaviorAsAbsent = () => {
    const nextMap = { ...behaviorCharacteristicAnswers };
    BEHAVIOR_CHECKLIST_ITEMS.forEach((item) => {
      if (item.kind === "CHARACTERISTIC" && !nextMap[item.number]) {
        nextMap[item.number] = CharacteristicCategory.AUSENTE;
      }
    });
    setBehaviorCharacteristicAnswers(nextMap);
    if (!dualHandler) setDualHandler(DualHandler.TRABALHA_BEM);
    if (!relationshipSkill)
      setRelationshipSkill(RelationshipSkill.MUITO_HABIL);
    if (!scoreComparison) setScoreComparison(ScoreComparison.CAO_FLEXIVEL);
    if (!workSpeed) setWorkSpeed(WorkSpeed.MODERADO);
    if (!movementGait) setMovementGait(MovementGait.MANTEM_TROTE);
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

  const handleSetSingleStructureField = (
    key: StructureFieldKey,
    val: StructureType,
  ) => {
    setStructureTouched(true);
    setStructureState((prev) => ({
      ...prev,
      [key]: val,
    }));
    setStructureAnsweredFields((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const handleSave = () => {
    const dog = availableDogs.find((d) => d.ID === selectedDogId);
    if (!dog) return;

    const dogId = dog.ID;
    const dogName = dog.name;
    const dogBreed = formatDogRace(dog.race);
    const avatarKey = dog?.avatarKey;

    const isoDate = (() => {
      if (date.includes("/")) {
        const parts = date.split("/");
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
      }
      return date;
    })();

    const displayDate = isoDate.includes("-")
      ? isoDate.split("-").reverse().join("/")
      : date;

    const answeredVolhardKeys: string[] = [];
    (Object.keys(volhardScores) as VolhardScoreFieldKey[]).forEach((k) => {
      if (volhardScores[k] !== null) {
        answeredVolhardKeys.push(k);
      }
    });
    (Object.keys(structureAnsweredFields) as StructureFieldKey[]).forEach(
      (k) => {
        if (structureAnsweredFields[k]) {
          answeredVolhardKeys.push(k);
        }
      },
    );

    const finalSocialAttraction = volhardScores.socialAttraction ?? 3;
    const finalFollowing = volhardScores.following ?? 3;
    const finalRestraint = volhardScores.restraint ?? 3;
    const finalSocialDominance = volhardScores.socialDominance ?? 3;
    const finalElevationDominance = volhardScores.elevationDominance ?? 3;
    const finalRetrieving = volhardScores.retrieving ?? 3;
    const finalTouchSensitivity = volhardScores.touchSensitivity ?? 3;
    const finalSoundSensitivity = volhardScores.soundSensitivity ?? 3;
    const finalStability = volhardScores.stability ?? 3;

    const answeredVolhardNumericValues = Object.values(volhardScores).filter(
      (v): v is number => v !== null,
    );
    const avgVolhard =
      answeredVolhardNumericValues.length > 0
        ? (
            answeredVolhardNumericValues.reduce((acc, v) => acc + v, 0) /
            answeredVolhardNumericValues.length
          ).toFixed(1)
        : "0.0";

    const characteristicsPayload: ICreateCharacteristicRequest[] =
      BEHAVIOR_CHECKLIST_ITEMS.filter(
        (item) =>
          item.kind === "CHARACTERISTIC" &&
          Boolean(behaviorCharacteristicAnswers[item.number]),
      ).map((item) => ({
        name: `${item.number}. ${item.title}`,
        description: item.description,
        category: behaviorCharacteristicAnswers[item.number],
      }));

    const answeredBehaviorNumbers: number[] = [
      ...Object.keys(behaviorCharacteristicAnswers).map(Number),
    ];
    if (dualHandler) answeredBehaviorNumbers.push(44);
    if (relationshipSkill) answeredBehaviorNumbers.push(45);
    if (scoreComparison) answeredBehaviorNumbers.push(46);
    if (workSpeed) answeredBehaviorNumbers.push(47);
    if (movementGait) answeredBehaviorNumbers.push(48);

    const finalScoreComparison =
      scoreComparison || ScoreComparison.CAO_FLEXIVEL;

    const volhardEncodedResult = encodeVolhardResultWithProgress(
      description.trim(),
      answeredVolhardKeys,
      avgVolhard,
      finalStability,
    );

    const behaviorEncodedResult = encodeBehaviorResultWithProgress(
      description.trim(),
      answeredBehaviorNumbers,
      ScoreComparisonLabel[finalScoreComparison],
    );

    const volhardDiag = calculateVolhardInterpretation(volhardScores);
    const volhardProfileSummary = volhardDiag.majorityInfo
      ? ` | ${volhardDiag.majorityInfo.title} (${volhardDiag.majorityInfo.profile})`
      : "";

    const cleanSummaryDescription =
      description.trim() ||
      (isAllCompleted
        ? testType === TestType.VOLHARD
          ? `Média Volhard: ${avgVolhard}${volhardProfileSummary}`
          : `Comparativo: ${ScoreComparisonLabel[finalScoreComparison]}`
        : testType === TestType.VOLHARD
        ? `Em andamento (${volhardCompletedCount}/${VOLHARD_TOTAL_ITEMS_COUNT} etapas realizadas)`
        : `Em andamento (${behaviorCompletedCount}/${BEHAVIOR_CHECKLIST_ITEMS.length} aspectos avaliados)`);

    const scoreSummary = isAllCompleted
      ? testType === TestType.VOLHARD
        ? `Média: ${avgVolhard} | ${
            volhardDiag.majorityInfo
              ? volhardDiag.majorityInfo.title
              : `Estab.: ${finalStability}/5`
          }`
        : ScoreComparisonLabel[finalScoreComparison]
      : testType === TestType.VOLHARD
      ? `Em andamento: ${volhardCompletedCount}/${VOLHARD_TOTAL_ITEMS_COUNT} etapas`
      : `Em andamento: ${behaviorCompletedCount}/${BEHAVIOR_CHECKLIST_ITEMS.length} aspectos`;

    const newTest: Omit<IDogTest, "id"> = {
      dogId,
      dogsName: dogName,
      dogsBreed: dogBreed,
      avatarKey,
      type: testType,
      title:
        testType === TestType.VOLHARD
          ? "Teste Volhard"
          : "Teste Behavior",
      date: displayDate,
      description: cleanSummaryDescription,
      score: scoreSummary,
      status,
      completedCount: currentCompletedCount,
      totalCount: currentTotalCount,
      answeredVolhardKeys:
        testType === TestType.VOLHARD ? answeredVolhardKeys : undefined,
      answeredBehaviorNumbers:
        testType === TestType.BEHAVIOR ? answeredBehaviorNumbers : undefined,
      isSynced: false,
      volhardPayload:
        testType === TestType.VOLHARD
          ? {
              trainerId: "",
              dogId,
              testType: "VOLHARD",
              date: isoDate,
              result: volhardEncodedResult,
              socialAttraction: finalSocialAttraction,
              following: finalFollowing,
              restraint: finalRestraint,
              socialDominance: finalSocialDominance,
              elevationDominance: finalElevationDominance,
              retrieving: finalRetrieving,
              touchSensitivity: finalTouchSensitivity,
              soundSensitivity: finalSoundSensitivity,
              stability: finalStability,
              structure: structureState,
            }
          : undefined,
      behaviorPayload:
        testType === TestType.BEHAVIOR
          ? {
              trainerId: "",
              dogId,
              testType: "BEHAVIOR",
              date: isoDate,
              result: behaviorEncodedResult,
              dualHandler: dualHandler || DualHandler.TRABALHA_BEM,
              relationshipSkill:
                relationshipSkill || RelationshipSkill.MUITO_HABIL,
              scoreComparison: finalScoreComparison,
              workSpeed: workSpeed || WorkSpeed.MODERADO,
              movementGait: movementGait || MovementGait.MANTEM_TROTE,
              characteristics: characteristicsPayload,
            }
          : undefined,
    };

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
              onSelectScore={(k, score) =>
                setVolhardScores((prev) => ({ ...prev, [k]: score }))
              }
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
              {/* HEADER DO MENU PRINCIPAL */}
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle}>
                    {testType === TestType.VOLHARD
                      ? "Teste Volhard"
                      : "Teste Behavior"}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    Selecione cada teste no menu abaixo para registrar a pontuação
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialDesignIcons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* SELEÇÃO DO CÃO */}
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
                    required
                  />
                </View>

                {/* TIPO DE TESTE */}
                <View style={styles.fieldSection}>
                  <Text style={styles.fieldLabel}>Modalidade de Avaliação</Text>
                  <View style={styles.rowChoices}>
                    <TouchableOpacity
                      style={[
                        styles.choiceButton,
                        testType === TestType.VOLHARD &&
                          styles.choiceButtonActive,
                      ]}
                      onPress={() => handleSelectTestType(TestType.VOLHARD)}
                    >
                      <MaterialDesignIcons
                        name="clipboard-check-outline"
                        size={20}
                        color={
                          testType === TestType.VOLHARD
                            ? theme.colors.white
                            : theme.colors.primary
                        }
                      />
                      <Text
                        style={[
                          styles.choiceButtonText,
                          testType === TestType.VOLHARD &&
                            styles.choiceButtonTextActive,
                        ]}
                      >
                        Teste Volhard
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.choiceButton,
                        testType === TestType.BEHAVIOR &&
                          styles.choiceButtonActive,
                      ]}
                      onPress={() => handleSelectTestType(TestType.BEHAVIOR)}
                    >
                      <MaterialDesignIcons
                        name="paw"
                        size={20}
                        color={
                          testType === TestType.BEHAVIOR
                            ? theme.colors.white
                            : theme.colors.primary
                        }
                      />
                      <Text
                        style={[
                          styles.choiceButtonText,
                          testType === TestType.BEHAVIOR &&
                            styles.choiceButtonTextActive,
                        ]}
                      >
                        Teste Behavior
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* DATA E STATUS AUTOMÁTICO */}
                <View style={styles.rowTwoCols}>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={styles.fieldLabel}>Data do Teste</Text>
                    <FormComponent
                      variant="date"
                      dateTimeMode="date"
                      placeholder="AAAA-MM-DD"
                      value={date}
                      onChangeText={setDate}
                    />
                  </View>

                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={styles.fieldLabel}>Status (Automático)</Text>
                    <View
                      style={[
                        styles.statusChoiceButton,
                        isAllCompleted
                          ? styles.statusChoiceCompletedActive
                          : styles.statusChoicePendingActive,
                        {
                          flexDirection: "row",
                          gap: 6,
                          paddingVertical: 11,
                        },
                      ]}
                    >
                      <MaterialDesignIcons
                        name={
                          isAllCompleted
                            ? "check-circle-outline"
                            : "clock-outline"
                        }
                        size={16}
                        color={isAllCompleted ? "#15803D" : "#B45309"}
                      />
                      <Text
                        style={[
                          styles.statusChoiceText,
                          isAllCompleted
                            ? styles.statusChoiceTextCompleted
                            : styles.statusChoiceTextPending,
                        ]}
                      >
                        {isAllCompleted
                          ? `Concluído (${currentCompletedCount}/${currentTotalCount})`
                          : `Pendente (${currentCompletedCount}/${currentTotalCount})`}
                      </Text>
                    </View>
                  </View>
                </View>

                {!isAllCompleted && (
                  <View style={styles.infoBox}>
                    <View style={styles.infoBoxHeader}>
                      <MaterialDesignIcons
                        name="clock-check-outline"
                        size={16}
                        color="#B45309"
                      />
                      <Text style={[styles.infoBoxTitle, { color: "#B45309" }]}>
                        {activeExistingTest
                          ? "Continuando avaliação em andamento"
                          : "Avaliação realizada em etapas"}
                      </Text>
                    </View>
                    <Text style={styles.infoBoxBody}>
                      Você pode salvar os testes realizados hoje e continuar os
                      demais em outro dia. O teste ficará como{" "}
                      <Text style={{ fontWeight: "700" }}>Pendente</Text> até
                      que todos os {currentTotalCount} itens sejam preenchidos.
                    </Text>
                  </View>
                )}

                {/* MENU VOLHARD OU BEHAVIOR */}
                {!isReady ? (
                  <View
                    style={{
                      paddingVertical: 36,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActivityIndicator
                      size="large"
                      color={theme.colors.primary}
                    />
                    <Text
                      style={{
                        marginTop: 10,
                        color: "#6B7280",
                        fontSize: 13,
                        fontFamily: theme.typography.fontFamily.medium,
                      }}
                    >
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
                    onQuickFillUnanswered={handleFillUnansweredBehaviorAsAbsent}
                    onOpenItem={(idx) => setActiveBehaviorIndex(idx)}
                  />
                )}
              </ScrollView>

              {/* FOOTER DO MODAL */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Fechar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!selectedDogId || availableDogs.length === 0) && {
                      opacity: 0.5,
                    },
                  ]}
                  onPress={handleSave}
                  disabled={!selectedDogId || availableDogs.length === 0}
                  activeOpacity={0.8}
                >
                  <MaterialDesignIcons
                    name={isAllCompleted ? "check" : "content-save-outline"}
                    size={18}
                    color={theme.colors.white}
                  />
                  <Text style={styles.saveButtonText}>
                    {isAllCompleted
                      ? `Concluir Teste (${currentCompletedCount}/${currentTotalCount})`
                      : `Salvar Progresso (${currentCompletedCount}/${currentTotalCount})`}
                  </Text>
                </TouchableOpacity>
              </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
  },
  scrollContent: {
    padding: 18,
    gap: 16,
  },
  fieldSection: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  dogChipContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  dogChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dogChipSelected: {
    backgroundColor: "#2E6B65",
    borderColor: "#2E6B65",
  },
  dogChipAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  dogChipAvatarSelected: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  dogChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  dogChipTextSelected: {
    color: "#FFFFFF",
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  rowChoices: {
    flexDirection: "row",
    gap: 10,
  },
  choiceButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: "#FFFFFF",
  },
  choiceButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  choiceButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
  choiceButtonTextActive: {
    color: theme.colors.white,
  },
  rowTwoCols: {
    flexDirection: "row",
    gap: 12,
  },
  statusChoiceButton: {
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  statusChoicePendingActive: {
    borderColor: "#F59E0B",
    backgroundColor: "#FEF3C7",
  },
  statusChoiceCompletedActive: {
    borderColor: "#10B981",
    backgroundColor: "#D1FAE5",
  },
  statusChoiceText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
  },
  statusChoiceTextPending: {
    color: "#B45309",
  },
  statusChoiceTextCompleted: {
    color: "#15803D",
  },
  infoBox: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  infoBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoBoxTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    textTransform: "uppercase",
  },
  infoBoxBody: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: "#374151",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
    color: "#4B5563",
  },
  saveButton: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#2E6B65",
  },
  saveButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
  emptyDogsText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    paddingVertical: 6,
  },
});
