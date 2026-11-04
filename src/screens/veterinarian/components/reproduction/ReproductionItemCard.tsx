import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { Card } from "../../../../shared/components/CardComponent";
import { formatDogRace } from "../../../../types/Dog";
import { IDogReproductionResponse } from "../../../../types/DogHealth";
import {
  formatLocalDateBR,
  getExpectedNextHeatDate,
  getReproductionStatusInfo,
  MANUAL_END_MARKER_REGEX,
} from "../../../../utils/reproductionStatus";

interface ReproductionItemCardProps {
  item: IDogReproductionResponse;
  isLatestForDog?: boolean;
  onEdit: (item: IDogReproductionResponse) => void;
  onRequestDelete: (item: IDogReproductionResponse) => void;
  onEndHeat?: (item: IDogReproductionResponse) => void;
  onRegisterNewCycle?: (item: IDogReproductionResponse) => void;
  formatDate: (dateStr?: string) => string;
}

export const ReproductionItemCard: React.FC<ReproductionItemCardProps> = ({
  item,
  isLatestForDog = true,
  onEdit,
  onRequestDelete,
  onEndHeat,
  onRegisterNewCycle,
  formatDate,
}) => {
  const statusInfo = getReproductionStatusInfo(item);
  const cleanObservations = (item.observations || "")
    .replace(MANUAL_END_MARKER_REGEX, "")
    .trim();

  return (
    <View style={styles.cardWrapper}>
      <Card>
        <View style={styles.cardInnerContent}>
          {/* BARRA LATERAL DE DESTAQUE SEGUNDO O STATUS */}
          <View
            style={[
              styles.colorBar,
              {
                backgroundColor: isLatestForDog
                  ? statusInfo.accentColor
                  : "#D1D5DB",
              },
            ]}
          />

          <View style={styles.cardBody}>
            {/* TOPO: NOME DA CADELA + BADGE DE STATUS + BOTOES EDITAR / EXCLUIR */}
            <View style={styles.cardHeader}>
              <View style={styles.dogNameRow}>
                <MaterialDesignIcons
                  name="gender-female"
                  size={18}
                  color="#BE185D"
                />
                <Text style={styles.dogNameText} numberOfLines={1}>
                  {item.dogsName}
                </Text>
                {item.dogsBreed ? (
                  <Text style={styles.breedText} numberOfLines={1}>
                    ({formatDogRace(item.dogsBreed)})
                  </Text>
                ) : null}
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit(item)}
                  activeOpacity={0.7}
                >
                  <MaterialDesignIcons
                    name="pencil-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onRequestDelete(item)}
                  activeOpacity={0.7}
                >
                  <MaterialDesignIcons
                    name="trash-can-outline"
                    size={18}
                    color="#D32F2F"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* FAIXA DE STATUS AUTOMÁTICO DO CICLO */}
            {isLatestForDog ? (
              <View
                style={[
                  styles.statusBanner,
                  {
                    backgroundColor: statusInfo.badgeBgColor,
                    borderColor: statusInfo.badgeBorderColor,
                  },
                ]}
              >
                <View style={styles.statusBannerTop}>
                  <View style={styles.statusBadgeTitleRow}>
                    <MaterialDesignIcons
                      name={statusInfo.iconName as any}
                      size={16}
                      color={statusInfo.badgeTextColor}
                    />
                    <Text
                      style={[
                        styles.statusBadgeLabel,
                        { color: statusInfo.badgeTextColor },
                      ]}
                    >
                      {statusInfo.label}
                    </Text>
                  </View>

                  {/* BOTÃO MANUAL PARA ENCERRAR CIO ATIVO */}
                  {statusInfo.canEndManually && onEndHeat && (
                    <TouchableOpacity
                      style={styles.endHeatButton}
                      onPress={() => onEndHeat(item)}
                      activeOpacity={0.8}
                    >
                      <MaterialDesignIcons
                        name="check-circle-outline"
                        size={13}
                        color="#BE185D"
                      />
                      <Text style={styles.endHeatButtonText}>Encerrar Cio</Text>
                    </TouchableOpacity>
                  )}

                  {/* BOTÃO RÁPIDO QUANDO PREVISÃO ESTÁ VENCIDA */}
                  {statusInfo.isOverdue && onRegisterNewCycle && (
                    <TouchableOpacity
                      style={styles.renewCycleButton}
                      onPress={() => onRegisterNewCycle(item)}
                      activeOpacity={0.8}
                    >
                      <MaterialDesignIcons
                        name="pencil"
                        size={12}
                        color="#FFFFFF"
                      />
                      <Text style={styles.renewCycleButtonText}>
                        Atualizar Ciclo
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text
                  style={[
                    styles.statusDetailText,
                    { color: statusInfo.badgeTextColor },
                  ]}
                >
                  {statusInfo.detailText}
                </Text>
              </View>
            ) : (
              <View style={styles.historyBadgeRow}>
                <MaterialDesignIcons
                  name="history"
                  size={13}
                  color="#6B7280"
                />
                <Text style={styles.historyBadgeText}>
                  Registro histórico anterior
                </Text>
              </View>
            )}

            {/* DATAS: CIO OBSERVADO & PREVISAO DO PROXIMO */}
            <View style={styles.datesGrid}>
              <View style={styles.dateBlock}>
                <View style={styles.dateLabelRow}>
                  <FontAwesomeFreeSolid
                    name="calendar-check"
                    size={12}
                    color={theme.colors.text}
                  />
                  <Text style={styles.dateLabel}>Cio Observado:</Text>
                </View>
                <Text style={styles.dateValue}>{formatDate(item.date)}</Text>
              </View>

              <View style={styles.dateBlock}>
                <View style={styles.dateLabelRow}>
                  <MaterialDesignIcons
                    name="calendar-clock"
                    size={14}
                    color={
                      statusInfo.status === "OVERDUE"
                        ? "#B91C1C"
                        : statusInfo.status === "APPROACHING"
                        ? "#B45309"
                        : theme.colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.dateLabel,
                      statusInfo.status === "OVERDUE" && {
                        color: "#B91C1C",
                        fontWeight: "bold",
                      },
                      statusInfo.status === "APPROACHING" && {
                        color: "#B45309",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    Próximo Previsto:
                  </Text>
                </View>
                <Text
                  style={[
                    styles.dateValue,
                    statusInfo.status === "OVERDUE" && {
                      color: "#B91C1C",
                      fontWeight: "bold",
                    },
                    statusInfo.status === "APPROACHING" && {
                      color: "#B45309",
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {item.expectedNextHeatDate
                    ? formatDate(item.expectedNextHeatDate)
                    : (() => {
                        const fallbackNext = getExpectedNextHeatDate(item);
                        return fallbackNext
                          ? formatLocalDateBR(fallbackNext)
                          : formatDate(undefined);
                      })()}
                </Text>
              </View>
            </View>

            {/* INTERVALO DO CICLO */}
            {item.cycleIntervalInMonths ? (
              <View style={styles.cycleRow}>
                <MaterialDesignIcons
                  name="repeat"
                  size={14}
                  color={theme.colors.secondary}
                />
                <Text style={styles.cycleText}>
                  Ciclo estimado: {item.cycleIntervalInMonths} meses
                </Text>
              </View>
            ) : null}

            {/* OBSERVACOES CLINICAS */}
            {cleanObservations ? (
              <View style={styles.observationsBox}>
                <MaterialDesignIcons
                  name="clipboard-text-outline"
                  size={13}
                  color={theme.colors.text}
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.observationsText}>{cleanObservations}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: 4,
  },
  cardInnerContent: {
    flexDirection: "row",
    overflow: "hidden",
  },
  colorBar: {
    width: 5,
    borderTopLeftRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  cardBody: {
    flex: 1,
    paddingLeft: 12,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dogNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  dogNameText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    flexShrink: 1,
  },
  breedText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  statusBanner: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  statusBannerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  statusBadgeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  statusBadgeLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
  },
  statusDetailText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
  },
  endHeatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F472B6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  endHeatButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: "#BE185D",
  },
  renewCycleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  renewCycleButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 10,
    color: "#FFFFFF",
  },
  historyBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  historyBadgeText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
    fontStyle: "italic",
  },
  datesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FDF2F8",
    padding: 8,
    borderRadius: theme.borderRadius.sm,
    gap: 8,
  },
  dateBlock: {
    flex: 1,
    gap: 2,
  },
  dateLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  dateValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    marginLeft: 16,
  },
  cycleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cycleText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary,
  },
  observationsBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#F9FAFB",
    padding: 8,
    borderRadius: theme.borderRadius.sm,
  },
  observationsText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 16,
  },
});
