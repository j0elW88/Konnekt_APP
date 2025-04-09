import CalendarPage from '../../src/components/pages/CalendarPage';
import useAuthRedirect from "../../src/hooks/useAuthRedirect"; //send back to index if signed out

export default function CalendarTab() {
  useAuthRedirect();
  return <CalendarPage />;
}
