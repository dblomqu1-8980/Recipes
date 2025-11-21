export interface Ingredient {
  name: string;
  confidence?: number;
}

export interface Recipe {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
}

export interface AnalysisResult {
  identifiedIngredients: string[];
  recipes: Recipe[];
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  base64: string; // pure base64 string without data prefix
  mimeType: string;
}

export type AppStatus = 'idle' | 'analyzing' | 'success' | 'error';