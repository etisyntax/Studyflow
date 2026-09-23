import { Link } from "react-router";
import "./Landing.css";

const features = [
  {
    icon: "📚",
    title: "Structured Lessons",
    text: "Short, clear lessons that build on each other, one step at a time.",
  },
  {
    icon: "💻",
    title: "Live Code Playground",
    text: "Edit the example code and run it instantly, right inside the lesson.",
  },
  {
    icon: "🎯",
    title: "Quizzes at Your Level",
    text: "Choose Easy, Medium or Hard and get instant feedback on every answer.",
  },
  {
    icon: "📈",
    title: "Progress Tracking",
    text: "Watch your lessons, scores and achievements grow on your dashboard.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    text: "Sign up in seconds with your name and email.",
  },
  {
    number: "02",
    title: "Study and practice",
    text: "Work through lessons and try the code yourself.",
  },
  {
    number: "03",
    title: "Test and track",
    text: "Take quizzes and watch your progress grow.",
  },
];

function Landing() {
  return (
    <div className="landing">
      <nav className="nav">
        <Link to="/" className="logo">
          <span className="logo-mark">S</span>
          StudyFlow
        </Link>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost">
            Log in
          </Link>
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-text">
          <span className="badge">✨ Learning made simple</span>
          <h1>
            Learn. Practice. <span className="highlight">Understand.</span>
          </h1>
          <p>
            StudyFlow brings lessons, practice and quizzes together in one
            place, so you always know how well you understand what you study.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Start Learning Free
            </Link>
            <Link to="/login" className="btn btn-outline btn-large">
              I have an account
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="preview-card">
            <p className="preview-label">Continue learning</p>
            <h3>JavaScript Fundamentals</h3>
            <div className="progress-track">
              <div className="progress-fill"></div>
            </div>
            <p className="preview-small">8 of 10 lessons completed</p>
            <div className="preview-stats">
              <div>
                <strong>12</strong>
                <span>Lessons</span>
              </div>
              <div>
                <strong>84%</strong>
                <span>Quiz average</span>
              </div>
              <div>
                <strong>3</strong>
                <span>Badges</span>
              </div>
            </div>
          </div>
          <div className="floating-badge">🏆 Scored 90% on Functions Quiz</div>
        </div>
      </header>

      <section className="section">
        <h2 className="section-title">Everything you need to learn better</h2>
        <p className="section-subtitle">
          Study, practice and test yourself without jumping between different
          websites.
        </p>
        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">
          Three simple steps to start learning.
        </p>
        <div className="steps-grid">
          {steps.map((step) => (
            <div className="step" key={step.number}>
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="cta-box">
          <h2>Ready to start learning?</h2>
          <p>Create your free account and take your first lesson today.</p>
          <Link to="/register" className="btn btn-white btn-large">
            Get Started
          </Link>
        </div>
      </section>

      <footer className="footer">
        © 2026 StudyFlow. Built with React and Supabase.
      </footer>
    </div>
  );
}

export default Landing;
