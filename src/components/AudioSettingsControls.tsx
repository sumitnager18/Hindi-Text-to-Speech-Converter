import React from 'react';
import { Gauge, Music2, RotateCcw, Volume2, Sparkles } from 'lucide-react';

interface AudioSettingsControlsProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  pitch: number; // in semitones (-12 to +12)
  onPitchChange: (pitch: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  bassBoost: boolean;
  onToggleBassBoost: () => void;
  trebleBoost: boolean;
  onToggleTrebleBoost: () => void;
  onReset: () => void;
}

const SPEED_PRESETS = [
  { label: '0.75x', value: 0.75, name: 'धीमी' },
  { label: '1.0x', value: 1.0, name: 'सामान्य' },
  { label: '1.25x', value: 1.25, name: 'मध्यम तेज' },
  { label: '1.5x', value: 1.5, name: 'तेज' },
  { label: '1.75x', value: 1.75, name: 'अति तेज' },
];

const PITCH_PRESETS = [
  { label: '-4st', value: -4, name: 'गहरा / भारी' },
  { label: '-2st', value: -2, name: 'हल्का गहरा' },
  { label: '0st', value: 0, name: 'प्राकृतिक' },
  { label: '+2st', value: 2, name: 'हल्का तीखा' },
  { label: '+4st', value: 4, name: 'तीखा / पतला' },
];

export const AudioSettingsControls: React.FC<AudioSettingsControlsProps> = ({
  speed,
  onSpeedChange,
  pitch,
  onPitchChange,
  volume,
  onVolumeChange,
  bassBoost,
  onToggleBassBoost,
  trebleBoost,
  onToggleTrebleBoost,
  onReset,
}) => {
  const isCustomized = speed !== 1.0 || pitch !== 0 || bassBoost || trebleBoost;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider font-hindi-sans">
            ३. ध्वनि नियंत्रण (Speed & Pitch Settings)
          </h2>
        </div>

        {isCustomized && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-700 font-medium transition-colors cursor-pointer"
            title="डिफ़ॉल्ट सेटिंग्स रीसेट करें"
          >
            <RotateCcw className="w-3 h-3" />
            <span>रीसेट करें</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speed Control */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-stone-700" />
              <span className="text-xs font-bold text-stone-800 font-hindi-sans">
                गति (Playback Speed / Tempo)
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-stone-200 text-amber-800">
              {speed.toFixed(2)}x
            </span>
          </div>

          {/* Slider */}
          <input
            id="speed-slider"
            type="range"
            min={0.5}
            max={2.0}
            step={0.05}
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />

          <div className="flex justify-between text-[10px] text-stone-400 mt-1 mb-2.5">
            <span>0.5x (धीमी)</span>
            <span>1.0x (सामान्य)</span>
            <span>2.0x (तेज)</span>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {SPEED_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => onSpeedChange(p.value)}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                  Math.abs(speed - p.value) < 0.01
                    ? 'bg-amber-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pitch Control */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5 text-stone-700" />
              <span className="text-xs font-bold text-stone-800 font-hindi-sans">
                सुर / तारत्व (Vocal Pitch / Detune)
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-stone-200 text-amber-800">
              {pitch > 0 ? `+${pitch}` : pitch} semitones
            </span>
          </div>

          {/* Slider */}
          <input
            id="pitch-slider"
            type="range"
            min={-12}
            max={12}
            step={1}
            value={pitch}
            onChange={(e) => onPitchChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />

          <div className="flex justify-between text-[10px] text-stone-400 mt-1 mb-2.5">
            <span>-12st (गंभीर)</span>
            <span>0st (मूल)</span>
            <span>+12st (तीखा)</span>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PITCH_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => onPitchChange(p.value)}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                  pitch === p.value
                    ? 'bg-amber-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {p.name} ({p.label})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tone enhancements & Volume */}
      <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-600 font-hindi-sans mr-1">
            ध्वनि संवर्धन (Tone):
          </span>
          <button
            type="button"
            onClick={onToggleBassBoost}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              bassBoost
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>भारी स्वर (Warm Bass)</span>
          </button>

          <button
            type="button"
            onClick={onToggleTrebleBoost}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              trebleBoost
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>स्पष्टता (Voice Clarity)</span>
          </button>
        </div>

        {/* Master Volume */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <Volume2 className="w-3.5 h-3.5 text-stone-500" />
          <input
            id="volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 sm:w-24 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
            title={`ध्वनि स्तर: ${Math.round(volume * 100)}%`}
          />
          <span className="text-[11px] font-mono text-stone-500 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
