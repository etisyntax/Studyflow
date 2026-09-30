import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import "./Quizzes.css";

const levelOrder = { easy: 1, medium: 2, hard: 3 };
const levelLabels = { easy: "Easy", medium: "Medium", hard: "Hard" };

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    async function loadQuizzes() {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select(
          "id, position, title, description, difficulty, minutes, lesson_from, lesson_to, courses(id, title, icon, color, position)"
        );

      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("quiz_id");

      if (quizError || questionError) {
        setError("Could not load quizzes. Please try again.");
        setLoading(false);
        return;
      }

      const counts = {};
      questionData.forEach((question) => {
        counts[question.quiz_id] = (counts[question.quiz_id] || 0) + 1;
      });

      const list = quizData.map((quiz) => ({
        ...quiz,
        questionCount: counts[quiz.id] || 0,
      }));

      setQuizzes(list);
      setLoading(false);
    }

    loadQuizzes();
  }, []);

  const courses = [];
  quizzes.forEach((quiz) => {
    if (!courses.some((course) => course.id === quiz.courses.id)) {
      courses.push(quiz.courses);
    }
  });
  courses.sort((a, b) => a.position - b.position);

  const searchText = search.toLowerCase();

  const visibleQuizzes = quizzes
    .filter((quiz) =>
      `${quiz.title} ${quiz.courses.title} ${quiz.description}`
        .toLowerCase()
        .includes(searchText)
    )
    .filter((quiz) => topic === "all" || String(quiz.courses.id) === topic)
    .filter((quiz) => difficulty === "all" || quiz.difficulty === difficulty)
    .sort((a, b) => {
      if (sortBy === "easiest") return levelOrder[a.difficulty] - levelOrder[b.difficulty];
      if (sortBy === "hardest") return levelOrder[b.difficulty] - levelOrder[a.difficulty];
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return a.courses.position - b.courses.position || a.position - b.position;
    });

  let content;

  if (loading) {
    content = (
      <div className="quiz-grid">
        <div className="quiz-tile skeleton"></div>
        <div className="quiz-tile skeleton"></div>
        <div className="quiz-tile skeleton"></div>
      </div>
    );
  } else if (error) {
    content = <div className="page-message error">{error}</div>;
  } else if (visibleQuizzes.length === 0) {
    content = <div className="page-message">No quizzes match your search.</div>;
  } else {
    content = (
      <>
        <p className="quiz-count-text">
          Showing {visibleQuizzes.length} of {quizzes.length} quizzes
        </p>
        <div className="quiz-grid">
          {visibleQuizzes.map((quiz, index) => (
            <div
              key={quiz.id}
              className="quiz-tile"
              style={{
                "--course-color": quiz.courses.color,
                animationDelay: `${Math.min(index, 12) * 0.04}s`,
              }}
            >
              <div className="qt-top">
                <span className={`qt-badge ${quiz.difficulty}`}>
                  {levelLabels[quiz.difficulty]}
                </span>
                <span className="qt-time">⏱ {quiz.minutes} min</span>
              </div>

              <span className="qt-course">
                {quiz.courses.icon} {quiz.courses.title}
              </span>
              <h2>{quiz.title}</h2>
              <p>{quiz.description}</p>
              <span className="qt-covers">
                Covers lessons {quiz.lesson_from} to {quiz.lesson_to}
              </span>

              <div className="qt-stats">
                <div>
                  <span>Questions</span>
                  <strong>{quiz.questionCount}</strong>
                </div>
                <div>
                  <span>Best score</span>
                  <strong>New</strong>
                </div>
              </div>

              {quiz.questionCount > 0 ? (
                <Link to={`/quizzes/${quiz.id}`} className="btn btn-primary qt-button">
                  Start quiz
                </Link>
              ) : (
                <button className="btn qt-button qt-soon" disabled>
                  Coming soon
                </button>
              )}
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Available quizzes</h1>
        <p>Search, filter and start a quiz to test what you have learned.</p>
      </div>

      <div className="quiz-toolbar">
        <div className="qt-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search quizzes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="all">All topics</option>
          {courses.map((course) => (
            <option key={course.id} value={String(course.id)}>
              {course.title}
            </option>
          ))}
        </select>

        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="all">All difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="default">Course order</option>
          <option value="easiest">Easiest first</option>
          <option value="hardest">Hardest first</option>
          <option value="title">A to Z</option>
        </select>
      </div>

      {content}
    </div>
  );
}

export default Quizzes;