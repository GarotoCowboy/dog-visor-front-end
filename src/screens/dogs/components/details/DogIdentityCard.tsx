import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../../theme/theme";
import { Card } from "../../../../shared/components/CardComponent";
import { DogRaceLabel, DogStatusColor, DogStatusLabel, IDogResponse } from "../../../../types/Dog";
import { calculateAge } from "../../../../utils/calculateAge";

interface DogIdentityCardProps {
  dog: IDogResponse;
  imageSource: any;
  canEditDog: boolean;
  inKennel: boolean;
  isFemale: boolean;
  onEditStatus: () => void;
  formatDate: (dateStr?: string) => string;
}

export const DogIdentityCard: React.FC<DogIdentityCardProps> = ({
  dog,
  imageSource,
  canEditDog,
  inKennel,
  isFemale,
  onEditStatus,
  formatDate,
}) => {
  return (
    <Card>
      <View style={styles.headerSection}>
        <View style={styles.avatarContainer}>
          {imageSource ? (
            <Image source={imageSource} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarImage, styles.placeholderImage]}>
              <FontAwesomeFreeSolid name="dog" size={48} color="#9CA3AF" />
            </View>
          )}
        </View>

        <View style={styles.identityDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.dogNameText}>{dog.name}</Text>
            <MaterialDesignIcons
              name={dog.sex === "M" ? "gender-male" : "gender-female"}
              size={22}
              color={dog.sex === "M" ? "#0284C7" : "#BE185D"}
            />
          </View>

          <Text style={styles.dogBreedText}>
            {dog.race ? DogRaceLabel[dog.race] : "Raça não informada"}
          </Text>

          {/* BADGES DE STATUS E CANIL */}
          <View style={styles.badgesContainer}>
            <View
              style={[
                styles.statusBadge,
                dog.status && DogStatusColor[dog.status]
                  ? { backgroundColor: DogStatusColor[dog.status].bg }
                  : null,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  dog.status && DogStatusColor[dog.status]
                    ? { color: DogStatusColor[dog.status].text }
                    : null,
                ]}
              >
                {dog.status ? DogStatusLabel[dog.status] : "Não informado"}
              </Text>
            </View>

            <View
              style={[
                styles.kennelBadge,
                inKennel ? styles.kennelBadgeIn : styles.kennelBadgeOut,
              ]}
            >
              <MaterialDesignIcons
                name={inKennel ? "home" : "home-off"}
                size={13}
                color={inKennel ? "#059669" : "#6B7280"}
              />
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
          </View>

          {/* BOTAO PARA EDITAR STATUS - APENAS VETERINARIO E COORDENADOR */}
          {canEditDog && (
            <TouchableOpacity
              style={styles.editStatusButton}
              onPress={onEditStatus}
              activeOpacity={0.8}
            >
              <MaterialDesignIcons
                name="pencil-outline"
                size={14}
                color={theme.colors.primary}
              />
              <Text style={styles.editStatusButtonText}>
                Alterar Status / Canil
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* DADOS BIOMETRICOS & IDADE */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Sexo</Text>
          <Text style={styles.infoValue}>
            {isFemale ? "Fêmea" : dog.sex?.toUpperCase() === "M" ? "Macho" : "Não informado"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Idade</Text>
          <Text style={styles.infoValue}>
            {dog.dateOfBirth
              ? calculateAge(new Date(dog.dateOfBirth))
              : "Não informada"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Data de Nascimento</Text>
          <Text style={styles.infoValue}>{formatDate(dog.dateOfBirth)}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  avatarContainer: {
    width: 90,
    height: 90,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.full,
  },
  placeholderImage: {
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  identityDetails: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dogNameText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
  },
  dogBreedText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
  },
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
  kennelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  kennelBadgeIn: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  kennelBadgeOut: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  kennelBadgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 10,
  },
  kennelBadgeTextIn: {
    color: "#059669",
  },
  kennelBadgeTextOut: {
    color: "#6B7280",
  },
  editStatusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    paddingVertical: 2,
  },
  editStatusButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    textDecorationLine: "underline",
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  infoLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
  },
  infoValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    textAlign: "center",
  },
});
