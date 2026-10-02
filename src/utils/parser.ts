import { ParsedSections, VisualCue } from '../types';

/**
 * Strips timestamp markers (e.g. **(0:00)**, (1:30)) and speaker labels (e.g. **LOCUTOR:**, NARRADOR:).
 */
export function cleanRoteiroClutter(text: string): string {
  if (!text) return '';
  return text
    // Remove bold/plain timestamps: **(0:00)**, (0:00), **(1:30)**, (1:30), **0:00**, [0:00], etc.
    .replace(/\*{0,2}\(\s*\d{1,2}:\d{2}(?::\d{2})?\s*\)\*{0,2}\s*:?/g, '')
    .replace(/\*{0,2}\[\s*\d{1,2}:\d{2}(?::\d{2})?\s*\]\*{0,2}\s*:?/g, '')
    .replace(/^\s*\*{0,2}\d{1,2}:\d{2}(?::\d{2})?\*{0,2}\s*[-–—:]?\s*/gm, '')
    // Remove speaker prefixes: **LOCUTOR:**, LOCUTOR:, **NARRADOR:**, NARRADOR:, **VOZ:**, etc.
    .replace(/\*{0,2}\b(?:LOCUTOR|NARRADOR|APRESENTADOR|VOZ|VOZ OFF|V\.O\.|HOST)\b\*{0,2}\s*:?\s*/gi, '')
    // REMOVE ALL ASTERISKS (**, *, ***) completely from the text
    .replace(/\*{1,4}/g, '')
    // Clean orphan double spaces or spaces before punctuation
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

/**
 * Parses the raw AI response into structured sections adhering to Rule 39:
 * 1. ÂNGULO ESCOLHIDO
 * 2. PERGUNTA CENTRAL
 * 3. ARQUITETURA
 * 4. HOOK ESCOLHIDO
 * 5. FATOS-BASE
 * 6. ROTEIRO COMPLETO
 * 7. FONTES
 * 8. ALERTAS FACTUAIS
 * 9. PRÓXIMO GATILHO
 */
export function parseScriptResponse(rawText: string): ParsedSections {
  if (!rawText) {
    return {
      angulo: '',
      perguntaCentral: '',
      arquitetura: '',
      hook: '',
      fatosBase: [],
      roteiroCompleto: '',
      fontes: [],
      alertasFactuais: [],
      proximoGatilho: '',
      isOnlyScript: true,
    };
  }

  // Check if response contains the standard section headers
  const hasStandardSections =
    rawText.includes('ÂNGULO ESCOLHIDO') ||
    rawText.includes('PERGUNTA CENTRAL') ||
    rawText.includes('ROTEIRO COMPLETO');

  if (!hasStandardSections) {
    // "SOMENTE ROTEIRO" mode or direct script
    return {
      angulo: '',
      perguntaCentral: '',
      arquitetura: '',
      hook: '',
      fatosBase: [],
      roteiroCompleto: cleanRoteiroClutter(rawText.trim()),
      fontes: [],
      alertasFactuais: [],
      proximoGatilho: '',
      isOnlyScript: true,
    };
  }

  const extractSection = (headingRegex: RegExp, nextHeadingRegex: RegExp | null): string => {
    const match = rawText.match(headingRegex);
    if (!match || match.index === undefined) return '';

    const startIndex = match.index + match[0].length;
    let endIndex = rawText.length;

    if (nextHeadingRegex) {
      const nextMatch = rawText.slice(startIndex).match(nextHeadingRegex);
      if (nextMatch && nextMatch.index !== undefined) {
        endIndex = startIndex + nextMatch.index;
      }
    }

    return rawText.slice(startIndex, endIndex).trim();
  };

  const angulo = extractSection(
    /#{1,3}\s*(?:1\.\s*)?ÂNGULO\s*ESCOLHIDO[:\s]*/i,
    /#{1,3}\s*(?:2\.\s*)?PERGUNTA\s*CENTRAL/i
  );

  const perguntaCentral = extractSection(
    /#{1,3}\s*(?:2\.\s*)?PERGUNTA\s*CENTRAL[:\s]*/i,
    /#{1,3}\s*(?:3\.\s*)?ARQUITETURA/i
  );

  const arquitetura = extractSection(
    /#{1,3}\s*(?:3\.\s*)?ARQUITETURA[:\s]*/i,
    /#{1,3}\s*(?:4\.\s*)?HOOK\s*ESCOLHIDO/i
  );

  const hook = extractSection(
    /#{1,3}\s*(?:4\.\s*)?HOOK\s*ESCOLHIDO[:\s]*/i,
    /#{1,3}\s*(?:5\.\s*)?FATOS-?BASE/i
  );

  const fatosBaseRaw = extractSection(
    /#{1,3}\s*(?:5\.\s*)?FATOS-?BASE[:\s]*/i,
    /#{1,3}\s*(?:6\.\s*)?ROTEIRO\s*COMPLETO/i
  );

  const roteiroCompleto = extractSection(
    /#{1,3}\s*(?:6\.\s*)?ROTEIRO\s*COMPLETO[:\s]*/i,
    /#{1,3}\s*(?:7\.\s*)?FONTES/i
  );

  const fontesRaw = extractSection(
    /#{1,3}\s*(?:7\.\s*)?FONTES[:\s]*/i,
    /#{1,3}\s*(?:8\.\s*)?ALERTAS\s*FACTUAIS/i
  );

  const alertasFactuaisRaw = extractSection(
    /#{1,3}\s*(?:8\.\s*)?ALERTAS\s*FACTUAIS[:\s]*/i,
    /#{1,3}\s*(?:9\.\s*)?PRÓXIMO\s*GATILHO/i
  );

  const proximoGatilho = extractSection(
    /#{1,3}\s*(?:9\.\s*)?PRÓXIMO\s*GATILHO[:\s]*/i,
    null
  );

  const splitBulletPoints = (text: string): string[] => {
    return text
      .split(/\n+/)
      .map((line) => line.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter((line) => line.length > 3);
  };

  return {
    angulo,
    perguntaCentral,
    arquitetura,
    hook,
    fatosBase: splitBulletPoints(fatosBaseRaw),
    roteiroCompleto: cleanRoteiroClutter(roteiroCompleto || rawText.trim()),
    fontes: splitBulletPoints(fontesRaw),
    alertasFactuais: splitBulletPoints(alertasFactuaisRaw),
    proximoGatilho,
    isOnlyScript: false,
  };
}

/**
 * Extracts and classifies audio-visual cue brackets:
 * [CLIP REAL], [B-ROLL], [MAPA], [DOCUMENTO NA TELA], [IMAGEM DE ARQUIVO], [DECLARAÇÃO], [GRÁFICO], [BUSCAR...]
 */
export function extractVisualCues(scriptText: string): VisualCue[] {
  const cueRegex = /\[(CLIP REAL|B-ROLL|MAPA|DOCUMENTO NA TELA|IMAGEM DE ARQUIVO|DECLARAÇÃO|GRÁFICO|BUSCAR IMAGENS\/ARQUIVO[^\]]*)(?:—|-|:)?\s*([^\]]*)\]/gi;
  const cues: VisualCue[] = [];
  let match: RegExpExecArray | null;
  let counter = 1;

  while ((match = cueRegex.exec(scriptText)) !== null) {
    const rawTag = match[1].toUpperCase();
    let type: VisualCue['type'] = 'B-ROLL';

    if (rawTag.includes('CLIP REAL')) type = 'CLIP REAL';
    else if (rawTag.includes('MAPA')) type = 'MAPA';
    else if (rawTag.includes('DOCUMENTO')) type = 'DOCUMENTO';
    else if (rawTag.includes('ARQUIVO')) type = 'IMAGEM DE ARQUIVO';
    else if (rawTag.includes('DECLARAÇÃO')) type = 'DECLARAÇÃO';
    else if (rawTag.includes('GRÁFICO')) type = 'GRÁFICO';
    else if (rawTag.includes('BUSCAR')) type = 'PESQUISA';

    cues.push({
      id: `cue-${counter++}`,
      type,
      rawText: match[0],
      description: match[2]?.trim() || match[0],
    });
  }

  return cues;
}

