import React, { useState, useEffect } from "react";
import Homepage from "../../src/components/pages/Homepage";
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
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
=======

import useAuthRedirect from "../../src/hooks/useAuthRedirect"; //send back to index if signed out


export default function HomePageScreen() {
=======

import useAuthRedirect from "../../src/hooks/useAuthRedirect"; //send back to index if signed out


export default function HomePageScreen() {
>>>>>>> parent of 43d71eac (Beginning Implementation of Create Club Page)
=======

import useAuthRedirect from "../../src/hooks/useAuthRedirect"; //send back to index if signed out


export default function HomePageScreen() {
>>>>>>> parent of 43d71eac (Beginning Implementation of Create Club Page)
  
  useAuthRedirect(); //If Ever Signed Out, returns to SignIn
  
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> parent of 43d71eac (Beginning Implementation of Create Club Page)

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
<<<<<<< HEAD
    if (isFocused) fetchUserClubs();
  }, [isFocused]);
=======
=======

  useEffect(() => {
>>>>>>> parent of 43d71eac (Beginning Implementation of Create Club Page)
=======

  useEffect(() => {
>>>>>>> parent of 43d71eac (Beginning Implementation of Create Club Page)
    // Later: fetch this from backend using global.authUser.email
    setClubs([
      { name: "Chess Club", id: "chess" },
      { name: "Robotics Team", id: "robotics" },
      { name: "Art Society", id: "art" },
    ]);
  }, []);
>>>>>>> parent of 43d71eac (Beginning Implementation of Create Club Page)

  return <Homepage clubs={clubs} />;
}
