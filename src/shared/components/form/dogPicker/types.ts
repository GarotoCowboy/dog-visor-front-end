import { IDogResponse } from "../../../../types/Dog";

export interface DogPickerFieldProps {
  label?: string;
  placeholder?: string;
  selectedDog?: IDogResponse | null;
  selectedDogId?: string;
  onSelectDog: (dog: IDogResponse) => void;
  dogs?: IDogResponse[];
  filterFn?: (dog: IDogResponse) => boolean;
  isDogDisabled?: (dog: IDogResponse) => { disabled: boolean; reason?: string };
  disabled?: boolean;
  required?: boolean;
  error?: string;
  modalTitle?: string;
  modalSubtitle?: string;
}
