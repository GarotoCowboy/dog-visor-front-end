import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect, useNavigation, NavigationProp } from "@react-navigation/native";
import { Card } from "../../../shared/components/CardComponent";
import { theme } from "../../../../theme/theme";
import { RootStackParamList } from "../../../routes";
import { SCREENS } from "../../../consts/screens";
import { IDogReproductionResponse } from "../../../types/DogHealth";
import {
  formatLocalDateBR,
  getExpectedNextHeatDate,
  getReproductionStatusInfo,
  parseLocalDate,
} from "../../../utils/reproductionStatus";

import {
  getUsersCountService,
  getDogsCountService,
  getDogRation,
  listDogReproductionsService,
} from "../../../service/api";

interface NearestHeatInfo {
  dogsName: string;
  formattedDate: string;
  isActiveHeat?: boolean;
  isOverdue?: boolean;
}

const getNearestReproductionHeat = (
  reproductions: IDogReproductionResponse[],
): NearestHeatInfo | null => {
  if (!Array.isArray(reproductions) || reproductions.length === 0) return null;

  // Agrupar pelo cão para considerar o ciclo mais recente de cada cadela
  const latestByDog = new Map<string, IDogReproductionResponse>();
  for (const item of reproductions) {
    const key = item.dogId || item.dogsName || item.id;
    const existing = latestByDog.get(key);
    if (!existing) {
      latestByDog.set(key, item);
    } else {
      const existingDate = parseLocalDate(existing.date) ?? new Date(0);
      const currentDate = parseLocalDate(item.date) ?? new Date(0);
      if (currentDate.getTime() >= existingDate.getTime()) {
        latestByDog.set(key, item);
      }
    }
  }

  const latestRecords = Array.from(latestByDog.values());

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const candidates: Array<{
    dogsName: string;
    targetDate: Date;
    diffMs: number;
  }> = [];

  latestRecords.forEach((record) => {
    const targetDate = getExpectedNextHeatDate(record);
    if (targetDate) {
      candidates.push({
        dogsName: record.dogsName || "Cadela",
        targetDate,
        diffMs: targetDate.getTime() - today.getTime(),
      });
    }
  });

  if (candidates.length === 0) return null;

  const upcoming = candidates
    .filter((c) => c.diffMs >= 0)
    .sort((a, b) => a.diffMs - b.diffMs);

  const chosen =
    upcoming.length > 0
      ? upcoming[0]
      : candidates.sort((a, b) => b.targetDate.getTime() - a.targetDate.getTime())[0];

  return {
    dogsName: chosen.dogsName,
    formattedDate: formatLocalDateBR(chosen.targetDate),
    isOverdue: chosen.diffMs < 0,
  };
};

export const TipsCardsComponent = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [userCount, setUserCount] = useState<number>(0);
  const [dogCount, setDogCount] = useState<number>(0);
  const [totalRationKg, setTotalRationKg] = useState<number>(0);
  const [nearestHeat, setNearestHeat] = useState<NearestHeatInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchCounts = async () => {
        try {
          setIsLoading(true);

          const [usersResult, dogsResult, rationsResult, reproductionsResult] =
            await Promise.allSettled([
              getUsersCountService(),
              getDogsCountService(),
              getDogRation(),
              listDogReproductionsService(),
            ]);

          if (isMounted) {
            if (usersResult.status === "fulfilled") {
              setUserCount(usersResult.value);
            } else {
              console.error("Erro ao buscar quantidade de colaboradores:", usersResult.reason);
            }

            if (dogsResult.status === "fulfilled") {
              setDogCount(dogsResult.value);
            } else {
              console.error("Erro ao buscar quantidade de cães:", dogsResult.reason);
            }

            if (
              rationsResult.status === "fulfilled" &&
              Array.isArray(rationsResult.value)
            ) {
              const sumKg = rationsResult.value.reduce(
                (acc, item) => acc + Number(item.currentRationQuantity || 0),
                0,
              );
              setTotalRationKg(sumKg);
            } else if (rationsResult.status === "rejected") {
              console.error("Erro ao buscar total de ração:", rationsResult.reason);
            }

            if (
              reproductionsResult.status === "fulfilled" &&
              Array.isArray(reproductionsResult.value)
            ) {
              setNearestHeat(getNearestReproductionHeat(reproductionsResult.value));
            } else if (reproductionsResult.status === "rejected") {
              console.error(
                "Erro ao buscar controle reprodutivo:",
                reproductionsResult.reason,
              );
            }
          }
        } catch (error) {
          console.error("Erro ao buscar quantidade para os cards:", error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      fetchCounts();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleCardPress = () => {
    navigation.navigate(SCREENS.COLLABORATORS_LIST_SCREEN);
  };

  const handleDogsPress = () => {
    navigation.navigate(SCREENS.DOG_SCREEN as any);
  };

  const handleRationsPress = () => {
    navigation.navigate(SCREENS.RATIONS_SCREEN);
  };

  const handleReproductionPress = () => {
    navigation.navigate(SCREENS.REPRODUCTION_MANAGEMENT_SCREEN);
  };

  const formattedRationTotal = `${Number(totalRationKg.toFixed(2))} kg`;

  return (
    <View>
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.cardWrapper}
          onPress={handleCardPress}
          activeOpacity={0.8}
        >
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  Colaboradores Ativos
                </Text>
              </View>
              <View style={styles.valueContainer}>
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.accent}
                    style={styles.loader}
                  />
                ) : (
                  <Text style={styles.countText}>{userCount}</Text>
                )}
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardWrapper}
          onPress={handleDogsPress}
          activeOpacity={0.8}
        >
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  Cães
                </Text>
              </View>
              <View style={styles.valueContainer}>
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.accent}
                    style={styles.loader}
                  />
                ) : (
                  <Text style={styles.countText}>{dogCount}</Text>
                )}
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardWrapper}
          onPress={handleRationsPress}
          activeOpacity={0.8}
        >
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  Total de Ração
                </Text>
              </View>
              <View style={styles.valueContainer}>
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.accent}
                    style={styles.loader}
                  />
                ) : (
                  <Text style={styles.rationCountText} numberOfLines={1}>
                    {formattedRationTotal}
                  </Text>
                )}
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardWrapper}
          onPress={handleReproductionPress}
          activeOpacity={0.8}
        >
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  Próximo Cio
                </Text>
              </View>
              <View style={styles.valueContainer}>
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.accent}
                    style={styles.loader}
                  />
                ) : nearestHeat ? (
                  <View style={styles.heatInfoContainer}>
                    <Text
                      style={[
                        styles.heatDateText,
                        nearestHeat.isActiveHeat && { color: "#BE185D" },
                        nearestHeat.isOverdue && { color: "#B91C1C" },
                      ]}
                      numberOfLines={1}
                    >
                      {nearestHeat.formattedDate}
                    </Text>
                    <Text style={styles.heatDogNameText} numberOfLines={1}>
                      {nearestHeat.dogsName}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>—</Text>
                )}
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  cardWrapper: {
    width: "48%",
  },
  card: {
    marginVertical: 0,
    minHeight: 116,
    padding: 12,
    justifyContent: "center",
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  titleContainer: {
    minHeight: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    lineHeight: 17,
  },
  valueContainer: {
    minHeight: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
  },
  rationCountText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  heatInfoContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  heatDateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  heatDogNameText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.secondary,
  },
  placeholderText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#aaa",
  },
  loader: {
    marginVertical: 4,
  },
});
