import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Send, Menu, X } from "lucide-react";
import InviteModal from "../components/InviteModal";
import { toast } from "react-toastify";

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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // ✅ Debug participants updates
  useEffect(() => {
    console.log("🔄 Participants STATE changed! Count:", participants.length);
    console.log("🔄 Full list:", participants);
  }, [participants]);

  console.log("🎨 RENDER - Current participants count:", participants.length);

  // Initialize socket
  useEffect(() => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    newSocket.emit("joinRoom", roomId, userName, userId);

    // ✅ Message handlers
    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleUserJoined = (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          userName: "System",
          message: msg,
          isSystem: true,
          timestamp: new Date(),
        },
      ]);
    };

    const handleUserLeft = (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          userName: "System",
          message: msg,
          isSystem: true,
          timestamp: new Date(),
        },
      ]);
    };

    const handleUpdateParticipants = (list) => {
      console.log("📋 Participants received from server:", list);

      // Filter out any null or malformed users
      const validList = (list || []).filter(
        (p) => p && typeof p === "object" && p.name
      );

      // Force React re-render with fresh array instance
      setTimeout(() => {
        setParticipants([...validList]);
      }, 100);
    };

    const handleRoomInfo = (info) => {
      console.log("Room info received:", info);
      setRoomInfo(info);
    };

    const handleSessionTimer = (time) => {
      setRoomInfo((prev) => ({ ...prev, sessionTime: time }));
    };

    const handleSessionEnded = () => {
      alert("Session has ended!");
      navigate("/");
    };

    // ✅ Attach listeners
    newSocket.on("receiveMessage", handleReceiveMessage);
    newSocket.on("userJoined", handleUserJoined);
    newSocket.on("userLeft", handleUserLeft);
    newSocket.on("updateParticipants", handleUpdateParticipants);
    newSocket.on("roomInfo", handleRoomInfo);
    newSocket.on("sessionTimer", handleSessionTimer);
    newSocket.on("sessionEnded", handleSessionEnded);

    // ✅ NEW: Handle roomFull event
    const handleRoomFull = (data) => {
      toast.error(data.message || "Room is full. Cannot join.");
      navigate("/"); // redirect user to home or previous page
    };
    newSocket.on("roomFull", handleRoomFull);

    // ✅ Cleanup function - remove ALL listeners
    return () => {
      newSocket.off("receiveMessage", handleReceiveMessage);
      newSocket.off("userJoined", handleUserJoined);
      newSocket.off("userLeft", handleUserLeft);
      newSocket.off("updateParticipants", handleUpdateParticipants);
      newSocket.off("roomInfo", handleRoomInfo);
      newSocket.off("sessionTimer", handleSessionTimer);
      newSocket.off("sessionEnded", handleSessionEnded);

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
    setShowInviteModal(true);
    setShowMobileSidebar(false);
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
      setTimeout(() => {
        socket.disconnect();
        navigate("/");
      }, 1000);
    } else {
      navigate("/");
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const isHost = roomInfo.hostId === userId;

  return (
    <>
      <div className="flex h-screen bg-[#F1EEFB] overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 bg-white border-r sm:m-5 sm:ml-7 rounded-2xl border-gray-200 flex-col">
          <div className="p-4 border-b border-gray-200">
            <img
              src="/hangout_black.png"
              alt="Hangout logo"
              className="h-4 w-auto"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {participants.length === 0 ? (
              <p className="text-xs text-gray-400 text-center">
                No participants yet
              </p>
            ) : (
              participants.map((p, i) => (
                <div
                  key={`${p.id || p.socketId}-${i}`}
                  className="flex items-center gap-3 mb-4"
                >
                  <img src="/avatar.png" alt="avatar" className="h-12" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {p.name
                        ? p.name.charAt(0).toUpperCase() + p.name.slice(1)
                        : "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">{p.role}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 space-y-2 border-t border-gray-200">
            <button
              onClick={inviteParticipants}
              className="w-full bg-[#9074DB] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#7B5FCA] transition-colors"
            >
              Invite Participants
            </button>

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
                className="w-full bg-[#C92225] text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Log Out
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
              onClick={() => setShowMobileSidebar(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col animate-slide-in">
              {/* Mobile Sidebar Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <img
                  src="/hangout_black.png"
                  alt="Hangout logo"
                  className="h-4 w-auto"
                />
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Participants List */}
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                  Participants ({participants.length})
                </h3>
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 mb-4">
                    <img src="/avatar.png" alt="avatar" className="h-10" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {p.name &&
                          p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500">{p.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Action Buttons */}
              <div className="p-4 space-y-2 border-t border-gray-200">
                <button
                  onClick={inviteParticipants}
                  className="w-full bg-[#9074DB] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#7B5FCA] transition-colors"
                >
                  Invite Participants
                </button>

                {isHost ? (
                  <button
                    onClick={closeSession}
                    className="w-full bg-[#C92225] text-white py-3 text-sm rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Close Session ({roomInfo.sessionTime})
                  </button>
                ) : (
                  <button
                    onClick={logOut}
                    className="w-full bg-[#C92225] text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                  >
                    Log Out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col h-screen">
          {/* Mobile Header */}
          <div className="md:hidden bg-white border-b border-gray-200 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/hangout_black.png"
                alt="Hangout logo"
                className="h-4 w-auto"
              />
            </div>
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex bg-white border-b border-gray-200 p-2 mt-5 mr-7 ml-2 rounded-2xl items-center justify-between shrink-0">
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

          {/* Mobile Room Info */}
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <img src="/people.png" alt="people" className="h-4" />
                <h1 className="text-sm font-medium text-gray-700">
                  {roomInfo.name || "Chatroom"}
                </h1>
              </div>
              <span className="text-xs text-gray-500">
                ID: {roomInfo.meetingId}
              </span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 flex flex-col bg-white mt-0 md:mt-5 mr-0 md:mr-7 ml-0 md:ml-2 mb-0 md:mb-5 md:rounded-2xl overflow-hidden min-h-0">
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 scrollbar-hide min-h-0">
              <div className="w-full mx-auto space-y-3 sm:space-y-4">
                {messages.map((msg, i) => (
                  <div key={i}>
                    {msg.isSystem ? (
                      <div className="text-center text-xs text-gray-500 my-2">
                        {msg.message}
                      </div>
                    ) : msg.userName === userName ? (
                      <div className="flex justify-end">
                        <div className="max-w-[75%] sm:max-w-md">
                          <div className="bg-[#9074DB] text-white px-3 sm:px-4 py-2 rounded-2xl rounded-tr-sm">
                            <p className="text-xs sm:text-sm break-words">
                              {msg.message}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                        <img
                          src="/avatar.png"
                          alt="avatar"
                          className="h-7 sm:h-8 ml-1"
                        />
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <img
                          src="/avatar.png"
                          alt="avatar"
                          className="h-7 sm:h-8"
                        />
                        <div className="max-w-[75%] sm:max-w-md">
                          <div className="bg-gray-50 px-3 sm:px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm">
                            <p className="text-xs font-medium text-[#9074DB] mb-1">
                              {msg.userName}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-900 break-words">
                              {msg.message}
                            </p>
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

            {/* Input Area */}
            <div className="border-t border-gray-100 p-3 sm:p-4 bg-white shrink-0">
              <div className="flex items-center w-full gap-2 sm:gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9074DB] text-xs sm:text-sm placeholder:text-gray-400"
                />
                <button
                  onClick={sendMessage}
                  className="p-2.5 sm:p-3 bg-[#9074DB] text-white rounded-full hover:bg-[#7B5FCA] transition-colors flex items-center justify-center shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        roomInfo={roomInfo}
      />
    </>
  );
};

export default Chatroom;
