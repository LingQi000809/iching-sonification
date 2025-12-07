import React, { useState, useEffect, useRef } from "react";
import BreathingOracle from "../components/BreathingOracle";
import { useIching } from "../context/IchingContext";
import { getIchingMusicPlan } from "../ichingToMusic";
import { playLyriaMusic } from "../lyriaPlayer";

export default function InterpretationPage() {
  const {
    question,
    benGua,
    zhiGua,
    changingLines,
    musicPlan,
    setMusicPlan,
  } = useIching();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  // 环境音
  const ambientRef = useRef(null);

  useEffect(() => {
    const audio = new Audio("/ambient/iching_waiting.mp3");
    audio.loop = true;
    audio.volume = 0.25;
    ambientRef.current = audio;
  }, []);

  useEffect(() => {
    async function run() {
      try {
        setLoading(true);
        setError("");

        // 播放等待环境音
        if (ambientRef.current) {
          try {
            await ambientRef.current.play();
          } catch (e) {
            console.warn("ambient play failed:", e);
          }
        }

        const plan = await getIchingMusicPlan({
          question,
          benGua,
          zhiGua,
          changingLines,
        });

        setMusicPlan(plan);

        // 停掉环境音
        if (ambientRef.current) {
          ambientRef.current.pause();
          ambientRef.current.currentTime = 0;
        }

        await playLyriaMusic(plan);
        setLoading(false);
      } catch (e) {
        console.error(e);
        if (ambientRef.current) {
          ambientRef.current.pause();
          ambientRef.current.currentTime = 0;
        }
        setError("占卜生成出错，请返回重新输入问题或卦象。");
        setLoading(false);
      }
    }

    run();
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden text-black bg-gradient-to-b from-amber-50 via-white to-slate-100 yijing-text">
      {/* 背景呼吸球 */}
      <BreathingOracle size={400} opacity={0.5} maskOpacity={0.5} />

      {/* 太极光晕（慢速旋转） */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div
          className="w-80 h-80 md:w-96 md:h-96 rounded-full 
          bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.85),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(251,191,36,0.7),transparent_60%)]
          mix-blend-screen blur-3xl opacity-80 animate-spin"
          style={{ animationDuration: "60s" }}   // ⭐ 慢速旋转：60 秒一圈
        />
      </div>

      {/* 云雾层 */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute -left-16 top-10 w-64 h-64 bg-white/40 blur-3xl rounded-full animate-pulse" />
        <div className="absolute right-0 bottom-10 w-72 h-72 bg-amber-100/40 blur-3xl rounded-full animate-pulse" />
      </div>

      {/* 内容区 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">

        {/* 等待文案 */}
        {loading && !error && (
          <div className="space-y-4 max-w-xl bg-white/50 backdrop-blur-md rounded-2xl px-6 py-5 shadow-md">
            <p className="text-lg leading-relaxed text-black/80">
              卦象正在缓缓显形，请与呼吸同频片刻……
            </p>
            <p className="text-sm leading-relaxed text-black/70">
              深吸气，慢慢呼气。
              <br />
              你的念头、时间与爻象正在交织成一段声音的旅程。
            </p>
            <p className="text-xs leading-relaxed text-black/60 italic">
              The hexagrams are forming in silence.
              <br />
              Breathe with the oracle while it listens to your question.
            </p>
          </div>
        )}

        {/* 问题 + 卦象 */}
        {!loading && !error && (
          <div className="mb-4 text-sm text-black/70 max-w-2xl">
            {question && (
              <p className="mb-2">
                <span className="font-semibold">问题：</span>
                {question}
              </p>
            )}
            <p>
              <span className="font-semibold">本卦：</span>
              {benGua ?? "?"}　/　
              <span className="font-semibold">之卦：</span>
              {zhiGua ?? "?"}
              {changingLines?.length
                ? `　（动爻：${changingLines.join(", ")}）`
                : ""}
            </p>
          </div>
        )}

        {/* 解读结果 */}
        {!loading && !error && musicPlan && (
          <div className="backdrop-blur-md bg-white/70 p-6 rounded-2xl shadow-xl max-w-2xl text-left">
            <h2 className="text-2xl mb-3 text-center">易经解读</h2>

            <h3 className="text-base font-semibold mb-1">中文解读</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
              {musicPlan.interpretation_zh ||
                musicPlan.interpretation ||
                "（暂无中文解读）"}
            </p>

            <h3 className="text-base font-semibold mb-1">Interpretation (English)</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap italic mb-4 text-black/75">
              {musicPlan.interpretation_en ||
                "No English interpretation found."}
            </p>

            {/* Debug JSON */}
            <div className="mt-2">
              <button
                onClick={() => setShowDebug((v) => !v)}
                className="px-3 py-1 border border-gray-400 text-gray-700 rounded-full text-xs hover:bg-gray-100 transition"
              >
                {showDebug ? "隐藏调试 JSON" : "显示调试 JSON（Lyria Prompt 等）"}
              </button>

              {showDebug && (
                <pre className="mt-2 text-xs bg-gray-100/90 p-2 rounded max-h-48 overflow-auto text-left">
                  {JSON.stringify(musicPlan, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* 错误 */}
        {error && (
          <div className="text-red-600 text-lg bg-white/70 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
