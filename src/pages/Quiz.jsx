import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { supabase } from "../lib/supabase";
import "./Quiz.css";

const levels = [
  {
    id: "easy",
    label: "Easy",
    icon: "🟢",
    text: "Definitions and basic facts. A great place to start.",
  },
  {
    id: "medium",
    label: "Medium",
    icon: "🟡",
    text: "Read short pieces of code and predict the result.",
  },
  {
    id: "hard",
    label: "Hard",
    icon: "🔴",
    text: "Tricky details and common mistakes. Prove your mastery.",
  },
];

const letters = ["A", "B", "C", "D"];

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Quiz() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [stage, setStage] = useState("choose");
  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourse() {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, icon, color")
        .eq("id", courseId)
        .single();

      if (error) setError("Sorry, this course could not be found.");
      else setCourse(data);
    }

    loadCourse();
  }, [courseId]);

  async function startQuiz(level) {
    setError("");

    const { data, error } = await supabase
      .from("questions")
      .select("id, question, options")
      .eq("course_id", courseId)
      .eq("difficulty", level);

    if (error || data.length === 0) {
      setError("No questions are available for this level yet.");
      return;
    }

    setDifficulty(level);
    setQuestions(shuffle(data));
    setCurrent(0);
    setSelected(null);
    setResult(null);
    setScore(0);
    setAnswers([]);
    setStage("question");
  }

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
        question: question.question,
        options: question.options,
        chosen: index,
        answer: outcome.answer,
        isCorrect: outcome.is_correct,
        feedback: outcome.feedback,
      },
    ]);
  }

  function nextQuestion() {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
      setResult(null);
    } else {
      setStage("finished");
    }
  }

  if (!course) {
    return error ? (
      <div className="page-message error">{error}</div>
    ) : (
      <div className="page-message">Loading quiz...</div>
    );
  }

  const question = questions[current];
  const answeredCount = current + (result ? 1 : 0);
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="quiz-page" style={{ "--course-color": course.color }}>
      <Link to={`/courses/${courseId}`} className="back-link">
        ← Back to course
      </Link>

      {stage === "choose" && (
        <div className="quiz-intro">
          <div className="quiz-icon">{course.icon}</div>
          <h1>{course.title} Quiz</h1>
          <p>
            Choose your difficulty. Each quiz has 10 questions, and you will get
            instant feedback after every answer.
          </p>

          {error && <div className="quiz-error">{error}</div>}

          <div className="level-grid">
            {levels.map((level) => (
              <button
                key={level.id}
                className={`level-card level-${level.id}`}
                onClick={() => startQuiz(level.id)}
              >
                <span className="level-icon">{level.icon}</span>
                <strong>{level.label}</strong>
                <span>{level.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === "question" && question && (
        <div className="quiz-card">
          <div className="quiz-top">
            <span className={`level-badge level-${difficulty}`}>{difficulty}</span>
            <span className="quiz-count">
              Question {current + 1} of {questions.length}
            </span>
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
                <strong>{result.is_correct ? "Correct! 🎉" : "Not quite."}</strong>
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
        <div className="quiz-card quiz-finished">
          <div className="finished-emoji">🏁</div>
          <h2>Quiz complete!</h2>
          <p className="finished-score">
            {score} / {questions.length}
          </p>
          <p>
            You scored {Math.round((score / questions.length) * 100)}% on{" "}
            {difficulty}.
          </p>
          <div className="finished-actions">
            <button className="btn btn-primary" onClick={() => setStage("choose")}>
              Try another level
            </button>
            <Link to={`/courses/${courseId}`} className="btn btn-outline">
              Back to course
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;