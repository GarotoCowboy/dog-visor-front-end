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
import { CreateDogsScreen } from "../screens/dogs/CreateDogScreen";
import { DogDetailsScreen } from "../screens/dogs/DogDetailsScreen";
import VeterinarianHomeScreen from "../screens/veterinarian/VeterinarianHomeScreen";
import { EventsAgendaScreen } from "../screens/veterinarian/EventsAgendaScreen";
import { EventTypeScreen } from "../screens/veterinarian/EventType";
import { NormalConsultationScreen } from "../screens/veterinarian/NormalConsultation";
import { ScheduleAProcedureScreen } from "../screens/veterinarian/ScheduleAProcedureScreen";
import { MedicationManagementScreen } from "../screens/veterinarian/MedicationManagementScreen";
import { FeedingManagementScreen } from "../screens/veterinarian/FeedingManagementScreen";
import { CreateFeedingPlanScreen } from "../screens/veterinarian/CreateFeedingPlanScreen";
import { ReproductionManagementScreen } from "../screens/veterinarian/ReproductionManagementScreen";
import { NotificationsScreen } from "../screens/notifications/NotificationsScreen";
import { CreateRationsScreen } from "../screens/coordinator/CreateRationsScreen";
import { RationScreen } from "../screens/coordinator/RationScreen";
import { RationDetailsScreen } from "../screens/coordinator/RationDetailsScreen";
import { CollaboratorsListScreen } from "../screens/coordinator/CollaboratorsListScreen";
import { CreateEmployeeScreen } from "../screens/coordinator/CreateEmployeeScreen";
import { IFeedingPlanResponse } from "../types/FeedingPlan";
import {
  CollaboratorTabs,
  CoordinatorTabs,
  TrainerTabs,
  VeterinarianTabs,
} from "./TabNavigator";
import { TrainerHomeScreen } from "../screens/trainer/TrainerHomeScreen";
import { TrainingManagementScreen } from "../screens/trainer/TrainingManagementScreen";
import { TestsManagementScreen } from "../screens/trainer/TestsManagementScreen";

export type RootStackParamList = {
  MAIN_TABS: undefined;
  COORDINATOR_TABS: undefined;
  TRAINER_TABS: undefined;
  COLLABORATOR_TABS: undefined;
  [SCREENS.LOGIN]: undefined;
  [SCREENS.VETERINARIAN_HOME]: undefined;
  [SCREENS.TRAINER_HOME]: undefined;
  [SCREENS.TRAINING_MANAGEMENT_SCREEN]: undefined;
  [SCREENS.TESTS_MANAGEMENT_SCREEN]: undefined;
  [SCREENS.DOG_SCREEN]: undefined;
  [SCREENS.CREATE_DOG_SCREEN]: undefined;
  [SCREENS.DOG_DETAILS_SCREEN]: { dog: IDogResponse };
  [SCREENS.EVENTS_AGENDA]: undefined;
  [SCREENS.EVENT_TYPE]: undefined;
  [SCREENS.NORMAL_CONSULTATION]: undefined;
  [SCREENS.SCHEDULE_A_PROCEDURE]: undefined;
  [SCREENS.MEDICATION_MANAGEMENT_SCREEN]: undefined;
  [SCREENS.FEEDING_MANAGEMENT_SCREEN]: undefined;
  [SCREENS.CREATE_FEEDING_PLAN_SCREEN]?: {
    selectedDog?: IDogResponse;
    editingPlan?: IFeedingPlanResponse;
  };
  [SCREENS.REPRODUCTION_MANAGEMENT_SCREEN]?: {
    preselectedDog?: IDogResponse;
  };
  [SCREENS.COORDINATOR_HOME]: undefined;
  [SCREENS.CREATE_RATIONS_SCREEN]: undefined;
  [SCREENS.RATIONS_SCREEN]: undefined;
  [SCREENS.RATION_DETAILS_SCREEN]: { ration: IRationResponse };
  [SCREENS.COLLABORATORS_LIST_SCREEN]: undefined;
  [SCREENS.CREATE_EMPLOYEE_SCREEN]: undefined;
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
              <Stack.Screen name={SCREENS.EVENT_TYPE} component={EventTypeScreen} options={{ headerShown: true, headerTitle: "Tipo de Evento" }} />
              <Stack.Screen name={SCREENS.NORMAL_CONSULTATION} component={NormalConsultationScreen} options={{ headerShown: true, headerTitle: "Consulta Normal" }} />
              <Stack.Screen name={SCREENS.SCHEDULE_A_PROCEDURE} component={ScheduleAProcedureScreen} options={{ headerShown: true, headerTitle: "Agendar Procedimento" }} />
              <Stack.Screen name={SCREENS.MEDICATION_MANAGEMENT_SCREEN} component={MedicationManagementScreen} options={{ headerShown: true, headerTitle: "Gestão de Medicamentos" }} />
              <Stack.Screen name={SCREENS.FEEDING_MANAGEMENT_SCREEN} component={FeedingManagementScreen} options={{ headerShown: true, headerTitle: "Gestão de Alimentação" }} />
              <Stack.Screen name={SCREENS.CREATE_FEEDING_PLAN_SCREEN} component={CreateFeedingPlanScreen} options={{ headerShown: true, headerTitle: "Plano Alimentar" }} />
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
              <Stack.Screen name={SCREENS.CREATE_EMPLOYEE_SCREEN} component={CreateEmployeeScreen} options={{ headerShown: true, headerTitle: "Novo Funcionário" }} />
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
          <Stack.Screen name={SCREENS.REPRODUCTION_MANAGEMENT_SCREEN} component={ReproductionManagementScreen} options={{ headerShown: true, headerTitle: "Controle Reprodutivo" }} />
          <Stack.Screen name={SCREENS.TRAINER_HOME} component={TrainerHomeScreen} options={{ headerShown: true, headerTitle: "Treinamento & Avaliações" }} />
          <Stack.Screen name={SCREENS.TRAINING_MANAGEMENT_SCREEN} component={TrainingManagementScreen} options={{ headerShown: true, headerTitle: "Gestão de Treinamento" }} />
          <Stack.Screen name={SCREENS.TESTS_MANAGEMENT_SCREEN} component={TestsManagementScreen} options={{ headerShown: true, headerTitle: "Gestão de Testes" }} />
        </>
      )}
    </Stack.Navigator>
  );
}
