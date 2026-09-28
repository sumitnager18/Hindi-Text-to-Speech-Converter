import React from 'react';
import { Sparkles, Volume2, History, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenSamples: () => void;
  onToggleHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSamples,
  onToggleHistory,
  historyCount,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-stone-900 font-hindi-sans tracking-tight">
                वाणी AI
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium border border-amber-200">
                Hindi TTS
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              प्राकृतिक और भावनात्मक हिंदी स्वर रूपांतरण (Natural & Expressive Speech)
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-sample-texts"
            onClick={onOpenSamples}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors border border-stone-200 cursor-pointer"
            title="उदाहरणात्मक हिंदी पाठ चुनें"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">उदाहरण पाठ</span>
            <span className="sm:hidden">उदाहरण</span>
          </button>

          <button
            id="btn-toggle-history"
            onClick={onToggleHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors border border-stone-200 cursor-pointer"
            title="उत्पन्न आवाजों का इतिहास देखें"
          >
            <History className="w-3.5 h-3.5 text-stone-600" />
            <span>इतिहास</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                {historyCount}
              </span>
            )}
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span className="font-medium">Gemini 3.1 TTS • 24kHz HD</span>
          </div>
        </div>
      </div>
    </header>
  );
};
