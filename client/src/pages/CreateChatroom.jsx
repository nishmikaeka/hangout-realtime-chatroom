import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import AppContext from "../context/AppContext";
import { toast } from "react-toastify";

const CreateChatroom = () => {
  const navigate = useNavigate();
  const { backendUrl, isLoggedIn } = useContext(AppContext);

  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [allowImages, setAllowImages] = useState(false);
  const [duration, setDuration] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Safety check: If no token exists, the user isn't logged in
      if (!isLoggedIn) {
        toast.error("You must be logged in to create a chatroom.");
        navigate("/login");
        return;
      }

      const chatRoomData = {
        roomName,
        description,
        allowImages,
        duration,
        maxParticipants: maxParticipants || 10,
      };

      const { data } = await axios.post(
        backendUrl + "/api/room/create",
        chatRoomData,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success(data.message || "Chatroom created successfully!");
        navigate(`/chatroom/${data.room.roomId}`);
      } else {
        toast.error(data.message || "Failed to create the chatroom!");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Session expired or unauthorized. Please log in again.");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "An unknown error occurred."
        );
      }
      console.error("Chatroom creation error", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/3 bg-[#9d84dd] rounded-r-4xl items-center justify-center relative overflow-hidden">
        <img
          src="full_mono_logo.png"
          alt="Hangout Logo"
          className="absolute left-15 top-3 h-30"
          onClick={() => navigate("/")}
        />
        <img
          src="create_room_bg.png"
          alt="Chat Illustration"
          className="w-3/4 max-w-md"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-2/3 bg-gray-50 flex items-center justify-center p-6 sm:p-8">
        {/* Mobile Logo */}
        <img
          src="full_logo.svg"
          alt="Hangout Logo"
          className="lg:hidden absolute left-6 top-6 h-15"
          onClick={() => navigate("/")}
        />

        {/* Profile Icon */}
        <div className="absolute right-6 top-10 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer ">
          <img src="/avatar.png" alt="Avatar" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md mt-8 sm:mt-0"
        >
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-0">
            Set Up Your
          </h1>
          <h2 className="text-xl sm:text-3xl font-bold text-[#9074DB] mb-5">
            Chatroom
          </h2>

          {/* Room Name */}
          <input
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
            className="w-full px-4 py-2 mb-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#9074DB] focus:ring-2 focus:ring-[#9074DB]/20 transition-all text-sm placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-sm"
          />

          {/* Description */}
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 mb-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#9074DB] focus:ring-2 focus:ring-[#9074DB]/20 transition-all text-sm placeholder:text-xs sm:placeholder:text-sm placeholder:text-gray-400 resize-none"
          />

          {/* Allow Images Toggle */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-500">
                Allow images
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowImages}
                  onChange={(e) => setAllowImages(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9074DB]"></div>
              </label>
            </div>
          </div>

          {/* Dropdowns Row */}
          <div className="sm:flex gap-4 mb-3 sm:mb-6">
            {/* Choose Duration */}
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="flex-1 w-full px-3 sm:px-4 py-1 sm:py-3 mb-3 sm:mb-0 rounded-lg sm:rounded-xl border border-gray-200 focus:outline-none focus:border-[#9074DB] focus:ring-2 focus:ring-[#9074DB]/20 transition-all text-xs sm:text-sm text-gray-500 bg-white cursor-pointer"
            >
              <option value="">Choose duration</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
            </select>

            {/* Max Participants */}
            <select
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              className="flex-1 px-3 py-1 w-full rounded-lg mb-1 sm:rounded-xl border border-gray-200 focus:outline-none focus:border-[#9074DB] focus:ring-2 focus:ring-[#9074DB]/20 transition-all text-xs sm:text-sm text-gray-500 bg-white cursor-pointer"
            >
              <option value="0">Max participants</option>
              <option value="5">5 people</option>
              <option value="10">10 people</option>
              <option value="25">25 people</option>
              <option value="50">50 people</option>
              <option value="100">100 people</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full text-white rounded-xl py-2 sm:py-3 bg-[#9074DB] hover:bg-[#7B5FCA] transition-colors duration-200 font-medium shadow-lg text-sm sm:text-base"
          >
            Create a chatroom
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateChatroom;
