"use client";

import { useState } from "react";
import Image from "next/image";

const initialChatHistory = [
  {
    sender: "Sora",
    text: "Hello! I'm here to listen. How are you feeling today?",
  },
];

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [moods, setMoods] = useState([]);
  const [points, setPoints] = useState(0);
  const [messageBox, setMessageBox] = useState({ show: false, text: "" });
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState(initialChatHistory);
  const [isLoading, setIsLoading] = useState(false);

  // Mood logging handler
  const logMood = (mood) => {
    setMoods((prev) => [mood, ...prev.slice(0, 9)]);
    setMessageBox({ show: true, text: `Mood logged: ${mood}` });
    setTimeout(() => setMessageBox({ show: false, text: "" }), 2000);
  };

  // Self-care activity handler
  const completeActivity = (activity, pts) => {
    setPoints((prev) => prev + pts);
    setMessageBox({ show: true, text: `Completed: ${activity} (+${pts} pts)` });
    setTimeout(() => setMessageBox({ show: false, text: "" }), 2000);
  };

  // Chat send handler
  const handleSend = async () => {
    if (chatInput.trim() === "" || isLoading) return;

    setIsLoading(true);
    const userMessage = { sender: "You", text: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    try {
      // Include the current user message and ensure the first history item is a user
      // message (Gemini requires the first content to be from the user). Also use
      // the 'assistant' role for replies rather than 'model'.
      const ordered = [userMessage, ...chatMessages];
      const historyToSend = ordered.map((msg) => ({
        role: msg.sender === "You" ? "user" : "assistant",
        parts: [{ text: msg.text }],
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage.text,
          history: historyToSend,
        }),
      });

      if (!response.ok) {
        // Try to parse a helpful error message from the server
        let serverText = "";
        try {
          const errBody = await response.json();
          serverText = errBody?.error || JSON.stringify(errBody);
        } catch (e) {
          serverText = await response
            .text()
            .catch(() => "Unknown server error");
        }
        console.error("API error", response.status, serverText);
        // Surface the server error to the user but don't throw to avoid an uncaught
        // exception inside the client rendering pipeline.
        setMessageBox({
          show: true,
          text: `Sora error: ${serverText || response.statusText}`,
        });
        setConnectionStatus("Disconnected");
        return;
      }

      const data = await response.json();
      const soraMessage = { sender: "Sora", text: data.text };
      setChatMessages((prev) => [...prev, soraMessage]);
      setConnectionStatus("Connected");
    } catch (error) {
      console.error("Frontend error:", error);
      setMessageBox({
        show: true,
        text: "Sorry, I'm having trouble connecting to Sora.",
      });
      setConnectionStatus("Disconnected");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue-100 min-h-screen flex flex-col p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1">
          <h1 className="text-2xl font-bold text-blue-800">Pawse</h1>
          <div>
            <Image src="/paws.png" alt="" width={33} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {["Happy", "Calm", "Sad", "Anxious"].map((mood) => (
            <button
              key={mood}
              className={`text-2xl rounded-full transition-colors duration-150 cursor-pointer ${
                moods[0] === mood
                  ? "bg-blue-800 text-white"
                  : "bg-transparent hover:bg-blue-200"
              } p-1`}
              onClick={() => logMood(mood)}
              aria-label={mood}
            >
              {mood === "Happy" && "😊"}
              {mood === "Calm" && "😌"}
              {mood === "Sad" && "😢"}
              {mood === "Anxious" && "😟"}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row gap-4">
        {/* Left Panel: Chat */}
        <div className="relative flex-1 flex flex-col bg-white rounded-lg shadow-md">
          {/* AI Pet Companion */}
          <div className="flex items-center mb-4">
            <Image
              src="/cat.svg"
              alt="Sora the AI Pet"
              width={48}
              height={48}
              className="rounded-full mr-4"
            />
            <div className="">
              <p className="font-semibold text-blue-700">Sora</p>
              <p className="text-sm text-gray-500">Your wellness companion</p>
            </div>
          </div>
          <div
            className="flex-1 p-4 overflow-y-auto hide-scrollbar"
            style={{ maxHeight: "73vh" }}
          >
            {/* Chat messages */}
            <div>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 flex ${
                    msg.sender === "You" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      msg.sender === "You"
                        ? "bg-blue-200 text-right"
                        : "bg-gray-100"
                    }`}
                  >
                    <span className="block text-xs font-semibold text-blue-800">
                      {msg.sender}
                    </span>
                    <span>{msg.text}</span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start">
                  <Image
                    src="/cat.svg"
                    alt="Sora"
                    width={32}
                    height={32}
                    className="rounded-full mr-2"
                  />
                  <div className=" rounded-lg p-3 max-w-[80%] animate-pulse text-blue-700">
                    <span>Sora is typing...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-1">
              <input
                type="text"
                className="flex-1 border rounded-full p-2 "
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />
              <button
                className="bg-blue-800 text-white p-4 rounded-full hover:bg-blue-600 cursor-pointer"
                onClick={handleSend}
                disabled={isLoading}
              >
                <Image src="/send.svg" alt="" width={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Self-Care & Mood Log */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          {/* Self-Care Activities */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Daily Self-Care Activities
            </h2>
            <div className="space-y-2">
              <button
                className="w-full text-left bg-green-100 p-2 rounded-lg hover:bg-green-200 cursor-pointer"
                onClick={() => completeActivity("Take 3 deep breaths", 10)}
              >
                Take 3 deep breaths
              </button>
              <button
                className="w-full text-left bg-orange-100 p-2 rounded-lg hover:bg-orange-200 cursor-pointer"
                onClick={() =>
                  completeActivity(
                    "Write down three things you're grateful for",
                    20
                  )
                }
              >
                Write down three things you&apos;re grateful for
              </button>
              <button
                className="w-full text-left bg-purple-100 p-2 rounded-lg hover:bg-purple-200 cursor-pointer"
                onClick={() =>
                  completeActivity("Listen to a song that makes you happy", 15)
                }
              >
                Listen to a song that makes you happy
              </button>
              <button
                className="w-full text-left bg-pink-100 p-2 rounded-lg hover:bg-pink-200 cursor-pointer"
                onClick={() =>
                  completeActivity("Drink a glass of water and stretch", 10)
                }
              >
                Drink a glass of water and stretch
              </button>
              <button
                className="w-full text-left bg-indigo-100 p-2 rounded-lg hover:bg-indigo-200 cursor-pointer"
                onClick={() =>
                  completeActivity("Draw or doodle for five minutes", 25)
                }
              >
                Draw or doodle for five minutes
              </button>
            </div>
            <div className="flex justify-between items-center">

            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Points: <span className="font-bold">{points}</span>
              </p>
            </div>
            <div className="mt-4" onClick={() => {setPoints(0)}}>
                <Image src="/reset.svg" alt="" width={22}/>
            </div>
            </div>
          </div>

          {/* Mood Log */}
          <div className="bg-white rounded-lg shadow-md p-4 flex-1">
            <div className="flex justify-between items-center">

            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Recent Moods
            </h2>
            <div className="mb-2" onClick={() => {setMoods([])}}>
                <Image src="/reset.svg" alt="" width={22}/>
            </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 font-semibold list-disc px-4">
              {moods.length === 0 && <li>No moods logged yet.</li>}
              {moods.map((mood, idx) => (
                <li key={idx}>{mood}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Custom Message Box */}
      {messageBox.show && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg">
          <p>{messageBox.text}</p>
        </div>
      )}
    </div>
  );
}
