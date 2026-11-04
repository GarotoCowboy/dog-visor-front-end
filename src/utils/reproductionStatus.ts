import { IDogReproductionResponse } from "../types/DogHealth";

export const HEAT_ACTIVE_DURATION_DAYS = 21;
export const HEAT_APPROACHING_WINDOW_DAYS = 30;
export const MANUAL_END_MARKER_REGEX = /\[Cio encerrado em (\d{2}\/\d{2}\/\d{4})\]/i;

export type ReproductionCycleStatus =
  | "IN_HEAT"
  | "ENDED_MANUALLY"
  | "APPROACHING"
  | "OVERDUE"
  | "NORMAL";

export interface ReproductionStatusInfo {
  status: ReproductionCycleStatus;
  label: string;
  detailText: string;
  badgeBgColor: string;
  badgeTextColor: string;
  badgeBorderColor: string;
  accentColor: string;
  iconName: string;
  daysSinceStart: number;
  daysRemainingInHeat: number;
  daysUntilNextHeat: number | null;
  canEndManually: boolean;
  isOverdue: boolean;
  manualEndDateStr?: string;
}

export const parseLocalDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const clean = dateStr.split("T")[0];
  const parts = clean.split("-");
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
};

export const formatLocalDateBR = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const formatPayloadDateISO = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const getExpectedNextHeatDate = (
  item: IDogReproductionResponse,
): Date | null => {
  const explicitNext = parseLocalDate(item.expectedNextHeatDate);
  if (explicitNext) return explicitNext;

  const observed = parseLocalDate(item.date);
  if (!observed) return null;

  const next = new Date(observed);
  next.setMonth(next.getMonth() + (item.cycleIntervalInMonths || 6));
  return next;
};

export const appendManualEndObservation = (
  currentObservations?: string,
  endDate: Date = new Date(),
): string => {
  const cleaned = (currentObservations || "")
    .replace(MANUAL_END_MARKER_REGEX, "")
    .trim();
  const tag = `[Cio encerrado em ${formatLocalDateBR(endDate)}]`;
  return cleaned ? `${cleaned}\n${tag}` : tag;
};

export const getReproductionStatusInfo = (
  item: IDogReproductionResponse,
): ReproductionStatusInfo => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const observedDate = parseLocalDate(item.date);
  const nextHeatDate = getExpectedNextHeatDate(item);

  const msPerDay = 1000 * 60 * 60 * 24;

  const daysSinceStart = observedDate
    ? Math.floor((today.getTime() - observedDate.getTime()) / msPerDay)
    : -1;

  const daysUntilNextHeat = nextHeatDate
    ? Math.ceil((nextHeatDate.getTime() - today.getTime()) / msPerDay)
    : null;

  const manualMatch = item.observations?.match(MANUAL_END_MARKER_REGEX);
  const isManuallyEnded = Boolean(manualMatch);
  const manualEndDateStr = manualMatch?.[1];

  // 1. Está dentro da janela ativa do cio (primeiros 21 dias após a data observada)
  if (
    observedDate &&
    daysSinceStart >= 0 &&
    daysSinceStart <= HEAT_ACTIVE_DURATION_DAYS
  ) {
    if (isManuallyEnded) {
      return {
        status: "ENDED_MANUALLY",
        label: "Cio Encerrado",
        detailText: manualEndDateStr
          ? `Encerrado manualmente em ${manualEndDateStr}`
          : "Período de cio encerrado manualmente",
        badgeBgColor: "#ECFDF5",
        badgeTextColor: "#047857",
        badgeBorderColor: "#A7F3D0",
        accentColor: "#10B981",
        iconName: "check-circle-outline",
        daysSinceStart,
        daysRemainingInHeat: 0,
        daysUntilNextHeat,
        canEndManually: false,
        isOverdue: false,
        manualEndDateStr,
      };
    }

    const currentDay = daysSinceStart + 1;
    const daysRemainingInHeat = Math.max(
      0,
      HEAT_ACTIVE_DURATION_DAYS - daysSinceStart,
    );

    return {
      status: "IN_HEAT",
      label: "Em Cio Ativo",
      detailText:
        daysRemainingInHeat === 0
          ? `Último dia estimado do período (Dia ${currentDay}/${HEAT_ACTIVE_DURATION_DAYS})`
          : `Dia ${currentDay} de ~${HEAT_ACTIVE_DURATION_DAYS} • faltam ~${daysRemainingInHeat} dia(s)`,
      badgeBgColor: "#FCE7F3",
      badgeTextColor: "#BE185D",
      badgeBorderColor: "#F9A8D4",
      accentColor: "#BE185D",
      iconName: "alert-decagram",
      daysSinceStart,
      daysRemainingInHeat,
      daysUntilNextHeat,
      canEndManually: true,
      isOverdue: false,
    };
  }

  // 2. A data prevista do próximo cio já passou (Previsão Vencida)
  if (daysUntilNextHeat !== null && daysUntilNextHeat < 0) {
    const overdueDays = Math.abs(daysUntilNextHeat);
    return {
      status: "OVERDUE",
      label: "Previsão Vencida",
      detailText:
        overdueDays === 1
          ? "Previsto há 1 dia • confirme se entrou no cio"
          : `Previsto há ${overdueDays} dias • registre novo ciclo ou ajuste`,
      badgeBgColor: "#FEF2F2",
      badgeTextColor: "#B91C1C",
      badgeBorderColor: "#FECACA",
      accentColor: "#DC2626",
      iconName: "calendar-alert",
      daysSinceStart,
      daysRemainingInHeat: 0,
      daysUntilNextHeat,
      canEndManually: false,
      isOverdue: true,
    };
  }

  // 3. Próximo cio está próximo (em até 30 dias)
  if (
    daysUntilNextHeat !== null &&
    daysUntilNextHeat >= 0 &&
    daysUntilNextHeat <= HEAT_APPROACHING_WINDOW_DAYS
  ) {
    return {
      status: "APPROACHING",
      label:
        daysUntilNextHeat === 0
          ? "Previsto para Hoje"
          : `Próximo em ${daysUntilNextHeat}d`,
      detailText:
        daysUntilNextHeat === 0
          ? "O próximo cio está previsto para iniciar hoje"
          : `Faltam ${daysUntilNextHeat} dia(s) para a previsão do próximo cio`,
      badgeBgColor: "#FFFBEB",
      badgeTextColor: "#B45309",
      badgeBorderColor: "#FDE68A",
      accentColor: "#D97706",
      iconName: "clock-alert-outline",
      daysSinceStart,
      daysRemainingInHeat: 0,
      daysUntilNextHeat,
      canEndManually: false,
      isOverdue: false,
    };
  }

  // 4. Ciclo normal (Anestro / Aguardando próximo ciclo)
  return {
    status: "NORMAL",
    label: "Ciclo Normal",
    detailText:
      daysUntilNextHeat !== null
        ? `Próximo cio previsto em ${daysUntilNextHeat} dias`
        : "Fora do período de cio",
    badgeBgColor: "#F0FDF4",
    badgeTextColor: "#15803D",
    badgeBorderColor: "#BBF7D0",
    accentColor: "#EC4899",
    iconName: "calendar-check-outline",
    daysSinceStart,
    daysRemainingInHeat: 0,
    daysUntilNextHeat,
    canEndManually: false,
    isOverdue: false,
  };
};

