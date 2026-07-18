# Relatório — Rodada 2 de balanceamento (corrida B, 281 dias, build rebalanceado)

Bot v2 (alimenta, coleta, **fabrica derivados na queijaria/tecelagem**, **assina contratos**
de leite/ovos/queijo/lã, vende tudo, compra animais/máquinas/lotes) jogando do dia 1.
Dados: `sim/runs/corrida-B.jsonl`. Comparação com a corrida A (rodada 1, `sim/RELATORIO.md`).

## 1. O rebalanceamento funcionou — validado em corrida limpa

| Nível | Corrida A (custos antigos) | Corrida B (custos novos) |
|---|---|---|
| 5 | dia 91 | dia 71 |
| 6 | dia 221 (preso 126 dias ⚠️) | **dia 103** |
| 7 | — | dia 137 |
| 8 | — | dia 193 |
| 9 | — | **dia 251** |

Progressão contínua do 1 ao 9, sem nenhum nível acima de 2× a média (31d) — o pior foi
o 8 (58 dias). O gold-gate deixou de ser paralisante, mas os custos de 4.000/4.800💰
dos níveis 9/10 já mostram a curva engrossando de novo (56-58 dias por nível).

## 2. Bug real encontrado e corrigido: "Vender Tudo" não creditava contratos

`sellAllItemsNoConfirm` vendia os produtos sem creditar as entregas dos contratos ativos —
só a venda individual creditava. Qualquer jogador que usasse o botão "💰 Vender Tudo"
perdia prêmios semanais e bônus de conclusão silenciosamente. Corrigido extraindo a lógica
para `creditContractDeliveries()` e usando nos dois fluxos (validado por teste E2E).

## 3. Renda: contratos + derivados fazem diferença mensurável

- Dia 37: corrida B com 752💰 vs 454💰 da corrida A (+66%)
- Pico de ouro: 3.946 (B) vs 2.257 (A) — +75%
- Manteiga/iogurte/queijos fabricados diariamente agregam valor sobre o leite cru

## 4. Problemas que permanecem (por prioridade)

1. **Envelhecimento em ondas**: o rebanho caiu 10→7→4 em ~70 dias — as compras são feitas
   juntas e as mortes vêm juntas, derrubando renda e XP de uma vez. A poupança do level-up
   (4.800💰 no Nv10) compete diretamente com a reposição do rebanho. O aviso de velhice
   (já implementado) ajuda, mas vale considerar: reprodução mais acessível no mid-game
   e/ou vida útil maior para animais caros.
2. **Metas de contrato apertadas para rebanhos pequenos**: 38 metas semanais perdidas em
   281 dias, mesmo vendendo a produção inteira todo dia. Revisar o `weeklyGoal` dos
   contratos básicos (ex.: leite 10/sem exige ~2 vacas só para o contrato) ou mostrar
   na carta quantos animais a meta exige.
3. **Lotes 8-10 seguem irreais**: pico de 3.946💰 em 281 dias vs 350k/800k/2M
   (89× / 203× / 507× o pico). Mesmo projetando a renda crescendo 5-10× no late game,
   não fecham. Recomendação: ou reduzir uma ordem de grandeza, ou criar fontes de renda
   proporcionais (contratos corporativos de volume, exportação) como conteúdo de late game.

## 5. Limitações do bot (contexto para os números)

Não faz missões, feiras nem eventos; vende tudo diariamente (derruba o preço dinâmico);
estratégia fixa vacas+galinhas. Jogador real progride mais rápido — os *ratios*
(pico de ouro vs preço dos lotes, XP vs gold-gate) valem mesmo assim.

## Mudanças aplicadas nesta rodada

- `fix`: "Vender Tudo" credita entregas de contratos (`useInventory.ts`)
- Rodada 1 (já aplicada): custos de level-up Nv5-8 reduzidos (`useFarm.ts`)
- Bot v2 + correções de automação (`sim/bot.mjs`)

## Adendo — validação dos ajustes 2 e 4 (corrida B retomada até o dia 387)

Aplicados: metas dos contratos de entrada -30% e level-ups 9-12 → 3000/3600/4200/5000.
Resultado: **nível 10 alcançado no dia ~385**, mesmo após o rebanho ter zerado por velhice
no dia ~320 (recuperação: recomprou 4 vacas, reconstruiu a renda e pagou o level-up em ~35 dias).
O episódio do rebanho zerado é a evidência mais forte do achado nº 1 (reposição de rebanho):
o jogador enfrenta o dilema "poupar para o nível vs repor animais", e escolher errado
custa dezenas de dias.

## Próximos candidatos de balanceamento

1. Suavizar custo dos level-ups 9-12 OU criar renda de contrato proporcional ao nível
2. Rever `weeklyGoal` dos contratos de entrada (lc_01/lc_02/lc_g46/lc_g47)
3. Precificar de novo os Lotes 8-10 quando o late game tiver fontes de renda medidas
4. Mecânica de reposição de rebanho (desconto de recompra, reprodução mid-game)
