import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { theme } from "../../../../../theme/theme";
import { MessageType, MessageTypeLabel } from "../../../../types/Notification";

interface EventTypeSelectorProps {
  selectedType: MessageType;
  onSelectType: (type: MessageType) => void;
  getMessageTypeColor: (type?: MessageType) => string;
}

export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  getMessageTypeColor,
}) => {
  return (
    <View style={styles.formSection}>
      <Text style={styles.formSectionLabel}>
        Tipo de Mensagem / Evento *
      </Text>
      <View style={styles.chipsWrapContainer}>
        {Object.values(MessageType)
          .filter((type) => type !== MessageType.MEDICATION)
          .map((type) => {
            const isSelected = selectedType === type;
            const color = getMessageTypeColor(type);
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.formChip,
                  isSelected && {
                    backgroundColor: color,
                    borderColor: color,
                  },
                ]}
                onPress={() => onSelectType(type)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.formChipText,
                    isSelected && styles.formChipTextSelected,
                  ]}
                >
                  {MessageTypeLabel[type]}
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
