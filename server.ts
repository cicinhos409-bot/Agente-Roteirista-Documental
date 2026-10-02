import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MASTER_SYSTEM_INSTRUCTION = `
Você é o AGENTE ROTEIRISTA JORNALÍSTICO DOCUMENTAL DE ALTA RETENÇÃO.
Especializado em vídeos jornalísticos, documentais, militares, policiais, geopolíticos e institucionais para YouTube.

Sua função não é apenas reescrever notícias:
PESQUISAR → VERIFICAR → DESCOBRIR A HISTÓRIA → ENCONTRAR O MELHOR ÂNGULO → PLANEJAR A RETENÇÃO → EXPANDIR O ASSUNTO → ESCREVER UM ROTEIRO ORIGINAL → AUDITAR O RESULTADO.

PRINCÍPIO FUNDAMENTAL:
"RETENÇÃO NÃO JUSTIFICA INVENÇÃO."
Trabalhe obrigatoriamente nesta ordem:
PESQUISA → FATOS → RELAÇÕES → CONTRAPONTOS → PERGUNTA CENTRAL → ÂNGULO → TESE NARRATIVA → ROTEIRO.
Nunca distorça um fato. A força da linguagem deve acompanhar a força da evidência.

REGRA DE CERTEZA PROPORCIONAL:
- Fato comprovado: "O documento mostra..."
- Relatório: "Segundo o relatório..."
- Declaração: "Segundo X..."
- Disputa: "X afirma..., enquanto Y contesta..."
- Análise: "Isso sugere..."
- Hipótese: "Isso poderia..."
Nunca transforme suspeito em culpado (diferencie: investigado, acusado, denunciado, réu, condenado).
Sem propaganda política partidária; apresente fatos, argumentos, contrapontos e consequências.

EXPANSÃO E RETENÇÃO:
- Motores de expansão (Vertical, Horizontal, Educacional, Ramificação por Entidade, Bloco de Capacidade, Contexto Geográfico, Cadeia de Impacto, Evento-Espelho).
- Zoom Narrativo (Micro ↔ Macro).
- Cadeia de ação e reação (Ação → Reação → Contrarreação → Decisão → Consequência).
- Ondas de tensão (Tensão → Explicação → Descoberta → Contexto → Nova Tensão → Respiração → Clímax).
- Re-hooks a cada grande bloco.
- Microconclusões para dar sensação de progresso constante.
- Plano audiovisual rigoroso com tags:
  [CLIP REAL — descrição]
  [B-ROLL — descrição]
  [MAPA — localização/rota]
  [DOCUMENTO NA TELA — trecho relevante]
  [IMAGEM DE ARQUIVO — descrição]
  [DECLARAÇÃO — pessoa/instituição]
  [GRÁFICO — dado]
  [BUSCAR IMAGENS/ARQUIVO SOBRE X]

DURAÇÃO E PALAVRAS:
- 5 minutos: 650–850 palavras
- 8 minutos: 1.000–1.300 palavras
- 10 minutos: 1.300–1.600 palavras
- 12 minutos: 1.600–1.900 palavras
- 15 minutos: 2.000–2.400 palavras
- 20 minutos: 2.600–3.200 palavras

REGRA PARA A NARRAÇÃO:
Não revele ao espectador termos internos ("hook", "re-hook", "microconclusão", "expansão vertical"). Soe como um documentário de altíssimo nível em português brasileiro fluente, inteligente, envolvente e cinematográfico.

FORMATO OBRIGATÓRIO DA RESPOSTA (se não for "SOMENTE ROTEIRO"):
## 1. ÂNGULO ESCOLHIDO
[2-4 linhas explicando a tese e ângulo da narrativa]

## 2. PERGUNTA CENTRAL
[A grande pergunta macro loop que sustenta o interesse]

## 3. ARQUITETURA
[Evento, Personagem/Conflito ou Tese/Dossiê - justificativa breve]

## 4. HOOK ESCOLHIDO
[Tipo de hook e por que foi escolhido]

## 5. FATOS-BASE
[Lista de fatos essenciais checados]

## 6. ROTEIRO COMPLETO
[O texto completo e pronto para a locução, com os blocos, parágrafos fluidos e indicações audiovisuais [CLIP REAL], [B-ROLL], [MAPA], etc.]

## 7. FONTES
[Fontes primárias, oficiais, agências, relatórios, links e órgãos consultados]

## 8. ALERTAS FACTUAIS
[Pontos contestados, não confirmados, hipóteses ou exclusões deliberadas]

## 9. PRÓXIMO GATILHO
[Acontecimentos futuros reais a monitorar para o próximo vídeo]

Se a ordem for "SOMENTE ROTEIRO", entregue diretamente o texto do Roteiro Completo com as marcações audiovisuais, sem os cabeçalhos das outras seções.
`;

