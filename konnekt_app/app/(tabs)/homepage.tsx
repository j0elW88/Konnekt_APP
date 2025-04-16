import React, { useEffect, useState } from "react";
import Homepage from "../../src/components/pages/Homepage";
import useAuthRedirect from "../../src/hooks/useAuthRedirect"; //send back to index if signed out


type Post = {
  _id: string;
  clubId: string;
  clubName: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
};


export default function HomePageScreen() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    setPosts([
      // Chess Club
      {
        _id: "1",
        clubId: "chess",
        clubName: "Chess Club",
        content: "Exciting chess match coming up!",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Chess_pieces_close_up.jpg/1200px-Chess_pieces_close_up.jpg",
        createdAt: "2025-03-26T10:00:00Z",
        likes: 5,
      },
      {
        _id: "2",
        clubId: "chess",
        clubName: "Chess Club",
        content: "Join our weekly practice session!",
        imageUrl:
          "https://assets.entrepreneur.com/content/3x2/2000/20200317213324-GettyImages-1195224473.jpeg",
        createdAt: "2025-03-24T15:00:00Z",
        likes: 3,
      },
      {
        _id: "3",
        clubId: "chess",
        clubName: "Chess Club",
        content: "Grandmaster visit this month!",
        imageUrl:
          "https://www.nationaldaycalendar.com/.image/ar_16:9%2Cc_fill%2Ccs_srgb%2Cg_faces:center%2Cq_auto:eco%2Cw_768/MjAxNDAyMjQwMDY0MzAxMDI5/website-feature---national-chess-day---october-14.png",
        createdAt: "2025-03-22T12:00:00Z",
        likes: 7,
      },

      // Robotics Team
      {
        _id: "4",
        clubId: "robotics",
        clubName: "Robotics Team",
        content: "New robot prototype unveiled.",
        imageUrl:
          "https://resources.finalsite.net/images/t_image_size_4/v1569957203/marlborough/v3w2wboit6rizrsdccdu/20161203-RoboticsTournament20161204-77.jpg",
        createdAt: "2025-03-27T09:00:00Z",
        likes: 8,
      },
      {
        _id: "5",
        clubId: "robotics",
        clubName: "Robotics Team",
        content: "Gearing up for the inter-university competition!",
        imageUrl:
          "https://ciowomenmagazine.com/wp-content/uploads/2024/01/1.1-Promoting-Creativity-and-Innovation.jpg",
        createdAt: "2025-03-25T14:30:00Z",
        likes: 6,
      },
      {
        _id: "6",
        clubId: "robotics",
        clubName: "Robotics Team",
        content: "Workshop: Learn to build your first robot.",
        imageUrl:
          "https://d12aarmt01l54a.cloudfront.net/cms/images/Media-20230412123750/808-440.png",
        createdAt: "2025-03-23T11:00:00Z",
        likes: 4,
      },

      // Art Society
      {
        _id: "7",
        clubId: "art",
        clubName: "Art Society",
        content: "New exhibition this weekend!",
        imageUrl:
          "https://bykerwin.com/wp-content/uploads/2024/10/IMG_9839-Large-crypt-main-wall-landscape-wordpress.jpeg",
        createdAt: "2025-03-25T12:00:00Z",
        likes: 12,
      },
      {
        _id: "8",
        clubId: "art",
        clubName: "Art Society",
        content: "Art contest submissions are open!",
        imageUrl:
          "https://www.singulart.com/blog/wp-content/uploads/2024/05/15037_artwork_42ca83a0b53575a2bc65d8bfe13c7624-2.jpeg",
        createdAt: "2025-03-24T10:00:00Z",
        likes: 9,
      },
      {
        _id: "9",
        clubId: "art",
        clubName: "Art Society",
        content: "Live painting session at the quad.",
        imageUrl:
          "https://i0.wp.com/www.randolphartsguild.com/wp-content/uploads/northern-high-school-art-club-ptg-party-4.jpg?fit=960%2C720&ssl=1",
        createdAt: "2025-03-22T16:00:00Z",
        likes: 11,
      },
    ]);
  }, []);

  return <Homepage posts={posts} />;
}
