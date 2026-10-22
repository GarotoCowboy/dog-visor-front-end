import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../theme/theme";
import { trainingSyncService } from "../../../service/trainingSyncService";

export const OfflineStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubOnline = trainingSyncService.subscribeOnlineStatus((online) => {
      setIsOnline(online);
    });

    const unsubSync = trainingSyncService.subscribeSync((syncing, count) => {
      setIsSyncing(syncing);
      setPendingCount(count);
    });

    return () => {
      unsubOnline();
      unsubSync();
    };
  }, []);

  const handleManualSync = () => {
    if (isOnline && !isSyncing) {
      trainingSyncService.processQueue();
    }
  };

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        !isOnline ? styles.containerOffline : styles.containerSyncing,
      ]}
    >
      <View style={styles.textRow}>
        {!isOnline ? (
          <MaterialDesignIcons
            name="cloud-off-outline"
            size={18}
            color="#D97706"
          />
        ) : isSyncing ? (
          <ActivityIndicator size="small" color="#0284C7" />
        ) : (
          <MaterialDesignIcons
            name="cloud-sync-outline"
            size={18}
            color="#0284C7"
          />
        )}

        <Text
          style={[
            styles.bannerText,
            !isOnline ? styles.bannerTextOffline : styles.bannerTextSyncing,
          ]}
        >
          {!isOnline
            ? pendingCount > 0
              ? `Modo Offline (${pendingCount} alteraç${pendingCount === 1 ? "ão pendente" : "ões pendentes"})`
              : "Modo Offline - Gravando no dispositivo"
            : isSyncing
            ? `Sincronizando ${pendingCount} registro(s)...`
            : `${pendingCount} item(ns) pronto(s) para sincronizar`}
        </Text>
      </View>

      {isOnline && pendingCount > 0 && !isSyncing && (
        <TouchableOpacity
          onPress={handleManualSync}
          style={styles.syncButton}
          activeOpacity={0.7}
        >
          <Text style={styles.syncButtonText}>Sincronizar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  containerOffline: {
    backgroundColor: "#FEF3C7",
    borderBottomColor: "#FDE68A",
  },
  containerSyncing: {
    backgroundColor: "#E0F2FE",
    borderBottomColor: "#BAE6FD",
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  bannerText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
  },
  bannerTextOffline: {
    color: "#92400E",
  },
  bannerTextSyncing: {
    color: "#0369A1",
  },
  syncButton: {
    backgroundColor: "#0284C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  syncButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: theme.colors.white,
  },
});
