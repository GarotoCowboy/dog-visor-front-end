import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { theme } from "../../../../../theme/theme";
import { Card } from "../../../../shared/components/CardComponent";
import { IDogResponse } from "../../../../types/Dog";
import { IDogReproductionResponse } from "../../../../types/DogHealth";
import {
  getReproductionStatusInfo,
  MANUAL_END_MARKER_REGEX,
} from "../../../../utils/reproductionStatus";

interface DogReproductionCardProps {
  dog: IDogResponse;
  canEditDog: boolean;
  lastHeat: IDogReproductionResponse | null;
  loadingHeat: boolean;
  formatDate: (dateStr?: string) => string;
  onNavigateToReproduction: (openCreate: boolean) => void;
}

export const DogReproductionCard: React.FC<DogReproductionCardProps> = ({
  dog,
  canEditDog,
  lastHeat,
  loadingHeat,
  formatDate,
  onNavigateToReproduction,
}) => {
  const statusInfo = lastHeat ? getReproductionStatusInfo(lastHeat) : null;
  const cleanObservations = lastHeat
    ? (lastHeat.observations || "").replace(MANUAL_END_MARKER_REGEX, "").trim()
    : "";

  return (
    <Card>
      <View style={styles.reproductionCard}>
        <View style={styles.reproductionHeader}>
          <View style={styles.reproductionTitleRow}>
            <MaterialDesignIcons
              name="calendar-heart"
              size={20}
              color="#BE185D"
            />
            <Text style={styles.reproductionCardTitle}>
              Ciclo Reprodutivo & Cios
            </Text>
          </View>

          {canEditDog && (
            <TouchableOpacity
              style={styles.reproductionActionLink}
              onPress={() => onNavigateToReproduction(false)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.reproductionActionLinkText}>Gerenciar</Text>
              <MaterialDesignIcons
                name="chevron-right"
                size={16}
                color="#BE185D"
              />
            </TouchableOpacity>
          )}
        </View>

        {loadingHeat ? (
          <ActivityIndicator size="small" color="#BE185D" style={{ marginVertical: 12 }} />
        ) : lastHeat && statusInfo ? (
          <View style={styles.heatDetailsBox}>
            {/* BADGE DE STATUS AUTOMÁTICO */}
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
                <View style={styles.statusTitleRow}>
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

            <View style={styles.heatRow}>
              <Text style={styles.heatLabel}>Último cio registrado:</Text>
              <Text style={styles.heatValue}>{formatDate(lastHeat.date)}</Text>
            </View>

            {lastHeat.expectedNextHeatDate ? (
              <View style={styles.heatRow}>
                <Text style={styles.heatLabel}>Previsão do próximo cio:</Text>
                <Text
                  style={[
                    styles.heatValue,
                    {
                      color:
                        statusInfo.status === "OVERDUE" ? "#B91C1C" : "#BE185D",
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {formatDate(lastHeat.expectedNextHeatDate)}
                </Text>
              </View>
            ) : null}

            {lastHeat.cycleIntervalInMonths ? (
              <View style={styles.heatRow}>
                <Text style={styles.heatLabel}>Intervalo entre cios:</Text>
                <Text style={styles.heatValue}>
                  {lastHeat.cycleIntervalInMonths} meses
                </Text>
              </View>
            ) : null}

            {cleanObservations ? (
              <Text style={styles.heatObservations} numberOfLines={2}>
                Obs: {cleanObservations}
              </Text>
            ) : null}

            {canEditDog && (
              <View style={styles.heatActionButtonsRow}>
                <TouchableOpacity
                  style={styles.manageHeatButton}
                  onPress={() => onNavigateToReproduction(false)}
                  activeOpacity={0.8}
                >
                  <MaterialDesignIcons
                    name="calendar-edit"
                    size={13}
                    color="#BE185D"
                  />
                  <Text style={styles.manageHeatButtonText}>
                    Gerenciar / Atualizar Ciclo
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noHeatBox}>
            <Text style={styles.noHeatText}>
              Nenhum cio registrado para {dog.name}.
            </Text>
            {canEditDog && (
              <TouchableOpacity
                style={styles.registerHeatBtn}
                onPress={() => onNavigateToReproduction(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.registerHeatBtnText}>+ Registrar Primeiro Cio</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  reproductionCard: {
    gap: 10,
  },
  reproductionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reproductionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reproductionCardTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  reproductionActionLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  reproductionActionLinkText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: "#BE185D",
  },
  heatDetailsBox: {
    backgroundColor: "#FDF2F8",
    padding: 10,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  statusBanner: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
    marginBottom: 4,
  },
  statusBannerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  statusTitleRow: {
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
  heatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heatLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  heatValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  heatObservations: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  noHeatBox: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 6,
  },
  noHeatText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: "#6B7280",
  },
  registerHeatBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  registerHeatBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: "#BE185D",
  },
  heatActionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#FCE7F3",
    gap: 8,
  },
  manageHeatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FDF2F8",
    borderWidth: 1,
    borderColor: "#F472B6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
  },
  manageHeatButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: 11,
    color: "#BE185D",
  },
  historyHeatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  historyHeatButtonText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: 11,
    color: "#6B7280",
  },
});
