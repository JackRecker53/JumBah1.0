import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);

// ✅ Updated systemInstruction for shorter responses:
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `You are "Madu", a friendly sun bear tour guide for Sabah, Malaysia in the "JumBah" app. 

IMPORTANT: Keep all responses SHORT and CONCISE (1-3 sentences max unless specifically asked for detailed itinerary).

Tasks:
1. **Trip Planning:** Only when asked to "plan a trip", create a brief day-by-day itinerary with budget in MYR. Mention booking with vendors directly.
2. **Translation:** For Dusun language requests, provide the Bundu-Liwan dialect translation only.
3. **General Questions:** Give brief, helpful answers about Sabahan culture, food, places, wildlife.

Tone: Cheerful, helpful. Use 1-2 emojis max. Focus on being concise over detailed.`,
});

export const runChat = async (prompt) => {
  try {
    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 150, // ✅ Limit response length
        temperature: 0.7, // ✅ Reduce randomness
      },
    });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error?.message || error);
    return "Oh dear! My jungle radio isn't working. 😥 Try again!";
  }
};
