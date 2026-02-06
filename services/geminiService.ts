import { GoogleGenAI, Type } from "@google/genai";
import { ProposalDetails, GeneratedContent } from '../types';

export const generateProposalContent = async (details: ProposalDetails): Promise<GeneratedContent> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const relationshipContext = details.relationship === 'friend' ? "Friend/Bestie (Platonic)" : "Romantic Partner";
  
  const roastInstruction = details.vibe === 'roast' 
    ? "Create a playful, roasting tone. Tease them about being single, weird, or stuck with the sender. Example sentiment: 'Since nobody else wants you, you're stuck with me.' Make it funny, slightly mean, but ultimately affectionate." 
    : "";

  const prompt = `
    Write a short, creative Valentine's proposal content for a web app.
    Relationship Context: ${relationshipContext}
    Sender: ${details.senderName}
    Recipient: ${details.partnerName}
    Key Memories/Traits: ${details.memories}
    Style/Vibe: ${details.vibe}

    Requirements:
    1. A short, catchy headline (max 10 words).
    2. A 4-line poem or short message (max 50 words) that leads up to the question.
    3. Do NOT include the question "Will you be my Valentine" in the text, that will be a button.
    ${roastInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            poem: { type: Type.STRING }
          },
          required: ["headline", "poem"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as GeneratedContent;
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if AI fails
    return {
      headline: `For my favorite human, ${details.partnerName}`,
      poem: "Roses are red, violets are blue, this AI broke, but I still choose you."
    };
  }
};