import { Image, StyleSheet, Button } from "react-native";
import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "./database";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";

export default function HomeScreen() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interactionRef = collection(db, "interactions");

    const unsubscribe = onSnapshot(interactionRef, (snapshot) => {
      const allClicks = snapshot.docs.map((doc) => doc.data());
      setCount(allClicks.length);
    });

    // Nettoyage de l'écouteur Firestore à la désactivation du composant
    return () => unsubscribe();
  }, []);

  const handleCreateClick = async (teamColor: string) => {
    try {
      const interactionsRef = collection(db, "interactions");
      await addDoc(interactionsRef, {
        team: teamColor,
        timestamp: new Date(),
      });
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
      <Button title="Rouge" onPress={() => handleCreateClick("red")} />
      <Button title="Bleu" onPress={() => handleCreateClick("blue")} />
      <ThemedText>You clicked me {count} times</ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
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
});
