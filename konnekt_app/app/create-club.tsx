import CreateClubPage from '../src/components/pages/CreateClubPage';

import useAuthRedirect from "../src/hooks/useAuthRedirect"; //send back to index if signed out

export default function CreateClub() {
    useAuthRedirect(); //If Ever Signed Out, returns to SignIn
  return <CreateClubPage />;
}

