import { Pressable, StyleSheet, Text, TouchableOpacity,View } from "react-native"
import { Children, ReactElement } from "react";
import { theme } from "../../../theme/theme";


interface IButtonProps{
    text?: string
    onPress: () => void
    children?: ReactElement | ReactElement[]
    variant?: "primary" | "outline" | "transparent"
}

export const Button = ({text,onPress,children,variant = "primary"}: IButtonProps) => {

    return (
    <Pressable

    onPress={onPress}
    style ={({pressed}) => ({
        ...styles.buttonContainer,
        ...((pressed) ? styles.buttonPressed : {}),
        ...((variant) ==="primary" ? styles.primary : {}),
        ...((variant) === "outline" ? styles.outlined : {}),
        ...((variant) === "transparent" ? styles.transparent : {})
    })}>
        {children}
        
        {!children && (
            <Text style={{
            ...styles.buttonText,
            ...((variant) === "primary" ? styles.buttonTextColorPrimary : {}),
            ...((variant) === "outline" ? styles.buttonTextColorSecondary : {}),
            ...((variant) === "transparent" ? styles.buttonTextColorSecondary : {}),

            }}>{text}</Text>
        )}
    </Pressable>
    )
}

const styles = StyleSheet.create({
    buttonContainer:{
        padding: 14,
        borderRadius:8,
        justifyContent:"center",
        alignItems:"center",
    },
    primary:{
        backgroundColor: theme.colors.primary,
    },
    outlined:{
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    transparent:{

    },
    buttonPressed: {
        opacity:0.9
    },
    buttonText:{
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.base,
    },
    buttonTextColorPrimary:{
        color: theme.colors.white
    },
    buttonTextColorSecondary:{
        color: theme.colors.primary
    }

})

