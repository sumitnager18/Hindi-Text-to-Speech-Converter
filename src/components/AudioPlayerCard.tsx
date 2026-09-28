import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Check,
  Volume2,
  Repeat,
  Sparkles,
  Heart,
  Bookmark,
  Share2,
} from 'lucide-react';
import { AudioEngine } from '../lib/audioEngine';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';
import { GeneratedAudioItem } from '../types';

interface AudioPlayerCardProps {
  item: GeneratedAudioItem;
  audioEngine: AudioEngine | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  speed: number;
  pitch: number;
  onDownload: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({
  item,
  audioEngine,
  isPlaying,
  currentTime,
  duration,
  progress,
  onTogglePlay,
  onSeek,
  isLooping,
  onToggleLoop,
  speed,
  pitch,
  onDownload,
  onToggleFavorite,
  isFavorite,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const targetSeconds = val * duration;
    onSeek(targetSeconds);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-300/80 p-5 sm:p-6 shadow-lg shadow-amber-900/5 relative overflow-hidden">
      {/* Decorative gradient top edge */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

      {/* Header with audio metadata tags */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
            <Volume2 className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-stone-900 font-hindi-sans">
                स्वर: {item.voice}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-medium">
                {item.emotion}
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              कुल अवधि: {duration > 0 ? `${duration.toFixed(1)}s` : 'लोड हो रहा है...'} • गति: {speed.toFixed(2)}x • सुर: {pitch > 0 ? `+${pitch}` : pitch}st
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
              title={isFavorite ? 'पसंदीदा से हटाएं' : 'पसंदीदा में जोड़ें'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyText}
            className="p-2 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
            title="हिंदी टेक्स्ट कॉपी करें"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors text-xs font-semibold shadow-xs cursor-pointer"
            title="WAV ऑडियो फाइल डाउनलोड करें"
          >
            <Download className="w-3.5 h-3.5" />
            <span>डाउनलोड WAV</span>
          </button>
        </div>
      </div>

      {/* Generated text quote box */}
      <div className="p-3.5 rounded-xl bg-stone-50/90 border border-stone-200/80 mb-4">
        <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-hindi-sans italic">
          "{item.text}"
        </p>
      </div>

      {/* Visualizer Canvas */}
      <div className="mb-4">
        <AudioVisualizerCanvas audioEngine={audioEngine} isPlaying={isPlaying} />
      </div>

      {/* Progress & Scrubber Bar */}
      <div className="space-y-1 mb-4">
        <div className="relative flex items-center">
          <input
            id="audio-progress-scrubber"
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress || 0}
            onChange={handleSeekChange}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
        </div>

        <div className="flex justify-between text-xs font-mono text-stone-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Loop toggle */}
          <button
            type="button"
            onClick={onToggleLoop}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isLooping
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
            }`}
            title={isLooping ? 'लूप सक्रिय (Looping On)' : 'लूप चालू करें'}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Replay button */}
          <button
            type="button"
            onClick={() => onSeek(0)}
            className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
            title="शुरुआत से बजाएं"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Big Main Play/Pause Button */}
        <div className="flex items-center gap-3">
          <button
            id="btn-play-pause-main"
            type="button"
            onClick={onTogglePlay}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-gradient-to-br from-rose-600 to-orange-600 shadow-orange-500/30 ring-4 ring-orange-200'
                : 'bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 hover:scale-105 shadow-orange-500/30'
            }`}
            title={isPlaying ? 'रोकें (Pause)' : 'चलाएं (Play)'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Live settings pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-stone-700 font-mono">
            {speed.toFixed(2)}x
          </span>
          <span className="px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-stone-700 font-mono">
            {pitch > 0 ? `+${pitch}` : pitch}st
          </span>
        </div>
      </div>
    </div>
  );
};
