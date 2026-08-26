import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

import { Card } from "../../shared/components/CardComponent";
import { Button } from "../../shared/components/ButtonComponent";
import { SCREENS } from "../../consts/screens";
import { RootStackParamList } from "../../routes";
import { theme } from "../../../theme/theme";

export const VeterinarianHomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleToEventsAgendaScreen = () => {
    navigation.navigate(SCREENS.EVENTS_AGENDA);
  };

  const handleToMedicationManagement = () => {
    navigation.navigate(SCREENS.MEDICATION_MANAGEMENT_SCREEN);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sectionTitle}>Agenda Veterinária</Text>

      <Card>
        <View style={styles.buttonsContainer}>
          {/* 1. EVENTOS */}
          <Button
            text="Eventos"
            leftIcon={
              <FontAwesomeFreeSolid
                name="calendar-days"
                size={theme.typography.fontSize.base}
                color={theme.colors.white}
              />
            }
            onPress={handleToEventsAgendaScreen}
          />

          {/* 2. GESTÃO DE MEDICAMENTO */}
          <Button
            text="Gestão de Medicamento"
            variant="outline"
            leftIcon={
              <FontAwesomeFreeSolid
                name="pills"
                size={theme.typography.fontSize.base}
                color={theme.colors.primary}
              />
            }
            onPress={handleToMedicationManagement}
          />

          {/* 3. GESTÃO DE ALIMENTAÇÃO */}
          <Button
            text="Gestão de Alimentação"
            variant="outline"
            leftIcon={
              <FontAwesomeFreeSolid
                name="bowl-food"
                size={theme.typography.fontSize.base}
                color={theme.colors.primary}
              />
            }
            onPress={() => {}}
          />
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
    marginTop: 4,
  },
  buttonsContainer: {
    gap: 12,
    paddingVertical: 4,
  },
});

export default VeterinarianHomeScreen;