export interface MerchantItem {
  id: string;
  label: string;
  desc: string;
  price: number;
  effect: string;
  oneTime?: boolean;
  group: 'saude' | 'clima' | 'suprimentos';
}

export const MERCHANT_SPECIAL_ITEMS: readonly MerchantItem[] = [
  { id: 'racao_granel',         label: '🚚 Carga de Ração a Granel',     desc: 'Compra por atacado: escolha um tipo de ração e receba +30 unidades', price: 90,  effect: 'bulk_feed' , group: 'suprimentos' as const },
  { id: 'bebedouro',            label: '🪣 Bebedouro Automático',        desc: 'Animais nunca ficam com sede',                                   price: 150, effect: 'bebedouro',            oneTime: true , group: 'clima' as const },
  { id: 'cert_sanitario',       label: '📜 Certificado Sanitário Internacional (CSI)', desc: 'Emitido pelo MAPA. +10% preço de venda de carne. Exigido para contratos de Exportação — só fica válido com a vacinação do rebanho em dia (renove a cada 30 dias).', price: 800, effect: 'cert_sanitario',       oneTime: true , group: 'suprimentos' as const },
  { id: 'licenca_exotica_item', label: '📋 Licença Exótica',             desc: 'Permite criar Jacaré legalmente',                                price: 280, effect: 'licenca_exotica',      oneTime: true , group: 'suprimentos' as const },
  { id: 'licenca_criadouro',    label: '📜 Licença de Criadouro',        desc: 'Permite reprodução controlada de Vaca, Cabra, Ovelha e Galinha', price: 400, effect: 'licenca_criadouro',    oneTime: true , group: 'suprimentos' as const },
  { id: 'visita_veterinario',   label: '🚑 Visita do Veterinário',       desc: 'O veterinário trata todos os doentes (60💰 por animal). Curados descansam 1 dia sem produzir', price: 60, effect: 'vet_visit' , group: 'saude' as const },
  { id: 'consultoria_agro',     label: '👨‍🌾 Consultoria Agronômica',     desc: 'Um agrônomo otimiza o manejo da fazenda: +15% produção por 7 dias', price: 220, effect: 'production_boost_7days' , group: 'suprimentos' as const },
  { id: 'vacinacao',            label: '💉 Campanha de Vacinação',       desc: 'Rebanho vacinado por 30 dias: sem epidemias, animais adoecem menos, e mantém seu CSI válido para Exportação', price: 250, effect: 'vaccination_30days' , group: 'saude' as const },
  { id: 'suplemento_mineral',   label: '💊 Suplemento Mineral',          desc: '+20% produção de leite e ovos por 7 dias',                       price: 90,  effect: 'suplemento_mineral_7days' , group: 'saude' as const },
  { id: 'bandagem_vet',         label: '🩹 Bandagem Veterinária',        desc: 'Cura 1 animal doente (o mais grave)',                             price: 45,  effect: 'cure_one_sick' , group: 'saude' as const },
  { id: 'cisterna',             label: '🪣 Cisterna de Água',            desc: 'Reduz conta de água em 30% permanente',                          price: 900, effect: 'cisterna',             oneTime: true , group: 'clima' as const },
  { id: 'reforco_telhado',      label: '🪵 Reforço de Telhado',          desc: 'Estruturas reforçadas: tempestades causam 60% menos impacto (permanente)', price: 180, effect: 'roof_reinforcement', oneTime: true , group: 'clima' as const },
  { id: 'caminhao_pipa',        label: '🚛 Caminhão-Pipa',               desc: 'Água garantida por 14 dias: secas não afetam a fazenda',          price: 120, effect: 'water_truck_14days' , group: 'clima' as const },
  { id: 'silagem_premium',      label: '🌽 Silagem Premium',             desc: 'Animais não consomem ração do Armazém por 5 dias',               price: 110, effect: 'silagem_5days' , group: 'suprimentos' as const },
  { id: 'contrato_transporte',  label: '🚚 Contrato de Transporte',      desc: 'Isenta de multa nas próximas 3 entregas vencidas',               price: 95,  effect: 'isencao_multa_2x' , group: 'suprimentos' as const },
  { id: 'antidoto_anti_pragas', label: '🧴 Antídoto Anti-Pragas',        desc: 'Protege o celeiro de pragas por 14 dias',                         price: 75,  effect: 'anti_pest_14days' , group: 'clima' as const },
];

export type MerchantItemId = MerchantItem['id'];

// Tipos de ração para a Carga de Ração a Granel (bulk_feed)
export const FEED_TYPES = [
  { key: 'racaoBovina',    label: '🐄 Bovina' },
  { key: 'racaoOvinos',    label: '🐑 Ovinos' },
  { key: 'racaoAves',      label: '🐔 Aves' },
  { key: 'racaoAquatica',  label: '🐟 Aquática' },
  { key: 'racaoCoelho',    label: '🐇 Coelho' },
  { key: 'racaoCarnivora', label: '🐊 Carnívora' },
  { key: 'racaoSuina',     label: '🐖 Suína' },
] as const;
