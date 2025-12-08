// src/ichingToMusic.js
import { aiClient } from "./aiClient";

function buildIchingPrompt(params) {
    const { question, benGuaIdx, zhiGuaIdx, changingLines } = params;

    return `
你是一位既懂《易经》、中国传统音乐，又懂氛围 / 冥想音乐制作的专家。
现在要做一个 I-Ching 占卜的“音乐解读”。

用户的问题：
"${question}"

占卜结果：
- 本卦编号: ${benGuaIdx}
- 之卦编号: ${zhiGuaIdx}
- 动爻: ${
    changingLines && changingLines.length ? changingLines.join(", ") : "无或未知"
  }

任务：
1. 先用**简洁现代的中文**解释这一卦对用户问题的大致启示（偏心理、人生建议，不要太迷信）。
2. 再用**简洁自然的英文**给出对应的占卜解读，内容可以和中文略有差异，但核心意思要一致。
3. 根据“本卦 → 之卦”的变化，以及动爻的位置，给出这一卦的整体气质：
   - 情绪（平静 / 压抑 / 明亮 / 神秘 / 紧张 / 释然 等）
   - 能量高低和张力（很稳、略有波动、充满变化等）
   - 明暗、轻重、空间感（贴地 / 开阔 / 内在 / 外放 等）
   要尽量让不同的卦象有**明显不同的气质**，不要每次都给出差不多的描述。

4. 设计一套适合这一卦的冥想音乐方案，要求：
   - 整体风格为 ambient / meditation，但不要单纯依赖“synth pad + drone” 模板。
   - 可以使用**中国元素**的音色意象：如 guqin, guzheng, dizi, xiao, erhu, temple bells, woodblocks, wind chimes 等。
   - 尝试在不同卦象中做出**明显区分的音色组合**，例如：
     - 有的卦以弦类（guqin / guzheng 弹拨）为主，pad 只作很轻的背景。
     - 有的卦以竹管（dizi / xiao 的长音气息）为主，低频只轻微衬托。
     - 有的卦以钟铃 / 木鱼 / percussive texture 为主，气氛更稀疏。
   - 如需使用 pad 或 drone，请将其作为**背景层**，不要作为主要描述或唯一元素；避免每次都用“deep synth pads”“evolving drones”这类套路化描述。
   - 始终保持音乐是冥想向、不过分 busy、不过度戏剧化。

5. 输出一段英文提示词，让 Lyria 生成 30~60 秒、无歌词的 ambient / meditation 音乐，
   - 带有上述中国乐器意象和五声音阶（pentatonic）的感觉，
   - 在质感上可以是：水、风、雾、山谷回声、寺庙钟声等，
   - 但每次都要根据卦象选择**不同的主角声部与配角声部**，而不是重复同样的配器。

只输出一个 JSON 字符串，不要任何注释、说明或 Markdown 代码块。
格式例如：

{
  "interpretation": "中文解释（与 interpretation_zh 相同或相近）",
  "interpretation_zh": "中文解读",
  "interpretation_en": "English interpretation",
  "mood_words": ["calm", "mysterious"],
  "genre": "Chinese ambient meditation",
  "instruments": ["soft guqin-like plucks", "air-like dizi textures"],
  "bpm": 72,
  "density": 0.3,
  "brightness": 0.4,
  "scale": "A_PENTATONIC",
  "lyria_prompt": "English description for Lyria..."
}
`;
}


export async function getIchingMusicPlan(params) {
    const prompt = buildIchingPrompt(params);

    const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
            role: "user",
            parts: [{ text: prompt }],
        }, ],
        generationConfig: {
            // 官方推荐字段名是 responseMimeType（驼峰）
            responseMimeType: "application/json",
        },
    });

    // 新版 SDK：text 是一个属性，不是函数
    const rawText = (response && response.text) || "";
    console.log("Gemini raw response.text:", rawText);

    if (!rawText) {
        throw new Error("Empty response from Gemini");
    }

    // 有些时候模型会返回 ```json ... ```，这里把外壳剥掉
    let cleaned = rawText.trim();

    if (cleaned.startsWith("```")) {
        const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (match && match[1]) {
            cleaned = match[1].trim();
        }
    }

    console.log("Gemini cleaned JSON string:", cleaned);

    try {
        const parsed = JSON.parse(cleaned);
        return parsed;
    } catch (err) {
        console.error("Failed to parse Gemini JSON:", err);
        // 为了 debug，顺便把原文本打印出来
        console.error("Raw text was:", rawText);
        throw err;
    }
}