import React from 'react';
import {
  Compass,
  HelpCircle,
  Layers,
  Sparkles,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
  Repeat,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { ParsedSections, GroundingSource } from '../types';

interface DossierCardProps {
  parsed: ParsedSections;
  searchSources?: GroundingSource[];
  searchQueries?: string[];
}

export const DossierCard: React.FC<DossierCardProps> = ({
  parsed,
  searchSources = [],
  searchQueries = [],
}) => {
  return (
    <div className="space-y-6">
      {/* Search Grounding Banner */}
      {(searchSources.length > 0 || searchQueries.length > 0) && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-zinc-100">
                Grounding Ativo: Verificação em Tempo Real via Google Search
              </div>
              <div className="text-[11px] text-zinc-400">
                {searchQueries.length > 0 ? `Consultas: ${searchQueries.slice(0, 3).join(' • ')}` : 'Fontes checadas contra registros web atuais.'}
              </div>
            </div>
          </div>
          {searchSources.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {searchSources.slice(0, 4).map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <span className="truncate max-w-[120px]">{src.title || 'Fonte'}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0 text-amber-400" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid: Ângulo, Pergunta Central, Arquitetura, Hook */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. ÂNGULO ESCOLHIDO */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-500 font-bold mb-2">
            <Compass className="w-4 h-4 text-amber-500" />
            1. Ângulo Escolhido
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed font-sans">
            {parsed.angulo || 'Ângulo de investigação jornalística estruturado a partir das evidências factuais coletadas.'}
          </p>
        </div>

        {/* 2. PERGUNTA CENTRAL */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            2. Pergunta Central (Macro Loop)
          </div>
          <p className="text-sm font-semibold text-zinc-100 leading-relaxed font-sans">
            "{parsed.perguntaCentral || 'Qual é a resposta que mantém o espectador até os segundos finais?'}"
          </p>
        </div>

        {/* 3. ARQUITETURA */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-violet-400 font-bold mb-2">
            <Layers className="w-4 h-4 text-violet-400" />
            3. Arquitetura da Narrativa
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed font-sans">
            {parsed.arquitetura || 'Estrutura narrativa selecionada para progressão constante sem repetições.'}
          </p>
        </div>

        {/* 4. HOOK ESCOLHIDO */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-300 font-bold mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            4. Hook Escolhido (Regra 10)
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed font-sans">
            {parsed.hook || 'Ruptura inicial dos primeiros 30 segundos.'}
          </p>
        </div>
      </div>

      {/* 5. FATOS-BASE */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-3">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          5. Fatos-Base Auditados (Regra 5: Fatos Confirmados)
        </div>
        {parsed.fatosBase.length > 0 ? (
          <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
            {parsed.fatosBase.map((fato, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span className="leading-relaxed">{fato}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-400">Fatos confirmados diretamente através de fontes documentais e institucionais.</p>
        )}
      </div>

      {/* 7. FONTES & 8. ALERTAS FACTUAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 7. FONTES */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-violet-400 font-bold mb-3">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            7. Fontes & Órgãos Consultados
          </div>
          {parsed.fontes.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-zinc-300 font-mono">
              {parsed.fontes.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-amber-500">›</span>
                  <span className="truncate">{f}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-400">Documentos oficiais, órgãos públicos, decisões judiciais e agências de notícias.</p>
          )}
        </div>

        {/* 8. ALERTAS FACTUAIS */}
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-red-400 font-bold mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            8. Alertas Factuais & Incertezas (Regra 5 & 33)
          </div>
          {parsed.alertasFactuais.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-zinc-300">
              {parsed.alertasFactuais.map((alerta, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span className="leading-snug">{alerta}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-400">Distinção rigorosa entre suspeitos, réus e condenados; limites de causalidade respeitados.</p>
          )}
        </div>
      </div>

      {/* 9. PRÓXIMO GATILHO */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-2">
          <Repeat className="w-4 h-4 text-amber-500" />
          9. Próximo Gatilho (Loop entre Vídeos - Regra 27)
        </div>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {parsed.proximoGatilho || 'Desdobramentos previstos, novas sessões de julgamento ou dados a monitorar.'}
        </p>
      </div>
    </div>
  );
};
