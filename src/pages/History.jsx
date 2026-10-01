import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/PageHeader";
import CountUp from "../components/CountUp";
import {
  ListIcon,
  BarChartIcon,
  TrophyIcon,
  CheckIcon,
  HistoryIcon,
  ArrowRightIcon,
} from "../components/Icons";
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

  const summary = [
    { icon: ListIcon, color: "#4f46e5", value: totalAttempts, label: "Total attempts" },
    { icon: BarChartIcon, color: "#6d28d9", value: average, suffix: "%", label: "Average score" },
    { icon: TrophyIcon, color: "#7c3aed", value: best, suffix: "%", label: "Best score" },
    { icon: CheckIcon, color: "#9333ea", value: passedQuizzes, label: "Quizzes passed" },
  ];

  let content;

  if (loading) {
    content = <div className="page-message">Loading your history...</div>;
  } else if (error) {
    content = <div className="page-message error">{error}</div>;
  } else {
    content = (
      <>
        <div className="history-summary">
          {summary.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="summary-card"
                style={{ "--accent": card.color, "--i": index }}
              >
                <span className="summary-icon">
                  <Icon />
                </span>
                <div>
                  <strong>
                    <CountUp end={card.value} />
                    {card.suffix}
                  </strong>
                  <span>{card.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {totalAttempts === 0 ? (
          <div className="history-empty">
            <span className="history-empty-icon">
              <HistoryIcon size={30} />
            </span>
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

              <span className="history-count">
                Showing {visibleAttempts.length} of {totalAttempts} attempts
              </span>
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
                  {visibleAttempts.map((item, index) => (
                    <tr
                      key={item.id}
                      style={{
                        "--course-color": item.quizzes.courses.color,
                        "--i": Math.min(index, 15),
                      }}
                    >
                      <td className="h-date">{formatDate(item.taken_at)}</td>
                      <td>
                        <div className="h-quiz-cell">
                          <span className="h-mark">
                            {item.quizzes.courses.title.charAt(0)}
                          </span>
                          <div>
                            <strong className="h-quiz">{item.quizzes.title}</strong>
                            <span className="h-course">{item.quizzes.courses.title}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`h-level ${item.quizzes.difficulty}`}>
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
                          Retake <ArrowRightIcon size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div>
      <PageHeader
        icon={HistoryIcon}
        theme="teal"
        title="Quiz history"
        subtitle="Every quiz you have taken, so you can see how far you have come."
      >
        {!loading && !error && totalAttempts > 0 && (
          <>
            <div className="ph-stat">
              <strong><CountUp end={totalAttempts} /></strong>
              <span>Attempts</span>
            </div>
            <div className="ph-stat">
              <strong>
                <CountUp end={best} />%
              </strong>
              <span>Best</span>
            </div>
          </>
        )}
      </PageHeader>

      {content}
    </div>
  );
}

export default History;