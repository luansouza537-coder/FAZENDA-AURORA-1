# 🌾 Fazenda Aurora

Simulação agrícola com progressão profunda, economia dinâmica e mais de 19 tipos de animais.

## Sobre o Jogo

Em **Fazenda Aurora** você começa com uma pequena propriedade e 60 moedas. Alimente seus animais, colete recursos, processe produtos artesanais e venda no mercado para expandir sua fazenda.

**Destaques:**
- 19 tipos de animais — vacas, ovelhas, galinhas, lhamas, jacarés e muito mais
- Cadeia de produção: leite → queijo → queijo brie; lã → cachecol; ovos → maionese
- Economia dinâmica com variação de preços, eventos mundiais e mercador viajante
- Sistema de contratos, feiras regionais e prestígio
- Clima, estações e eventos aleatórios que afetam a produção
- Conquistas, especializações de fazenda e trabalhadores contratáveis
- Progressão de 20 níveis até o Império Aurora

## Como Jogar

**Pré-requisitos:** Node.js 18+

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build de produção
npm run build
```

O jogo roda em `http://localhost:3000` e salva automaticamente no localStorage do navegador.

## Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| `F` | Alimentar todos os animais |
| `C` | Coletar toda produção |
| `S` | Vender todos os itens |
| `N` | Avançar dia |
| `P` | Pausar/retomar avanço automático |

## Tecnologias

- React 19 + TypeScript
- Vite + Tailwind CSS
- Web Audio API (efeitos sonoros sintetizados)

## Licença

Apache 2.0 — veja [LICENSE](LICENSE) para detalhes.
