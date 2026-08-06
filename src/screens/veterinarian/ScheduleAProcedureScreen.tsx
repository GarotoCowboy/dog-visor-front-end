

import { StyleSheet, Text, View } from "react-native"
import { Button } from "../../shared/components/ButtonComponent"
import { SurgeyComponent } from "./components/SurgeryComponent"

export const ScheduleAProcedureScreen = ()=> {

    return (
        <View style={styles.container}>
            <Text>Tipo de Procedimento</Text>
            <View style={styles.buttonContainer}>
            <Button text="Cirurgia" onPress={() => {}}/>
            <Button text="Parto" onPress={() => {}}/>
            <Button text="Emergência" onPress={() => {}}/>

            </View>
            <SurgeyComponent/>
        </View>
    )
}


const styles = StyleSheet.create({
    container:{
        flex: 1,
        marginTop:24
    },
    buttonContainer:{
        flexDirection:"row"
    },
})