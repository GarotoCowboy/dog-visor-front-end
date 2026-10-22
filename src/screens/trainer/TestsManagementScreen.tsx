import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../theme/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OfflineStatusBanner } from "./components/OfflineStatusBanner";
import { TestItemCard } from "./components/TestItemCard";
import { CreateTestModal } from "./components/CreateTestModal";
import { useAlert } from "../../hooks/useAlert";
import {
  DualHandler,
  IBehaviorTestResponse,
  ICreateBehaviorTestRequest,
  ICreateVolhardTestRequest,
  IDogTest,
  IVolhardTestResponse,
  MovementGait,
  RelationshipSkill,
  ScoreComparison,
  ScoreComparisonLabel,
  StructureType,
  TestStatus,
  TestType,
  WorkSpeed,
} from "../../types/Training";
import { formatDogRace, IDogResponse } from "../../types/Dog";
import {
  createBehaviorTestService,
  createVolhardTestService,
  getDogsService,
  getLoggedUserProfileService,
  listBehaviorTestsService,
  listVolhardTestsService,
  updateBehaviorTestService,
  updateVolhardTestService,
} from "../../service/api";
import {
  enqueueSyncAction,
  getCachedTests,
  getCachedTrainings,
  saveCachedTests,
} from "../../service/trainingOfflineService";
import { trainingSyncService } from "../../service/trainingSyncService";
import {
  decodeBehaviorResultProgress,
  decodeVolhardResultProgress,
} from "./constants/testQuestionsData";

import { getEmployeeIdentifier } from "../../types/User";
type TestFilterTab = "PENDING" | "COMPLETED" | "ALL";

const toIsoDate = (dateStr: string): string => {
  if (!dateStr) {
    return new Date().toISOString().split("T")[0];
  }
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return dateStr.split("T")[0];
};

