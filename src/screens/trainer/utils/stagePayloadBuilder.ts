// Definições completas de chaves para cada etapa garantindo que nenhum campo @NotNull seja omitido
export const STAGE_1_FIELDS = [
  "availability",
  "sit",
  "lieDown",
  "standUp",
  "left",
  "right",
  "foodControl",
  "boxGuides",
  "legResistance",
  "harnessResistance",
  "wearHarness",
  "submission",
  "openDoor",
];

export const STAGE_2_FIELDS = [
  "hallwayAvailability",
  "wearHarness",
  "left",
  "right",
  "forwardWithHarness",
  "turning",
  "leftWithHarness",
  "rightWithHarness",
  "aerialObstacle",
  "lateralObstacle",
  "groundObstacle",
  "movingObstacle",
  "variedSurfaces",
  "narrowPassages",
  "generalObedience",
];

export const STAGE_3_FIELDS = [
  "wearHarness",
  "aerialObstacle",
  "lateralObstacle",
  "back",
  "right",
  "left",
  "groundObstacle",
  "movingObstacle",
  "curb",
  "crosswalk",
  "fourCorners",
  "sidewalkReturn",
  "generalObedience",
  "attractionBehavior",
  "recall",
];

export const STAGE_4_FIELDS = [
  "wearHarness",
  "right",
  "left",
  "back",
  "curb",
  "entranceExit",
  "stairs",
  "sidewalkReturn",
  "searchSeat",
  "pedestrianCrossing",
  "aerialObstacle",
  "lateralObstacle",
  "groundObstacle",
  "movingObstacle",
  "trafficLightCrossing",
  "shoppingCenter",
  "rolling",
  "elevator",
  "commercialCenter",
  "cityCenter",
  "busTerminal",
  "bus",
  "subway",
  "intelligentDisobedience",
  "blindfoldedWalk",
  "busStop",
  "atm",
  "bathroomWalk",
];

export const isValidUuid = (val?: string): boolean => {
  if (!val) return false;
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(val);
};

export const buildStagePayload = (
  stageNumber: number,
  trainingId: string,
  trainingDate: string,
  data: Record<string, boolean>,
) => {
  const fields =
    stageNumber === 1
      ? STAGE_1_FIELDS
      : stageNumber === 2
      ? STAGE_2_FIELDS
      : stageNumber === 3
      ? STAGE_3_FIELDS
      : STAGE_4_FIELDS;

  const payload: any = {
    trainingId,
    trainingDate,
  };

  for (const field of fields) {
    if (field === "movingObstacle") {
      payload[field] = data[field] ? 1 : 0;
    } else {
      payload[field] = Boolean(data[field]);
    }
  }

  return payload;
};

