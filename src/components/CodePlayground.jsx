import { useEffect, useState } from "react";
import "./CodePlayground.css";

const SANDBOX = "allow-scripts allow-popups";

const workerSource = `
  function format(value) {
    if (typeof value === "string") return value;
    if (value === undefined) return "undefined";
    if (typeof value === "function") return value.toString();
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return String(value);
    }
  }

  const realSetTimeout = self.setTimeout.bind(self);
  const realClearTimeout = self.clearTimeout.bind(self);
  const realSetInterval = self.setInterval.bind(self);
  const realClearInterval = self.clearInterval.bind(self);
  const pending = new Set();
  let finished = false;

  function report(error) {
    const text = error && error.name ? error.name + ": " + error.message : String(error);
    self.postMessage({ type: "log-error", text: text });
  }

  function checkDone() {
    realSetTimeout(function () {
      if (pending.size === 0 && !finished) {
        finished = true;
        self.postMessage({ type: "done" });
      }
    }, 0);
  }

  self.setTimeout = function (callback, delay, ...args) {
    const id = realSetTimeout(function () {
      pending.delete(id);
      try {
        callback(...args);
      } catch (error) {
        report(error);
      }
      checkDone();
    }, delay);
    pending.add(id);
    return id;
  };

  self.clearTimeout = function (id) {
    realClearTimeout(id);
    pending.delete(id);
    checkDone();
  };

  self.setInterval = function (callback, delay, ...args) {
    const id = realSetInterval(function () {
      try {
        callback(...args);
      } catch (error) {
        report(error);
      }
    }, delay);
    pending.add(id);
    return id;
  };

  self.clearInterval = function (id) {
    realClearInterval(id);
    pending.delete(id);
    checkDone();
  };

  if (self.fetch) {
    const realFetch = self.fetch.bind(self);
    self.fetch = function (...args) {
      const request = {};
      pending.add(request);
      return realFetch(...args).finally(function () {
        pending.delete(request);
        checkDone();
      });
    };
  }

  self.onunhandledrejection = function (event) {
    report(event.reason);
    checkDone();
  };

  self.onmessage = function (event) {
    const send = function (...args) {
      self.postMessage({ type: "log", text: args.map(format).join(" ") });
    };

    console.log = send;
    console.info = send;
    console.warn = send;
    console.error = send;

    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

    let run;
    try {
      run = new AsyncFunction(event.data);
    } catch (error) {
      self.postMessage({ type: "error", text: error.name + ": " + error.message });
      return;
    }

    run().then(checkDone, function (error) {
      report(error);
      checkDone();
    });
  };
`;

function CodePlayground({ initialCode, mode = "javascript" }) {
  const isHtml = mode === "html";
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState([]);
  const [preview, setPreview] = useState(isHtml ? initialCode : "");
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;

    function handleEscape(event) {
      if (event.key === "Escape") setExpanded(false);
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [expanded]);

  function runJavaScript() {
    setRunning(true);
    setOutput([]);

    const blob = new Blob([workerSource], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const lines = [];
    let ended = false;
    let idleTimer;

    function finish() {
      if (ended) return;
      ended = true;
      clearTimeout(idleTimer);
      clearTimeout(hardTimer);
      worker.terminate();
      URL.revokeObjectURL(url);
      if (lines.length === 0) {
        lines.push({
          type: "info",
          text: "Your code ran, but nothing was printed. Use console.log() to show output.",
        });
      }
      setOutput([...lines]);
      setRunning(false);
    }

    function stopWith(message) {
      lines.push({ type: "error", text: message });
      finish();
    }

    function resetIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        stopWith(
          "Your code went 5 seconds without finishing and was stopped. Check for an infinite loop, or a timer that never stops."
        );
      }, 5000);
    }

    const hardTimer = setTimeout(() => {
      stopWith("Your code ran for more than 15 seconds and was stopped.");
    }, 15000);

    resetIdle();

    worker.onmessage = (event) => {
      const message = event.data;

      if (message.type === "log" || message.type === "log-error") {
        lines.push({ type: message.type === "log" ? "log" : "error", text: message.text });
        setOutput([...lines]);
        resetIdle();
        return;
      }

      if (message.type === "error") {
        lines.push({ type: "error", text: message.text });
      }

      finish();
    };

    worker.postMessage(code);
  }

  function runCode() {
    if (isHtml) {
      setPreview(code);
    } else {
      runJavaScript();
    }
  }

  function resetCode() {
    setCode(initialCode);
    setOutput([]);
    setPreview(isHtml ? initialCode : "");
  }

  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runCode();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.slice(0, start) + "  " + code.slice(end);
      setCode(newCode);

      requestAnimationFrame(() => {
        textarea.selectionStart = start + 2;
        textarea.selectionEnd = start + 2;
      });
    }
  }

  return (
    <div className={`playground ${expanded ? "expanded" : ""}`}>
      <div className="playground-header">
        <div className="code-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="playground-title">
          {isHtml ? "HTML and CSS Playground" : "Code Playground"}
        </span>
        <div className="playground-actions">
          <button className="pg-btn pg-reset" onClick={resetCode}>
            Reset
          </button>
          <button className="pg-btn pg-reset" onClick={() => setExpanded(!expanded)}>
            {expanded ? "✕ Close" : "⛶ Expand"}
          </button>
          <button className="pg-btn pg-run" onClick={runCode} disabled={running}>
            {running ? "Running..." : "▶ Run"}
          </button>
        </div>
      </div>

      <div className="playground-body">
        <textarea
          className="playground-editor"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          rows={Math.max(code.split("\n").length + 1, 10)}
        />

        {isHtml ? (
          <div className="playground-preview">
            <div className="output-label">Preview</div>
            <iframe
              className="preview-frame"
              title="Code preview"
              srcDoc={preview}
              sandbox={SANDBOX}
            ></iframe>
            <p className="output-hint preview-hint">
              Edit the code, then click Run or press Ctrl and Enter to update the preview.
            </p>
          </div>
        ) : (
          <div className="playground-output">
            <div className="output-label">Output</div>
            {output.length === 0 ? (
              <p className="output-hint">
                Click Run, or press Ctrl and Enter, to see the result here.
              </p>
            ) : (
              output.map((line, index) => (
                <pre key={index} className={`output-line ${line.type}`}>
                  {line.text}
                </pre>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CodePlayground;