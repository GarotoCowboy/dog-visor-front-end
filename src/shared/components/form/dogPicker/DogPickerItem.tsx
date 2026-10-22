import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { formatDogRace, IDogResponse } from "../../../../types/Dog";
import { getDogImageSource } from "../../../../utils/dogAvatar";
import { theme } from "../../../../../theme/theme";

interface DogPickerItemProps {
  dog: IDogResponse;
  isSelected: boolean;
  onSelect: (dog: IDogResponse) => void;
  isDogDisabled?: (dog: IDogResponse) => { disabled: boolean; reason?: string };
}

export const DogPickerItem: React.FC<DogPickerItemProps> = ({
  dog,
  isSelected,
  onSelect,
  isDogDisabled,
}) => {
  const disableCheck = isDogDisabled ? isDogDisabled(dog) : { disabled: false };
  const isItemDisabled = disableCheck.disabled;

  return (
    <TouchableOpacity
      style={[
        styles.dogItemRow,
        isSelected && styles.dogItemRowSelected,
        isItemDisabled && styles.dogItemRowDisabled,
      ]}
      onPress={() => onSelect(dog)}
      disabled={isItemDisabled}
      activeOpacity={0.7}
    >
      <Image source={getDogImageSource(dog)} style={styles.itemAvatar} />

      <View style={styles.itemInfo}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.itemDogName,
              isSelected && styles.itemDogNameSelected,
              isItemDisabled && styles.itemDogNameDisabled,
            ]}
            numberOfLines={1}
          >
            {dog.name}
          </Text>
          {dog.sex && (
            <View
              style={[
                styles.sexBadge,
                dog.sex === "F" ? styles.sexBadgeFemale : styles.sexBadgeMale,
              ]}
            >
              <Text
                style={[
                  styles.sexBadgeText,
                  dog.sex === "F" ? styles.sexBadgeTextFemale : styles.sexBadgeTextMale,
                ]}
              >
                {dog.sex === "F" ? "F" : "M"}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.itemDogBreed} numberOfLines={1}>
          {dog.race ? formatDogRace(dog.race) : "Raça não informada"}
        </Text>
        {isItemDisabled && disableCheck.reason && (
          <Text style={styles.disabledReasonText} numberOfLines={1}>
            {disableCheck.reason}
          </Text>
        )}
      </View>

      <View style={styles.itemRightAction}>
        {isSelected ? (
          <View style={styles.checkedCircle}>
            <MaterialDesignIcons name="check" size={16} color="#FFFFFF" />
          </View>
        ) : isItemDisabled ? (
          <MaterialDesignIcons name="cancel" size={18} color="#9CA3AF" />
        ) : (
          <MaterialDesignIcons name="chevron-right" size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dogItemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  dogItemRowSelected: {
    borderColor: "#2E6B65",
    backgroundColor: "#F0FDF4",
  },
  dogItemRowDisabled: {
    opacity: 0.5,
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  itemAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  itemInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemDogName: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  itemDogNameSelected: {
    color: "#166534",
  },
  itemDogNameDisabled: {
    color: "#9CA3AF",
  },
  itemDogBreed: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: "#6B7280",
  },
  disabledReasonText: {
    fontSize: 11,
    color: "#DC2626",
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: 2,
  },
  itemRightAction: {
    paddingLeft: 4,
  },
  checkedCircle: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#2E6B65",
    alignItems: "center",
    justifyContent: "center",
  },
  sexBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  sexBadgeFemale: {
    backgroundColor: "#FCE7F3",
  },
  sexBadgeMale: {
    backgroundColor: "#E0F2FE",
  },
  sexBadgeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  sexBadgeTextFemale: {
    color: "#BE185D",
  },
  sexBadgeTextMale: {
    color: "#0369A1",
  },
});

