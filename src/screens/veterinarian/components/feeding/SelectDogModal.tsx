import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import FormComponent from "../../../../shared/components/FormComponent";
import { DogRaceLabel, formatDogRace, IDogResponse } from "../../../../types/Dog";
import { getDogImageSource } from "../../../../utils/dogAvatar";

interface SelectDogModalProps {
  visible: boolean;
  onClose: () => void;
  dogs: IDogResponse[];
  selectedDog: IDogResponse | null;
  onSelectDog: (dog: IDogResponse) => void;
  isDogInKennel: (dog: IDogResponse) => boolean;
  dogHasActivePlan: (dogId: string) => boolean;
}

export const SelectDogModal: React.FC<SelectDogModalProps> = ({
  visible,
  onClose,
  dogs,
  selectedDog,
  onSelectDog,
  isDogInKennel,
  dogHasActivePlan,
}) => {
  const [dogSearchText, setDogSearchText] = useState("");

  const filteredDogs = dogs.filter((dog) => {
    const text = dogSearchText.toLowerCase();
    const nameMatch = (dog.name || "").toLowerCase().includes(text);
    const breedMatch = dog.race
      ? (DogRaceLabel[dog.race] || "").toLowerCase().includes(text)
      : false;
    return nameMatch || breedMatch;
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalBody}>
          <View style={styles.modalHeaderRow}>
            <View style={styles.modalHeaderTitleBox}>
              <Text style={styles.modalTitle}>Selecione o Cão</Text>
              <Text style={styles.modalSubtitle}>
                Apenas cães residentes no canil sem plano ativo
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialDesignIcons
                name="close"
                size={22}
                color={theme.colors.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* CAMPO DE PESQUISA DE CÃO */}
          <View style={styles.modalSearchContainer}>
            <FormComponent
              placeholder="Procurar cão pelo nome ou raça..."
              value={dogSearchText}
              onChangeText={setDogSearchText}
            />
          </View>

          <ScrollView
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
          >
            {filteredDogs.length === 0 ? (
              <Text style={styles.modalEmptyText}>Nenhum cão encontrado.</Text>
            ) : (
              filteredDogs.map((dog) => {
                const dogId = dog.ID;
                const inKennel = isDogInKennel(dog);
                const hasPlan = dogHasActivePlan(dogId);
                const isDisabled = !inKennel || hasPlan;

                return (
                  <TouchableOpacity
                    key={dogId}
                    style={[
                      styles.modalListItem,
                      isDisabled && styles.modalListItemDisabled,
                      selectedDog?.ID === dogId && styles.modalListItemActive,
                    ]}
                    onPress={() => onSelectDog(dog)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={getDogImageSource(dog)}
                      style={styles.modalDogAvatar}
                    />

                    <View style={styles.modalDogInfo}>
                      <Text
                        style={[
                          styles.modalDogName,
                          isDisabled && styles.modalDogNameDisabled,
                        ]}
                      >
                        {dog.name}
                      </Text>
                      <Text style={styles.modalDogBreed}>
                        {dog.race
                          ? formatDogRace(dog.race)
                          : "Raça não informada"}
                      </Text>
                    </View>

                    <View style={styles.badgesCol}>
                      <View
                        style={[
                          styles.kennelBadge,
                          inKennel
                            ? styles.kennelBadgeIn
                            : styles.kennelBadgeOut,
                        ]}
                      >
                        <Text
                          style={[
                            styles.kennelBadgeText,
                            inKennel
                              ? styles.kennelBadgeTextIn
                              : styles.kennelBadgeTextOut,
                          ]}
                        >
                          {inKennel ? "No Canil" : "Fora do Canil"}
                        </Text>
                      </View>

                      {hasPlan && (
                        <View style={styles.planBadge}>
                          <Text style={styles.planBadgeText}>Já tem plano</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBody: {
    width: "100%",
    maxHeight: "75%",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    gap: 12,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  modalHeaderTitleBox: {
    flex: 1,
    paddingRight: 8,
    gap: 2,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: "#6B7280",
  },
  modalSearchContainer: {
    marginTop: 4,
    marginBottom: 2,
  },
  modalList: {
    marginTop: 6,
  },
  modalEmptyText: {
    textAlign: "center",
    paddingVertical: 20,
    fontSize: theme.typography.fontSize.sm,
    color: "#9CA3AF",
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
  },
  modalListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  modalDogAvatar: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  modalListItemActive: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
  },
  modalListItemDisabled: {
    opacity: 0.45,
  },
  modalDogInfo: {
    gap: 2,
    flex: 1,
  },
  modalDogName: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  modalDogNameDisabled: {
    color: "#9CA3AF",
  },
  modalDogBreed: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.regular,
    color: "#6B7280",
  },
  badgesCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  kennelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  kennelBadgeIn: {
    backgroundColor: "#DCFCE7",
  },
  kennelBadgeOut: {
    backgroundColor: "#FEE2E2",
  },
  kennelBadgeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  kennelBadgeTextIn: {
    color: "#166534",
  },
  kennelBadgeTextOut: {
    color: "#991B1B",
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  planBadgeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: "#D97706",
  },
});
