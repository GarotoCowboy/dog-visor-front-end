// [ARCHIVED] Tela legada de Seleção do Tipo de Evento
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../../shared/components/ButtonComponent";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import { theme } from "../../../theme/theme";
import { RootStackParamList } from "../../routes";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { SCREENS } from "../../consts/screens";

export const EventTypeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleToConsultationScreen = () => {
    navigation.navigate(SCREENS.NORMAL_CONSULTATION);
  };

  const handleToProcedureScreen = () => {
    navigation.navigate(SCREENS.SCHEDULE_A_PROCEDURE);
  };

  return (
    <View style={{ paddingHorizontal: 12, gap: 8 }}>
      <Text style={styles.textTitle}>Selecione o tipo de evento</Text>
      <Text style={styles.textsubTitle}>
        Escolha o tipo de agendamento que deseja criar:
      </Text>

      <View style={styles.buttonContainer}>
        <Button onPress={handleToConsultationScreen} variant="outline">
          <View style={styles.buttonConsultationContainer}>
            <View style={styles.iconContainer}>
              <FontAwesomeFreeSolid
                name="stethoscope"
                size={theme.typography.fontSize.xxxl}
                color={theme.colors.secondary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.textTitle}> Consulta Normal</Text>
              <Text style={styles.textParagrph}>
                Agendamento de consulta Veterinária de rotina, check-ups e
                avaliações gerais
              </Text>
            </View>
          </View>
        </Button>

        <Button onPress={handleToProcedureScreen} variant="outline">
          <View style={styles.buttonConsultationContainer}>
            <View
              style={{
                ...styles.iconContainer,
                ...styles.iconProcedureContainer,
              }}
            >
              <FontAwesomeFreeSolid
                name="briefcase-medical"
                size={theme.typography.fontSize.xxxl}
                color={theme.colors.alert}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.textTitle}> Agendar Procedimento</Text>
              <Text style={styles.textParagrph}>
                Cirugias, partos, procedimentos de urgência e emergências
                veterinárias
              </Text>
            </View>
          </View>
        </Button>
      </View>

      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>
          <Text style={{ fontWeight: "bold" }}>Dica:</Text> Após selecionar o
          tipo de evento, você será direcionado para o formulário específico com
          os campos necessários para cada tipo de agendamento.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: "90%",
    justifyContent: "center",
    alignSelf: "center",
    gap: 24,
    paddingVertical: 24,
  },
  buttonConsultationContainer: {
    flexDirection: "row",
    paddingHorizontal: 40,
    paddingVertical: 12,
    gap: 12,
  },
  iconContainer: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    ...theme.shadows.sm,
  },
  iconProcedureContainer: {
    backgroundColor: theme.colors.alertLightColor,
  },
  textContainer: {
    gap: 8,
  },
  textTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  textsubTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    opacity: 0.6,
  },
  textParagrph: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.4,
  },
  tipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  tipContainer: {
    width: "95%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.accent,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    alignSelf: "center",
  },
});

