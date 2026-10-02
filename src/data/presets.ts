import { ScriptRequest } from '../types';

export interface PresetTopic {
  id: string;
  category: 'Militar' | 'Policial/Investigativo' | 'Geopolítica' | 'Histórico' | 'Tecnologia Bélica';
  title: string;
  badge: string;
  description: string;
  request: Partial<ScriptRequest>;
}

export const PRESET_TOPICS: PresetTopic[] = [
  {
    id: 'mar-negro-drones',
    category: 'Militar',
    title: 'A Batalha Oculta dos Drones no Mar Negro e o Colapso da Frota Naval',
    badge: 'Militar & Doutrina Naval',
    description: 'Como drones marítimos de superfície (USVs) de baixo custo neutralizaram navios de guerra de milhões de dólares sem combate naval tradicional.',
    request: {
      title: 'A Batalha Oculta dos Drones no Mar Negro e o Colapso da Frota Naval',
      theme: 'Emprego de drones marítimos suicidas e assimétricos no Mar Negro',
      duration: 10,
      audience: 'Entusiastas de estratégia militar, tecnologia bélica e geopolítica',
      architecturePreference: 'Evento',
      hookPreference: 'Resultado',
      notes: 'Destacar o princípio da guerra assimétrica, capacidades técnicas dos drones Magura V5 e Sea Baby, imagens de satélite e doutrina militar.',
    },
  },
  {
    id: 'ouro-ilegal-pf',
    category: 'Policial/Investigativo',
    title: 'Operação Terra Dourada: Como a PF Rastrou 18 Toneladas de Ouro Ilegal',
    badge: 'Polícia Federal & Inteligência',
    description: 'A cadeia forense de rastreamento químico e bancário que desarticulou o esquema de notas fiscais falsas no coração da Amazônia.',
    request: {
      title: 'Operação Terra Dourada: Como a PF Rastrou 18 Toneladas de Ouro Ilegal',
      theme: 'Investigação policial sobre lavagem de ouro através de distribuidoras de títulos e valores mobiliários (DTVMs)',
      duration: 12,
      audience: 'Público interessado em grandes investigações policiais, crimes financeiros e operações especiais',
      architecturePreference: 'Tese/Dossiê',
      hookPreference: 'Confronto',
      notes: 'Diferenciar claramente suspeitos, investigados e denunciados. Apresentar dados do COAF, decisão judicial e o laudo de isotopia do ouro.',
    },
  },
  {
    id: 'semicondutores-taiwan',
    category: 'Geopolítica',
    title: 'O Escudo de Silício: A Disputa Secreta pelas Máquinas Litográficas de Chips',
    badge: 'Geopolítica & Alta Tecnologia',
    description: 'Por que uma única empresa nos Países Baixos (ASML) e uma ilha sob tensão contínua (TSMC) detêm a chave de toda a economia e defesa moderna.',
    request: {
      title: 'O Escudo de Silício: A Disputa Secreta pelas Máquinas Litográficas de Chips',
      theme: 'A geopolítica dos semicondutores avançados de 3nm e 2nm e as tensões no Estreito de Taiwan',
      duration: 15,
      audience: 'Público que busca geopolítica profunda, economia global e inteligência estratégica',
      architecturePreference: 'Personagem/Conflito',
      hookPreference: 'Histórico',
      notes: 'Explicar a tecnologia EUV (Extreme Ultraviolet Lithography), a dependência das potências e o conceito geopolítico de "Escudo de Silício".',
    },
  },
  {
    id: 'varig-254',
    category: 'Histórico',
    title: 'O Enigma do Voo 254: Quando um Rumo de Três Dígitos Mudou a Aviação Brasileira',
    badge: 'História & Investigação Aeronáutica',
    description: 'A sequência de erros de cabine, a interpretação equivocada do plano de voo e a sobrevivência de semanas na selva amazônica.',
    request: {
      title: 'O Enigma do Voo 254: Quando um Rumo de Três Dígitos Mudou a Aviação Brasileira',
      theme: 'Investigação do CENIPA e reconstituição factual do desastre do Boeing 737 da Varig em 1989',
      duration: 8,
      audience: 'Interessados em aviação, investigações de acidentes e comportamento humano sob pressão',
      architecturePreference: 'Evento',
      hookPreference: 'Visual',
      notes: 'Focar na cadeia causal sem julgamentos morais anacrônicos. Citar a gravação da caixa-preta e o relatório final do CENIPA.',
    },
  },
];
