import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import PasswordInput from "../components/PasswordInput";
import AuthLayout from "../components/AuthLayout";
import { LayersIcon, CodeIcon, BarChartIcon } from "../components/Icons";
import "./Auth.css";

const registerPoints = [
  { icon: LayersIcon, text: "A growing library of courses for every level" },
  { icon: CodeIcon, text: "Practise every lesson in a live code editor" },
  { icon: BarChartIcon, text: "Track your progress and earn badges" },
];

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];

function getStrength(password) {
  if (password.length < 6) return 0;
  let score = 1;
  if (password.length >= 10) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function friendlyError(message) {
  const text = message.toLowerCase();
  if (text.includes("already registered") || text.includes("already exists")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (text.includes("invalid") && text.includes("email")) {
    return "Please enter a valid email address.";
  }
  if (text.includes("network") || text.includes("fetch")) {
    return "Could not connect. Please check your internet connection.";
  }
  return "Could not create your account. Please try again.";
}

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();

  const strength = getStrength(password);

  function showError(message) {
    setError(message);
    setAttempt((previous) => previous + 1);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (fullName.trim().length < 3) {
      showError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    setLoading(false);

    if (error) {
      showError(friendlyError(error.message));
      return;
    }

    navigate("/dashboard");
  }

  return (
    <AuthLayout
      heading="Start your coding journey today."
      text="Learn web development step by step, at your own pace, completely free."
      points={registerPoints}
    >
      <h1 className="auth-in" style={{ "--d": "0.1s" }}>
        Create your account
      </h1>
      <p className="auth-subtitle auth-in" style={{ "--d": "0.15s" }}>
        Start learning in less than a minute.
      </p>

      {error && (
        <div key={attempt} className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group auth-in" style={{ "--d": "0.2s" }}>
          <label htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Goodwill Okon"
            required
          />
        </div>

        <div className="form-group auth-in" style={{ "--d": "0.25s" }}>
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group auth-in" style={{ "--d": "0.3s" }}>
          <label>Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          {password && (
            <div className={`strength level-${strength}`}>
              <div className="strength-bars">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="strength-label">{strengthLabels[strength]}</span>
            </div>
          )}
        </div>

        <div className="form-group auth-in" style={{ "--d": "0.35s" }}>
          <label>Confirm password</label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Type your password again"
          />
          {confirmPassword && (
            <span className={`match-hint ${password === confirmPassword ? "ok" : ""}`}>
              {password === confirmPassword ? "Passwords match" : "Passwords do not match yet"}
            </span>
          )}
        </div>

        <div className="auth-in" style={{ "--d": "0.4s" }}>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading && <span className="auth-spinner"></span>}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>
      </form>

      <p className="auth-switch auth-in" style={{ "--d": "0.45s" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;