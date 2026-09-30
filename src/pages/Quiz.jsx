import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { supabase } from "../lib/supabase";
import "./Quiz.css";

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
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [stage, setStage] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuiz() {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("id, title, difficulty, minutes, courses(title, icon, color)")
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

      setQuiz(quizData);
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

  function restartQuiz() {
    setQuestions(shuffle(questions));
    setCurrent(0);
    setSelected(null);
    setResult(null);
    setScore(0);
    setAnswers([]);
    setError("");
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
          <p>You scored {Math.round((score / questions.length) * 100)}%.</p>
          <div className="finished-actions">
            <button className="btn btn-primary" onClick={restartQuiz}>
              Try again
            </button>
            <Link to="/quizzes" className="btn btn-outline">
              All quizzes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;