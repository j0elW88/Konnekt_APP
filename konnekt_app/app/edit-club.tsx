import EditClubScreen from '../src/components/pages/EditClubScreen';
import useAuthRedirect from '../src/hooks/useAuthRedirect';

export default function EditClub() {
  useAuthRedirect();
  return <EditClubScreen />;
}
