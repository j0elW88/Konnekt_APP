import React, { useState, useEffect } from "react";
import Homepage from "../../src/components/pages/Homepage";

import useAuthRedirect from "../../src/hooks/useAuthRedirect"; //send back to index if signed out


export default function HomePageScreen() {
  useAuthRedirect(); //If Ever Signed Out, returns to SignIn
  
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // Later: fetch this from backend using global.authUser.email
    setClubs([
      { name: "Chess Club", id: "chess" },
      { name: "Robotics Team", id: "robotics" },
      { name: "Art Society", id: "art" },
    ]);
  }, []);

  return <Homepage clubs={clubs} />;
}
