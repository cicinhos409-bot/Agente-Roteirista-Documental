/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Film,
  MonitorPlay,
  Share2,
  History,
  ShieldAlert,
  BookOpen,
  Volume2,
  Copy,
  Check,
} from 'lucide-react';
import { ScriptRequest, ScriptResponse, ParsedSections, HistoryItem, GroundingSource } from './types';
import { parseScriptResponse, calculatePacing, extractVisualCues } from './utils/parser';
import { ScriptInputForm } from './components/ScriptInputForm';
import { FormattedScriptText } from './components/AudioVisualBadges';
import { RetentionTimeline } from './components/RetentionTimeline';
import { DossierCard } from './components/DossierCard';
import { TeleprompterModal } from './components/TeleprompterModal';
import { ExportModal } from './components/ExportModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AuditPanel } from './components/AuditPanel';

export default function App() {
  const [currentRequest, setCurrentRequest] = useState<ScriptRequest | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [parsedSections, setParsedSections] = useState<ParsedSections | null>(null);
  const [searchSources, setSearchSources] = useState<GroundingSource[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'roteiro' | 'dossie' | 'auditoria'>('roteiro');
  const [scriptFilter, setScriptFilter] = useState<'all' | 'locution'>('all');

  // Modals state
  const [isPrompterOpen, setIsPrompterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);

  // Local storage history
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('documentary_scripts_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history on change
  useEffect(() => {
    try {
      localStorage.setItem('documentary_scripts_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Handle Form Submit
  const handleGenerateScript = async (request: ScriptRequest) => {
    setIsLoading(true);
    setError(null);
    setCurrentRequest(request);

    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data: ScriptResponse = await res.json();
      if (!res.ok) {
        throw new Error((data as any).error || 'Falha ao gerar roteiro.');
      }

      const text = data.content || '';
      setRawResponse(text);
      const parsed = parseScriptResponse(text);
      setParsedSections(parsed);
      setSearchSources(data.searchSources || []);
      setSearchQueries(data.searchQueries || []);

      // Auto switch to script view
      setActiveTab('roteiro');

      // Add to history
      const pacing = calculatePacing(parsed.roteiroCompleto);
      const newHistoryItem: HistoryItem = {
        id: `script-${Date.now()}`,
        title: request.title,
        theme: request.theme,
        duration: request.duration,
        wordCount: pacing.words,
        createdAt: new Date().toISOString(),
        content: text,
        searchSources: data.searchSources,
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado na geração do roteiro.');
    } finally {
      setIsLoading(false);
    }
  };

  // Select script from history
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setRawResponse(item.content);
    const parsed = parseScriptResponse(item.content);
    setParsedSections(parsed);
    setSearchSources(item.searchSources || []);
    setCurrentRequest({
      title: item.title,
      theme: item.theme,
      duration: item.duration,
    });
    setActiveTab('roteiro');
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  // Copy full script
  const handleCopyScript = () => {
    if (!parsedSections) return;
    navigator.clipboard.writeText(parsedSections.roteiroCompleto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Audio preview TTS
  const handlePlayTTS = async () => {
    if (!parsedSections || isTTSPlaying) return;
    setIsTTSPlaying(true);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: parsedSections.roteiroCompleto.slice(0, 600),
          voice: 'Kore',
        }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => setIsTTSPlaying(false);
        audio.onerror = () => setIsTTSPlaying(false);
        audio.play();
      } else {
        setIsTTSPlaying(false);
      }
    } catch {
      setIsTTSPlaying(false);
    }
  };

  const pacing = parsedSections ? calculatePacing(parsedSections.roteiroCompleto) : { words: 0, readingTime: '0m', chars: 0 };
  const visualCues = parsedSections ? extractVisualCues(parsedSections.roteiroCompleto) : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 border-b border-zinc-800 backdrop-blur-xl px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 font-cinzel font-black text-lg shadow-lg shadow-amber-500/20">
              RD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel font-black text-sm sm:text-base tracking-wider text-zinc-100 uppercase">
                  Agente Roteirista Documental
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  42 REGRAS DE ALTA RETENÇÃO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans hidden sm:block">
                Jornalismo Investigativo • Geopolítica • Militar • Policial • YouTube Doc
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Histórico</span>
              {history.length > 0 && (
                <span className="text-[10px] bg-zinc-800 text-amber-400 px-1 rounded-full font-mono">
                  {history.length}
                </span>
              )}
            </button>

            {parsedSections && (
              <>
                <button
                  onClick={() => setIsPrompterOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-400 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <MonitorPlay className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Teleprompter</span>
                </button>

                <button
                  onClick={() => setIsExportOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exportar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-8">
        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/50 text-red-400 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-xs underline hover:text-white cursor-pointer">
              Dispensar
            </button>
          </div>
        )}

        {/* Input Form Section */}
        <section>
          <ScriptInputForm onSubmit={handleGenerateScript} isLoading={isLoading} />
        </section>

        {/* When a script is loaded or generated */}
        {parsedSections && (
          <section className="space-y-6 animate-in fade-in duration-300">
            {/* Dossier Header Metrics Bar */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Mini-Documentário Jornalístico
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-bold font-cinzel text-zinc-100 max-w-2xl">
                  {currentRequest?.title || 'Roteiro de Alta Retenção'}
                </h2>
              </div>

              {/* Metrics Pill Grid */}
              <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
                <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
                  <span className="text-zinc-500 block text-[10px] uppercase">Contagem Real</span>
                  <span className="font-bold text-amber-400">{pacing.words} palavras</span>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
                  <span className="text-zinc-500 block text-[10px] uppercase">Duração Locução</span>
                  <span className="font-bold text-emerald-400">{pacing.readingTime}</span>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
                  <span className="text-zinc-500 block text-[10px] uppercase">Plano Audiovisual</span>
                  <span className="font-bold text-violet-400">{visualCues.length} Cues ([CLIP]/[MAPA])</span>
                </div>

                <button
                  onClick={() => setIsPrompterOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <MonitorPlay className="w-4 h-4" />
                  Gravar no Prompter
                </button>
              </div>
            </div>

            {/* Retention Timeline Visual Waveform */}
            <RetentionTimeline
              duration={currentRequest?.duration || 10}
              wordCount={pacing.words}
              architecture={parsedSections.arquitetura}
              hookType={parsedSections.hook}
            />

            {/* Studio Navigation Tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-900 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab('roteiro')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'roteiro'
                    ? 'bg-zinc-950 text-amber-400 shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Film className="w-4 h-4 text-amber-500" />
                Roteiro & Produção Audiovisual
              </button>

              <button
                onClick={() => setActiveTab('dossie')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'dossie'
                    ? 'bg-zinc-950 text-amber-400 shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BookOpen className="w-4 h-4 text-violet-400" />
                Dossiê Editorial (9 Seções)
              </button>

              <button
                onClick={() => setActiveTab('auditoria')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'auditoria'
                    ? 'bg-zinc-950 text-amber-400 shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Auditoria 15 Regras (Regra 38)
              </button>
            </div>

            {/* Tab 1: ROTEIRO & PRODUÇÃO */}
            {activeTab === 'roteiro' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
                {/* Script Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-mono">Visualização:</span>
                    <button
                      onClick={() => setScriptFilter('all')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                        scriptFilter === 'all'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      Completo (Narração + Tags Visuais)
                    </button>
                    <button
                      onClick={() => setScriptFilter('locution')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                        scriptFilter === 'locution'
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                          : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      Apenas Locução
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePlayTTS}
                      disabled={isTTSPlaying}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-amber-400 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isTTSPlaying ? 'animate-bounce' : ''}`} />
                      {isTTSPlaying ? 'Reproduzindo voz...' : 'Ouvir Tom de Locução (TTS)'}
                    </button>

                    <button
                      onClick={handleCopyScript}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copiar Roteiro
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Formatted Script Body */}
                <div className="max-w-4xl mx-auto">
                  <FormattedScriptText text={parsedSections.roteiroCompleto} />
                </div>
              </div>
            )}

            {/* Tab 2: DOSSIÊ EDITORIAL (9 SEÇÕES) */}
            {activeTab === 'dossie' && (
              <DossierCard
                parsed={parsedSections}
                searchSources={searchSources}
                searchQueries={searchQueries}
              />
            )}

            {/* Tab 3: AUDITORIA DAS 15 REGRAS */}
            {activeTab === 'auditoria' && (
              <AuditPanel
                scriptText={parsedSections.roteiroCompleto}
                duration={currentRequest?.duration || 10}
              />
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-6 px-6 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Agente Roteirista Jornalístico Documental de Alta Retenção</span>
          <span className="text-zinc-600">Princípio Fundamental: "Retenção Não Justifica Invenção"</span>
          <span>Pesquisa → Fatos → Relações → Pergunta Central → Roteiro</span>
        </div>
      </footer>

      {/* Teleprompter Modal */}
      {parsedSections && (
        <TeleprompterModal
          isOpen={isPrompterOpen}
          onClose={() => setIsPrompterOpen(false)}
          scriptText={parsedSections.roteiroCompleto}
          title={currentRequest?.title || 'Roteiro Documental'}
        />
      )}

      {/* Export Modal */}
      {parsedSections && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          title={currentRequest?.title || 'Documentário Investigativo'}
          parsed={parsedSections}
          channelName={currentRequest?.channelName}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onSelect={handleSelectHistoryItem}
        onClear={handleClearHistory}
      />
    </div>
  );
}
