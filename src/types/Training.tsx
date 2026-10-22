export enum TraningStatus {
  Apto = "Apto",
  Inapto = "Inapto",
}

export interface ITrainingResponse {
  id: string;
  trainerId: string;
  dogId: string;
  dogsName: string;
  dogsBreed: string;
  monthYear: number;
  day: number;
  evaluationType: string;
  currentStage: number; // 1 a 4
  status?: TraningStatus | null;
  lastTrainingDate?: string;
  dogAge?: string;
  dogSex?: string;
  avatarKey?: string;
  isSynced?: boolean;
  totalSessionsRecorded?: number; // 0 a 21
}

export interface ICreateTrainingRequest {
  trainerId: string;
  dogId: string;
  dogsName: string;
  dogsBreed: string;
  monthYear: number;
  day: number;
  evaluationType: string;
}

export interface IUpdateTrainingRequest {
  dogsName?: string;
  dogsBreed?: string;
  monthYear?: number;
  day?: number;
  evaluationType?: string;
  currentStage?: number;
  status?: TraningStatus;
}

// --- RELATÓRIO COMPLETO POR ETAPA ---
export interface IStageReport<T> {
  stageNumber: number;
  stageName: string;
  status: string; // "CONCLUIDA", "EM_ANDAMENTO", "NAO_INICIADA"
  totalSessionsRecorded: number; // 0 a 21
  maxSessionsAllowed: number; // 21
  sessions: T[];
}

export interface ITrainingReportResponse {
  trainingId: string;
  dogId: string;
  dogsName: string;
  dogsBreed: string;
  trainerId: string;
  currentStage: number;
  status: TraningStatus | null;
  stage1: IStageReport<IStage1Response>;
  stage2: IStageReport<IStage2Response>;
  stage3: IStageReport<IStage3Response>;
  stage4: IStageReport<IStage4Response>;
}

// --- ETAPA 1 ---
export interface IStage1Response {
  id: string;
  trainingId: string;
  trainingDate?: string;
  sessionNumber?: number;
  availability: boolean;
  sit: boolean;
  lieDown: boolean;
  standUp: boolean;
  left: boolean;
  right: boolean;
  foodControl: boolean;
  boxGuides: boolean;
  legResistance: boolean;
  harnessResistance: boolean;
  wearHarness: boolean;
  submission: boolean;
  openDoor: boolean;
  status?: TraningStatus;
  createdAt?: string;
}

export interface ICreateStage1Request {
  trainingId: string;
  trainingDate?: string;
  availability: boolean;
  sit: boolean;
  lieDown: boolean;
  standUp: boolean;
  left: boolean;
  right: boolean;
  foodControl: boolean;
  boxGuides: boolean;
  legResistance: boolean;
  harnessResistance: boolean;
  wearHarness: boolean;
  submission: boolean;
  openDoor: boolean;
  status?: TraningStatus;
}

// --- ETAPA 2 ---
export interface IStage2Response {
  id: string;
  trainingId: string;
  trainingDate?: string;
  sessionNumber?: number;
  hallwayAvailability: boolean;
  wearHarness: boolean;
  left: boolean;
  right: boolean;
  forwardWithHarness: boolean;
  turning: boolean;
  leftWithHarness: boolean;
  rightWithHarness: boolean;
  aerialObstacle: boolean;
  lateralObstacle: boolean;
  groundObstacle: boolean;
  movingObstacle: number;
  variedSurfaces: boolean;
  narrowPassages: boolean;
  generalObedience: boolean;
  status?: TraningStatus;
  createdAt?: string;
}

export interface ICreateStage2Request {
  trainingId: string;
  trainingDate?: string;
  hallwayAvailability: boolean;
  wearHarness: boolean;
  left: boolean;
  right: boolean;
  forwardWithHarness: boolean;
  turning: boolean;
  leftWithHarness: boolean;
  rightWithHarness: boolean;
  aerialObstacle: boolean;
  lateralObstacle: boolean;
  groundObstacle: boolean;
  movingObstacle: number;
  variedSurfaces: boolean;
  narrowPassages: boolean;
  generalObedience: boolean;
  status?: TraningStatus;
}

