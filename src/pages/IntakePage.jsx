import React from "react";
import ChatbotIntake from "../components/ChatbotIntake";
import "../styles/global.css";

export default function IntakePage() {
  return (
    <div className="w-full h-screen relative overflow-hidden flex justify-center items-center">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 via-amber-100 to-red-100 animate-pulse-slow"></div>
      {/* <div className="absolute inset-0 chinese-pattern animate-breathe"></div> */}
      <div className="absolute inset-0 bg-radial-gradient-circle animate-breathe"></div>

      {/* Chatbot */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <ChatbotIntake />
      </div>
    </div>
  );
}