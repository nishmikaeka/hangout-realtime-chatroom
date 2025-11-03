import React, { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const JoinRoomModal = ({ isOpen, onClose }) => {
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleJoinRoom = async (e) => {
    e.preventDefault();

    // Validation
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!roomId.trim()) {
      setError("Please enter a room ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/room/join",
        {
          userName: userName.trim(),
          roomId: roomId.trim().toUpperCase(),
        }
      );

      if (response.data.success) {
        // Store user info in localStorage
        localStorage.setItem("userName", response.data.userName);
        localStorage.setItem("isGuest", "true");

        // If user doesn't have a userId (guest), create a temporary one
        if (!localStorage.getItem("userId")) {
          localStorage.setItem("userId", `guest-${Date.now()}`);
        }

        // Navigate to chatroom
        navigate(`/chatroom/${response.data.roomId}`);
      } else {
        setError(response.data.message || "Failed to join room");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Room not found or has expired");
      } else if (err.response?.status === 403) {
        setError("Room is full");
      } else {
        setError(err.response?.data?.message || "Failed to join room");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleJoinRoom(e);
    }
  };

  const handleClose = () => {
    setUserName("");
    setRoomId("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-300/20 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Join Chatroom
          </h2>
          <p className="text-sm text-ghost">Enter room ID to join the chat</p>
        </div>

        {/* Form */}
        <form onSubmit={handleJoinRoom} className="space-y-4 sm:space-y-5">
          {/* Name Input */}
          <div>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter a username"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#9074DB] transition-all"
              disabled={loading}
            />
          </div>

          {/* Room ID Input */}
          <div>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value.toUpperCase());
                setError("");
              }}
              onKeyPress={handleKeyPress}
              placeholder="HANGOUT-20GML286"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#9074DB] transition-all uppercase font-mono"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 px-6 py-3 bg-[#9074DB] text-white rounded-xl font-medium hover:bg-[#7B5FCA] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomModal;
