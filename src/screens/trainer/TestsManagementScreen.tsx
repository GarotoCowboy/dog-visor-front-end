import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { theme } from "../../../theme/theme";
import { OfflineStatusBanner } from "./components/OfflineStatusBanner";
import { TestItemCard } from "./components/TestItemCard";
import { CreateTestModal } from "./components/CreateTestModal";
import { useAlert } from "../../hooks/useAlert";
import { IDogTest, TestStatus, TestType } from "../../types/Training";
import {
  TestFilterTab,
  TestsBottomBar,
  TestsEmptyState,
  TestsFilterTabs,
  TestsSearchBar,
  useTestsManagement,
} from "./components/testsManagement";

export const TestsManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TestFilterTab>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingTest, setEditingTest] = useState<IDogTest | null>(null);
  const [initialTestType, setInitialTestType] = useState<TestType>(
    TestType.VOLHARD,
  );

  const { showAlert, AlertModal } = useAlert();

  const {
    tests,
    availableDogs,
    loading,
    refreshing,
    onRefresh,
    handleSaveTest,
  } = useTestsManagement({
    onShowAlert: showAlert,
  });

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
        <TestsSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* TABS DE STATUS */}
        <TestsFilterTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

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
              <TestsEmptyState
                searchQuery={searchQuery}
                activeTab={activeTab}
              />
            }
          />
        )}
      </View>

      {/* BARRA INFERIOR DE AÇÕES (VOLHARD / BEHAVIOR) */}
      <TestsBottomBar
        bottomInset={insets.bottom}
        onNewVolhardTest={() => {
          setEditingTest(null);
          setInitialTestType(TestType.VOLHARD);
          setCreateModalVisible(true);
        }}
        onNewBehaviorTest={() => {
          setEditingTest(null);
          setInitialTestType(TestType.BEHAVIOR);
          setCreateModalVisible(true);
        }}
      />

      {/* MODAL DE CRIAÇÃO E EDIÇÃO DE TESTES */}
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
    gap: 12,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
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
});
