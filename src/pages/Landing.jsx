import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { achievements } from "../lib/achievements";
import Reveal from "../components/Reveal";
import Logo from "../components/Logo";
import {
  BookOpenIcon,
  CodeIcon,
  TargetIcon,
  BarChartIcon,
  AwardIcon,
  LockIcon,
  StarIcon,
  TrophyIcon,
  ArrowRightIcon,
  CheckIcon,
} from "../components/Icons";
import "./Landing.css";

const features = [
  { icon: BookOpenIcon, color: "#4f46e5", title: "Structured Lessons", text: "Short, clear lessons that build on each other, one step at a time." },
  { icon: CodeIcon, color: "#6d28d9", title: "Live Code Playground", text: "Edit the example code and run it instantly, right inside every lesson." },
  { icon: TargetIcon, color: "#7c3aed", title: "Quizzes at Your Level", text: "Easy, Medium and Hard quizzes, with instant feedback on every answer." },
  { icon: BarChartIcon, color: "#4338ca", title: "Progress Tracking", text: "Watch your lessons, scores and course progress grow on your dashboard." },
  { icon: AwardIcon, color: "#9333ea", title: "Badges to Earn", text: `Unlock ${achievements.length} achievements as you learn, and celebrate every milestone.` },
  { icon: LockIcon, color: "#5b21b6", title: "Verified Scores", text: "Answers are marked on the server, so every score is real and earned." },
];

const steps = [
  { title: "Create your account", text: "Sign up in seconds with your name and email." },
  { title: "Study and practice", text: "Work through lessons and try the code yourself." },
  { title: "Test and track", text: "Take quizzes, earn badges and watch your progress grow." },
];

const shapes = [
  { type: "circle", x: "6%", y: "20%", size: 18, color: "#6366f1", dur: 9 },
  { type: "square", x: "44%", y: "10%", size: 14, color: "#a855f7", dur: 11 },
  { type: "ring", x: "92%", y: "72%", size: 34, color: "#8b5cf6", dur: 13 },
  { type: "circle", x: "52%", y: "88%", size: 12, color: "#c4b5fd", dur: 8 },
  { type: "square", x: "3%", y: "80%", size: 20, color: "#7c3aed", dur: 12 },
  { type: "ring", x: "40%", y: "62%", size: 24, color: "#a78bfa", dur: 10 },
  { type: "circle", x: "96%", y: "18%", size: 10, color: "#4f46e5", dur: 7 },
];

const cardMotions = ["left", "drop", "right"];

function Words({ text, start = 0, step = 0.08 }) {
  return text.split(" ").map((word, index) => (
    <span key={index} className="lp-word" style={{ "--wd": `${start + index * step}s` }}>
      {word}
    </span>
  ));
}

function SectionHeading({ eyebrow, title, text }) {
  return (
    <div className="lp-heading">
      <Reveal animation="drop">
        <span className="lp-eyebrow">{eyebrow}</span>
      </Reveal>
      <Reveal animation="none" className="lp-title-reveal">
        <h2>
          <Words text={title} start={0.15} />
        </h2>
      </Reveal>
      {text && (
        <Reveal delay={0.4}>
          <p>{text}</p>
        </Reveal>
      )}
    </div>
  );
}

function CountUp({ end }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || end === 0) return;
    let frame;
    let timer;

    function run() {
      cancelAnimationFrame(frame);
      const duration = 2400;
      let start = null;

      function tick(now) {
        if (start === null) start = now;
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(end * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
      }

      frame = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(run, 400);
        } else if (entry.boundingClientRect.top > 0) {
          clearTimeout(timer);
          cancelAnimationFrame(frame);
          setValue(0);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [end]);

  return <span ref={ref}>{value}</span>;
}

function CourseItem({ course }) {
  return (
    <div className="lp-course" style={{ "--accent": course.color }}>
      <span className="lp-course-mark">{course.title.charAt(0)}</span>
      <div>
        <strong>{course.title}</strong>
        <span>{course.lessons} lessons</span>
      </div>
    </div>
  );
}

