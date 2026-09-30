import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { supabase } from "../lib/supabase";
import "./CourseDetail.css";

function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) {
        setError("Sorry, this course could not be found.");
        setLoading(false);
        return;
      }

      const { data: lessonData } = await supabase
        .from("lessons")
        .select("id, title, position")
        .eq("course_id", courseId)
        .order("position");

      const lessonIds = lessonData.map((lesson) => lesson.id);
      let completed = [];

      if (lessonIds.length > 0) {
        const { data: completionData } = await supabase
          .from("completions")
          .select("lesson_id")
          .in("lesson_id", lessonIds);

        completed = completionData.map((item) => item.lesson_id);
      }

      setCourse(courseData);
      setLessons(lessonData);
      setCompletedIds(completed);
      setLoading(false);
    }

    loadCourse();
  }, [courseId]);

  if (loading) return <div className="page-message">Loading course...</div>;
  if (error) return <div className="page-message error">{error}</div>;

  const completedCount = lessons.filter((lesson) =>
    completedIds.includes(lesson.id)
  ).length;

  const percent =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const nextLesson = lessons.find((lesson) => !completedIds.includes(lesson.id));

  return (
    <div style={{ "--course-color": course.color }}>
      <Link to="/courses" className="back-link">
        ← All courses
      </Link>

      <div className="course-hero">
        <div className="course-hero-icon">{course.icon}</div>
        <div>
          <span className="detail-level">{course.level}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="page-message">Lessons for this course are coming soon.</div>
      ) : (
        <>
          <div className="progress-card">
            <div className="progress-info">
              <strong>{percent}% complete</strong>
              <span>
                {completedCount} of {lessons.length} lessons
              </span>
            </div>
            <div className="course-progress-track">
              <div className="course-progress-bar" style={{ width: `${percent}%` }}></div>
            </div>

            {nextLesson ? (
              <Link
                to={`/courses/${courseId}/lessons/${nextLesson.id}`}
                className="btn btn-primary"
              >
                {completedCount === 0
                  ? "Start first lesson →"
                  : `Continue: ${nextLesson.title} →`}
              </Link>
            ) : (
              <p className="course-done">🎉 You've completed every lesson in this course!</p>
            )}
          </div>

          <h2 className="lessons-heading">Lessons</h2>
          <div className="lesson-list">
            {lessons.map((lesson) => {
              const done = completedIds.includes(lesson.id);

              return (
                <Link
                  key={lesson.id}
                  to={`/courses/${courseId}/lessons/${lesson.id}`}
                  className={`lesson-row ${done ? "done" : ""}`}
                >
                  <span className="lesson-number">
                    {String(lesson.position).padStart(2, "0")}
                  </span>
                  <span className="lesson-title">{lesson.title}</span>
                  <span className="lesson-status">{done ? "✓" : ""}</span>
                </Link>
              );
            })}
          </div>

        </>
      )}
    </div>
  );
}

export default CourseDetail;