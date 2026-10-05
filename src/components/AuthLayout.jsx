import { Link } from "react-router";
import Logo from "./Logo";
import { TrophyIcon, ArrowRightIcon } from "./Icons";

function AuthLayout({ heading, text, points = [], children }) {
  return (
    <div className="auth-page">
      <aside className="auth-panel">
        <span className="ap-circle one"></span>
        <span className="ap-circle two"></span>
        <span className="ap-shape square"></span>
        <span className="ap-shape ring"></span>
        <span className="ap-shape dot"></span>

        <Link to="/" className="ap-logo">
          <Logo onDark size={38} />
        </Link>

        <div className="ap-body">
          <h2>{heading}</h2>
          <p>{text}</p>

          <ul className="ap-reasons">
            {points.map((point, index) => {
              const Icon = point.icon;
              return (
                <li key={point.text} style={{ "--d": `${0.4 + index * 0.12}s` }}>
                  <span className="ap-reason-icon">
                    <Icon size={18} />
                  </span>
                  {point.text}
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
        <span className="am-glow one"></span>
        <span className="am-glow two"></span>
        <span className="am-shape square"></span>
        <span className="am-shape ring"></span>
        <span className="am-shape dot"></span>

        <div className="auth-card">{children}</div>

        <Link to="/" className="auth-back">
          <span className="auth-back-icon">
            <ArrowRightIcon size={14} />
          </span>
          Back to home
        </Link>
      </main>
    </div>
  );
}

export default AuthLayout;