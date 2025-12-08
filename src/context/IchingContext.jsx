// src/context/IchingContext.jsx
import React, { createContext, useContext, useState } from "react";

// Key: 6 lines top to bottom, concatenated; 
// Value: [hexagram index for LLM to interpret, TraditionalChineseSymbol, English Interpretation]
// Source: https://en.wikibooks.org/wiki/I_Ching/The_64_Hexagrams
export const hexagramLookup = {
  "111111": [1, "乾", "Initiating"],
  "000000": [2, "坤", "Responding"],
  "010001": [3, "屯", "Beginning"],
  "100010": [4, "蒙", "Childhood"],
  "010111": [5, "需", "Needing"],
  "111010": [6, "訟", "Contention"],
  "000010": [7, "師", "Multitude"],
  "010000": [8, "比", "Union"],
  "110111": [9, "小畜", "Little Accumulation"],
  "111011": [10, "履", "Fulfillment"],
  "000111": [11, "泰", "Advance"],
  "111000": [12, "否", "Hindrance"],
  "111101": [13, "同人", "Seeking Harmony"],
  "101111": [14, "大有", "Great Harvest"],
  "000100": [15, "謙", "Humbleness"],
  "001000": [16, "豫", "Delight"],
  "011001": [17, "隨", "Following"],
  "100110": [18, "蠱", "Remedying"],
  "000011": [19, "臨", "Approaching"],
  "110000": [20, "觀", "Watching"],
  "101001": [21, "噬嗑", "Eradicating"],
  "100101": [22, "賁", "Adorning"],
  "100000": [23, "剝", "Falling Away"],
  "000001": [24, "復", "Turning Back"],
  "111001": [25, "無妄", "Without Falsehood"],
  "100111": [26, "大畜", "Great Accumulation"],
  "100001": [27, "頤", "Nourishing"],
  "011110": [28, "大過", "Great Exceeding"],
  "010010": [29, "坎", "Darkness"],
  "101101": [30, "離", "Brightness"],
  "011100": [31, "咸", "Mutual Influence"],
  "001110": [32, "恆", "Long Lasting"],
  "111100": [33, "遯", "Retreat"],
  "001111": [34, "大壯", "Great Strength"],
  "101000": [35, "晉", "Proceeding Forward"],
  "000101": [36, "明夷", "Brilliance Injured"],
  "110101": [37, "家人", "Household"],
  "101011": [38, "睽", "Diversity"],
  "010100": [39, "蹇", "Hardship"],
  "001010": [40, "解", "Relief"],
  "100011": [41, "損", "Decreasing"],
  "110001": [42, "益", "Increasing"],
  "011111": [43, "夬", "Eliminating"],
  "111110": [44, "姤", "Encountering"],
  "011000": [45, "萃", "Bringing Together"],
  "000110": [46, "升", "Growing Upward"],
  "011010": [47, "困", "Exhausting"],
  "010110": [48, "井", "Replenishing"],
  "011101": [49, "革", "Abolishing The Old"],
  "101110": [50, "鼎", "Establishing The New"],
  "001001": [51, "震", "Taking Action"],
  "100100": [52, "艮", "Keeping Still"],
  "110100": [53, "漸", "Developing Gradually"],
  "001011": [54, "歸妹", "Marrying Maiden"],
  "001101": [55, "豐", "Abundance"],
  "101100": [56, "旅", "Travelling"],
  "110110": [57, "巽", "Proceeding Humbly"],
  "011011": [58, "兌", "Joyful"],
  "110010": [59, "渙", "Dispersing"],
  "010011": [60, "節", "Restricting"],
  "110011": [61, "中孚", "Innermost Sincerity"],
  "001100": [62, "中孚", "Little Exceeding"],
  "010101": [63, "既濟", "Already Fulfilled"],
  "101010": [64, "未濟", "Not Yet Fulfilled"],
};

const IchingContext = createContext(null);

export function IchingProvider({ children }) {
  const [question, setQuestion] = useState("");
  const [benGua, setBenGua] = useState(null);
  const [zhiGua, setZhiGua] = useState(null);
  const [changingLines, setChangingLines] = useState([]);
  const [musicPlan, setMusicPlan] = useState(null);

  // Casting sound trigger (from CastingPage to sound engine)
  const [triggerLineMelody, setTriggerLineMelody] = useState(null);

  // Function registered by CastingSoundEngine to stop all its loops
  const [castingStopper, setCastingStopper] = useState(null);

  // Called by pages when casting music should stop (e.g. Lyria takes over, Start Over)
  const stopCastingMusic = () => {
    if (castingStopper) {
      castingStopper();
    }
  };

  const resetAll = () => {
    // Stop any ongoing casting music as part of a full reset
    stopCastingMusic();

    setQuestion("");
    setBenGua(null);
    setZhiGua(null);
    setChangingLines([]);
    setMusicPlan(null);
    setTriggerLineMelody(null);
  };

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
    resetAll,

    // casting sound related
    triggerLineMelody,
    setTriggerLineMelody,
    stopCastingMusic,
    setCastingStopper,
  };

  return (
    <IchingContext.Provider value={value}>
      {children}
    </IchingContext.Provider>
  );
}

export function useIching() {
  const ctx = useContext(IchingContext);
  if (!ctx) {
    throw new Error("useIching must be used inside IchingProvider");
  }
  return ctx;
}
