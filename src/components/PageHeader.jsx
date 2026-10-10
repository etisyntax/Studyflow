import { useLocation } from "react-router";
import "./PageHeader.css";

const routeLabels = {
  courses: "Learn",
  quizzes: "Practice",
  history: "Track",
};

function PageHeader({ title, subtitle, label, children }) {
  const { pathname } = useLocation();
  const section = pathname.split("/")[1];
  const eyebrow = label || routeLabels[section];

  return (
    <header className="hero-header">
      <span className="ph-circle one"></span>
      <span className="ph-circle two"></span>

      <div className="ph-text">
        {eyebrow && <p className="ph-label">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="ph-subtitle">{subtitle}</p>}
      </div>

      {children && <div className="ph-extra">{children}</div>}
    </header>
  );
}

export default PageHeader;