// --- ETAPA 3 ---
export interface IStage3Response {
  id: string;
  trainingId: string;
  trainingDate?: string;
  sessionNumber?: number;
  wearHarness: boolean;
  aerialObstacle: boolean;
  lateralObstacle: boolean;
  back: boolean;
  right: boolean;
  left: boolean;
  groundObstacle: boolean;
  movingObstacle: number;
  curb: boolean;
  crosswalk: boolean;
  fourCorners: boolean;
  sidewalkReturn: boolean;
  generalObedience: boolean;
  attractionBehavior: boolean;
  recall: boolean;
  status?: TraningStatus;
  createdAt?: string;
}

export interface ICreateStage3Request {
  trainingId: string;
  trainingDate?: string;
  wearHarness: boolean;
  aerialObstacle: boolean;
  lateralObstacle: boolean;
  back: boolean;
  right: boolean;
  left: boolean;
  groundObstacle: boolean;
  movingObstacle: number;
  curb: boolean;
  crosswalk: boolean;
  fourCorners: boolean;
  sidewalkReturn: boolean;
  generalObedience: boolean;
  attractionBehavior: boolean;
  recall: boolean;
  status?: TraningStatus;
}

// --- ETAPA 4 ---
export interface IStage4Response {
  id: string;
  trainingId: string;
  trainingDate?: string;
  sessionNumber?: number;
  wearHarness: boolean;
  right: boolean;
  left: boolean;
  back: boolean;
  curb: boolean;
  entranceExit: boolean;
  stairs: boolean;
  sidewalkReturn: boolean;
  searchSeat: boolean;
  pedestrianCrossing: boolean;
  aerialObstacle: boolean;
  lateralObstacle: boolean;
  groundObstacle: boolean;
  movingObstacle: number;
  trafficLightCrossing: boolean;
  shoppingCenter: boolean;
  rolling: boolean;
  elevator: boolean;
  commercialCenter: boolean;
  cityCenter: boolean;
  busTerminal: boolean;
  bus: boolean;
  subway: boolean;
  intelligentDisobedience: boolean;
  blindfoldedWalk: boolean;
  busStop: boolean;
  atm: boolean;
  bathroomWalk: boolean;
  status?: TraningStatus;
  createdAt?: string;
}

export interface ICreateStage4Request {
  trainingId: string;
  trainingDate?: string;
  wearHarness: boolean;
  right: boolean;
  left: boolean;
  back: boolean;
  curb: boolean;
  entranceExit: boolean;
  stairs: boolean;
  sidewalkReturn: boolean;
  searchSeat: boolean;
  pedestrianCrossing: boolean;
  aerialObstacle: boolean;
  lateralObstacle: boolean;
  groundObstacle: boolean;
  movingObstacle: number;
  trafficLightCrossing: boolean;
  shoppingCenter: boolean;
  rolling: boolean;
  elevator: boolean;
  commercialCenter: boolean;
  cityCenter: boolean;
  busTerminal: boolean;
  bus: boolean;
  subway: boolean;
  intelligentDisobedience: boolean;
  blindfoldedWalk: boolean;
  busStop: boolean;
  atm: boolean;
  bathroomWalk: boolean;
  status?: TraningStatus;
}

// --- TESTES (VOLHARD & COMPORTAMENTAL) ---
export enum TestType {
  VOLHARD = "VOLHARD",
  BEHAVIOR = "BEHAVIOR",
}

export enum TestStatus {
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
}

// ENUMS TESTE COMPORTAMENTAL (BEHAVIOR)
export enum DualHandler {
  TRABALHA_BEM = "TRABALHA_BEM",
  NAO_TRABALHA_BEM = "NAO_TRABALHA_BEM",
}

export const DualHandlerLabel: Record<DualHandler, string> = {
  [DualHandler.TRABALHA_BEM]: "Trabalha bem",
  [DualHandler.NAO_TRABALHA_BEM]: "Não trabalha bem",
};

export enum RelationshipSkill {
  MUITO_HABIL = "MUITO_HABIL",
  MENOS_QUALIFICADO = "MENOS_QUALIFICADO",
  NAO_MUITO_HABIL = "NAO_MUITO_HABIL",
}

export const RelationshipSkillLabel: Record<RelationshipSkill, string> = {
  [RelationshipSkill.MUITO_HABIL]: "Muito hábil",
  [RelationshipSkill.MENOS_QUALIFICADO]: "Menos qualificado",
  [RelationshipSkill.NAO_MUITO_HABIL]: "Não muito hábil",
};

export enum ScoreComparison {
  CAO_FLEXIVEL = "CAO_FLEXIVEL",
  MENOS_ADAPTAVEL = "MENOS_ADAPTAVEL",
  NAO_UTILIZAVEL = "NAO_UTILIZAVEL",
}

