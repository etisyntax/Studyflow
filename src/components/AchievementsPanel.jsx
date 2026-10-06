import { Link } from "react-router";
import { AwardIcon, LockIcon } from "./Icons";

const RING = 151;

function AchievementsPanel({ badges }) {
  const earned = badges.filter((badge) => badge.earned);
  const ordered = [...badges].sort((a, b) => Number(b.earned) - Number(a.earned));
  const nextBadge = badges
    .filter((badge) => !badge.earned)
    .sort((a, b) => b.current / b.target - a.current / a.target)[0];
  const remaining = badges.length - earned.length;
  const share = earned.length / badges.length;

  return (
    <div className="dash-panel">
      <div className="panel-head">
        <h2>Achievements</h2>
        <Link to="/profile" className="panel-link">
          View all
        </Link>
      </div>

      <div className="ach-summary">
        <div className="ach-ring">
          <svg viewBox="0 0 60 60">
            <circle className="ach-ring-bg" cx="30" cy="30" r="24" />
            <circle
              className="ach-ring-fill"
              cx="30"
              cy="30"
              r="24"
              style={{ strokeDashoffset: RING - RING * share }}
            />
          </svg>
          <span>
            {earned.length}/{badges.length}
          </span>
        </div>
        <div>
          <strong>
            {earned.length} {earned.length === 1 ? "badge" : "badges"} earned
          </strong>
          <p>
            {remaining === 0 ? "You have collected them all!" : `${remaining} more to collect`}
          </p>
        </div>
      </div>

      <div className="ach-slots">
        {ordered.map((badge) => {
          const Icon = badge.icon;
          return (
            <span
              key={badge.id}
              className={`ach-slot ${badge.earned ? "earned" : ""}`}
              title={badge.earned ? badge.title : `${badge.title} (locked)`}
            >
              {badge.earned ? <Icon size={16} /> : <LockIcon size={12} />}
            </span>
          );
        })}
      </div>

      {nextBadge && (
        <div className="ach-next">
          <span className="ach-next-icon">
            <AwardIcon size={18} />
          </span>
          <div className="ach-next-info">
            <span className="ach-next-label">Next badge</span>
            <strong>{nextBadge.title}</strong>
            <div className="ach-next-bar">
              <div style={{ width: `${(nextBadge.current / nextBadge.target) * 100}%` }}></div>
            </div>
            <span className="ach-next-progress">
              {nextBadge.current}
              {nextBadge.unit || ""} / {nextBadge.target}
              {nextBadge.unit || ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AchievementsPanel;