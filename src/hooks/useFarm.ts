/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Contract, FarmSpecialization, LogMessage } from '../types';

export interface UseFarmProps {
  gold: number;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  checkAndUnlockAchievement: (id: string) => void;
}

// XP cumulativo necessário para ATINGIR cada nível
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 280,
  4: 550,
  5: 950,
  6: 1500,
  7: 2200,
  8: 3100,
  9: 4200,
  10: 5600,
  11: 7300,
  12: 9400,
  13: 11900,
  14: 14900,
  15: 18500,
  16: 22800,
  17: 27800,
  18: 33800,
  19: 40800,
  20: 49000,
};

export const getXpForLevel = (level: number): number =>
  XP_THRESHOLDS[level] ?? (49000 + (level - 20) * 10000);

export const getFarmTitle = (level: number): string => {
  if (level === 1) return "Fazenda Iniciante 🧑‍🌾";
  if (level === 2) return "Fazenda em Família 🥛";
  if (level === 3) return "Fazenda Produtiva 🧶";
  if (level === 4) return "Fazenda Automatizada ⚙️";
  if (level === 5) return "Fazenda Nobre 👑";
  if (level === 6) return "Fazenda Diversificada 🦆";
  if (level === 7) return "Fazenda Especializada 🏅";
  if (level === 8) return "Fazenda Reconhecida ✨";
  if (level === 9) return "Fazenda Exportadora 📦";
  if (level === 10) return "Fazenda Centenária 🌾";
  if (level === 11) return "Fazenda Regional 🗺️";
  if (level === 12) return "Fazenda Premium 💎";
  if (level === 13) return "Fazenda Industrial 🏭";
  if (level === 14) return "Fazenda Nacional 🇧🇷";
  if (level === 15) return "Fazenda Famosa 🌟";
  if (level === 16) return "Fazenda Lendária 🏆";
  if (level === 17) return "Fazenda Continental 🌍";
  if (level === 18) return "Fazenda Imperial 👸";
  if (level === 19) return "Fazenda Épica ⚡";
  if (level === 20) return "Império Aurora 🌌";
  return `Além do Lendário ${'🌌'.repeat(Math.min(3, level - 20))}`;
};