export const ScoreComparisonLabel: Record<ScoreComparison, string> = {
  [ScoreComparison.CAO_FLEXIVEL]: "Cão flexível",
  [ScoreComparison.MENOS_ADAPTAVEL]: "Menos adaptável",
  [ScoreComparison.NAO_UTILIZAVEL]: "Não utilizável",
};

export enum WorkSpeed {
  LENTO = "LENTO",
  MODERADO_MENOS = "MODERADO_MENOS",
  MODERADO = "MODERADO",
  MODERADO_MAIS = "MODERADO_MAIS",
  RAPIDO = "RAPIDO",
}

export const WorkSpeedLabel: Record<WorkSpeed, string> = {
  [WorkSpeed.LENTO]: "Lento",
  [WorkSpeed.MODERADO_MENOS]: "Moderado-",
  [WorkSpeed.MODERADO]: "Moderado",
  [WorkSpeed.MODERADO_MAIS]: "Moderado+",
  [WorkSpeed.RAPIDO]: "Rápido",
};

export enum MovementGait {
  MANTEM_TROTE = "MANTEM_TROTE",
  NAO_MANTEM = "NAO_MANTEM",
  NAO_TROTA = "NAO_TROTA",
}

export const MovementGaitLabel: Record<MovementGait, string> = {
  [MovementGait.MANTEM_TROTE]: "Mantém trote",
  [MovementGait.NAO_MANTEM]: "Não mantém",
  [MovementGait.NAO_TROTA]: "Não trota",
};

export enum CharacteristicCategory {
  AUSENTE = "AUSENTE",
  MUITO_LEVE = "MUITO_LEVE",
  LEVE = "LEVE",
  MODERADO = "MODERADO",
  SEVERO = "SEVERO",
  NA = "NA",
  X = "X",
}

export const CharacteristicCategoryLabel: Record<
  CharacteristicCategory,
  string
> = {
  [CharacteristicCategory.AUSENTE]: "Ausente",
  [CharacteristicCategory.MUITO_LEVE]: "Muito leve",
  [CharacteristicCategory.LEVE]: "Leve",
  [CharacteristicCategory.MODERADO]: "Moderado",
  [CharacteristicCategory.SEVERO]: "Severo",
  [CharacteristicCategory.NA]: "N/A",
  [CharacteristicCategory.X]: "X",
};

// ENUMS TESTE VOLHARD
export enum StructureType {
  BOA = "BOA",
  ACEITAVEL = "ACEITAVEL",
  RUIM = "RUIM",
}

export const StructureTypeLabel: Record<StructureType, string> = {
  [StructureType.BOA]: "Boa",
  [StructureType.ACEITAVEL]: "Aceitável",
  [StructureType.RUIM]: "Ruim",
};

// DTOS BEHAVIOR TEST
export interface ICreateCharacteristicRequest {
  name: string;
  description?: string;
  category: CharacteristicCategory;
}

export interface IUpdateCharacteristicRequest {
  name?: string;
  description?: string;
  category?: CharacteristicCategory;
}

export interface ICharacteristicResponse {
  id: string;
  name: string;
  description?: string;
  category: CharacteristicCategory;
}

export interface ICreateBehaviorTestRequest {
  trainerId: string;
  dogId: string;
  testType?: string;
  date?: string; // YYYY-MM-DD
  result?: string;
  dualHandler: DualHandler;
  relationshipSkill: RelationshipSkill;
  scoreComparison: ScoreComparison;
  workSpeed: WorkSpeed;
  movementGait: MovementGait;
  characteristics?: ICreateCharacteristicRequest[];
}

export interface IUpdateBehaviorTestRequest {
  trainerId?: string;
  dogId?: string;
  testType?: string;
  date?: string;
  result?: string;
  dualHandler?: DualHandler;
  relationshipSkill?: RelationshipSkill;
  scoreComparison?: ScoreComparison;
  workSpeed?: WorkSpeed;
  movementGait?: MovementGait;
  characteristics?: IUpdateCharacteristicRequest[];
}

export interface IBehaviorTestResponse {
  id: string;
  trainerId: string;
  dogId: string;
  testType: string;
  date?: string;
  result?: string;
  dualHandler: DualHandler;
  relationshipSkill: RelationshipSkill;
  scoreComparison: ScoreComparison;
  workSpeed: WorkSpeed;
  movementGait: MovementGait;
  characteristics?: ICharacteristicResponse[];
}

