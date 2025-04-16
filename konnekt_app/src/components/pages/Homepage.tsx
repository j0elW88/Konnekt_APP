import React, { useEffect, useState } from "react";
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

interface Post {
  _id: string;
  clubId: string;
  clubName: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
}

interface HomepageProps {
  clubs: Club[];
  posts?: Post[];
  onLeaveClub: (clubId: string, clubName: string) => void;
}

export default function Homepage({ clubs, posts = [], onLeaveClub }: HomepageProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>("all");
  const [postData, setPostData] = useState<Post[]>(posts);

  useEffect(() => {
    setPostData(posts);
  }, [posts]);

  const handleLike = (postId: string) => {
    const hasLiked = likedPosts.includes(postId);

    const updatedPosts = postData.map((post) => {
      if (post._id === postId) {
        return {
          ...post,
          likes: hasLiked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    });

    setPostData(updatedPosts);

    if (hasLiked) {
      setLikedPosts(likedPosts.filter((id) => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
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
        {/* Dropdown icon */}
        <TouchableOpacity style={styles.menuIcon} onPress={() => setModalVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.heading}>Your Clubs</Text>

        {/* Club buttons */}
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

        {/* Modal for leaving a club */}
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

        {/* Posts feed */}
        <View style={styles.feedWrapper}>
          {filteredPosts.length === 0 ? (
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
                    source={{ uri: item.imageUrl || "https://via.placeholder.com/400x400?text=No+Image" }}
                    style={styles.postImage}
                  />
                  <TouchableOpacity onPress={() => handleLike(item._id)} style={styles.likeButton}>
                    <Text style={{ color: hasLiked ? "red" : "black" }}>
                      {hasLiked ? "❤️" : "🤍"} {item.likes} Likes
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
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: "space-between",
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
});
