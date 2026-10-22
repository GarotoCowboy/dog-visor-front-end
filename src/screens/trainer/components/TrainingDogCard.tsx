import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../theme/theme";
import { Card } from "../../../shared/components/CardComponent";
import { ITrainingResponse, TraningStatus } from "../../../types/Training";
import { femaleDogIcons, maleDogIcons } from "../../../consts/dogIcons";

const avatarMap = [...femaleDogIcons, ...maleDogIcons].reduce(
  (acc, item) => {
    acc[item.key] = item.image;
    return acc;
  },
  {} as Record<string, any>,
);

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
  const imageSource = item.avatarKey ? avatarMap[item.avatarKey] : null;
  const isApto = item.status === TraningStatus.Apto;
  const isInapto = item.status === TraningStatus.Inapto;
  const isFinished = isApto || isInapto;
  const sessionsCount = item.totalSessionsRecorded || 0;
  const isStarted =
    (item.currentStage && item.currentStage > 1) ||
    Boolean(item.lastTrainingDate) ||
    sessionsCount > 0;
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

          {/* BADGE DE STATUS */}
          {isApto ? (
            <View style={[styles.statusBadge, styles.statusBadgeApto]}>
              <MaterialDesignIcons name="check-circle" size={13} color="#15803D" />
              <Text style={[styles.statusBadgeText, styles.statusBadgeTextApto]}>
                Concluído (Apto)
              </Text>
            </View>
          ) : isInapto ? (
            <View style={[styles.statusBadge, styles.statusBadgeInapto]}>
              <MaterialDesignIcons name="close-circle" size={13} color="#B91C1C" />
              <Text style={[styles.statusBadgeText, styles.statusBadgeTextInapto]}>
                Encerrado (Inapto)
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.statusBadge,
                isStarted ? styles.statusBadgeRunning : styles.statusBadgeNotStarted,
              ]}
            >
              <MaterialDesignIcons
                name="clock-outline"
                size={13}
                color={isStarted ? "#D97706" : "#6B7280"}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  isStarted
                    ? styles.statusBadgeTextRunning
                    : styles.statusBadgeTextNotStarted,
                ]}
              >
                {isStarted ? `Etapa ${item.currentStage || 1}` : "Não Iniciado"}
              </Text>
            </View>
          )}
        </View>

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
        <View style={styles.actionsRow}>
          {isFinished ? (
            <TouchableOpacity
              style={styles.viewReportButton}
              onPress={() => onViewHistory(item)}
              activeOpacity={0.8}
            >
              <MaterialDesignIcons
                name="file-document-outline"
                size={18}
                color={theme.colors.white}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.viewReportButtonText}>
                Ver Relatório Completo
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.executeButton,
                  isMaxSessionsReached && styles.executeButtonFinalizeOnly,
                ]}
                onPress={() => onExecuteTraining(item)}
                activeOpacity={0.8}
              >
                <FontAwesomeFreeSolid
                  name={isMaxSessionsReached ? "flag-checkered" : "play"}
                  size={12}
                  color={theme.colors.white}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.executeButtonText}>
                  {isMaxSessionsReached
                    ? "Finalizar Etapa (21/21)"
                    : "Realizar Treinamento"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => onViewHistory(item)}
                activeOpacity={0.8}
                accessibilityLabel="Ver Relatório e Histórico"
              >
                <MaterialDesignIcons
                  name="chart-box-outline"
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    width: 52,
    height: 52,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.full,
  },
  avatarPlaceholder: {
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
  },
  statusBadgeApto: {
    backgroundColor: "#DCFCE7",
  },
  statusBadgeInapto: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeRunning: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeNotStarted: {
    backgroundColor: "#E5E7EB",
  },
  statusBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
  },
  statusBadgeTextApto: {
    color: "#15803D",
  },
  statusBadgeTextInapto: {
    color: "#B91C1C",
  },
  statusBadgeTextRunning: {
    color: "#D97706",
  },
  statusBadgeTextNotStarted: {
    color: "#4B5563",
  },
  stageProgressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 2,
    gap: 8,
  },
  stageText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: "#4B5563",
  },
  sessionsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  sessionsText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#166534",
  },
  sessionsTextLimit: {
    color: "#B91C1C",
  },
  lastActivityText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  executeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E6B65",
    paddingVertical: 12,
    borderRadius: 8,
  },
  executeButtonFinalizeOnly: {
    backgroundColor: "#D97706",
  },
  executeButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
  viewReportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E3A8A",
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewReportButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
});
