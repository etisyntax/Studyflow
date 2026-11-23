import { useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import AuthLayout from "../components/AuthLayout";
import "./Auth.css";
import "./Reset.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    // Supabase emails a reset link. The link brings the student back to /reset-password.
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(
        error.status === 429
          ? "Too many requests. Please wait a few minutes and try again."
          : "Could not send the reset link. Please try again."
      );
      return;
    }

    // We show the same message whether or not the email has an account,
    // so nobody can use this page to find out who is registered.
    setSent(true);
  }

  if (sent) {
    return (
      <AuthLayout>
        <h1 className="auth-in" style={{ "--d": "0.05s" }}>
          Check your email
        </h1>
        <div className="auth-success auth-in" style={{ "--d": "0.1s" }} role="status">
          If an account exists for <strong>{email.trim()}</strong>, we have sent a link to reset
          your password. The link opens this website so you can choose a new password.
        </div>
        <p className="auth-switch auth-in" style={{ "--d": "0.15s" }}>
          Remembered it? <Link to="/login">Back to log in</Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="auth-in" style={{ "--d": "0.05s" }}>
        Forgot your password?
      </h1>
      <p className="auth-subtitle auth-in" style={{ "--d": "0.1s" }}>
        Enter your email and we will send you a link to choose a new one.
      </p>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group auth-in" style={{ "--d": "0.15s" }}>
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="auth-in" style={{ "--d": "0.2s" }}>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading && <span className="auth-spinner"></span>}
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </div>
      </form>

      <p className="auth-switch auth-in" style={{ "--d": "0.25s" }}>
        Remembered it? <Link to="/login">Back to log in</Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPassword;