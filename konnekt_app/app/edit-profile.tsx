import React from "react";
import ProfileEditScreen from "../src/components/profile/editprofile";
import useAuthRedirect from "../src/hooks/useAuthRedirect"; //send back to index if signed out

export default function EditProfileWrapper() {
    useAuthRedirect();
  return <ProfileEditScreen />;
}
