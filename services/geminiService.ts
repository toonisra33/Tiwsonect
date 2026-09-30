import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCaptionEnhancement = async (originalText: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return originalText;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Improve this social media caption to be more engaging, fun, and use emojis suitable for a Thai audience. Keep the meaning similar but make it pop. Input: "${originalText}"`,
    });
    return response.text?.trim() || originalText;
  } catch (error) {
    console.error("Error enhancing caption:", error);
    return originalText;
  }
};

export const generateAiReply = async (incomingMessage: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "ขอโทษด้วย ฉันไม่สามารถตอบได้ในขณะนี้";
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a friendly Thai friend chatting on a social app. Reply to this message naturally, briefly, and casually in Thai: "${incomingMessage}"`,
      });
      return response.text?.trim() || "555+";
    } catch (error) {
      console.error("Error generating reply:", error);
      return "สติ๊กเกอร์ (AI Error)";
    }
  };