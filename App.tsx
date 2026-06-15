import { NavigationContainer } from "@react-navigation/native";
import { MyStack } from "./src/routes";
import { AuthProvider } from "./src/service/authContext";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MyStack />
      </NavigationContainer>
    </AuthProvider>
  );
}
