import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// Floating circle component
const FloatingCircle = ({ size, color, startPosition }) => {
  const position = useRef(new Animated.ValueXY(startPosition)).current;
  const velocity = useRef({
    x: Math.random() * 1 - 0.5,
    y: Math.random() * 1 - 0.5,
  });
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    const interval = setInterval(() => {
      let newX = position.x._value + velocity.current.x;
      let newY = position.y._value + velocity.current.y;

      // Bounce off edges
      if (newX <= 0 || newX >= screenWidth - size) {
        velocity.current.x *= -1;
      }
      if (newY <= 0 || newY >= screenHeight - size) {
        velocity.current.y *= -1;
      }

      position.setValue({
        x: position.x._value + velocity.current.x,
        y: position.y._value + velocity.current.y,
      });
    }, 16);

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.6,
          transform: [{ translateX: position.x }, { translateY: position.y }],
        },
      ]}
    />
  );
};

export default function PseudoScreen() {
  const [pseudo, setPseudo] = useState("");
  const db = getFirestore();
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const generateRandomPosition = (size) => {
    return {
      x: Math.random() * (screenWidth - size),
      y: Math.random() * (screenHeight - size),
    };
  };

  const handleSave = async () => {
    const trimmed = pseudo.trim();
    if (!trimmed) {
      Alert.alert("Please enter a pseudo");
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        pseudo: trimmed,
        createdAt: new Date(),
      });

      router.push({
        pathname: "/(tabs)/explore",
        params: { pseudo: trimmed },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Error saving pseudo", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background animated circles */}
      <FloatingCircle
        size={60}
        color="#FF3B30"
        startPosition={generateRandomPosition(60)}
      />
      <FloatingCircle
        size={40}
        color="#007AFF"
        startPosition={generateRandomPosition(40)}
      />
      <FloatingCircle
        size={80}
        color="#FF3B30"
        startPosition={generateRandomPosition(80)}
      />
      <FloatingCircle
        size={50}
        color="#007AFF"
        startPosition={generateRandomPosition(50)}
      />

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>GAME ZONE</Text>

        <LinearGradient colors={["#222222", "#333333"]} style={styles.card}>
          <Text style={styles.label}>Your pseudo</Text>
          <TextInput
            placeholder="Enter your pseudo"
            placeholderTextColor="#888"
            value={pseudo}
            onChangeText={setPseudo}
            style={styles.input}
          />

          <TouchableOpacity onPress={handleSave} style={styles.button}>
            <LinearGradient
              colors={["#FF3B30", "#FF584C"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Start Game</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  circle: {
    position: "absolute",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 40,
    textShadowColor: "rgba(255, 59, 48, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "rgba(30, 30, 30, 0.8)",
    color: "#FFF",
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    fontSize: 16,
  },
  button: {
    overflow: "hidden",
    borderRadius: 10,
    marginTop: 10,
  },
  buttonGradient: {
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
});
