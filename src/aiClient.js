// src/aiClient.js
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Missing VITE_GEMINI_API_KEY");
}

export const aiClient = new GoogleGenAI({
  apiKey,
  apiVersion: "v1alpha", // 为了用 Lyria RealTime
});
