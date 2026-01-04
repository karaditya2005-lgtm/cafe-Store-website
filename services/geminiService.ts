
import { GoogleGenAI } from "@google/genai";
import { COFFEE_DATA } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIRecommendation = async (userMood: string) => {
  const menuItems = COFFEE_DATA.map(c => c.name).join(", ");
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User mood: "${userMood}". 
      Available Menu: ${menuItems}.
      Task: Recommend ONE specific coffee from the menu above. 
      Tone: Professional barista, poetic, romantic (Bengali flair). 
      Format: A short paragraph (max 3 sentences) explaining WHY it matches their mood. 
      Brand Name: "রাগে অনুরাগে".`,
      config: {
        temperature: 0.8,
        topP: 0.9,
        maxOutputTokens: 200,
      }
    });
    return response.text || "I recommend our classic Espresso to ignite your senses.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The barista suggests our Vanilla Silk Latte—a smooth embrace for your current soul-state.";
  }
};
