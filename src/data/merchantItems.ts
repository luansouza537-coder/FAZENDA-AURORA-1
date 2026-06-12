export const MERCHANT_SPECIAL_ITEMS = [
  // Itens existentes que funcionam
  { id: 'racao_premium',        label: '🥣 Ração Premium',              desc: '+10 de cada tipo de ração no Armazém',                        price: 40,  effect: 'premium_feed' },
  { id: 'bebedouro',            label: '🪣 Bebedouro Automático',        desc: 'Animais nunca ficam com sede',                                price: 150, effect: 'bebedouro',            oneTime: true },
  { id: 'cert_sanitario',       label: '📜 Certificado Sanitário',       desc: '+10% preço de venda de carne permanente',                     price: 200, effect: 'cert_sanitario',       oneTime: true },
  { id: 'licenca_exotica_item', label: '📋 Licença Exótica',             desc: 'Permite criar Jacaré legalmente',                             price: 280, effect: 'licenca_exotica',      oneTime: true },
  { id: 'licenca_criadouro',    label: '📜 Licença de Criadouro',        desc: 'Permite reprodução controlada de Vaca, Cabra, Ovelha e Galinha', price: 400, effect: 'licenca_criadouro', oneTime: true },
  { id: 'kit_primeiros_socorros',label: '🩺 Kit de Primeiros Socorros',  desc: 'Cura todos os animais doentes instantaneamente',               price: 120, effect: 'cure_all_sick' },
  { id: 'pocao_fertilidade',    label: '🧪 Fertilizante Concentrado',    desc: 'Todos animais produzem 2× por 3 dias',                        price: 180, effect: 'fertility_3days' },
  { id: 'selo_qualidade',       label: '🏅 Selo de Qualidade Premium',   desc: '+25% preço de venda de todos produtos por 5 dias',            price: 220, effect: 'premium_prices_5days' },
  { id: 'mapa_tesouro',         label: '🗺️ Dica de Negócio',             desc: 'Informação privilegiada rende 200–600💰 imediatamente',        price: 90,  effect: 'treasure_map' },
  { id: 'elixir_felicidade',    label: '🎵 Apresentação Musical',        desc: 'Show itinerante deixa todos os animais +30 felicidade agora', price: 50,  effect: 'happiness_boost' },
  { id: 'manual_producao',      label: '📚 Manual de Produção Avançada', desc: '+15% produção de todos animais por 7 dias',                   price: 160, effect: 'production_boost_7days' },
  // Novos itens
  { id: 'suplemento_mineral',   label: '💊 Suplemento Mineral',          desc: '+20% produção de leite por 7 dias',                           price: 90,  effect: 'suplemento_mineral_7days' },
  { id: 'bandagem_vet',         label: '🩹 Bandagem Veterinária',        desc: 'Cura 1 animal doente (o mais grave)',                         price: 45,  effect: 'cure_one_sick' },
  { id: 'sal_mineral',          label: '🧂 Sal Mineral',                 desc: 'Animais não perdem fome por 3 dias',                          price: 55,  effect: 'sal_mineral_3days' },
  { id: 'selo_organico',        label: '🌿 Selo Orgânico',               desc: '+20% preço de venda por 7 dias',                              price: 160, effect: 'selo_organico_7days' },
  { id: 'balanca_precisao',     label: '⚖️ Balança de Precisão',         desc: '+5% preço de venda permanente',                               price: 320, effect: 'balanca_precisao',    oneTime: true },
  { id: 'cisterna',             label: '🪣 Cisterna de Água',            desc: 'Reduz conta de água em 30% permanente',                       price: 200, effect: 'cisterna',            oneTime: true },
  { id: 'cobertura_provisoria', label: '☂️ Cobertura Provisória',        desc: 'Próxima tempestade não afeta produção',                       price: 85,  effect: 'block_storm' },
  { id: 'bomba_agua',           label: '💧 Bomba d\'Água Manual',        desc: 'Próxima seca não reduz felicidade dos animais',               price: 75,  effect: 'block_drought' },
  { id: 'silagem_premium',      label: '🌽 Silagem Premium',             desc: 'Animais não consomem ração do Armazém por 5 dias',            price: 110, effect: 'silagem_5days' },
  { id: 'anuncio_gazeta',       label: '📰 Anúncio na Gazeta',           desc: 'Mercador retorna garantido no próximo ciclo',                 price: 60,  effect: 'garantir_mercador' },
  { id: 'contrato_transporte',  label: '🚚 Contrato de Transporte',      desc: 'Isenta de multa nas próximas 2 entregas vencidas',            price: 95,  effect: 'isencao_multa_2x' },
] as const;

export type MerchantItemId = typeof MERCHANT_SPECIAL_ITEMS[number]['id'];
