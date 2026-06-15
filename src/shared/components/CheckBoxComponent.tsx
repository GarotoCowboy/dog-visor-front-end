import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';

// 1. Interface das Props (mantida e tipada)
interface ICheckBoxProps {
  value: boolean;                         // Estado atual (controlado pelo pai)
  onChangeChecked: (checked: boolean) => void; // Função para alternar o estado
  label?: string;                         // Texto opcional ao lado
}

// Constantes de design para facilitar ajustes futuros
const CHECKBOX_SIZE = 24;
const INNER_DOT_SIZE = CHECKBOX_SIZE * 0.6; // O ponto interno ocupa 60% do tamanho total

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
    borderColor: '#757575', // Cor da borda padrão
    borderRadius: 999,      // Garante que seja um círculo perfeito
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  outerCircleChecked: {
    borderColor: '#2196F3', // Cor da borda quando selecionado (pode ser a mesma da bolinha interna)
  },
  innerDot: {
    width: INNER_DOT_SIZE,
    height: INNER_DOT_SIZE,
    borderRadius: 999,      // Garante que seja um círculo perfeito
    backgroundColor: '#2196F3', // Cor da bolinha azul interna
  },
  label: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333333',
  },
});