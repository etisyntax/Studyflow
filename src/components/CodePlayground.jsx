import { useEffect, useState } from "react";
import { PlayIcon, ExpandIcon, ResetIcon, XIcon } from "./Icons";
import "./CodePlayground.css";

const SANDBOX = "allow-scripts allow-popups";

function buildReactPage(code) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>body { font-family: Arial, sans-serif; margin: 0; padding: 16px; }</style>
    <script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.development.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.development.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.onerror = function (message) {
        var box = document.getElementById("root");
        var text = String(message).replace(/</g, "&lt;");
        box.innerHTML = '<pre style="color:#b91c1c;background:#fef2f2;padding:12px;border-radius:8px;white-space:pre-wrap;">' + text + '</pre>';
      };
    </script>
    <script type="text/babel" data-presets="react">
      const { useState, useEffect } = React;
      ${code}
      ReactDOM.createRoot(document.getElementById("root")).render(<App />);
    </script>
  </body>
</html>`;
}

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
    const code = event.data.code;
    const mode = event.data.mode;

    const send = function (...args) {
      self.postMessage({ type: "log", text: args.map(format).join(" ") });
    };

    console.log = send;
    console.info = send;
    console.warn = send;
    console.error = send;

    let source = code;

    if (mode === "typescript") {
      try {
        if (!self.Babel) {
          self.postMessage({ type: "status", text: "Loading the TypeScript compiler..." });
          importScripts("https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js");
        }
        source = self.Babel.transform(code, {
          filename: "lesson.ts",
          presets: [["typescript", { allExtensions: true }]],
          parserOpts: { allowAwaitOutsideFunction: true },
        }).code;
      } catch (error) {
        const text = error.name === "NetworkError"
          ? "Could not load the TypeScript compiler. Please check your internet connection."
          : error.name + ": " + error.message;
        self.postMessage({ type: "error", text: text });
        return;
      }
    }

    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

    let run;
    try {
      run = new AsyncFunction(source);
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
  const isReact = mode === "react";
  const isPreview = mode === "html" || isReact;

  function toPreview(source) {
    return isReact ? buildReactPage(source) : source;
  }

  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState([]);
  const [preview, setPreview] = useState(isPreview ? toPreview(initialCode) : "");
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

  function runScript() {
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
      const printed = lines.some((line) => line.type !== "info");
      if (!printed) {
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

    function resetIdle(ms = 5000) {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        stopWith(
          "Your code went too long without finishing and was stopped. Check for an infinite loop, or a timer that never stops."
        );
      }, ms);
    }

    const hardTimer = setTimeout(() => {
      stopWith("Your code ran for more than 30 seconds and was stopped.");
    }, 30000);

    resetIdle();

    worker.onmessage = (event) => {
      const message = event.data;

      if (message.type === "status") {
        lines.push({ type: "info", text: message.text });
        setOutput([...lines]);
        resetIdle(25000);
        return;
      }

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

    worker.postMessage({ code, mode });
  }

  function runCode() {
    if (isPreview) {
      setPreview(toPreview(code));
    } else {
      runScript();
    }
  }

  function resetCode() {
    setCode(initialCode);
    setOutput([]);
    setPreview(isPreview ? toPreview(initialCode) : "");
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

  let title = "Code Playground";
  if (mode === "html") title = "HTML and CSS Playground";
  if (mode === "typescript") title = "TypeScript Playground";
  if (isReact) title = "React Playground";

  return (
    <div className={`playground ${expanded ? "expanded" : ""}`}>
      <div className="playground-header">
        <div className="code-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="playground-title">{title}</span>
        <div className="playground-actions">
          <button className="pg-btn pg-reset" onClick={resetCode} title="Undo your changes">
            <ResetIcon size={15} /> Reset
          </button>
          <button
            className="pg-btn pg-reset"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Close full screen (Esc)" : "Open full screen"}
          >
            {expanded ? <XIcon size={15} /> : <ExpandIcon size={15} />}
            {expanded ? "Close" : "Expand"}
          </button>
          <button
            className="pg-btn pg-run"
            onClick={runCode}
            disabled={running}
            title="Run your code (Ctrl and Enter)"
          >
            {!running && <PlayIcon size={14} />}
            {running ? "Running..." : "Run"}
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
          aria-label="Code editor"
          rows={Math.max(code.split("\n").length + 1, 10)}
        />

        {isPreview ? (
          <div className="playground-preview">
            <div className="output-label">Preview</div>
            <iframe
              className="preview-frame"
              title="Code preview"
              srcDoc={preview}
              sandbox={SANDBOX}
            ></iframe>
            <p className="output-hint preview-hint">
              {isReact
                ? "Edit your App component, then click Run or press Ctrl and Enter to update the preview."
                : "Edit the code, then click Run or press Ctrl and Enter to update the preview."}
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