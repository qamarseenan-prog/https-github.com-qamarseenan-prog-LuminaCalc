import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Solves a math problem described in natural language using Gemini 2.5 Flash.
 * @param input The natural language math problem (e.g., "square root of 144 plus 50")
 * @returns The numerical result as a string or an error message.
 */
export const solveMathWithGemini = async (input: string): Promise<string> => {
  const ai = getGeminiClient();
  if (!ai) return "Error: API Key Missing";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Solve the following math problem. Return ONLY the numerical answer. Do not include any text, explanations, or markdown formatting like \`\`\`. If the input is not a solvable math problem, return "Error".
      
      Input: ${input}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Prioritize speed/latency over complex reasoning for simple math
        temperature: 0, // Deterministic output
      },
    });

    const text = response.text?.trim();
    if (!text) return "Error";
    
    // Remove any accidental markdown code blocks if the model ignores instruction (rare with low temp)
    const cleanText = text.replace(/```/g, '').trim();
    return cleanText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error";
  }
};