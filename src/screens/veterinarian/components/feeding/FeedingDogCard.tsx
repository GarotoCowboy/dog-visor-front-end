import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { Card } from "../../../../shared/components/CardComponent";
import { DogRaceLabel, IDogResponse } from "../../../../types/Dog";
import { IFeedingPlanResponse } from "../../../../types/FeedingPlan";
import { femaleDogIcons, maleDogIcons } from "../../../../consts/dogIcons";

const avatarMap = [...femaleDogIcons, ...maleDogIcons].reduce(
  (acc, item) => {
    acc[item.key] = item.image;
    return acc;
  },
  {} as Record<string, any>,
);

interface FeedingDogCardProps {
  dog: IDogResponse;
  plan?: IFeedingPlanResponse;
  inKennel: boolean;
  rationDeleted?: boolean;
  currentQuantity: number;
  onEditPlan: () => void;
  onAdjustQuantity: (delta: number) => void;
}

export const FeedingDogCard: React.FC<FeedingDogCardProps> = ({
  dog,
  plan,
  inKennel,
  rationDeleted = false,
  currentQuantity,
  onEditPlan,
  onAdjustQuantity,
}) => {
  const imageSource = avatarMap[dog.avatarKey];

  const rationDisplay = plan
    ? rationDeleted
      ? `Ração excluída — toque no lápis para atualizar (${plan.name || "Plano Ativo"})`
      : plan.rationName
      ? `${plan.rationName} — ${plan.name || "Plano Ativo"}`
      : `${plan.name || "Plano Alimentar Ativo"}`
    : inKennel
    ? "Sem plano alimentar cadastrado"
    : "Fora do canil (Socialização)";

  return (
    <View style={styles.cardWrapper}>
      <Card>
        <View style={styles.cardContent}>
          {/* CABEÇALHO DO CARD: FOTO + NOME/RAÇA/RAÇÃO + BOTÃO EDITAR */}
          <View style={styles.headerRow}>
            <View style={styles.avatarContainer}>
              {imageSource ? (
                <Image source={imageSource} style={styles.avatarImage} />
              ) : (
                <View
                  style={[styles.avatarImage, styles.avatarPlaceholder]}
                >
                  <FontAwesomeFreeSolid
                    name="dog"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
            </View>

            <View style={styles.dogHeaderInfo}>
              <View style={styles.nameAndBadgeRow}>
                <Text style={styles.dogNameText} numberOfLines={1}>
                  {dog.name}
                </Text>

                <View
                  style={[
                    styles.kennelBadge,
                    inKennel ? styles.kennelBadgeIn : styles.kennelBadgeOut,
                  ]}
                >
                  <Text
                    style={[
                      styles.kennelBadgeText,
                      inKennel
                        ? styles.kennelBadgeTextIn
                        : styles.kennelBadgeTextOut,
                    ]}
                  >
                    {inKennel ? "No Canil" : "Fora do Canil"}
                  </Text>
                </View>
              </View>

              <Text style={styles.dogBreedText}>
                {dog.race ? DogRaceLabel[dog.race] : "Raça não informada"}
              </Text>

              <Text
                style={[
                  styles.dogRationText,
                  !plan && styles.dogRationTextEmpty,
                  rationDeleted && styles.dogRationTextDeleted,
                ]}
                numberOfLines={1}
              >
                {rationDisplay}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={onEditPlan}
              activeOpacity={0.7}
            >
              <MaterialDesignIcons
                name="pencil-outline"
                size={18}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* RESTRIÇÃO ALIMENTAR (SE HOUVER) */}
          {plan?.dietaryRestriction ? (
            <View style={styles.restrictionBanner}>
              <MaterialDesignIcons
                name="alert-circle-outline"
                size={13}
                color="#DC2626"
              />
              <Text style={styles.restrictionText} numberOfLines={1}>
                Restrição: {plan.dietaryRestriction}
              </Text>
            </View>
          ) : null}

          {/* CONTROLE DE AJUSTE RÁPIDO DE QUANTIDADE POR REFEIÇÃO */}
          <View style={styles.stepperSection}>
            <View style={styles.stepperLabelBox}>
              <Text style={styles.stepperLabel}>Gramas por Refeição</Text>
              <Text style={styles.stepperSubLabel}>
                {plan?.mealTypes?.length
                  ? `${plan.mealTypes.length} refeições/dia (${(
                      (currentQuantity * plan.mealTypes.length) /
                      1000
                    ).toFixed(2)} kg/dia)`
                  : "Ajuste rápido"}
              </Text>
            </View>

            <View style={styles.stepperControls}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => onAdjustQuantity(-10)}
                activeOpacity={0.7}
              >
                <MaterialDesignIcons
                  name="minus"
                  size={16}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>

              <View style={styles.stepperDisplay}>
                <Text style={styles.stepperValueText}>
                  {currentQuantity} <Text style={styles.stepperUnitText}>g</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.stepperBtn, styles.stepperBtnPlus]}
                onPress={() => onAdjustQuantity(10)}
                activeOpacity={0.7}
              >
                <MaterialDesignIcons
                  name="plus"
                  size={16}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: 4,
  },
  cardContent: {
    padding: 14,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${theme.colors.primary}15`,
  },
  dogHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  nameAndBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dogNameText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  kennelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  kennelBadgeIn: {
    backgroundColor: "#DCFCE7",
  },
  kennelBadgeOut: {
    backgroundColor: "#FEE2E2",
  },
  kennelBadgeText: {
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  kennelBadgeTextIn: {
    color: "#166534",
  },
  kennelBadgeTextOut: {
    color: "#991B1B",
  },
  dogBreedText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.secondary,
  },
  dogRationText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
  },
  dogRationTextEmpty: {
    color: "#9CA3AF",
    fontFamily: theme.typography.fontFamily.regular,
  },
  dogRationTextDeleted: {
    color: "#DC2626",
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  editButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F4F6F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  restrictionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  restrictionText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: "#DC2626",
    flex: 1,
  },
  stepperSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  stepperLabelBox: {
    gap: 2,
  },
  stepperLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  stepperSubLabel: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.secondary,
  },
  stepperControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnPlus: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stepperDisplay: {
    minWidth: 50,
    alignItems: "center",
  },
  stepperValueText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  stepperUnitText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.secondary,
  },
});
