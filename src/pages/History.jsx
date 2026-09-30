import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import { ListIcon, BarChartIcon, TrophyIcon, CheckIcon } from "../components/Icons";
import "./History.css";

const levelLabels = { easy: "Easy", medium: "Medium", hard: "Hard" };

function formatDate(value) {
  const date = new Date(value);
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day}, ${time}`;
}

function barClass(percent) {
  if (percent >= 70) return "good";
  if (percent >= 50) return "ok";
  return "low";
}

function History() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function loadHistory() {
      const { data, error } = await supabase
        .from("quiz_results")
        .select(
          "id, score, total, taken_at, quiz_id, quizzes(title, difficulty, courses(id, title, color, position))"
        )
        .order("taken_at", { ascending: false });

      if (error) {
        setError("Could not load your history. Please try again.");
      } else {
        setAttempts(
          data.map((attempt) => ({
            ...attempt,
            percent: Math.round((attempt.score / attempt.total) * 100),
          }))
        );
      }

      setLoading(false);
    }

    loadHistory();
  }, []);

  if (loading) return <div className="page-message">Loading your history...</div>;
  if (error) return <div className="page-message error">{error}</div>;

  const totalAttempts = attempts.length;
  const average =
    totalAttempts > 0
      ? Math.round(attempts.reduce((sum, item) => sum + item.percent, 0) / totalAttempts)
      : 0;
  const best = totalAttempts > 0 ? Math.max(...attempts.map((item) => item.percent)) : 0;
  const passedQuizzes = new Set(
    attempts.filter((item) => item.percent >= 70).map((item) => item.quiz_id)
  ).size;

  const courses = [];
  attempts.forEach((item) => {
    const course = item.quizzes.courses;
    if (!courses.some((existing) => existing.id === course.id)) {
      courses.push(course);
    }
  });
  courses.sort((a, b) => a.position - b.position);

  const visibleAttempts = attempts
    .filter((item) => topic === "all" || String(item.quizzes.courses.id) === topic)
    .sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.taken_at) - new Date(b.taken_at);
      if (sortBy === "highest") return b.percent - a.percent;
      if (sortBy === "lowest") return a.percent - b.percent;
      return new Date(b.taken_at) - new Date(a.taken_at);
    });

  return (
    <div>
      <div className="page-header">
        <h1>Quiz history</h1>
        <p>Every quiz you have taken, so you can see how far you have come.</p>
      </div>

      <div className="history-summary">
        <div className="summary-card">
          <span className="summary-icon">
            <ListIcon />
          </span>
          <div>
            <strong>{totalAttempts}</strong>
            <span>Total attempts</span>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon">
            <BarChartIcon />
          </span>
          <div>
            <strong>{average}%</strong>
            <span>Average score</span>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon">
            <TrophyIcon />
          </span>
          <div>
            <strong>{best}%</strong>
            <span>Best score</span>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon">
            <CheckIcon />
          </span>
          <div>
            <strong>{passedQuizzes}</strong>
            <span>Quizzes passed</span>
          </div>
        </div>
      </div>

      {totalAttempts === 0 ? (
        <div className="history-empty">
          <h2>No quizzes taken yet</h2>
          <p>Your attempts will appear here as soon as you finish your first quiz.</p>
          <Link to="/quizzes" className="btn btn-primary">
            Browse quizzes
          </Link>
        </div>
      ) : (
        <>
          <div className="history-toolbar">
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="all">All topics</option>
              {courses.map((course) => (
                <option key={course.id} value={String(course.id)}>
                  {course.title}
                </option>
              ))}
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest score</option>
              <option value="lowest">Lowest score</option>
            </select>
          </div>

          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Quiz</th>
                  <th>Level</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Result</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleAttempts.map((item) => (
                  <tr key={item.id} style={{ "--course-color": item.quizzes.courses.color }}>
                    <td className="h-date">{formatDate(item.taken_at)}</td>
                    <td>
                      <strong className="h-quiz">{item.quizzes.title}</strong>
                      <span className="h-course">{item.quizzes.courses.title}</span>
                    </td>
                    <td>
                      <span className={`qt-badge ${item.quizzes.difficulty}`}>
                        {levelLabels[item.quizzes.difficulty]}
                      </span>
                    </td>
                    <td className="h-score">
                      {item.score} / {item.total}
                    </td>
                    <td>
                      <div className="h-percent">
                        <div className="h-bar">
                          <div
                            className={`h-fill ${barClass(item.percent)}`}
                            style={{ width: `${item.percent}%` }}
                          ></div>
                        </div>
                        <span>{item.percent}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`h-result ${item.percent >= 70 ? "pass" : "fail"}`}>
                        {item.percent >= 70 ? "Passed" : "Not passed"}
                      </span>
                    </td>
                    <td>
                      <Link to={`/quizzes/${item.quiz_id}`} className="h-retake">
                        Retake
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default History;