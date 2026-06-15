import { View,Text, StyleSheet, } from "react-native"
import {useNavigation, NavigationProp} from "@react-navigation/native"
import { Button } from "../../shared/components/ButtonComponent";
import { RootStackParamList } from "../../routes";
import { SCREENS } from "../../consts/screens";


export const DogsScreen = ()=> {

const navigation = useNavigation<NavigationProp<RootStackParamList>>();

const handleToCreateDogScreen = () =>{

    return navigation.navigate(SCREENS.CREATE_DOG_SCREEN)
}
    return (
        <View>

                
                <View>
                    <Button onPress={handleToCreateDogScreen}></Button>
                </View>
        </View>
    )
}

const styles = StyleSheet.create({


})