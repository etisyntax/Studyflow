import { Link } from "react-router";
import { BookOpenIcon, TargetIcon, AwardIcon, TrophyIcon, ArrowRightIcon } from "./Icons";

const reasons = [
  { icon: BookOpenIcon, text: "Short lessons from your first HTML tag to React apps" },
  { icon: TargetIcon, text: "Quizzes with instant feedback on every answer" },
  { icon: AwardIcon, text: "Badges and progress tracking as you learn" },
];

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <aside className="auth-panel">
        <span className="ap-circle one"></span>
        <span className="ap-circle two"></span>
        <span className="ap-shape square"></span>
        <span className="ap-shape ring"></span>
        <span className="ap-shape dot"></span>

        <Link to="/" className="ap-logo">
          <span className="ap-mark">S</span>
          StudyFlow
        </Link>

        <div className="ap-body">
          <h2>
            Learn. Practice.
            <br />
            Understand.
          </h2>
          <p>Everything you need to learn web development, in one place.</p>

          <ul className="ap-reasons">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <li key={reason.text} style={{ "--d": `${0.4 + index * 0.12}s` }}>
                  <span className="ap-reason-icon">
                    <Icon size={18} />
                  </span>
                  {reason.text}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="ap-toast">
          <span className="ap-toast-icon">
            <TrophyIcon size={18} />
          </span>
          <div>
            <strong>Badge unlocked!</strong>
            <span>First Steps</span>
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">{children}</div>
        <Link to="/" className="auth-back">
          <ArrowRightIcon size={14} className="auth-back-icon" /> Back to home
        </Link>
      </main>
    </div>
  );
}

export default AuthLayout;