export const getLevelUpDetails = (level: number): { title: string; perks: string[] } => {
  switch (level) {
    case 2:
      return {
        title: "🥛 Fazenda em Família: Novas Fronteiras!",
        perks: [
          "Preço base do Leite Cru subiu de 5 para 6 moedas!",
          "Você já pode comprar Ovelhas fofinhas no Mercado de Animais!",
          "Sistema de Especialização desbloqueado — escolha seu caminho!"
        ]
      };
    case 3:
      return {
        title: "🧶 Fazenda Produtiva & Ateliê Liberados!",
        perks: [
          "Preço base da Lã Crua subiu de 12 para 15 moedas!",
          "Desbloqueada a compra de Bois de Engorda e Codornas no Mercado de Animais!",
          "Desbloqueadas as Máquinas Automatizadas e o Ateliê de Queijos e Cachecóis!",
          "🐦 Codorna: produz 6 ovos/dia, ocupa pouco espaço e consome meia ração!"
        ]
      };
    case 4:
      return {
        title: "⚙️ Fazenda Automatizada e Parcerias Firmadas!",
        perks: [
          "Desconto permanente de 10% na compra de TODOS os Animais!",
          "Desconto permanente de 10% na ração para cuidar do bando!",
          "Contratos de fornecimento disponíveis com o Comerciante Viajante!"
        ]
      };
    case 5:
      return {
        title: "👑 Fazendário Real & Maturação Artesanal!",
        perks: [
          "Bônus de +5 moedas extras na venda de qualquer Boizinho!",
          "Acesso total à Queijaria Artesanal: Queijo Coalho, Muçarela e Brie!",
          "Animais exóticos disponíveis: Búfalo, Pavão e Alpaca!",
          "🦙 Alpaca: lã fina (65💰) a cada 4 dias — cuidado com o calor do verão!",
          "🌿 Especialização Orgânica desbloqueada!"
        ]
      };
    case 6:
      return {
        title: "🦆 Fazenda Diversificada: Novos Produtores!",
        perks: [
          "Poço d'Água e Sistema de Irrigação desbloqueados nas Melhorias!",
          "Queijaria pode ser expandida para novas receitas!",
          "🪱 Minhoca desbloqueada: produz húmus passivamente, nunca precisa de ração!"
        ]
      };
    case 7:
      return {
        title: "🏅 Fazenda Especializada: Rumo ao Topo!",
        perks: [
          "Bônus de +10% nos preços de venda de produtos processados!",
          "Energia Solar disponível nas Melhorias — reduza custos de energia!",
          "Turismo rural desbloqueado: receba visitantes na fazenda!",
          "🐌 Caracol desbloqueado: produz muco cosmético (120💰) — 2x na chuva!"
        ]
      };
    case 8:
      return {
        title: "✨ Fazenda Reconhecida: Mercados Abertos!",
        perks: [
          "Bônus de +15% em todos os produtos — sua reputação cresce!",
          "Seguro Agrícola Premium disponível com cobertura ampliada!",
          "🐇 Coelho Angorá desbloqueado: lã sedosa (90💰) + se reproduz sozinho!",
          "🏆 Especialização Exótica desbloqueada — prepara-se para o jacaré!"
        ]
      };
    case 9:
      return {
        title: "📦 Fazenda Exportadora: Além das Fronteiras!",
        perks: [
          "Bônus de +20% em todos os produtos vendidos!",
          "Contratos de exportação com pagamento dobrado!",
          "Limite de animais expandido: até 30 animais na fazenda!"
        ]
      };
    case 10:
      return {
        title: "🌾 Fazenda Centenária: Marco Histórico!",
        perks: [
          "Bônus de +25% em todos os produtos! +200 moedas de celebração!",
          "🪲 Bicho-da-seda desbloqueado: produz seda bruta (80💰) a cada 14 dias!",
          "⚠️ Bicho-da-seda precisa de Folha de Amoreira diária — sem ela, morre!"
        ]
      };
    case 11:
      return {
        title: "🗺️ Fazenda Regional: Reconhecimento Nacional!",
        perks: [
          `Bônus permanente de +${25 + 3}% em todos os produtos da Aurora!`,
          "Turismo regional aumentado — mais visitantes por semana!",
          "Preparando-se para criações exóticas..."
        ]
      };
    case 12:
      return {
        title: "💎 Fazenda Premium: Produtos Raros!",
        perks: [
          `Bônus permanente de +${25 + 6}% em todos os produtos da Aurora!`,
          "🐸 Rã desbloqueada: produz Coxas de Rã (70💰) — produção dobra na chuva!",
          "Rã requer Poço d'Água (wellLevel >= 1) para sobreviver."
        ]
      };
    case 13:
      return {
        title: "🏭 Fazenda Industrial: Escala Máxima!",
        perks: [
          `Bônus permanente de +${25 + 9}% em todos os produtos da Aurora!`,
          "Capacidade da queijaria expandida — mais prateleiras disponíveis!",
          "Preparando-se para aves de grande porte..."
        ]
      };
    case 14:
      return {
        title: "🇧🇷 Fazenda Nacional: Orgulho do Brasil!",
        perks: [
          `Bônus permanente de +${25 + 12}% em todos os produtos da Aurora!`,
          "Feiras nacionais com prêmios especiais!",
          "Avestruz chegando no próximo nível — prepare espaço e recursos!"
        ]
      };
    case 15:
      return {
        title: "🌟 Fazenda Famosa: Animais de Grande Porte!",
        perks: [
          `Bônus permanente de +${25 + 15}% em todos os produtos da Aurora!`,
          "🦅 Avestruz desbloqueada: penas grandes (60💰) + couro nobre (300💰) ao morrer!",
          "Avestruz come ração de boi — planeje bem o estoque!"
        ]
      };
    case 16:
      return {
        title: "🏆 Fazenda Lendária: Referência Nacional!",
        perks: [
          `Bônus permanente de +${25 + 18}% em todos os produtos da Aurora!`,
          "Turismo lendário — visitantes de todo o país!",
          "2 níveis restantes para o animal mais raro do jogo..."
        ]
      };
    case 17:
      return {
        title: "🌍 Fazenda Continental: Fama Internacional!",
        perks: [
          `Bônus permanente de +${25 + 21}% em todos os produtos da Aurora!`,
          "Exportações premium — contratos internacionais disponíveis!",
          "Adquira a Licença de Fauna Exótica (500💰) para criar o jacaré!"
        ]
      };
    case 18:
      return {
        title: "👸 Fazenda Imperial: O Jacaré Chegou!",
        perks: [
          `Bônus permanente de +${25 + 24}% em todos os produtos da Aurora!`,
          "🐊 Jacaré desbloqueado: couro exótico (400💰) + carne (250💰)!",
          "⚠️ OBRIGATÓRIO: Licença de Fauna Exótica (500💰) — sem ela, multa de 300💰/dia!"
        ]
      };
    case 19:
      return {
        title: "⚡ Fazenda Épica: Quase no Topo!",
        perks: [
          `Bônus permanente de +${25 + 27}% em todos os produtos da Aurora!`,
          "Último nível antes da lenda máxima — consolide seu império!",
          "Todos os animais e produtos do jogo desbloqueados!"
        ]
      };
    case 20:
      return {
        title: "🌌 Império Aurora: Lenda Máxima!",
        perks: [
          `Bônus permanente de +${25 + 30}% em todos os produtos da Aurora!`,
          "Você atingiu o nível máximo! Sua fazenda é uma lenda viva!",
          "Continue expandindo seu império — o céu é o limite! 🚀"
        ]
      };
    default:
      if (level > 20) {
        return {
          title: `🌌 Além do Lendário: Nível ${level}!`,
          perks: [
            `Bônus permanente de +${25 + 30 + (level - 20) * 2}% em todos os produtos!`,
            "Sua fazenda transcendeu os limites conhecidos!"
          ]
        };
      }
      return { title: "", perks: [] };
  }
};

