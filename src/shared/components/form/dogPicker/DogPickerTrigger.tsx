import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { formatDogRace, IDogResponse } from "../../../../types/Dog";
import { getDogImageSource } from "../../../../utils/dogAvatar";
import { theme } from "../../../../../theme/theme";

interface DogPickerTriggerProps {
  label?: string;
  placeholder?: string;
  activeDog: IDogResponse | null;
  loadingDogs: boolean;
  disabled: boolean;
  required: boolean;
  error?: string;
  onPress: () => void;
}

export const DogPickerTrigger: React.FC<DogPickerTriggerProps> = ({
  label,
  placeholder,
  activeDog,
  loadingDogs,
  disabled,
  required,
  error,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredAsterisk}> *</Text>}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.triggerContainer,
          activeDog ? styles.triggerContainerSelected : styles.triggerContainerEmpty,
          error ? styles.triggerError : null,
          disabled ? styles.triggerDisabled : null,
        ]}
        onPress={onPress}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
      >
        {activeDog ? (
          <View style={styles.selectedRow}>
            <Image
              source={getDogImageSource(activeDog)}
              style={styles.selectedAvatar}
            />
            <View style={styles.selectedInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.selectedName} numberOfLines={1}>
                  {activeDog.name}
                </Text>
                {activeDog.sex && (
                  <View
                    style={[
                      styles.sexBadge,
                      activeDog.sex === "F"
                        ? styles.sexBadgeFemale
                        : styles.sexBadgeMale,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sexBadgeText,
                        activeDog.sex === "F"
                          ? styles.sexBadgeTextFemale
                          : styles.sexBadgeTextMale,
                      ]}
                    >
                      {activeDog.sex === "F" ? "Fêmea" : "Macho"}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.selectedBreed} numberOfLines={1}>
                {activeDog.race ? formatDogRace(activeDog.race) : "Raça não informada"}
              </Text>
            </View>

            <View style={styles.changeActionBadge}>
              <Text style={styles.changeActionText}>Trocar</Text>
              <MaterialDesignIcons name="chevron-right" size={16} color="#4B5563" />
            </View>
          </View>
        ) : (
          <View style={styles.placeholderRow}>
            <View style={styles.placeholderIconBox}>
              <MaterialDesignIcons name="dog" size={20} color="#9CA3AF" />
            </View>
            <Text style={styles.placeholderText} numberOfLines={1}>
              {loadingDogs ? "Carregando cães..." : placeholder}
            </Text>
            <MaterialDesignIcons
              name="chevron-down"
              size={20}
              color="#9CA3AF"
              style={styles.chevronIcon}
            />
          </View>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  requiredAsterisk: {
    color: "#EF4444",
    fontWeight: "bold",
    fontSize: 14,
  },
  triggerContainer: {
    minHeight: 52,
    borderWidth: 1.5,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  triggerContainerEmpty: {
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  triggerContainerSelected: {
    borderColor: "#2E6B65",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  triggerError: {
    borderColor: "#EF4444",
  },
  triggerDisabled: {
    opacity: 0.6,
    backgroundColor: "#F3F4F6",
  },
  placeholderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  placeholderIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: theme.typography.fontFamily.regular,
  },
  chevronIcon: {
    marginLeft: 4,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  selectedInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  selectedName: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  selectedBreed: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: "#6B7280",
  },
  changeActionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeActionText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: "#374151",
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
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 2,
  },
});

