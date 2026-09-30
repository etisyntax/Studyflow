import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { supabase } from "../lib/supabase";
import {
  CheckIcon,
  XIcon,
  TrophyIcon,
  ArrowRightIcon,
  RefreshIcon,
  BookOpenIcon,
} from "../components/Icons";
import "./Quiz.css";

const letters = ["A", "B", "C", "D"];
const RING = 327;

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getMessage(percent) {
  if (percent >= 90) return "Outstanding! You have mastered this topic.";
  if (percent >= 70) return "Great work! You clearly understand this topic.";
  if (percent >= 50) return "Good effort. A little more practice will make it stick.";
  return "Keep going. Review the lessons, then try again.";
}

function Quiz() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [nextQuiz, setNextQuiz] = useState(null);
  const [previousBest, setPreviousBest] = useState(null);
  const [stage, setStage] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select(
          "id, course_id, position, title, difficulty, minutes, lesson_from, lesson_to, courses(id, title, icon, color)"
        )
        .eq("id", quizId)
        .single();

      if (quizError) {
        setError("Sorry, this quiz could not be found.");
        return;
      }

      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("id, question, options")
        .eq("quiz_id", quizId);

      if (questionError || questionData.length === 0) {
        setError("This quiz has no questions yet. Please check back soon.");
        return;
      }

      const { data: nextData } = await supabase
        .from("quizzes")
        .select("id, title, difficulty")
        .eq("course_id", quizData.course_id)
        .eq("position", quizData.position + 1)
        .maybeSingle();

      const { data: pastResults } = await supabase
        .from("quiz_results")
        .select("score, total")
        .eq("quiz_id", quizId);

      const best =
        pastResults && pastResults.length > 0
          ? Math.max(...pastResults.map((item) => Math.round((item.score / item.total) * 100)))
          : null;

      setQuiz(quizData);
      setNextQuiz(nextData);
      setPreviousBest(best);
      setQuestions(shuffle(questionData));
      setStage("question");
    }

    loadQuiz();
  }, [quizId]);

  async function chooseAnswer(index) {
    if (selected !== null || checking) return;

    setSelected(index);
    setChecking(true);
    setError("");

    const question = questions[current];

    const { data, error } = await supabase.rpc("check_answer", {
      target_question: question.id,
      chosen: index,
    });

    setChecking(false);

    if (error || !data || data.length === 0) {
      setSelected(null);
      setError("Could not check your answer. Please try again.");
      return;
    }

    const outcome = data[0];
    setResult(outcome);

    if (outcome.is_correct) {
      setScore((previous) => previous + 1);
    }

    setAnswers((previous) => [
      ...previous,
      {
        questionId: question.id,
        question: question.question,
        options: question.options,
        chosen: index,
        answer: outcome.answer,
        isCorrect: outcome.is_correct,
        feedback: outcome.feedback,
      },
    ]);
  }

  async function finishQuiz() {
    setStage("finished");
    setSaving(true);
    setSaveError("");

    const { data, error } = await supabase.rpc("submit_quiz", {
      target_quiz: Number(quizId),
      submitted: answers.map((item) => ({
        question_id: item.questionId,
        chosen: item.chosen,
      })),
    });

    setSaving(false);

    if (error || !data || data.length === 0) {
      setSaveError("Your score could not be saved. Please check your connection.");
      return;
    }

    setSaved({ score: data[0].final_score, total: data[0].final_total });
  }

  function nextQuestion() {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
      setResult(null);
    } else {
      finishQuiz();
    }
  }

  function restartQuiz() {
    const lastPercent = Math.round((finalScore / finalTotal) * 100);
    setPreviousBest((best) => (best === null ? lastPercent : Math.max(best, lastPercent)));
    setQuestions(shuffle(questions));
    setCurrent(0);
    setSelected(null);
    setResult(null);
    setScore(0);
    setAnswers([]);
    setError("");
    setSaved(null);
    setSaveError("");
    setShowReview(false);
    setStage("question");
  }

  if (!quiz) {
    return (
      <div className="quiz-page">
        <Link to="/quizzes" className="back-link">
          ← All quizzes
        </Link>
        {error ? (
          <div className="page-message error">{error}</div>
        ) : (
          <div className="page-message">Loading quiz...</div>
        )}
      </div>
    );
  }

  const question = questions[current];
  const answeredCount = current + (result ? 1 : 0);
  const progress = (answeredCount / questions.length) * 100;

  const finalScore = saved ? saved.score : score;
  const finalTotal = saved ? saved.total : questions.length;
  const percent = Math.round((finalScore / finalTotal) * 100);
  const isNewBest = previousBest !== null && percent > previousBest;
  const passed = percent >= 70;

  return (
    <div className="quiz-page" style={{ "--course-color": quiz.courses.color }}>
      <Link to="/quizzes" className="back-link">
        ← All quizzes
      </Link>

      <div className="quiz-header">
        <div className="quiz-header-icon">{quiz.courses.icon}</div>
        <div>
          <span className={`level-badge level-${quiz.difficulty}`}>{quiz.difficulty}</span>
          <h1>{quiz.title}</h1>
          <p className="quiz-subtitle">
            {quiz.courses.title} · {questions.length} questions · {quiz.minutes} min
          </p>
        </div>
      </div>

      {stage === "question" && question && (
        <div className="quiz-card">
          <div className="quiz-top">
            <span className="quiz-count">
              Question {current + 1} of {questions.length}
            </span>
            <span className="quiz-count">Score: {score}</span>
          </div>

          <div className="quiz-progress">
            <div style={{ width: `${progress}%` }}></div>
          </div>

          <div key={current} className="question-body">
            <h2 className="quiz-question">{question.question}</h2>

            <div className="options">
              {question.options.map((option, index) => {
                let state = "";

                if (result) {
                  if (index === result.answer) state = "correct";
                  else if (index === selected) state = "wrong";
                  else state = "faded";
                } else if (index === selected) {
                  state = "chosen";
                }

                return (
                  <button
                    key={index}
                    className={`option ${state}`}
                    onClick={() => chooseAnswer(index)}
                    disabled={selected !== null}
                  >
                    <span className="option-letter">{letters[index]}</span>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>

            {checking && <p className="checking">Checking your answer...</p>}
            {error && <div className="quiz-error">{error}</div>}

            {result && (
              <div className={`feedback ${result.is_correct ? "good" : "bad"}`}>
                <strong className="feedback-title">
                  {result.is_correct ? <CheckIcon size={18} /> : <XIcon size={18} />}
                  {result.is_correct ? "Correct" : "Not quite"}
                </strong>
                <p>{result.feedback}</p>
              </div>
            )}

            {result && (
              <button className="btn btn-primary btn-large next-btn" onClick={nextQuestion}>
                {current + 1 < questions.length ? "Next question →" : "See my results →"}
              </button>
            )}
          </div>
        </div>
      )}

      {stage === "finished" && (
        <div className="quiz-card quiz-results">
          <div className="score-ring">
            <svg viewBox="0 0 120 120">
              <circle className="ring-bg" cx="60" cy="60" r="52" />
              <circle
                className="ring-fill"
                cx="60"
                cy="60"
                r="52"
                style={{ strokeDashoffset: RING - (RING * percent) / 100 }}
              />
            </svg>
            <div className="ring-text">
              <strong>{percent}%</strong>
              <span>
                {finalScore} / {finalTotal}
              </span>
            </div>
          </div>

          {isNewBest && (
            <div className="best-badge">
              <TrophyIcon size={16} />
              New personal best
            </div>
          )}

          <h2 className="results-title">{getMessage(percent)}</h2>

          <div className="results-stats">
            <div className="stat good">
              <CheckIcon size={18} />
              <strong>{finalScore}</strong>
              <span>Correct</span>
            </div>
            <div className="stat bad">
              <XIcon size={18} />
              <strong>{finalTotal - finalScore}</strong>
              <span>Wrong</span>
            </div>
            <div className="stat">
              <TrophyIcon size={18} />
              <strong>{previousBest === null ? "First" : `${previousBest}%`}</strong>
              <span>{previousBest === null ? "Attempt" : "Previous best"}</span>
            </div>
          </div>

          <p className={`save-status ${saveError ? "error" : ""}`}>
            {saving && "Saving your score..."}
            {!saving && saved && (
              <>
                <CheckIcon size={16} /> Score saved to your history
              </>
            )}
            {saveError}
          </p>

          <div className={`next-step ${passed ? "passed" : ""}`}>
            {passed && nextQuiz && (
              <>
                <div>
                  <strong>Ready for the next challenge?</strong>
                  <p>
                    Up next: {nextQuiz.title} ({nextQuiz.difficulty})
                  </p>
                </div>
                <Link to={`/quizzes/${nextQuiz.id}`} className="btn btn-primary">
                  Start next quiz <ArrowRightIcon size={18} />
                </Link>
              </>
            )}

            {passed && !nextQuiz && (
              <div>
                <strong>Course complete!</strong>
                <p>You have finished the final quiz in {quiz.courses.title}.</p>
              </div>
            )}

            {!passed && (
              <>
                <div>
                  <strong>Strengthen this topic</strong>
                  <p>
                    Review lessons {quiz.lesson_from} to {quiz.lesson_to} of {quiz.courses.title},
                    then try again.
                  </p>
                </div>
                <Link to={`/courses/${quiz.courses.id}`} className="btn btn-outline">
                  <BookOpenIcon size={18} /> Review lessons
                </Link>
              </>
            )}
          </div>

          <div className="finished-actions">
            <button className="btn btn-outline" onClick={() => setShowReview(!showReview)}>
              {showReview ? "Hide answers" : "Review answers"}
            </button>
            <button className="btn btn-primary" onClick={restartQuiz}>
              <RefreshIcon size={18} /> Try again
            </button>
            <Link to="/quizzes" className="btn btn-outline">
              All quizzes
            </Link>
          </div>

          {showReview && (
            <div className="review-list">
              {answers.map((item, index) => (
                <div key={index} className={`review-item ${item.isCorrect ? "good" : "bad"}`}>
                  <div className="review-head">
                    <span className="review-icon">
                      {item.isCorrect ? <CheckIcon size={16} /> : <XIcon size={16} />}
                    </span>
                    <strong>
                      {index + 1}. {item.question}
                    </strong>
                  </div>
                  {!item.isCorrect && (
                    <p className="review-line">
                      Your answer: <code>{item.options[item.chosen]}</code>
                    </p>
                  )}
                  <p className="review-line">
                    Correct answer: <code>{item.options[item.answer]}</code>
                  </p>
                  <p className="review-explain">{item.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Quiz;