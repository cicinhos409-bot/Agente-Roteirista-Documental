export interface ScriptRequest {
  title: string;
  theme?: string;
  sources?: string;
  transcripts?: string;
  characters?: string;
  duration: number; // in minutes (5, 8, 10, 12, 15, 20)
  wordCount?: number;
  audience?: string;
  sponsor?: string;
  notes?: string;
  channelName?: string;
  competitorScripts?: string[];
  additionalObservations?: string;
  onlyScript?: boolean;
  architecturePreference?: 'auto' | 'Evento' | 'Personagem/Conflito' | 'Tese/Dossiê';
  hookPreference?: 'auto' | 'Histórico' | 'Mistério' | 'Visual' | 'Resultado' | 'Confronto' | 'Contradição' | 'Personagem Extraordinário';
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ScriptResponse {
  content: string;
  searchQueries?: string[];
  searchSources?: GroundingSource[];
  targetWords: number;
  duration: number;
}

export interface ParsedSections {
  angulo: string;
  perguntaCentral: string;
  arquitetura: string;
  hook: string;
  fatosBase: string[];
  roteiroCompleto: string;
  fontes: string[];
  alertasFactuais: string[];
  proximoGatilho: string;
  isOnlyScript: boolean;
}

export interface VisualCue {
  id: string;
  type: 'CLIP REAL' | 'B-ROLL' | 'MAPA' | 'DOCUMENTO' | 'IMAGEM DE ARQUIVO' | 'DECLARAÇÃO' | 'GRÁFICO' | 'PESQUISA';
  rawText: string;
  description: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  theme?: string;
  duration: number;
  wordCount: number;
  createdAt: string;
  content: string;
  searchSources?: GroundingSource[];
}

export interface AuditCheckItem {
  number: number;
  question: string;
  status: 'conforme' | 'alerta' | 'nao_conforme';
  note: string;
}
