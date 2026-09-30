import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { loadAchievementData } from "../lib/achievements";
import { LockIcon, EditIcon, CheckIcon } from "../components/Icons";
import "./Profile.css";

function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAchievementData()
      .then(setData)
      .catch(() => setError("Could not load your profile. Please try again."));
  }, []);

  function startEditing() {
    setName(profile && profile.full_name ? profile.full_name : "");
    setMessage("");
    setEditing(true);
  }

  async function saveName(event) {
    event.preventDefault();
    const trimmed = name.trim();

    if (trimmed.length < 3) {
      setMessage("Your name must be at least 3 characters.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: trimmed })
      .eq("id", user.id);
    setSaving(false);

    if (error) {
      setMessage("Could not save your name. Please try again.");
      return;
    }

    await refreshProfile();
    setEditing(false);
    setMessage("Name updated.");
  }

  const fullName = profile && profile.full_name ? profile.full_name : user.email;
  const initial = fullName.charAt(0).toUpperCase();
  const memberSince = profile && profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "";

  if (error) return <div className="page-message error">{error}</div>;
  if (!data) return <div className="page-message">Loading your profile...</div>;

  const { stats, badges } = data;
  const earnedCount = badges.filter((badge) => badge.earned).length;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">{initial}</div>

        <div className="profile-info">
          {editing ? (
            <form onSubmit={saveName} className="name-form">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </form>
          ) : (
            <div className="name-row">
              <h1>{fullName}</h1>
              <button className="edit-btn" onClick={startEditing} aria-label="Edit your name">
                <EditIcon size={16} /> Edit
              </button>
            </div>
          )}
          <p className="profile-email">{user.email}</p>
          {memberSince && <p className="profile-since">Member since {memberSince}</p>}
          {message && <p className="profile-message">{message}</p>}
        </div>
      </div>

      <div className="profile-stats">
        <div><strong>{stats.lessonsDone}</strong><span>Lessons completed</span></div>
        <div><strong>{stats.coursesCompleted}</strong><span>Courses completed</span></div>
        <div><strong>{stats.quizzesPassed}</strong><span>Quizzes passed</span></div>
        <div><strong>{stats.bestScore}%</strong><span>Best quiz score</span></div>
      </div>

      <div className="badges-head">
        <div>
          <h2>Achievements</h2>
          <p>{earnedCount} of {badges.length} badges earned</p>
        </div>
        <div className="badges-total">
          <div style={{ width: `${(earnedCount / badges.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="badge-grid">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          const unit = badge.unit || "";

          return (
            <div
              key={badge.id}
              className={`badge-card ${badge.earned ? "earned" : "locked"}`}
              style={{ animationDelay: `${Math.min(index, 11) * 0.04}s` }}
            >
              <div className="badge-icon">
                <Icon size={26} />
                {!badge.earned && (
                  <span className="badge-lock">
                    <LockIcon size={12} />
                  </span>
                )}
              </div>
              <h3>{badge.title}</h3>
              <p>{badge.description}</p>

              {badge.earned ? (
                <span className="badge-earned">
                  <CheckIcon size={14} /> Earned
                </span>
              ) : (
                <div className="badge-progress">
                  <div className="badge-bar">
                    <div style={{ width: `${(badge.current / badge.target) * 100}%` }}></div>
                  </div>
                  <span>
                    {badge.current}{unit} / {badge.target}{unit}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Profile;