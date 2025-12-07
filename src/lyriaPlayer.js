// src/lyriaPlayer.js
import { aiClient } from "./aiClient";

let audioCtx = null;
let nextTime = 0;
let currentSession = null;

function ensureAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    nextTime = audioCtx.currentTime;
  }
  return audioCtx;
}

// base64 -> Float32 stereo PCM
function decodePcm16StereoFromBase64(base64, numChannels = 2) {
  const binary = atob(base64);
  const totalSamples = binary.length / 2; // 2 bytes per sample
  const int16 = new Int16Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const lo = binary.charCodeAt(2 * i);
    const hi = binary.charCodeAt(2 * i + 1);
    let val = (hi << 8) | lo;
    if (val & 0x8000) val = val - 0x10000; // sign extension
    int16[i] = val;
  }

  const frames = totalSamples / numChannels;
  const channels = [];
  for (let ch = 0; ch < numChannels; ch++) {
    const arr = new Float32Array(frames);
    for (let i = 0; i < frames; i++) {
      const sample = int16[i * numChannels + ch];
      arr[i] = sample / 32768;
    }
    channels.push(arr);
  }
  return channels; // [left, right]
}

function enqueuePcmChunk(base64Data) {
  const ctx = ensureAudioContext();
  const [left, right] = decodePcm16StereoFromBase64(base64Data, 2);

  const sampleRate = 48000; // Lyria 默认 48k
  const frames = left.length;

  const buffer = ctx.createBuffer(2, frames, sampleRate);
  buffer.getChannelData(0).set(left);
  buffer.getChannelData(1).set(right);

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(ctx.destination);

  const startAt = Math.max(nextTime, ctx.currentTime);
  src.start(startAt);
  nextTime = startAt + buffer.duration;

  console.log(
    "[Lyria] Enqueued chunk:",
    frames,
    "frames, duration ≈",
    buffer.duration.toFixed(2),
    "s"
  );
}

/**
 * 播放基于 musicPlan 的 Lyria RealTime 音乐
 */
export async function playLyriaMusic(musicPlan) {
  if (!musicPlan) {
    throw new Error("musicPlan is required");
  }

  const ctx = ensureAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  nextTime = ctx.currentTime;

  if (currentSession) {
    try {
      console.log("[Lyria] Closing previous session");
      await currentSession.close();
    } catch (e) {
      console.warn("[Lyria] Error closing previous session:", e);
    }
    currentSession = null;
  }

  console.log("[Lyria] Connecting to Lyria RealTime...");

  const session = await aiClient.live.music.connect({
    model: "models/lyria-realtime-exp",
    callbacks: {
      onopen: () => {
        console.log("[Lyria] Lyria RealTime session opened");
      },
      onmessage: (message) => {
        console.log("[Lyria] onmessage:", message);
        const audioChunks = message?.serverContent?.audioChunks || [];
        if (!audioChunks.length) return;
        console.log("[Lyria] Received", audioChunks.length, "audioChunks");
        for (const chunk of audioChunks) {
          if (chunk.data) {
            enqueuePcmChunk(chunk.data);
          }
        }
      },
      onerror: (err) => {
        console.error("[Lyria] music session error:", err);
      },
      onclose: (ev) => {
        console.log("[Lyria] Lyria RealTime session closed", ev || "");
      },
    },
  });

  currentSession = session;

  console.log("[Lyria] Setting weighted prompts with:", musicPlan.lyria_prompt);

  await session.setWeightedPrompts({
    weightedPrompts: [
      {
        text: musicPlan.lyria_prompt,
        weight: 1.0,
      },
    ],
  });

  console.log("[Lyria] Setting music generation config");

  await session.setMusicGenerationConfig({
    musicGenerationConfig: {
      bpm: musicPlan.bpm || 72,
      density:
        typeof musicPlan.density === "number" ? musicPlan.density : 0.3,
      brightness:
        typeof musicPlan.brightness === "number" ? musicPlan.brightness : 0.4,
    },
  });


  console.log("[Lyria] Calling play()");
  await session.play();
}

/**
 * 可选：停止当前音乐播放
 */
export async function stopLyriaMusic() {
  if (audioCtx) {
    await audioCtx.suspend();
  }
  if (currentSession) {
    try {
      await currentSession.close();
    } catch (e) {
      console.warn("[Lyria] Error closing Lyria session:", e);
    }
    currentSession = null;
  }
}

/**
 * 测试本地 WebAudio 是否正常（不走 Lyria）
 */
export async function testBeep() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContextClass();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = 440; // A4
  gain.gain.value = 0.1;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}
