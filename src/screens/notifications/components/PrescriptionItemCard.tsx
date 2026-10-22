import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesomeFreeSolid from "@react-native-vector-icons/fontawesome-free-solid";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { theme } from "../../../../theme/theme";
import { Card } from "../../../shared/components/CardComponent";
import { IMedicationResponse } from "../../../types/Medication";

interface PrescriptionItemCardProps {
  item: IMedicationResponse;
  parseLocalDate: (dateStr?: string) => Date | null;
  onFinish?: (item: IMedicationResponse) => void;
}

export const PrescriptionItemCard: React.FC<PrescriptionItemCardProps> = ({
  item,
  parseLocalDate,
  onFinish,
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
          <View
            style={[
              styles.colorIndicatorBar,
              {
                backgroundColor: isExpired ? "#D32F2F" : "#00897B",
              },
            ]}
          />

          <View style={styles.cardMainBody}>
            {/* LINHA SUPERIOR: CHECKBOX CONCLUIR MEDICAMENTO + BADGE */}
            <View style={styles.topRow}>
              <TouchableOpacity
                style={styles.checkboxAction}
                onPress={() => onFinish?.(item)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    isExpired && styles.checkboxBoxExpired,
                  ]}
                />
                <Text style={styles.checkboxLabel}>Concluir Medicamento</Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor: "#E0F2F1",
                    borderColor: "#00897B",
                  },
                ]}
              >
                <Text style={[styles.typeBadgeText, { color: "#00897B" }]}>
                  Medicamento
                </Text>
              </View>
            </View>

            {/* IDENTIFICAÇÃO DO CÃO */}
            <View style={styles.dogNameRow}>
              <FontAwesomeFreeSolid
                name="dog"
                size={15}
                color={theme.colors.primary}
              />
              <Text style={styles.dogNameText}>{item.dogsName}</Text>
            </View>

            <View style={styles.medPrescriptionBox}>
              <FontAwesomeFreeSolid
                name="pills"
                size={14}
                color="#00897B"
                style={{ marginTop: 2 }}
              />
              <Text style={styles.medPrescriptionText}>{item.prescription}</Text>
            </View>

            {limDate && (
              <View
                style={[
                  styles.medLimitRow,
                  isExpired && styles.medLimitRowExpired,
                ]}
              >
                <MaterialDesignIcons
                  name={isExpired ? "alert-circle" : "calendar-clock"}
                  size={14}
                  color={isExpired ? "#D32F2F" : theme.colors.text}
                />
                <Text
                  style={[
                    styles.medLimitText,
                    isExpired && styles.medLimitTextExpired,
                  ]}
                >
                  {isExpired ? "Tratamento expirou em: " : "Administrar até: "}
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
  colorIndicatorBar: {
    width: 6,
    borderTopLeftRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  cardMainBody: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkboxAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#00897B",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
  },
  checkboxBoxExpired: {
    borderColor: "#D32F2F",
  },
  checkboxLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  dogHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dogNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dogNameText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  medPrescriptionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F4FBF9",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B2DFDB",
  },
  medPrescriptionText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    lineHeight: 20,
  },
  medLimitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  medLimitRowExpired: {
    backgroundColor: "#FFEBEE",
  },
  medLimitText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  medLimitTextExpired: {
    color: "#C62828",
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
