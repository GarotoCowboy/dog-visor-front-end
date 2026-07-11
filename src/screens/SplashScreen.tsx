import { StyleSheet, Text, View } from "react-native";
// 1. Mude o import para expo-image
import { Image } from "expo-image"; 
import { theme } from "../../theme/theme";

// O require do GIF continua igual
const dogRunningVideo = require("../../assets/videos/dogRunning.gif");

export const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={dogRunningVideo}
        style={styles.video} 
        contentFit="contain"
        autoplay={true} 
      />

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Dog Visor</Text>
        <Text style={styles.subtitle}>Carregando...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: theme.colors.white,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  video: {
    height: 160,
    width: 240,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 34,
  },
  title: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xxl,
  },
  subtitle: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.base,
    marginTop: 12,
  },
});