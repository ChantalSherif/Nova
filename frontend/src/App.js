import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId] = useState(() => Date.now().toString());
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);
  const typingAbort = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startChat = () => {
    const trimmedName = username.trim();
    if (trimmedName) {
      setUsername(trimmedName);
      setIsUsernameSet(true);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") {
      startChat();
    }
  };

  // Send message, telling backend pause = false (resume talking)
  const sendMessage = async () => {
    if (!isUsernameSet || !input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    typingAbort.current = false; // reset abort flag

    try {
      const res = await axios.post("http://localhost:5000/chat", {
        message: input,
        userId,
        username,
        pause: false,  // resume talking
      });

      if (!res.data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Oops, Nova is quiet right now. Try again?" },
        ]);
        setLoading(false);
        return;
      }

      const novaReply = res.data.reply;
      let displayedText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      for (let i = 0; i < novaReply.length; i++) {
        if (typingAbort.current) break; // stop typing immediately if aborted
        await new Promise((resolve) => setTimeout(resolve, 30));
        displayedText += novaReply[i];
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: displayedText };
          return updated;
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setLoading(false);
    }
  };

  // Stop typing mid-sentence + send stopSignal = true for rude reply
  const stopTyping = async () => {
    if (loading) {
      typingAbort.current = true; // abort typing animation immediately
      setLoading(false); // enable input immediately

      try {
        const res = await axios.post("http://localhost:5000/chat", {
          message: "",
          userId,
          username,
          stopSignal: true, // signal rude reply
        });

        if (res.data.reply) {
          setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
        }
      } catch (e) {
        console.error("Failed to send stopSignal:", e);
      }
    }
  };

  return (
    <div className="nova-container">
      {!isUsernameSet ? (
        <div className="username-setup">
          <h2>What's your name, darling? 💬</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleNameKeyDown}
            autoFocus
          />
          <button onClick={startChat} disabled={username.trim() === ""}>
            Start Chatting
          </button>
        </div>
      ) : (
        <>
          <h1>Nova 💫</h1>
          <div className="chat-box">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role === "assistant" ? "nova" : "user"}`}>
                {m.content}
              </div>
            ))}

            {loading && (
              <div className="typing-indicator">
                Nova is thinking
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

            <div ref={chatEndRef}></div>
          </div>

          <div className="input-box">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
              autoFocus
            />
            <button onClick={sendMessage} disabled={loading}>
              Send
            </button>
            <button onClick={stopTyping} disabled={!loading} style={{ marginLeft: 8 }}>
              Shut up Nova!
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
