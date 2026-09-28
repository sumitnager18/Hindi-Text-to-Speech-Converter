import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function pcmToWav(pcmBuffer: Buffer, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const wavBuffer = Buffer.alloc(totalSize);

  // RIFF chunk descriptor
  wavBuffer.write("RIFF", 0);
  wavBuffer.writeUInt32LE(totalSize - 8, 4);
  wavBuffer.write("WAVE", 8);

  // "fmt " sub-chunk
  wavBuffer.write("fmt ", 12);
  wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  wavBuffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);

  // "data" sub-chunk
  wavBuffer.write("data", 36);
  wavBuffer.writeUInt32LE(dataSize, 40);

  // Copy raw PCM audio data
  pcmBuffer.copy(wavBuffer, 44);

  return wavBuffer;
}

// Map emotion keys to natural expressive Hindi speech prompts
const EMOTION_PROMPTS: Record<string, string> = {
  natural: "Speak in a natural, clear, conversational, and pleasant Hindi tone with genuine Indian inflection and comfortable phrasing.",
  cheerful: "Speak in a very cheerful, upbeat, enthusiastic, and joyful Hindi tone with smiling warmth and vibrant positive energy.",
  calm: "Speak in a serene, peaceful, soothing, and meditative Hindi tone with gentle breathing, relaxed pacing, and soft warmth.",
  dramatic: "Speak in a deeply dramatic, expressive, cinematic, and intense Hindi tone with powerful emphasis and emotional depth.",
  storytelling: "Speak like a captivating traditional Hindi storyteller (katha-vachak) with engaging narrative rhythm, vivid voice modulations, and wondrous curiosity.",
  news: "Speak in a confident, authoritative, crisp, articulate, and formal Hindi news broadcaster tone with professional cadence.",
  empathetic: "Speak in a deeply empathetic, caring, compassionate, and comforting Hindi tone, as if speaking to a dear loved one.",
  poetic: "Speak in a rich, soulful, lyrical, and philosophical Hindi/Urdu nazm style with thoughtful pauses and deep resonance.",
  whisper: "Speak in a soft, intimate, gentle whispered Hindi tone with delicate nuances.",
  energetic: "Speak in an energetic, dynamic, high-spirited, motivational, and commanding Hindi tone with punchy delivery."
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API: Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // API: Text to Speech
  app.post("/api/tts", async (req, res) => {
    try {
      const {
        text,
        voice = "Kore",
        emotion = "natural",
        customEmotionPrompt = "",
        rateStyle = "normal", // 'slow', 'normal', 'fast'
        pitchStyle = "normal", // 'low', 'normal', 'high'
      } = req.body;

      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "कृपया हिंदी टेक्स्ट दर्ज करें (Hindi text is required)" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY environment variable is missing. Please configure it in your settings."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Construct emotion and style instruction
      const baseEmotionDesc = EMOTION_PROMPTS[emotion] || EMOTION_PROMPTS.natural;
      let styleDirectives = baseEmotionDesc;

      if (customEmotionPrompt && typeof customEmotionPrompt === "string" && customEmotionPrompt.trim()) {
        styleDirectives += ` Additionally: ${customEmotionPrompt.trim()}`;
      }

      if (rateStyle === "slow") {
        styleDirectives += " Speak at a slow, deliberate, and relaxed pace.";
      } else if (rateStyle === "fast") {
        styleDirectives += " Speak at a brisk, energetic, and swift pace.";
      }

      if (pitchStyle === "low") {
        styleDirectives += " Use a deeper, grounded vocal pitch.";
      } else if (pitchStyle === "high") {
        styleDirectives += " Use a lighter, slightly higher and bright vocal pitch.";
      }

      // Valid prebuilt voice names for Gemini TTS: 'Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon'
      const validVoices = ["Kore", "Puck", "Fenrir", "Zephyr", "Charon"];
      const selectedVoice = validVoices.includes(voice) ? voice : "Kore";

      // Formulate a clean, direct prompt for Gemini TTS model
      const emotionPrompt = customEmotionPrompt?.trim()
        ? `${EMOTION_PROMPTS[emotion] || emotion}, ${customEmotionPrompt.trim()}`
        : (EMOTION_PROMPTS[emotion] || "natural, conversational, expressive");

      const promptText = `Say with a ${emotionPrompt} tone in clear Hindi:\n${text.trim()}`;

      let base64PCM: string | null = null;
      let lastError: any = null;

      // Retry loop for transient rate limits or network issues (up to 3 attempts with backoff)
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [
              {
                parts: [{ text: promptText }],
              },
            ],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: selectedVoice },
                },
              },
            },
          });

          if (response.candidates && response.candidates.length > 0) {
            for (const candidate of response.candidates) {
              if (candidate.content?.parts) {
                for (const part of candidate.content.parts) {
                  if (part.inlineData && part.inlineData.data) {
                    base64PCM = part.inlineData.data;
                    break;
                  }
                }
              }
              if (base64PCM) break;
            }
          }

          if (base64PCM) {
            break; // Successfully obtained audio
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          const isRateLimit = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota");
          
          if (isRateLimit && attempt < 3) {
            // Wait with backoff before retrying
            console.warn(`TTS Rate limit encountered on attempt ${attempt}, waiting to retry...`);
            await new Promise((resolve) => setTimeout(resolve, 2200 * attempt));
            continue;
          }
          break;
        }
      }

      if (!base64PCM) {
        if (lastError) {
          const errMsg = lastError.message || String(lastError);
          if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
            return res.status(429).json({
              error: "दर सीमा (Rate limit) पार हो गई है। कृपया 4-5 सेकंड प्रतीक्षा करके पुनः 'आवाज़ उत्पन्न करें' दबाएं।",
            });
          }
          throw lastError;
        }
        return res.status(500).json({
          error: "आवाज़ उत्पन्न करने में विफल (Failed to generate audio from TTS model).",
        });
      }

      const pcmBuffer = Buffer.from(base64PCM, "base64");
      const sampleRate = 24000;
      const wavBuffer = pcmToWav(pcmBuffer, sampleRate, 1, 16);
      const base64WAV = wavBuffer.toString("base64");
      const durationSeconds = pcmBuffer.length / (sampleRate * 2); // 16-bit = 2 bytes per sample

      return res.json({
        success: true,
        voice: selectedVoice,
        emotion,
        duration: durationSeconds,
        sampleRate,
        pcmBase64: base64PCM,
        wavBase64: base64WAV,
        mimeType: "audio/wav",
        text: text.trim(),
        timestamp: Date.now(),
      });
    } catch (err: any) {
      console.error("TTS generation error:", err);
      return res.status(500).json({
        error: err?.message || "आवाज़ बनाने में तकनीकी त्रुटि हुई (Error generating speech audio)",
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TTS Server listening on http://localhost:${PORT}`);
  });
}

startServer();
