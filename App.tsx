import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Header } from './components/Header';
import { UploadArea } from './components/UploadArea';
import { RecipeCard } from './components/RecipeCard';
import { LoadingState } from './components/LoadingState';
import { analyzeImagesAndGetRecipes } from './services/geminiService';
import { ImageFile, AnalysisResult, AppStatus } from './types';
import { Sparkles, AlertCircle, RefreshCw, List, PlusCircle, Loader2 } from 'lucide-react';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatingMore, setGeneratingMore] = useState(false);

  // Convert File to Base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Split to remove "data:image/jpeg;base64," prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImagesSelected = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: ImageFile[] = Array.from(files).map(file => ({
      id: uuidv4(),
      file,
      previewUrl: URL.createObjectURL(file),
      base64: '', // Will be populated during submission
      mimeType: file.type
    }));

    setImages(prev => [...prev, ...newImages]);
    // Reset previous results if adding new images
    if (status === 'success' || status === 'error') {
      setStatus('idle');
      setResult(null);
      setError(null);
    }
  }, [status]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const handleAnalyze = async () => {
    if (images.length === 0) return;

    setStatus('analyzing');
    setError(null);

    try {
      // Process images to base64
      const imagesWithBase64 = await Promise.all(images.map(async (img) => ({
        base64: await fileToBase64(img.file),
        mimeType: img.mimeType
      })));

      const data = await analyzeImagesAndGetRecipes(imagesWithBase64);
      setResult(data);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze images. Please try again.");
      setStatus('error');
    }
  };

  const handleGenerateMore = async () => {
    if (!result || images.length === 0) return;
    
    setGeneratingMore(true);
    
    try {
       const imagesWithBase64 = await Promise.all(images.map(async (img) => ({
        base64: await fileToBase64(img.file),
        mimeType: img.mimeType
      })));
      
      const currentTitles = result.recipes.map(r => r.title);
      const newResult = await analyzeImagesAndGetRecipes(imagesWithBase64, currentTitles);
      
      setResult(prev => {
        if (!prev) return newResult;
        return {
            ...prev,
            recipes: [...prev.recipes, ...newResult.recipes]
        };
      });
    } catch (err) {
        console.error("Error generating more", err);
        alert("Sorry, we couldn't generate more recipes right now. Please try again.");
    } finally {
        setGeneratingMore(false);
    }
  };

  const handleReset = () => {
    setImages([]);
    setResult(null);
    setStatus('idle');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section / Upload Status */}
        <div className="flex flex-col items-center">
          {status === 'idle' && (
             <div className="text-center mb-10 max-w-2xl mx-auto">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                  What's in your kitchen?
                </h2>
                <p className="text-lg text-slate-600">
                  Don't know what to cook? Upload photos of your ingredients, and let our AI chef craft the perfect recipe for you.
                </p>
             </div>
          )}

          {status !== 'success' && status !== 'analyzing' && (
            <>
              <UploadArea 
                images={images}
                onImagesSelected={handleImagesSelected}
                onRemoveImage={handleRemoveImage}
                disabled={status === 'analyzing'}
              />

              <div className="flex gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={images.length === 0 || status === 'analyzing'}
                  className={`
                    flex items-center px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform hover:-translate-y-1
                    ${images.length === 0 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-emerald-200 hover:shadow-xl active:scale-95'}
                  `}
                >
                  <Sparkles className={`mr-2 ${status === 'analyzing' ? 'animate-spin' : ''}`} />
                  {status === 'analyzing' ? 'Analyzing...' : 'Find Recipes'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Loading State */}
        {status === 'analyzing' && <LoadingState />}

        {/* Error State */}
        {status === 'error' && (
          <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4">
            <AlertCircle className="text-red-500 flex-shrink-0 w-6 h-6 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-semibold">Something went wrong</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button 
                onClick={handleAnalyze}
                className="mt-4 text-sm font-medium text-red-700 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Success State: Results */}
        {status === 'success' && result && (
          <div className="animate-fade-in space-y-12">
            
            {/* Ingredients Found Banner */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
                 <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 p-2 rounded-full mt-1 md:mt-0">
                      <List className="text-emerald-600 w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Ingredients Detected</h3>
                      <p className="text-slate-500 text-sm">
                        {result.identifiedIngredients.join(', ')}
                      </p>
                    </div>
                 </div>
                 <div className="flex gap-3">
                   <button 
                      onClick={() => setStatus('idle')}
                      className="text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center bg-slate-100 px-4 py-2 rounded-lg transition-colors"
                   >
                      <Sparkles size={16} className="mr-2" /> Edit Images
                   </button>
                   <button 
                      onClick={handleReset}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center bg-emerald-50 px-4 py-2 rounded-lg transition-colors"
                   >
                      <RefreshCw size={16} className="mr-2" /> Start Over
                   </button>
                 </div>
              </div>
            </div>

            {/* Recipe Grid */}
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center md:text-left">Recommended Recipes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {result.recipes.map((recipe, idx) => (
                  <RecipeCard key={`${idx}-${recipe.title}`} recipe={recipe} index={idx} />
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                 <button 
                    onClick={handleGenerateMore}
                    disabled={generatingMore}
                    className={`
                        flex items-center px-6 py-3 rounded-xl font-semibold shadow-md transition-all transform hover:-translate-y-0.5 border-2
                        ${generatingMore 
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-white border-emerald-500 text-emerald-600 hover:bg-emerald-50 active:scale-95'}
                    `}
                 >
                    {generatingMore ? (
                        <>
                            <Loader2 className="animate-spin mr-2" size={20} />
                            Cooking up more ideas...
                        </>
                    ) : (
                        <>
                            <PlusCircle className="mr-2" size={20} />
                            Generate More Recipes
                        </>
                    )}
                 </button>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default App;