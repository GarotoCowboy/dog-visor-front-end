export const colors = {
  primary: "#2a5654",
  secondary: "#356c69",
  accent: "#a0d6d1",
  text: "#2b2b2b",
  alert: "#e57373",
  alertLightColor: "#fee2e2",
  warningLightColor: "#fef3c7",
  background: "#f4f4f4",
  white: "#ffffff",
  border: "#E5E7EB",

  // Status
  statusPending: "#356c69",
  statusUrgent: "#e57373",
  statusCompleted: "#a0d6d1",
  warning: "#f59e0b",
} as const;

export const typography = {
  fontFamily: {
    regular: "Inter-Regular",
    medium: "Inter-Medium",
    semiBold: "Inter-SemiBold",
    bold: "Inter-Bold",
    display: "Nunito-Bold", // headings
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    tight: 20,
    normal: 24,
    relaxed: 28,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
