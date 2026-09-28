/**
 * Web Audio Engine for Real-Time Hindi TTS Playback with Speed, Pitch, and Tone Controls
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;

  private isPlaying: boolean = false;
  private startTime: number = 0;
  private pauseOffset: number = 0;
  private playbackRate: number = 1.0;
  private pitchDetune: number = 0; // cents (-1200 to +1200)
  private volume: number = 1.0;
  private isLooping: boolean = false;

  private animationFrameId: number | null = null;

  // Callbacks
  public onPlayStateChange?: (isPlaying: boolean) => void;
  public onTimeUpdate?: (currentTime: number, duration: number, progress: number) => void;
  public onEnded?: () => void;

  constructor() {
    // Lazy AudioContext creation on first interaction
  }

  private initContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public async loadAudioFromBase64(base64Wav: string): Promise<AudioBuffer> {
    this.stop();
    const ctx = this.initContext();

    const binaryString = atob(base64Wav);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // decodeAudioData consumes the arrayBuffer, so we pass a slice/copy
    const bufferCopy = bytes.buffer.slice(0);
    const decoded = await ctx.decodeAudioData(bufferCopy);
    this.audioBuffer = decoded;
    this.pauseOffset = 0;
    return decoded;
  }

  public play(offsetSeconds?: number) {
    if (!this.audioBuffer) return;
    const ctx = this.initContext();

    // If already playing, stop previous source
    if (this.sourceNode) {
      try {
        this.sourceNode.onended = null;
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch (e) {
        // ignore
      }
    }

    // Setup nodes
    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);

    this.analyserNode = ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    this.bassFilter = ctx.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 320;
    this.bassFilter.gain.value = 0;

    this.trebleFilter = ctx.createBiquadFilter();
    this.trebleFilter.type = 'highshelf';
    this.trebleFilter.frequency.value = 3200;
    this.trebleFilter.gain.value = 0;

    this.sourceNode = ctx.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.playbackRate.value = this.playbackRate;
    this.sourceNode.detune.value = this.pitchDetune;
    this.sourceNode.loop = this.isLooping;

    // Connect graph: Source -> Bass -> Treble -> Gain -> Analyser -> Destination
    this.sourceNode.connect(this.bassFilter);
    this.bassFilter.connect(this.trebleFilter);
    this.trebleFilter.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(ctx.destination);

    const startOffset = typeof offsetSeconds === 'number' ? offsetSeconds : this.pauseOffset;
    const boundedOffset = Math.max(0, Math.min(startOffset, this.audioBuffer.duration));

    this.startTime = ctx.currentTime - (boundedOffset / this.playbackRate);
    this.sourceNode.start(0, boundedOffset);
    this.isPlaying = true;
    this.onPlayStateChange?.(true);

    this.sourceNode.onended = () => {
      // Check if ended naturally (not from manual pause or seek)
      if (this.isPlaying && !this.isLooping) {
        this.isPlaying = false;
        this.pauseOffset = 0;
        this.onPlayStateChange?.(false);
        this.onEnded?.();
        this.stopTracking();
      }
    };

    this.startTracking();
  }

  public pause() {
    if (!this.isPlaying || !this.ctx) return;
    this.pauseOffset = this.getCurrentTime();
    if (this.sourceNode) {
      try {
        this.sourceNode.onended = null;
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.sourceNode = null;
    }
    this.isPlaying = false;
    this.onPlayStateChange?.(false);
    this.stopTracking();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    const duration = this.getDuration();
    const clamped = Math.max(0, Math.min(seconds, duration));
    this.pauseOffset = clamped;

    if (this.isPlaying) {
      this.play(clamped);
    } else {
      this.onTimeUpdate?.(clamped, duration, duration > 0 ? clamped / duration : 0);
    }
  }

  public stop() {
    if (this.sourceNode) {
      try {
        this.sourceNode.onended = null;
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.sourceNode = null;
    }
    this.isPlaying = false;
    this.pauseOffset = 0;
    this.onPlayStateChange?.(false);
    this.stopTracking();
    if (this.audioBuffer) {
      this.onTimeUpdate?.(0, this.audioBuffer.duration, 0);
    }
  }

  public setSpeed(rate: number) {
    this.playbackRate = Math.max(0.25, Math.min(rate, 3.0));
    if (this.sourceNode && this.ctx) {
      this.sourceNode.playbackRate.setValueAtTime(this.playbackRate, this.ctx.currentTime);
      // Adjust startTime to prevent audio jumping when speed changes mid-playback
      const currentPos = this.getCurrentTime();
      this.startTime = this.ctx.currentTime - (currentPos / this.playbackRate);
    }
  }

  public setPitch(semitones: number) {
    // 1 semitone = 100 cents
    this.pitchDetune = semitones * 100;
    if (this.sourceNode && this.ctx) {
      this.sourceNode.detune.setValueAtTime(this.pitchDetune, this.ctx.currentTime);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(vol, 1.0));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public setLoop(loop: boolean) {
    this.isLooping = loop;
    if (this.sourceNode) {
      this.sourceNode.loop = loop;
    }
  }

  public setToneFilter(bassGain: number, trebleGain: number) {
    if (this.ctx) {
      if (this.bassFilter) {
        this.bassFilter.gain.setValueAtTime(bassGain, this.ctx.currentTime);
      }
      if (this.trebleFilter) {
        this.trebleFilter.gain.setValueAtTime(trebleGain, this.ctx.currentTime);
      }
    }
  }

  public getCurrentTime(): number {
    if (!this.audioBuffer) return 0;
    if (!this.isPlaying || !this.ctx) {
      return this.pauseOffset;
    }
    const elapsed = (this.ctx.currentTime - this.startTime) * this.playbackRate;
    const duration = this.audioBuffer.duration;
    if (this.isLooping && duration > 0) {
      return elapsed % duration;
    }
    return Math.min(elapsed, duration);
  }

  public getDuration(): number {
    return this.audioBuffer ? this.audioBuffer.duration : 0;
  }

  public getAnalyserData(dataArray: Uint8Array): void {
    if (this.analyserNode && this.isPlaying) {
      this.analyserNode.getByteFrequencyData(dataArray);
    } else {
      dataArray.fill(0);
    }
  }

  public getWaveformData(dataArray: Uint8Array): void {
    if (this.analyserNode && this.isPlaying) {
      this.analyserNode.getByteTimeDomainData(dataArray);
    } else {
      dataArray.fill(128); // 128 is center in 8-bit time domain
    }
  }

  private startTracking() {
    this.stopTracking();
    const update = () => {
      if (this.isPlaying && this.audioBuffer) {
        const cur = this.getCurrentTime();
        const dur = this.audioBuffer.duration;
        const prog = dur > 0 ? cur / dur : 0;
        this.onTimeUpdate?.(cur, dur, prog);
        this.animationFrameId = requestAnimationFrame(update);
      }
    };
    this.animationFrameId = requestAnimationFrame(update);
  }

  private stopTracking() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public downloadWav(base64Wav: string, filename: string = 'hindi_speech.wav') {
    const binaryString = atob(base64Wav);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
