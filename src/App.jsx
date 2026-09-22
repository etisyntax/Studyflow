import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

function App() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  async function loadMessages() {
    const { data, error } = await supabase
      .from("hello")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) setError(error.message);
    else setMessages(data);
  }

  async function addMessage() {
    const { error } = await supabase
      .from("hello")
      .insert({ text: "Hello from StudyFlow" });

    if (error) setError(error.message);
    else loadMessages();
  }

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>StudyFlow connection test</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <button onClick={addMessage}>Add test message</button>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;