import { Link } from "react-router";
import { TargetIcon, ArrowRightIcon } from "./Icons";
import "./RevisionPlan.css";

function RevisionPlan({ items, courseId, passed }) {
  if (items.length === 0) return null;

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
      </div>

      <ol className="rv-list">
        {items.map((item, index) => (
          <li key={item.lessonId} style={{ "--i": index }}>
            <span className="rv-rank">{index + 1}</span>
            <div className="rv-info">
              <strong>
                Lesson {item.position}: {item.title}
              </strong>
              <div className="rv-bar">
                <div style={{ width: `${(item.wrong / item.total) * 100}%` }}></div>
              </div>
              <span>
                {item.wrong} of {item.total} {item.total === 1 ? "question" : "questions"} missed
              </span>
            </div>
            <Link to={`/courses/${courseId}/lessons/${item.lessonId}`} className="rv-link">
              Review <ArrowRightIcon size={14} />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default RevisionPlan;