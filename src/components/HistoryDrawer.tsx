import React from 'react';
import { GeneratedAudioItem } from '../types';
import {
  X,
  History,
  Play,
  Pause,
  Download,
  Trash2,
  Heart,
  CornerUpLeft,
  Calendar,
  Volume2,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedAudioItem[];
  currentPlayingId: string | null;
  isPlaying: boolean;
  onPlayItem: (item: GeneratedAudioItem) => void;
  onTogglePlay: () => void;
  onDownloadItem: (item: GeneratedAudioItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onLoadIntoEditor: (item: GeneratedAudioItem) => void;
  onToggleFavorite: (id: string) => void;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString();
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  currentPlayingId,
  isPlaying,
  onPlayItem,
  onTogglePlay,
  onDownloadItem,
  onDeleteItem,
  onClearAll,
  onLoadIntoEditor,
  onToggleFavorite,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-stone-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-sm sm:text-base text-stone-900 font-hindi-sans">
                आवाज़ों का इतिहास (History)
              </h3>
              <p className="text-xs text-stone-500">
                कुल {history.length} ऑडियो क्लिप्स
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                title="सभी इतिहास मिटाएं"
              >
                सब हटाएं
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <Volume2 className="w-12 h-12 stroke-1 text-stone-300 mb-2" />
              <p className="font-medium text-stone-600 font-hindi-sans">
                कोई ऑडियो क्लिप मौजूद नहीं है
              </p>
              <p className="text-xs text-stone-400 mt-1 max-w-[200px]">
                पाठ लिखकर 'आवाज़ उत्पन्न करें' पर क्लिक करने पर यहाँ इतिहास दिखेगा।
              </p>
            </div>
          ) : (
            history.map((item) => {
              const isCurrent = currentPlayingId === item.id;
              const isItemPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-50/50 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                        {item.voice}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {item.emotion}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {item.duration > 0 ? `${item.duration.toFixed(1)}s` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(item.id)}
                        className={`p-1 rounded text-stone-400 hover:text-rose-600 transition-colors cursor-pointer ${
                          item.isFavorite ? 'text-rose-600' : ''
                        }`}
                        title="पसंदीदा"
                      >
                        <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-500' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="मिटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 font-hindi-sans line-clamp-2 leading-relaxed mb-3">
                    "{item.text}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100">
                    <span className="text-[10px]">
                      {formatTimestamp(item.timestamp)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadIntoEditor(item);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium cursor-pointer"
                        title="टेक्स्ट एडिटर में लोड करें"
                      >
                        <CornerUpLeft className="w-3 h-3" />
                        <span>लोड करें</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDownloadItem(item)}
                        className="p-1.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                        title="डाउनलोड करें"
                      >
                        <Download className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isCurrent) {
                            onTogglePlay();
                          } else {
                            onPlayItem(item);
                          }
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-xs text-white cursor-pointer shadow-xs ${
                          isItemPlaying
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                      >
                        {isItemPlaying ? (
                          <>
                            <Pause className="w-3 h-3 fill-white" />
                            <span>रोकें</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-white ml-0.5" />
                            <span>चलाएं</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
