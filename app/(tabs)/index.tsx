import { Image, StyleSheet, Button, View } from "react-native";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../components/firebase/database";
import { ProgressBar } from "react-native-paper";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";

export default function HomeScreen() {
  const [redCount, setRedCount] = useState(0);
  const [blueCount, setBlueCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [progress, setProgress] = useState(0.5); // Start at neutral 0.5

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

  interface Interaction {
    team: string;
  }

  const handleCreateClick = async (teamColor: string): Promise<void> => {
    try {
      const interactionsRef = collection(db, "interactions");
      await addDoc(interactionsRef, {
        team: teamColor,
      } as Interaction);
      console.log("Document créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création du document:", error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.teamInfo}>
          <ThemedText style={styles.teamText}>Red: {redCount}</ThemedText>
          <ThemedText style={styles.teamText}>Blue: {blueCount}</ThemedText>
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            color={progress < 0.5 ? "#FF5252" : "#4C6EF5"}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Rouge"
            onPress={() => handleCreateClick("red")}
            color="#FF5252"
          />
          <Button
            title="Bleu"
            onPress={() => handleCreateClick("blue")}
            color="#4C6EF5"
          />
        </View>

        <ThemedText style={styles.totalCount}>
          Total clicks: {totalCount}
        </ThemedText>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  teamInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  teamText: {
    fontWeight: "bold",
  },
  totalCount: {
    textAlign: "center",
    marginTop: 8,
  },
});
