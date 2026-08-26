import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Card } from "../../../shared/components/CardComponent";
import FormComponent from "../../../shared/components/FormComponent";
import { useState } from "react";
import { Button } from "../../../shared/components/ButtonComponent";
import { BlurView } from "expo-blur";
import { decreaseDogRation, increaseDogRation } from "../../../service/api";
import { theme } from "../../../../theme/theme";
import {
  IDecreaseRationStockRequest,
  IIncreaseRationStockRequest,
} from "../../../types/Ration";

// Importe o tipo do variant para usar na Interface
type AlertVariant = "warning" | "error" | "success";

interface IEditRationFormProps {
  isVisible: boolean;
  type: "Increase" | "Decrease";
  text: string;
  rationId?: string | null;
  onSuccess: () => void;
  onClose: () => void;
  // Nova propriedade para acionar o alerta da tela pai
  onShowAlert: (variant: AlertVariant, title: string, message: string) => void;
}

export const EditRationFormComponent = ({
  isVisible,
  text,
  type,
  onSuccess,
  onClose,
  rationId,
  onShowAlert,
}: IEditRationFormProps) => {
  const [bagCount, setBagCount] = useState("");
  const [weightPerBagKg, setWeightPerBagKg] = useState("");
  const [decreaseAmount, setDecreaseAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setBagCount("");
    setWeightPerBagKg("");
    setDecreaseAmount("");
    onClose();
  };

  const handleSendForm = async () => {
    if (!rationId) {
      onShowAlert("error", "Erro", "ID da ração não encontrado.");
      return;
    }

    if (type === "Increase") {
      const parsedBagCount = parseInt(bagCount.trim(), 10);
      const parsedWeight = parseFloat(weightPerBagKg.replace(",", "."));

      if (
        isNaN(parsedBagCount) ||
        parsedBagCount <= 0 ||
        isNaN(parsedWeight) ||
        parsedWeight <= 0
      ) {
        onShowAlert(
          "warning",
          "Atenção",
          "Informe a quantidade de sacos e o peso por saco válidos maiores que zero.",
        );
        return;
      }

      const payload: IIncreaseRationStockRequest = {
        bagCount: parsedBagCount,
        weightPerBagKg: parsedWeight,
      };

      try {
        setLoading(true);
        await increaseDogRation(rationId, payload);
        handleClose();
        onSuccess();
      } catch (error) {
        console.error("Erro ao adicionar estoque de ração:", error);
        onShowAlert(
          "error",
          "Erro",
          "Não foi possível aumentar a quantidade de ração.",
        );
      } finally {
        setLoading(false);
      }
    } else {
      const numericAmount = parseFloat(decreaseAmount.replace(",", "."));

      if (isNaN(numericAmount) || numericAmount <= 0) {
        onShowAlert(
          "warning",
          "Atenção",
          "Informe uma quantidade válida maior que zero.",
        );
        return;
      }

      const payload: IDecreaseRationStockRequest = {
        quantityKg: numericAmount,
      };

      try {
        setLoading(true);
        await decreaseDogRation(rationId, payload);
        handleClose();
        onSuccess();
      } catch (error) {
        console.error("Erro ao diminuir estoque de ração:", error);
        onShowAlert(
          "error",
          "Erro",
          "Não foi possível diminuir a quantidade de ração.",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const parsedBags = parseInt(bagCount.trim(), 10);
  const parsedWeight = parseFloat(weightPerBagKg.replace(",", "."));
  const totalWeight =
    !isNaN(parsedBags) && parsedBags > 0 && !isNaN(parsedWeight) && parsedWeight > 0
      ? Number((parsedBags * parsedWeight).toFixed(2))
      : 0;

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <BlurView style={StyleSheet.absoluteFill} intensity={20} tint="dark" />
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={styles.cardContainer}>
            <Card>
              <View style={styles.innerContainer}>
                <Text style={styles.title}>{text}</Text>

                {type === "Increase" ? (
                  <>
                    <FormComponent
                      text="Quantidade de Sacos"
                      keyboardType="numeric"
                      onChangeText={setBagCount}
                      value={bagCount}
                      placeholder="Ex: 3"
                    />
                    <FormComponent
                      text="Peso por Saco (Kg)"
                      keyboardType="numeric"
                      onChangeText={setWeightPerBagKg}
                      value={weightPerBagKg}
                      placeholder="Ex: 15.0"
                    />

                    <View style={styles.previewContainer}>
                      <Text style={styles.previewLabel}>Total a adicionar:</Text>
                      <Text style={styles.previewValue}>
                        {totalWeight > 0 ? `${totalWeight} Kg` : "0 Kg"}
                      </Text>
                    </View>
                  </>
                ) : (
                  <FormComponent
                    text="Quantidade (Kg)"
                    keyboardType="numeric"
                    onChangeText={setDecreaseAmount}
                    value={decreaseAmount}
                    placeholder="Ex: 5.0"
                  />
                )}

                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.accent} />
                ) : (
                  <Button onPress={handleSendForm} text="Salvar" />
                )}
              </View>
            </Card>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  cardContainer: {
    width: "80%",
  },
  innerContainer: {
    gap: 12,
    padding: 8,
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    textAlign: "center",
  },
  previewContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  previewLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  previewValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
  },
});