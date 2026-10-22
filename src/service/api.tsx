/**
 * Barrel de compatibilidade: reexporta todos os serviços de domínio.
 * Prefira importar diretamente do módulo de domínio (dogService, userService, ...).
 */
export { default, setUnauthorizedHandler } from "./apiClient";
export * from "./authService";
export * from "./userService";
export * from "./notificationService";
export * from "./dogService";
export * from "./dogHealthService";
export * from "./feedingService";
export * from "./trainingService";
