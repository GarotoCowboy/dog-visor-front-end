import { IDogResponse } from "../../../../types/Dog";

export type DogTestGroupStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface DogTestBadgeInfo {
  status: DogTestGroupStatus;
  label: string;
}

export interface DogPickerFieldProps {
  label?: string;
  placeholder?: string;
  selectedDog?: IDogResponse | null;
  selectedDogId?: string;
  onSelectDog: (dog: IDogResponse) => void;
  dogs?: IDogResponse[];
  filterFn?: (dog: IDogResponse) => boolean;
  isDogDisabled?: (dog: IDogResponse) => { disabled: boolean; reason?: string };
  getDogTestBadge?: (dog: IDogResponse) => DogTestBadgeInfo | undefined;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  modalTitle?: string;
  modalSubtitle?: string;
}
