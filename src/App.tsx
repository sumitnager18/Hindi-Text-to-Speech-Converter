import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TextInputCard } from './components/TextInputCard';
import { VoiceEmotionSelector } from './components/VoiceEmotionSelector';
import { AudioSettingsControls } from './components/AudioSettingsControls';
import { AudioPlayerCard } from './components/AudioPlayerCard';
import { SampleTextModal } from './components/SampleTextModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AudioEngine } from './lib/audioEngine';
import { GeneratedAudioItem, SampleTextSnippet, TTSResponseData } from './types';
import { AlertCircle, Sparkles, Volume2, Info } from 'lucide-react';

const LOCAL_STORAGE_HISTORY_KEY = 'hindi_tts_history_v1';

const DEFAULT_HINDI_TEXT =
  'नमस्ते! वाणी AI में आपका स्वागत है। यहाँ आप किसी भी हिंदी पाठ को अत्यंत स्वाभाविक, स्पष्ट और भावनात्मक आवाज़ में बदल सकते हैं।';

export default function App() {
  // Input State
  const [text, setText] = useState<string>(DEFAULT_HINDI_TEXT);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('natural');
  const [customEmotionPrompt, setCustomEmotionPrompt] = useState<string>('');

  // Audio Tuning Settings
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(0); // semitones (-12 to +12)
  const [volume, setVolume] = useState<number>(1.0);
  const [bassBoost, setBassBoost] = useState<boolean>(false);
  const [trebleBoost, setTrebleBoost] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);

  // Playback & UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudioItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Modals & Drawers
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);

  // Saved History
  const [history, setHistory] = useState<GeneratedAudioItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Audio Engine instance
  const audioEngineRef = useRef<AudioEngine | null>(null);

  // Initialize AudioEngine
  useEffect(() => {
    const engine = new AudioEngine();
    audioEngineRef.current = engine;

    engine.onPlayStateChange = (playing) => {
      setIsPlaying(playing);
    };

    engine.onTimeUpdate = (cur, dur, prog) => {
      setCurrentTime(cur);
      setDuration(dur);
      setProgress(prog);
    };

    engine.onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    return () => {
      engine.stop();
    };
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save history to localStorage:', e);
    }
  }, [history]);

  // Sync Speed to AudioEngine
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    audioEngineRef.current?.setSpeed(newSpeed);
  };

  // Sync Pitch to AudioEngine
  const handlePitchChange = (newPitch: number) => {
    setPitch(newPitch);
    audioEngineRef.current?.setPitch(newPitch);
  };

  // Sync Volume to AudioEngine
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngineRef.current?.setVolume(newVol);
  };

  // Sync Looping
  const handleToggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    audioEngineRef.current?.setLoop(next);
  };

  // Sync EQ / Tone Filters
  const handleToggleBassBoost = () => {
    const next = !bassBoost;
    setBassBoost(next);
    audioEngineRef.current?.setToneFilter(next ? 4 : 0, trebleBoost ? 4 : 0);
  };

  const handleToggleTrebleBoost = () => {
    const next = !trebleBoost;
    setTrebleBoost(next);
    audioEngineRef.current?.setToneFilter(bassBoost ? 4 : 0, next ? 4 : 0);
  };

  const handleResetSettings = () => {
    setSpeed(1.0);
    setPitch(0);
    setBassBoost(false);
    setTrebleBoost(false);
    audioEngineRef.current?.setSpeed(1.0);
    audioEngineRef.current?.setPitch(0);
    audioEngineRef.current?.setToneFilter(0, 0);
  };

  // Generate Audio via Server API
  const handleGenerate = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        text: text.trim(),
        voice: selectedVoice,
        emotion: selectedEmotion,
        customEmotionPrompt: customEmotionPrompt.trim(),
        rateStyle: speed < 0.85 ? 'slow' : speed > 1.2 ? 'fast' : 'normal',
        pitchStyle: pitch < -2 ? 'low' : pitch > 2 ? 'high' : 'normal',
      };

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: TTSResponseData = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'आवाज़ तैयार करने में समस्या आई');
      }

      const newItem: GeneratedAudioItem = {
        id: `audio-${Date.now()}`,
        text: data.text,
        voice: data.voice,
        emotion: data.emotion,
        duration: data.duration,
        wavBase64: data.wavBase64,
        pcmBase64: data.pcmBase64,
        timestamp: data.timestamp,
        speed,
        pitch,
        isFavorite: false,
      };

      setCurrentAudio(newItem);
      setHistory((prev) => [newItem, ...prev.slice(0, 29)]); // keep last 30

      // Load into AudioEngine and play
      if (audioEngineRef.current) {
        audioEngineRef.current.setSpeed(speed);
        audioEngineRef.current.setPitch(pitch);
        audioEngineRef.current.setVolume(volume);
        audioEngineRef.current.setLoop(isLooping);
        audioEngineRef.current.setToneFilter(bassBoost ? 4 : 0, trebleBoost ? 4 : 0);

        await audioEngineRef.current.loadAudioFromBase64(data.wavBase64);
        audioEngineRef.current.play(0);
      }
    } catch (err: any) {
      console.error('Error generating TTS:', err);
      setError(err?.message || 'सर्वर से कनेक्ट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  // Play/Pause toggle
  const handleTogglePlay = () => {
    audioEngineRef.current?.togglePlay();
  };

  // Seek
  const handleSeek = (targetSec: number) => {
    audioEngineRef.current?.seek(targetSec);
  };

  // Load and play item from history
  const handlePlayHistoryItem = async (item: GeneratedAudioItem) => {
    setCurrentAudio(item);
    if (audioEngineRef.current) {
      audioEngineRef.current.setSpeed(speed);
      audioEngineRef.current.setPitch(pitch);
      audioEngineRef.current.setVolume(volume);
      audioEngineRef.current.setLoop(isLooping);
      await audioEngineRef.current.loadAudioFromBase64(item.wavBase64);
      audioEngineRef.current.play(0);
    }
  };

  // Download current WAV
  const handleDownloadCurrent = () => {
    if (!currentAudio || !audioEngineRef.current) return;
    const filename = `hindi_speech_${currentAudio.voice}_${Date.now()}.wav`;
    audioEngineRef.current.downloadWav(currentAudio.wavBase64, filename);
  };

  const handleDownloadHistoryItem = (item: GeneratedAudioItem) => {
    if (!audioEngineRef.current) return;
    const filename = `hindi_speech_${item.voice}_${Date.now()}.wav`;
    audioEngineRef.current.downloadWav(item.wavBase64, filename);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((i) => i.id !== id));
    if (currentAudio?.id === id) {
      audioEngineRef.current?.stop();
      setCurrentAudio(null);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('क्या आप सचमुच सभी इतिहास हटाना चाहते हैं?')) {
      setHistory([]);
      audioEngineRef.current?.stop();
      setCurrentAudio(null);
    }
  };

  const handleLoadIntoEditor = (item: GeneratedAudioItem) => {
    setText(item.text);
    setSelectedVoice(item.voice);
    setSelectedEmotion(item.emotion);
  };

  const handleToggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
    );
    if (currentAudio?.id === id) {
      setCurrentAudio((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleSelectSample = (sample: SampleTextSnippet) => {
    setText(sample.hindiText);
    setSelectedVoice(sample.recommendedVoice);
    setSelectedEmotion(sample.recommendedEmotion);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans">
      <Header
        onOpenSamples={() => setIsSampleModalOpen(true)}
        onToggleHistory={() => setIsHistoryDrawerOpen(true)}
        historyCount={history.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm font-hindi-sans">सूचना / त्रुटि (Notice)</h4>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                पुनः प्रयास करें
              </button>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 cursor-pointer px-1 py-1"
              >
                बंद करें
              </button>
            </div>
          </div>
        )}

        {/* Active Audio Player if audio has been generated */}
        {currentAudio && (
          <AudioPlayerCard
            item={currentAudio}
            audioEngine={audioEngineRef.current}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            progress={progress}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            isLooping={isLooping}
            onToggleLoop={handleToggleLoop}
            speed={speed}
            pitch={pitch}
            onDownload={handleDownloadCurrent}
            onToggleFavorite={() => handleToggleFavorite(currentAudio.id)}
            isFavorite={currentAudio.isFavorite}
          />
        )}

        {/* Hindi Text Input Card */}
        <TextInputCard
          text={text}
          onChange={setText}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          onOpenSamples={() => setIsSampleModalOpen(true)}
        />

        {/* Voice and Emotion Selector */}
        <VoiceEmotionSelector
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          selectedEmotion={selectedEmotion}
          onSelectEmotion={setSelectedEmotion}
          customEmotionPrompt={customEmotionPrompt}
          onChangeCustomEmotionPrompt={setCustomEmotionPrompt}
        />

        {/* Audio Tuning: Speed, Pitch & EQ Controls */}
        <AudioSettingsControls
          speed={speed}
          onSpeedChange={handleSpeedChange}
          pitch={pitch}
          onPitchChange={handlePitchChange}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          bassBoost={bassBoost}
          onToggleBassBoost={handleToggleBassBoost}
          trebleBoost={trebleBoost}
          onToggleTrebleBoost={handleToggleTrebleBoost}
          onReset={handleResetSettings}
        />

        {/* Information & Usage Guide Card */}
        <div className="bg-white/60 rounded-2xl border border-stone-200/80 p-5 text-stone-600 text-xs sm:text-sm leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-stone-900 mb-2 font-hindi-sans">
            <Info className="w-4 h-4 text-amber-600" />
            <span>विशेषताएँ एवं सुझाव (Features & Tips)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
              <h5 className="font-bold text-stone-800 font-hindi-sans mb-1">
                🌟 प्राकृतिक उच्चारण व भाव
              </h5>
              <p className="text-xs text-stone-600">
                Gemini 3.1 Flash TTS मॉडल शुद्ध देवनागरी वर्तनी, अनुस्वार और भावुक उतार-चढ़ाव को सहजता से उच्चारित करता है।
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
              <h5 className="font-bold text-stone-800 font-hindi-sans mb-1">
                ⚡ तात्कालिक गति व सुर नियंत्रण
              </h5>
              <p className="text-xs text-stone-600">
                Web Audio इंजन की सहायता से आप आवाज़ की गति (0.5x–2.0x) और सुर (-12 से +12 semitones) वास्तविक समय में बदल सकते हैं।
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
              <h5 className="font-bold text-stone-800 font-hindi-sans mb-1">
                💾 24kHz HD WAV निर्यात
              </h5>
              <p className="text-xs text-stone-600">
                तैयार ऑडियो को सीधे स्टूडियो-क्वालिटी 24000Hz WAV फॉर्मेट में डाउनलोड कर पॉडकास्ट, वीडियो या व्यक्तिगत प्रयोग में लाएं।
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500 bg-white/40">
        <p className="font-hindi-sans">
          वाणी AI — प्राकृतिक और भावनात्मक हिंदी टेक्स्ट-टू-स्पीच परिवर्तक
        </p>
      </footer>

      {/* Sample Texts Modal */}
      <SampleTextModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectSample={handleSelectSample}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        currentPlayingId={currentAudio?.id || null}
        isPlaying={isPlaying}
        onPlayItem={handlePlayHistoryItem}
        onTogglePlay={handleTogglePlay}
        onDownloadItem={handleDownloadHistoryItem}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
        onLoadIntoEditor={handleLoadIntoEditor}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
