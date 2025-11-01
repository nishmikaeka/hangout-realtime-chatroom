import React, { useState } from "react";
import { X, Copy, Mail } from "lucide-react";
import axios from "axios";

const InviteModal = ({ isOpen, onClose, roomInfo }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const shareableLink = `${window.location.origin}/chatroom/${roomInfo.meetingId}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage("Copied to clipboard!");
    setTimeout(() => setMessage(""), 3000);
  };

  const sendInviteEmail = async () => {
    if (!email.trim()) {
      setMessage("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // ✅ Updated API call to match your route: POST /api/room/send-invite/:roomId
      const response = await axios.post(
        `http://localhost:4000/api/room/send-invite/${roomInfo.meetingId}`,
        {
          email: email.trim(),
        }
      );

      if (response.data.success) {
        setMessage("Invite sent successfully!");
        setEmail("");
      } else {
        setMessage(response.data.message || "Failed to send invite");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send invite");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendInviteEmail();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-4 sm:p-8 max-w-md w-full mx-2 sm:mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 sm:h-20 flex items-center justify-center mb-1">
            <img src="/full_logo.svg" alt="logo" className="h-12 sm:h-20" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
            Invite to <span className="text-[#9074DB]">Chatroom</span>
          </h2>
          <p className="text-xs text-gray-500">
            Share this link or invite others via email
          </p>
        </div>
        <div className="rounded-xl sm:border-2 sm:p-4 border-gray-200">
          {/* Room ID Section */}
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium text-black mb-2">
              Room ID
            </label>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
              <input
                type="text"
                value={roomInfo.meetingId}
                readOnly
                className="flex-1 bg-transparent text-gray-500 text-xs sm:text-sm focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(roomInfo.meetingId)}
                className="flex items-center gap-1 bg-[#9074DB] text-white px-4 py-2 rounded-lg hover:bg-[#7B5FCA] transition-colors text-xs sm:text-sm"
              >
                <Copy className="h-3 sm:h-4 w-3 sm:w-4" />
                Copy
              </button>
            </div>
          </div>

          {/* Invite by Email Section */}
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium text-black mb-2">
              Invite by Email
            </label>
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="emailaddress@gmail.com"
                className="flex-1 bg-gray-50 p-3 w-full rounded-lg text-gray-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#9074DB]"
              />
              <button
                onClick={sendInviteEmail}
                disabled={loading}
                className="flex items-center gap-1 bg-[#9074DB] text-white px-4 mr-2   py-2 rounded-lg hover:bg-[#7B5FCA] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Mail className="h-3 sm:h-4 w-3 sm:w-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Shareable Link Section */}
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium text-black mb-2">
              Shareable Link
            </label>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
              <input
                type="text"
                value={shareableLink}
                readOnly
                className="flex-1 bg-transparent text-gray-500 text-xs sm:text-sm focus:outline-none overflow-hidden text-ellipsis"
              />
              <button
                onClick={() => copyToClipboard(shareableLink)}
                className="flex items-center gap-1 bg-[#9074DB] text-white px-4 py-2 rounded-lg hover:bg-[#7B5FCA] transition-colors text-xs sm:text-sm"
              >
                <Copy className="h-3 sm:h-4 w-3 sm:w-4" />
                Copy
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div
              className={`text-sm text-center py-2 rounded-lg ${
                message.includes("success") || message.includes("Copied")
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
