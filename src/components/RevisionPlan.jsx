import { Link } from "react-router";
import { TargetIcon, ArrowRightIcon, CheckIcon } from "./Icons";
import "./RevisionPlan.css";

function RevisionPlan({ items, courseId, quizId, passed, reviewed = [], onReview }) {
  if (items.length === 0) return null;

  const reviewedCount = items.filter((item) => reviewed.includes(item.lessonId)).length;

  return (
    <div className="revision">
      <div className="rv-head">
        <span className="rv-icon">
          <TargetIcon size={22} />
        </span>
        <div>
          <strong>{passed ? "Polish these lessons" : "Your revision plan"}</strong>
          <p>
            {passed
              ? "You passed, but you missed a few questions from these lessons."
              : "Based on the questions you missed, start with these lessons, weakest first."}
          </p>
        </div>
        {reviewedCount > 0 && (
          <span className="rv-count">
            {reviewedCount} of {items.length} reviewed
          </span>
        )}
      </div>

      <ol className="rv-list">
        {items.map((item, index) => {
          const isReviewed = reviewed.includes(item.lessonId);

          return (
            <li
              key={item.lessonId}
              className={isReviewed ? "reviewed" : ""}
              style={{ "--i": index }}
            >
              <span className="rv-rank">
                {isReviewed ? <CheckIcon size={16} /> : index + 1}
              </span>
              <div className="rv-info">
                <strong>
                  Lesson {item.position}: {item.title}
                </strong>
                <div className="rv-bar">
                  <div style={{ width: `${(item.wrong / item.total) * 100}%` }}></div>
                </div>
                <span>
                  {item.wrong} of {item.total} {item.total === 1 ? "question" : "questions"} missed
                  {isReviewed && " · Reviewed"}
                </span>
              </div>
              <Link
                to={`/courses/${courseId}/lessons/${item.lessonId}`}
                state={{ fromQuiz: quizId }}
                onClick={() => onReview && onReview(item.lessonId)}
                className={`rv-link ${isReviewed ? "again" : ""}`}
              >
                {isReviewed ? "Review again" : "Review"} <ArrowRightIcon size={14} />
              </Link>
            </li>
          );
        })}
      </ol>

      <p className="rv-hint">
        Your plan stays here. After each lesson, use "Back to your revision plan" to return.
      </p>
    </div>
  );
}

export default RevisionPlan;