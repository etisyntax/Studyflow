import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import Markdown from "react-markdown";
import { supabase } from "../lib/supabase";
import CodePlayground from "../components/CodePlayground";
import "./Lesson.css";

function Lesson() {
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    async function loadLesson() {
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*, courses(playground)")
        .eq("id", lessonId)
        .single();

      if (lessonError) {
        setError("Sorry, this lesson could not be found.");
        return;
      }

      const { data: lessonList } = await supabase
        .from("lessons")
        .select("id, title, position")
        .eq("course_id", courseId)
        .order("position");

      const { data: completion } = await supabase
        .from("completions")
        .select("id")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      setAllLessons(lessonList);
      setIsCompleted(completion !== null);
      setLesson(lessonData);
    }

    window.scrollTo(0, 0);
    loadLesson();
  }, [courseId, lessonId]);

  async function markComplete() {
    setSaving(true);
    setSaveError("");

    const { error } = await supabase
      .from("completions")
      .insert({ lesson_id: lesson.id });

    setSaving(false);

    if (error && error.code !== "23505") {
      setSaveError("Could not save your progress. Please try again.");
      return;
    }

    setIsCompleted(true);
  }

  if (error) return <div className="page-message error">{error}</div>;

  if (!lesson || String(lesson.id) !== lessonId) {
    return <div className="page-message">Loading lesson...</div>;
  }

  const index = allLessons.findIndex((item) => item.id === lesson.id);
  const previous = allLessons[index - 1];
  const next = allLessons[index + 1];

  return (
    <div className="lesson-page">
      <Link to={`/courses/${courseId}`} className="back-link">
        ← Back to course
      </Link>

      <div className="lesson-header">
        <span className="lesson-kicker">
          Lesson {lesson.position} of {allLessons.length}
        </span>
        <h1>{lesson.title}</h1>
      </div>

      <article className="lesson-content">
        <Markdown>{lesson.content}</Markdown>
      </article>

      {lesson.example_code && (
        <CodePlayground
          key={lesson.id}
          initialCode={lesson.example_code}
          mode={lesson.courses.playground}
        />
      )}

      <div className="complete-box">
        {isCompleted ? (
          <div className="completed-badge">✓ Lesson completed</div>
        ) : (
          <button
            className="btn btn-primary btn-large complete-btn"
            onClick={markComplete}
            disabled={saving}
          >
            {saving ? "Saving..." : "Mark Lesson Complete"}
          </button>
        )}
        {saveError && <p className="save-error">{saveError}</p>}
      </div>

      <div className="lesson-nav">
        {previous && (
          <Link to={`/courses/${courseId}/lessons/${previous.id}`} className="nav-card">
            ← Previous
            <strong>{previous.title}</strong>
          </Link>
        )}

        {next ? (
          <Link to={`/courses/${courseId}/lessons/${next.id}`} className="nav-card next">
            Next →
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <Link to={`/courses/${courseId}`} className="nav-card next">
            Finished →
            <strong>Back to course</strong>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Lesson;