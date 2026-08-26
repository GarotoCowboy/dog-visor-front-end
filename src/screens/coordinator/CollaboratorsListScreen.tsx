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
import { useFocusEffect } from "@react-navigation/native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../theme/theme";
import {
  getCollaboratorsService,
  getCoordinatorsService,
  getTrainersService,
  getVeterinariansService,
  listUsersService,
} from "../../service/api";
import { Card } from "../../shared/components/CardComponent";
import FormComponent from "../../shared/components/FormComponent";
import {
  EmployeeShiftLabel,
  EmployeeType,
  EmployeeTypeLabel,
  UserProfileResponse,
} from "../../types/User";

type FilterType = "ALL" | EmployeeType;

export const CollaboratorsListScreen = () => {
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("ALL");

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Busca dados combinados de funcionários e detalhes por role
      const [allEmployeesResult, vetsResult, trainersResult, coordsResult, collabsResult] =
        await Promise.allSettled([
          listUsersService(),
          getVeterinariansService(),
          getTrainersService(),
          getCoordinatorsService(),
          getCollaboratorsService(),
        ]);

      const baseEmployees =
        allEmployeesResult.status === "fulfilled" ? allEmployeesResult.value : [];
      const vets = vetsResult.status === "fulfilled" ? vetsResult.value : [];
      const trainers = trainersResult.status === "fulfilled" ? trainersResult.value : [];
      const coords = coordsResult.status === "fulfilled" ? coordsResult.value : [];
      const collabs = collabsResult.status === "fulfilled" ? collabsResult.value : [];

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

  const getRoleBadgeColor = (type?: EmployeeType) => {
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

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: "Todos", value: "ALL" },
    { label: "Veterinários", value: EmployeeType.VETERINARIAN },
    { label: "Adestradores", value: EmployeeType.TRAINER },
    { label: "Coordenadores", value: EmployeeType.COORDINATOR },
    { label: "Colaboradores", value: EmployeeType.COLLABORATOR },
  ];

  const renderUserItem = ({ item }: { item: UserProfileResponse }) => {
    const roleColor = getRoleBadgeColor(item.type);
    const roleName = EmployeeTypeLabel[item.type] || item.type || "Colaborador";
    const shiftText =
      item.shift && EmployeeShiftLabel[item.shift]
        ? EmployeeShiftLabel[item.shift]
        : item.shift || "Não informado";

    const crmv = (item as any)?.crmv || (item as any)?.CRMV;
    const areaOfExpertise =
      (item as any)?.areaOfExpertise || (item as any)?.area_of_expertise;

    return (
      <View style={styles.cardWrapper}>
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
                      { backgroundColor: theme.colors.background, borderColor: roleColor },
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
          </View>
        </Card>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* BARRA DE PESQUISA */}
      <View style={styles.searchWrapper}>
        <FormComponent
          placeholder="Buscar por nome, matrícula, email..."
          value={search}
          onChangeText={setSearch}
          leftIcon={
            <FontAwesomeFreeSolid
              name="magnifying-glass"
              size={theme.typography.fontSize.base}
              color={theme.colors.secondary}
            />
          }
        />
      </View>

      {/* CHIPS DE FILTRO */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = selectedFilter === item.value;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                ]}
                onPress={() => setSelectedFilter(item.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* CONTADOR DE USUÁRIOS */}
      <View style={styles.headerInfoRow}>
        <Text style={styles.resultsCountText}>
          {filteredUsers.length}{" "}
          {filteredUsers.length === 1 ? "colaborador ativo" : "colaboradores ativos"}
        </Text>
      </View>

      {/* LISTA DE USUÁRIOS */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando colaboradores...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item, index) =>
            item.registration ||
            (item as any).employeeId ||
            (item as any).collaboratorId ||
            (item as any).userId ||
            index.toString()
          }
          renderItem={renderUserItem}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterContainer: {
    paddingVertical: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  filterChipTextSelected: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
  },
  headerInfoRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsCountText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  cardWrapper: {
    width: "100%",
  },
  userCardContent: {
    padding: 12,
    gap: 10,
  },
  userCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.sm,
  },
  nameContainer: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2E7D32",
  },
  activeBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: "#2E7D32",
  },
  inactiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C62828",
  },
  inactiveBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: "#C62828",
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
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
    minWidth: 70,
  },
  detailValue: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.medium,
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
});

export default CollaboratorsListScreen;
