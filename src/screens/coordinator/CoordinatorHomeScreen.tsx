import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Card } from "../../shared/components/CardComponent";
import { TipsCardsComponent } from "./components/TipsCardsComponent";
import { Button } from "../../shared/components/ButtonComponent";
import { RootStackParamList } from "../../routes";
import { SCREENS } from "../../consts/screens";
import { theme } from "../../../theme/theme";

export const CoordinatorHomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleToRationsScreen = () => {
    return navigation.navigate(SCREENS.RATIONS_SCREEN);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <TipsCardsComponent />

      <Text style={styles.sectionTitle}>Acesso rápido</Text>

      <Card>
        <View style={styles.buttonsContainer}>
          <Button onPress={handleToRationsScreen} variant="outline">
            <Text style={styles.buttonTitle}>Gestão de ração</Text>
            <Text style={styles.buttonSubtitle}>
              Cadastrar, editar e controlar estoque de rações
            </Text>
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    marginTop: 6,
  },
  buttonsContainer: {
    gap: 12,
  },
  buttonTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  buttonSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.7,
  },
});

export default CoordinatorHomeScreen;