export const TestsManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TestFilterTab>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [tests, setTests] = useState<IDogTest[]>([]);
  const [availableDogs, setAvailableDogs] = useState<IDogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingTest, setEditingTest] = useState<IDogTest | null>(null);
  const [initialTestType, setInitialTestType] = useState<TestType>(
    TestType.VOLHARD,
  );

  const { showAlert, AlertModal } = useAlert();

  /**
   * Carrega os testes e cães do cache e da rede se disponível
   */
  const loadData = useCallback(async () => {
    try {
      // 1. Carrega testes do cache local
      const cachedTests = await getCachedTests();
      setTests(cachedTests || []);

      // 2. Busca cães disponíveis para o modal de cadastro
      let dogsList: IDogResponse[] = [];
      try {
        const dogsRes = await getDogsService();
        dogsList = dogsRes;
        setAvailableDogs(dogsRes);
      } catch (dogErr) {
        console.log("Modo offline: cães carregados do cache local");
        try {
          const cachedTrainings = await getCachedTrainings();
          if (cachedTrainings && cachedTrainings.length > 0) {
            dogsList = cachedTrainings.map((ct) => ({
              ID: ct.dogId,
              name: ct.dogsName,
              race: ct.dogsBreed as any,
              sex: (ct.dogSex as any) || "M",
              status: null,
              avatarKey: ct.avatarKey || "male-dog-000",
              dateOfBirth: "",
              createdAt: "",
              updatedAt: "",
            }));
            setAvailableDogs(dogsList);
          }
        } catch (cacheDogErr) {}
      }

      const dogMap = new Map<string, IDogResponse>();
      dogsList.forEach((d) => {
        const dId = d.ID;
        if (dId) dogMap.set(String(dId).toLowerCase(), d);
      });

      const enrichWithDogAvatar = (testList: IDogTest[]): IDogTest[] =>
        testList.map((t) => {
          const matchedDog = t.dogId
            ? dogMap.get(String(t.dogId).toLowerCase())
            : undefined;
          if (!matchedDog) return t;
          return {
            ...t,
            dogsName: matchedDog.name || t.dogsName,
            dogsBreed: formatDogRace(matchedDog.race) || t.dogsBreed,
            avatarKey: matchedDog.avatarKey || t.avatarKey,
          };
        });

      if (cachedTests && cachedTests.length > 0 && dogMap.size > 0) {
        setTests(enrichWithDogAvatar(cachedTests));
      }

      // 3. Se online, busca testes das novas rotas de Volhard e Behavior do backend
      const isOnline = await trainingSyncService.checkIsOnline();
      if (isOnline) {
        try {
          const [volhardsRes, behaviorsRes] = await Promise.allSettled([
            listVolhardTestsService(),
            listBehaviorTestsService(),
          ]);

          const volhardItems: IVolhardTestResponse[] =
            volhardsRes.status === "fulfilled" && Array.isArray(volhardsRes.value)
              ? volhardsRes.value
              : [];

          const behaviorItems: IBehaviorTestResponse[] =
            behaviorsRes.status === "fulfilled" && Array.isArray(behaviorsRes.value)
              ? behaviorsRes.value
              : [];

          const fetchedTests: IDogTest[] = [];
          const cachedById = new Map<string, IDogTest>(
            (cachedTests || []).map((c) => [c.id, c]),
          );

          volhardItems.forEach((v) => {
            const dog = v.dogId ? dogMap.get(String(v.dogId).toLowerCase()) : undefined;
            const cachedMatch = cachedById.get(v.id);
            const decoded = decodeVolhardResultProgress(
              v.result,
              cachedMatch?.answeredVolhardKeys,
            );
            fetchedTests.push({
              id: v.id,
              dogId: v.dogId,
              dogsName: dog?.name || cachedMatch?.dogsName || "Cão",
              dogsBreed:
                formatDogRace(dog?.race) ||
                cachedMatch?.dogsBreed ||
                "Raça não informada",
              avatarKey: dog?.avatarKey || cachedMatch?.avatarKey,
              type: TestType.VOLHARD,
              title: "Teste Volhard",
              date: v.date || "",
              description: decoded.cleanDescription,
              score: decoded.isCompleted
                ? `Estabilidade: ${v.stability}/5`
                : `Em andamento: ${decoded.completedCount}/${decoded.totalCount} etapas`,
              status: decoded.isCompleted
                ? TestStatus.COMPLETED
                : TestStatus.PENDING,
              completedCount: decoded.completedCount,
              totalCount: decoded.totalCount,
              answeredVolhardKeys: decoded.answeredKeys,
              isSynced: true,
              volhardDetails: v,
            });
          });

          behaviorItems.forEach((b) => {
            const dog = b.dogId ? dogMap.get(String(b.dogId).toLowerCase()) : undefined;
            const cachedMatch = cachedById.get(b.id);
            const decoded = decodeBehaviorResultProgress(
              b.result,
              b.characteristics,
              cachedMatch?.answeredBehaviorNumbers,
            );
            const compLabel = b.scoreComparison
              ? ScoreComparisonLabel[b.scoreComparison] || b.scoreComparison
              : "Concluído";
            fetchedTests.push({
              id: b.id,
              dogId: b.dogId,
              dogsName: dog?.name || cachedMatch?.dogsName || "Cão",
              dogsBreed:
                formatDogRace(dog?.race) ||
                cachedMatch?.dogsBreed ||
                "Raça não informada",
              avatarKey: dog?.avatarKey || cachedMatch?.avatarKey,
              type: TestType.BEHAVIOR,
              title: "Teste Behavior",
              date: b.date || "",
              description: decoded.cleanDescription,
              score: decoded.isCompleted
                ? compLabel
                : `Em andamento: ${decoded.completedCount}/${decoded.totalCount} aspectos`,
              status: decoded.isCompleted
                ? TestStatus.COMPLETED
                : TestStatus.PENDING,
              completedCount: decoded.completedCount,
              totalCount: decoded.totalCount,
              answeredBehaviorNumbers: decoded.answeredNumbers,
              isSynced: true,
              behaviorDetails: b,
            });
          });

          if (fetchedTests.length > 0) {
            // Preserva itens locais ainda não sincronizados
            const unsyncedLocal = enrichWithDogAvatar(
              (cachedTests || []).filter((t) => t.isSynced === false),
            );
            const merged = [...unsyncedLocal, ...fetchedTests];
            // Remove duplicatas por id
            const unique = Array.from(
              new Map(merged.map((item) => [item.id, item])).values(),
            );
            setTests(unique);
            await saveCachedTests(unique);
          }
        } catch (apiErr) {
          console.log("Erro ao buscar testes online da API:", apiErr);
        }
      }
    } catch (e) {
      console.log("Erro ao carregar lista de testes:", e);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await trainingSyncService.processQueue();
    await loadData();
    setRefreshing(false);
  };

  /**
   * Salva um novo teste ou atualiza um teste em andamento (offline-first com integração aos endpoints da API)
   */
  const handleSaveTest = async (
    testData: Omit<IDogTest, "id">,
    existingId?: string,
  ) => {
    try {
      const isOnline = await trainingSyncService.checkIsOnline();
      const isoDate = toIsoDate(testData.date);

      // Obtém ID do treinador autenticado
      let trainerId = "00000000-0000-0000-0000-000000000000";
      try {
        const userProfile = await getLoggedUserProfileService();
        trainerId = getEmployeeIdentifier(userProfile) || trainerId;
      } catch (profileErr) {
        // fallback
      }

      let createdOnline = false;
      let remoteId: string | null =
        existingId && !existingId.startsWith("test_") ? existingId : null;
      const isRemoteUpdate = Boolean(remoteId);

      if (testData.type === TestType.VOLHARD) {
        const volhardDto: ICreateVolhardTestRequest = testData.volhardPayload
          ? {
              ...testData.volhardPayload,
              trainerId: testData.volhardPayload.trainerId || trainerId,
              date: isoDate,
            }
          : {
              trainerId,
              dogId: testData.dogId,
              testType: "VOLHARD",
              date: isoDate,
              result: testData.description || "Apto para socialização",
              socialAttraction: 3,
              following: 3,
              restraint: 3,
              socialDominance: 3,
              elevationDominance: 3,
              retrieving: 3,
              touchSensitivity: 3,
              soundSensitivity: 3,
              stability: 3,
              structure: {
                straightFront: StructureType.BOA,
                shoulderAngulation: StructureType.BOA,
                croupAngulation: StructureType.ACEITAVEL,
                straightRear: StructureType.BOA,
                rearAngulation: StructureType.ACEITAVEL,
                elbowAngulation: StructureType.BOA,
              },
            };

        if (isOnline) {
          try {
            if (isRemoteUpdate && remoteId) {
              const res = await updateVolhardTestService(remoteId, volhardDto);
              createdOnline = true;
              remoteId = res.id || remoteId;
            } else {
              const res = await createVolhardTestService(volhardDto);
              createdOnline = true;
              remoteId = res.id;
            }
          } catch (apiErr) {
            console.log("Erro ao chamar API de Volhard, gravando na fila:", apiErr);
            await enqueueSyncAction({
              actionType: isRemoteUpdate
                ? "UPDATE_VOLHARD_TEST"
                : "CREATE_VOLHARD_TEST",
              endpoint: isRemoteUpdate
                ? `/api/v1/dogtraining/volhard/update/${remoteId}`
                : "/api/v1/dogtraining/volhard",
              method: isRemoteUpdate ? "PATCH" : "POST",
              payload: volhardDto,
            });
          }
        } else {
          await enqueueSyncAction({
            actionType: isRemoteUpdate
              ? "UPDATE_VOLHARD_TEST"
              : "CREATE_VOLHARD_TEST",
            endpoint: isRemoteUpdate
              ? `/api/v1/dogtraining/volhard/update/${remoteId}`
              : "/api/v1/dogtraining/volhard",
            method: isRemoteUpdate ? "PATCH" : "POST",
            payload: volhardDto,
          });
        }
      } else {
        const behaviorDto: ICreateBehaviorTestRequest = testData.behaviorPayload
          ? {
              ...testData.behaviorPayload,
              trainerId: testData.behaviorPayload.trainerId || trainerId,
              date: isoDate,
            }
          : {
              trainerId,
              dogId: testData.dogId,
              testType: "BEHAVIOR",
              date: isoDate,
              result: testData.description || "Teste Behavior",
              dualHandler: DualHandler.TRABALHA_BEM,
              relationshipSkill: RelationshipSkill.MUITO_HABIL,
              scoreComparison: ScoreComparison.CAO_FLEXIVEL,
              workSpeed: WorkSpeed.MODERADO,
              movementGait: MovementGait.MANTEM_TROTE,
              characteristics: [],
            };

        if (isOnline) {
          try {
            if (isRemoteUpdate && remoteId) {
              const res = await updateBehaviorTestService(
                remoteId,
                behaviorDto,
              );
              createdOnline = true;
              remoteId = res.id || remoteId;
            } else {
              const res = await createBehaviorTestService(behaviorDto);
              createdOnline = true;
              remoteId = res.id;
            }
          } catch (apiErr) {
            console.log("Erro ao chamar API de Behavior, gravando na fila:", apiErr);
            await enqueueSyncAction({
              actionType: isRemoteUpdate
                ? "UPDATE_BEHAVIOR_TEST"
                : "CREATE_BEHAVIOR_TEST",
              endpoint: isRemoteUpdate
                ? `/api/v1/dogtraining/behavior/update/${remoteId}`
                : "/api/v1/dogtraining/behavior",
              method: isRemoteUpdate ? "PATCH" : "POST",
              payload: behaviorDto,
            });
          }
        } else {
          await enqueueSyncAction({
            actionType: isRemoteUpdate
              ? "UPDATE_BEHAVIOR_TEST"
              : "CREATE_BEHAVIOR_TEST",
            endpoint: isRemoteUpdate
              ? `/api/v1/dogtraining/behavior/update/${remoteId}`
              : "/api/v1/dogtraining/behavior",
            method: isRemoteUpdate ? "PATCH" : "POST",
            payload: behaviorDto,
          });
        }
      }

      const finalId =
        remoteId ||
        existingId ||
        `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const newTest: IDogTest = {
        ...testData,
        id: finalId,
        isSynced: createdOnline,
      };

      const filteredExisting = existingId
        ? tests.filter((t) => t.id !== existingId && t.id !== finalId)
        : tests;
      const updatedTests = [newTest, ...filteredExisting];
      setTests(updatedTests);
      await saveCachedTests(updatedTests);
      setEditingTest(null);

      const isCompletedNow = testData.status === TestStatus.COMPLETED;
      const progressLabel =
        testData.completedCount !== undefined &&
        testData.totalCount !== undefined
          ? ` (${testData.completedCount}/${testData.totalCount})`
          : "";

      if (createdOnline) {
        showAlert(
          "success",
          isCompletedNow ? "Teste Concluído!" : "Progresso Salvo!",
          isCompletedNow
            ? `Todos os itens${progressLabel} foram preenchidos e o teste foi registrado como Concluído!`
            : `O progresso parcial${progressLabel} foi salvo como Pendente no servidor. Você pode continuar os demais testes em outro dia!`,
        );
      } else if (isOnline) {
        showAlert(
          "warning",
          "Salvo Localmente",
          "Serviço temporariamente indisponível. O progresso foi gravado no dispositivo e sincronizará em breve.",
        );
      } else {
        showAlert(
          "warning",
          "Salvo Offline",
          "O progresso do teste foi gravado com segurança no dispositivo e será sincronizado quando houver internet.",
        );
      }
    } catch (error) {
      console.log("Erro ao salvar teste:", error);
      showAlert("error", "Erro ao Salvar", "Não foi possível registrar o teste.");
    }
  };


  // Filtragem dos testes por aba e busca
  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.dogsName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.dogsBreed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "PENDING") {
      return t.status === TestStatus.PENDING;
    }
    if (activeTab === "COMPLETED") {
      return t.status === TestStatus.COMPLETED;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <OfflineStatusBanner />

      <View style={styles.content}>
        {/* BARRA DE PESQUISA */}
        <View style={styles.searchContainer}>
          <MaterialDesignIcons name="magnify" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cão ou tipo de teste..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialDesignIcons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* TABS DE STATUS (IMAGE 3: Pendentes, Concluídos, Todos) */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "PENDING" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("PENDING")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "PENDING" && styles.tabButtonTextActive,
              ]}
            >
              Pendentes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "COMPLETED" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("COMPLETED")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "COMPLETED" && styles.tabButtonTextActive,
              ]}
            >
              Concluídos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "ALL" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("ALL")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "ALL" && styles.tabButtonTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
        </View>

        {/* LISTA DE TESTES */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando testes...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TestItemCard
                test={item}
                onPress={() => {
                  setEditingTest(item);
                  setInitialTestType(item.type);
                  setCreateModalVisible(true);
                }}
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
                  name="clipboard-text-outline"
                  size={42}
                  color="#D1D5DB"
                />
                <Text style={styles.emptyTitle}>Nenhum teste encontrado</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? "Tente buscar por outro termo ou nome de cão."
                    : activeTab === "PENDING"
                    ? "Não há testes pendentes no momento."
                    : "Nenhum teste cadastrado nesta categoria."}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* BARRA INFERIOR COM BOTÕES PARA NOVO VOLHARD E NOVO BEHAVIOR */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={[styles.newTestButton, { flex: 1 }]}
            onPress={() => {
              setEditingTest(null);
              setInitialTestType(TestType.VOLHARD);
              setCreateModalVisible(true);
            }}
            activeOpacity={0.85}
          >
            <MaterialDesignIcons
              name="clipboard-check-outline"
              size={18}
              color={theme.colors.white}
            />
            <Text style={styles.newTestButtonText} numberOfLines={1}>
              Teste Volhard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.newTestButton,
              styles.newBehaviorButton,
              { flex: 1 },
            ]}
            onPress={() => {
              setEditingTest(null);
              setInitialTestType(TestType.BEHAVIOR);
              setCreateModalVisible(true);
            }}
            activeOpacity={0.85}
          >
            <MaterialDesignIcons
              name="paw"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.newTestButtonText,
                { color: theme.colors.primary },
              ]}
              numberOfLines={1}
            >
              Teste Behavior
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL DE CRIAÇÃO DE TESTE (VOLHARD & BEHAVIOR) */}
      {createModalVisible && (
        <CreateTestModal
          visible={createModalVisible}
          onClose={() => {
            setCreateModalVisible(false);
            setEditingTest(null);
          }}
          onSave={handleSaveTest}
          availableDogs={availableDogs}
          initialTestType={initialTestType}
          editingTest={editingTest}
          existingTests={tests}
        />
      )}

      {/* ALERTA CUSTOMIZADO */}
      <AlertModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: theme.borderRadius.md,
    padding: 3,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    ...theme.shadows.sm,
  },
  tabButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
  },
  tabButtonTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  listContent: {
    gap: 12,
    paddingBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: "#6B7280",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: "#4B5563",
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  bottomBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    ...theme.shadows.md,
    elevation: 8,
  },
  bottomButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  newTestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#2E6B65",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  newBehaviorButton: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#2E6B65",
  },
  newTestButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
});
