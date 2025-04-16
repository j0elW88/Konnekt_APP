import React, { useEffect, useState } from "react";
import { IP_ADDRESS } from '../config/globalvariables';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Types
interface Club {
  _id: string;
  name: string;
  color?: string;
}

export type Post = {
  _id: string;
  clubId: string;
  clubName: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: string[];
};

interface HomepageProps {
  clubs: Club[];
  posts?: Post[];
  events?: any[];
  onLeaveClub: (clubId: string, clubName: string) => void;
}



export default function Homepage({
  clubs,
  posts = [],
  events = [],
  onLeaveClub,
}: HomepageProps) {

  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>("all");
  const [postData, setPostData] = useState<Post[]>(posts);
  const [showEvents, setShowEvents] = useState(true);
  

  const toggleView = () => {
    setShowEvents(prev => !prev);
  };

  useEffect(() => {
    setPostData(posts);
  }, [posts]);

  const handleLike = async (postId: string) => {
    const userId = global.authUser?._id;
    const hasLiked = likedPosts.includes(postId);

    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/posts/${postId}/like`, {
        method: hasLiked ? 'DELETE' : 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      if (!res.ok) {
        throw new Error("Failed to update like.");
      }

      const updatedPost = await res.json();

      setPostData(prev =>
        prev.map(post =>
          post._id === postId ? { ...post, likes: updatedPost.likes } : post
        )
      );

      if (hasLiked) {
        setLikedPosts(prev => prev.filter(id => id !== postId));
      } else {
        setLikedPosts(prev => [...prev, postId]);
      }

    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const filteredPosts =
    selectedClub === "all"
      ? postData
      : postData.filter((post) => post.clubId === selectedClub);

  const screenWidth = Dimensions.get("window").width;
  const POST_WIDTH = Math.min(500, screenWidth - 40);

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.menuIcon} onPress={() => setModalVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.heading}>Your Clubs</Text>

        {clubs.map((club) => (
          <TouchableOpacity
            key={club._id}
            style={[styles.clubButton, { backgroundColor: club.color || "#fff" }]}
            onPress={() => router.push(`../${club._id}`)}
          >
            <Text style={styles.clubText}>{club.name}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.clubButton, { backgroundColor: "#777" }]}
          onPress={() => router.push("../join-club")}
        >
          <Text style={styles.createButtonText}>Join a Club</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/create-club")}
        >
          <Text style={styles.createButtonText}>+ Create New Club</Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Leave a Club</Text>
              <FlatList
                data={clubs}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.leaveOption}
                    onPress={() => {
                      onLeaveClub(item._id, item.name);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.leaveOptionText}>Leave {item.name}</Text>
                  </Pressable>
                )}
              />
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Toggle Buttons */}
        <View style={styles.toggleBar}>
          <TouchableOpacity
            style={[styles.toggleButton, showEvents && styles.toggleActive]}
            onPress={() => setShowEvents(true)}
          >
            <Text style={styles.toggleText}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !showEvents && styles.toggleActive]}
            onPress={() => setShowEvents(false)}
          >
            <Text style={styles.toggleText}>Posts</Text>
          </TouchableOpacity>
        </View>

        {/* Feed Section */} 
        <View style={styles.feedWrapper}>
          {showEvents ? (
            events.length === 0 ? (
              <Text style={styles.emptyText}>No upcoming events.</Text>
            ) : (
              events.map((event) => (
                <View key={event._id} style={styles.postContainer}>
                  <Text style={styles.clubName}>{event.title}</Text>
                  <Text style={styles.content}>{event.description}</Text>
                  <Text style={styles.postDate}>
                    {new Date(event.date).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )
          ) : filteredPosts.length === 0 ? (
            <Text style={styles.emptyText}>No posts available.</Text>
          ) : (
            filteredPosts.map((item) => {
              const hasLiked = likedPosts.includes(item._id);
              const formattedDate = new Date(item.createdAt).toLocaleDateString();

              return (
                <View key={item._id} style={[styles.postContainer, { width: POST_WIDTH }]}>
                  <Text style={styles.clubName}>{item.clubName}</Text>
                  <Text style={styles.content}>{item.content}</Text>
                  <Text style={styles.postDate}>{formattedDate}</Text>
                  <Image
                    source={{ uri: item.imageUrl || "https://placehold.co/400x400?text=No+Image" }}
                    style={styles.postImage}
                  />
                  <TouchableOpacity onPress={() => handleLike(item._id)} style={styles.likeButton}>
                    <Text style={{ color: hasLiked ? "red" : "black" }}>
                      {hasLiked ? "❤️" : "🤍"} {item.likes.length} Likes
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#f4f6fc",
  },
  container: {
    padding: 20,
    paddingTop: 80,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  clubButton: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  clubText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  createButton: {
    backgroundColor: "#4c87df",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuIcon: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  leaveOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  leaveOptionText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: "#aaa",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: {
    color: "white",
    fontWeight: "bold",
  },
  feedWrapper: {
    marginTop: 30,
    alignItems: "center",
  },
  postContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
    minHeight: 200,
    width: "90%",
    alignSelf: "center",
  },
  clubName: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 18,
  },
  content: {
    marginBottom: 4,
    fontSize: 16,
  },
  postDate: {
    color: "#888",
    fontSize: 12,
    marginBottom: 8,
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: "cover",
    flexShrink: 0,
  },
  likeButton: {
    paddingVertical: 4,
  },
  emptyText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
  toggleBar: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  toggleButton: {
    padding: 10,
    marginHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  toggleActive: {
    backgroundColor: "#4c87df",
  },
  toggleText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
