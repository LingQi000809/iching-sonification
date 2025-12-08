import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BreathingOracle from "../components/BreathingOracle";
import { useIching } from "../context/IchingContext";
import TooltipButton from "../components/TooltipButton";

const tooltipText = "Text Placeholder for Casting Stage";

const lineStyles = {
  yang: (
    <div className="flex items-center space-x-2">
      <div className="w-32 h-3 bg-black rounded-full"></div>
      <div className="w-3 h-3 bg-black rounded-full opacity-0"></div>
    </div>
  ),
  yin: (
    <div className="flex items-center space-x-2">
      <div className="w-32 h-3 flex justify-between">
        <div className="w-14 h-full bg-black rounded-full"></div>
        <div className="w-14 h-full bg-black rounded-full"></div>
      </div>
      <div className="w-3 h-3 bg-black rounded-full opacity-0"></div>
    </div>
  ),
  yang_: (
    <div className="flex items-center space-x-2">
      <div className="w-32 h-3 bg-black rounded-full"></div>
      <div className="w-3 h-3 bg-black rounded-full"></div>
    </div>
  ),
  yin_: (
    <div className="flex items-center space-x-2">
      <div className="w-32 h-3 flex justify-between">
        <div className="w-14 h-full bg-black rounded-full"></div>
        <div className="w-14 h-full bg-black rounded-full"></div>
      </div>
      <div className="w-3 h-3 bg-black rounded-full"></div>
    </div>
  ),
};

