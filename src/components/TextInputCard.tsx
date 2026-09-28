import React, { useRef } from 'react';
import { Sparkles, Trash2, Clipboard, Loader2, ArrowRight } from 'lucide-react';

interface TextInputCardProps {
  text: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onOpenSamples: () => void;
}

const DEVANAGARI_SYMBOLS = [
  { label: '।', title: 'पूर्ण विराम (Purna Viram)' },
  { label: '॥', title: 'दीर्घ विराम' },
  { label: '?', title: 'प्रश्नवाचक' },
  { label: '!', title: 'विस्मयादिबोधक' },
  { label: ',', title: 'अल्पविराम' },
  { label: '...', title: 'ठहराव (Pause)' },
  { label: 'ं', title: 'अनुस्वार' },
  { label: 'ँ', title: 'अनुनासिक (चन्द्रबिन्दु)' },
  { label: 'ः', title: 'विसर्ग' },
  { label: '़', title: 'नुक्ता' },
  { label: 'ॐ', title: 'प्रणव / ॐ' },
];

export const TextInputCard: React.FC<TextInputCardProps> = ({
  text,
  onChange,
  onGenerate,
  isLoading,
  onOpenSamples,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  // Estimate ~120 Hindi words per minute
  const estSeconds = Math.max(1, Math.round((wordCount / 120) * 60));

  const handleInsertSymbol = (symbol: string) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextText = text.substring(0, start) + symbol + text.substring(end);
    onChange(nextText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChange(text ? `${text} ${clipText}` : clipText);
      }
    } catch (e) {
      // Fallback
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && text.trim()) {
        onGenerate();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Top toolbar */}
      <div className="px-4 py-3 bg-stone-50/70 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 font-hindi-sans">
            हिंदी पाठ दर्ज करें (Enter Hindi Text)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 rounded-md border border-stone-200 transition-colors cursor-pointer"
            title="क्लिपबोर्ड से पेस्ट करें"
          >
            <Clipboard className="w-3 h-3" />
            <span>पेस्ट</span>
          </button>

          {text.trim() && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 rounded-md border border-rose-200 transition-colors cursor-pointer"
              title="टेक्स्ट साफ करें"
            >
              <Trash2 className="w-3 h-3" />
              <span>साफ करें</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="p-4 sm:p-5 relative">
        <textarea
          id="hindi-text-input"
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="यहाँ हिंदी में पाठ लिखें या पेस्ट करें... (उदा. 'नमस्ते! आपका दिन शुभ हो, हम आपके उज्ज्वल भविष्य की कामना करते हैं।')"
          rows={5}
          className="w-full text-base sm:text-lg leading-relaxed text-stone-800 placeholder:text-stone-400 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none font-hindi-sans min-h-[140px]"
        />

        {/* Quick Devanagari punctuation bar */}
        <div className="mt-2 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-1 sm:gap-1.5">
          <span className="text-[11px] font-medium text-stone-500 mr-1 hidden sm:inline">
            विराम चिह्न व मात्राएँ:
          </span>
          {DEVANAGARI_SYMBOLS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => handleInsertSymbol(s.label)}
              title={s.title}
              className="px-2 py-1 text-xs font-semibold bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 rounded transition-colors border border-stone-200 cursor-pointer active:scale-95"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom stats and action button */}
      <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-stone-500 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span>
              शब्द: <strong className="text-stone-700">{wordCount}</strong>
            </span>
            <span>•</span>
            <span>
              वर्ण: <strong className="text-stone-700">{charCount}</strong>
            </span>
            {wordCount > 0 && (
              <>
                <span>•</span>
                <span>
                  अनुमानित समय: <strong className="text-stone-700">~{estSeconds}s</strong>
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenSamples}
            className="sm:hidden text-amber-700 font-medium hover:underline text-xs"
          >
            नमूना पाठ देखें
          </button>
        </div>

        <button
          id="btn-generate-speech"
          type="button"
          disabled={isLoading || !text.trim()}
          onClick={onGenerate}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all cursor-pointer ${
            isLoading || !text.trim()
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white hover:from-amber-700 hover:via-orange-700 hover:to-rose-700 active:scale-[0.98] shadow-orange-500/25'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>आवाज़ तैयार हो रही है...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>आवाज़ उत्पन्न करें (Generate Speech)</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline opacity-80" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
