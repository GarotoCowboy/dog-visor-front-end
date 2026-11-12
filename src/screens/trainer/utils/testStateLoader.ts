import {
  CharacteristicCategory,
  CharacteristicCategoryLabel,
  DualHandler,
  ICreateStructureRequest,
  IDogTest,
  MovementGait,
  RelationshipSkill,
  ScoreComparison,
  StructureType,
  WorkSpeed,
} from "../../../types/Training";
import {
  decodeBehaviorResultProgress,
  decodeVolhardResultProgress,
  IBehaviorItemDefinition,
  StructureFieldKey,
  VolhardScoreFieldKey,
} from "../constants/testQuestionsData";
import { VolhardScoresState } from "../components/testModal/VolhardSubtestScreen";

export const INITIAL_VOLHARD_SCORES: VolhardScoresState = {
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

export const INITIAL_STRUCTURE_STATE: ICreateStructureRequest = {
  straightFront: StructureType.BOA,
  shoulderAngulation: StructureType.BOA,
  croupAngulation: StructureType.BOA,
  straightRear: StructureType.BOA,
  rearAngulation: StructureType.BOA,
  elbowAngulation: StructureType.BOA,
};

export const INITIAL_STRUCTURE_ANSWERED_FIELDS: Record<StructureFieldKey, boolean> = {
  straightFront: false,
  shoulderAngulation: false,
  elbowAngulation: false,
  croupAngulation: false,
  straightRear: false,
  rearAngulation: false,
};

export const toIsoDateInput = (rawDate?: string): string => {
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

export const parseVolhardRecord = (record: IDogTest) => {
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

  const hadLegacyStructure = answeredSet.has("structure");
  const nextStructureAnswered: Record<StructureFieldKey, boolean> = {
    straightFront: hadLegacyStructure || answeredSet.has("straightFront"),
    shoulderAngulation:
      hadLegacyStructure || answeredSet.has("shoulderAngulation"),
    elbowAngulation: hadLegacyStructure || answeredSet.has("elbowAngulation"),
    croupAngulation: hadLegacyStructure || answeredSet.has("croupAngulation"),
    straightRear: hadLegacyStructure || answeredSet.has("straightRear"),
    rearAngulation: hadLegacyStructure || answeredSet.has("rearAngulation"),
  };

  const nextStructure: ICreateStructureRequest = source?.structure
    ? {
        straightFront: source.structure.straightFront || StructureType.BOA,
        shoulderAngulation:
          source.structure.shoulderAngulation || StructureType.BOA,
        croupAngulation: source.structure.croupAngulation || StructureType.BOA,
        straightRear: source.structure.straightRear || StructureType.BOA,
        rearAngulation: source.structure.rearAngulation || StructureType.BOA,
        elbowAngulation: source.structure.elbowAngulation || StructureType.BOA,
      }
    : INITIAL_STRUCTURE_STATE;

  const isDefaultDesc =
    decoded.cleanDescription.startsWith("Em andamento (") ||
    decoded.cleanDescription.startsWith("Média Volhard:") ||
    decoded.cleanDescription === "Teste Volhard concluído." ||
    decoded.cleanDescription === "Teste de Aptidão Volhard concluído.";

  return {
    volhardScores: nextScores,
    structureState: nextStructure,
    structureAnsweredFields: nextStructureAnswered,
    structureTouched: Object.values(nextStructureAnswered).some(Boolean),
    description: isDefaultDesc ? "" : decoded.cleanDescription,
    date: record.date ? toIsoDateInput(record.date) : undefined,
  };
};

export const parseBehaviorRecord = (record: IDogTest) => {
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

  const isDefaultDesc =
    decoded.cleanDescription.startsWith("Em andamento (") ||
    decoded.cleanDescription.startsWith("Comparativo:") ||
    decoded.cleanDescription === "Teste Behavior concluído." ||
    decoded.cleanDescription === "Avaliação comportamental concluída." ||
    decoded.cleanDescription === "Avaliação comportamental" ||
    decoded.cleanDescription === "Teste Behavior";

  return {
    behaviorCharacteristicAnswers: nextChars,
    dualHandler:
      answeredSet.has(44) && source?.dualHandler ? source.dualHandler : null,
    relationshipSkill:
      answeredSet.has(45) && source?.relationshipSkill
        ? source.relationshipSkill
        : null,
    scoreComparison:
      answeredSet.has(46) && source?.scoreComparison
        ? source.scoreComparison
        : null,
    workSpeed:
      answeredSet.has(47) && source?.workSpeed ? source.workSpeed : null,
    movementGait:
      answeredSet.has(48) && source?.movementGait ? source.movementGait : null,
    description: isDefaultDesc ? "" : decoded.cleanDescription,
    date: record.date ? toIsoDateInput(record.date) : undefined,
  };
};

export interface BehaviorAnswerValues {
  characteristicAnswers: Record<number, CharacteristicCategory>;
  dualHandler: DualHandler | null;
  relationshipSkill: RelationshipSkill | null;
  scoreComparison: ScoreComparison | null;
  workSpeed: WorkSpeed | null;
  movementGait: MovementGait | null;
}

export const resolveBehaviorItemLabel = (
  item: IBehaviorItemDefinition,
  values: BehaviorAnswerValues,
): string | null => {
  if (item.kind === "CHARACTERISTIC") {
    const val = values.characteristicAnswers[item.number];
    return val ? CharacteristicCategoryLabel[val] : null;
  }
  if (item.specialKey === "dualHandler" && values.dualHandler) {
    return item.options.find((o) => o.value === values.dualHandler)?.label || values.dualHandler;
  }
  if (item.specialKey === "relationshipSkill" && values.relationshipSkill) {
    return item.options.find((o) => o.value === values.relationshipSkill)?.label || values.relationshipSkill;
  }
  if (item.specialKey === "scoreComparison" && values.scoreComparison) {
    return item.options.find((o) => o.value === values.scoreComparison)?.label || values.scoreComparison;
  }
  if (item.specialKey === "workSpeed" && values.workSpeed) {
    return item.options.find((o) => o.value === values.workSpeed)?.label || values.workSpeed;
  }
  if (item.specialKey === "movementGait" && values.movementGait) {
    return item.options.find((o) => o.value === values.movementGait)?.label || values.movementGait;
  }
  return null;
};

export const resolveBehaviorItemValue = (
  item: IBehaviorItemDefinition,
  values: BehaviorAnswerValues,
): string | null => {
  if (item.kind === "CHARACTERISTIC") {
    return values.characteristicAnswers[item.number] || null;
  }
  if (item.specialKey === "dualHandler") return values.dualHandler;
  if (item.specialKey === "relationshipSkill") return values.relationshipSkill;
  if (item.specialKey === "scoreComparison") return values.scoreComparison;
  if (item.specialKey === "workSpeed") return values.workSpeed;
  if (item.specialKey === "movementGait") return values.movementGait;
  return null;
};
