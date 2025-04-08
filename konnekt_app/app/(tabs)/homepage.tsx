import React, { useEffect, useState } from "react";
import Homepage from "../../src/components/pages/Homepage";
import useAuthRedirect from "../../src/hooks/useAuthRedirect";
import { IP_ADDRESS } from "../../src/components/config/globalvariables";
import { useIsFocused } from '@react-navigation/native';

type Club = {
  _id: string;
  name: string;
  color?: string;
};

export default function HomePageScreen() {
  useAuthRedirect();
  const isFocused = useIsFocused();
  const [clubs, setClubs] = useState<Club[]>([]);

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
      setClubs([]); // fallback if fetch fails
    }
  };

  useEffect(() => {
    if (isFocused) fetchUserClubs();
  }, [isFocused]);

  return <Homepage clubs={clubs} />;
}
