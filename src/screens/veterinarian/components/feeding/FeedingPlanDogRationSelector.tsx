import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../../theme/theme";
import { formatDogRace, IDogResponse } from "../../../../types/Dog";
import { IRationResponse, RationTypeLabel } from "../../../../types/Ration";
import { getDogImageSource } from "../../../../utils/dogAvatar";

interface FeedingPlanDogRationSelectorProps {
  selectedDog: IDogResponse | null;
  onOpenDogModal: () => void;
  selectedRation: IRationResponse | null;
  onOpenRationModal: () => void;
}

export const FeedingPlanDogRationSelector: React.FC<
  FeedingPlanDogRationSelectorProps
> = ({
  selectedDog,
  onOpenDogModal,
  selectedRation,
  onOpenRationModal,
}) => {
  return (
    <>
      {/* 1. SELEÇÃO DO CÃO */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Cão Beneficiário *</Text>
        <TouchableOpacity
          style={[
            styles.selectorButton,
            selectedDog ? styles.selectorButtonSelected : null,
          ]}
          onPress={onOpenDogModal}
          activeOpacity={0.7}
        >
          {selectedDog ? (
            <View style={styles.selectorSelectedRow}>
              <Image
                source={getDogImageSource(selectedDog)}
                style={styles.dogAvatar}
              />
              <View style={styles.dogInfoCol}>
                <View style={styles.dogNameRow}>
                  <Text style={styles.selectorSelectedText}>{selectedDog.name}</Text>
                  <View style={styles.kennelBadgeIn}>
                    <Text style={styles.kennelBadgeTextIn}>No Canil</Text>
                  </View>
                </View>
                <Text style={styles.dogBreedText}>
                  {selectedDog.race ? formatDogRace(selectedDog.race) : "Raça não informada"}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.selectorPlaceholder}>Selecione o cão...</Text>
          )}
          <FontAwesomeFreeSolid
            name="chevron-down"
            size={12}
            color={theme.colors.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* 2. SELEÇÃO DA RAÇÃO */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Ração Prescrita *</Text>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={onOpenRationModal}
          activeOpacity={0.7}
        >
          {selectedRation ? (
            <View style={styles.selectorSelectedRow}>
              <MaterialDesignIcons
                name="food-drumstick"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.selectorSelectedText}>
                {selectedRation.name} (
                {selectedRation.rationType
                  ? RationTypeLabel[selectedRation.rationType]
                  : "Normal"}
                )
              </Text>
            </View>
          ) : (
            <Text style={styles.selectorPlaceholder}>Selecione a ração...</Text>
          )}
          <FontAwesomeFreeSolid
            name="chevron-down"
            size={12}
            color={theme.colors.secondary}
          />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  fieldSection: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectorButtonSelected: {
    borderColor: "#2E6B65",
    backgroundColor: "#F8FAFC",
  },
  selectorSelectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dogAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  dogInfoCol: {
    flex: 1,
    gap: 2,
  },
  dogNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectorSelectedText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  dogBreedText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: "#6B7280",
  },
  selectorPlaceholder: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: "#9CA3AF",
  },
  kennelBadgeIn: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  kennelBadgeTextIn: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#059669",
  },
});
