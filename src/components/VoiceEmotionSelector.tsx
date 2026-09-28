import React, { useState } from 'react';
import { VOICES } from '../data/voices';
import { EMOTIONS } from '../data/emotions';
import { VoiceOption, EmotionOption } from '../types';
import {
  Sparkles,
  Smile,
  Wind,
  BookOpen,
  Flame,
  Heart,
  Radio,
  Feather,
  Zap,
  Volume1,
  User,
  Sliders,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface VoiceEmotionSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  selectedEmotion: string;
  onSelectEmotion: (emotionId: string) => void;
  customEmotionPrompt: string;
  onChangeCustomEmotionPrompt: (val: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  Smile,
  Wind,
  BookOpen,
  Flame,
  Heart,
  Radio,
  Feather,
  Zap,
  Volume1,
};

export const VoiceEmotionSelector: React.FC<VoiceEmotionSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  selectedEmotion,
  onSelectEmotion,
  customEmotionPrompt,
  onChangeCustomEmotionPrompt,
}) => {
  const [showCustomPrompt, setShowCustomPrompt] = useState<boolean>(Boolean(customEmotionPrompt));

  return (
    <div className="space-y-6">
      {/* 1. Voice Selection */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider font-hindi-sans">
              १. स्वर चुनें (Select Hindi Voice)
            </h2>
          </div>
          <span className="text-xs text-stone-500">
            ५ उच्च गुणवत्ता स्टूडियो आवाज़ें
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VOICES.map((v: VoiceOption) => {
            const isSelected = selectedVoice === v.id;
            return (
              <button
                key={v.id}
                type="button"
                id={`voice-btn-${v.id}`}
                onClick={() => onSelectVoice(v.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-400/20'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg bg-gradient-to-br ${v.color} flex items-center justify-center text-white text-xs font-bold shadow-xs`}
                      >
                        {v.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-stone-900 font-hindi-sans flex items-center gap-1.5">
                          <span>{v.name}</span>
                          <span className="text-xs font-medium text-stone-500">
                            ({v.gender === 'female' ? 'महिला' : 'पुरुष'})
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed font-hindi-sans">
                    {v.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-100/80 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 font-medium">
                    {v.accent}
                  </span>
                  <span className="text-amber-800/80 font-medium truncate max-w-[130px]" title={v.bestFor}>
                    {v.bestFor}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Emotional Expression Picker */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider font-hindi-sans">
              २. आवाज़ का भाव व शैली (Emotional Expression)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCustomPrompt(!showCustomPrompt)}
            className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
          >
            <Sliders className="w-3 h-3" />
            <span>कस्टम निर्देश</span>
            {showCustomPrompt ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {EMOTIONS.map((emo: EmotionOption) => {
            const isSelected = selectedEmotion === emo.id;
            const IconComponent = ICON_MAP[emo.iconName] || Sparkles;

            return (
              <button
                key={emo.id}
                type="button"
                id={`emotion-btn-${emo.id}`}
                onClick={() => onSelectEmotion(emo.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `${emo.color} shadow-xs ring-2 ring-amber-400/30 font-semibold`
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      isSelected ? 'bg-white/80 shadow-xs' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold leading-tight font-hindi-sans">
                    {emo.hindiName}
                  </div>
                  <div className="text-[10px] opacity-75 mt-0.5 font-sans leading-tight">
                    {emo.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom prompt accordion */}
        {showCustomPrompt && (
          <div className="mt-4 pt-3.5 border-t border-stone-100">
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 font-hindi-sans">
              विशिष्ट भाव / शैली निर्देश (Custom Nuance / Fine-tune Direction):
            </label>
            <input
              id="custom-emotion-prompt-input"
              type="text"
              value={customEmotionPrompt}
              onChange={(e) => onChangeCustomEmotionPrompt(e.target.value)}
              placeholder="उदा. 'हल्की मुस्कुराहट और स्नेह के साथ', 'रहस्यमयी जिज्ञासा के साथ', 'गहरे ठहराव के साथ'..."
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none bg-stone-50 font-hindi-sans"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              यह निर्देश AI को आवाज़ में और अधिक सूक्ष्म भावनात्मक स्पर्श जोड़ने में मदद करता है।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
