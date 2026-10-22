import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../theme/theme";
import { Card } from "../../../shared/components/CardComponent";
import { EmployeeShiftLabel, UserProfileResponse } from "../../../types/User";

interface ProfileContactCardProps {
  profile: UserProfileResponse | null;
}

export const ProfileContactCard: React.FC<ProfileContactCardProps> = ({
  profile,
}) => {
  const shiftLabel =
    profile?.shift && EmployeeShiftLabel[profile.shift]
      ? EmployeeShiftLabel[profile.shift]
      : profile?.shift || "Não informado";

  return (
    <View style={styles.cardWrapper}>
      <Card>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Informações de Contato</Text>

          <View style={styles.infoRow}>
            <View style={styles.iconColumn}>
              <MaterialDesignIcons
                name="id-card"
                size={theme.typography.fontSize.lg}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Matrícula</Text>
              <Text style={styles.infoValue}>
                {profile?.registration || "Não informada"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconColumn}>
              <MaterialDesignIcons
                name="email-outline"
                size={theme.typography.fontSize.lg}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValue}>
                {profile?.email || "Não informado"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconColumn}>
              <MaterialDesignIcons
                name="phone-outline"
                size={theme.typography.fontSize.lg}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoValue}>
                {profile?.phone || "Não informado"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.iconColumn}>
              <MaterialDesignIcons
                name="clock-outline"
                size={theme.typography.fontSize.lg}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Turno de Trabalho</Text>
              <Text style={styles.infoValue}>{shiftLabel}</Text>
            </View>
          </View>
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
