import { Link } from "react-router";
import Logo from "./Logo";
import { ArrowRightIcon } from "./Icons";

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo" aria-label="StudyFlow home">
        <Logo size={36} />
      </Link>

      <main className="auth-card">{children}</main>

      <Link to="/" className="auth-back">
        <span className="auth-back-icon">
          <ArrowRightIcon size={14} />
        </span>
        Back to home
      </Link>
    </div>
  );
}

export default AuthLayout;