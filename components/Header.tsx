import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-2 rounded-lg text-white">
            <UtensilsCrossed size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Smart <span className="text-emerald-600">Pantry</span> Chef</h1>
        </div>
        <nav>
          <a 
            href="#" 
            className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
          >
            How it works
          </a>
        </nav>
      </div>
    </header>
  );
};