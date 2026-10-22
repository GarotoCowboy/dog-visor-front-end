import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

import { theme } from "../../../theme/theme";
import { SCREENS } from "../../consts/screens";
import { OfflineStatusBanner } from "./components/OfflineStatusBanner";
import { getCachedTests, getCachedTrainings } from "../../service/trainingOfflineService";
import { trainingSyncService } from "../../service/trainingSyncService";

export const TrainerHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [trainingsCount, setTrainingsCount] = useState<number>(0);
  const [testsCount, setTestsCount] = useState<number>(0);
  const [pendingTestsCount, setPendingTestsCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const [trainings, tests] = await Promise.all([
        getCachedTrainings(),
        getCachedTests(),
      ]);
      setTrainingsCount(trainings.length);
      setTestsCount(tests.length);
      setPendingTestsCount(
        tests.filter((t) => t.status === "PENDING").length,
      );
    } catch (e) {
      console.log("Erro ao carregar dados da home do treinador:", e);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = navigation.addListener("focus", () => {
      loadData();
    });
    const unsubOnline = trainingSyncService.subscribeOnlineStatus((online) => {
      setIsOnline(online);
    });
    return () => {
      unsub();
      unsubOnline();
    };
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await trainingSyncService.processQueue();
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <OfflineStatusBanner />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Painel do Treinador</Text>
            {!isOnline && (
              <View style={styles.offlineBadge}>
                <MaterialDesignIcons
                  name="cloud-off-outline"
                  size={14}
                  color="#DC2626"
                />
                <Text style={styles.offlineBadgeText}>Offline</Text>
              </View>
            )}
          </View>
        </View>

        {/* MÉTRICAS RÁPIDAS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <MaterialDesignIcons name="dog-side" size={20} color="#2E6B65" />
            </View>
            <View>
              <Text style={styles.statNumber}>{trainingsCount}</Text>
              <Text style={styles.statLabel}>Em Treinamento</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: "#FEF3C7" }]}>
              <MaterialDesignIcons
                name="clipboard-text-clock"
                size={20}
                color="#D97706"
              />
            </View>
            <View>
              <Text style={styles.statNumber}>{pendingTestsCount}</Text>
              <Text style={styles.statLabel}>Testes Pendentes</Text>
            </View>
          </View>
        </View>

        {/* CARDS PRINCIPAIS (IMAGE 1) */}
        <View style={styles.menuContainer}>
          {/* CARD 1: GESTÃO DE TREINAMENTO */}
          <TouchableOpacity
            style={styles.mainCard}
            onPress={() => navigation.navigate(SCREENS.TRAINING_MANAGEMENT_SCREEN)}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconCircle, { backgroundColor: "#E6F4F1" }]}>
                <FontAwesomeFreeSolid name="dumbbell" size={22} color="#2E6B65" />
              </View>
              <MaterialDesignIcons
                name="chevron-right"
                size={26}
                color="#9CA3AF"
              />
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Gestão de Treinamento</Text>
              <Text style={styles.cardDescription}>
                Acompanhe o avanço das 4 etapas de treino de cão-guia, avalie exercícios de obediência e finalize etapas.
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.badge}>
                <MaterialDesignIcons
                  name="shield-check"
                  size={14}
                  color="#2E6B65"
                />
                <Text style={styles.badgeText}>Etapas 1 a 4 • Offline</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* CARD 2: GESTÃO DE TESTES */}
          <TouchableOpacity
            style={styles.mainCard}
            onPress={() => navigation.navigate(SCREENS.TESTS_MANAGEMENT_SCREEN)}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
                <MaterialDesignIcons
                  name="clipboard-check-outline"
                  size={24}
                  color="#D97706"
                />
              </View>
              <MaterialDesignIcons
                name="chevron-right"
                size={26}
                color="#9CA3AF"
              />
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Gestão de Testes</Text>
              <Text style={styles.cardDescription}>
                Aplique e consulte testes Volhard e testes Behavior dos cães com notas e parecer.
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={[styles.badge, { backgroundColor: "#FEF3C7" }]}>
                <MaterialDesignIcons
                  name="chart-bar"
                  size={14}
                  color="#B45309"
                />
                <Text style={[styles.badgeText, { color: "#B45309" }]}>
                  {testsCount} teste(s) registrado(s)
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    gap: 18,
  },
  header: {
    paddingTop: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xxl,
    color: theme.colors.text,
  },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  offlineBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#DC2626",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: "#E6F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
  },
  menuContainer: {
    gap: 16,
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 14,
    ...theme.shadows.sm,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    gap: 6,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  cardDescription: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E6F4F1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#2E6B65",
  },
});
