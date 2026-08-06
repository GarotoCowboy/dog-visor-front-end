import { ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../../theme/theme";


interface ICardProps{
    children: ReactElement | ReactElement[]
}

export const Card = ({children}: ICardProps) => {

    return(
        <View style={styles.cardContainer}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
cardContainer:{
 backgroundColor: theme.colors.white, 
        borderRadius: 12,                    // Bordas arredondadas suaves
        padding: 16,                         // Espaço interno para o conteúdo não colar na borda
        marginVertical: 8,                   // Margem para não colar em outros cards (opcional)
        
    ...theme.shadows.md,
        
        // --- Sombra para Android ---
        elevation: 4,  
}
})