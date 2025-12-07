// src/context/IchingContext.jsx
import React, { createContext, useContext, useState } from "react";

const IchingContext = createContext(null);

export function IchingProvider({ children }) {
  const [question, setQuestion] = useState("");
  const [benGua, setBenGua] = useState(null);
  const [zhiGua, setZhiGua] = useState(null);
  const [changingLines, setChangingLines] = useState([]);
  const [musicPlan, setMusicPlan] = useState(null); // Gemini 返回的解释+音乐参数

  const value = {
    question,
    setQuestion,
    benGua,
    setBenGua,
    zhiGua,
    setZhiGua,
    changingLines,
    setChangingLines,
    musicPlan,
    setMusicPlan,
  };

  return (
    <IchingContext.Provider value={value}>{children}</IchingContext.Provider>
  );
}

export function useIching() {
  const ctx = useContext(IchingContext);
  if (!ctx) {
    throw new Error("useIching must be used inside IchingProvider");
  }
  return ctx;
}
