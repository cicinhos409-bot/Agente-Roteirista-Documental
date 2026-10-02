import React from 'react';
import { Film, Video, MapPin, FileText, Archive, MessageSquareQuote, BarChart3, Search } from 'lucide-react';

interface AudioVisualBadgeProps {
  cueText: string;
}

export const AudioVisualBadge: React.FC<AudioVisualBadgeProps> = ({ cueText }) => {
  const upper = cueText.toUpperCase();

  let Icon = Film;
  let bgClass = 'bg-zinc-900 border-zinc-700 text-zinc-300';
  let label = 'B-ROLL';

  if (upper.includes('CLIP REAL')) {
    Icon = Video;
    bgClass = 'bg-red-500/15 border-red-500/50 text-red-400 shadow-sm shadow-red-950/50';
    label = 'CLIP REAL';
  } else if (upper.includes('MAPA')) {
    Icon = MapPin;
    bgClass = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400';
    label = 'MAPA GEOGRÁFICO';
  } else if (upper.includes('DOCUMENTO')) {
    Icon = FileText;
    bgClass = 'bg-violet-500/15 border-violet-500/50 text-violet-400';
    label = 'DOCUMENTO NA TELA';
  } else if (upper.includes('ARQUIVO')) {
    Icon = Archive;
    bgClass = 'bg-amber-500/15 border-amber-500/50 text-amber-400';
    label = 'IMAGEM DE ARQUIVO';
  } else if (upper.includes('DECLARAÇÃO')) {
    Icon = MessageSquareQuote;
    bgClass = 'bg-violet-500/15 border-violet-400/50 text-violet-300';
    label = 'DECLARAÇÃO / ASPAS';
  } else if (upper.includes('GRÁFICO')) {
    Icon = BarChart3;
    bgClass = 'bg-amber-500/15 border-amber-400/50 text-amber-300';
    label = 'GRÁFICO / DADOS';
  } else if (upper.includes('BUSCAR')) {
    Icon = Search;
    bgClass = 'bg-zinc-900 border-amber-500/50 text-amber-400 border-dashed';
    label = 'SUGESTÃO DE ACERVO';
  }

  // Extract description if present
  const desc = cueText
    .replace(/^\[(CLIP REAL|B-ROLL|MAPA|DOCUMENTO NA TELA|IMAGEM DE ARQUIVO|DECLARAÇÃO|GRÁFICO|BUSCAR IMAGENS\/ARQUIVO)[^—\-:]*[—\-:]?\s*/i, '')
    .replace(/\]$/, '')
    .trim();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border my-1 mr-1.5 align-middle select-none transition-all hover:scale-102 ${bgClass}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="font-semibold tracking-wide uppercase opacity-95">{label}</span>
      {desc && desc !== label && (
        <span className="text-zinc-200 font-sans text-xs border-l border-zinc-700 pl-1.5 ml-0.5 normal-case font-normal">
          {desc}
        </span>
      )}
    </span>
  );
};

/**
 * Helper to render formatted script paragraphs with embedded audio-visual badge chips
 */
export const FormattedScriptText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="space-y-4 text-zinc-200 leading-relaxed font-normal text-base">
      {text.split(/\n\n+/).map((para, pIndex) => {
        // Skip markdown headings if present
        if (para.startsWith('#')) {
          return (
            <h4 key={pIndex} className="text-amber-400 font-cinzel text-lg font-bold tracking-wide mt-6 mb-2 border-b border-zinc-800 pb-1">
              {para.replace(/^#+\s*/, '')}
            </h4>
          );
        }

        const paraParts = para.split(/(\[[^\]]+\])/g);

        return (
          <p key={pIndex} className="relative group p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <span className="absolute -left-2 top-3 w-1 h-5 bg-amber-500/40 rounded-full group-hover:bg-amber-400 group-hover:h-8 transition-all" />
            {paraParts.map((part, index) => {
              if (part.startsWith('[') && part.endsWith(']')) {
                return <AudioVisualBadge key={index} cueText={part} />;
              }
              return <span key={index}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};
