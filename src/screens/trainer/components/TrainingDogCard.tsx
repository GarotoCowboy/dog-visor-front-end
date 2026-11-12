import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../theme/theme";
import { Card } from "../../../shared/components/CardComponent";
import { ITrainingResponse, TraningStatus } from "../../../types/Training";
import { getDogImageSource } from "../../../utils/dogAvatar";
import {
  TrainingDogActionsRow,
  TrainingDogStatusBadge,
} from "./trainingDogCard";

interface TrainingDogCardProps {
  item: ITrainingResponse;
  onExecuteTraining: (training: ITrainingResponse) => void;
  onViewHistory: (training: ITrainingResponse) => void;
}

export const TrainingDogCard: React.FC<TrainingDogCardProps> = ({
  item,
  onExecuteTraining,
  onViewHistory,
}) => {
  const imageSource = getDogImageSource(item.avatarKey);
  const isApto = item.status === TraningStatus.Apto;
  const isInapto = item.status === TraningStatus.Inapto;
  const isFinished = isApto || isInapto;
  const sessionsCount = item.totalSessionsRecorded || 0;
  const isMaxSessionsReached = sessionsCount >= 21;

  return (
    <Card>
      <View style={styles.cardContainer}>
        {/* CABEÇALHO DO CARD: AVATAR, NOME, IDADE E BADGE DE STATUS */}
        <View style={styles.headerRow}>
          <View style={styles.avatarWrapper}>
            {imageSource ? (
              <Image source={imageSource} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                <FontAwesomeFreeSolid name="dog" size={24} color="#9CA3AF" />
              </View>
            )}
          </View>

          <View style={styles.nameContainer}>
            <Text style={styles.dogNameText}>{item.dogsName}</Text>
            <Text style={styles.dogSubText}>
              {item.dogAge ? `${item.dogAge}` : `${item.dogsBreed}`}
              {item.dogSex ? ` • ${item.dogSex === "M" ? "Macho" : "Fêmea"}` : ""}
            </Text>
          </View>

          <TrainingDogStatusBadge
            isApto={isApto}
            isInapto={isInapto}
            currentStage={item.currentStage}
          />
        </View>

        {/* TREINADOR RESPONSÁVEL (SE DISPONÍVEL) */}
        {Boolean(item.trainerName) && (
          <View style={styles.trainerRow}>
            <MaterialDesignIcons
              name="account-tie-outline"
              size={14}
              color="#4B5563"
            />
            <Text style={styles.trainerText} numberOfLines={1}>
              Treinador(a): {item.trainerName}
            </Text>
          </View>
        )}

        {/* LINHA DE ETAPA E SESSÕES DIÁRIAS */}
        <View style={styles.stageProgressRow}>
          <Text style={styles.stageText}>
            {isApto
              ? "Todas as 4 etapas concluídas"
              : isInapto
              ? `Encerrado na Etapa ${item.currentStage || 1}`
              : `Etapa ${item.currentStage || 1} de 4`}
          </Text>
          {!isFinished && (
            <View style={styles.sessionsBadge}>
              <MaterialDesignIcons
                name="calendar-month-outline"
                size={13}
                color={isMaxSessionsReached ? "#B91C1C" : "#2E6B65"}
              />
              <Text
                style={[
                  styles.sessionsText,
                  isMaxSessionsReached && styles.sessionsTextLimit,
                ]}
              >
                {sessionsCount}/21 dias
              </Text>
            </View>
          )}
          <Text style={styles.lastActivityText}>
            {item.lastTrainingDate
              ? `Último: ${item.lastTrainingDate}`
              : "Sem registro"}
          </Text>
        </View>

        {/* BOTÕES DE AÇÃO */}
        <TrainingDogActionsRow
          item={item}
          isFinished={isFinished}
          isMaxSessionsReached={isMaxSessionsReached}
          onExecuteTraining={onExecuteTraining}
          onViewHistory={onViewHistory}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  nameContainer: {
    flex: 1,
    gap: 2,
  },
  dogNameText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
  },
  dogSubText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
  },
  trainerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trainerText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
  },
  stageProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  stageText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#334155",
  },
  sessionsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sessionsText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: "#2E6B65",
  },
  sessionsTextLimit: {
    color: "#B91C1C",
  },
  lastActivityText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: "#94A3B8",
  },
});
