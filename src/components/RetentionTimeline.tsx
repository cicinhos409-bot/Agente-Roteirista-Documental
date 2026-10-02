import React from 'react';
import { Flame, Eye, Compass, Anchor, ArrowRight, ShieldCheck } from 'lucide-react';

interface RetentionTimelineProps {
  duration: number;
  wordCount: number;
  architecture: string;
  hookType: string;
}

export const RetentionTimeline: React.FC<RetentionTimelineProps> = ({
  duration,
  wordCount,
  architecture,
  hookType,
}) => {
  const stages = [
    {
      label: 'Cold Open & Hook',
      time: '0:00 - 0:45',
      tension: '90%',
      color: 'from-amber-500 to-red-500',
      icon: Flame,
      desc: hookType ? `Hook: ${hookType}` : 'Ruptura imediata e pergunta central.',
    },
    {
      label: 'Loop Macro & Contexto',
      time: `0:45 - ${Math.round(duration * 0.25)}:00`,
      tension: '65%',
      color: 'from-amber-500 to-amber-400',
      icon: Eye,
      desc: 'Fixação da pergunta central e contextualização geográfica/histórica.',
    },
    {
      label: 'Motores de Expansão',
      time: `${Math.round(duration * 0.25)}:00 - ${Math.round(duration * 0.55)}:00`,
      tension: '75%',
      color: 'from-amber-400 to-violet-500',
      icon: Compass,
      desc: 'Aprofundamento vertical, entidades, capacidades e documentos.',
    },
    {
      label: 'Re-Hook & Escalada',
      time: `${Math.round(duration * 0.55)}:00 - ${Math.round(duration * 0.8)}:00`,
      tension: '85%',
      color: 'from-violet-500 to-violet-400',
      icon: Anchor,
      desc: 'Nova evidência, contradição de versões e cadeia de ação-reação.',
    },
    {
      label: 'Clímax & Future Hook',
      time: `${Math.round(duration * 0.8)}:00 - ${duration}:00`,
      tension: '95%',
      color: 'from-violet-400 to-red-500',
      icon: ShieldCheck,
      desc: 'Consequência real, resposta à pergunta central e gatilho do próximo vídeo.',
    },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-zinc-100 font-bold flex items-center gap-2 text-sm sm:text-base font-cinzel">
            <Flame className="w-4 h-4 text-amber-500" />
            Curva de Tensão & Engenharia de Retenção
          </h3>
          <p className="text-xs text-zinc-400">
            Regra 22 (Linha Dupla: Informação + Curiosidade) e Regra 24 (Ondas de Tensão sem Sensacionalismo)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 font-mono">
            {duration} min (~{wordCount} palavras)
          </span>
          <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
            {architecture || 'Arquitetura Documental'}
          </span>
        </div>
      </div>

      {/* Visual Tension Waveform representation */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 mt-2">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={idx}
              className="relative p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-zinc-400 group-hover:text-amber-400 transition-colors">
                    {stage.time}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {stage.tension}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-xs text-zinc-200 mb-1">
                  <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{stage.label}</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                  {stage.desc}
                </p>
              </div>

              {/* Retention bar */}
              <div className="mt-3 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${stage.color}`}
                  style={{ width: stage.tension }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>Ritmo calculado: ~140 palavras/minuto (Cadência Documental Sóbria)</span>
        </div>
        <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
          <span>Retenção não justifica invenção</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};
