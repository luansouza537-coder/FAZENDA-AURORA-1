# Relatório de balanceamento — simulação de progressão (corrida A, 257 dias)

Bot Playwright jogando o jogo real (alimenta, coleta, vende tudo, compra animais/máquinas/lotes),
snapshot diário em `sim/runs/corrida-A.jsonl`. Gerado em 2026-07-17.

## Progressão observada

| Nível | Dia de chegada | Dias no nível | Observação |
|---|---|---|---|
| 1 | 1 | 15 | bootstrap com 2 galinhas é quase break-even (ovos ≈ ração) |
| 2 | 17 | 16 | |
| 3 | 33 | 16 | |
| 4 | 49 | 42 | custo de 500💰 já pesa |
| 5 | 91 | **126** ⚠️ | **gargalo crítico** (ver abaixo) |
| 6 | 221 | — | destravou 4 dias após o rebalanceamento |

## Achado principal: gold-gate do level-up

- No dia 177 o bot tinha **XP 3.265 (suficiente para o nível 8)** e continuava no nível 5.
- Motivo: subir ao nível 6 custava **2.000💰**, e a renda líquida com o lote 1 (5 animais)
  é de ~10-30💰/dia — mais de 100 dias de poupança, com contas semanais comendo o saldo.
- O XP nunca é o limitador a partir do nível 5; o ouro é.

**Ajuste aplicado** (`src/hooks/useFarm.ts`, `getLevelUpGoldCost`):
Nv5 1200→800 · Nv6 2000→1000 · Nv7 2500→1500 · Nv8 3000→2000 · Nv9+ mantidos.
**Validação:** retomando a mesma corrida com o ajuste, o nível 6 saiu em 4 dias.

## Outros achados

1. **Espiral do rebanho envelhecendo**: as vacas compradas nos dias 60-90 morreram de velhice
   perto do dia 210-250, a renda caiu e o jogador (bot) não tinha caixa para repor + poupar o
   próximo nível. Sugestão: aviso de velhice + preço de reposição menor, ou aposentadoria com bônus.
2. **Lotes 6-10 fora da realidade**: pico de ouro da corrida = 2.257💰. Lote 6 (28k) = 12×,
   Lote 8 (350k) = 155×, Lote 10 (2M) = 886× o pico. Mesmo com renda 10× maior no late game,
   os três últimos lotes parecem inalcançáveis sem fontes de renda novas.
3. **Sem quase-falências**: apenas 1 dia com ouro < 50 em 257 dias — a sobrevivência está ok;
   o problema é teto de crescimento, não risco de morte.
4. **Contas semanais** são o principal dreno na fase de 5 animais (água + energia + imposto
   ≈ metade da renda bruta).

## Limitações do bot (ler antes de tirar conclusões)

- Não faz missões, feiras, eventos nem trabalha o mercado (vende tudo diariamente ao preço do dia,
  o que derruba o preço dinâmico) — um jogador real progride mais rápido.
- Não assinou contratos nesta corrida (automação de UI não cobriu o fluxo) — a renda de contratos
  (prêmios semanais + bônus) está subrepresentada; o gargalo real deve ser algo menor que 126 dias,
  mas a ordem de grandeza (XP sobrando, ouro faltando) permanece.
- Estratégia fixa (vacas + galinhas); laticínios processados, queijaria etc. não são usados.

## Próximos passos sugeridos

- Corrida B/C com o build rebalanceado para medir os níveis 6-10.
- Ensinar o bot a assinar contratos e usar a queijaria (renda de processados).
- Revisar preços dos Lotes 8-10 quando houver dados do late game.

## Como reproduzir

```bash
npm run preview -- --port 4174 &
node sim/bot.mjs 40 minha-corrida          # primeira execução
node sim/bot.mjs 40 minha-corrida resume   # blocos seguintes
node sim/report.mjs sim/runs/minha-corrida.jsonl
```
