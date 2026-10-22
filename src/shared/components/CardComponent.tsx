import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { theme } from "../../../theme/theme";

interface ICardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card = ({ children, style }: ICardProps) => {
  return <View style={[styles.cardContainer, style]}>{children}</View>;
};

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