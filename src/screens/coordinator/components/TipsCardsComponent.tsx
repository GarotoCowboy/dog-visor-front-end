import { StyleSheet, Text, View } from "react-native"
import { Card } from "../../../shared/components/CardComponent"

export const TipsCardsComponent = () => {

    return (
        <View>
            <View style={styles.cardContainer}>
            <Card>
                <View>
                    <Text>Colaboradores</Text>
                </View>
            </Card>
                        <Card>
                <View>
                    <Text>Colaboradores</Text>
                </View>
            </Card>
                        <Card>
                <View>
                    <Text>Colaboradores</Text>
                </View>
            </Card>
                        <Card>
                <View>
                    <Text>Colaboradores</Text>
                </View>
            </Card>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({

    cardContainer:{
        flexDirection:"row",
        flexWrap:"wrap",
        
    }
})