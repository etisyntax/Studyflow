import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (data && data.full_name) setFullName(data.full_name);
    }

    loadProfile();
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  const firstName = fullName.split(" ")[0];

  return (
    <div className="dashboard">
      <nav className="dash-nav">
        <div className="dash-logo">
          <span className="dash-mark">S</span>
          StudyFlow
        </div>
        <button className="btn btn-outline" onClick={handleLogout}>
          Log out
        </button>
      </nav>

      <main className="dash-main">
        <h1>
          {getGreeting()}
          {firstName && `, ${firstName}`} 👋
        </h1>
        <p className="dash-email">You're logged in as {user.email}</p>

        <div className="dash-placeholder">
          Your courses, progress and achievements will appear here soon.
        </div>
      </main>
    </div>
  );
}

export default Dashboard;