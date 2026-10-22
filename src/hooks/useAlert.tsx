import React, { useState, useCallback } from "react";
import { CustomAlertComponent } from "../shared/components/CustomAlertComponent";

export type AlertVariant = "warning" | "error" | "success";

export interface AlertOptions {
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export interface AlertState extends AlertOptions {
  visible: boolean;
  variant: AlertVariant;
  title: string;
  message: string;
}

const initialState: AlertState = {
  visible: false,
  variant: "warning",
  title: "",
  message: "",
  confirmText: "Confirmar",
  cancelText: "Cancelar",
  showCancel: false,
};

export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>(initialState);

  const showAlert = useCallback(
    (
      variant: AlertVariant,
      title: string,
      message: string,
      options?: AlertOptions
    ) => {
      setAlertState({
        visible: true,
        variant,
        title,
        message,
        onConfirm: options?.onConfirm,
        confirmText: options?.confirmText ?? "Confirmar",
        cancelText: options?.cancelText ?? "Cancelar",
        showCancel: options?.showCancel ?? false,
      });
    },
    []
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      confirmTextOrOptions?:
        | string
        | (Partial<AlertOptions> & { variant?: AlertVariant }),
      cancelText?: string,
    ) => {
      const isOptionsObject =
        typeof confirmTextOrOptions === "object" &&
        confirmTextOrOptions !== null;
      const opts = isOptionsObject
        ? confirmTextOrOptions
        : {
            confirmText: confirmTextOrOptions,
            cancelText,
          };

      setAlertState({
        visible: true,
        variant: opts?.variant ?? "warning",
        title,
        message,
        onConfirm,
        confirmText: opts?.confirmText ?? "Confirmar",
        cancelText: opts?.cancelText ?? "Cancelar",
        showCancel: true,
      });
    },
    [],
  );

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);

  const AlertModal = useCallback(() => {
    return (
      <CustomAlertComponent
        visible={alertState.visible}
        variant={alertState.variant}
        title={alertState.title}
        message={alertState.message}
        onClose={hideAlert}
        onConfirm={alertState.onConfirm}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
      />
    );
  }, [alertState, hideAlert]);

  return {
    alertState,
    showAlert,
    showConfirm,
    hideAlert,
    AlertModal,
  };
};

export default useAlert;
