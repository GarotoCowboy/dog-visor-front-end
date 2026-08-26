import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";

import { theme } from "../../theme/theme";
import { SCREENS } from "../consts/screens";
import VeterinarianHomeScreen from "../screens/veterinarian/VeterinarianHomeScreen";
import { DogsScreen } from "../screens/shared/DogsScreen";
import { CoordinatorHomeScreen } from "../screens/coordinator/CoordinatorHomeScreen";
import { ProfileScreen } from "../screens/shared/ProfileScreen";
import { NotificationsScreen } from "../screens/shared/NotificationsScreen";

const Tab = createBottomTabNavigator();

const tabScreenOptions = ({ route }: { route: { name: string } }) => ({
  tabBarActiveBackgroundColor: theme.colors.accent,
  tabBarStyle: { backgroundColor: "#FFFFFF" },
  tabBarLabel: ({ focused }: { focused: boolean }) => {
    const labels: Record<string, string> = {
      [SCREENS.VETERINARIAN_HOME]: "Início",
      [SCREENS.COORDINATOR_HOME]: "Início",
      [SCREENS.NOTIFICATIONS_SCREEN]: "Avisos",
      [SCREENS.DOG_SCREEN]: "Cães",
      [SCREENS.PROFILE_SCREEN]: "Perfil",
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
        {labels[route.name] || route.name}
      </Text>
    );
  },
  tabBarIcon: ({ focused, size }: { focused: boolean; size: number }) => {
    let iconName = "house";
    if (route.name === SCREENS.DOG_SCREEN) {
      iconName = "dog";
    } else if (route.name === SCREENS.NOTIFICATIONS_SCREEN) {
      iconName = "bell";
    } else if (route.name === SCREENS.PROFILE_SCREEN) {
      iconName = "user";
    }

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
        name={SCREENS.NOTIFICATIONS_SCREEN}
        component={NotificationsScreen}
        options={{ headerTitle: "Mural de Avisos & Tarefas" }}
      />
      <Tab.Screen
        name={SCREENS.DOG_SCREEN}
        component={DogsScreen}
        options={{ headerTitle: "Meus Cães" }}
      />
      <Tab.Screen
        name={SCREENS.PROFILE_SCREEN}
        component={ProfileScreen}
        options={{ headerTitle: "Meu Perfil" }}
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
        name={SCREENS.NOTIFICATIONS_SCREEN}
        component={NotificationsScreen}
        options={{ headerTitle: "Mural de Avisos & Tarefas" }}
      />
      <Tab.Screen
        name={SCREENS.DOG_SCREEN}
        component={DogsScreen}
        options={{ headerTitle: "Meus Cães" }}
      />
      <Tab.Screen
        name={SCREENS.PROFILE_SCREEN}
        component={ProfileScreen}
        options={{ headerTitle: "Meu Perfil" }}
      />
    </Tab.Navigator>
  );
}

export function TrainerTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name={SCREENS.NOTIFICATIONS_SCREEN}
        component={NotificationsScreen}
        options={{ headerTitle: "Mural de Avisos & Tarefas" }}
      />
      <Tab.Screen
        name={SCREENS.DOG_SCREEN}
        component={DogsScreen}
        options={{ headerTitle: "Meus Cães" }}
      />
      <Tab.Screen
        name={SCREENS.PROFILE_SCREEN}
        component={ProfileScreen}
        options={{ headerTitle: "Meu Perfil" }}
      />
    </Tab.Navigator>
  );
}

export function CollaboratorTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name={SCREENS.NOTIFICATIONS_SCREEN}
        component={NotificationsScreen}
        options={{ headerTitle: "Mural de Avisos & Tarefas" }}
      />
      <Tab.Screen
        name={SCREENS.DOG_SCREEN}
        component={DogsScreen}
        options={{ headerTitle: "Meus Cães" }}
      />
      <Tab.Screen
        name={SCREENS.PROFILE_SCREEN}
        component={ProfileScreen}
        options={{ headerTitle: "Meu Perfil" }}
      />
    </Tab.Navigator>
  );
}
