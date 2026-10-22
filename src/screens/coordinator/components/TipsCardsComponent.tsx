import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect, useNavigation, NavigationProp } from "@react-navigation/native";
import { Card } from "../../../shared/components/CardComponent";
import { theme } from "../../../../theme/theme";
import { RootStackParamList } from "../../../routes";
import { SCREENS } from "../../../consts/screens";

import { getUsersCountService, getDogsCountService } from "../../../service/api"; 

export const TipsCardsComponent = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [userCount, setUserCount] = useState<number>(0);
  const [dogCount, setDogCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchCounts = async () => {
        try {
          setIsLoading(true);

          const [usersResult, dogsResult] = await Promise.allSettled([
            getUsersCountService(),
            getDogsCountService(),
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

        <View style={styles.cardWrapper}>
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  Outro
                </Text>
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.placeholderText}>—</Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.cardWrapper}>
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  Outro
                </Text>
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.placeholderText}>—</Text>
              </View>
            </View>
          </Card>
        </View>
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
  placeholderText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#aaa",
  },
  loader: {
    marginVertical: 4,
  },
});