import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import "./Courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      const { data, error } = await supabase
        .from("courses")
        .select("*, lessons(count)")
        .order("id");

      if (error) setError("Could not load courses. Please try again.");
      else setCourses(data);

      setLoading(false);
    }

    loadCourses();
  }, []);

  let content;

  if (loading) {
    content = (
      <div className="courses-grid">
        <div className="course-card skeleton"></div>
        <div className="course-card skeleton"></div>
      </div>
    );
  } else if (error) {
    content = <div className="page-message error">{error}</div>;
  } else if (courses.length === 0) {
    content = <div className="page-message">No courses available yet.</div>;
  } else {
    content = (
      <div className="courses-grid">
        {courses.map((course, index) => {
          const lessonCount = course.lessons[0].count;

          return (
            <div
              className="course-card"
              key={course.id}
              style={{
                "--course-color": course.color,
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="course-top">
                <div className="course-icon">{course.icon}</div>
                <span className="course-level">{course.level}</span>
              </div>

              <h2>{course.title}</h2>
              <p>{course.description}</p>

              <div className="course-footer">
                <span className="course-meta">
                  📖 {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
                </span>
                <Link to={`/courses/${course.id}`} className="course-link">
                  Start Learning →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Courses</h1>
        <p>Choose a course and start learning at your own pace.</p>
      </div>
      {content}
    </div>
  );
}

export default Courses;