export const getLevelUpGoldCost = (toLevel: number): number => {
  if (toLevel <= 3) return 0;
  if (toLevel === 4) return 500;
  if (toLevel === 5) return 1200;
  if (toLevel <= 8) return 2000 + (toLevel - 6) * 500;
  if (toLevel <= 12) return 4000 + (toLevel - 9) * 800;
  return 7200 + (toLevel - 13) * 1200;
};

export function useFarm({ gold, setGold, checkAndUnlockAchievement }: UseFarmProps) {

  const [farmLevel, setFarmLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).farmLevel ?? 1;
    } catch (e) {}
    return 1;
  });

  const [farmXp, setFarmXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).farmXp ?? 0;
    } catch (e) {}
    return 0;
  });

  const [specialization, setSpecialization] = useState<FarmSpecialization>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).specialization ?? null;
    } catch (e) {}
    return null;
  });

  const [landLots, setLandLots] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.landLots !== undefined) return parsed.landLots;
      }
    } catch (e) {}
    return 1;
  });

  const [hasStable, setHasStable] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).hasStable ?? false;
    } catch (e) {}
    return false;
  });

  const [hasSilo, setHasSilo] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).hasSilo ?? false;
    } catch (e) {}
    return false;
  });

  const [hasFridge, setHasFridge] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).hasFridge ?? false;
    } catch (e) {}
    return false;
  });

  const [hasTipBox, setHasTipBox] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).hasTipBox ?? false;
    } catch (e) {}
    return false;
  });

  const [hasTourism, setHasTourism] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).hasTourism ?? false;
    } catch (e) {}
    return false;
  });

  const [wellLevel, setWellLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.wellLevel !== undefined) return parsed.wellLevel;
      }
    } catch (e) {}
    return 0;
  });

  const [solarLevel, setSolarLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.solarLevel !== undefined) return parsed.solarLevel;
      }
    } catch (e) {}
    return 0;
  });

  const [irrigationLevel, setIrrigationLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.irrigationLevel !== undefined) return parsed.irrigationLevel;
      }
    } catch (e) {}
    return 0;
  });

  const [machines, setMachines] = useState<{
    milkerPurchased: boolean;
    milkerActive: boolean;
    shearerPurchased: boolean;
    shearerActive: boolean;
    feederPurchased: boolean;
    feederActive: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.machines) return parsed.machines;
      }
    } catch (e) {}
    return {
      milkerPurchased: false,
      milkerActive: false,
      shearerPurchased: false,
      shearerActive: false,
      feederPurchased: false,
      feederActive: false
    };
  });

  const [farmWisdomBonus, setFarmWisdomBonus] = useState<{ vaca: number; ovelha: number; boi: number; galinha: number }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.farmWisdomBonus) return parsed.farmWisdomBonus;
      }
    } catch (e) {}
    return { vaca: 0, ovelha: 0, boi: 0, galinha: 0 };
  });

  const [contracts, setContracts] = useState<Contract[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.contracts)) return parsed.contracts;
      }
    } catch (e) {}
    return [];
  });

  /**
   * verificarNivelFazenda: Checks if XP threshold is met and advances farm level.
   * Called inside advanceDay in App.tsx.
   */
  const verificarNivelFazenda = (
    _nextDayVal: number,
    currentLevel: number,
    currentXp: number,
    logs: { msg: string; type: LogMessage['type'] }[]
  ) => {
    if (currentLevel >= 20) return { newLevel: currentLevel, levelUpOccurred: false };
    const xpNeeded = getXpForLevel(currentLevel + 1);
    if (currentXp < xpNeeded) return { newLevel: currentLevel, levelUpOccurred: false };

    const newLevel = currentLevel + 1;
    const goldCost = getLevelUpGoldCost(newLevel);
    if (goldCost > 0 && gold < goldCost) {
      logs.push({
        msg: `⚠️ XP suficiente para Nível ${newLevel}, mas faltam moedas! Precisa de ${goldCost} moedas para subir.`,
        type: 'error'
      });
      return { newLevel: currentLevel, levelUpOccurred: false };
    }
    if (goldCost > 0) {
      setGold(prev => prev - goldCost);
      logs.push({ msg: `💰 Custo de evolução para Nível ${newLevel}: -${goldCost} moedas.`, type: 'system' });
    }
    logs.push({
      msg: `🏆 EXCELENTE! O nível da Fazenda Aurora subiu para o NÍVEL ${newLevel}!`,
      type: 'success'
    });
    if (newLevel === 2) {
      logs.push({ msg: `🥛 Benefício: Preço do Leite Cru subiu para 6 moedas! Especialização disponível!`, type: 'system' });
    } else if (newLevel === 3) {
      logs.push({ msg: `🧶 Benefício: Preço da Lã Crua subiu para 15 moedas! Ateliê desbloqueado!`, type: 'system' });
    } else if (newLevel === 4) {
      logs.push({ msg: `🏷️ Benefício: Desconto de 10% na compra de animais e ração!`, type: 'system' });
    } else if (newLevel === 5) {
      logs.push({ msg: `👑 Benefício: +5 moedas por Boi! Queijaria Artesanal e Búfalo/Pavão disponíveis!`, type: 'system' });
    } else if (newLevel === 10) {
      setGold(prev => prev + 200);
      logs.push({ msg: `🌾 Marco Histórico! Nível 10 atingido! +200 moedas de celebração!`, type: 'success' });
      setTimeout(() => checkAndUnlockAchievement('level_10'), 0);
    } else {
      const bonusPercent = newLevel <= 10 ? (newLevel - 5) * 5 : 25 + (newLevel - 10) * 3;
      logs.push({ msg: `✨ Bônus: +${bonusPercent}% em todos os produtos da fazenda!`, type: 'system' });
    }
    return { newLevel, levelUpOccurred: true };
  };

  return {
    farmLevel,
    setFarmLevel,
    farmXp,
    setFarmXp,
    specialization,
    setSpecialization,
    landLots,
    setLandLots,
    hasStable,
    setHasStable,
    hasSilo,
    setHasSilo,
    hasFridge,
    setHasFridge,
    hasTipBox,
    setHasTipBox,
    hasTourism,
    setHasTourism,
    wellLevel,
    setWellLevel,
    solarLevel,
    setSolarLevel,
    irrigationLevel,
    setIrrigationLevel,
    machines,
    setMachines,
    farmWisdomBonus,
    setFarmWisdomBonus,
    contracts,
    setContracts,
    verificarNivelFazenda,
  };
}