// DTOS VOLHARD TEST
export interface ICreateStructureRequest {
  straightFront: StructureType;
  shoulderAngulation: StructureType;
  croupAngulation: StructureType;
  straightRear: StructureType;
  rearAngulation: StructureType;
  elbowAngulation: StructureType;
}

export interface IUpdateStructureRequest {
  straightFront?: StructureType;
  shoulderAngulation?: StructureType;
  croupAngulation?: StructureType;
  straightRear?: StructureType;
  rearAngulation?: StructureType;
  elbowAngulation?: StructureType;
}

export interface IStructureResponse {
  id: string;
  straightFront: StructureType;
  shoulderAngulation: StructureType;
  croupAngulation: StructureType;
  straightRear: StructureType;
  rearAngulation: StructureType;
  elbowAngulation: StructureType;
}

export interface ICreateVolhardTestRequest {
  trainerId: string;
  dogId: string;
  testType?: string;
  date?: string; // YYYY-MM-DD
  result?: string;
  socialAttraction: number;
  following: number;
  restraint: number;
  socialDominance: number;
  elevationDominance: number;
  retrieving: number;
  touchSensitivity: number;
  soundSensitivity: number;
  stability: number;
  structure: ICreateStructureRequest;
}

export interface IUpdateVolhardTestRequest {
  trainerId?: string;
  dogId?: string;
  testType?: string;
  date?: string;
  result?: string;
  socialAttraction?: number;
  following?: number;
  restraint?: number;
  socialDominance?: number;
  elevationDominance?: number;
  retrieving?: number;
  touchSensitivity?: number;
  soundSensitivity?: number;
  stability?: number;
  structure?: IUpdateStructureRequest;
}

export interface IVolhardTestResponse {
  id: string;
  trainerId: string;
  dogId: string;
  testType: string;
  date?: string;
  result?: string;
  socialAttraction: number;
  following: number;
  restraint: number;
  socialDominance: number;
  elevationDominance: number;
  retrieving: number;
  touchSensitivity: number;
  soundSensitivity: number;
  stability: number;
  structure: IStructureResponse;
}

// MODELO UNIFICADO DE TESTE PARA EXIBIÇÃO EM TELAS E CACHE OFFLINE
export interface IDogTest {
  id: string;
  dogId: string;
  dogsName: string;
  dogsBreed: string;
  avatarKey?: string;
  type: TestType;
  title: string;
  date: string;
  description: string;
  score?: string; // ex: "Apto", "Nota: 8.5/10"
  status: TestStatus;
  trainerName?: string;
  isSynced?: boolean;
  volhardDetails?: IVolhardTestResponse;
  behaviorDetails?: IBehaviorTestResponse;
  volhardPayload?: ICreateVolhardTestRequest;
  behaviorPayload?: ICreateBehaviorTestRequest;
  completedCount?: number;
  totalCount?: number;
  answeredVolhardKeys?: string[];
  answeredBehaviorNumbers?: number[];
}

export interface ICreateDogTestRequest {
  dogId: string;
  dogsName: string;
  dogsBreed: string;
  avatarKey?: string;
  type: TestType;
  title: string;
  date: string;
  description: string;
  score?: string;
  status: TestStatus;
  volhardPayload?: ICreateVolhardTestRequest;
  behaviorPayload?: ICreateBehaviorTestRequest;
  completedCount?: number;
  totalCount?: number;
  answeredVolhardKeys?: string[];
  answeredBehaviorNumbers?: number[];
}

// --- FILA DE SINCRONIZAÇÃO OFFLINE ---
export interface ISyncQueueItem {
  id: string;
  actionType:
    | "CREATE_TRAINING"
    | "SAVE_STAGE1"
    | "SAVE_STAGE2"
    | "SAVE_STAGE3"
    | "SAVE_STAGE4"
    | "FINALIZE_STAGE"
    | "CREATE_TEST"
    | "CREATE_VOLHARD_TEST"
    | "CREATE_BEHAVIOR_TEST"
    | "UPDATE_VOLHARD_TEST"
    | "UPDATE_BEHAVIOR_TEST";
  endpoint: string;
  method: "POST" | "PATCH" | "PUT" | "DELETE";
  payload?: any;
  queryParams?: Record<string, string>;
  createdAt: number;
}

