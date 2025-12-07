import React from "react";
import { useNavigate } from "react-router-dom";
import ChatbotIntake from "../components/ChatbotIntake";
import "../styles/global.css";
import BreathingOracle from "../components/BreathingOracle";
import { useIching } from "../context/IchingContext";

export default function IntakePage() {
  const navigate = useNavigate();
  const { setQuestion, setBenGua, setZhiGua, setChangingLines, setMusicPlan } =
    useIching();

  const handleFinishedQuestion = (question) => {
    setQuestion(question.trim());
    setBenGua(null);
    setZhiGua(null);
    setChangingLines([]);
    setMusicPlan(null);
    navigate("/casting");
  };
  return (
    <div className="w-full h-screen relative overflow-hidden flex justify-center items-center">
      
      {/* Reusable fullscreen breathing oracle */}
      <BreathingOracle size={400} opacity={0.5} maskOpacity={0.5} />

      {/* Chatbot */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <ChatbotIntake onFinished={handleFinishedQuestion} />
      </div>
    </div>
  );
}