import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../../theme/theme";
import { Card } from "../../../../shared/components/CardComponent";
import { IMedicationResponse } from "../../../../types/Medication";

interface MedicationItemCardProps {
  item: IMedicationResponse;
  onRequestDelete: (item: IMedicationResponse) => void;
  parseLocalDate: (dateStr?: string) => Date | null;
}

export const MedicationItemCard: React.FC<MedicationItemCardProps> = ({
  item,
  onRequestDelete,
  parseLocalDate,
}) => {
  const limDate = parseLocalDate(item.limitDate);
  const isExpired = limDate
    ? limDate.getTime() < new Date().setHours(0, 0, 0, 0)
    : false;

  return (
    <View style={styles.cardWrapper}>
      <Card>
        <View
          style={[
            styles.cardInnerContent,
            isExpired && styles.cardExpiredHighlight,
          ]}
        >
          {/* BARRA LATERAL */}
          <View
            style={[
              styles.colorBar,
              {
                backgroundColor: isExpired
                  ? "#D32F2F"
                  : theme.colors.secondary,
              },
            ]}
          />

          <View style={styles.cardBody}>
            {/* TOPO: NOME DO CÃO + BOTÃO EXCLUIR */}
            <View style={styles.cardHeader}>
              <View style={styles.dogNameRow}>
                <FontAwesomeFreeSolid
                  name="dog"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={styles.dogNameText}>{item.dogsName}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
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

            {/* PRESCRIÇÃO */}
            <View style={styles.prescriptionBox}>
              <FontAwesomeFreeSolid
                name="pills"
                size={13}
                color={theme.colors.secondary}
                style={{ marginTop: 2 }}
              />
              <Text style={styles.prescriptionText}>{item.prescription}</Text>
            </View>

            {/* PRAZO LIMITE */}
            {limDate && (
              <View
                style={[
                  styles.limitDateRow,
                  isExpired && styles.limitDateRowExpired,
                ]}
              >
                <MaterialDesignIcons
                  name={isExpired ? "alert-circle" : "calendar-clock"}
                  size={14}
                  color={isExpired ? "#D32F2F" : theme.colors.text}
                />
                <Text
                  style={[
                    styles.limitDateText,
                    isExpired && styles.limitDateTextExpired,
                  ]}
                >
                  {isExpired
                    ? "Tratamento expirado em: "
                    : "Administrar até: "}
                  {`${limDate.getDate()}/${limDate.getMonth() + 1}/${limDate.getFullYear()}`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: "100%",
  },
  cardInnerContent: {
    flexDirection: "row",
    overflow: "hidden",
  },
  cardExpiredHighlight: {
    backgroundColor: "#FFF8F8",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: theme.borderRadius.md,
  },
  colorBar: {
    width: 5,
    borderTopLeftRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dogNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dogNameText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  deleteButton: {
    padding: 4,
  },
  prescriptionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  prescriptionText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    lineHeight: 20,
  },
  limitDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  limitDateRowExpired: {
    backgroundColor: "#FFEBEE",
  },
  limitDateText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  limitDateTextExpired: {
    color: "#C62828",
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
