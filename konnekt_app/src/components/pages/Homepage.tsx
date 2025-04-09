import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";

type Post = {
  _id: string;
  clubId: string;
  clubName: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
};

const clubs = [
  { _id: "all", name: "All Clubs" },
  { _id: "chess", name: "Chess Club" },
  { _id: "robotics", name: "Robotics Team" },
  { _id: "art", name: "Art Society" },
];

export default function Homepage({ posts }: { posts: Post[] }) {
  const [postData, setPostData] = useState<Post[]>(posts);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>("all");

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
  const POST_WIDTH = Math.min(500, screenWidth - 300); // Keep it fixed, leave space for sidebar

  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No posts available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Your Clubs</Text>
        {clubs.map((club) => (
          <TouchableOpacity
            key={club._id}
            onPress={() => setSelectedClub(club._id)}
            style={[
              styles.sidebarButton,
              selectedClub === club._id && styles.sidebarButtonActive,
            ]}
          >
            <Text
              style={{
                color: selectedClub === club._id ? "#fff" : "#333",
              }}
            >
              {club.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed */}
      <View style={styles.feedWrapper}>
        <FlatList
          data={filteredPosts.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContainer}
          renderItem={({ item }) => {
            const hasLiked = likedPosts.includes(item._id);
            const formattedDate = new Date(item.createdAt).toLocaleDateString();

            return (
              <View style={[styles.postContainer, { width: POST_WIDTH }]}>
                <Text style={styles.clubName}>{item.clubName}</Text>
                <Text style={styles.content}>{item.content}</Text>
                <Text style={styles.postDate}>{formattedDate}</Text>
                <Image
                  source={{
                    uri:
                      item.imageUrl ||
                      "https://via.placeholder.com/400x400?text=No+Image",
                  }}
                  style={styles.postImage}
                />
                <TouchableOpacity
                  onPress={() => handleLike(item._id)}
                  style={styles.likeButton}
                >
                  <Text style={{ color: hasLiked ? "red" : "black" }}>
                    {hasLiked ? "❤️" : "🤍"} {item.likes} Likes
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#A1B5D8",
  },
  sidebar: {
    width: 200,
    padding: 16,
    backgroundColor: "#4C87DF",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  sidebarTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
    color: "#fff",
  },
  sidebarButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  sidebarButtonActive: {
    backgroundColor: "#333",
  },
  feedWrapper: {
    flex: 1,
    backgroundColor: "#A1B5D8",
  },
  feedContainer: {
    alignItems: "center",
    paddingVertical: 16,
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
    minHeight: 550,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
});
