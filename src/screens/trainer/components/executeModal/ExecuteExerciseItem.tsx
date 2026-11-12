import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { theme } from "../../../../../theme/theme";
import { CheckBox } from "../../../../shared/components/CheckBoxComponent";

interface ExecuteExerciseItemProps {
  itemKey: string;
  label: string;
  isChecked: boolean;
  onToggle: (key: string, value: boolean) => void;
}

export const ExecuteExerciseItem: React.FC<ExecuteExerciseItemProps> = ({
  itemKey,
  label,
  isChecked,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.exerciseRow,
        isChecked && styles.exerciseRowChecked,
      ]}
      activeOpacity={0.75}
      onPress={() => onToggle(itemKey, !isChecked)}
    >
      <View pointerEvents="none">
        <CheckBox
          value={isChecked}
          onChangeChecked={(val) => onToggle(itemKey, val)}
          label={label}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  exerciseRow: {
    backgroundColor: "#F9FAFB",
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  exerciseRowChecked: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
});

