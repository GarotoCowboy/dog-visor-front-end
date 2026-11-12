import {
  CharacteristicCategory,
  DualHandler,
  ICreateCharacteristicRequest,
  ICreateStructureRequest,
  IDogTest,
  MovementGait,
  RelationshipSkill,
  ScoreComparison,
  ScoreComparisonLabel,
  StructureType,
  TestStatus,
  TestType,
  WorkSpeed,
} from "../../../types/Training";
import { formatDogRace, IDogResponse } from "../../../types/Dog";
import {
  BEHAVIOR_CHECKLIST_ITEMS,
  encodeBehaviorResultWithProgress,
  encodeVolhardResultWithProgress,
  StructureFieldKey,
  VOLHARD_TOTAL_ITEMS_COUNT,
  VolhardScoreFieldKey,
} from "../constants/testQuestionsData";
import { calculateVolhardInterpretation } from "../constants/volhardInterpretationData";
import { VolhardScoresState } from "../components/testModal/VolhardSubtestScreen";

export interface BuildTestPayloadParams {
  dog: IDogResponse;
  testType: TestType;
  date: string;
  description: string;
  volhardScores: VolhardScoresState;
  structureState: ICreateStructureRequest;
  structureAnsweredFields: Record<StructureFieldKey, boolean>;
  volhardCompletedCount: number;
  behaviorCharacteristicAnswers: Record<number, CharacteristicCategory>;
  dualHandler: DualHandler | null;
  relationshipSkill: RelationshipSkill | null;
  scoreComparison: ScoreComparison | null;
  workSpeed: WorkSpeed | null;
  movementGait: MovementGait | null;
  behaviorCompletedCount: number;
  currentCompletedCount: number;
  currentTotalCount: number;
  isAllCompleted: boolean;
  activeExistingTest?: IDogTest | null;
}

export const buildDogTestSavePayload = (
  params: BuildTestPayloadParams,
): Omit<IDogTest, "id"> => {
  const {
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
  } = params;

  const dogId = dog.ID;
  const dogName = dog.name;
  const dogBreed = formatDogRace(dog.race);
  const avatarKey = dog.avatarKey;

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

  const status = isAllCompleted ? TestStatus.COMPLETED : TestStatus.PENDING;

  if (testType === TestType.VOLHARD) {
    const answeredVolhardKeys: string[] = [];
    (Object.keys(volhardScores) as VolhardScoreFieldKey[]).forEach((k) => {
      if (volhardScores[k] !== null) answeredVolhardKeys.push(k);
    });
    (Object.keys(structureAnsweredFields) as StructureFieldKey[]).forEach(
      (k) => {
        if (structureAnsweredFields[k]) answeredVolhardKeys.push(k);
      },
    );

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

    const volhardEncodedResult = encodeVolhardResultWithProgress(
      description.trim(),
      answeredVolhardKeys,
      avgVolhard,
      finalStability,
    );

    const volhardDiag = calculateVolhardInterpretation(volhardScores);
    const volhardProfileSummary = volhardDiag.majorityInfo
      ? ` | ${volhardDiag.majorityInfo.title} (${volhardDiag.majorityInfo.profile})`
      : "";

    const cleanSummaryDescription =
      description.trim() ||
      (isAllCompleted
        ? `Média Volhard: ${avgVolhard}${volhardProfileSummary}`
        : `Em andamento (${volhardCompletedCount}/${VOLHARD_TOTAL_ITEMS_COUNT} etapas realizadas)`);

    const scoreSummary = isAllCompleted
      ? `Média: ${avgVolhard} | ${
          volhardDiag.majorityInfo
            ? volhardDiag.majorityInfo.title
            : `Estab.: ${finalStability}/5`
        }`
      : `Em andamento: ${volhardCompletedCount}/${VOLHARD_TOTAL_ITEMS_COUNT} etapas`;

    return {
      dogId,
      dogsName: dogName,
      dogsBreed: dogBreed,
      avatarKey,
      type: TestType.VOLHARD,
      title: "Teste Volhard",
      date: displayDate,
      description: cleanSummaryDescription,
      score: scoreSummary,
      status,
      completedCount: currentCompletedCount,
      totalCount: currentTotalCount,
      answeredVolhardKeys,
      isSynced: false,
      volhardPayload: {
        trainerId:
          activeExistingTest?.volhardDetails?.trainerId ||
          activeExistingTest?.volhardPayload?.trainerId ||
          "",
        dogId,
        testType: "VOLHARD",
        date: isoDate,
        result: volhardEncodedResult,
        socialAttraction: volhardScores.socialAttraction ?? 3,
        following: volhardScores.following ?? 3,
        restraint: volhardScores.restraint ?? 3,
        socialDominance: volhardScores.socialDominance ?? 3,
        elevationDominance: volhardScores.elevationDominance ?? 3,
        retrieving: volhardScores.retrieving ?? 3,
        touchSensitivity: volhardScores.touchSensitivity ?? 3,
        soundSensitivity: volhardScores.soundSensitivity ?? 3,
        stability: finalStability,
        structure: structureState,
      },
    };
  }

  // BEHAVIOR
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

  const finalScoreComparison = scoreComparison || ScoreComparison.CAO_FLEXIVEL;

  const behaviorEncodedResult = encodeBehaviorResultWithProgress(
    description.trim(),
    answeredBehaviorNumbers,
    ScoreComparisonLabel[finalScoreComparison],
  );

  const cleanSummaryDescription =
    description.trim() ||
    (isAllCompleted
      ? `Comparativo: ${ScoreComparisonLabel[finalScoreComparison]}`
      : `Em andamento (${behaviorCompletedCount}/${BEHAVIOR_CHECKLIST_ITEMS.length} aspectos avaliados)`);

  const scoreSummary = isAllCompleted
    ? ScoreComparisonLabel[finalScoreComparison]
    : `Em andamento: ${behaviorCompletedCount}/${BEHAVIOR_CHECKLIST_ITEMS.length} aspectos`;

  return {
    dogId,
    dogsName: dogName,
    dogsBreed: dogBreed,
    avatarKey,
    type: TestType.BEHAVIOR,
    title: "Teste Behavior",
    date: displayDate,
    description: cleanSummaryDescription,
    score: scoreSummary,
    status,
    completedCount: currentCompletedCount,
    totalCount: currentTotalCount,
    answeredBehaviorNumbers,
    isSynced: false,
    behaviorPayload: {
      trainerId:
        activeExistingTest?.behaviorDetails?.trainerId ||
        activeExistingTest?.behaviorPayload?.trainerId ||
        "",
      dogId,
      testType: "BEHAVIOR",
      date: isoDate,
      result: behaviorEncodedResult,
      dualHandler: dualHandler || DualHandler.TRABALHA_BEM,
      relationshipSkill: relationshipSkill || RelationshipSkill.MUITO_HABIL,
      scoreComparison: finalScoreComparison,
      workSpeed: workSpeed || WorkSpeed.MODERADO,
      movementGait: movementGait || MovementGait.MANTEM_TROTE,
      characteristics: characteristicsPayload,
    },
  };
};

