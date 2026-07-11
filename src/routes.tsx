import React, { useContext } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Temas e Contextos
import { theme } from "../theme/theme";
import { AuthContext } from "./service/authContext";
import { SCREENS } from "./consts/screens";
import { EUserRoles } from "./types/userRoles";
import { IDogResponse } from "./types/Dog";

// Telas
import { LoginScreen } from "./screens/auth/LoginScreen";
import VeterinarianHomeScreen from "./screens/veterinarian/VeterinarianHomeScreen";
import { SplashScreen } from "./screens/SplashScreen";
import { CreateDogsScreen } from "./screens/shared/CreateDogScreen";
import { DogsScreen } from "./screens/shared/DogsScreen";
import { DogDetailsScreen } from "./screens/shared/DogDetailsScreen";
import { EventTypeScreen } from "./screens/veterinarian/EventType";
import { ScheduleAProcedureScreen } from "./screens/veterinarian/ScheduleAProcedureScreen";
import { NormalConsultationScreen } from "./screens/veterinarian/NormalConsultation";

// Ícones
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import { CoordinatorHomeScreen } from "./screens/coordinator/CoordinatorHomeScreen";
import { CreateRationsScreen } from "./screens/coordinator/CreateRationsScreen";
import { RationScreen } from "./screens/coordinator/RationScreen";

export type RootStackParamList = {
  //Tab navigator
  MAIN_TABS: undefined;

  //Stack Navigator
  [SCREENS.LOGIN]: undefined;
  [SCREENS.VETERINARIAN_HOME]: undefined;
  [SCREENS.DOG_SCREEN]: undefined;
  [SCREENS.CREATE_DOG_SCREEN]: undefined;
  [SCREENS.DOG_DETAILS_SCREEN]: { dog: IDogResponse };
  [SCREENS.SCHEDULE_A_PROCEDURE]: undefined;
  [SCREENS.NORMAL_CONSULTATION]: undefined;
  [SCREENS.EVENT_TYPE]: undefined;

  [SCREENS.COORDINATOR_HOME] : undefined;
  [SCREENS.CREATE_RATIONS_SCREEN] : undefined;
  [SCREENS.RATIONS_SCREEN]: undefined
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

export function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveBackgroundColor: theme.colors.accent,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
        },
        tabBarLabel: ({ focused }) => {
          return (
            <Text
              style={{
                color: focused ? theme.colors.primary : theme.colors.primary,
                fontSize: focused ? 11 : 10,
                fontWeight: focused ? "bold" : "normal",
                fontFamily: focused
                  ? theme.typography.fontFamily.bold
                  : theme.typography.fontFamily.regular,
              }}
            >
              {route.name === SCREENS.VETERINARIAN_HOME ? "Tarefas" : "Cães"}
            </Text>
          );
        },
        tabBarIcon: ({ focused, size }) => {
          let iconName: React.ComponentProps<
            typeof FontAwesomeFreeSolid
          >["name"] = "circle-question";

          if (route.name === SCREENS.DOG_SCREEN) {
            iconName = "dog";
            size = theme.typography.fontSize.lg;
          } else if (route.name === SCREENS.VETERINARIAN_HOME) {
            size = theme.typography.fontSize.lg;
            iconName = "house";
          }

          const iconColor = focused ? theme.colors.primary : "gray";
          return (
            <FontAwesomeFreeSolid
              name={iconName}
              size={size}
              color={iconColor}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name={SCREENS.VETERINARIAN_HOME}
        component={VeterinarianHomeScreen}
        options={{
          headerShown: true,
          headerTitle: "Agenda Veterinária",
        }}
      />
      <Tab.Screen
        name={SCREENS.DOG_SCREEN}
        component={DogsScreen}
        options={{
          headerShown: true,
          headerTitle: "Meus Cães",
        }}
      />
    </Tab.Navigator>
  );
}

export const MyStack = () => {
  const { isLoading, userToken, roles } = useContext(AuthContext);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
      screenLayout={({ children }) => (
        <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
          {children}
        </SafeAreaView>
      )}
    >
      {userToken == null ? (
        <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen} />
      ) : (
        <>
          {roles.includes(EUserRoles.ROLE_VETERINARIAN) && (
            <>
              <Stack.Screen
                name="MAIN_TABS"
                component={MyTabs}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                options={{
                  headerShown: true,
                  headerTitle: "Tipo de Evento",
                  headerBackVisible: true,
                }}
                name={SCREENS.EVENT_TYPE}
                component={EventTypeScreen}
              />

              <Stack.Screen
                name={SCREENS.VETERINARIAN_HOME}
                component={VeterinarianHomeScreen}
                options={{
                  headerShown: true,
                  headerTitle: "Agenda Veterinária",
                }}
              />

              <Stack.Screen
                options={{
                  headerShown: true,
                  headerTitle: "Agendar Procedimento",
                }}
                name={SCREENS.SCHEDULE_A_PROCEDURE}
                component={ScheduleAProcedureScreen}
              />

              <Stack.Screen
                options={{
                  headerShown: true,
                  headerTitle: "Nova Consulta",
                  headerBackVisible: true,
                }}
                name={SCREENS.NORMAL_CONSULTATION}
                component={NormalConsultationScreen}
              />
            </>
          )}
          {roles.includes(EUserRoles.ROLE_COORDINATOR) && (
            <>
            <Stack.Screen
                options={{
                  headerShown: true,
                  headerTitle: "Painel do Coordenador",
                  headerBackVisible: false,
                }}
                name={SCREENS.COORDINATOR_HOME}
               component={CoordinatorHomeScreen}
              />
              <Stack.Screen
                options={{
                  headerShown: true,
                  headerTitle: "Rações",
                  headerBackVisible: false,
                }}
                name={SCREENS.RATIONS_SCREEN}
               component={RationScreen}
              />
                      <Stack.Screen
                options={{
                  headerShown: true,
                  headerTitle: "Adicionar Ração",
                  headerBackVisible: false,
                }}
                name={SCREENS.CREATE_RATIONS_SCREEN}
               component={CreateRationsScreen}
              />
            </>
          )}

          <Stack.Screen
            options={{
              headerShown: true,
              headerTitle: "Cadastrar Novo Cão",
              headerBackVisible: false,
            }}
            name={SCREENS.CREATE_DOG_SCREEN}
            component={CreateDogsScreen}
          />

          <Stack.Screen
            options={{
              headerShown: true,
              headerTitle: "Informações do Cão",
              headerBackVisible: true,
            }}
            name={SCREENS.DOG_DETAILS_SCREEN}
            component={DogDetailsScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
