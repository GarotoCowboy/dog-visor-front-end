import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../theme/theme";
import { Card } from "../../../shared/components/CardComponent";
import { femaleDogIcons, maleDogIcons } from "../../../consts/dogIcons";
import {
  DogRaceLabel,
  DogStatusColor,
  DogStatusLabel,
  EDOG_STATUS,
  IDogResponse,
} from "../../../types/Dog";
import {
  calculateAge,
  getDogLifeStageLabel,
} from "../../../utils/calculateAge";

const avatarMap = [...femaleDogIcons, ...maleDogIcons].reduce(
  (acc, item) => {
    acc[item.key] = item.image;
    return acc;
  },
  {} as Record<string, any>,
);

export const isDogInKennel = (dog: IDogResponse) => {
  if (
    dog.status === EDOG_STATUS.DOADO ||
    dog.status === EDOG_STATUS.FALECIDO ||
    dog.status === EDOG_STATUS.DOACAO ||
    dog.status === EDOG_STATUS.CEDIDO
  ) {
    return false;
  }
  if (dog.onKennel !== undefined && dog.onKennel !== null) {
    return Boolean(dog.onKennel);
  }
  if (dog.on_kennel !== undefined && dog.on_kennel !== null) {
    return Boolean(dog.on_kennel);
  }
  if (dog.inKennel !== undefined && dog.inKennel !== null) {
    return Boolean(dog.inKennel);
  }
  return true;
};

interface DogListItemCardProps {
  dog: IDogResponse;
  onPress: (dog: IDogResponse) => void;
}

export const DogListItemCard: React.FC<DogListItemCardProps> = ({
  dog,
  onPress,
}) => {
  const imageSource = avatarMap[dog.avatarKey];
  const inKennel = isDogInKennel(dog);

  return (
    <TouchableOpacity onPress={() => onPress(dog)}>
      <View style={styles.cardContainer}>
        <Card>
          <View style={styles.rowContainer}>
            <View style={styles.leftColumn}>
              {imageSource ? (
                <Image source={imageSource} style={styles.avatarImage} />
              ) : (
                <View
                  style={[styles.avatarImage, styles.placeholderImage]}
                />
              )}
            </View>

            <View style={styles.rightColumn}>
              <View style={styles.nameAndStatusRow}>
                <Text style={styles.dogNameText} numberOfLines={1}>
                  {dog.name}
                </Text>

                <View style={styles.badgesRow}>
                  <View
                    style={[
                      styles.dogStatusContainer,
                      dog.status && DogStatusColor[dog.status]
                        ? {
                            backgroundColor: DogStatusColor[dog.status].bg,
                          }
                        : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dogStatusText,
                        dog.status && DogStatusColor[dog.status]
                          ? {
                              color: DogStatusColor[dog.status].text,
                            }
                          : null,
                      ]}
                    >
                      {dog.status
                        ? DogStatusLabel[dog.status]
                        : "Não informado"}
                    </Text>
                  </View>

                  {/* INDICADOR DE CANIL */}
                  <View
                    style={[
                      styles.kennelBadge,
                      inKennel
                        ? styles.kennelBadgeIn
                        : styles.kennelBadgeOut,
                    ]}
                  >
                    <MaterialDesignIcons
                      name={inKennel ? "home" : "home-off"}
                      size={13}
                      color={inKennel ? "#059669" : "#6B7280"}
                    />
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
              </View>

              <Text style={styles.dogDetailsText}>
                {dog.race ? DogRaceLabel[dog.race] : "Não informado"}
              </Text>

              <View style={{ ...styles.rowContainer, gap: 12 }}>
                <Text style={styles.dogDetailsText}>
                  {calculateAge(dog.dateOfBirth)} (
                  {getDogLifeStageLabel(dog.dateOfBirth)})
                </Text>

                <Text style={styles.dogDetailsText}>
                  {dog.sex === "M" ? "Macho" : "Fêmea"}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 8,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftColumn: {
    justifyContent: "center",
    alignItems: "center",
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "center",
  },
  nameAndStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    flexWrap: "wrap",
    gap: 6,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  kennelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  kennelBadgeIn: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  kennelBadgeOut: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  kennelBadgeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
  },
  kennelBadgeTextIn: {
    color: "#059669",
  },
  kennelBadgeTextOut: {
    color: "#6B7280",
  },
  dogNameText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: "bold",
    flexShrink: 1,
  },
  dogStatusContainer: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    ...theme.shadows.sm,
  },
  dogStatusContainerAlert: {
    backgroundColor: theme.colors.alert,
  },
  dogStatusText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
  dogDetailsText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: 2,
  },
  avatarImage: {
    width: 75,
    height: 75,
    borderRadius: theme.borderRadius.full,
  },
  placeholderImage: {
    backgroundColor: "#ccc",
  },
});
