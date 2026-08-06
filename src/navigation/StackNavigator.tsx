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
import { EventTypeScreen } from "../screens/veterinarian/EventType";
import { ScheduleAProcedureScreen } from "../screens/veterinarian/ScheduleAProcedureScreen";
import { NormalConsultationScreen } from "../screens/veterinarian/NormalConsultation";
import VeterinarianHomeScreen from "../screens/veterinarian/VeterinarianHomeScreen";
import { CreateRationsScreen } from "../screens/coordinator/CreateRationsScreen";
import { RationScreen } from "../screens/coordinator/RationScreen";
import { RationDetailsScreen } from "../screens/coordinator/RationDetailsScreen";
import { CoordinatorTabs, VeterinarianTabs } from "./TabNavigator";

export type RootStackParamList = {
  MAIN_TABS: undefined;
  COORDINATOR_TABS: undefined;
  [SCREENS.LOGIN]: undefined;
  [SCREENS.VETERINARIAN_HOME]: undefined;
  [SCREENS.DOG_SCREEN]: undefined;
  [SCREENS.CREATE_DOG_SCREEN]: undefined;
  [SCREENS.DOG_DETAILS_SCREEN]: { dog: IDogResponse };
  [SCREENS.SCHEDULE_A_PROCEDURE]: undefined;
  [SCREENS.NORMAL_CONSULTATION]: undefined;
  [SCREENS.EVENT_TYPE]: undefined;
  [SCREENS.COORDINATOR_HOME]: undefined;
  [SCREENS.CREATE_RATIONS_SCREEN]: undefined;
  [SCREENS.RATIONS_SCREEN]: undefined;
  [SCREENS.RATION_DETAILS_SCREEN]: { ration: IRationResponse };
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
              <Stack.Screen name={SCREENS.EVENT_TYPE} component={EventTypeScreen} options={{ headerShown: true, headerTitle: "Tipo de Evento" }} />
              <Stack.Screen name={SCREENS.VETERINARIAN_HOME} component={VeterinarianHomeScreen} options={{ headerShown: true, headerTitle: "Agenda Veterinária" }} />
              <Stack.Screen name={SCREENS.SCHEDULE_A_PROCEDURE} component={ScheduleAProcedureScreen} options={{ headerShown: true, headerTitle: "Agendar Procedimento" }} />
              <Stack.Screen name={SCREENS.NORMAL_CONSULTATION} component={NormalConsultationScreen} options={{ headerShown: true, headerTitle: "Nova Consulta" }} />
            </>
          )}
          {roles.includes(EUserRoles.ROLE_COORDINATOR) && (
            <>
              <Stack.Screen name="COORDINATOR_TABS" component={CoordinatorTabs} />
              <Stack.Screen name={SCREENS.RATIONS_SCREEN} component={RationScreen} options={{ headerShown: true, headerTitle: "Rações" }} />
              <Stack.Screen name={SCREENS.CREATE_RATIONS_SCREEN} component={CreateRationsScreen} options={{ headerShown: true, headerTitle: "Adicionar Ração" }} />
              <Stack.Screen name={SCREENS.RATION_DETAILS_SCREEN} component={RationDetailsScreen} options={{ headerShown: true, headerTitle: "Detalhes da Ração" }} />
            </>
          )}
          <Stack.Screen name={SCREENS.CREATE_DOG_SCREEN} component={CreateDogsScreen} options={{ headerShown: true, headerTitle: "Cadastrar Novo Cão" }} />
          <Stack.Screen name={SCREENS.DOG_DETAILS_SCREEN} component={DogDetailsScreen} options={{ headerShown: true, headerTitle: "Informações do Cão" }} />
        </>
      )}
    </Stack.Navigator>
  );
}
