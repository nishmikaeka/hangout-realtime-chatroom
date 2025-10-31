import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Send } from "lucide-react";

const Chatroom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Guest";
  const userId = localStorage.getItem("userId");

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [roomInfo, setRoomInfo] = useState({
    name: "",
    meetingId: "",
    sessionTime: "00:00:00",
    hostId: null,
  });
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // Initialize socket
  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    // Join the room with userId
    newSocket.emit("joinRoom", roomId, userName, userId);

    // Listeners
    newSocket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on("userJoined", (msg) =>
      setMessages((prev) => [
        ...prev,
        {
          userName: "System",
          message: msg,
          isSystem: true,
          timestamp: new Date(),
        },
      ])
    );

    newSocket.on("userLeft", (msg) =>
      setMessages((prev) => [
        ...prev,
        {
          userName: "System",
          message: msg,
          isSystem: true,
          timestamp: new Date(),
        },
      ])
    );

    newSocket.on("updateParticipants", (list) => {
      console.log("📋 Participants updated:", list);
      setParticipants([...list]);
    });

    newSocket.on("roomInfo", (info) => {
      console.log("Room info received:", info);
      setRoomInfo(info);
    });

    newSocket.on("sessionTimer", (time) =>
      setRoomInfo((prev) => ({ ...prev, sessionTime: time }))
    );

    newSocket.on("sessionEnded", () => {
      alert("Session has ended!");
      navigate("/");
    });

    return () => {
      newSocket.emit("leaveRoom", roomId, userName);
      newSocket.disconnect();
    };
  }, [roomId, userName, userId, navigate]);

  const sendMessage = () => {
    if (!message.trim() || !socket) return;

    const messageData = {
      roomId,
      userName,
      message: message.trim(),
      timestamp: new Date(),
    };

    socket.emit("sendMessage", messageData);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const inviteParticipants = () => {
    navigator.clipboard.writeText(roomInfo.meetingId);
    alert("Meeting ID copied to clipboard!");
  };

  const closeSession = () => {
    if (window.confirm("Are you sure you want to close this session?")) {
      socket.emit("closeSession", roomId);
      navigate("/");
    }
  };

  const logOut = () => {
    if (socket) {
      socket.emit("leaveRoom", roomId, userName);
      // delay to ensure the server is processing the leave
      setTimeout(() => {
        socket.disconnect();
        navigate("/");
      }, 100);
    } else {
      navigate("/");
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Check if current user is the host
  const isHost = roomInfo.hostId === userId;

  console.log("Current userId:", userId);
  console.log("Is host?", isHost);
  console.log("Participants:", participants);

  return (
    <div className="flex h-screen bg-[#F1EEFB] overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 bg-white border-r m-5 ml-7 rounded-2xl border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-200">
          <img
            src="/hangout_black.png"
            alt="black-logo-text-only"
            className="h-4 w-auto"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {participants.map((p, i) => (
            <div key={i} className="flex items-center gap-3 mb-4">
              <img src="/avatar.png" alt="avatar" className="h-12" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {p.name && p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                </p>
                <p className="text-xs text-gray-500">{p.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="p-4 space-y-2 border-t border-gray-200">
          <button
            onClick={inviteParticipants}
            className="w-full bg-ghost text-white py-3 rounded-lg text-sm font-medium hover:bg-[#7B5FCA] transition-colors"
          >
            Invite Participants
          </button>

          {/* Conditional rendering acording the host or a guest */}
          {isHost ? (
            <button
              onClick={closeSession}
              className="w-full bg-[#C92225] text-white py-3 text-sm rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Close the Session ({roomInfo.sessionTime})
            </button>
          ) : (
            <button
              onClick={logOut}
              className="w-full bg-[#C92225] text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Log Out
            </button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col h-screen">
        <div className="bg-white border-b border-gray-200 p-2 mt-5 mr-7 ml-2 rounded-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <img src="/people.png" alt="people" className="h-5 ml-1" />
            <h1 className="text-base sm:text-md font-medium text-gray-500">
              {roomInfo.name || "Chatroom"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 pr-3">
              Meeting ID: {roomInfo.meetingId}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white mt-5 mr-7 ml-2 mb-5 rounded-2xl overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide min-h-0">
            <div className="w-full mx-auto space-y-4">
              {messages.map((msg, i) => (
                <div key={i}>
                  {msg.isSystem ? (
                    <div className="text-center text-xs text-gray-500 my-2">
                      {msg.message}
                    </div>
                  ) : msg.userName === userName ? (
                    <div className="flex justify-end">
                      <div className="max-w-md">
                        <div className="bg-[#9074DB] text-white px-4 py-2 rounded-2xl rounded-tr-sm">
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                      <img
                        src="/avatar.png"
                        alt="avatar"
                        className="h-8 ml-1"
                      />
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <img src="/avatar.png" alt="avatar" className="h-8" />
                      <div className="max-w-md">
                        <div className="bg-gray-50 px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm">
                          <p className="text-xs font-medium text-[#9074DB] mb-1">
                            {msg.userName}
                          </p>
                          <p className="text-sm text-gray-900">{msg.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-gray-100 p-4 bg-white shrink-0">
            <div className="flex items-center w-full gap-3">
              {/* Message Input here */}
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message"
                className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9074DB] text-sm placeholder:text-gray-400"
              />

              {/* Send Button with Icon */}
              <button
                onClick={sendMessage}
                className="p-3 bg-[#9074DB] text-white rounded-full hover:bg-[#7B5FCA] transition-colors flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatroom;
