export const MERCHANT_SPECIAL_ITEMS = [
  { id: 'racao_premium',        label: '🥣 Ração Premium',              desc: '+10 de cada tipo de ração no Armazém',                           price: 40,  effect: 'premium_feed' },
  { id: 'bebedouro',            label: '🪣 Bebedouro Automático',        desc: 'Animais nunca ficam com sede',                                   price: 150, effect: 'bebedouro',            oneTime: true },
  { id: 'cert_sanitario',       label: '📜 Certificado Sanitário',       desc: '+10% preço de venda de carne permanente',                        price: 200, effect: 'cert_sanitario',       oneTime: true },
  { id: 'licenca_exotica_item', label: '📋 Licença Exótica',             desc: 'Permite criar Jacaré legalmente',                                price: 280, effect: 'licenca_exotica',      oneTime: true },
  { id: 'licenca_criadouro',    label: '📜 Licença de Criadouro',        desc: 'Permite reprodução controlada de Vaca, Cabra, Ovelha e Galinha', price: 400, effect: 'licenca_criadouro',    oneTime: true },
  { id: 'kit_primeiros_socorros',label: '🩺 Kit de Primeiros Socorros',  desc: 'Cura todos os animais doentes instantaneamente',                  price: 120, effect: 'cure_all_sick' },
  { id: 'manual_producao',      label: '📚 Manual de Produção Avançada', desc: '+15% produção de todos animais por 7 dias',                      price: 160, effect: 'production_boost_7days' },
  { id: 'suplemento_mineral',   label: '💊 Suplemento Mineral',          desc: '+20% produção de leite e ovos por 7 dias',                       price: 90,  effect: 'suplemento_mineral_7days' },
  { id: 'bandagem_vet',         label: '🩹 Bandagem Veterinária',        desc: 'Cura 1 animal doente (o mais grave)',                             price: 45,  effect: 'cure_one_sick' },
  { id: 'cisterna',             label: '🪣 Cisterna de Água',            desc: 'Reduz conta de água em 30% permanente',                          price: 200, effect: 'cisterna',             oneTime: true },
  { id: 'kit_climatico',        label: '🛡️ Kit de Proteção Climática',   desc: 'Próxima tempestade E próxima seca não afetam a fazenda',         price: 130, effect: 'block_storm_drought' },
  { id: 'silagem_premium',      label: '🌽 Silagem Premium',             desc: 'Animais não consomem ração do Armazém por 5 dias',               price: 110, effect: 'silagem_5days' },
  { id: 'contrato_transporte',  label: '🚚 Contrato de Transporte',      desc: 'Isenta de multa nas próximas 3 entregas vencidas',               price: 95,  effect: 'isencao_multa_2x' },
] as const;

export type MerchantItemId = typeof MERCHANT_SPECIAL_ITEMS[number]['id'];
