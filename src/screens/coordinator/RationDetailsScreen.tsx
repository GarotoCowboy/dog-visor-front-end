import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native"
import { RootStackParamList } from "../../routes";
import { SCREENS } from "../../consts/screens";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof SCREENS.RATION_DETAILS_SCREEN
>;

export const RationDetailsScreen = ({route}:Props) => {

    const {ration} = route.params
    return (
        <View>
            <Text>{ration.name}</Text>
            <Text>{ration.stockStatus}</Text>
        </View>
    )
}


const styles = StyleSheet.create({

})