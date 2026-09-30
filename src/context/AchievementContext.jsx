import { createContext, useContext, useEffect, useRef, useState } from "react";
import { loadAchievementData } from "../lib/achievements";
import { XIcon } from "../components/Icons";
import "../components/AchievementToast.css";

const AchievementContext = createContext(null);

export function AchievementProvider({ children }) {
  const earnedRef = useRef(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadAchievementData()
      .then(({ badges }) => {
        earnedRef.current = new Set(
          badges.filter((badge) => badge.earned).map((badge) => badge.id)
        );
      })
      .catch((error) => console.error(error));
  }, []);

  function dismiss(key) {
    setToasts((current) => current.filter((toast) => toast.key !== key));
  }

  async function checkForNewBadges() {
    try {
      const { badges } = await loadAchievementData();
      const earnedNow = badges.filter((badge) => badge.earned);

      if (earnedRef.current) {
        const fresh = earnedNow.filter((badge) => !earnedRef.current.has(badge.id));

        fresh.forEach((badge, index) => {
          const key = `${badge.id}-${Date.now()}`;
          setTimeout(() => {
            setToasts((current) => [...current, { key, badge }]);
            setTimeout(() => dismiss(key), 5000);
          }, index * 700);
        });
      }

      earnedRef.current = new Set(earnedNow.map((badge) => badge.id));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AchievementContext.Provider value={{ checkForNewBadges }}>
      {children}

      <div className="toast-stack" aria-live="polite">
        {toasts.map(({ key, badge }) => {
          const Icon = badge.icon;

          return (
            <div key={key} className="badge-toast" role="status">
              <div className="badge-toast-icon">
                <Icon size={26} />
                <span className="badge-toast-shine"></span>
              </div>
              <div className="badge-toast-text">
                <span>Badge unlocked!</span>
                <strong>{badge.title}</strong>
                <p>{badge.description}</p>
              </div>
              <button
                className="badge-toast-close"
                onClick={() => dismiss(key)}
                aria-label="Close notification"
              >
                <XIcon size={16} />
              </button>
              <div className="badge-toast-timer"></div>
            </div>
          );
        })}
      </div>
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  return useContext(AchievementContext);
}