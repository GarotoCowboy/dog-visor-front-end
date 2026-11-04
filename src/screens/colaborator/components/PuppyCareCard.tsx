import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../theme/theme";
import { formatDogRace, IDogResponse } from "../../../types/Dog";
import { formatPuppyWeeksAge } from "../../../utils/calculateAge";
import { getDogImageSource } from "../../../utils/dogAvatar";

interface PuppyCareCardProps {
  dog: IDogResponse;
  currentWeight?: number | null;
  onPressWeighing: (dog: IDogResponse) => void;
  onPressMassage: (dog: IDogResponse) => void;
  onPressDogDetails?: (dog: IDogResponse) => void;
}

export const PuppyCareCard: React.FC<PuppyCareCardProps> = ({
  dog,
  currentWeight,
  onPressWeighing,
  onPressMassage,
  onPressDogDetails,
}) => {
  const imageSource = getDogImageSource(dog);
  const weeksLabel = formatPuppyWeeksAge(dog.dateOfBirth);
  const breedLabel = formatDogRace(dog.race);
  const formattedWeight =
    currentWeight !== undefined && currentWeight !== null
      ? `${Number(currentWeight).toFixed(1)} kg`
      : "Sem registro";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!onPressDogDetails}
          onPress={() => onPressDogDetails && onPressDogDetails(dog)}
        >
          <Image source={imageSource} style={styles.avatar} />
        </TouchableOpacity>

        <View style={styles.infoColumn}>
          <Text style={styles.dogName} numberOfLines={1}>
            {dog.name}
          </Text>

          <View style={styles.subInfoRow}>
            <MaterialDesignIcons
              name="clock-outline"
              size={13}
              color="#9CA3AF"
            />
            <Text style={styles.subInfoText} numberOfLines={1}>
              {weeksLabel} • {breedLabel}
            </Text>
          </View>

          <View style={styles.weightBar}>
            <Text style={styles.weightLabel}>Peso atual</Text>
            <Text style={styles.weightValue}>{formattedWeight}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.weighingBtn]}
              onPress={() => onPressWeighing(dog)}
              activeOpacity={0.8}
            >
              <MaterialDesignIcons
                name="scale-balance"
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.weighingBtnText} numberOfLines={1}>
                Pesagem
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.massageBtn]}
              onPress={() => onPressMassage(dog)}
              activeOpacity={0.8}
            >
              <MaterialDesignIcons
                name="hand-back-right-outline"
                size={14}
                color="#2E6B65"
              />
              <Text style={styles.massageBtnText} numberOfLines={1}>
                Massagem
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    ...theme.shadows.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
  },
  infoColumn: {
    flex: 1,
    gap: 6,
  },
  dogName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 17,
    color: "#1F2937",
  },
  subInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  subInfoText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#8E95A2",
    flex: 1,
  },
  weightBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 2,
  },
  weightLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#6B7280",
  },
  weightValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 13,
    color: "#1F2937",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  weighingBtn: {
    backgroundColor: "#2E6B65",
    borderWidth: 1,
    borderColor: "#2E6B65",
  },
  weighingBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11.5,
    color: "#FFFFFF",
  },
  massageBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#2E6B65",
  },
  massageBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11.5,
    color: "#2E6B65",
  },
  vetBtn: {
    flex: 0.78,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.2,
    borderColor: "#F87171",
  },
  vetBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11.5,
    color: "#EF4444",
  },
});

