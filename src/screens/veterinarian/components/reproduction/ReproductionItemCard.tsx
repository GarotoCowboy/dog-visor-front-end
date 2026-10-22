import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { Card } from "../../../../shared/components/CardComponent";
import { formatDogRace } from "../../../../types/Dog";
import { IDogReproductionResponse } from "../../../../types/DogHealth";

interface ReproductionItemCardProps {
  item: IDogReproductionResponse;
  onEdit: (item: IDogReproductionResponse) => void;
  onRequestDelete: (item: IDogReproductionResponse) => void;
  formatDate: (dateStr?: string) => string;
}

export const ReproductionItemCard: React.FC<ReproductionItemCardProps> = ({
  item,
  onEdit,
  onRequestDelete,
  formatDate,
}) => {
  // Verificar se a data prevista esta proxima (dentro de 30 dias) ou vencida
  const isApproaching = (() => {
    if (!item.expectedNextHeatDate) return false;
    const parts = item.expectedNextHeatDate.split("-");
    if (parts.length !== 3) return false;
    const nextDate = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
    );
    const now = new Date();
    const diffDays = Math.ceil(
      (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 30 && diffDays >= -15;
  })();

  return (
    <View style={styles.cardWrapper}>
      <Card>
        <View style={styles.cardInnerContent}>
          {/* BARRA LATERAL ROSA / DESTAQUE */}
          <View
            style={[
              styles.colorBar,
              { backgroundColor: isApproaching ? "#BE185D" : "#EC4899" },
            ]}
          />

          <View style={styles.cardBody}>
            {/* TOPO: NOME DA CADELA + BOTOES EDITAR / EXCLUIR */}
            <View style={styles.cardHeader}>
              <View style={styles.dogNameRow}>
                <MaterialDesignIcons
                  name="gender-female"
                  size={18}
                  color="#BE185D"
                />
                <Text style={styles.dogNameText}>{item.dogsName}</Text>
                {item.dogsBreed ? (
                  <Text style={styles.breedText}>
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
                    color={isApproaching ? "#BE185D" : theme.colors.text}
                  />
                  <Text
                    style={[
                      styles.dateLabel,
                      isApproaching && { color: "#BE185D", fontWeight: "bold" },
                    ]}
                  >
                    Próximo Previsto:
                  </Text>
                </View>
                <Text
                  style={[
                    styles.dateValue,
                    isApproaching && { color: "#BE185D", fontWeight: "bold" },
                  ]}
                >
                  {formatDate(item.expectedNextHeatDate)}
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
            {item.observations ? (
              <View style={styles.observationsBox}>
                <MaterialDesignIcons
                  name="clipboard-text-outline"
                  size={13}
                  color={theme.colors.text}
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.observationsText}>
                  {item.observations}
                </Text>
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
