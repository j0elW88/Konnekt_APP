import React, { useEffect, useState } from "react";
import Homepage from "../../src/components/pages/Homepage";
import useAuthRedirect from "../../src/hooks/useAuthRedirect";
import { IP_ADDRESS } from "../../src/components/config/globalvariables";
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Alert } from "react-native";

type Club = {
  _id: string;
  name: string;
  color?: string;
};

type Post = {
  _id: string;
  clubId: string;
  clubName: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: string[]; 
};

export default function HomePageScreen() {
  useAuthRedirect();
  const isFocused = useIsFocused();
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchUserClubs = async () => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/user/${global.authUser?._id}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setClubs(data);
      } else {
        console.error("Expected array of clubs, got:", data);
        setClubs([]);
      }
    } catch (err) {
      console.error("Failed to fetch clubs", err);
      setClubs([]);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/posts/feed/${global.authUser?._id}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error("Expected array of posts, got:", data);
        setPosts([]);
      }
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setPosts([]);
    }
  };

  const handleLeaveClub = async (clubId: string, clubName: string) => {
    const userId = global.authUser?._id;
    console.log("📛 handleLeaveClub called for:", clubName, "userId:", userId);

    if (!userId) {
      console.error("❌ No user ID found in global.authUser");
      Alert.alert("Error", "No user ID.");
      return;
    }

    try {
      const clubRes = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${clubId}`);
      const club = await clubRes.json();

      const isOwner = club.owner._id === userId;
      const isOnlyMember = club.members.length === 1;

      if (isOwner && isOnlyMember) {
        Alert.alert(
          "Are you sure?",
          "You're the only member and owner. Leaving will permanently delete this club.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete and Leave",
              style: "destructive",
              onPress: () => proceedToLeave(clubId, userId),
            },
          ]
        );
      } else {
        proceedToLeave(clubId, userId);
      }
    } catch (err) {
      console.error("❌ Failed to fetch club details:", err);
      Alert.alert("Error", "Failed to load club info. Please try again.");
    }
  };

  const proceedToLeave = async (clubId: string, userId: string) => {
    console.log("📡 Sending leave request to:", `http://${IP_ADDRESS}:5000/api/clubs/${clubId}/leave`);

    try {
      const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${clubId}/leave`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const text = await response.text();
      console.log("📥 Raw response text:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseErr) {
        console.error("❌ JSON parse error:", parseErr);
        Alert.alert("Error", "Unexpected server response.");
        return;
      }

      console.log("✅ Parsed result:", result);

      if (result.deleted || result.message === "Left club successfully") {
        Alert.alert("Left Club", result.deleted ? "Club deleted" : "You left the club");
        setClubs(prev => prev.filter((c) => c._id !== clubId));
        router.replace('/(tabs)/homepage');
      } else {
        Alert.alert("Error", result.error || "Failed to leave club");
      }
    } catch (err) {
      console.error("❌ Fetch/network error:", err);
      Alert.alert("Error", "Could not reach the server.");
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchUserClubs();
      fetchPosts();
    }
  }, [isFocused]);

  return <Homepage clubs={clubs} posts={posts} onLeaveClub={handleLeaveClub} />;
}
