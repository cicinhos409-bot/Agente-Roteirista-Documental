import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  FileSearch,
  Clock,
  Radio,
  Tv,
  Users,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Copy,
  Youtube,
  Info,
} from 'lucide-react';
import { ScriptRequest } from '../types';
import { PRESET_TOPICS, PresetTopic } from '../data/presets';

interface ScriptInputFormProps {
  onSubmit: (data: ScriptRequest) => void;
  isLoading: boolean;
}

export const ScriptInputForm: React.FC<ScriptInputFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [channelName, setChannelName] = useState('');
  const [sources, setSources] = useState('');
  const [transcripts, setTranscripts] = useState('');
  const [characters, setCharacters] = useState('');
  const [duration, setDuration] = useState<number>(10);
  const [audience, setAudience] = useState('');
  const [sponsor, setSponsor] = useState('');
  const [notes, setNotes] = useState('');
  const [additionalObservations, setAdditionalObservations] = useState('');
  const [onlyScript, setOnlyScript] = useState(false);
  const [architecture, setArchitecture] = useState<ScriptRequest['architecturePreference']>('auto');
  const [hook, setHook] = useState<ScriptRequest['hookPreference']>('auto');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Competitor scripts (up to 3)
  const [competitorScripts, setCompetitorScripts] = useState<string[]>(['', '', '']);
  const [activeCompetitorTab, setActiveCompetitorTab] = useState<number>(0);

  // Apply a preset
  const handleApplyPreset = (preset: PresetTopic) => {
    setTitle(preset.request.title || '');
    setTheme(preset.request.theme || '');
    setDuration(preset.request.duration || 10);
    setAudience(preset.request.audience || '');
    setArchitecture(preset.request.architecturePreference || 'auto');
    setHook(preset.request.hookPreference || 'auto');
    setNotes(preset.request.notes || '');
  };

  const handleCompetitorChange = (index: number, value: string) => {
    setCompetitorScripts((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !theme.trim()) return;

    onSubmit({
      title: title.trim(),
      theme: theme.trim() || undefined,
      channelName: channelName.trim() || undefined,
      competitorScripts: competitorScripts.filter((s) => s.trim().length > 0),
      additionalObservations: additionalObservations.trim() || undefined,
      sources: sources.trim() || undefined,
      transcripts: transcripts.trim() || undefined,
      characters: characters.trim() || undefined,
      duration,
      audience: audience.trim() || undefined,
      sponsor: sponsor.trim() || undefined,
      notes: notes.trim() || undefined,
      onlyScript,
      architecturePreference: architecture,
      hookPreference: hook,
    });
  };

  // Count how many competitors are filled
  const filledCompetitorsCount = competitorScripts.filter((s) => s.trim().length > 0).length;

  // Rule 41 target words display
  const getWordRangeForDuration = (dur: number) => {
    switch (dur) {
      case 5: return '650 – 850 palavras';
      case 8: return '1.000 – 1.300 palavras';
      case 10: return '1.300 – 1.600 palavras';
      case 12: return '1.600 – 1.900 palavras';
      case 15: return '2.000 – 2.400 palavras';
      case 20: return '2.600 – 3.200 palavras';
      default: return '~1.450 palavras';
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-xl">
      {/* Presets Bar */}
      <div className="mb-6 pb-5 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-2.5 text-xs text-zinc-400 font-medium">
          <Bookmark className="w-3.5 h-3.5 text-amber-500" />
          <span>Casos de Estudo & Pautas Prontas (1-Clique):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_TOPICS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-left p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all group cursor-pointer"
            >
              <span className="inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold mb-1">
                {preset.category}
              </span>
              <p className="text-xs text-zinc-300 font-medium line-clamp-1 group-hover:text-amber-300 transition-colors">
                {preset.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row: Title + Channel Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Title Input (2 cols) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-amber-500" />
                TÍTULO OU PAUTA CENTRAL <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] text-zinc-500 normal-case font-sans">
                Comando direto: "TÍTULO: [X]"
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: A Batalha Oculta dos Drones no Mar Negro e o Colapso da Frota Naval"
                className="w-full px-4 py-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm sm:text-base focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Campo 3: Nome do Canal (1 col) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500" />
                NOME DO CANAL
              </span>
              <span className="text-[10px] text-amber-400 font-sans font-normal">
                Para CTAs Personalizadas
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Ex: Dossiê Militar, História Real"
                className="w-full px-4 py-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Duration selection (Rule 41) */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            DURAÇÃO & META DE PALAVRAS (REGRA 41)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[5, 8, 10, 12, 15, 20].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDuration(mins)}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-medium border text-center transition-all cursor-pointer ${
                  duration === mins
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-sm shadow-amber-500/10'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-sm">{mins} MIN</div>
                <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                  {mins === 5 ? '~750 pal.' : mins === 10 ? '~1.450 pal.' : mins === 20 ? '~2.900 pal.' : `~${mins * 140} pal.`}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-1.5 text-xs text-zinc-500 font-mono flex items-center justify-between">
            <span>Intervalo esperado para {duration} min: <strong className="text-zinc-300">{getWordRangeForDuration(duration)}</strong></span>
            <span>Ritmo: 140 palavras/minuto</span>
          </div>
        </div>

        {/* Campo 1: Roteiros de Concorrentes (opcional, até 3) */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Copy className="w-4 h-4 text-amber-500" />
                Roteiros de Concorrentes (Opcional, até 3)
                {filledCompetitorsCount > 0 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                    {filledCompetitorsCount}/3 preenchidos
                  </span>
                )}
              </label>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Cole o roteiro ou a transcrição de vídeos de outros canais. A IA usa só como referência de estrutura e ritmo (não copia).
              </p>
            </div>

            {/* Tab switch for Competitor 1, 2, 3 */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
              {[0, 1, 2].map((idx) => {
                const hasContent = competitorScripts[idx].trim().length > 0;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveCompetitorTab(idx)}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer flex items-center gap-1 ${
                      activeCompetitorTab === idx
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>Concorrente {idx + 1}</span>
                    {hasContent && (
                      <span className={`w-1.5 h-1.5 rounded-full ${activeCompetitorTab === idx ? 'bg-zinc-950' : 'bg-emerald-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={competitorScripts[activeCompetitorTab]}
              onChange={(e) => handleCompetitorChange(activeCompetitorTab, e.target.value)}
              placeholder={`Cole aqui o roteiro ou a transcrição do vídeo do Concorrente ${activeCompetitorTab + 1}... A IA extrai apenas cadência, ganchos e ritmo, mantendo 100% de originalidade conforme a Regra 30.`}
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 resize-none font-sans leading-relaxed"
            />
            {competitorScripts[activeCompetitorTab].length > 0 && (
              <div className="absolute right-3 bottom-3 text-[10px] text-zinc-500 font-mono">
                {competitorScripts[activeCompetitorTab].split(/\s+/).filter(Boolean).length} palavras inseridas
              </div>
            )}
          </div>
        </div>

        {/* Campo 2: Observações Adicionais */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-500" />
            OBSERVAÇÕES ADICIONAIS
            <span className="text-[11px] text-zinc-500 normal-case font-sans">
              (Atores específicos, curiosidades de bastidores, etc.)
            </span>
          </label>
          <textarea
            rows={2}
            value={additionalObservations}
            onChange={(e) => setAdditionalObservations(e.target.value)}
            placeholder="Ex: Focar no depoimento do piloto sobrevivente; destacar o papel da empresa holandesa ASML nos bastidores; mencionar a reunião sigilosa de 2023..."
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
          />
        </div>

        {/* Quick toggles */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Somente Roteiro Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-300 hover:text-white">
            <input
              type="checkbox"
              checked={onlyScript}
              onChange={(e) => setOnlyScript(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-800 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span className="font-medium">Modo "SOMENTE ROTEIRO"</span>
            <span className="text-zinc-500 text-[11px]">(Locução pura sem dossiê analítico)</span>
          </label>

          {/* Toggle Advanced fields */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showAdvanced ? 'Ocultar Parâmetros Complementares' : 'Parâmetros Complementares (Fontes, Patrocínio, Hooks)'}
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Advanced Dossier Inputs Accordion */}
        {showAdvanced && (
          <div className="pt-4 border-t border-zinc-800 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Architecture Selector */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-amber-500" />
                  ARQUITETURA DA NARRATIVA (REGRA 9)
                </label>
                <select
                  value={architecture}
                  onChange={(e) => setArchitecture(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 font-sans"
                >
                  <option value="auto">Automática (O Agente decide após pesquisa)</option>
                  <option value="Evento">Arquitetura A — Evento (Acontecimento central forte)</option>
                  <option value="Personagem/Conflito">Arquitetura B — Personagem/Conflito (Cadeia Ação-Reação)</option>
                  <option value="Tese/Dossiê">Arquitetura C — Tese/Dossiê (Investigação de pergunta maior)</option>
                </select>
              </div>

              {/* Hook Selector */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  BIBLIOTECA DE HOOKS (REGRA 10)
                </label>
                <select
                  value={hook}
                  onChange={(e) => setHook(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 font-sans"
                >
                  <option value="auto">Automático (O mais adequado ao fato)</option>
                  <option value="Histórico">Hook Histórico (Passado extraordinário + atual)</option>
                  <option value="Mistério">Hook de Mistério (Pergunta não respondida)</option>
                  <option value="Visual">Hook Visual (Cena/Vídeo real)</option>
                  <option value="Resultado">Hook de Resultado (Número ou impacto colossal)</option>
                  <option value="Confronto">Hook de Confronto (Discussão ou choque real)</option>
                  <option value="Contradição">Hook de Contradição (Discurso versus fatos)</option>
                  <option value="Personagem Extraordinário">Hook de Personagem Extraordinário</option>
                </select>
              </div>
            </div>

            {/* Fontes e Links */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 flex items-center gap-1">
                <FileSearch className="w-3.5 h-3.5 text-amber-500" />
                FONTES, LINKS OU DOCUMENTOS PRIMÁRIOS (OPCIONAL)
              </label>
              <textarea
                rows={2}
                value={sources}
                onChange={(e) => setSources(e.target.value)}
                placeholder="Insira URLs, comunicados da PF, relatórios do Ministério da Defesa, processos judiciais, agências de notícias..."
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 resize-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personagens */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  PERSONAGENS / ENTIDADES
                </label>
                <input
                  type="text"
                  value={characters}
                  onChange={(e) => setCharacters(e.target.value)}
                  placeholder="Ex: Almirante X, Ministro Y, Comando de Operações Táticas"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Patrocinador / Produto (Rule 35) */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                  PATROCINADOR / PRODUTO (REGRA 35)
                </label>
                <input
                  type="text"
                  value={sponsor}
                  onChange={(e) => setSponsor(e.target.value)}
                  placeholder="Ex: NordVPN, Curso de Geopolítica, Livro X (Transição orgânica)"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Transcrições ou Observações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  TRANSCRIÇÕES / DEPOIMENTOS ORIGINAIS (REGRA 4)
                </label>
                <textarea
                  rows={2}
                  value={transcripts}
                  onChange={(e) => setTranscripts(e.target.value)}
                  placeholder="Declarações literais ou depoimentos para citações exatas com aspas..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  DIRETRIZES EDITORIAIS ESPECÍFICAS
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instruções editoriais, ênfases ou contrapontos a destacar..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Execution Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || (!title.trim() && !theme.trim())}
            className="w-full py-4 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <Search className="w-5 h-5 animate-spin" />
                <span>EXECUTANDO PIPELINE EDITORIAL: PESQUISA & GROUNDING...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="w-5 h-5 text-zinc-950" />
                <span>PESQUISAR, VERIFICAR & PRODUZIR ROTEIRO COMPLETO (42 REGRAS)</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
