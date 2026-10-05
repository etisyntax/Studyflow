import "./Logo.css";

function Logo({ onDark = false, size = 34 }) {
  return (
    <span className={`brand ${onDark ? "on-dark" : ""}`} style={{ "--brand-size": `${size}px` }}>
      <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
        <path
          className="brand-bookmark"
          d="M8 3.5h16a2.5 2.5 0 0 1 2.5 2.5v22.2a1 1 0 0 1-1.58.81L16 22.6l-8.92 6.41A1 1 0 0 1 5.5 28.2V6A2.5 2.5 0 0 1 8 3.5z"
        />
        <path
          className="brand-wave"
          d="M20 10.5c-1.6-1.6-5.2-1.4-5.6 1-.5 2.8 5.8 2.2 5.4 5.4-.3 2.4-4 2.9-6 1.2"
        />
      </svg>
      <span className="brand-name">
        Study<span>Flow</span>
      </span>
    </span>
  );
}

export default Logo;