// API endpoint to generate script
app.post('/api/generate-script', async (req, res) => {
  try {
    const {
      title,
      theme,
      sources,
      transcripts,
      characters,
      duration = 10,
      wordCount,
      audience,
      sponsor,
      notes,
      channelName,
      competitorScripts = [],
      additionalObservations,
      onlyScript = false,
      architecturePreference,
      hookPreference,
    } = req.body;

    if (!title && !theme) {
      return res.status(400).json({ error: 'Título ou Tema é obrigatório.' });
    }

    const targetWords = wordCount || (
      duration <= 5 ? 750 :
      duration <= 8 ? 1150 :
      duration <= 10 ? 1450 :
      duration <= 12 ? 1750 :
      duration <= 15 ? 2200 : 2900
    );

    let prompt = `COMANDO DE EXECUÇÃO: PRODUZIR ROTEIRO DOCUMENTAL DE ALTA RETENÇÃO\n\n`;
    prompt += `TÍTULO: ${title || theme}\n`;
    if (theme) prompt += `TEMA: ${theme}\n`;
    if (channelName) prompt += `NOME DO CANAL: "${channelName}" (Utilize no encerramento para CTA personalizada, sóbria e documental conforme Regra 36)\n`;
    if (sources) prompt += `FONTES FORNECIDAS: ${sources}\n`;
    if (transcripts) prompt += `TRANSCRIÇÕES / DEPOIMENTOS: ${transcripts}\n`;
    if (characters) prompt += `PERSONAGENS / ENTIDADES CHAVE: ${characters}\n`;
    prompt += `DURAÇÃO ESTIMADA: ${duration} minutos\n`;
    prompt += `META DE PALAVRAS: Aproximadamente ${targetWords} palavras (mantenha progressão e densidade narrativa sem enrolação)\n`;
    if (audience) prompt += `PÚBLICO-ALVO: ${audience}\n`;
    if (sponsor) prompt += `PATROCINADOR / PRODUTO: ${sponsor} (Integrar conforme Regra 35 - transição orgânica antes do clímax)\n`;
    if (additionalObservations) prompt += `OBSERVAÇÕES ADICIONAIS (Atores específicos, bastidores, curiosidades): ${additionalObservations}\n`;
    if (notes) prompt += `OBSERVAÇÕES EDITORIAIS: ${notes}\n`;

    if (competitorScripts && Array.isArray(competitorScripts)) {
      const validCompetitors = competitorScripts.filter((s: string) => s && s.trim().length > 0);
      if (validCompetitors.length > 0) {
        prompt += `\nROTEIROS / TRANSCRIÇÕES DE CONCORRENTES COMO REFERÊNCIA DE ESTRUTURA E RITMO:\n`;
        validCompetitors.slice(0, 3).forEach((script: string, idx: number) => {
          prompt += `--- REFERÊNCIA DO CONCORRENTE ${idx + 1} ---\n${script}\n`;
        });
        prompt += `DIRETRIZ DA REGRA 30 (ORIGINALIDADE ABSOLUTA): Os roteiros de concorrentes acima servem EXCLUSIVAMENTE para você analisar a cadência de corte, ritmo e mecanismos abstratos de retenção. É TERMINANTEMENTE PROIBIDO copiar frases, bordões, metáforas, opiniões ou conclusões dos concorrentes. O roteiro produzido deve ser 100% autêntico e original.\n\n`;
      }
    }

    if (architecturePreference && architecturePreference !== 'auto') {
      prompt += `PREFERÊNCIA DE ARQUITETURA: ${architecturePreference}\n`;
    }
    if (hookPreference && hookPreference !== 'auto') {
      prompt += `PREFERÊNCIA DE HOOK: ${hookPreference}\n`;
    }

    if (onlyScript) {
      prompt += `\nINSTRUÇÃO ESPECIAL: SOMENTE ROTEIRO. Entregue apenas o texto pronto para locução com as indicações audiovisuais [CLIP REAL], [MAPA], etc., sem os tópicos analíticos prévios.\n`;
    } else {
      prompt += `\nINSTRUÇÃO: Realize a pesquisa completa com grounding, audite as informações e entregue rigorosamente as 9 seções obrigatórias.\n`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: MASTER_SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.65,
      },
    });

    const outputText = response.text || '';

    // Extract search grounding metadata if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const searchQueries = groundingMetadata?.webSearchQueries || [];
    const searchChunks = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || '',
      url: chunk.web?.uri || '',
    })).filter((c: any) => c.url) || [];

    res.json({
      content: outputText,
      searchQueries,
      searchSources: searchChunks,
      targetWords,
      duration,
    });
  } catch (error: any) {
    console.error('Error generating script:', error);
    res.status(500).json({
      error: error.message || 'Erro ao processar roteiro com o Agente Roteirista.',
    });
  }
});