export default function CastingPage() {
  const [rows, setRows] = useState([0]);              // initially only bottom row
  const [results, setResults] = useState({});         // line results per row
  const [coinFaces, setCoinFaces] = useState({});     // H/T per row
  const [tossingRow, setTossingRow] = useState(null);
  const [hexagramComplete, setHexagramComplete] = useState(false);

  const {
    question,
    benGua,
    setBenGua,
    zhiGua,
    setZhiGua,
    changingLines,
    setChangingLines,
    resetAll,
    triggerLineMelody,
    setTriggerLineMelody,
  } = useIching();

  const navigate = useNavigate();

  const setIchingContext = () => {
    console.log(results);

    let changingLinesLocal = [];
    let benGuaArr = []; // before change
    let zhiGuaArr = []; // after change

    // Note: Object.values keeps insertion order, which matches row order 0..5
    Object.values(results).forEach((rowResult, rowIdx) => {
      // BenGua uses yang/yin before change
      benGuaArr.push(rowResult.startsWith("yang") ? 1 : 0);

      if (rowResult.endsWith("_")) {
        // Changing line indices are 1-based from bottom to top for LLM
        changingLinesLocal.push(rowIdx + 1);
        // "yang_" → old yang will change to yin; "yin_" → old yin will change to yang
        zhiGuaArr.push(rowResult.startsWith("yang") ? 0 : 1);
      } else {
        // "yang" stays yang; "yin" stays yin
        zhiGuaArr.push(rowResult.startsWith("yang") ? 1 : 0);
      }
    });

    const benGuaSeq = benGuaArr.reverse().join("");
    const zhiGuaSeq = zhiGuaArr.reverse().join("");

    console.log(
      `Setting BenGua=${benGuaSeq}, ZhiGua=${zhiGuaSeq}, changingLines=${changingLinesLocal}`
    );

    setBenGua(benGuaSeq);
    setZhiGua(zhiGuaSeq);
    setChangingLines(changingLinesLocal);
  };

  const handleStartOver = () => {
    resetAll();
    navigate("/");
  };

  // Pulse triggerLineMelody (short-lived event) so engine only reacts once
  useEffect(() => {
    if (triggerLineMelody !== null) {
      const timer = setTimeout(() => setTriggerLineMelody(null), 50);
      return () => clearTimeout(timer);
    }
  }, [triggerLineMelody, setTriggerLineMelody]);

  // Once both hexagrams are set, go to interpretation page
  useEffect(() => {
    if (benGua && zhiGua) {
      navigate("/interpretation");
    }
  }, [benGua, zhiGua, navigate]);

  const tossCoins = (row) => {
    setTossingRow(row);

    setTimeout(() => {
      // Generate random HT results; Head = Yang; Tail = Yin
      const coins = [0, 0, 0].map(() => (Math.random() > 0.5 ? "H" : "T"));
      const sum = coins.reduce(
        (acc, c) => acc + (c === "H" ? 1 : 0),
        0
      );

      // Determine line type
      let lineType = null;
      if (sum === 3) lineType = "yang_"; // 3 head 0 tail → old yang
      if (sum === 2) lineType = "yin";   // 2 head 1 tail → young yin
      if (sum === 1) lineType = "yang";  // 1 head 2 tail → young yang
      if (sum === 0) lineType = "yin_";  // 0 head 3 tail → old yin

      setResults((prev) => ({ ...prev, [row]: lineType }));
      setCoinFaces((prev) => ({ ...prev, [row]: coins }));

      // Trigger casting music for this line (global engine will respond)
      setTriggerLineMelody({ rowIndex: row, coinSum: sum });

      setTossingRow(null);

      if (row < 5) {
        setRows((prev) => [...prev, row + 1]);
      } else {
        setHexagramComplete(true);
      }
    }, 2000);
  };

  const renderCoinFace = (face) => {
    return (
      <>
        <circle
          cx="50"
          cy="50"
          r="48"
          fill={face === "H" ? "#f7e9a0" : "#d4af37"}
          stroke="#b08a32"
          strokeWidth="6"
        />
        <rect x="35" y="35" width="30" height="30" rx="2" fill="#704e1a" />
        {/* H/T label */}
        <text
          x="50"
          y="85"
          textAnchor="middle"
          fontSize="18"
          fill="black"
          opacity="0.5"
          fontWeight="bold"
        >
          {face}
        </text>
      </>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-end bg-gradient-to-b from-amber-50 to-red-100 font-serif p-10">
      {/* Global CastingSoundEngine is mounted in App.jsx, not here */}

      {/* Background oracle visual */}
      <BreathingOracle size={400} opacity={0.5} maskOpacity={0.5} />

      {/* 6 rows rendered bottom → top */}
      <div className="flex flex-col-reverse space-y-4 space-y-reverse items-center mb-10 relative z-10">
        {rows.map((row) => (
          <div key={row} className="flex items-center space-x-6">
            {[0, 1, 2].map((i) => (
              <svg
                key={i}
                width="60"
                height="60"
                viewBox="0 0 100 100"
                className={tossingRow === row ? "animate-flip" : ""}
              >
                {coinFaces[row] ? (
                  renderCoinFace(coinFaces[row][i])
                ) : (
                  <>
                    <circle
                      cx="50"
                      cy="50"
                      r="48"
                      fill="#dcdcdcff"
                      stroke="#959595ff"
                      strokeWidth="6"
                    />
                    <rect
                      x="35"
                      y="35"
                      width="30"
                      height="30"
                      rx="2"
                      fill="#959595ff"
                    />
                  </>
                )}
              </svg>
            ))}

            {/* Toss button OR hexagram line */}
            {!results[row] ? (
              <div className="flex items-center space-x-2">
                <button 
                  disabled={tossingRow !== null} 
                  onClick={() => tossCoins(row)}
                  className="w-32 font-serif py-2 border-white/60 bg-black/40 text-white backdrop-blur text-black hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-xl shadow flex justify-center"
                >
                  Toss
                </button>
                {/* Dummy for alignment with generated lines */}
                <div className="w-3 h-3 bg-black rounded-full opacity-0"></div>
              </div>
            ) : (
              <div className="ml-4 min-h-6 flex items-center">
                {lineStyles[results[row]]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Start Over Button */}
      <button
        onClick={handleStartOver}
        className="absolute top-4 left-4 px-4 py-2 rounded-full border border-white/60 bg-black/40 text-white text-sm hover:bg-black/70 transition"
      >
        Start Over
      </button>

      {/* Tooltip Button */}
      <TooltipButton text={tooltipText}/>


      {/* Interpret Button */}
      <button
        className={`bottom-8 mt-10 px-6 py-3 border-white/60 bg-black/40 text-white backdrop-blur text-black hover:bg-black/70 transition rounded-2xl shadow-lg relative z-10
          ${
            hexagramComplete
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        onClick={setIchingContext}
      >
        Interpret
      </button>
    </div>
  );
}
