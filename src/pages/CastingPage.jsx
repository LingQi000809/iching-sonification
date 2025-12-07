import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BreathingOracle from "../components/BreathingOracle";
import { useIching } from "../context/IchingContext";

export default function CastingPage() {
  const navigate = useNavigate();
  const {
    question,
    benGua,
    setBenGua,
    zhiGua,
    setZhiGua,
    changingLines,
    setChangingLines,
  } = useIching();

  const [changingInput, setChangingInput] = useState(
    changingLines.join(", ")
  );

  const handleNext = () => {
    if (!benGua || !zhiGua) {
      alert("请先填写本卦和之卦（临时输入，之后会用铜钱 UI 替换）");
      return;
    }

    // 解析动爻输入：例如 "2, 5" → [2, 5]
    const parsedChanging = changingInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => !Number.isNaN(n));

    setChangingLines(parsedChanging);
    navigate("/interpretation");
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden font-serif text-black">
      <BreathingOracle size={400} opacity={0.5} maskOpacity={0.5} />

      <div className="font-serif absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-10 text-center z-20 p-4 bg-white/60 rounded-lg">
        <div className="mb-4">
          <div className="text-sm mb-2 text-gray-700">
            问题：{question || "（还没有问题，建议回到首页重新开始）"}
          </div>
          <div className="flex gap-2 justify-center mb-2">
            <input
              type="number"
              className="border px-2 py-1 w-24 text-center"
              placeholder="本卦 (1-64)"
              value={benGua ?? ""}
              onChange={(e) => setBenGua(Number(e.target.value))}
            />
            <input
              type="number"
              className="border px-2 py-1 w-24 text-center"
              placeholder="之卦 (1-64)"
              value={zhiGua ?? ""}
              onChange={(e) => setZhiGua(Number(e.target.value))}
            />
          </div>
          <input
            type="text"
            className="border px-2 py-1 w-48 text-center text-sm"
            placeholder="动爻（例如：2,5；可以先留空）"
            value={changingInput}
            onChange={(e) => setChangingInput(e.target.value)}
          />
        </div>

        <button
          onClick={handleNext}
          className="mt-2 px-4 py-2 bg-black text-white rounded-full text-sm"
        >
          生成解读 & 音乐方案
        </button>
      </div>
    </div>
  );
}
