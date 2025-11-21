import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const LOADING_MESSAGES = [
  "Scanning your pantry...",
  "Identifying ingredients...",
  "Consulting the recipe books...",
  "Brainstorming delicious combinations...",
  "Finalizing chef's recommendations..."
];

export const LoadingState: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin relative z-10" />
      </div>
      <h3 className="mt-8 text-2xl font-semibold text-slate-800 text-center animate-fade-in">
        {LOADING_MESSAGES[messageIndex]}
      </h3>
      <p className="mt-2 text-slate-500 text-center max-w-md">
        Our AI chef is analyzing your photos to create the perfect meal plan for you.
      </p>
    </div>
  );
};