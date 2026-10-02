import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, Sparkles, Scale, FileText } from 'lucide-react';

interface AuditPanelProps {
  scriptText: string;
  duration: number;
}

const AUDIT_QUESTIONS = [
  '1. O hook é verdadeiro e comprovável?',
  '2. A pergunta central nasce genuinamente dos fatos?',
  '3. Existe alguma acusação tratada como fato sem sustentação jurídica?',
  '4. Alguma declaração isolada foi transformada em fato absoluto?',
  '5. Há correlação sendo tratada indevidamente como causalidade?',
  '6. Acontecimentos independentes foram conectados artificialmente?',
  '7. Algum cenário futuro está escrito como certeza categórica?',
  '8. Há contraponto relevante que foi ignorado?',
  '9. Algum número ou estatística perdeu seu contexto essencial?',
  '10. Há repetição redundante de informações ou jargões?',
  '11. Cada parágrafo e bloco acrescenta algo novo à narrativa?',
  '12. O roteiro mantém alta retenção sem adjetivos sensacionalistas vazios?',
  '13. As pontes e transições entre blocos são fluidas e orgânicas?',
  '14. O encerramento conversa diretamente com a abertura e a pergunta central?',
  '15. O roteiro é 100% autêntico, original e sem cópias de canais concorrentes?',
];

export const AuditPanel: React.FC<AuditPanelProps> = ({ scriptText, duration }) => {
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAudit = async () => {
    if (!scriptText || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/audit-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptText, duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na auditoria.');
      setAuditReport(data.auditReport);
    } catch (err: any) {
      setError(err.message || 'Falha ao executar auditoria com IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-cinzel font-bold text-base sm:text-lg">
            <Scale className="w-5 h-5" />
            Auditoria Final Obrigatória (Regra 38)
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            "A força da linguagem deve acompanhar a força da evidência. Retenção não justifica invenção."
            Avaliação rigorosa dos 15 princípios jornalísticos documentais.
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={loading || !scriptText}
          className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Auditando 15 Regras...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Executar Auditoria Crítica com IA
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-red-500/15 border border-red-500/50 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Grid: 15 Core Rules Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AUDIT_QUESTIONS.map((q, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-start gap-2.5 text-xs hover:border-zinc-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-zinc-300 leading-snug">{q}</div>
          </div>
        ))}
      </div>

      {/* AI Detailed Audit Report if available */}
      {auditReport ? (
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h4 className="font-cinzel text-amber-400 font-bold flex items-center gap-2 text-sm sm:text-base">
              <Sparkles className="w-4 h-4" /> Relatório Completo do Auditor Chefe
            </h4>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
              Auditado via Gemini Grounding
            </span>
          </div>
          <div className="prose prose-invert prose-amber max-w-none text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
            {auditReport}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center space-y-2">
          <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-xs sm:text-sm">
            Clique em "Executar Auditoria Crítica com IA" para auditar o roteiro gerado contra falácias causais,
            distorções jurídicas, exageros adjetivados e perda de contexto.
          </p>
        </div>
      )}
    </div>
  );
};
