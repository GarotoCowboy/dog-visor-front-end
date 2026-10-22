import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import FormComponent from "../../../../shared/components/FormComponent";

interface FeedingManagementFilterRowProps {
  search: string;
  onChangeSearch: (val: string) => void;
  filterMode: "kennel" | "all";
  onChangeFilterMode: (mode: "kennel" | "all") => void;
  kennelDogsCount: number;
  allDogsCount: number;
}

export const FeedingManagementFilterRow: React.FC<
  FeedingManagementFilterRowProps
> = ({
  search,
  onChangeSearch,
  filterMode,
  onChangeFilterMode,
  kennelDogsCount,
  allDogsCount,
}) => {
  return (
    <View>
      {/* BARRA DE PESQUISA */}
      <View style={styles.searchContainer}>
        <FormComponent
          placeholder="Pesquise por nome ou raça..."
          value={search}
          onChangeText={onChangeSearch}
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
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterMode === "kennel" && styles.filterChipActive,
          ]}
          onPress={() => onChangeFilterMode("kennel")}
          activeOpacity={0.7}
        >
          <MaterialDesignIcons
            name="home-heart"
            size={16}
            color={
              filterMode === "kennel"
                ? theme.colors.white
                : theme.colors.primary
            }
          />
          <Text
            style={[
              styles.filterChipText,
              filterMode === "kennel" && styles.filterChipTextActive,
            ]}
          >
            No Canil ({kennelDogsCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filterMode === "all" && styles.filterChipActive,
          ]}
          onPress={() => onChangeFilterMode("all")}
          activeOpacity={0.7}
        >
          <MaterialDesignIcons
            name="format-list-bulleted"
            size={16}
            color={
              filterMode === "all" ? theme.colors.white : theme.colors.primary
            }
          />
          <Text
            style={[
              styles.filterChipText,
              filterMode === "all" && styles.filterChipTextActive,
            ]}
          >
            Todos com Plano ({allDogsCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* AVISO DO CANIL */}
      <View style={styles.kennelBanner}>
        <MaterialDesignIcons
          name="information-outline"
          size={16}
          color={theme.colors.primary}
        />
        <Text style={styles.kennelBannerText}>
          Exibindo apenas cães com planos alimentares ativos cadastrados.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  filterChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  filterChipTextActive: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  kennelBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: `${theme.colors.primary}12`,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  kennelBannerText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
    flex: 1,
  },
});
