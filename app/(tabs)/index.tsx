import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

export default function PseudoScreen() {
  const [pseudo, setPseudo] = useState("");
  const db = getFirestore();
  const router = useRouter();

  const handleSave = async () => {
    const trimmed = pseudo.trim();
    if (!trimmed) {
      Alert.alert("Please enter a pseudo");
      return;
    }

    try {
      // Save pseudo to "users" collection with auto-generated ID
      await addDoc(collection(db, "users"), {
        pseudo: trimmed,
        createdAt: new Date(),
      });

      // Navigate

      router.push({
        pathname: "/(tabs)/explore",
        params: { pseudo: trimmed }, // param de pseudo
      });
    } catch (error) {
      Alert.alert("Error saving pseudo", (error as Error).message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>Your pseudo</Text>
      <TextInput
        placeholder="Enter your pseudo"
        value={pseudo}
        onChangeText={setPseudo}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 12,
          borderRadius: 8,
        }}
      />
      <Button title="Start Game" onPress={handleSave} />
    </View>
  );
}
