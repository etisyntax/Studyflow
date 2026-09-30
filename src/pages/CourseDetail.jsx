import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { supabase } from "../lib/supabase";
import CountUp from "../components/CountUp";
import { ArrowRightIcon, CheckIcon, TrophyIcon, BookOpenIcon } from "../components/Icons";
import "./CourseDetail.css";

const RING = 214;

function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      const [courseRes, lessonRes, completionRes] = await Promise.all([
        supabase.from("courses").select("*").eq("id", courseId).single(),
        supabase
          .from("lessons")
          .select("id, title, position")
          .eq("course_id", courseId)
          .order("position"),
        supabase.from("completions").select("lesson_id"),
      ]);

      if (courseRes.error) {
        setError("Sorry, this course could not be found.");
        setLoading(false);
        return;
      }

      setCourse(courseRes.data);
      setLessons(lessonRes.data || []);
      setCompletedIds(new Set((completionRes.data || []).map((item) => item.lesson_id)));
      setLoading(false);
    }

    loadCourse();
  }, [courseId]);

  if (loading) return <div className="page-message">Loading course...</div>;
  if (error) return <div className="page-message error">{error}</div>;

  const completedCount = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
  const percent =
    lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const nextLesson = lessons.find((lesson) => !completedIds.has(lesson.id));

  return (
    <div className="course-detail" style={{ "--course-color": course.color }}>
      <Link to="/courses" className="back-link">
        <ArrowRightIcon size={16} className="back-icon" /> All courses
      </Link>

      <div className="cd-hero">
        <span className="cd-circle one"></span>
        <span className="cd-circle two"></span>

        <span className="cd-mark">{course.title.charAt(0)}</span>

        <div className="cd-text">
          <span className="cd-level">{course.level}</span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
        </div>

        {lessons.length > 0 && (
          <div className="cd-ring">
            <svg viewBox="0 0 80 80">
              <circle className="cd-ring-bg" cx="40" cy="40" r="34" />
              <circle
                className="cd-ring-fill"
                cx="40"
                cy="40"
                r="34"
                style={{ strokeDashoffset: RING - (RING * percent) / 100 }}
              />
            </svg>
            <div className="cd-ring-text">
              <strong>
                <CountUp end={percent} />%
              </strong>
              <span>done</span>
            </div>
          </div>
        )}
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
                className="btn btn-primary cd-continue"
              >
                {completedCount === 0 ? "Start first lesson" : `Continue: ${nextLesson.title}`}
                <ArrowRightIcon size={18} />
              </Link>
            ) : (
              <p className="course-done">
                <TrophyIcon size={20} /> You have completed every lesson in this course!
              </p>
            )}
          </div>

          <h2 className="lessons-heading">
            <BookOpenIcon size={22} /> Lessons
          </h2>

          <div className="lesson-list">
            {lessons.map((lesson, index) => {
              const done = completedIds.has(lesson.id);
              const isNext = nextLesson && nextLesson.id === lesson.id;

              return (
                <Link
                  key={lesson.id}
                  to={`/courses/${courseId}/lessons/${lesson.id}`}
                  className={`lesson-row ${done ? "done" : ""} ${isNext ? "next" : ""}`}
                  style={{ "--i": Math.min(index, 20) }}
                >
                  <span className="lesson-number">
                    {String(lesson.position).padStart(2, "0")}
                  </span>
                  <span className="lesson-title">{lesson.title}</span>
                  {isNext && <span className="lesson-next-tag">Up next</span>}
                  <span className="lesson-status">
                    {done && <CheckIcon size={14} />}
                  </span>
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