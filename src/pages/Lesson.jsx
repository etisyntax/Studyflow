import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import Markdown from "react-markdown";
import { supabase } from "../lib/supabase";
import CodePlayground from "../components/CodePlayground";
import { useAchievements } from "../context/AchievementContext";
import { ArrowRightIcon, CheckIcon } from "../components/Icons";
import "./Lesson.css";

function Lesson() {
  const { courseId, lessonId } = useParams();
  const { checkForNewBadges } = useAchievements();
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const barRef = useRef(null);

  useEffect(() => {
    async function loadLesson() {
      const [lessonRes, listRes, completionRes] = await Promise.all([
        supabase
          .from("lessons")
          .select("*, courses(title, color, playground)")
          .eq("id", lessonId)
          .single(),
        supabase
          .from("lessons")
          .select("id, title, position")
          .eq("course_id", courseId)
          .order("position"),
        supabase.from("completions").select("id").eq("lesson_id", lessonId).maybeSingle(),
      ]);

      if (lessonRes.error) {
        setError("Sorry, this lesson could not be found.");
        return;
      }

      setAllLessons(listRes.data || []);
      setIsCompleted(completionRes.data !== null);
      setLesson(lessonRes.data);
    }

    window.scrollTo(0, 0);
    loadLesson();
  }, [courseId, lessonId]);

  useEffect(() => {
    let frame = null;

    function update() {
      frame = null;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
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

  async function markComplete() {
    setSaving(true);
    setSaveError("");

    const { error } = await supabase.from("completions").insert({ lesson_id: lesson.id });

    setSaving(false);

    if (error && error.code !== "23505") {
      setSaveError("Could not save your progress. Please try again.");
      return;
    }

    setIsCompleted(true);
    checkForNewBadges();
  }

  if (error) return <div className="page-message error">{error}</div>;

  if (!lesson || String(lesson.id) !== lessonId) {
    return <div className="page-message">Loading lesson...</div>;
  }

  const index = allLessons.findIndex((item) => item.id === lesson.id);
  const previous = allLessons[index - 1];
  const next = allLessons[index + 1];
  const coursePercent = allLessons.length > 0 ? ((index + 1) / allLessons.length) * 100 : 0;

  return (
    <div className="lesson-page" style={{ "--course-color": lesson.courses.color }}>
      <div className="reading-progress">
        <div ref={barRef}></div>
      </div>

      <Link to={`/courses/${courseId}`} className="back-link">
        <ArrowRightIcon size={16} className="back-icon" /> Back to {lesson.courses.title}
      </Link>

      <div className="lesson-hero">
        <span className="lh-circle one"></span>
        <span className="lh-circle two"></span>

        <div className="lh-top">
          <span className="lh-course">{lesson.courses.title}</span>
          <span className="lh-count">
            Lesson {lesson.position} of {allLessons.length}
          </span>
        </div>

        <h1>{lesson.title}</h1>

        <div className="lh-bottom">
          <div className="lh-track">
            <div style={{ width: `${coursePercent}%` }}></div>
          </div>
          {isCompleted && (
            <span className="lh-done">
              <CheckIcon size={14} /> Completed
            </span>
          )}
        </div>
      </div>

      <article className="lesson-content">
        <Markdown>{lesson.content}</Markdown>
      </article>

      {lesson.example_code && (
        <CodePlayground
          key={lesson.id}
          initialCode={lesson.example_code}
          mode={lesson.playground || lesson.courses.playground}
        />
      )}

      <div className="complete-box">
        {isCompleted ? (
          <div className="completed-badge">
            <span className="completed-icon">
              <CheckIcon size={18} />
            </span>
            Lesson completed
          </div>
        ) : (
          <button
            className="btn btn-primary btn-large complete-btn"
            onClick={markComplete}
            disabled={saving}
          >
            <CheckIcon size={20} />
            {saving ? "Saving..." : "Mark lesson complete"}
          </button>
        )}
        {saveError && <p className="save-error">{saveError}</p>}
      </div>

      <div className="lesson-nav">
        {previous && (
          <Link to={`/courses/${courseId}/lessons/${previous.id}`} className="nav-card prev">
            <span className="nav-label">
              <ArrowRightIcon size={14} className="back-icon" /> Previous
            </span>
            <strong>{previous.title}</strong>
          </Link>
        )}

        {next ? (
          <Link to={`/courses/${courseId}/lessons/${next.id}`} className="nav-card next">
            <span className="nav-label">
              Next <ArrowRightIcon size={14} />
            </span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <Link to={`/courses/${courseId}`} className="nav-card next">
            <span className="nav-label">
              Finished <ArrowRightIcon size={14} />
            </span>
            <strong>Back to course</strong>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Lesson;