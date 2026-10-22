import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { formatDogRace, IDogResponse } from "../../../../types/Dog";
import { getDogImageSource } from "../../../../utils/dogAvatar";
import { theme } from "../../../../../theme/theme";

export { getDogImageSource };

interface SelectedDogBannerProps {
  dog?: IDogResponse | null;
}

export const SelectedDogBanner: React.FC<SelectedDogBannerProps> = React.memo(
  ({ dog }) => {
    if (!dog) return null;
    const imgSrc = getDogImageSource(dog);

    return (
      <View style={styles.selectedDogSubBanner}>
        <Image source={imgSrc} style={styles.selectedDogSubAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.selectedDogSubName}>{dog.name}</Text>
          <Text style={styles.selectedDogSubBreed}>
            {formatDogRace(dog.race)}
            {dog.sex ? ` • ${dog.sex === "M" ? "Macho" : "Fêmea"}` : ""}
          </Text>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  selectedDogSubBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#99F6E4",
    borderRadius: theme.borderRadius.md,
    padding: 10,
    marginTop: 6,
  },
  selectedDogSubAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#CCFBF1",
  },
  selectedDogSubName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: "#0F766E",
  },
  selectedDogSubBreed: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#115E59",
    marginTop: 2,
  },
});
