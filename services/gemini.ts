import { GoogleGenAI, Type } from "@google/genai";
import { HadithResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchHadithWithExplanation = async (topic?: string): Promise<HadithResponse | null> => {
  try {
    const prompt = topic 
      ? `Provide a Hadith about "${topic}" in Arabic (with Tashkeel). Include the source (e.g., Sahih Bukhari), the grade (Authentic/Sahih, Hasan, or Weak/Da'if), and a detailed explanation in Arabic.`
      : `Provide a random authentic Hadith (Sahih) in Arabic (with Tashkeel) about good character or worship. Include the source, grade (Sahih), and a detailed explanation in Arabic.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hadithArabic: { type: Type.STRING, description: "The text of the hadith in Arabic with diacritics (tashkeel)" },
            source: { type: Type.STRING, description: "The source book of the hadith (e.g. Sahih Muslim)" },
            grade: { type: Type.STRING, description: "The grade of the hadith in Arabic (e.g., صحيح, حسن, ضعيف)" },
            explanation: { type: Type.STRING, description: "A detailed explanation of the hadith in Arabic" }
          },
          required: ["hadithArabic", "source", "grade", "explanation"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as HadithResponse;
    }
    return null;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const fetchAyahExplanation = async (surahName: string, ayahNumber: number, ayahText: string): Promise<string | null> => {
  try {
    const prompt = `Provide a clear, simple, and concise Tafsir (explanation) in Arabic for the following verse from the Holy Quran.
    
    Surah: ${surahName}
    Ayah Number: ${ayahNumber}
    Ayah Text: "${ayahText}"
    
    The explanation should be easy to understand for a general reader. If applicable, reference well-known Tafsir scholars (like Al-Sa'di or Ibn Kathir) briefly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      // No JSON schema needed, just plain text is fine for the explanation body
    });

    return response.text || "عذراً، لم يتم العثور على تفسير في الوقت الحالي.";

  } catch (error) {
    console.error("Gemini API Error (Tafsir):", error);
    return null;
  }
};
