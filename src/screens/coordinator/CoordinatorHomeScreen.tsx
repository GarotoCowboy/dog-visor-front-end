import { StyleSheet, Text, View } from "react-native";
import { Card } from "../../shared/components/CardComponent";
import { TipsCardsComponent } from "./components/TipsCardsComponent";
import { Button } from "../../shared/components/ButtonComponent";
import { RootStackParamList } from "../../routes";
import {useNavigation,NavigationProp} from "@react-navigation/native"

export const CoordinatorHomeScreen = () => {

      const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    
    const handleToRationsScreen = ()=>{
        return navigation.navigate("RationsScreen")
    }

  return (
    <View>
      <TipsCardsComponent />
      <Text>Acesso rapido</Text>

      <View>
        <Card>
          <View>
            <Button onPress={handleToRationsScreen} variant="outline">
              <Text>Gestão de ração</Text>
              <Text>Cadastrar, editar e controlar rações</Text>
            </Button>
            <Button onPress={() => {}} variant="outline">
              <Text>Gestão de ração</Text>
              <Text>Cadastrar, editar e controlar rações</Text>
            </Button>
            <Button onPress={() => {}} variant="outline">
              <Text>Gestão de ração</Text>
              <Text>Cadastrar, editar e controlar rações</Text>
            </Button>
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});
