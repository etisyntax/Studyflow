import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import PasswordInput from "../components/PasswordInput";
import AuthLayout from "../components/AuthLayout";
import "./Auth.css";
import "./Reset.css";

function ResetPassword() {
  // checking: reading the link, ready: show the form, invalid: bad or expired link
  // An expired or used link comes back with an error in the address.
  const linkFailed = window.location.hash.includes("error");
  const [status, setStatus] = useState(linkFailed ? "invalid" : "checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (linkFailed) return;

    // Supabase reads the token from the link and fires PASSWORD_RECOVERY.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setStatus("ready");
      }
    });

    // The session may already be set by the time this page loads.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus("ready");
    });

    // If nothing arrives, the link is not valid.
    const timer = setTimeout(() => {
      setStatus((current) => (current === "checking" ? "invalid" : current));
    }, 4000);

    return () => {
      data.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [linkFailed]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("Could not update your password. Please request a new link.");
      return;
    }

    // The reset link logs the student in for a short time. We log them out,
    // so they must sign in again with the new password.
    await supabase.auth.signOut();
    navigate("/login", { replace: true, state: { passwordReset: true } });
  }

  if (status === "checking") {
    return (
      <AuthLayout>
        <h1>Checking your link...</h1>
        <p className="auth-subtitle">This only takes a moment.</p>
      </AuthLayout>
    );
  }

  if (status === "invalid") {
    return (
      <AuthLayout>
        <h1 className="auth-in" style={{ "--d": "0.05s" }}>
          This link has expired
        </h1>
        <p className="auth-subtitle auth-in" style={{ "--d": "0.1s" }}>
          Reset links can only be used once, and only for a short time.
        </p>
        <div className="auth-in" style={{ "--d": "0.15s" }}>
          <Link to="/forgot-password" className="btn btn-primary auth-submit">
            Send a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="auth-in" style={{ "--d": "0.05s" }}>
        Choose a new password
      </h1>
      <p className="auth-subtitle auth-in" style={{ "--d": "0.1s" }}>
        Use at least 6 characters.
      </p>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group auth-in" style={{ "--d": "0.15s" }}>
          <label htmlFor="new-password">New password</label>
          <PasswordInput
            id="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>

        <div className="form-group auth-in" style={{ "--d": "0.2s" }}>
          <label htmlFor="confirm-password">Confirm new password</label>
          <PasswordInput
            id="confirm-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type it again"
            autoComplete="new-password"
          />
        </div>

        <div className="auth-in" style={{ "--d": "0.25s" }}>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading && <span className="auth-spinner"></span>}
            {loading ? "Saving..." : "Save new password"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;