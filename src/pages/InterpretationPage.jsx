import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BreathingOracle from "../components/BreathingOracle";
import { useIching, hexagramLookup } from "../context/IchingContext";
import { getIchingMusicPlan } from "../ichingToMusic";
import { playLyriaMusic, stopLyriaMusic } from "../lyriaPlayer";

const lineStyles = {
  yang: (
    <div className="flex items-center space-x-2">
      <div className="w-24 h-2 bg-black rounded-full"></div>
      <div className="w-3 h-2 bg-black rounded-full opacity-0"></div> {/* no change; transparent */}
    </div>
  ),
  yin: (
    <div className="flex items-center space-x-2">
      <div className="w-24 h-2 flex justify-between">
        <div className="w-11 h-full bg-black rounded-full"></div>
        <div className="w-11 h-full bg-black rounded-full"></div>
      </div>
      <div className="w-3 h-2 bg-black rounded-full opacity-0"></div> {/* no change; transparent */}
    </div>
  ),
};

export default function InterpretationPage() {
  const {
    question,
    benGua,
    zhiGua,
    changingLines,
    musicPlan,
    setMusicPlan,
    resetAll,
    stopCastingMusic,
  } = useIching();

  const navigate = useNavigate();

  const handleStartOver = () => {
    // Stop casting music (Tone.js loops)
    if (stopCastingMusic) {
      stopCastingMusic();
    }
    // Stop Lyria RealTime audio
    stopLyriaMusic();

    resetAll();
    navigate("/");
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError("");

        const benGuaIdx = hexagramLookup[benGua][0];
        const zhiGuaIdx = hexagramLookup[zhiGua][0];

        const plan = await getIchingMusicPlan({
          question,
          benGuaIdx,
          zhiGuaIdx,
          changingLines,
        });

        if (cancelled) return;

        setMusicPlan(plan);

        // Stop casting music so Lyria can take over
        if (stopCastingMusic) {
          stopCastingMusic();
        }

        // Start Lyria music
        await playLyriaMusic(plan);

        if (!cancelled) {
          setLoading(false);
        }
      } catch (e) {
        console.error(e);

        if (stopCastingMusic) {
          stopCastingMusic();
        }
        stopLyriaMusic();

        if (!cancelled) {
          setError("The oracle did not speak this time. Please try again.");
          setLoading(false);
        }
      }
    }

    run();

    // Cleanup when leaving InterpretationPage (e.g., back / Start Over)
    return () => {
      stopLyriaMusic();
    };
  }, []); // only run once on mount

  function renderHexagram(lines) {
    if (!lines) return null;

    const arr = Array.from(lines).map((n) => Number(n));

    return (
      <div className="flex flex-col items-center space-y-1">
        {arr
          .slice()
          .map((line, row) => (
            <div key={row} className="w-full flex justify-center">
              {line === 1 ? lineStyles.yang : lineStyles.yin}
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden text-black bg-gradient-to-b from-amber-50 via-white to-slate-100 yijing-text">
      {/* Start Over button */}
      <button
        onClick={handleStartOver}
        className="absolute top-4 left-4 z-50 px-4 py-2 rounded-full border border-white/60 bg-black/40 text-white text-sm hover:bg-black/70 transition"
      >
        Start Over
      </button>

      {/* Background Oracle */}
      <BreathingOracle size={400} opacity={0.5} maskOpacity={0.5} />

      {/* 太极光晕（慢速旋转） */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div
          className="w-80 h-80 md:w-96 md:h-96 rounded-full 
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.85),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(251,191,36,0.7),transparent_60%)]
          mix-blend-screen blur-3xl opacity-80 animate-spin"
          style={{ animationDuration: "60s" }}
        />
      </div>

      {/* 云雾层 */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute -left-16 top-10 w-64 h-64 bg-white/40 blur-3xl rounded-full animate-pulse" />
        <div className="absolute right-0 bottom-10 w-72 h-72 bg-amber-100/40 blur-3xl rounded-full animate-pulse" />
      </div>

      {/* Loading */}
      {loading && !error && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="space-y-4 max-w-xl bg-white/50 backdrop-blur-md rounded-2xl px-6 py-5 shadow-md text-center">
            <p className="text-m leading-relaxed text-black/60 italic">
              The hexagrams are forming in silence.
              <br />
              Breathe with the oracle while it listens to your question.
            </p>
            <p className="text-m leading-relaxed text-black/80">
              卦象正在缓缓显形，请与呼吸同频片刻……
            </p>
            <p className="text-sm leading-relaxed text-black/70">
              深吸气，慢慢呼气。
              <br />
              你的念头、时间与爻象正在交织成一段声音的旅程。
            </p>
          </div>
        </div>
      )}

      {/* 内容区 */}
      <div
        className={`absolute inset-0 flex z-20 p-6 items-center justify-center space-x-10 ${
          loading ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        {/* LEFT COLUMN — HEXAGRAMS */}
        <div className="shrink-0 flex flex-col justify-center items-center space-y-2 text-center">
          {/* Ben Gua */}
          {!loading && !error && (
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-md w-72 flex flex-col items-center space-y-3">
              <h3 className="text-xl font-semibold mb-2 text-black/80">
                BenGua (本卦)
              </h3>

              <div className="flex flex-col items-center space-y-3">
                <div className="transform translate-x-3">
                  {renderHexagram(benGua)}
                </div>

                <div className="flex flex-col justify-center space-y-1">
                  <div className="text-black/80 font-medium text-xl">
                    {hexagramLookup[benGua][1]}
                  </div>

                  <div className="text-black/60 text-sm">
                    ({hexagramLookup[benGua][2]})
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Changing Lines */}
          {!loading && !error && (
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-md w-72 flex flex-col items-center space-y-3">
              <h3 className="text-xl font-semibold mb-2 text-black/80">
                Changing Lines (动爻)
              </h3>
              <div className="text-m mb-2 text-black/80">
                {changingLines.length
                  ? `${changingLines.join(", ")} (Bottom to Top)`
                  : "None"}
              </div>
            </div>
          )}

          {/* Zhi Gua */}
          {!loading && !error && (
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-md w-72 flex flex-col items-center space-y-3">
              <h3 className="text-xl font-semibold mb-2 text-black/80">
                ZhiGua (之卦)
              </h3>

              <div className="flex flex-col items中心 space-y-3">
                <div className="transform translate-x-3">
                  {renderHexagram(zhiGua)}
                </div>

                <div className="flex flex-col justify-center space-y-1">
                  <div className="text-black/80 font-medium text-xl">
                    {hexagramLookup[zhiGua][1]}
                  </div>

                  <div className="text-black/60 text-sm">
                    ({hexagramLookup[zhiGua][2]})
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — INTERPRETATION / LOADING / ERROR */}
        <div className="flex flex-col items-center justify-center text-center">
          {/* Interpretation Panel */}
          {!loading && !error && musicPlan && (
            <div className="backdrop-blur-md bg-white/70 p-7 rounded-2xl shadow-xl max-w-2xl text-left space-y-5">
              <h2 className="text-xl mb-3 text-center font-semibold">
                I-Ching Interpretation
              </h2>

              <p className="text-m leading-relaxed whitespace-pre-wrap mb-4 text-black/75">
                {musicPlan.interpretation_en ||
                  "No English interpretation found."}
              </p>

              <p className="text-m leading-relaxed whitespace-pre-wrap mb-3">
                {musicPlan.interpretation_zh ||
                  musicPlan.interpretation ||
                  "（暂无中文解读）"}
              </p>

              {/* Debug JSON */}
              <div className="mt-2 py-3">
                <button
                  onClick={() => setShowDebug((v) => !v)}
                  className="px-3 py-2 border border-gray-400 text-gray-700 rounded-full text-xs hover:bg-gray-100 transition"
                >
                  Lyria Prompt JSON
                </button>

                {showDebug && (
                  <pre className="mt-2 text-xs bg-gray-100/90 p-2 rounded max-h-48 overflow-auto text-left">
                    {JSON.stringify(musicPlan, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-red-600 text-lg bg-white/70 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
