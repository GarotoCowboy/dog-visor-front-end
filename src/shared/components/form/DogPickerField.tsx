import React, { useEffect, useMemo, useState } from "react";
import { formatDogRace, IDogResponse } from "../../../types/Dog";
import { getDogsService } from "../../../service/api";
import {
  DogPickerFieldProps,
  DogPickerModal,
  DogPickerTrigger,
} from "./dogPicker";

export type { DogPickerFieldProps };

export const DogPickerField: React.FC<DogPickerFieldProps> = ({
  label = "Cão",
  placeholder = "Selecione um cão...",
  selectedDog: propSelectedDog,
  selectedDogId,
  onSelectDog,
  dogs: propDogs,
  filterFn,
  isDogDisabled,
  disabled = false,
  required = false,
  error,
  modalTitle = "Selecionar Cão",
  modalSubtitle = "Busque pelo nome ou raça do cão",
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [internalDogs, setInternalDogs] = useState<IDogResponse[]>([]);
  const [loadingDogs, setLoadingDogs] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (propDogs && propDogs.length > 0) {
      setInternalDogs(propDogs);
      return;
    }

    let isMounted = true;
    const fetchDogs = async () => {
      try {
        setLoadingDogs(true);
        const data = await getDogsService();
        if (isMounted && Array.isArray(data)) {
          setInternalDogs(data);
        }
      } catch (err) {
        console.log("Erro ao carregar lista de cães no DogPickerField:", err);
      } finally {
        if (isMounted) setLoadingDogs(false);
      }
    };

    fetchDogs();
    return () => {
      isMounted = false;
    };
  }, [propDogs]);

  useEffect(() => {
    if (propDogs && propDogs.length > 0) {
      setInternalDogs(propDogs);
    }
  }, [propDogs]);

  const activeDog = useMemo(() => {
    if (propSelectedDog) return propSelectedDog;
    if (selectedDogId && internalDogs.length > 0) {
      return internalDogs.find((d) => d.ID === selectedDogId) || null;
    }
    return null;
  }, [propSelectedDog, selectedDogId, internalDogs]);

  const filteredDogs = useMemo(() => {
    let list = internalDogs;
    if (filterFn) {
      list = list.filter(filterFn);
    }
    const q = searchText.trim().toLowerCase();
    if (!q) return list;

    return list.filter((dog) => {
      const name = (dog.name || "").toLowerCase();
      const race = dog.race ? formatDogRace(dog.race).toLowerCase() : "";
      return name.includes(q) || race.includes(q);
    });
  }, [internalDogs, filterFn, searchText]);

  const handleSelect = (dog: IDogResponse) => {
    if (isDogDisabled) {
      const check = isDogDisabled(dog);
      if (check.disabled) return;
    }
    onSelectDog(dog);
    setModalVisible(false);
    setSearchText("");
  };

  return (
    <>
      <DogPickerTrigger
        label={label}
        placeholder={placeholder}
        activeDog={activeDog}
        loadingDogs={loadingDogs}
        disabled={disabled}
        required={required}
        error={error}
        onPress={() => {
          if (!disabled) {
            setSearchText("");
            setModalVisible(true);
          }
        }}
      />

      <DogPickerModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSearchText("");
        }}
        onSelectDog={handleSelect}
        filteredDogs={filteredDogs}
        activeDog={activeDog}
        loadingDogs={loadingDogs}
        searchText={searchText}
        onSearchChange={setSearchText}
        isDogDisabled={isDogDisabled}
        modalTitle={modalTitle}
        modalSubtitle={modalSubtitle}
      />
    </>
  );
};
