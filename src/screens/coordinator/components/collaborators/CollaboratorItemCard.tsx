import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { Card } from "../../../../shared/components/CardComponent";
import {
  EmployeeShiftLabel,
  EmployeeType,
  EmployeeTypeLabel,
  UserProfileResponse,
  getUserCrmv,
  getUserAreaOfExpertise,
} from "../../../../types/User";

interface CollaboratorItemCardProps {
  item: UserProfileResponse;
  onPress?: (item: UserProfileResponse) => void;
  onInactivate?: (item: UserProfileResponse) => void;
}

export const CollaboratorItemCard: React.FC<CollaboratorItemCardProps> = ({
  item,
  onPress,
  onInactivate,
}) => {
  const getRoleColor = (type?: EmployeeType) => {
    switch (type) {
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

  const getRoleIcon = (type?: EmployeeType) => {
    switch (type) {
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

  const roleColor = getRoleColor(item.type);
  const roleName = item.type
    ? EmployeeTypeLabel[item.type] || item.type
    : "Funcionário";

  const shiftText =
    item.shift && EmployeeShiftLabel[item.shift]
      ? EmployeeShiftLabel[item.shift]
      : item.shift || "Não informado";

  const crmv = getUserCrmv(item);
  const areaOfExpertise = getUserAreaOfExpertise(item);

  return (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => onPress && onPress(item)}
      activeOpacity={0.8}
    >
      <Card>
        <View style={styles.userCardContent}>
          {/* CABEÇALHO DO CARD */}
          <View style={styles.userCardHeader}>
            <View style={[styles.avatarBox, { backgroundColor: roleColor }]}>
              <FontAwesomeFreeSolid
                name={getRoleIcon(item.type)}
                size={theme.typography.fontSize.lg}
                color={theme.colors.white}
              />
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{item.name || "Sem Nome"}</Text>
              <View style={styles.badgesRow}>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: roleColor,
                    },
                  ]}
                >
                  <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                    {roleName}
                  </Text>
                </View>

                <View
                  style={
                    item.active === false
                      ? styles.inactiveBadge
                      : styles.activeBadge
                  }
                >
                  <View
                    style={
                      item.active === false
                        ? styles.inactiveDot
                        : styles.activeDot
                    }
                  />
                  <Text
                    style={
                      item.active === false
                        ? styles.inactiveBadgeText
                        : styles.activeBadgeText
                    }
                  >
                    {item.active === false ? "Inativo" : "Ativo"}
                  </Text>
                </View>
              </View>
            </View>

            <MaterialDesignIcons
              name="chevron-right"
              size={22}
              color="#9CA3AF"
            />
          </View>

          <View style={styles.cardDivider} />

          {/* DETALHES DO USUÁRIO */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <MaterialDesignIcons
                name="id-card"
                size={theme.typography.fontSize.base}
                color={theme.colors.primary}
              />
              <Text style={styles.detailLabel}>Matrícula:</Text>
              <Text style={styles.detailValue}>
                {item.registration || "Não informada"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialDesignIcons
                name="email-outline"
                size={theme.typography.fontSize.base}
                color={theme.colors.primary}
              />
              <Text style={styles.detailLabel}>E-mail:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {item.email || "Não informado"}
              </Text>
            </View>

            {item.phone ? (
              <View style={styles.detailRow}>
                <MaterialDesignIcons
                  name="phone-outline"
                  size={theme.typography.fontSize.base}
                  color={theme.colors.primary}
                />
                <Text style={styles.detailLabel}>Telefone:</Text>
                <Text style={styles.detailValue}>{item.phone}</Text>
              </View>
            ) : null}

            <View style={styles.detailRow}>
              <MaterialDesignIcons
                name="clock-outline"
                size={theme.typography.fontSize.base}
                color={theme.colors.primary}
              />
              <Text style={styles.detailLabel}>Turno:</Text>
              <Text style={styles.detailValue}>{shiftText}</Text>
            </View>

            {/* DADOS ESPECÍFICOS: VETERINÁRIO */}
            {item.type === EmployeeType.VETERINARIAN && (
              <>
                {crmv ? (
                  <View style={styles.detailRow}>
                    <FontAwesomeFreeSolid
                      name="certificate"
                      size={theme.typography.fontSize.sm}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.detailLabel}>CRMV:</Text>
                    <Text style={styles.detailValue}>{crmv}</Text>
                  </View>
                ) : null}

                {areaOfExpertise ? (
                  <View style={styles.detailRow}>
                    <FontAwesomeFreeSolid
                      name="stethoscope"
                      size={theme.typography.fontSize.sm}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.detailLabel}>Especialização:</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {areaOfExpertise}
                    </Text>
                  </View>
                ) : null}
              </>
            )}

            {/* DADOS ESPECÍFICOS: ADESTRADOR */}
            {item.type === EmployeeType.TRAINER && areaOfExpertise ? (
              <View style={styles.detailRow}>
                <FontAwesomeFreeSolid
                  name="award"
                  size={theme.typography.fontSize.sm}
                  color={theme.colors.primary}
                />
                <Text style={styles.detailLabel}>Atuação:</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {areaOfExpertise}
                </Text>
              </View>
            ) : null}
          </View>

          {/* FOOTER ACTIONS */}
          <View style={styles.cardFooterActions}>
            <View style={styles.viewDetailsRow}>
              <MaterialDesignIcons
                name="card-account-details-outline"
                size={16}
                color="#6B7280"
              />
              <Text style={styles.viewDetailsText}>Ver Detalhes</Text>
            </View>

            {item.active !== false && onInactivate ? (
              <TouchableOpacity
                style={styles.inactivateQuickButton}
                onPress={() => onInactivate(item)}
                activeOpacity={0.7}
              >
                <MaterialDesignIcons
                  name="account-cancel-outline"
                  size={15}
                  color="#DC2626"
                />
                <Text style={styles.inactivateQuickButtonText}>Inativar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: 5,
  },
  userCardContent: {
    padding: 6,
    gap: 10,
  },
  userCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  nameContainer: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#166534",
  },
  activeBadgeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#166534",
  },
  inactiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#991B1B",
  },
  inactiveBadgeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#991B1B",
  },
  cardDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  detailsContainer: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.secondary,
    width: 85,
  },
  detailValue: {
    flex: 1,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  cardFooterActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 8,
    marginTop: 4,
  },
  viewDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewDetailsText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 12,
    color: "#6B7280",
  },
  inactivateQuickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  inactivateQuickButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#DC2626",
  },
});
