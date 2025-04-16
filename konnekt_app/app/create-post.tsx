import React, { useState, useEffect } from "react";
import useAuthRedirect from "../src/hooks/useAuthRedirect"; //send back to index if signed out
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { IP_ADDRESS } from "../src/components/config/globalvariables";

export default function CreatePostScreen() {
  useAuthRedirect();
  const { clubId, clubName } = useLocalSearchParams();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [existingPosts, setExistingPosts] = useState<any[]>([]);
  const [showPosts, setShowPosts] = useState(false);

  useEffect(() => {
    fetch(`http://${IP_ADDRESS}:5000/api/posts/feed/${global.authUser?._id}`)
      .then((res) => res.json())
      .then((data) => setExistingPosts(data))
      .catch((err) => console.error("Failed to fetch posts", err));
  }, []);

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Post content is required.");
      return;
    }

    try {
      const response = await fetch(`http://${IP_ADDRESS}:5000/api/posts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, clubName, content, imageUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Post created successfully.");
        router.replace(`/${clubId}`);
      } else {
        Alert.alert("Error", data.msg || "Could not create post.");
      }
    } catch (err) {
      console.error("Post creation error:", err);
      Alert.alert("Error", "Server error while creating post.");
    }
  };

  
  const handleDeletePost = async (postId: string) => {
    console.log("🧪 Attempting to delete:", postId);
  
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/posts/${postId}`, {
        method: "DELETE",
      });
  
      const resultText = await res.text();
      console.log("🔍 Raw response:", resultText);
  
      let result;
      try {
        result = JSON.parse(resultText);
      } catch (parseError) {
        console.error("❌ Could not parse response:", parseError);
        Alert.alert("Error", "Invalid server response");
        return;
      }
  
      if (res.ok) {
        setExistingPosts((prev) => prev.filter((p) => p._id !== postId));
        Alert.alert("Deleted", "Post successfully deleted.");
      } else {
        Alert.alert("Error", result?.msg || "Delete failed.");
      }
    } catch (err) {
      console.error("❌ Network error during deletion:", err);
      Alert.alert("Error", "Could not reach server.");
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Post for {clubName}</Text>

      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChangeText={setImageUrl}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreatePost}>
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#999' }]}
        onPress={() => setShowPosts(!showPosts)}
      >
        <Text style={styles.buttonText}>{showPosts ? "Hide My Posts" : "Delete Existing Posts"}</Text>
      </TouchableOpacity>

      {showPosts && (
        <FlatList
          data={existingPosts.filter(p => p.clubId === clubId)}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <Text style={styles.postTitle}>{item.clubName}</Text>
              <Text style={styles.postContent}>{item.content}</Text>
              <TouchableOpacity
                onPress={() => handleDeletePost(item._id)}
                style={[styles.button, { backgroundColor: "#ffcccc" }]}
              >
                <Text style={{ color: "#a00", fontWeight: "bold" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4c87df",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  postContainer: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  postTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  postContent: {
    marginBottom: 6,
  },
});
