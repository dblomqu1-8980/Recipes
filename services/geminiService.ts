import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    identifiedIngredients: {
      type: Type.ARRAY,
      description: "List of food ingredients identified in the images.",
      items: { type: Type.STRING }
    },
    recipes: {
      type: Type.ARRAY,
      description: "A list of delicious recipes that can be made primarily using the identified ingredients.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING, description: "A mouth-watering short description of the dish." },
          prepTime: { type: Type.STRING, description: "e.g. 15 mins" },
          cookTime: { type: Type.STRING, description: "e.g. 30 mins" },
          difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
          calories: { type: Type.STRING, description: "Approximate calories per serving" },
          ingredients: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Full list of ingredients needed, including pantry staples." 
          },
          instructions: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Step-by-step cooking instructions."
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Tags like 'Vegetarian', 'Quick', 'Gluten-Free', etc."
          }
        },
        required: ["title", "description", "prepTime", "cookTime", "difficulty", "ingredients", "instructions", "tags", "calories"]
      }
    }
  },
  required: ["identifiedIngredients", "recipes"]
};

export const analyzeImagesAndGetRecipes = async (
  images: { base64: string; mimeType: string }[],
  excludeRecipes: string[] = []
): Promise<AnalysisResult> => {
  
  const model = "gemini-2.5-flash";

  const imageParts = images.map(img => ({
    inlineData: {
      data: img.base64,
      mimeType: img.mimeType
    }
  }));

  let prompt = `
    Analyze these images of a user's refrigerator, pantry, and freezer. 
    1. Identify all visible food ingredients.
    2. Based on these ingredients (and assuming common pantry staples like oil, salt, pepper, flour, sugar are available), generate 3-4 distinct, delicious recipes.
    3. Ensure the recipes are practical and appetizing.
  `;

  if (excludeRecipes.length > 0) {
    prompt += `
    
    IMPORTANT: Do NOT suggest the following recipes again: ${excludeRecipes.join(', ')}. 
    Please suggest completely different dishes that provide variety.
    `;
  }

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: {
        parts: [...imageParts, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        systemInstruction: "You are a world-class Michelin star chef who specializes in home cooking and reducing food waste. You are creative, encouraging, and precise."
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(response.text) as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};