// API endpoint to audit script according to Rule 38
app.post('/api/audit-script', async (req, res) => {
  try {
    const { scriptText, duration = 10 } = req.body;
    if (!scriptText) {
      return res.status(400).json({ error: 'Texto do roteiro é obrigatório para auditoria.' });
    }

    const auditPrompt = `
Você é o Auditor Chefe do Agente Roteirista Jornalístico Documental.
Analise criticamente o seguinte roteiro ou dossiê documental com base nas 15 perguntas da AUDITORIA FINAL OBRIGATÓRIA (Regra 38):

1. O hook é verdadeiro e factual?
2. A pergunta central nasce genuinamente dos fatos?
3. Existe alguma acusação apresentada como fato sem sustentação jurídica?
4. Alguma declaração foi transformada em fato absoluto?
5. Há correlação sendo tratada indevidamente como causalidade?
6. Acontecimentos independentes foram conectados artificialmente?
7. Algum cenário futuro está escrito como certeza categórica?
8. Há contrapontos relevantes que foram ignorados?
9. Algum número ou estatística perdeu contexto?
10. Há repetição desnecessária de informação?
11. Cada bloco acrescenta algo novo?
12. O roteiro mantém alta retenção sem adjetivação sensacionalista oca ("urgente", "bomba")?
13. As pontes e transições narrativas são fluidas?
14. O encerramento conversa com a abertura?
15. O roteiro é 100% autêntico e original?

Além disso, avalie:
- Contagem de palavras e adequação à duração pretendida (${duration} minutos).
- Densidade e pertinência dos recursos audiovisuais ([CLIP REAL], [MAPA], [B-ROLL], [DOCUMENTO]).
- Curva de retenção estimada (Pontos altos, vales de atenção, respiração).

Responda em formato estruturado com:
- NOTA GERAL DE AUDITORIA (0 a 100)
- VEREDICTO (Aprovado com Louvor / Aprovado com Ressalvas / Necessita Ajustes)
- CHECKLIST DAS 15 REGRAS (Classifique cada uma como CONFORME, ALERTA ou NÃO CONFORME com breve justificativa)
- PONTOS FORTES
- VULNERABILIDADES FACTUAIS OU NARRATIVAS IDENTIFICADAS
- SUGESTÕES ESPECÍFICAS DE REESCRITA (se houver)

TEXTO DO ROTEIRO:
${scriptText}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: auditPrompt,
      config: {
        temperature: 0.3,
      },
    });

    res.json({
      auditReport: response.text || '',
    });
  } catch (error: any) {
    console.error('Error auditing script:', error);
    res.status(500).json({ error: error.message || 'Erro ao auditar o roteiro.' });
  }
});

// API endpoint for Text to Speech narration preview
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texto para narração é obrigatório.' });
    }

    // Clean text by stripping visual cue brackets for audio locution
    const cleanText = text
      .replace(/\[(?:CLIP REAL|B-ROLL|MAPA|DOCUMENTO NA TELA|IMAGEM DE ARQUIVO|DECLARAÇÃO|GRÁFICO|BUSCAR IMAGENS\/ARQUIVO)[^\]]*\]/gi, '')
      .replace(/##\s+[^\n]+/g, '')
      .trim();

    // Limit chunk to avoid payload timeout (~600 chars per clip preview)
    const textChunk = cleanText.slice(0, 750);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: textChunk,
              speechMetadata: {
                style: 'Narrador documental sério, pausado, sóbrio e investigativo em português do Brasil.',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'Não foi possível gerar o áudio de locução.' });
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error generating narration audio:', error);
    res.status(500).json({ error: error.message || 'Erro ao sintetizar narração TTS.' });
  }
});

// Serve frontend in dev or prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Estúdio do Agente Roteirista ativo em http://0.0.0.0:${PORT}`);
  });
}

startServer();
