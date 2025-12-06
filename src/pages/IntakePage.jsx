import React from "react";
import ChatbotIntake from "../components/ChatbotIntake";
import "../styles/global.css";
import BreathingOracle from "../components/BreathingOracle";

export default function IntakePage() {
  return (
    <div className="w-full h-screen relative overflow-hidden flex justify-center items-center">
      
      {/* Reusable fullscreen breathing oracle */}
      <BreathingOracle size={400} opacity={0.5} maskOpacity={0.5} />

      {/* Chatbot */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <ChatbotIntake />
      </div>
    </div>
  );
}