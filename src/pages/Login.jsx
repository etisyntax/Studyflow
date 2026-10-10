import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import PasswordInput from "../components/PasswordInput";
import AuthLayout from "../components/AuthLayout";
import "./Auth.css";

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
    <AuthLayout>
      <h1 className="auth-in" style={{ "--d": "0.05s" }}>
        Welcome back
      </h1>
      <p className="auth-subtitle auth-in" style={{ "--d": "0.1s" }}>
        Log in to pick up right where you stopped.
      </p>

      {error && (
        <div key={attempt} className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group auth-in" style={{ "--d": "0.15s" }}>
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

        <div className="form-group auth-in" style={{ "--d": "0.2s" }}>
          <label htmlFor="login-password">Password</label>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </div>

        <div className="auth-in" style={{ "--d": "0.25s" }}>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading && <span className="auth-spinner"></span>}
            {loading ? "Logging in..." : "Log in"}
          </button>
        </div>
      </form>

      <p className="auth-switch auth-in" style={{ "--d": "0.3s" }}>
        New to StudyFlow? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;