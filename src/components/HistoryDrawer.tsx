import React from 'react';
import { History, X, Trash2, Clock, FileText, ArrowRight } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex justify-end backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            <h3 className="font-cinzel font-bold text-zinc-100 text-base">
              Histórico de Roteiros
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-sm">
              Nenhum roteiro salvo no histórico ainda.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-zinc-200 text-sm group-hover:text-amber-400 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 shrink-0 mt-1 transition-transform group-hover:translate-x-1" />
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" /> {item.duration}m
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-zinc-500" /> {item.wordCount} palavras
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-zinc-500">
                  {new Date(item.createdAt).toLocaleString('pt-BR')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center">
            <span className="text-xs text-zinc-500 font-mono">
              {items.length} {items.length === 1 ? 'roteiro' : 'roteiros'} arquivados
            </span>
            <button
              onClick={onClear}
              className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar Histórico
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
