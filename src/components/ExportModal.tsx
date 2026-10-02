import React, { useState } from 'react';
import { Copy, Check, Download, Youtube, FileText, MonitorPlay, X, Share2 } from 'lucide-react';
import { ParsedSections } from '../types';
import { generateYouTubeDescription, getCleanLocutionText } from '../utils/parser';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  parsed: ParsedSections;
  channelName?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title,
  parsed,
  channelName,
}) => {
  const [activeTab, setActiveTab] = useState<'youtube' | 'teleprompter' | 'markdown'>('youtube');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const ytDescription = generateYouTubeDescription(title, parsed, channelName);
  const teleprompterTxt = getCleanLocutionText(parsed.roteiroCompleto);
  const markdownText = `# ${title}\n\n## 1. ÂNGULO ESCOLHIDO\n${parsed.angulo}\n\n## 2. PERGUNTA CENTRAL\n${parsed.perguntaCentral}\n\n## 3. ARQUITETURA\n${parsed.arquitetura}\n\n## 4. HOOK ESCOLHIDO\n${parsed.hook}\n\n## 5. FATOS-BASE\n${parsed.fatosBase.map(f => `- ${f}`).join('\n')}\n\n## 6. ROTEIRO COMPLETO\n${parsed.roteiroCompleto}\n\n## 7. FONTES\n${parsed.fontes.map(f => `- ${f}`).join('\n')}\n\n## 8. ALERTAS FACTUAIS\n${parsed.alertasFactuais.map(f => `- ${f}`).join('\n')}\n\n## 9. PRÓXIMO GATILHO\n${parsed.proximoGatilho}`;

  const currentContent =
    activeTab === 'youtube'
      ? ytDescription
      : activeTab === 'teleprompter'
      ? teleprompterTxt
      : markdownText;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extension = activeTab === 'markdown' ? 'md' : 'txt';
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_${activeTab}.${extension}`;
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-500" />
            <h3 className="font-cinzel font-bold text-zinc-100 text-base sm:text-lg">
              Central de Exportação & Publicação
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-800 bg-zinc-950 px-6 pt-2">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'youtube'
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-500" />
            Descrição YouTube (Com Capítulos)
          </button>
          <button
            onClick={() => setActiveTab('teleprompter')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'teleprompter'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MonitorPlay className="w-4 h-4 text-amber-500" />
            Teleprompter TXT (Limpo)
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'markdown'
                ? 'border-violet-500 text-violet-400 bg-violet-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4 text-violet-400" />
            Dossiê Completo (Markdown)
          </button>
        </div>

        {/* Text Preview Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <textarea
            readOnly
            value={currentContent}
            className="w-full h-80 p-4 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs sm:text-sm text-zinc-300 focus:outline-none resize-none leading-relaxed selection:bg-amber-500/30"
          />
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-zinc-500 font-mono">
            {currentContent.split(/\s+/).length} palavras exportáveis
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copiar Conteúdo
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Baixar Arquivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
