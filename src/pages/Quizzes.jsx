import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/PageHeader";
import CountUp from "../components/CountUp";
import { CheckIcon, SearchIcon, ClockIcon } from "../components/Icons";
import "./Quizzes.css";

const levelOrder = { easy: 1, medium: 2, hard: 3 };
const levelLabels = { easy: "Easy", medium: "Medium", hard: "Hard" };

function scoreClass(score) {
  if (score >= 70) return "good";
  if (score >= 50) return "ok";
  return "low";
}

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
      const [quizRes, questionRes, resultRes] = await Promise.all([
        supabase
          .from("quizzes")
          .select(
            "id, position, title, description, difficulty, minutes, lesson_from, lesson_to, courses(id, title, color, position)"
          ),
        supabase.from("questions").select("quiz_id"),
        supabase.from("quiz_results").select("quiz_id, score, total"),
      ]);

      if (quizRes.error || questionRes.error) {
        setError("Could not load quizzes. Please try again.");
        setLoading(false);
        return;
      }

      const counts = {};
      questionRes.data.forEach((question) => {
        counts[question.quiz_id] = (counts[question.quiz_id] || 0) + 1;
      });

      const bests = {};
      (resultRes.data || []).forEach((attempt) => {
        const percent = Math.round((attempt.score / attempt.total) * 100);
        if (bests[attempt.quiz_id] === undefined || percent > bests[attempt.quiz_id]) {
          bests[attempt.quiz_id] = percent;
        }
      });

      const list = quizRes.data.map((quiz) => ({
        ...quiz,
        questionCount: counts[quiz.id] || 0,
        bestScore: bests[quiz.id] ?? null,
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

  const passedCount = quizzes.filter(
    (quiz) => quiz.bestScore !== null && quiz.bestScore >= 70
  ).length;
  const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questionCount, 0);

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
          {visibleQuizzes.map((quiz, index) => {
            const passed = quiz.bestScore !== null && quiz.bestScore >= 70;

            return (
              <div
                key={quiz.id}
                className="quiz-tile"
                style={{ "--course-color": quiz.courses.color, "--i": Math.min(index, 12) }}
              >
                <div className="qt-banner">
                  <span className="qt-banner-circle"></span>
                  <span className="qt-mark">{quiz.courses.title.charAt(0)}</span>
                  <div className="qt-tags">
                    <span className={`qt-badge ${quiz.difficulty}`}>
                      {levelLabels[quiz.difficulty]}
                    </span>
                    {passed && (
                      <span className="qt-passed">
                        <CheckIcon size={13} /> Passed
                      </span>
                    )}
                  </div>
                </div>

                <div className="qt-body">
                  <div className="qt-meta">
                    <span className="qt-course">{quiz.courses.title}</span>
                    <span className="qt-time">
                      <ClockIcon size={14} /> {quiz.minutes} min
                    </span>
                  </div>

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
                      {quiz.bestScore === null ? (
                        <strong>New</strong>
                      ) : (
                        <strong className={`qt-best ${scoreClass(quiz.bestScore)}`}>
                          {quiz.bestScore}%
                        </strong>
                      )}
                    </div>
                  </div>

                  {quiz.questionCount > 0 ? (
                    <Link to={`/quizzes/${quiz.id}`} className="qt-button">
                      {quiz.bestScore === null ? "Start quiz" : "Retake quiz"}
                    </Link>
                  ) : (
                    <button className="qt-button qt-soon" disabled>
                      Coming soon
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div>
      <PageHeader
        title="Available quizzes"
        subtitle="Search, filter and start a quiz to test what you have learned."
      >
        {!loading && !error && (
          <>
            <div className="ph-stat">
              <strong><CountUp end={quizzes.length} /></strong>
              <span>Quizzes</span>
            </div>
            <div className="ph-stat">
              <strong><CountUp end={passedCount} /></strong>
              <span>Passed</span>
            </div>
            <div className="ph-stat">
              <strong><CountUp end={totalQuestions} /></strong>
              <span>Questions</span>
            </div>
          </>
        )}
      </PageHeader>

      <div className="quiz-toolbar">
        <div className="qt-search">
          <SearchIcon size={18} />
          <input
            type="text"
            placeholder="Search quizzes"
            aria-label="Search quizzes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          aria-label="Filter by topic"
        >
          <option value="all">All topics</option>
          {courses.map((course) => (
            <option key={course.id} value={String(course.id)}>
              {course.title}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          aria-label="Filter by difficulty"
        >
          <option value="all">All difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort quizzes"
        >
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