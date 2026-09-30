import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  BookOpenIcon,
  CheckIcon,
  LayersIcon,
  TargetIcon,
  BarChartIcon,
  ArrowRightIcon,
} from "../components/Icons";
import "./Dashboard.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(value) {
  const seconds = Math.floor((Date.now() - new Date(value)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Dashboard() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const [courseRes, completionRes, resultRes] = await Promise.all([
        supabase
          .from("courses")
          .select("id, title, color, position, lessons(id, title, position)")
          .order("position"),
        supabase
          .from("completions")
          .select("lesson_id, completed_at, lessons(title, course_id)")
          .order("completed_at", { ascending: false }),
        supabase
          .from("quiz_results")
          .select("id, score, total, taken_at, quiz_id, quizzes(title)")
          .order("taken_at", { ascending: false }),
      ]);

      if (courseRes.error || completionRes.error || resultRes.error) {
        setError("Could not load your dashboard. Please try again.");
        setLoading(false);
        return;
      }

      setCourses(courseRes.data);
      setCompletions(completionRes.data);
      setResults(resultRes.data);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const firstName =
    profile && profile.full_name ? profile.full_name.split(" ")[0] : "";

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (loading) return <div className="page-message">Loading your dashboard...</div>;
  if (error) return <div className="page-message error">{error}</div>;

  const completedIds = new Set(completions.map((item) => item.lesson_id));

  const courseStats = courses.map((course) => {
    const lessons = [...course.lessons].sort((a, b) => a.position - b.position);
    const done = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
    const percent = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
    const nextLesson = lessons.find((lesson) => !completedIds.has(lesson.id));
    return { ...course, lessons, done, percent, nextLesson };
  });

  const activeCourses = courseStats.filter((course) => course.lessons.length > 0);
  const totalLessons = activeCourses.reduce((sum, course) => sum + course.lessons.length, 0);
  const lessonsDone = completedIds.size;
  const coursesStarted = courseStats.filter((course) => course.done > 0).length;
  const quizzesTaken = results.length;
  const averageScore =
    quizzesTaken > 0
      ? Math.round(
          results.reduce((sum, item) => sum + (item.score / item.total) * 100, 0) /
            quizzesTaken
        )
      : 0;

  let continueCourse = null;
  if (completions.length > 0) {
    const lastCourseId = completions[0].lessons.course_id;
    continueCourse = courseStats.find(
      (course) => course.id === lastCourseId && course.nextLesson
    );
  }
  if (!continueCourse) {
    continueCourse = courseStats.find((course) => course.nextLesson);
  }

  const activity = [
    ...completions.map((item) => ({
      key: `lesson-${item.lesson_id}`,
      type: "lesson",
      text: `Completed ${item.lessons.title}`,
      date: item.completed_at,
    })),
    ...results.map((item) => ({
      key: `quiz-${item.id}`,
      type: "quiz",
      text: `Scored ${Math.round((item.score / item.total) * 100)}% on ${item.quizzes.title}`,
      date: item.taken_at,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <div className="dashboard">
      <div className="dash-header">
        <p className="dash-date">{today}</p>
        <h1 className="dash-title">
          {getGreeting()}
          {firstName && `, ${firstName}`}
        </h1>
        <p className="dash-subtitle">Here is how your learning is going.</p>
      </div>

      <div className="dash-stats">
        <div className="dash-stat">
          <span className="dash-stat-icon">
            <BookOpenIcon />
          </span>
          <div>
            <strong>
              {lessonsDone}
              <small> / {totalLessons}</small>
            </strong>
            <span>Lessons completed</span>
          </div>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-icon">
            <LayersIcon />
          </span>
          <div>
            <strong>{coursesStarted}</strong>
            <span>Courses started</span>
          </div>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-icon">
            <TargetIcon />
          </span>
          <div>
            <strong>{quizzesTaken}</strong>
            <span>Quizzes taken</span>
          </div>
        </div>
        <div className="dash-stat">
          <span className="dash-stat-icon">
            <BarChartIcon />
          </span>
          <div>
            <strong>{averageScore}%</strong>
            <span>Average quiz score</span>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-main">
          {continueCourse && (
            <div
              className="continue-card"
              style={{ "--course-color": continueCourse.color }}
            >
              <span className="continue-label">
                {lessonsDone === 0 ? "Start learning" : "Continue learning"}
              </span>
              <h2>{continueCourse.nextLesson.title}</h2>
              <p>
                {continueCourse.title} · Lesson {continueCourse.nextLesson.position}
              </p>
              <div className="continue-progress">
                <div style={{ width: `${continueCourse.percent}%` }}></div>
              </div>
              <Link
                to={`/courses/${continueCourse.id}/lessons/${continueCourse.nextLesson.id}`}
                className="btn btn-white"
              >
                {lessonsDone === 0 ? "Start first lesson" : "Continue"}{" "}
                <ArrowRightIcon size={18} />
              </Link>
            </div>
          )}

          <div className="dash-panel">
            <div className="panel-head">
              <h2>Course progress</h2>
              <Link to="/courses" className="panel-link">
                All courses
              </Link>
            </div>

            <div className="course-progress-list">
              {activeCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="cp-row"
                  style={{ "--course-color": course.color }}
                >
                  <span className="cp-dot"></span>
                  <div className="cp-info">
                    <div className="cp-top">
                      <strong>{course.title}</strong>
                      <span>
                        {course.done} / {course.lessons.length} lessons
                      </span>
                    </div>
                    <div className="cp-bar">
                      <div style={{ width: `${course.percent}%` }}></div>
                    </div>
                  </div>
                  <span className="cp-percent">{course.percent}%</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-panel dash-activity">
          <div className="panel-head">
            <h2>Recent activity</h2>
            <Link to="/history" className="panel-link">
              History
            </Link>
          </div>

          {activity.length === 0 ? (
            <p className="activity-empty">
              Your completed lessons and quiz scores will appear here.
            </p>
          ) : (
            <ul className="activity-list">
              {activity.map((item) => (
                <li key={item.key} className="activity-item">
                  <span className={`activity-icon ${item.type}`}>
                    {item.type === "lesson" ? (
                      <CheckIcon size={16} />
                    ) : (
                      <TargetIcon size={16} />
                    )}
                  </span>
                  <div>
                    <p>{item.text}</p>
                    <span>{timeAgo(item.date)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;