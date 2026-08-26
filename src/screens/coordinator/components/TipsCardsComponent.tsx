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
      const fetchCounts = async () => {
        try {
          setIsLoading(true); 
          
          const [usersTotal, dogsTotal] = await Promise.all([
            getUsersCountService(),
            getDogsCountService()
          ]);
          
          setUserCount(usersTotal); 
          setDogCount(dogsTotal);
          
        } catch (error) {
          console.error("Erro ao buscar quantidade para os cards:", error);
        } finally {
          setIsLoading(false); 
        }
      };

      fetchCounts();
    }, [])
  );

  const handleCardPress = () => {
    navigation.navigate(SCREENS.COLLABORATORS_LIST_SCREEN);
  };

  return (
    <View>
      <View style={styles.cardContainer}>
        
        <TouchableOpacity style={styles.cardWrapper} onPress={handleCardPress} activeOpacity={0.8}>
          <Card>
            <View style={styles.cardContent}>
              <Text style={styles.title}>Colaboradores</Text>
              {isLoading ? (
                 <ActivityIndicator size="small" color={theme.colors.accent} style={styles.loader} />
              ) : (
                 <Text style={styles.countText}>{userCount}</Text>
              )}
            </View>
          </Card>
        </TouchableOpacity>

        <View style={styles.cardWrapper}>
          <Card>
            <View style={styles.cardContent}>
              <Text style={styles.title}>Cães</Text>
              {isLoading ? (
                 <ActivityIndicator size="small" color={theme.colors.accent} style={styles.loader} />
              ) : (
                 <Text style={styles.countText}>{dogCount}</Text>
              )}
            </View>
          </Card>
        </View>
        
        <View style={styles.cardWrapper}>
          <Card>
            <View style={styles.cardContent}>
              <Text style={styles.title}>Outro</Text>
            </View>
          </Card>
        </View>
        
        <View style={styles.cardWrapper}>
          <Card>
            <View style={styles.cardContent}>
              <Text style={styles.title}>Outro</Text>
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
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  countText: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
    color: "#000",
  },
  loader: {
    marginTop: 12,
    marginBottom: 4,
  }
});