function Marquee({ items, reverse = false }) {
  return (
    <div className={`lp-marquee ${reverse ? "reverse" : ""}`}>
      <div className="lp-track">
        {items.map((course) => (
          <CourseItem key={course.title} course={course} />
        ))}
        <div className="lp-track-copy" aria-hidden="true">
          {items.map((course) => (
            <CourseItem key={course.title} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}

function handleSpotlight(event) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  card.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

function Landing() {
  const { session } = useAuth();
  const [info, setInfo] = useState(null);
  const rootRef = useRef(null);
  const navRef = useRef(null);
  const tiltRef = useRef(null);

  useEffect(() => {
    supabase.rpc("landing_stats").then(({ data, error }) => {
      if (!error) setInfo(data);
    });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const nav = navRef.current;
    let frame = null;

    function update() {
      frame = null;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty("--scroll", y);
      root.style.setProperty("--progress", max > 0 ? y / max : 0);
      nav.classList.toggle("scrolled", y > 10);
    }

    function handleScroll() {
      if (frame === null) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  function handleTilt(event) {
    const card = tiltRef.current;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--ry", `${x * 16}deg`);
    card.style.setProperty("--rx", `${y * -16}deg`);
  }

  function resetTilt() {
    tiltRef.current.style.setProperty("--ry", "0deg");
    tiltRef.current.style.setProperty("--rx", "0deg");
  }

  const stats = [
    { end: info ? info.courses : 0, label: "Courses" },
    { end: info ? info.lessons : 0, label: "Lessons" },
    { end: info ? info.quizzes : 0, label: "Quizzes" },
    { end: info ? info.questions : 0, label: "Quiz questions" },
  ];

  const courseList = info ? info.course_list : [];

  return (
    <div className="lp" ref={rootRef}>
      <div className="lp-progress"></div>

      <header className="lp-nav" ref={navRef}>
        <div className="lp-container lp-nav-inner">
          <Link to="/" className="lp-logo" aria-label="StudyFlow home">
            <Logo size={36} />
          </Link>
          <nav className="lp-nav-links">
            {session ? (
              <Link to="/dashboard" className="btn btn-primary">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="lp-login">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="lp-hero">
        <div className="lp-parallax slow">
          <span className="lp-blob one"></span>
          <span className="lp-blob two"></span>
          <span className="lp-blob three"></span>
        </div>

        <div className="lp-parallax fast">
          {shapes.map((shape, index) => (
            <span
              key={index}
              className={`lp-shape ${shape.type}`}
              style={{
                left: shape.x,
                top: shape.y,
                "--size": `${shape.size}px`,
                "--color": shape.color,
                "--dur": `${shape.dur}s`,
              }}
            ></span>
          ))}
        </div>

        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-text">
            <span className="lp-pill lp-in" style={{ "--d": "0s" }}>
              <StarIcon size={14} /> Learning made simple
            </span>

            <h1 className="lp-hero-title">
              <Words text="Learn. Practice." start={0.15} step={0.15} />
              <br />
              <span className="lp-word lp-gradient-text" style={{ "--wd": "0.5s" }}>
                Understand.
              </span>
            </h1>

            <p className="lp-in" style={{ "--d": "0.8s" }}>
              StudyFlow brings lessons, practice and quizzes together in one place, so you
              always know how well you understand what you study.
            </p>

            <div className="lp-hero-actions">
              <div className="lp-btn-in" style={{ "--d": "1s" }}>
                <Link to="/register" className="btn btn-primary lp-cta-primary">
                  Start Learning Free <ArrowRightIcon size={18} />
                </Link>
              </div>
              <div className="lp-btn-in" style={{ "--d": "1.08s" }}>
                <Link to="/login" className="btn btn-outline lp-cta-secondary">
                  I have an account
                </Link>
              </div>
            </div>

            <ul className="lp-checks lp-in" style={{ "--d": "1.3s" }}>
              <li><CheckIcon size={16} /> Free to use</li>
              <li><CheckIcon size={16} /> Nothing to install</li>
              <li><CheckIcon size={16} /> Works on any device</li>
            </ul>
          </div>

          <div
            className="lp-hero-visual lp-in"
            style={{ "--d": "0.6s" }}
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
          >
            <div className="lp-tilt" ref={tiltRef}>
              <div className="lp-chip">
                <CodeIcon size={16} /> console.log("Hello")
              </div>

              <div className="lp-preview">
                <span className="lp-preview-label">Continue learning</span>
                <h3>JavaScript Fundamentals</h3>
                <div className="lp-preview-bar">
                  <div></div>
                </div>
                <p>16 of 20 lessons completed</p>
                <div className="lp-preview-stats">
                  <div><strong>16</strong><span>Lessons</span></div>
                  <div><strong>84%</strong><span>Quiz average</span></div>
                  <div><strong>5</strong><span>Badges</span></div>
                </div>
              </div>

              <div className="lp-toast">
                <span className="lp-toast-icon">
                  <TrophyIcon size={18} />
                </span>
                <div>
                  <strong>Badge unlocked!</strong>
                  <span>High Achiever</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-stats">
        <div className="lp-container lp-stats-grid">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} animation="zoom" delay={index * 0.12}>
              <div className="lp-stat">
                <strong><CountUp end={stat.end} /></strong>
                <span>{stat.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="lp-section lp-features">
        <div className="lp-container">
          <SectionHeading
            eyebrow="Features"
            title="Everything you need to learn better"
            text="Study, practice and test yourself without jumping between different websites."
          />

          <div className="lp-feature-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Reveal
                  key={feature.title}
                  animation={cardMotions[index % 3]}
                  delay={(index % 3) * 0.15}
                >
                  <div
                    className="lp-feature"
                    style={{ "--accent": feature.color }}
                    onMouseMove={handleSpotlight}
                  >
                    <span className="lp-feature-icon">
                      <Icon size={26} />
                    </span>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {courseList.length > 0 && (
        <section className="lp-section lp-courses">
          <div className="lp-container">
            <SectionHeading
              eyebrow="Courses"
              title="From your first tag to React apps"
              text={`${courseList.length} courses that take you step by step through modern web development.`}
            />
          </div>

          <Reveal animation="left">
            <Marquee items={courseList} />
          </Reveal>
          <Reveal animation="right" delay={0.15}>
            <Marquee items={[...courseList].reverse()} reverse />
          </Reveal>
        </section>
      )}

      <section className="lp-section lp-how">
        <div className="lp-container">
          <SectionHeading eyebrow="How it works" title="Three simple steps to start learning" />

          <Reveal animation="none" className="lp-steps">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="lp-step"
                style={{ "--d": `${0.3 + index * 0.3}s` }}
              >
                <span className="lp-step-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="lp-end">
        <div className="lp-container">
          <Reveal animation="flip">
            <div className="lp-cta">
              <span className="lp-cta-circle one"></span>
              <span className="lp-cta-circle two"></span>
              <span className="lp-cta-circle three"></span>
              <h2>Ready to start learning?</h2>
              <p>Create your free account and take your first lesson today.</p>
              <div className="lp-cta-actions">
                <Link to="/register" className="lp-btn-light">
                  Create free account <ArrowRightIcon size={18} />
                </Link>
                <Link to="/login" className="lp-btn-outline-light">
                  Log in
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export default Landing;