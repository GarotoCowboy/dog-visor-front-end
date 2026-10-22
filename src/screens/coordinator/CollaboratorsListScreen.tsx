import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { SCREENS } from "../../consts/screens";
import { theme } from "../../../theme/theme";
import {
  getCollaboratorsService,
  getCoordinatorsService,
  getTrainersService,
  getVeterinariansService,
  inactivateUserService,
  listUsersService,
} from "../../service/api";
import {
  EmployeeType,
  EmployeeTypeLabel,
  UserProfileResponse,
  isSameUser,
  getEmployeeIdentifier,
} from "../../types/User";
import {
  CollaboratorFilterRow,
  CollaboratorFilterType,
  CollaboratorItemCard,
  UserDetailsModal,
} from "./components/collaborators";
import { useAlert } from "../../hooks/useAlert";

export const CollaboratorsListScreen = () => {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<CollaboratorFilterType>("ALL");

  const [selectedUser, setSelectedUser] = useState<UserProfileResponse | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const { showAlert, showConfirm, AlertModal } = useAlert();

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Busca dados combinados de funcionários e detalhes por role
      const [
        allEmployeesResult,
        vetsResult,
        trainersResult,
        coordsResult,
        collabsResult,
      ] = await Promise.allSettled([
        listUsersService(),
        getVeterinariansService(),
        getTrainersService(),
        getCoordinatorsService(),
        getCollaboratorsService(),
      ]);

      const baseEmployees =
        allEmployeesResult.status === "fulfilled"
          ? allEmployeesResult.value
          : [];
      const vets =
        vetsResult.status === "fulfilled" ? vetsResult.value : [];
      const trainers =
        trainersResult.status === "fulfilled" ? trainersResult.value : [];
      const coords =
        coordsResult.status === "fulfilled" ? coordsResult.value : [];
      const collabs =
        collabsResult.status === "fulfilled" ? collabsResult.value : [];

      // Mapeia e enriquece com dados específicos
      const enrichedMap = new Map<string, UserProfileResponse>();

      // 1. Adiciona os veterinários detalhados
      vets.forEach((v) => {
        const key = v.registration || v.userId || v.employeeId;
        if (key) enrichedMap.set(key, v);
      });

      // 2. Adiciona os adestradores detalhados
      trainers.forEach((t) => {
        const key = t.registration || t.userId || t.employeeId;
        if (key) enrichedMap.set(key, t);
      });

      // 3. Adiciona coordenadores detalhados
      coords.forEach((c) => {
        const key = c.registration || c.userId || c.employeeId;
        if (key) enrichedMap.set(key, c);
      });

      // 4. Adiciona colaboradores detalhados
      collabs.forEach((c) => {
        const key = c.registration || c.userId || c.collaboratorId;
        if (key) enrichedMap.set(key, c);
      });

      // 5. Inclui quaisquer outros da lista base que ainda não estejam no mapa
      baseEmployees.forEach((emp) => {
        const key = emp.registration || emp.userId || emp.employeeId;
        if (key && !enrichedMap.has(key)) {
          enrichedMap.set(key, emp as UserProfileResponse);
        }
      });

      const combinedUsers = Array.from(enrichedMap.values());
      setUsers(combinedUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários do sistema:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleOpenDetails = (user: UserProfileResponse) => {
    setSelectedUser(user);
    setDetailsModalVisible(true);
  };

  const handleRequestInactivate = (user: UserProfileResponse) => {
    showConfirm(
      "Inativar Usuário",
      `Tem certeza de que deseja inativar ${user.name || "este usuário"}? O acesso ao sistema será revogado.`,
      () => executeInactivate(user),
      { confirmText: "Sim, Inativar", cancelText: "Cancelar" },
    );
  };

  const executeInactivate = async (user: UserProfileResponse) => {
    try {
      await inactivateUserService(user);

      // Atualiza o estado da lista localmente para refletir ativo: false
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          return isSameUser(u, user) ? { ...u, active: false } : u;
        }),
      );

      // Se o modal de detalhes estiver aberto com este usuário, atualiza-o
      if (selectedUser && selectedUser.registration === user.registration) {
        setSelectedUser({ ...selectedUser, active: false });
      }

      showAlert(
        "success",
        "Sucesso!",
        `O usuário ${user.name || ""} foi inativado com sucesso.`,
      );
    } catch (error: any) {
      console.error("Erro ao inativar usuário:", error);
      showAlert(
        "error",
        "Erro ao Inativar",
        error?.response?.data?.message ||
          "Não foi possível inativar o usuário. Verifique sua conexão e tente novamente.",
      );
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesFilter =
      selectedFilter === "ALL" || user.type === selectedFilter;

    const searchTerm = search.toLowerCase().trim();
    const matchesSearch =
      !searchTerm ||
      user.name?.toLowerCase().includes(searchTerm) ||
      user.registration?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.phone?.toLowerCase().includes(searchTerm) ||
      (EmployeeTypeLabel[user.type] &&
        EmployeeTypeLabel[user.type].toLowerCase().includes(searchTerm));

    return matchesFilter && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <View style={styles.topHeaderTitleContainer}>
          <Text style={styles.screenTitle}>Equipe & Colaboradores</Text>
          <Text style={styles.screenSubtitle}>
            Gestão de membros da equipe
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate(SCREENS.CREATE_EMPLOYEE_SCREEN)}
          activeOpacity={0.8}
        >
          <FontAwesomeFreeSolid
            name="plus"
            size={12}
            color={theme.colors.white}
          />
          <Text style={styles.addButtonText}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      <CollaboratorFilterRow
        search={search}
        onSearchChange={setSearch}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        resultsCount={filteredUsers.length}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando colaboradores...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item, index) =>
            item.registration || getEmployeeIdentifier(item) || index.toString()
          }
          renderItem={({ item }) => (
            <CollaboratorItemCard
              item={item}
              onPress={handleOpenDetails}
              onInactivate={handleRequestInactivate}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialDesignIcons
                name="account-search-outline"
                size={54}
                color={theme.colors.text}
                style={{ opacity: 0.4 }}
              />
              <Text style={styles.emptyTitle}>Nenhum usuário encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? "Tente buscar com outros termos ou remover os filtros."
                  : "Não há colaboradores cadastrados no momento."}
              </Text>
            </View>
          }
        />
      )}

      {/* MODAL DE DETALHES DO USUÁRIO */}
      <UserDetailsModal
        visible={detailsModalVisible}
        user={selectedUser}
        onClose={() => setDetailsModalVisible(false)}
        onInactivate={(u) => {
          setDetailsModalVisible(false);
          handleRequestInactivate(u);
        }}
      />

      {/* ALERTA CUSTOMIZADO COM CONFIRMAÇÃO */}
      <AlertModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    opacity: 0.7,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  topHeaderTitleContainer: {
    flex: 1,
    gap: 2,
  },
  screenTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  screenSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.lg,
  },
  addButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
});

export default CollaboratorsListScreen;
