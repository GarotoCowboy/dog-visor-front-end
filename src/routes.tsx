import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from './screens/auth/LoginScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme/theme';
import VeterinarianHomeScreen from './screens/veterinarian/VeterinarianHomeScreen';
import { SplashScreen } from './screens/SplashScreen';
import { AuthContext } from './service/authContext';
import { useContext } from 'react';
import { EUserRoles } from './types/userRoles';
import { CreateDogsScreen } from './screens/shared/CreateDogScreen';
import { SCREENS } from './consts/screens';
import { DogsScreen } from './screens/shared/DogsScreen';




const Stack = createNativeStackNavigator();



export type RootStackParamList = {
  [SCREENS.LOGIN]: undefined;
  [SCREENS.VETERINARIAN_HOME]: undefined;
  [SCREENS.DOG_SCREEN]: undefined;
  [SCREENS.CREATE_DOG_SCREEN]: undefined
};

export const MyStack = () =>{

const {isLoading, userToken, roles} = useContext(AuthContext)



if (isLoading){
  return <SplashScreen/>
}

  return (
    <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: {backgroundColor: theme.colors.background}
    }}
    screenLayout={({children}) => (
      
      <SafeAreaView style={{ flex: 1 }} edges={[ "left", "right"]}>
          {children}
        </SafeAreaView>
    )}
    > 

    
    {userToken == null ?(
      //Rotas para nao logados
          <Stack.Screen name={SCREENS.LOGIN} component={LoginScreen}/>
     
    ) : (
      //Rotas comuns
      <>
        <Stack.Screen name={SCREENS.DOG_SCREEN} component={DogsScreen}
        options={{
          headerShown: true,
          headerTitle:"Cães",
          headerBackVisible:false

        }}
        />
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle:"Cadastrar Novo Cão",
            headerBackVisible:false
          }}
        name={SCREENS.CREATE_DOG_SCREEN} component={CreateDogsScreen}/>


        {roles.includes(EUserRoles.ROLE_VETERINARIAN) && (
           <Stack.Screen name={SCREENS.VETERINARIAN_HOME} component={VeterinarianHomeScreen}/>
        )}
      </>
    )}
      
    </Stack.Navigator>
  );
}