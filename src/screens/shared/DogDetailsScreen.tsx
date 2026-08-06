import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../../routes";
import { SCREENS } from "../../consts/screens";
import { Card } from "../../shared/components/CardComponent";
import { theme } from "../../../theme/theme";
import { femaleDogIcons, maleDogIcons } from "../../consts/dogIcons";
import { DogRaceLabel, DogStatusLabel, EDOG_STATUS } from "../../types/Dog";
import { calculateAge } from "../../utils/calculateAge";
import { Button } from "../../shared/components/ButtonComponent";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof SCREENS.DOG_DETAILS_SCREEN
>;

const avatarMap = [...femaleDogIcons, ...maleDogIcons].reduce(
  (acc, item) => {
    acc[item.key] = item.image;
    return acc;
  },
  {} as Record<string, any>,
);

export const DogDetailsScreen = ({ route }: Props) => {
  const { dog } = route.params;
  const imageSource = avatarMap[dog.avatarKey];

  return (
    <View style={{ flex: 1 }}>
      <View style={{}}>
        <Card>
          <View style={{ height: "60%" }}>
            <View style={styles.leftColumn}>
              {imageSource ? (
                <Image source={imageSource} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, styles.placeholderImage]} />
              )}
            </View>
            <View style={{ backgroundColor: "red" }}>
              <View style={{...styles.rowContainer,...styles.leftColumn}}>
                <Text style={styles.dogNameText}>{dog.name}</Text>

                <View style={styles.dogStatusContainer}> 
                <Text style = {styles.dogStatusText}>{(dog.status ? DogStatusLabel[dog.status] : "Não Informado")}</Text>
                </View>
              </View>

              <Text>{(dog.race ? DogRaceLabel[dog.race] : "Não Informado")}</Text>
              <Text>{(dog.sex === "F" ? "Fêmea" : dog.sex === "M" ? "Macho" : "Sexo não identificado" )}</Text>
              <Text>{calculateAge(new Date(dog.dateOfBirth))}</Text>
            </View>
          </View>
          <View style={{flexDirection:"row",paddingVertical:12,gap:8}}>
            <Button text="Médico" onPress={() => console.log("click médico")}/>
            <Button text="Treino" onPress={() => console.log("click Treino")}/>
            <Button text="Médico" onPress={() => console.log("click médico")}/>
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 8,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftColumn: {
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: "center",
  },
  nameAndStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  dogNameText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: "bold",
  },
  dogStatusContainer: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    ...theme.shadows.sm,
  },
  dogStatusContainerAlert: {
    backgroundColor: theme.colors.alert,
  },
  dogStatusText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
  dogDetailsText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    marginTop: 2,
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: theme.borderRadius.full,
  },
  placeholderImage: {
    backgroundColor: "#ccc",
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    opacity: 0.6,
  },
});
