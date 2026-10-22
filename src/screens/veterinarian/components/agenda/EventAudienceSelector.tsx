import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { theme } from "../../../../../theme/theme";
import { AudienceType, AudienceTypeLabel } from "../../../../types/Notification";

interface EventAudienceSelectorProps {
  selectedAudience: AudienceType;
  onSelectAudience: (audience: AudienceType) => void;
}

export const EventAudienceSelector: React.FC<EventAudienceSelectorProps> = ({
  selectedAudience,
  onSelectAudience,
}) => {
  return (
    <View style={styles.formSection}>
      <Text style={styles.formSectionLabel}>
        Quem pode receber o evento? *
      </Text>
      <View style={styles.chipsWrapContainer}>
        {Object.values(AudienceType).map((aud) => {
          const isSelected = selectedAudience === aud;
          return (
            <TouchableOpacity
              key={aud}
              style={[
                styles.formChip,
                isSelected && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => onSelectAudience(aud)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.formChipText,
                  isSelected && styles.formChipTextSelected,
                ]}
              >
                {AudienceTypeLabel[aud]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formSection: {
    gap: 8,
  },
  formSectionLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  chipsWrapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  formChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: theme.colors.white,
  },
  formChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  formChipTextSelected: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
