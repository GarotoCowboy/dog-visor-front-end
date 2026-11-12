import { useEffect, useState } from "react";
import {
  IDogTest,
  ITrainingReportResponse,
  ITrainingResponse,
} from "../../../../../types/Training";
import { fetchDogTestsAndTrainer } from "../../../services/trainingHistoryService";

interface UseTrainingHistoryDataProps {
  visible: boolean;
  training: ITrainingResponse | null;
  report: ITrainingReportResponse | null;
}

export const useTrainingHistoryData = ({
  visible,
  training,
  report,
}: UseTrainingHistoryDataProps) => {
  const [dogTests, setDogTests] = useState<IDogTest[]>([]);
  const [resolvedTrainingTrainerName, setResolvedTrainingTrainerName] =
    useState<string | undefined>(undefined);

  useEffect(() => {
    if (!visible || !training?.dogId) {
      setDogTests([]);
      setResolvedTrainingTrainerName(undefined);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      const result = await fetchDogTestsAndTrainer(
        training.dogId,
        report?.trainerId || training.trainerId,
        report?.trainerName || training.trainerName,
        training.dogsName,
        training.dogsBreed,
      );

      if (isMounted) {
        setDogTests(result.dogTests);
        setResolvedTrainingTrainerName(result.resolvedTrainerName);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [visible, training, report]);

  return {
    dogTests,
    resolvedTrainingTrainerName,
  };
};
