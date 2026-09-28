import React, { useRef, useEffect } from 'react';
import { AudioEngine } from '../lib/audioEngine';

interface AudioVisualizerCanvasProps {
  audioEngine: AudioEngine | null;
  isPlaying: boolean;
  colorTheme?: string;
}

export const AudioVisualizerCanvas: React.FC<AudioVisualizerCanvasProps> = ({
  audioEngine,
  isPlaying,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    resizeCanvas();

    const ro = new ResizeObserver(() => {
      resizeCanvas();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const freqData = new Uint8Array(128);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      if (audioEngine && isPlaying) {
        audioEngine.getAnalyserData(freqData);

        // Draw modern smooth audio frequency spectrum bars
        const barCount = 48;
        const barSpacing = 3;
        const totalSpacing = (barCount - 1) * barSpacing;
        const barWidth = Math.max(2, (width - totalSpacing) / barCount);

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, 'rgba(217, 119, 6, 0.2)'); // Amber 600
        gradient.addColorStop(0.6, 'rgba(234, 88, 12, 0.8)'); // Orange 600
        gradient.addColorStop(1, 'rgba(225, 29, 72, 1)'); // Rose 600

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (freqData.length * 0.75));
          const val = freqData[dataIndex] || 0;
          const percent = val / 255;
          const barHeight = Math.max(4, percent * (height - 8));

          const x = i * (barWidth + barSpacing);
          const y = (height - barHeight) / 2;

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2]);
          ctx.fill();
        }
      } else {
        // Idle gentle waveform line
        const barCount = 48;
        const barSpacing = 3;
        const totalSpacing = (barCount - 1) * barSpacing;
        const barWidth = Math.max(2, (width - totalSpacing) / barCount);

        ctx.fillStyle = 'rgba(214, 211, 209, 0.6)'; // Stone 300
        for (let i = 0; i < barCount; i++) {
          const baseHeight = Math.sin((i / barCount) * Math.PI) * 12 + 4;
          const x = i * (barWidth + barSpacing);
          const y = (height - baseHeight) / 2;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, baseHeight, [barWidth / 2]);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioEngine, isPlaying]);

  return (
    <div ref={containerRef} className="w-full h-16 relative overflow-hidden rounded-xl bg-stone-100/70">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