/**
 * Strips visual cue brackets and clutter to get pure clean locution text for teleprompter/audio.
 */
export function getCleanLocutionText(scriptText: string): string {
  if (!scriptText) return '';
  const withoutCues = scriptText
    .replace(/\[(?:CLIP REAL|B-ROLL|MAPA|DOCUMENTO NA TELA|IMAGEM DE ARQUIVO|DECLARAÇÃO|GRÁFICO|BUSCAR IMAGENS\/ARQUIVO|SUGESTÃO DE ACERVO|CLIP|MAPA GEOGRÁFICO|DOCUMENTO)[^\]]*\]/gi, '')
    .replace(/\[[A-ZÀ-Ú\s\/\-—:0-9]{3,}[^\]]*\]/g, '')
    .replace(/#{1,4}\s+[^\n]+/g, '')
    .replace(/\*{1,4}/g, '');

  return cleanRoteiroClutter(withoutCues)
    .replace(/\*{1,4}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Calculates words and estimated narration duration.
 * Documentary narrators in Brazilian Portuguese typically read at 135-145 words per minute.
 */
export function calculatePacing(text: string) {
  const clean = getCleanLocutionText(text);
  const words = clean.trim() ? clean.trim().split(/\s+/).length : 0;
  const chars = clean.length;
  const wordsPerMinute = 140; // standard calm documentary cadence
  const totalMinutes = words / wordsPerMinute;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);

  return {
    words,
    chars,
    readingTime: `${minutes}m ${seconds.toString().padStart(2, '0')}s`,
    totalMinutes,
  };
}

/**
 * Generates an optimized YouTube description with video title, synopsis, chapters, and hashtags.
 */
export function generateYouTubeDescription(title: string, parsed: ParsedSections, channelName?: string): string {
  const cleanScript = parsed.roteiroCompleto;
  const paragraphs = cleanScript.split(/\n\n+/).filter((p) => p.trim().length > 60);
  
  // Approximate timestamp per paragraph (assuming 140 words per min)
  let accumulatedWords = 0;
  const chapters: string[] = ['00:00 - Introdução'];
  
  paragraphs.forEach((p, idx) => {
    if (idx === 0) return;
    accumulatedWords += p.split(/\s+/).length;
    const totalSecs = Math.floor((accumulatedWords / 140) * 60);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    
    // Grab first sentence as chapter title or generate logical names
    if (idx === 1) chapters.push(`${timeStr} - O Contexto dos Acontecimentos`);
    else if (idx === 3) chapters.push(`${timeStr} - A Investigação e as Evidências`);
    else if (idx === 5) chapters.push(`${timeStr} - O Confronto de Versões`);
    else if (idx === Math.floor(paragraphs.length * 0.75)) chapters.push(`${timeStr} - Consequências e Impactos`);
    else if (idx === paragraphs.length - 1) chapters.push(`${timeStr} - Conclusão e Próximos Desdobramentos`);
  });

  const uniqueChapters = Array.from(new Set(chapters));

  const ctaLine = channelName
    ? `🔔 Inscreva-se no canal ${channelName} para acompanhar mais investigações documentais independentes!`
    : '🔔 Inscreva-se no canal para mais investigações documentais independentes!';

  return `🔴 ${title}

${parsed.angulo || 'Uma investigação aprofundada baseada em documentos oficiais, fontes primárias e reconstrução factual minuciosa.'}

❓ PERGUNTA CENTRAL:
${parsed.perguntaCentral || 'O que realmente aconteceu nos bastidores desse acontecimento?'}

📌 CAPÍTULOS:
${uniqueChapters.join('\n')}

📑 FONTES E DOCUMENTOS:
${parsed.fontes.length > 0 ? parsed.fontes.map(f => `• ${f}`).join('\n') : '• Fontes primárias, agências oficiais e investigações públicas.'}

⚠️ NOTA EDITORIAL:
Este mini-documentário foi produzido com rigoroso compromisso factual. Retenção não justifica invenção. Todas as afirmações seguem o princípio de certeza proporcional e distinção jurídica.

${ctaLine}

#Documentario #JornalismoInvestigativo #Geopolitica #HistoriaReal
`;
}
