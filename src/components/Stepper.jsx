import { useEffect, useRef, useState } from "react";
import "./Stepper.css";

const START_DELAY = 400;
const STEP_DELAY = 1000;
const HOLD_DELAY = 4000;

function Stepper({ steps }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer;

    if (reduced) {
      timer = setTimeout(() => setActive(steps.length), 0);
      return () => clearTimeout(timer);
    }

    let count = 0;

    function next() {
      count += 1;

      if (count <= steps.length) {
        setActive(count);
        timer = setTimeout(next, count === steps.length ? HOLD_DELAY : STEP_DELAY);
      } else {
        count = 0;
        setActive(0);
        timer = setTimeout(next, START_DELAY + 400);
      }
    }

    timer = setTimeout(next, START_DELAY);

    return () => {
      clearTimeout(timer);
      setActive(0);
    };
  }, [visible, steps.length]);

  return (
    <div ref={ref} className="stepper">
      {steps.map((step, index) => (
        <div key={step.title} className={`stp ${index < active ? "active" : ""}`}>
          <span className="stp-number">{index + 1}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </div>
      ))}
    </div>
  );
}

export default Stepper;