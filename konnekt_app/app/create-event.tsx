import CreateEventScreen from '../src/components/pages/CreateEventScreen';
import useAuthRedirect from "../src/hooks/useAuthRedirect"; //send back to index if signed out

export default function CreateEventPage() {
  useAuthRedirect();
  return <CreateEventScreen />;
}
