import { useCallback, useEffect, useState } from "react";
import { IDogTest, TestStatus } from "../../../../../types/Training";
import { IDogResponse } from "../../../../../types/Dog";
import { trainingSyncService } from "../../../../../service/trainingSyncService";
import {
  fetchAllTestsAndDogs,
  persistDogTest,
} from "../../../services/testManagementService";

interface UseTestsManagementProps {
  onShowAlert: (
    variant: "success" | "warning" | "error",
    title: string,
    message: string,
  ) => void;
}

export const useTestsManagement = ({ onShowAlert }: UseTestsManagementProps) => {
  const [tests, setTests] = useState<IDogTest[]>([]);
  const [availableDogs, setAvailableDogs] = useState<IDogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchAllTestsAndDogs();
      setTests(data.tests);
      setAvailableDogs(data.availableDogs);
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

  const handleSaveTest = async (
    testData: Omit<IDogTest, "id">,
    existingId?: string,
  ) => {
    try {
      const { updatedTests, createdOnline, isOnline } = await persistDogTest(
        testData,
        tests,
        existingId,
      );

      setTests(updatedTests);

      const isCompletedNow = testData.status === TestStatus.COMPLETED;
      const progressLabel =
        testData.completedCount !== undefined && testData.totalCount !== undefined
          ? ` (${testData.completedCount}/${testData.totalCount})`
          : "";

      if (createdOnline) {
        onShowAlert(
          "success",
          isCompletedNow ? "Teste Concluído!" : "Progresso Salvo!",
          isCompletedNow
            ? `Todos os itens${progressLabel} foram preenchidos e o teste foi registrado como Concluído!`
            : `O progresso parcial${progressLabel} foi salvo como Pendente no servidor. Você pode continuar os demais testes em outro dia!`,
        );
      } else if (isOnline) {
        onShowAlert(
          "warning",
          "Salvo Localmente",
          "Serviço temporariamente indisponível. O progresso foi gravado no dispositivo e sincronizará em breve.",
        );
      } else {
        onShowAlert(
          "warning",
          "Salvo Offline",
          "O progresso do teste foi gravado com segurança no dispositivo e será sincronizado quando houver internet.",
        );
      }
    } catch (error) {
      console.log("Erro ao salvar teste:", error);
      onShowAlert("error", "Erro ao Salvar", "Não foi possível registrar o teste.");
    }
  };

  return {
    tests,
    availableDogs,
    loading,
    refreshing,
    onRefresh,
    handleSaveTest,
  };
};
