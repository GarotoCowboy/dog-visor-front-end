import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { theme } from '../../../theme/theme';

// 1. Interface das Props (mantida e tipada)
interface ICheckBoxProps {
  value: boolean;                         
  onChangeChecked: (checked: boolean) => void; 
  label?: string;                         
}

const CHECKBOX_SIZE = 14;
const INNER_DOT_SIZE = CHECKBOX_SIZE * 0.6;

export const CheckBox = ({ value, onChangeChecked, label }: ICheckBoxProps) => {
  return (
    // Área de clique que engloba o círculo e o texto
    <Pressable 
      style={styles.container} 
      onPress={() => onChangeChecked(!value)}
      // Acessibilidade para leitores de tela
      accessible={true}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
    >
      {/* O círculo externo */}
      <View style={[
        styles.outerCircle, 
        value && styles.outerCircleChecked // Opcional: muda a borda quando marcado
      ]}>
        {/* A bolinha azul preenchendo o espaço interno */}
        {value && (
          <View style={styles.innerDot} />
        )}
      </View>

      {/* Renderiza o texto apenas se a prop 'label' for enviada */}
      {label && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  outerCircle: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    borderWidth: 2,
    borderColor: theme.colors.primary, // Cor da borda padrão
    borderRadius: 999,      // Garante que seja um círculo perfeito
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  outerCircleChecked: {
    borderColor: theme.colors.secondary, // Cor da borda quando selecionado (pode ser a mesma da bolinha interna)
  },
  innerDot: {
    width: INNER_DOT_SIZE,
    height: INNER_DOT_SIZE,
    borderRadius: 999,      // Garante que seja um círculo perfeito
    backgroundColor: theme.colors.secondary, // Cor da bolinha azul interna
  },
  label: {
    marginLeft: 10,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
  },
});