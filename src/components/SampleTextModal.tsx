import React, { useState } from 'react';
import { SAMPLE_TEXTS } from '../data/sampleTexts';
import { SampleTextSnippet } from '../types';
import { X, BookOpen, Sparkles, User, ArrowRight } from 'lucide-react';

interface SampleTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleTextSnippet) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'सभी (All)' },
  { id: 'quote', label: 'विचार (Quotes)' },
  { id: 'poetry', label: 'कविता (Poetry)' },
  { id: 'story', label: 'कहानी (Stories)' },
  { id: 'greeting', label: 'अभिवादन (Greetings)' },
  { id: 'news', label: 'समाचार (News)' },
  { id: 'dialogue', label: 'संवाद (Dialogue)' },
];

export const SampleTextModal: React.FC<SampleTextModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filtered =
    selectedCategory === 'all'
      ? SAMPLE_TEXTS
      : SAMPLE_TEXTS.filter((s) => s.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 font-hindi-sans">
                उदाहरणात्मक हिंदी पाठ चुनें (Select Sample Hindi Text)
              </h3>
              <p className="text-xs text-stone-500">
                विभिन्न भावों और शैलियों के लिए तैयार सुंदर हिंदी उदाहरण
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 py-2.5 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* List of samples */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-bold text-sm text-stone-900 font-hindi-sans">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-600" />
                      {item.recommendedVoice}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-orange-600" />
                      {item.recommendedEmotion}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-stone-700 leading-relaxed font-hindi-sans bg-white p-3 rounded-lg border border-stone-100 italic">
                  "{item.hindiText}"
                </p>

                <p className="text-xs text-stone-500 mt-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-stone-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onSelectSample(item);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  <span>यह पाठ लोड करें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
