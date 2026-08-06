import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

import { theme } from "../../theme/theme";
import { SCREENS } from "../consts/screens";
import VeterinarianHomeScreen from "../screens/veterinarian/VeterinarianHomeScreen";
import { DogsScreen } from "../screens/shared/DogsScreen";
import { CoordinatorHomeScreen } from "../screens/coordinator/CoordinatorHomeScreen";

const Tab = createBottomTabNavigator();

const tabScreenOptions = ({ route }: { route: { name: string } }) => ({
  tabBarActiveBackgroundColor: theme.colors.accent,
  tabBarStyle: { backgroundColor: "#FFFFFF" },
  tabBarLabel: ({ focused }: { focused: boolean }) => {
    const labels: Record<string, string> = {
      [SCREENS.VETERINARIAN_HOME]: "Tarefas",
      [SCREENS.COORDINATOR_HOME]: "Início",
      [SCREENS.DOG_SCREEN]: "Cães",
    };

    return (
      <Text
        style={{
          color: theme.colors.primary,
          fontSize: focused ? 11 : 10,
          fontWeight: focused ? "bold" : "normal",
          fontFamily: focused
            ? theme.typography.fontFamily.bold
            : theme.typography.fontFamily.regular,
        }}
      >
        {labels[route.name]}
      </Text>
    );
  },
  tabBarIcon: ({ focused, size }: { focused: boolean; size: number }) => {
    const iconName =
      route.name === SCREENS.DOG_SCREEN
        ? "dog"
        : "house";

    return (
      <FontAwesomeFreeSolid
        name={iconName}
        size={theme.typography.fontSize.lg || size}
        color={focused ? theme.colors.primary : "gray"}
      />
    );
  },
});

export function VeterinarianTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name={SCREENS.VETERINARIAN_HOME}
        component={VeterinarianHomeScreen}
        options={{ headerTitle: "Agenda Veterinária" }}
      />
      <Tab.Screen
        name={SCREENS.DOG_SCREEN}
        component={DogsScreen}
        options={{ headerTitle: "Meus Cães" }}
      />
    </Tab.Navigator>
  );
}

export function CoordinatorTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name={SCREENS.COORDINATOR_HOME}
        component={CoordinatorHomeScreen}
        options={{ headerTitle: "Painel do Coordenador" }}
      />
      <Tab.Screen
        name={SCREENS.DOG_SCREEN}
        component={DogsScreen}
        options={{ headerTitle: "Meus Cães" }}
      />
    </Tab.Navigator>
  );
}
