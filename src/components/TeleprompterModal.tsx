import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, FlipHorizontal, Type, Volume2, Maximize, Minimize } from 'lucide-react';
import { getCleanLocutionText, calculatePacing } from '../utils/parser';

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptText: string;
  title: string;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  isOpen,
  onClose,
  scriptText,
  title,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 1 to 10
  const [fontSize, setFontSize] = useState(32); // in px
  const [isMirrored, setIsMirrored] = useState(false);
  const [stripCues, setStripCues] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanText = stripCues ? getCleanLocutionText(scriptText) : scriptText;
  const pacing = calculatePacing(cleanText);

  // Timer for elapsed reading time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Auto-scrolling logic
  useEffect(() => {
    let animationFrameId: number;
    const scroll = () => {
      if (isPlaying && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += speed * 0.7;
        animationFrameId = requestAnimationFrame(scroll);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(scroll);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, speed]);

  // Reset function
  const handleReset = () => {
    setIsPlaying(false);
    setElapsedSeconds(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Preview TTS voice narration
  const handleTTSPreview = async () => {
    if (isTTSLoading) return;
    setIsTTSLoading(true);

    try {
      // Take first 500 characters of clean script
      const sample = cleanText.slice(0, 500);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sample, voice: 'Kore' }),
      });
      const data = await res.json();

      if (data.audioBase64) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audioRef.current = audio;
        audio.play();
      }
    } catch (err) {
      console.error('Failed to play TTS preview:', err);
    } finally {
      setIsTTSLoading(false);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col text-zinc-100 backdrop-blur-xl">
      {/* Top Floating Teleprompter Control Bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <h2 className="font-cinzel font-bold text-amber-400 text-sm sm:text-base tracking-wide truncate max-w-xs sm:max-w-md">
            TELEPROMPTER: {title || 'Roteiro Documental'}
          </h2>
          <span className="text-xs bg-zinc-950 text-zinc-300 border border-zinc-800 font-mono px-2 py-0.5 rounded">
            {formatTime(elapsedSeconds)} / {pacing.readingTime}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> PAUSAR (Espaço)
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> INICIAR GRAVAÇÃO
              </>
            )}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            title="Reiniciar posição e cronômetro"
            className="p-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed slider */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs">
            <span className="text-zinc-400">Velocidade:</span>
            <input
              type="range"
              min="0.5"
              max="6"
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-20 accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-amber-400 w-6 text-center">{speed}x</span>
          </div>

          {/* Font size */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-xs">
            <Type className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
            <button
              onClick={() => setFontSize((f) => Math.max(20, f - 4))}
              className="px-2 py-0.5 rounded hover:bg-zinc-800 text-zinc-300 cursor-pointer"
            >
              A-
            </button>
            <span className="font-mono text-[11px] text-zinc-400">{fontSize}px</span>
            <button
              onClick={() => setFontSize((f) => Math.min(64, f + 4))}
              className="px-2 py-0.5 rounded hover:bg-zinc-800 text-zinc-300 cursor-pointer"
            >
              A+
            </button>
          </div>

          {/* Mirror Flip Toggle */}
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            title="Espelhar horizontalmente para vidros reflexivos"
            className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              isMirrored ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Espelho</span>
          </button>

          {/* Toggle cues */}
          <button
            onClick={() => setStripCues(!stripCues)}
            title="Ocultar indicações [CLIP REAL], [MAPA] etc."
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              stripCues ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' : 'bg-zinc-950 border border-zinc-800 text-zinc-400'
            }`}
          >
            {stripCues ? 'Sem Tags Visuais' : 'Com Tags'}
          </button>

          {/* TTS Preview */}
          <button
            onClick={handleTTSPreview}
            disabled={isTTSLoading}
            title="Ouvir amostra de narração de voz com IA"
            className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-amber-500 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Volume2 className={`w-4 h-4 ${isTTSLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition-colors ml-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prompter Visual Guide Center Line */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-between px-6 opacity-30">
        <div className="h-[2px] w-12 bg-amber-500 rounded-full" />
        <div className="h-[1px] flex-1 bg-amber-500/20 mx-4" />
        <div className="h-[2px] w-12 bg-amber-500 rounded-full" />
      </div>

      {/* Teleprompter Scroll Content */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto px-8 sm:px-24 md:px-44 py-40 select-none teleprompter-content ${
          isMirrored ? 'scale-x-[-1]' : ''
        }`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="max-w-4xl mx-auto space-y-12 font-medium leading-[1.65] text-zinc-100 tracking-wide">
          {cleanText.split(/\n\n+/).map((para, i) => (
            <p key={i} className="hover:text-amber-300 transition-colors cursor-pointer">
              {para}
            </p>
          ))}
          <div className="h-96 flex items-center justify-center text-zinc-600 text-sm font-mono uppercase tracking-widest">
            — Fim da Narração Documental —
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-zinc-950 border-t border-zinc-800 px-6 py-2.5 flex items-center justify-between text-xs text-zinc-500 font-mono">
        <div>Atalho: Barra de Espaço para pausar/retomar</div>
        <div className="flex items-center gap-4">
          <span>{pacing.words} palavras</span>
          <span>Ritmo médio: 140 ppm</span>
          <span>Tempo decorrido: {formatTime(elapsedSeconds)}</span>
        </div>
      </div>
    </div>
  );
};
