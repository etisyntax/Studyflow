import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/PageHeader";
import CountUp from "../components/CountUp";
import { BookOpenIcon, ArrowRightIcon } from "../components/Icons";
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
        .order("position");

      if (error) setError("Could not load courses. Please try again.");
      else setCourses(data);

      setLoading(false);
    }

    loadCourses();
  }, []);

  const totalLessons = courses.reduce((sum, course) => sum + course.lessons[0].count, 0);

  let content;

  if (loading) {
    content = (
      <div className="courses-grid">
        <div className="course-card skeleton"></div>
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
            <Link
              to={`/courses/${course.id}`}
              className="course-card"
              key={course.id}
              style={{ "--course-color": course.color, "--i": index }}
            >
              <div className="course-banner">
                <span className="course-banner-circle"></span>
                <span className="course-mark">{course.title.charAt(0)}</span>
                <span className="course-level">{course.level}</span>
              </div>

              <div className="course-body">
                <h2>{course.title}</h2>
                <p>{course.description}</p>

                <div className="course-footer">
                  <span className="course-meta">
                    <BookOpenIcon size={16} />
                    {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
                  </span>
                  <span className="course-link">
                    Start learning <ArrowRightIcon size={16} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={BookOpenIcon}
        theme="indigo"
        title="Courses"
        subtitle="Choose a course and start learning at your own pace."
      >
        {!loading && !error && (
          <>
            <div className="ph-stat">
              <strong><CountUp end={courses.length} /></strong>
              <span>Courses</span>
            </div>
            <div className="ph-stat">
              <strong><CountUp end={totalLessons} /></strong>
              <span>Lessons</span>
            </div>
          </>
        )}
      </PageHeader>
      {content}
    </div>
  );
}

export default Courses;