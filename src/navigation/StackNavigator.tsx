import { useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { theme } from "../../theme/theme";
import { AuthContext } from "../service/authContext";
import { SCREENS } from "../consts/screens";
import { EUserRoles } from "../types/userRoles";
import { IDogResponse } from "../types/Dog";
import { IRationResponse } from "../types/Ration";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { CreateDogsScreen } from "../screens/shared/CreateDogScreen";
import { DogDetailsScreen } from "../screens/shared/DogDetailsScreen";
import VeterinarianHomeScreen from "../screens/veterinarian/VeterinarianHomeScreen";
import { EventsAgendaScreen } from "../screens/veterinarian/EventsAgendaScreen";
import { MedicationManagementScreen } from "../screens/veterinarian/MedicationManagementScreen";
import { NotificationsScreen } from "../screens/shared/NotificationsScreen";
import { CreateRationsScreen } from "../screens/coordinator/CreateRationsScreen";
import { RationScreen } from "../screens/coordinator/RationScreen";
import { RationDetailsScreen } from "../screens/coordinator/RationDetailsScreen";
import { CollaboratorsListScreen } from "../screens/coordinator/CollaboratorsListScreen";
import {
  CollaboratorTabs,
  CoordinatorTabs,
  TrainerTabs,
  VeterinarianTabs,
} from "./TabNavigator";

export type RootStackParamList = {
  MAIN_TABS: undefined;
  COORDINATOR_TABS: undefined;
  TRAINER_TABS: undefined;
  COLLABORATOR_TABS: undefined;
  [SCREENS.LOGIN]: undefined;
  [SCREENS.VETERINARIAN_HOME]: undefined;
  [SCREENS.DOG_SCREEN]: undefined;
  [SCREENS.CREATE_DOG_SCREEN]: undefined;
  [SCREENS.DOG_DETAILS_SCREEN]: { dog: IDogResponse };
  [SCREENS.EVENTS_AGENDA]: undefined;
  [SCREENS.MEDICATION_MANAGEMENT_SCREEN]: undefined;
  [SCREENS.COORDINATOR_HOME]: undefined;
  [SCREENS.CREATE_RATIONS_SCREEN]: undefined;
  [SCREENS.RATIONS_SCREEN]: undefined;
  [SCREENS.RATION_DETAILS_SCREEN]: { ration: IRationResponse };
  [SCREENS.COLLABORATORS_LIST_SCREEN]: undefined;
  [SCREENS.NOTIFICATIONS_SCREEN]: undefined;
  [SCREENS.PROFILE_SCREEN]: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function MyStack() {
  const { isLoading, userToken, roles } = useContext(AuthContext);

  if (isLoading) return <SplashScreen />;

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
              <Stack.Screen name="MAIN_TABS" component={VeterinarianTabs} />
              <Stack.Screen name={SCREENS.EVENTS_AGENDA} component={EventsAgendaScreen} options={{ headerShown: true, headerTitle: "Eventos & Agenda" }} />
              <Stack.Screen name={SCREENS.MEDICATION_MANAGEMENT_SCREEN} component={MedicationManagementScreen} options={{ headerShown: true, headerTitle: "Gestão de Medicamentos" }} />
              <Stack.Screen name={SCREENS.VETERINARIAN_HOME} component={VeterinarianHomeScreen} options={{ headerShown: true, headerTitle: "Agenda Veterinária" }} />
            </>
          )}
          {roles.includes(EUserRoles.ROLE_COORDINATOR) && (
            <>
              <Stack.Screen name="COORDINATOR_TABS" component={CoordinatorTabs} />
              <Stack.Screen name={SCREENS.RATIONS_SCREEN} component={RationScreen} options={{ headerShown: true, headerTitle: "Rações" }} />
              <Stack.Screen name={SCREENS.CREATE_RATIONS_SCREEN} component={CreateRationsScreen} options={{ headerShown: true, headerTitle: "Adicionar Ração" }} />
              <Stack.Screen name={SCREENS.RATION_DETAILS_SCREEN} component={RationDetailsScreen} options={{ headerShown: true, headerTitle: "Detalhes da Ração" }} />
              <Stack.Screen name={SCREENS.COLLABORATORS_LIST_SCREEN} component={CollaboratorsListScreen} options={{ headerShown: true, headerTitle: "Colaboradores Ativos" }} />
            </>
          )}
          {roles.includes(EUserRoles.ROLE_TRAINER) && (
            <Stack.Screen name="TRAINER_TABS" component={TrainerTabs} />
          )}
          {roles.includes(EUserRoles.ROLE_COLLABORATOR) && (
            <Stack.Screen name="COLLABORATOR_TABS" component={CollaboratorTabs} />
          )}
          <Stack.Screen name={SCREENS.CREATE_DOG_SCREEN} component={CreateDogsScreen} options={{ headerShown: true, headerTitle: "Cadastrar Novo Cão" }} />
          <Stack.Screen name={SCREENS.DOG_DETAILS_SCREEN} component={DogDetailsScreen} options={{ headerShown: true, headerTitle: "Informações do Cão" }} />
        </>
      )}
    </Stack.Navigator>
  );
}
