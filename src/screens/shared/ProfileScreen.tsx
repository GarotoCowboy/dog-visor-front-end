import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../theme/theme";
import { AuthContext } from "../../service/authContext";
import {
  getCollaboratorByRegistrationService,
  getCollaboratorsService,
  getCoordinatorByRegistrationService,
  getCoordinatorsService,
  getLoggedUserProfileService,
  getTrainerByRegistrationService,
  getTrainersService,
  getVeterinarianByRegistrationService,
  getVeterinariansService,
  listUsersService,
} from "../../service/api";
import { Card } from "../../shared/components/CardComponent";
import { Button } from "../../shared/components/ButtonComponent";
import { CustomAlertComponent } from "../../shared/components/CustomAlertComponent";
import {
  EmployeeShiftLabel,
  EmployeeType,
  EmployeeTypeLabel,
  ITrainerResponse,
  IVeterinarianResponse,
  UserProfileResponse,
} from "../../types/User";
import { EUserRoles } from "../../types/userRoles";

interface JwtUserPayload {
  sub?: string;
  id?: string;
  userId?: string;
  employeeId?: string;
  collaboratorId?: string;
  registration?: string;
  email?: string;
  name?: string;
  phone?: string;
  shift?: string;
  type?: EmployeeType;
  roles?: string[];
  crmv?: string;
  areaOfExpertise?: string;
  [key: string]: any;
}

