import React, { useState } from "react";
import BreathingOracle from "../components/BreathingOracle";

const lineStyles = {
  yang: (
    <div className="flex items-center space-x-2">
      <div className="w-32 h-3 bg-black rounded-full"></div>
      <div className="w-3 h-3 bg-black rounded-full opacity-0"></div> {/* no change; transparent */}
    </div>
  ),
  yin: (
    <div className="flex items-center space-x-2">
      <div className="w-32 h-3 flex justify-between">
        <div className="w-14 h-full bg-black rounded-full"></div>
        <div className="w-14 h-full bg-black rounded-full"></div>
      </div>
      <div className="w-3 h-3 bg-black rounded-full opacity-0"></div> {/* no change; transparent */}
    </div>
  ),
  yang_: (
    <div className="flex items-center space-x-2">
      <div className="w-32 h-3 bg-black rounded-full"></div>
      <div className="w-3 h-3 bg-black rounded-full"></div> {/* changing yang circle */}
    </div>
  ),
  yin_: (
    <div className="flex items-center space-x-2">
      <div className="w-32 h-3 flex justify-between">
        <div className="w-14 h-full bg-black rounded-full"></div>
        <div className="w-14 h-full bg-black rounded-full"></div>
      </div>
      <div className="w-3 h-3 bg-black rounded-full"></div> {/* changing yin circle */}
    </div>
  )
};

export default function CastingPage() {
  const [rows, setRows] = useState([0]); // initially only bottom row
  const [results, setResults] = useState({}); // store line results per row
  const [coinFaces, setCoinFaces] = useState({}); // store H/T per row
  const [tossingRow, setTossingRow] = useState(null);
  const [hexagramComplete, setHexagramComplete] = useState(false);

  const tossCoins = (row) => {
    setTossingRow(row);

    setTimeout(() => {
      // generate random HT results; Head=Yang; Tail=Yin
      const coins = [0, 0, 0].map(() => (Math.random() > 0.5 ? "H" : "T"));
      const sum = coins.reduce((acc, c) => acc + (c === "H" ? 1 : 0), 0);

      // determine line type (if not all are head or tail, take the lesser's type)
      let lineType = null;
      if (sum === 3) lineType = "yang_"; // 3 head 0 tail -> old yang; pending change to yin
      if (sum === 2) lineType = "yin"; // 2 head 1 tail (less tail) -> young yin
      if (sum === 1) lineType = "yang"; // 1 head 2 tail (less head) -> young yang
      if (sum === 0) lineType = "yin_"; // 0 head 3 tail -> old yin; pending change to yang

      setResults((prev) => ({ ...prev, [row]: lineType }));
      setCoinFaces((prev) => ({ ...prev, [row]: coins }));
      setTossingRow(null);

      if (row < 5) setRows((prev) => [...prev, row + 1]);
      else setHexagramComplete(true);
    }, 2000); // timeout consistent with the duration of the animation-flip CSS
  };

  const renderCoinFace = (face) => {
    return (
    <>
      <circle cx="50" cy="50" r="48" fill={face === "H" ? "#f7e9a0" : "#d4af37"} stroke="#b08a32" strokeWidth="6" />
      <rect x="35" y="35" width="30" height="30" rx="2" fill="#704e1a" />
      {/* Head/Tail label */}
      <text x="50" y="85" textAnchor="middle" fontSize="18" fill="black" opacity="0.5" fontWeight="bold">
        {face}
      </text>
    </>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-end bg-gradient-to-b from-amber-50 to-red-100 font-serif p-10">
      {/* background oracle visual */}
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
              {coinFaces[row] ? renderCoinFace(coinFaces[row][i]) 
              : (
                <>
                  <circle cx="50" cy="50" r="48" fill="#dcdcdcff" stroke="#959595ff" strokeWidth="6" />
                  <rect x="35" y="35" width="30" height="30" rx="2" fill="#959595ff" />
                </>
              )}
            </svg>
            ))}

            {/* toss button OR hexagram line */}
            {!results[row] ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => tossCoins(row)}
                  className="w-32 font-serif py-2 bg-white/40 backdrop-blur rounded-xl shadow 
                    hover:bg-white/60 transition flex justify-center"
                >
                  Toss
                </button>
                {/* transparent dummy object for alignment with generated lines */}
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

      {/* interpret button */}
      <button 
        className={`bottom-8 mt-10 px-6 py-3 bg-black text-white rounded-2xl shadow-lg hover:bg-gray-800 transition relative z-10
          ${hexagramComplete ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => {
          console.log(results);
          window.location.href = "/interpretation";
        }}
      >
        Interpret
      </button>
    </div>
  );
}
