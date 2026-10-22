import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../../theme/theme";
import {
  EmployeeShiftLabel,
  EmployeeType,
  EmployeeTypeLabel,
  UserProfileResponse,
  getUserCrmv,
  getUserAreaOfExpertise,
} from "../../../../types/User";

interface UserDetailsModalProps {
  visible: boolean;
  user: UserProfileResponse | null;
  onClose: () => void;
  onInactivate: (user: UserProfileResponse) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  visible,
  user,
  onClose,
  onInactivate,
}) => {
  if (!user) return null;

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

  const roleColor = getRoleColor(user.type);
  const roleName = user.type
    ? EmployeeTypeLabel[user.type] || user.type
    : "Funcionário";

  const shiftText =
    user.shift && EmployeeShiftLabel[user.shift]
      ? EmployeeShiftLabel[user.shift]
      : user.shift || "Não informado";

  const crmv = getUserCrmv(user);
  const areaOfExpertise = getUserAreaOfExpertise(user);

  const isActive = user.active !== false;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContent}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Detalhes do Usuário</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialDesignIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* PERFIL / AVATAR */}
            <View style={styles.profileHeader}>
              <View style={[styles.avatarBox, { backgroundColor: roleColor }]}>
                <FontAwesomeFreeSolid
                  name={getRoleIcon(user.type)}
                  size={32}
                  color={theme.colors.white}
                />
              </View>

              <Text style={styles.userName}>{user.name || "Sem Nome"}</Text>

              <View style={styles.badgesRow}>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor: "#F0FDF4",
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
                    isActive ? styles.activeBadge : styles.inactiveBadge
                  }
                >
                  <View
                    style={
                      isActive ? styles.activeDot : styles.inactiveDot
                    }
                  />
                  <Text
                    style={
                      isActive
                        ? styles.activeBadgeText
                        : styles.inactiveBadgeText
                    }
                  >
                    {isActive ? "Ativo" : "Inativo"}
                  </Text>
                </View>
              </View>
            </View>

            {/* SEÇÃO: IDENTIFICAÇÃO & DADOS */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Identificação</Text>

              <View style={styles.infoRow}>
                <MaterialDesignIcons
                  name="id-card"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Matrícula</Text>
                  <Text style={styles.infoValue}>
                    {user.registration || "Não informada"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MaterialDesignIcons
                  name="clock-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Turno de Trabalho</Text>
                  <Text style={styles.infoValue}>{shiftText}</Text>
                </View>
              </View>
            </View>

            {/* SEÇÃO: CONTATO */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Informações de Contato</Text>

              <View style={styles.infoRow}>
                <MaterialDesignIcons
                  name="email-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>E-mail</Text>
                  <Text style={styles.infoValue}>
                    {user.email || "Não informado"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MaterialDesignIcons
                  name="phone-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Telefone</Text>
                  <Text style={styles.infoValue}>
                    {user.phone || "Não informado"}
                  </Text>
                </View>
              </View>
            </View>

            {/* SEÇÃO: DADOS PROFISSIONAIS ESPECÍFICOS */}
            {(crmv || areaOfExpertise) && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Qualificação Profissional</Text>

                {crmv ? (
                  <View style={styles.infoRow}>
                    <FontAwesomeFreeSolid
                      name="certificate"
                      size={18}
                      color={theme.colors.primary}
                    />
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Registro CRMV</Text>
                      <Text style={styles.infoValue}>{crmv}</Text>
                    </View>
                  </View>
                ) : null}

                {areaOfExpertise ? (
                  <View style={styles.infoRow}>
                    <FontAwesomeFreeSolid
                      name="stethoscope"
                      size={18}
                      color={theme.colors.primary}
                    />
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>
                        {user.type === EmployeeType.TRAINER
                          ? "Área de Atuação"
                          : "Especialização"}
                      </Text>
                      <Text style={styles.infoValue}>{areaOfExpertise}</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            )}
          </ScrollView>

          {/* FOOTER ACTIONS */}
          <View style={styles.footer}>
            {isActive ? (
              <TouchableOpacity
                style={styles.inactivateButton}
                onPress={() => onInactivate(user)}
                activeOpacity={0.8}
              >
                <MaterialDesignIcons
                  name="account-cancel-outline"
                  size={20}
                  color="#DC2626"
                />
                <Text style={styles.inactivateButtonText}>
                  Inativar Usuário
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.inactiveStatusBox}>
                <MaterialDesignIcons
                  name="alert-circle-outline"
                  size={18}
                  color="#991B1B"
                />
                <Text style={styles.inactiveStatusText}>
                  Este usuário já está inativo no sistema.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeModalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollBody: {
    padding: 20,
    gap: 16,
  },
  profileHeader: {
    alignItems: "center",
    gap: 8,
    paddingBottom: 4,
  },
  avatarBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  userName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    textAlign: "center",
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#166534",
  },
  activeBadgeText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#166534",
  },
  inactiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#991B1B",
  },
  inactiveBadgeText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: "#991B1B",
  },
  sectionCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: theme.borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
  },
  infoValue: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 10,
  },
  inactivateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
  },
  inactivateButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: "#DC2626",
  },
  inactiveStatusBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  inactiveStatusText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
  },
  closeModalButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
  },
  closeModalButtonText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    fontSize: theme.typography.fontSize.sm,
    color: "#4B5563",
  },
});