export const ProfileScreen = () => {
  const { userToken, roles, signOut } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Determina a role a partir dos dados do perfil ou do AuthContext
  const getEffectiveEmployeeType = (): EmployeeType => {
    if (profile?.type) {
      return profile.type;
    }
    if (roles.includes(EUserRoles.ROLE_VETERINARIAN)) return EmployeeType.VETERINARIAN;
    if (roles.includes(EUserRoles.ROLE_COORDINATOR)) return EmployeeType.COORDINATOR;
    if (roles.includes(EUserRoles.ROLE_TRAINER)) return EmployeeType.TRAINER;
    if (roles.includes(EUserRoles.ROLE_COLLABORATOR)) return EmployeeType.COLLABORATOR;
    return EmployeeType.COORDINATOR;
  };

  const currentRole = getEffectiveEmployeeType();

  const loadUserProfile = async () => {
    let userSub = "";
    let decodedUserId = "";
    let decodedEmployeeId = "";
    let decodedEmail = "";

    // 1. Extrai dados preliminares do JWT se disponível
    if (userToken) {
      try {
        const decoded = jwtDecode<JwtUserPayload>(userToken);
        if (decoded) {
          userSub = decoded.sub || decoded.registration || "";
          decodedUserId = decoded.userId || decoded.id || "";
          decodedEmployeeId = decoded.employeeId || decoded.collaboratorId || "";
          decodedEmail = decoded.email || "";

          const fallbackType: EmployeeType =
            decoded.type ||
            (roles.includes(EUserRoles.ROLE_VETERINARIAN)
              ? EmployeeType.VETERINARIAN
              : roles.includes(EUserRoles.ROLE_COORDINATOR)
              ? EmployeeType.COORDINATOR
              : roles.includes(EUserRoles.ROLE_TRAINER)
              ? EmployeeType.TRAINER
              : EmployeeType.COLLABORATOR);

          const initialProfile: UserProfileResponse = {
            employeeId: decodedEmployeeId,
            collaboratorId: decodedEmployeeId,
            userId: decodedUserId || userSub,
            registration: userSub,
            email: decodedEmail,
            name: decoded.name || "Usuário",
            phone: decoded.phone || "",
            shift: decoded.shift || "MORNING",
            type: fallbackType,
            crmv: decoded.crmv || decoded.CRMV || "",
            areaOfExpertise: decoded.areaOfExpertise || decoded.area_of_expertise || "",
          } as any;

          setProfile((prev) => prev ?? initialProfile);
        }
      } catch (err) {
        console.log("Erro ao ler token no perfil:", err);
      }
    }

    try {
      setLoading(true);

      // 2. Se for Veterinário, busca diretamente pelo endpoint de matrícula ou lista
      if (
        roles.includes(EUserRoles.ROLE_VETERINARIAN) ||
        currentRole === EmployeeType.VETERINARIAN
      ) {
        if (userSub) {
          try {
            const vet = await getVeterinarianByRegistrationService(userSub);
            if (vet && (vet.crmv || vet.areaOfExpertise || vet.name)) {
              setProfile(vet);
              return;
            }
          } catch (e) {
            console.log("Tentando busca de veterinário por lista...");
          }
        }

        try {
          const vets = await getVeterinariansService();
          if (vets && vets.length > 0) {
            const match = vets.find(
              (v) =>
                (userSub && v.registration?.toLowerCase() === userSub.toLowerCase()) ||
                (decodedUserId && v.userId === decodedUserId) ||
                (decodedEmployeeId && v.employeeId === decodedEmployeeId) ||
                (decodedEmail && v.email?.toLowerCase() === decodedEmail.toLowerCase()),
            );
            if (match) {
              setProfile(match);
              return;
            } else if (vets.length === 1) {
              setProfile(vets[0]);
              return;
            }
          }
        } catch (vetErr) {
          console.log("Tentando fallback para veterinário:", vetErr);
        }
      }

      // 3. Se for Adestrador, busca diretamente de /api/v1/employees/trainers
      if (
        roles.includes(EUserRoles.ROLE_TRAINER) ||
        currentRole === EmployeeType.TRAINER
      ) {
        if (userSub) {
          try {
            const trainer = await getTrainerByRegistrationService(userSub);
            if (trainer) {
              setProfile(trainer);
              return;
            }
          } catch (e) {}
        }

        try {
          const trainers = await getTrainersService();
          if (trainers && trainers.length > 0) {
            const match = trainers.find(
              (t) =>
                (userSub && t.registration?.toLowerCase() === userSub.toLowerCase()) ||
                (decodedUserId && t.userId === decodedUserId) ||
                (decodedEmployeeId && t.employeeId === decodedEmployeeId) ||
                (decodedEmail && t.email?.toLowerCase() === decodedEmail.toLowerCase()),
            );
            if (match) {
              setProfile(match);
              return;
            }
          }
        } catch (trainErr) {
          console.log("Tentando fallback para adestrador:", trainErr);
        }
      }

      // 4. Se for Coordenador, busca de /api/v1/employees/coordinators
      if (
        roles.includes(EUserRoles.ROLE_COORDINATOR) ||
        currentRole === EmployeeType.COORDINATOR
      ) {
        if (userSub) {
          try {
            const coord = await getCoordinatorByRegistrationService(userSub);
            if (coord) {
              setProfile(coord);
              return;
            }
          } catch (e) {}
        }

        try {
          const coords = await getCoordinatorsService();
          if (coords && coords.length > 0) {
            const match = coords.find(
              (c) =>
                (userSub && c.registration?.toLowerCase() === userSub.toLowerCase()) ||
                (decodedUserId && c.userId === decodedUserId) ||
                (decodedEmployeeId && c.employeeId === decodedEmployeeId) ||
                (decodedEmail && c.email?.toLowerCase() === decodedEmail.toLowerCase()),
            );
            if (match) {
              setProfile(match);
              return;
            }
          }
        } catch (coordErr) {
          console.log("Tentando fallback para coordenador:", coordErr);
        }
      }

      // 5. Se for Colaborador, busca de /api/v1/employees/collaborators
      if (
        roles.includes(EUserRoles.ROLE_COLLABORATOR) ||
        currentRole === EmployeeType.COLLABORATOR
      ) {
        if (userSub) {
          try {
            const collab = await getCollaboratorByRegistrationService(userSub);
            if (collab) {
              setProfile(collab);
              return;
            }
          } catch (e) {}
        }

        try {
          const collabs = await getCollaboratorsService();
          if (collabs && collabs.length > 0) {
            const match = collabs.find(
              (c) =>
                (userSub && c.registration?.toLowerCase() === userSub.toLowerCase()) ||
                (decodedUserId && c.userId === decodedUserId) ||
                (decodedEmployeeId && c.collaboratorId === decodedEmployeeId) ||
                (decodedEmail && c.email?.toLowerCase() === decodedEmail.toLowerCase()),
            );
            if (match) {
              setProfile(match);
              return;
            }
          }
        } catch (collabErr) {
          console.log("Tentando fallback para colaborador:", collabErr);
        }
      }

      // 6. Fallback final: endpoint genérico /api/v1/employees
      try {
        const users = await listUsersService();
        if (users && users.length > 0) {
          const match = users.find(
            (u) =>
              (userSub && u.registration?.toLowerCase() === userSub.toLowerCase()) ||
              (decodedUserId && u.userId === decodedUserId) ||
              (decodedEmployeeId && u.employeeId === decodedEmployeeId),
          );
          if (match) {
            setProfile(match as UserProfileResponse);
          }
        }
      } catch (e) {}
    } catch (err) {
      console.log("Erro ao carregar dados do perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [userToken]),
  );

  const handleLogout = async () => {
    setShowLogoutAlert(false);
    await signOut();
  };

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

  const shiftLabel =
    profile?.shift && EmployeeShiftLabel[profile.shift]
      ? EmployeeShiftLabel[profile.shift]
      : profile?.shift || "Não informado";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* CARD PRINCIPAL / HEADER */}
      <View style={styles.cardWrapper}>
        <Card>
          <View style={styles.headerContainer}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: getRoleBadgeColor() },
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
                { backgroundColor: theme.colors.background, borderColor: getRoleBadgeColor() },
              ]}
            >
              <Text
                style={[styles.roleBadgeText, { color: getRoleBadgeColor() }]}
              >
                {EmployeeTypeLabel[currentRole] || currentRole}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* CARD DE INFORMAÇÕES PESSOAIS & CONTATO */}
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

      {/* CARD DE DADOS PROFISSIONAIS (APENAS PARA VETERINÁRIO E ADESTRADOR) */}
      {(currentRole === EmployeeType.VETERINARIAN ||
        currentRole === EmployeeType.TRAINER) && (
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
                        {(profile as IVeterinarianResponse)?.crmv ||
                          (profile as any)?.CRMV ||
                          (profile as any)?.crmvNumber ||
                          "Não informado"}
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
                        {(profile as IVeterinarianResponse)?.areaOfExpertise ||
                          (profile as any)?.area_of_expertise ||
                          (profile as any)?.specialization ||
                          "Não informada"}
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
                      {(profile as ITrainerResponse)?.areaOfExpertise ||
                        (profile as any)?.area_of_expertise ||
                        "Treinamento Comportamental / Cão-Guia"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card>
        </View>
      )}

      {/* BOTÃO DE LOGOUT */}
      <View style={styles.logoutButtonContainer}>
        <Button
          text="Sair da Conta"
          variant="warning"
          onPress={() => setShowLogoutAlert(true)}
        />
      </View>

      {/* MODAL DE CONFIRMAÇÃO DE LOGOUT */}
      {showLogoutAlert && (
        <CustomAlertComponent
          visible={showLogoutAlert}
          variant="warning"
          title="Confirmar Saída"
          message="Deseja realmente sair da sua conta?"
          confirmText="Sair"
          cancelText="Cancelar"
          onConfirm={handleLogout}
          onClose={() => setShowLogoutAlert(false)}
        />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  cardWrapper: {
    width: "100%",
  },
  headerContainer: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    ...theme.shadows.sm,
  },
  userName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text,
    textAlign: "center",
  },
  userEmail: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: "center",
  },
  roleBadge: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xs,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconColumn: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextContainer: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
  },
  infoValue: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  logoutButtonContainer: {
    marginTop: 8,
    width: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default ProfileScreen;
