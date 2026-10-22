import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import { theme } from "../../../../theme/theme";
import { Card } from "../../../shared/components/CardComponent";
import {
  EmployeeType,
  EmployeeTypeLabel,
  ITrainerResponse,
  IVeterinarianResponse,
  UserProfileResponse,
  getUserCrmv,
  getUserAreaOfExpertise,
} from "../../../types/User";

interface ProfileProfessionalCardProps {
  profile: UserProfileResponse | null;
  currentRole: EmployeeType;
}

export const ProfileProfessionalCard: React.FC<
  ProfileProfessionalCardProps
> = ({ profile, currentRole }) => {
  if (
    currentRole !== EmployeeType.VETERINARIAN &&
    currentRole !== EmployeeType.TRAINER
  ) {
    return null;
  }

  return (
    <View style={styles.cardWrapper}>
      <Card>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Dados Profissionais ({EmployeeTypeLabel[currentRole]})
          </Text>

          {/* DADOS DE VETERINÁRIO */}
          {currentRole === EmployeeType.VETERINARIAN && (
            <>
              <View style={styles.infoRow}>
                <View style={styles.iconColumn}>
                  <FontAwesomeFreeSolid
                    name="certificate"
                    size={theme.typography.fontSize.base}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>CRMV</Text>
                  <Text style={styles.infoValue}>
                    {getUserCrmv(profile) || "Não informado"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconColumn}>
                  <FontAwesomeFreeSolid
                    name="stethoscope"
                    size={theme.typography.fontSize.base}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Área de Especialização</Text>
                  <Text style={styles.infoValue}>
                    {getUserAreaOfExpertise(profile) || "Não informada"}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* DADOS DE ADESTRADOR */}
          {currentRole === EmployeeType.TRAINER && (
            <View style={styles.infoRow}>
              <View style={styles.iconColumn}>
                <FontAwesomeFreeSolid
                  name="award"
                  size={theme.typography.fontSize.base}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Área de Atuação</Text>
                <Text style={styles.infoValue}>
                  {getUserAreaOfExpertise(profile) ||
                    "Treinamento Comportamental / Cão-Guia"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: 4,
  },
  sectionContainer: {
    padding: 6,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  iconColumn: {
    width: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  infoTextContainer: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.secondary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 6,
  },
});
