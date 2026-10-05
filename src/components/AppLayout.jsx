import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { AchievementProvider } from "../context/AchievementContext";
import Logo from "./Logo";
import {
  HomeIcon,
  CoursesIcon,
  TargetIcon,
  HistoryIcon,
  UserIcon,
  LogoutIcon,
} from "./Icons";
import "./AppLayout.css";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: <HomeIcon size={22} /> },
  { to: "/courses", label: "Courses", icon: <CoursesIcon size={22} /> },
  { to: "/quizzes", label: "Quizzes", icon: <TargetIcon size={22} /> },
  { to: "/history", label: "History", icon: <HistoryIcon size={22} /> },
  { to: "/profile", label: "Profile", icon: <UserIcon size={22} />, mobileOnly: true },
];

function AppLayout() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const name = profile && profile.full_name ? profile.full_name : user.email;
  const initial = name.charAt(0).toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <AchievementProvider>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Logo />
          </div>

          <nav className="sidebar-nav">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={`sidebar-link ${link.mobileOnly ? "mobile-only" : ""}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <NavLink to="/profile" className="sidebar-user" title="View your profile">
              <div className="avatar">{initial}</div>
              <div className="sidebar-user-info">
                <strong>{name}</strong>
                <span>View profile</span>
              </div>
            </NavLink>
            <button className="sidebar-link logout-btn" onClick={handleLogout}>
              <LogoutIcon size={22} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        <main className="app-content">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </AchievementProvider>
  );
}

export default AppLayout;