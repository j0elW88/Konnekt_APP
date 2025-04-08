import React, { useEffect, useState } from "react";
import Homepage from "../../src/components/pages/Homepage";
import useAuthRedirect from "../../src/hooks/useAuthRedirect";

type Club = {
  _id: string;
  name: string;
};

export default function HomePageScreen() {
  useAuthRedirect();

  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    // Replace this with a real fetch later
    setClubs([
      { _id: "chess", name: "Chess Club" },
      { _id: "robotics", name: "Robotics Team" },
      { _id: "art", name: "Art Society" },
    ]);
  }, []);

  return <Homepage clubs={clubs} />;
}
