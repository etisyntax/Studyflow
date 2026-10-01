import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import PasswordInput from "../components/PasswordInput";
import AuthLayout from "../components/AuthLayout";
import { BookOpenIcon, RefreshIcon, AwardIcon } from "../components/Icons";
import "./Auth.css";

const loginPoints = [
  { icon: BookOpenIcon, text: "Continue from your last lesson" },
  { icon: RefreshIcon, text: "Retake quizzes and beat your best score" },
  { icon: AwardIcon, text: "Unlock your next badge" },
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError("Incorrect email or password. Please try again.");
      setAttempt((previous) => previous + 1);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <AuthLayout
      heading="Welcome back. Your progress is waiting."
      text="Pick up right where you stopped, with your lessons, scores and badges saved."
      points={loginPoints}
    >
      <h1 className="auth-in" style={{ "--d": "0.1s" }}>
        Welcome back
      </h1>
      <p className="auth-subtitle auth-in" style={{ "--d": "0.15s" }}>
        Log in to continue learning.
      </p>

      {error && (
        <div key={attempt} className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group auth-in" style={{ "--d": "0.2s" }}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group auth-in" style={{ "--d": "0.25s" }}>
          <label>Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>

        <div className="auth-in" style={{ "--d": "0.3s" }}>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading && <span className="auth-spinner"></span>}
            {loading ? "Logging in..." : "Log in"}
          </button>
        </div>
      </form>

      <p className="auth-switch auth-in" style={{ "--d": "0.35s" }}>
        New to StudyFlow? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;