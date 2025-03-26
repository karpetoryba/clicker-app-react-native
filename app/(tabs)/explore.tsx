import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import { db } from "../../components/firebase/database";
import { ProgressBar } from "react-native-paper";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";

export default function HomeScreen() {
  const [redCount, setRedCount] = useState(0);
  const [blueCount, setBlueCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [progress, setProgress] = useState(0.5); // Start at neutral 0.5

  const { pseudo } = useLocalSearchParams();

  // Animated background color value
  const backgroundColorAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const interactionRef = collection(db, "interactions");

    // Get all interactions to count total
    const unsubscribeTotal = onSnapshot(interactionRef, (snapshot) => {
      const allClicks = snapshot.docs.map((doc) => doc.data());
      setTotalCount(allClicks.length);
    });

    // Get red team interactions
    const redQuery = query(interactionRef, where("team", "==", "red"));
    const unsubscribeRed = onSnapshot(redQuery, (snapshot) => {
      setRedCount(snapshot.docs.length);
    });

    // Get blue team interactions
    const blueQuery = query(interactionRef, where("team", "==", "blue"));
    const unsubscribeBlue = onSnapshot(blueQuery, (snapshot) => {
      setBlueCount(snapshot.docs.length);
    });

    return () => {
      unsubscribeTotal();
      unsubscribeRed();
      unsubscribeBlue();
    };
  }, []);

  // Update progress bar when team counts change
  useEffect(() => {
    if (totalCount === 0) {
      setProgress(0.5); // Default to middle when no clicks
    } else {
      // Calculate progress based on team proportion
      // If redCount is higher, progress will be less than 0.5 (left side)
      // If blueCount is higher, progress will be more than 0.5 (right side)
      const redProportion = redCount / totalCount;
      const blueProportion = blueCount / totalCount;

      if (redProportion > blueProportion) {
        // Red team is winning (move left from center)
        setProgress(0.5 - (redProportion - blueProportion) / 2);
      } else if (blueProportion > redProportion) {
        // Blue team is winning (move right from center)
        setProgress(0.5 + (blueProportion - redProportion) / 2);
      } else {
        // Tie
        setProgress(0.5);
      }
    }
  }, [redCount, blueCount, totalCount]);

  // Animate background color when progress changes
  useEffect(() => {
    Animated.timing(backgroundColorAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Interpolate the background color based on progress
  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      "rgba(255, 82, 82, 0.2)",
      "rgba(255, 255, 255, 1)",
      "rgba(76, 110, 245, 0.2)",
    ],
  });

  interface Interaction {
    team: string;
  }

  const handleCreateClick = async (teamColor: string): Promise<void> => {
    try {
      const interactionsRef = collection(db, "interactions");
      await addDoc(interactionsRef, {
        team: teamColor,
        pseudo: pseudo || "Anonymous",
      } as Interaction);
      console.log("Document créé avec succès");

      // Add immediate feedback animation
      Animated.timing(backgroundColorAnim, {
        toValue: teamColor === "red" ? 0.3 : 0.7, // Push towards red or blue temporarily
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // Then animate back to actual progress
        Animated.timing(backgroundColorAnim, {
          toValue: progress,
          duration: 700,
          useNativeDriver: false,
        }).start();
      });
    } catch (error) {
      console.error("Erreur lors de la création du document:", error);
    }
  };

  return (
    <Animated.View style={[styles.mainContainer, { backgroundColor }]}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "transparent", dark: "transparent" }}
        headerImage={
          <Image
            source={require("@/assets/images/partial-react-logo.png")}
            style={styles.reactLogo}
          />
        }
      >
        <ThemedText
          style={{
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Hello, {pseudo}!
        </ThemedText>

        <View style={styles.container}>
          <View style={styles.teamInfo}>
            <ThemedText style={[styles.teamText, styles.redTeam]}>
              Red: {redCount}
            </ThemedText>
            <ThemedText style={[styles.teamText, styles.blueTeam]}>
              Blue: {blueCount}
            </ThemedText>
          </View>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progress}
              color={progress < 0.5 ? "#FF5252" : "#4C6EF5"}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.roundButton, styles.redButton]}
              onPress={() => handleCreateClick("red")}
            >
              <ThemedText style={styles.buttonText}>RED</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roundButton, styles.blueButton]}
              onPress={() => handleCreateClick("blue")}
            >
              <ThemedText style={styles.buttonText}>BLUE</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.totalCount}>
            Total clicks: {totalCount}
          </ThemedText>
        </View>
      </ParallaxScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressBar: {
    height: 16,
    borderRadius: 8,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 30,
  },
  teamInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  teamText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  redTeam: {
    color: "#FF5252",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  blueTeam: {
    color: "#4C6EF5",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  totalCount: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  roundButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  redButton: {
    backgroundColor: "#FF5252",
  },
  blueButton: {
    backgroundColor: "#4C6EF5",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
