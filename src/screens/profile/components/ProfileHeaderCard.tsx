import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import { theme } from "../../../../theme/theme";
import { Card } from "../../../shared/components/CardComponent";
import { EmployeeType, EmployeeTypeLabel, UserProfileResponse } from "../../../types/User";

interface ProfileHeaderCardProps {
  profile: UserProfileResponse | null;
  currentRole: EmployeeType;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  profile,
  currentRole,
}) => {
  const getRoleBadgeColor = () => {
    switch (currentRole) {
      case EmployeeType.VETERINARIAN:
        return theme.colors.primary;
      case EmployeeType.COORDINATOR:
        return theme.colors.secondary;
      case EmployeeType.TRAINER:
        return theme.colors.accent;
      case EmployeeType.COLLABORATOR:
        return theme.colors.statusPending;
      default:
        return theme.colors.primary;
    }
  };

  const getRoleIcon = () => {
    switch (currentRole) {
      case EmployeeType.VETERINARIAN:
        return "user-doctor";
      case EmployeeType.COORDINATOR:
        return "user-tie";
      case EmployeeType.TRAINER:
        return "dog";
      case EmployeeType.COLLABORATOR:
        return "user";
      default:
        return "user";
    }
  };

  const badgeColor = getRoleBadgeColor();

  return (
    <View style={styles.cardWrapper}>
      <Card>
        <View style={styles.headerContainer}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: badgeColor },
            ]}
          >
            <FontAwesomeFreeSolid
              name={getRoleIcon()}
              size={theme.typography.fontSize.xxxl}
              color={theme.colors.white}
            />
          </View>

          <Text style={styles.userName}>{profile?.name || "Usuário"}</Text>
          <Text style={styles.userEmail}>{profile?.email || ""}</Text>

          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor: theme.colors.background,
                borderColor: badgeColor,
              },
            ]}
          >
            <Text style={[styles.roleBadgeText, { color: badgeColor }]}>
              {EmployeeTypeLabel[currentRole] || currentRole}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 4,
  },
  headerContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  userEmail: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.secondary,
    marginBottom: 12,
    textAlign: "center",
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
