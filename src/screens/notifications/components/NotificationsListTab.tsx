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
import { INotificationResponse, MessageType } from "../../../types/Notification";
import { NotificationFilterChips, FilterStatus } from "./NotificationFilterChips";
import { NotificationItemCard } from "./NotificationItemCard";

interface NotificationsListTabProps {
  filteredNotifications: INotificationResponse[];
  selectedFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
  filterChips: { label: string; value: FilterStatus }[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  search: string;
  onRequestFinish: (item: INotificationResponse) => void;
  getMessageTypeColor: (type?: MessageType) => string;
  parseDate: (dateStr?: string) => Date | null;
}

export const NotificationsListTab: React.FC<NotificationsListTabProps> = ({
  filteredNotifications,
  selectedFilter,
  onSelectFilter,
  filterChips,
  loading,
  refreshing,
  onRefresh,
  search,
  onRequestFinish,
  getMessageTypeColor,
  parseDate,
}) => {
  return (
    <>
      {/* CHIPS DE FILTRO */}
      <NotificationFilterChips
        selectedFilter={selectedFilter}
        onSelectFilter={onSelectFilter}
        filterChips={filterChips}
      />

      {/* CONTADOR DE AVISOS */}
      <View style={styles.infoSummaryRow}>
        <Text style={styles.summaryText}>
          {filteredNotifications.length}{" "}
          {selectedFilter === "COMPLETED"
            ? filteredNotifications.length === 1
              ? "aviso concluído"
              : "avisos concluídos"
            : filteredNotifications.length === 1
            ? "aviso pendente"
            : "avisos pendentes"}
        </Text>
      </View>

      {/* LISTA DE NOTIFICAÇÕES */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando avisos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
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
            <NotificationItemCard
              item={item}
              onRequestFinish={onRequestFinish}
              getMessageTypeColor={getMessageTypeColor}
              parseDate={parseDate}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialDesignIcons
                name={
                  selectedFilter === "COMPLETED"
                    ? "check-all"
                    : "bell-check-outline"
                }
                size={54}
                color={theme.colors.primary}
                style={{ opacity: 0.6 }}
              />
              <Text style={styles.emptyTitle}>
                {selectedFilter === "COMPLETED"
                  ? "Nenhum histórico de tarefas concluídas"
                  : "Tudo em dia!"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? "Nenhum aviso encontrado para a pesquisa informada."
                  : selectedFilter === "COMPLETED"
                  ? "As tarefas finalizadas aparecerão aqui."
                  : "Não há notificações ou tarefas pendentes no momento."}
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
