import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import { CompassIcon, ArrowRightIcon } from "../components/Icons";
import "./NotFound.css";

function NotFound() {
  const { session } = useAuth();

  return (
    <div className="nf-page">
      <Link to="/" className="nf-logo" aria-label="StudyFlow home">
        <Logo size={34} />
      </Link>

      <div className="nf-card">
        <span className="nf-icon">
          <CompassIcon size={40} />
        </span>
        <p className="nf-code">
          <span>404</span>
        </p>
        <h1>This page took a wrong turn</h1>
        <p className="nf-text">
          The page you are looking for does not exist, or it may have moved. Let us get you
          back to learning.
        </p>

        <div className="nf-actions">
          {session ? (
            <Link to="/dashboard" className="btn btn-primary btn-large">
              Go to dashboard <ArrowRightIcon size={18} />
            </Link>
          ) : (
            <Link to="/" className="btn btn-primary btn-large">
              Back to home <ArrowRightIcon size={18} />
            </Link>
          )}
          <Link to="/courses" className="btn btn-outline btn-large">
            Browse courses
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;