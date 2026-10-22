import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import { theme } from "../../../../../theme/theme";
import FormComponent from "../../../../shared/components/FormComponent";
import { EmployeeType } from "../../../../types/User";

export type CollaboratorFilterType = "ALL" | EmployeeType;

export interface CollaboratorFilterOption {
  label: string;
  value: CollaboratorFilterType;
}

export const COLLABORATOR_FILTER_OPTIONS: CollaboratorFilterOption[] = [
  { label: "Todos", value: "ALL" },
  { label: "Veterinários", value: EmployeeType.VETERINARIAN },
  { label: "Adestradores", value: EmployeeType.TRAINER },
  { label: "Coordenadores", value: EmployeeType.COORDINATOR },
  { label: "Colaboradores", value: EmployeeType.COLLABORATOR },
];

interface CollaboratorFilterRowProps {
  search: string;
  onSearchChange: (text: string) => void;
  selectedFilter: CollaboratorFilterType;
  onSelectFilter: (filter: CollaboratorFilterType) => void;
  resultsCount: number;
}

export const CollaboratorFilterRow: React.FC<CollaboratorFilterRowProps> = ({
  search,
  onSearchChange,
  selectedFilter,
  onSelectFilter,
  resultsCount,
}) => {
  return (
    <View>
      {/* BARRA DE PESQUISA */}
      <View style={styles.searchWrapper}>
        <FormComponent
          placeholder="Buscar por nome, matrícula, email..."
          value={search}
          onChangeText={onSearchChange}
          leftIcon={
            <FontAwesomeFreeSolid
              name="magnifying-glass"
              size={theme.typography.fontSize.base}
              color={theme.colors.secondary}
            />
          }
        />
      </View>

      {/* CHIPS DE FILTRO */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={COLLABORATOR_FILTER_OPTIONS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = selectedFilter === item.value;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                ]}
                onPress={() => onSelectFilter(item.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* CONTADOR DE USUÁRIOS */}
      <View style={styles.headerInfoRow}>
        <Text style={styles.resultsCountText}>
          {resultsCount}{" "}
          {resultsCount === 1 ? "colaborador ativo" : "colaboradores ativos"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterContainer: {
    paddingVertical: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  filterChipTextSelected: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  headerInfoRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsCountText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
  },
});
