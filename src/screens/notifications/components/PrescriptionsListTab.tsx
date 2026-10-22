import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../theme/theme";
import { IMedicationResponse } from "../../../types/Medication";
import { PrescriptionItemCard } from "./PrescriptionItemCard";

interface PrescriptionsListTabProps {
  filteredMedications: IMedicationResponse[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  search: string;
  parseLocalDate: (dateStr?: string) => Date | null;
  onFinish: (item: IMedicationResponse) => void;
}

export const PrescriptionsListTab: React.FC<PrescriptionsListTabProps> = ({
  filteredMedications,
  loading,
  refreshing,
  onRefresh,
  search,
  parseLocalDate,
  onFinish,
}) => {
  return (
    <>
      <View style={styles.infoSummaryRow}>
        <Text style={styles.summaryText}>
          {filteredMedications.length}{" "}
          {filteredMedications.length === 1
            ? "prescrição cadastrada"
            : "prescrições cadastradas"}
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            Carregando prescrições de medicamentos...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMedications}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <PrescriptionItemCard
              item={item}
              parseLocalDate={parseLocalDate}
              onFinish={onFinish}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialDesignIcons
                name="pill-off"
                size={54}
                color={theme.colors.secondary}
                style={{ opacity: 0.5 }}
              />
              <Text style={styles.emptyTitle}>
                Nenhum medicamento prescrito
              </Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? "Nenhum medicamento encontrado para essa busca."
                  : "Não há prescrições médicas ativas registradas no momento."}
              </Text>
            </View>
          }
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  infoSummaryRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  summaryText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.secondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 40,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.secondary,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.secondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
