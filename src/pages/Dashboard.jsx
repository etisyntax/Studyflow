import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user, profile } = useAuth();

  const firstName =
    profile && profile.full_name ? profile.full_name.split(" ")[0] : "";

  return (
    <div>
      <h1 className="dash-title">
        {getGreeting()}
        {firstName && `, ${firstName}`} 👋
      </h1>
      <p className="dash-email">You're logged in as {user.email}</p>

      <div className="dash-placeholder">
        Your courses, progress and achievements will appear here soon.
      </div>
    </div>
  );
}

export default Dashboard;