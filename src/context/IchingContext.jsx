// src/context/IchingContext.jsx
import React, { createContext, useContext, useState } from "react";

// Key: 6 lines top to bottom, concatenated; 
// Value: [hexagram index for LLM to interpret, TraditionalChineseSymbol]
export const hexagramLookup = {
  "111111": [1, "乾"],
  "000000": [2, "坤"],
  "010001": [3, "屯"],
  "100010": [4, "蒙"],
  "010111": [5, "需"],
  "111010": [6, "訟"],
  "000010": [7, "師"],
  "010000": [8, "比"],
  "110111": [9, "小畜"],
  "111011": [10, "履"],
  "000111": [11, "泰"],
  "111000": [12, "否"],
  "111101": [13, "同人"],
  "101111": [14, "大有"],
  "000100": [15, "謙"],
  "001000": [16, "豫"],
  "011001": [17, "隨"],
  "100110": [18, "蠱"],
  "000011": [19, "臨"],
  "110000": [20, "觀"],
  "101001": [21, "噬嗑"],
  "100101": [22, "賁"],
  "100000": [23, "剝"],
  "000001": [24, "復"],
  "111001": [25, "無妄"],
  "100111": [26, "大畜"],
  "100001": [27, "頤"],
  "011110": [28, "大過"],
  "010010": [29, "坎"],
  "101101": [30, "離"],
  "011100": [31, "咸"],
  "001110": [32, "恆"],
  "111100": [33, "遯"],
  "001111": [34, "大壯"],
  "101000": [35, "晉"],
  "000101": [36, "明夷"],
  "110101": [37, "家人"],
  "101011": [38, "睽"],
  "010100": [39, "蹇"],
  "001010": [40, "解"],
  "100011": [41, "損"],
  "110001": [42, "益"],
  "011111": [43, "夬"],
  "111110": [44, "姤"],
  "011000": [45, "萃"],
  "000110": [46, "升"],
  "011010": [47, "困"],
  "010110": [48, "井"],
  "011101": [49, "革"],
  "101110": [50, "鼎"],
  "001001": [51, "震"],
  "100100": [52, "艮"],
  "110100": [53, "漸"],
  "001011": [54, "歸妹"],
  "001101": [55, "豐"],
  "101100": [56, "旅"],
  "110110": [57, "巽"],
  "011011": [58, "兌"],
  "110010": [59, "渙"],
  "010011": [60, "節"],
  "110011": [61, "中孚"],
  "001100": [62, "中孚"],
  "010101": [63, "既濟"],
  "101010": [64, "未濟"],
}

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
