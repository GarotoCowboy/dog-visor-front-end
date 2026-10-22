import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
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
import { PasswordResetOtpModal } from "../../shared/components/PasswordResetOtpModal";
import { useAlert } from "../../hooks/useAlert";
import {
  EmployeeShiftLabel,
  EmployeeType,
  EmployeeTypeLabel,
  ITrainerResponse,
  IVeterinarianResponse,
  UserProfileResponse,
} from "../../types/User";
import { EUserRoles } from "../../types/userRoles";
import { getEmployeeTypeFromRoles } from "../../utils/authToken";
import { ProfileHeaderCard } from "./components/ProfileHeaderCard";
import { ProfileContactCard } from "./components/ProfileContactCard";
import { ProfileProfessionalCard } from "./components/ProfileProfessionalCard";

export const ProfileScreen = () => {
  const { user: authUser, roles, signOut } = useContext(AuthContext);
  const { showAlert, showConfirm, AlertModal } = useAlert();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

  // Determina a role a partir dos dados do perfil ou do AuthContext
  const getEffectiveEmployeeType = (): EmployeeType =>
    profile?.type ?? authUser?.type ?? getEmployeeTypeFromRoles(roles);

  const currentRole = getEffectiveEmployeeType();

  const loadUserProfile = async () => {
    let userSub = "";
    let decodedUserId = "";
    let decodedEmployeeId = "";
    let decodedEmail = "";

    // 1. Usa os dados do usuário já decodificados pelo AuthContext
    if (authUser) {
      userSub = authUser.registration;
      decodedUserId = authUser.userId;
      decodedEmployeeId = authUser.employeeId;
      decodedEmail = authUser.email;

      const initialProfile: IVeterinarianResponse = {
        employeeId: authUser.employeeId,
        userId: authUser.userId || authUser.registration,
        registration: authUser.registration,
        email: authUser.email,
        name: authUser.name || "Usuário",
        phone: authUser.phone,
        shift: authUser.shift,
        type: authUser.type,
        crmv: authUser.crmv,
        areaOfExpertise: authUser.areaOfExpertise,
      };

      setProfile((prev) => prev ?? initialProfile);
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
    }, [authUser]),
  );

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* CARD PRINCIPAL / HEADER */}
      <ProfileHeaderCard profile={profile} currentRole={currentRole} />

      {/* CARD DE INFORMAÇÕES PESSOAIS & CONTATO */}
      <ProfileContactCard profile={profile} />

      {/* CARD DE DADOS PROFISSIONAIS */}
      <ProfileProfessionalCard profile={profile} currentRole={currentRole} />

      {/* BOTÃO DE ALTERAR SENHA VIA OTP */}
      <View style={styles.actionButtonContainer}>
        <Button
          text="Trocar Senha"
          variant="outline"
          onPress={() => setShowPasswordResetModal(true)}
          leftIcon={
            <MaterialDesignIcons
              name="shield-key-outline"
              size={18}
              color={theme.colors.primary}
            />
          }
        />
      </View>

      {/* BOTÃO DE LOGOUT */}
      <View style={styles.logoutButtonContainer}>
        <Button
          text="Sair da Conta"
          variant="warning"
          onPress={() =>
            showConfirm(
              "Confirmar Saída",
              "Deseja realmente sair da sua conta?",
              handleLogout,
              { confirmText: "Sair" },
            )
          }
        />
      </View>

      {/* MODAL DE TROCA DE SENHA VIA OTP */}
      <PasswordResetOtpModal
        visible={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        initialRegistration={profile?.registration || ""}
        lockRegistration={Boolean(profile?.registration)}
        title="Alterar Senha"
        onSuccess={(message) => {
          showAlert("success", "Senha Alterada", message);
        }}
      />

      <AlertModal />

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
  actionButtonContainer: {
    marginTop: 8,
    width: "100%",
  },
  logoutButtonContainer: {
    marginTop: 4,
    width: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default ProfileScreen;
