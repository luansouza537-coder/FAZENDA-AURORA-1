/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Calendar, 
  Plus, 
  RotateCcw, 
  Sparkles, 
  Heart, 
  Check, 
  Clock, 
  Scissors, 
  Beef, 
  ShoppingCart, 
  Pencil, 
  Info, 
  Skull, 
  Utensils, 
  Volume2, 
  VolumeX, 
  TrendingUp,
  History,
  Trash2,
  CheckCircle,
  HelpCircle,
  ChefHat,
  Bell,
  Target,
  BarChart2
} from 'lucide-react';
import { Animal, AnimalType, AnimalTrait, FarmStats, LogMessage, Contract } from './types';
import { getRandomName, getUniqueOxName } from './names';
import { sfx } from './utils/audio';
import SeasonalParticles from './components/SeasonalParticles';

const ACHIEVEMENTS_LIST = [
  { id: 'first_steps', title: 'Primeiros Passos', emoji: '🌱', description: 'Coletou o primeiro leite ou lã' },
  { id: 'master_milk', title: 'Mestre Leiteiro', emoji: '🥛', description: 'Coletou 100 leites no total' },
  { id: 'king_wool', title: 'Rei da Lã', emoji: '🧶', description: 'Coletou 50 lãs no total' },
  { id: 'beef_magnate', title: 'Magnata da Carne', emoji: '🐂', description: 'Vendeu 5 bois de corte' },
  { id: 'animal_friend', title: 'Amigo dos Animais', emoji: '❤️', description: 'Teve 1 vaca, 1 ovelha e 1 boi como "Melhor Amigo" ao mesmo tempo' },
  { id: 'cheese_beginner', title: 'Queijeiro Iniciante', emoji: '🧀', description: 'Iniciou a maturação de 5 queijos no total' },
  { id: 'cheese_master', title: 'Mestre dos Queijos', emoji: '🧀', description: 'Fabricou pelo menos 1 de cada tipo de queijo (Coalho, Muçarela, Brie)' },
  { id: 'cheese_artisan', title: 'Queijeiro Artesanal', emoji: '🧀', description: 'Fabricou 10 queijos no ateliê' },
  { id: 'master_weaver', title: 'Tecelão Mestre', emoji: '🧣', description: 'Teceu 10 cachecóis de lã no ateliê' },
  { id: 'level_5', title: 'Fazenda Nível 5', emoji: '📈', description: 'Alcançou o nível 5 de fazenda' },
  { id: 'merchant_partner', title: 'Parceiro do Mercador', emoji: '🧙‍♂️', description: 'Negociou com o comerciante viajante 5 vezes' },
  { id: 'millionaire', title: 'Milionário', emoji: '💰', description: 'Acumulou 1000 moedas de ouro de saldo' },
];

interface FloatingText {
  id: string;
  emoji: string;
  text: string;
  x: number;
  y: number;
  // BUG 13 FIX: targetX pré-calculado na criação para evitar Math.random() no JSX durante re-render
  targetX: number;
}

interface PriceChartProps {
  history: number[];
  basePrice: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ history, basePrice }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const width = 110;
    const height = 40;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Grid line
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const data = history && history.length > 0 ? history : [basePrice, basePrice, basePrice, basePrice, basePrice, basePrice, basePrice];
    const maxVal = Math.max(...data, basePrice * 1.5);
    const minVal = Math.min(...data, basePrice * 0.5);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    // Draw line
    ctx.strokeStyle = '#2563eb'; // blue-600
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    data.forEach((val, index) => {
      const x = (index / (data.length - 1)) * (width - 8) + 4;
      const y = height - ((val - minVal) / range) * (height - 10) - 5;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw gradient area
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.20)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    data.forEach((val, index) => {
      const x = (index / (data.length - 1)) * (width - 8) + 4;
      const y = height - ((val - minVal) / range) * (height - 10) - 5;
      if (index === 0) {
        ctx.moveTo(x, height);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo((data.length - 1) / (data.length - 1) * (width - 8) + 4, height);
    ctx.closePath();
    ctx.fill();

    // Draw point at current value
    const lastValue = data[data.length - 1];
    const lastX = (data.length - 1) / (data.length - 1) * (width - 8) + 4;
    const lastY = height - ((lastValue - minVal) / range) * (height - 10) - 5;

    ctx.beginPath();
    ctx.arc(lastX, lastY, 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#ef4444'; // Red highlight for current
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.0;
    ctx.stroke();

  }, [history, basePrice]);

  return (
    <div className="flex flex-col items-center bg-[#fafaf9] border border-stone-200 rounded-lg p-1 shrink-0">
      <span className="text-[7.5px] text-stone-400 font-mono font-bold uppercase tracking-widest leading-none mb-0.5">7 Dias</span>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default function App() {
  // --- STATE WITH LOCALSTORAGE INITIALIZATION ---
  const [gold, setGold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).gold ?? 120;
    } catch (e) {}
    return 120;
  });

  const [currentDay, setCurrentDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).currentDay ?? 1;
    } catch (e) {}
    return 1;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sound_enabled');
      if (saved) return JSON.parse(saved) !== false;
    } catch (e) {}
    return true;
  });

  const [farmLevel, setFarmLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).farmLevel ?? 1;
    } catch (e) {}
    return 1;
  });

  const getFarmTitle = (level: number): string => {
    if (level === 1) return "Fazenda Iniciante 🧑‍🌾";
    if (level === 2) return "Fazenda em Família 🥛";
    if (level === 3) return "Fazenda Produtiva 🧶";
    if (level === 4) return "Fazenda Automatizada ⚙️";
    if (level === 5) return "Fazenda Nobre 👑";
    if (level === 6) return "Fazenda Reconhecida ✨";
    if (level === 7) return "Fazenda Famosa 🌟";
    if (level === 8) return "Fazenda Lendária 🏆";
    return `Império Aurora ${'🌌'.repeat(Math.min(3, level - 8))}`;
  };

  const getLevelUpDetails = (level: number): { title: string; perks: string[] } => {
    switch (level) {
      case 2:
        return {
          title: "🥛 Fazenda em Família: Novas Fronteiras!",
          perks: [
            "Preço base do Leite Cru subiu de 5 para 6 moedas!",
            "Você já pode comprar Ovelhas fofinhas no Mercado de Animais!"
          ]
        };
      case 3:
        return {
          title: "🧶 Fazenda Produtiva & Ateliê Liberados!",
          perks: [
            "Preço base da Lã Crua subiu de 12 para 15 moedas!",
            "Desbloqueada a compra de Bois de Engorda no Mercado de Animais!",
            "Desbloqueadas as Máquinas Automatizadas e o Ateliê de Queijos e Cachecóis!"
          ]
        };
      case 4:
        return {
          title: "⚙️ Fazenda Automatizada e Parcerias Firmadas!",
          perks: [
            "Desconto permanente de 10% na compra de TODOS os Animais!",
            "Desconto permanente de 10% na ração para cuidar do bando!"
          ]
        };
      case 5:
        return {
          title: "👑 Fazendário Real & Maturação Artesanal!",
          perks: [
            "Bônus de +5 moedas extras na venda de qualquer Boizinho!",
            "Acesso total à Queijaria Artesanal: Queijo Coalho, Muçarela e Brie!"
          ]
        };
      default:
        if (level > 5) {
          const bonusPercent = (level - 5) * 5;
          return {
            title: `✨ Reputação Avançada: Nível ${level}!`,
            perks: [
              `Sua reputação cresceu! Agora você tem o título de ${getFarmTitle(level)}!`,
              `Bônus permanente de +${bonusPercent}% em todos os produtos vendidos na Aurora!`
            ]
          };
        }
        return { title: "", perks: [] };
    }
  };

  const [inventory, setInventory] = useState<{
    milk: number;
    wool: number;
    cheese: number;
    scarf: number;
    egg: number;
    mayo: number;
    racaoLeite: number;
    racaoOvelha: number;
    racaoBoi: number;
    racaoGalinha: number;
    queijoCoalho: number;
    queijoMucarela: number;
    queijoBrie: number;
  }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        const inv = parsed.inventory || {};
        return {
          milk: inv.milk ?? 0,
          wool: inv.wool ?? 0,
          cheese: inv.cheese ?? 0,
          scarf: inv.scarf ?? 0,
          egg: inv.egg ?? 0,
          mayo: inv.mayo ?? 0,
          racaoLeite: inv.racaoLeite ?? 5,
          racaoOvelha: inv.racaoOvelha ?? 5,
          racaoBoi: inv.racaoBoi ?? 5,
          racaoGalinha: inv.racaoGalinha ?? 5,
          queijoCoalho: inv.queijoCoalho ?? 0,
          queijoMucarela: inv.queijoMucarela ?? 0,
          queijoBrie: inv.queijoBrie ?? 0,
        };
      }
    } catch (e) {}
    return {
      milk: 0,
      wool: 0,
      cheese: 0,
      scarf: 0,
      egg: 0,
      mayo: 0,
      racaoLeite: 5,
      racaoOvelha: 5,
      racaoBoi: 5,
      racaoGalinha: 5,
      queijoCoalho: 0,
      queijoMucarela: 0,
      queijoBrie: 0,
    };
  });

  const [queijosEmMaturacao, setQueijosEmMaturacao] = useState<{ tipo: 'coalho' | 'mucarela' | 'brie'; diasRestantes: number }[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.queijosEmMaturacao) return parsed.queijosEmMaturacao;
      }
    } catch (e) {}
    return [];
  });

  const [maxPrateleiras, setMaxPrateleiras] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.maxPrateleiras !== undefined) return parsed.maxPrateleiras;
      }
    } catch (e) {}
    return 2;
  });

  const [totalQueijosFabricados, setTotalQueijosFabricados] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.totalQueijosFabricados !== undefined) return parsed.totalQueijosFabricados;
      }
    } catch (e) {}
    return 0;
  });

  const [queijosFabricadosTipos, setQueijosFabricadosTipos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.queijosFabricadosTipos) return parsed.queijosFabricadosTipos;
      }
    } catch (e) {}
    return [];
  });

  const [showQueijariaModal, setShowQueijariaModal] = useState<boolean>(false);

  // --- FUNCIONALIDADES 1-12: Novos estados ---

  // F2: Sabedoria permanente de animais idosos falecidos
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

  // F4: Contratos de fornecimento
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
  const [showContractsModal, setShowContractsModal] = useState<boolean>(false);

  // F5: Seguro agrícola
  const [insurance, setInsurance] = useState<{ active: boolean; premium: number; daysLeft: number }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.insurance) return parsed.insurance;
      }
    } catch (e) {}
    return { active: false, premium: 50, daysLeft: 0 };
  });

  // F7: Lotes de terreno
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

  // F8: Poço d'água
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

  // F9: Gerador solar
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

  // F10: Irrigação
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

  // F11: Nível da queijaria (prateleiras)
  const [queijariaNivel, setQueijariaNivel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.queijariaNivel !== undefined) return parsed.queijariaNivel;
      }
    } catch (e) {}
    return 1;
  });

  const [showUpgradesModal, setShowUpgradesModal] = useState<boolean>(false);

  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.priceHistory) return parsed.priceHistory;
      }
    } catch (e) {}
    return {
      milk: [5, 5, 5, 5, 5, 5, 5],
      wool: [12, 12, 12, 12, 12, 12, 12],
      cheese: [20, 20, 20, 20, 20, 20, 20],
      scarf: [30, 30, 30, 30, 30, 30, 30],
      egg: [4, 4, 4, 4, 4, 4, 4],
      mayo: [16, 16, 16, 16, 16, 16, 16],
      queijoCoalho: [14, 14, 14, 14, 14, 14, 14],
      queijoMucarela: [28, 28, 28, 28, 28, 28, 28],
      queijoBrie: [65, 65, 65, 65, 65, 65, 65],
      // BUG 14 FIX: removida chave duplicada 'meat'; 'carne' é o padrão usado no restante do código
      carne: [150, 150, 150, 150, 150, 150, 150]
    };
  });

  const [sellQuantities, setSellQuantities] = useState<Record<string, number>>({
    milk: 1,
    wool: 1,
    cheese: 1,
    scarf: 1,
    egg: 1,
    mayo: 1,
    queijoCoalho: 1,
    queijoMucarela: 1,
    queijoBrie: 1
  });

  const [animals, setAnimals] = useState<Animal[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.animals && parsed.animals.length > 0) return parsed.animals;
      }
    } catch (e) {}
    return []; // Handled by useEffect mount if empty
  });

  const [logs, setLogs] = useState<LogMessage[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.logs && parsed.logs.length > 0) return parsed.logs;
      }
    } catch (e) {}
    return []; // Handled by useEffect mount if empty
  });

  const [stats, setStats] = useState<FarmStats>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).stats ?? { totalEarned: 0, totalFed: 0, totalCollected: 0, totalSold: 0 };
    } catch (e) {}
    return {
      totalEarned: 0,
      totalFed: 0,
      totalCollected: 0,
      totalSold: 0
    };
  });

  const [merchantActive, setMerchantActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).merchantActive ?? false;
    } catch (e) {}
    return false;
  });

  const [daysSinceMerchant, setDaysSinceMerchant] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).daysSinceMerchant ?? 0;
    } catch (e) {}
    return 0;
  });

  const [nextMerchantDay, setNextMerchantDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).nextMerchantDay ?? Math.floor(Math.random() * 5) + 3;
    } catch (e) {}
    return Math.floor(Math.random() * 5) + 3; // 3 to 7 days
  });

  const [weather, setWeather] = useState<'chuva' | 'sol' | 'nublado'>('nublado');
  const [dailyEarning, setDailyEarning] = useState<number>(0);
  const [showBuyMenu, setShowBuyMenu] = useState<boolean>(false);
  const [showTutorialModal, setShowTutorialModal] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'title' | 'game'>('splash');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // New features: Weekly Sales, Previous Prices, Machines and Modals
  const [weeklySales, setWeeklySales] = useState<{ milk: number; wool: number; cheese: number; scarf: number; carne: number; egg: number; mayo: number; queijoCoalho: number; queijoMucarela: number; queijoBrie: number }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.weeklySales) {
          return {
            milk: parsed.weeklySales.milk ?? 0,
            wool: parsed.weeklySales.wool ?? 0,
            cheese: parsed.weeklySales.cheese ?? 0,
            scarf: parsed.weeklySales.scarf ?? 0,
            carne: parsed.weeklySales.carne ?? 0,
            egg: parsed.weeklySales.egg ?? 0,
            mayo: parsed.weeklySales.mayo ?? 0,
            queijoCoalho: parsed.weeklySales.queijoCoalho ?? 0,
            queijoMucarela: parsed.weeklySales.queijoMucarela ?? 0,
            queijoBrie: parsed.weeklySales.queijoBrie ?? 0
          };
        }
      }
    } catch (e) {}
    return { milk: 0, wool: 0, cheese: 0, scarf: 0, carne: 0, egg: 0, mayo: 0, queijoCoalho: 0, queijoMucarela: 0, queijoBrie: 0 };
  });

  const [previousPrices, setPreviousPrices] = useState<{ milk: number; wool: number; cheese: number; scarf: number; carne: number; egg: number; mayo: number; queijoCoalho: number; queijoMucarela: number; queijoBrie: number }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.previousPrices) {
          return {
            milk: parsed.previousPrices.milk ?? 5,
            wool: parsed.previousPrices.wool ?? 12,
            cheese: parsed.previousPrices.cheese ?? 20,
            scarf: parsed.previousPrices.scarf ?? 30,
            carne: parsed.previousPrices.carne ?? 150,
            egg: parsed.previousPrices.egg ?? 4,
            mayo: parsed.previousPrices.mayo ?? 16,
            queijoCoalho: parsed.previousPrices.queijoCoalho ?? 14,
            queijoMucarela: parsed.previousPrices.queijoMucarela ?? 28,
            queijoBrie: parsed.previousPrices.queijoBrie ?? 65
          };
        }
      }
    } catch (e) {}
    return { milk: 5, wool: 12, cheese: 20, scarf: 30, carne: 150, egg: 4, mayo: 16, queijoCoalho: 14, queijoMucarela: 28, queijoBrie: 65 };
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

  const [showAutomationModal, setShowAutomationModal] = useState<boolean>(false);
  const [showMarketModal, setShowMarketModal] = useState<boolean>(false);
  const [showSellAllConfirmModal, setShowSellAllConfirmModal] = useState<boolean>(false);

  // Sleep / Rest state
  const [isSleeping, setIsSleeping] = useState<boolean>(false);
  // BUG 20 FIX: ref para evitar duplo-clique no botão Dormir
  const isSleepingRef = useRef<boolean>(false);

  // Achievements states
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_achievements_save');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [achievementNotification, setAchievementNotification] = useState<{
    id: string;
    title: string;
    emoji: string;
    description: string;
  } | null>(null);
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);

  // Weekly Stats and Modal
  const [weeklyStats, setWeeklyStats] = useState<{
    earnings: number;
    spending: number;
    milk: number;
    wool: number;
    oxSold: number;
    cheese: number;
    scarf: number;
    egg: number;
    mayo: number;
  }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.weeklyStats) {
          return {
            earnings: parsed.weeklyStats.earnings ?? 0,
            spending: parsed.weeklyStats.spending ?? 0,
            milk: parsed.weeklyStats.milk ?? 0,
            wool: parsed.weeklyStats.wool ?? 0,
            oxSold: parsed.weeklyStats.oxSold ?? 0,
            cheese: parsed.weeklyStats.cheese ?? 0,
            scarf: parsed.weeklyStats.scarf ?? 0,
            egg: parsed.weeklyStats.egg ?? 0,
            mayo: parsed.weeklyStats.mayo ?? 0
          };
        }
      }
    } catch (e) {}
    return { earnings: 0, spending: 0, milk: 0, wool: 0, oxSold: 0, cheese: 0, scarf: 0, egg: 0, mayo: 0 };
  });

  const [weeklyReportData, setWeeklyReportData] = useState<{
    earnings: number;
    spending: number;
    milk: number;
    wool: number;
    oxSold: number;
    cheese: number;
    scarf: number;
    egg: number;
    mayo: number;
  } | null>(null);
  const [showWeeklyReport, setShowWeeklyReport] = useState<boolean>(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState<number | null>(null);

  // --- FUNCIONALIDADE 1: Auto-avanço ---
  const [autoAdvance, setAutoAdvance] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(5); // segundos

  // --- FUNCIONALIDADE 3: Missões ---
  interface Mission {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly';
    goal: number;
    current: number;
    reward: number;
    expiresOnDay: number;
    completed: boolean;
    claimed: boolean;
    missionKey: 'sell_milk' | 'sell_any' | 'happy_animals' | 'earn_gold' | 'feed_animals' | 'collect_items';
  }
  // BUG 9 FIX: restaura missões do save (eram perdidas ao recarregar)
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.missions)) return parsed.missions;
      }
    } catch (e) {}
    return [];
  });
  const [showMissionsModal, setShowMissionsModal] = useState<boolean>(false);

  // --- FUNCIONALIDADE 4: Notificações persistentes ---
  interface GameNotification {
    id: string;
    message: string;
    type: 'success' | 'event' | 'warning' | 'system';
    day: number;
    read: boolean;
  }
  // BUG 9 FIX: restaura notificações do save (eram perdidas ao recarregar)
  const [notifications, setNotifications] = useState<GameNotification[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.notifications)) return parsed.notifications;
      }
    } catch (e) {}
    return [];
  });
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // --- FUNCIONALIDADE 5: Histórico de ganhos ---
  // BUG 9 FIX: restaura earningsHistory e allTimeStats do save persistido
  const [earningsHistory, setEarningsHistory] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.earningsHistory)) return parsed.earningsHistory;
      }
    } catch (e) {}
    return [];
  });
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [productionByAnimal, setProductionByAnimal] = useState<Record<number, { name: string; type: string; produced: number }>>({});
  const [allTimeStats, setAllTimeStats] = useState<{ totalSpentFeed: number; bestDay: number; worstDay: number }>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.allTimeStats) return parsed.allTimeStats;
      }
    } catch (e) {}
    return { totalSpentFeed: 0, bestDay: 0, worstDay: 0 };
  });

  // Rename interface state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempName, setTempName] = useState<string>('');

  // Floating text / particles / confetti
  const [floaters, setFloaters] = useState<FloatingText[]>([]);
  interface ConfettiParticle {
    id: string;
    emoji: string;
    x: number;
    y: number;
    // BUG 17 FIX: targetY/targetX calculados uma vez na criação para evitar Math.random() no JSX
    targetY: number;
    targetX: number;
    scale: number;
    angle: number;
  }
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  // Ref to follow the scroll in the logs panel
  const logsEndRef = useRef<HTMLDivElement>(null);

  // --- AUDIO HELPER ---
  const triggerAudioResult = (action: () => void) => {
    if (soundEnabled) {
      action();
    }
  };

  // --- FLOATING FEEDBACK SPAWNER ---
  const spawnFeedback = (emoji: string, text: string, event?: React.MouseEvent) => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2 - 50;
    if (event && event.currentTarget) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      x = event.clientX - rect.left + (Math.random() * 40 - 20);
      y = event.clientY - rect.top - 10;
    } else {
      x += (Math.random() * 80 - 40);
      y += (Math.random() * 40 - 20);
    }
    
    const newFloater: FloatingText = {
      id: Math.random().toString(36).substring(2, 9),
      emoji,
      text,
      x,
      y,
      // BUG 13 FIX: targetX pré-calculado para evitar Math.random() no JSX
      targetX: x + (Math.random() * 40 - 20)
    };
    
    setFloaters(prev => [...prev, newFloater]);
    setTimeout(() => {
      setFloaters(prev => prev.filter(f => f.id !== newFloater.id));
    }, 1500);
  };

  // --- CONFETTI SPAWNER ---
  const triggerConfetti = (event?: React.MouseEvent) => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      x = event.clientX;
      y = event.clientY;
    }
    
    const elements = ['🎉', '✨', '🏆', '💰', '🌟', '🍀', '❤️'];
    // BUG 17 FIX: targetY e targetX calculados na criação para evitar Math.random() no JSX durante re-render
    const newParticles: ConfettiParticle[] = Array.from({ length: 25 }).map((_, i) => {
      const px = x + (Math.random() * 100 - 50);
      const py = y + (Math.random() * 40 - 20);
      return {
        id: Math.random().toString(36).substring(2, 9),
        emoji: elements[Math.floor(Math.random() * elements.length)],
        x: px,
        y: py,
        targetY: py - 180 - Math.random() * 100,
        targetX: px + (Math.random() * 160 - 80),
        scale: 0.6 + Math.random() * 1.0,
        angle: Math.random() * 360
      };
    });

    setConfetti(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setConfetti(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1600);
  };

  // --- INITIALIZE GAME ---
  const initGame = () => {
    localStorage.removeItem('aurora_farm_save');
    setGold(120);
    setCurrentDay(1);
    setFarmLevel(1);
    setInventory({
      milk: 0,
      wool: 0,
      cheese: 0,
      scarf: 0,
      egg: 0,
      mayo: 0,
      racaoLeite: 5,
      racaoOvelha: 5,
      racaoBoi: 5,
      racaoGalinha: 5,
      queijoCoalho: 0,
      queijoMucarela: 0,
      queijoBrie: 0
    });
    setPriceHistory({
      milk: [5, 5, 5, 5, 5, 5, 5],
      wool: [12, 12, 12, 12, 12, 12, 12],
      cheese: [20, 20, 20, 20, 20, 20, 20],
      scarf: [30, 30, 30, 30, 30, 30, 30],
      egg: [4, 4, 4, 4, 4, 4, 4],
      mayo: [16, 16, 16, 16, 16, 16, 16],
      queijoCoalho: [14, 14, 14, 14, 14, 14, 14],
      queijoMucarela: [28, 28, 28, 28, 28, 28, 28],
      queijoBrie: [65, 65, 65, 65, 65, 65, 65],
      // BUG 14 FIX: removida chave duplicada 'meat'
      carne: [150, 150, 150, 150, 150, 150, 150]
    });
    setQueijosEmMaturacao([]);
    setMaxPrateleiras(2);
    setTotalQueijosFabricados(0);
    setQueijosFabricadosTipos([]);
    setMerchantActive(false);
    setDaysSinceMerchant(0);
    setNextMerchantDay(Math.floor(Math.random() * 5) + 3);
    setWeather('nublado');
    setDailyEarning(0);
    setWeeklyStats({ earnings: 0, spending: 0, milk: 0, wool: 0, oxSold: 0, cheese: 0, scarf: 0, egg: 0, mayo: 0 });
    setWeeklySales({ milk: 0, wool: 0, cheese: 0, scarf: 0, carne: 0, egg: 0, mayo: 0, queijoCoalho: 0, queijoMucarela: 0, queijoBrie: 0 });
    setPreviousPrices({ milk: 5, wool: 12, cheese: 20, scarf: 30, carne: 150, egg: 4, mayo: 16, queijoCoalho: 14, queijoMucarela: 28, queijoBrie: 65 });
    setMachines({
      milkerPurchased: false,
      milkerActive: false,
      shearerPurchased: false,
      shearerActive: false,
      feederPurchased: false,
      feederActive: false
    });
    setStats({
      totalEarned: 0,
      totalFed: 0,
      totalCollected: 0,
      totalSold: 0,
      totalMilk: 0,
      totalWool: 0,
      totalOxSold: 0,
      totalCheese: 0,
      totalScarf: 0,
      totalEggs: 0,
      totalMayo: 0,
      totalMerchantTrades: 0
    });
    
    // BUG 5 FIX: animais iniciais agora recebem `trait` aleatório, igual aos comprados via buyAnimal.
    const initialAnimals: Animal[] = [
      {
        id: 1,
        type: 'vaca',
        name: 'Mimosa',
        hunger: 85,
        happiness: 80,
        hasProducedToday: true,
        consecutiveHappyDays: 0,
        daysBelow80: 0,
        isBestFriend: false,
        trait: getRandomTrait()
      },
      {
        id: 2,
        type: 'ovelha',
        name: 'Puffy',
        hunger: 78,
        happiness: 82,
        daysUntilWool: 3,
        daysSinceLastWool: 2,
        woolReady: false,
        consecutiveHappyDays: 0,
        daysBelow80: 0,
        isBestFriend: false,
        trait: getRandomTrait()
      },
      {
        id: 3,
        type: 'boi',
        name: getUniqueOxName([]),
        hunger: 75,
        happiness: 70,
        weightGain: 0.15,
        consecutiveHappyDays: 0,
        daysBelow80: 0,
        isBestFriend: false,
        trait: getRandomTrait()
      }
    ];

    const updated = initialAnimals.map(a => {
      if (a.type === 'ovelha' && (a.daysSinceLastWool || 0) >= (a.daysUntilWool || 3)) {
        return { ...a, woolReady: true };
      }
      return a;
    });

    setAnimals(updated);
    
    const initLogs: LogMessage[] = [
      {
        id: 'init-1',
        day: 1,
        message: '🌱 Bem-vindo à Fazenda Aurora! Cuide dos seus animais, fabrique queijos e cachecóis selvagens, e fature alto!',
        type: 'system'
      },
      {
        id: 'init-2',
        day: 1,
        message: '🐄 Mimosa (vaca) está cheia de leite pronto para ser coletado!',
        type: 'info'
      }
    ];
    setLogs(initLogs);
    // BUG 3 FIX: limpa conquistas ao reiniciar o jogo
    setUnlockedAchievements([]);
    localStorage.removeItem('aurora_achievements_save');
    // BUG 12 FIX: zera os campos das novas funcionalidades ao reiniciar
    setEarningsHistory([]);
    setAllTimeStats({ totalSpentFeed: 0, bestDay: 0, worstDay: 0 });
    setMissions([]);
    setNotifications([]);
    triggerAudioResult(() => sfx.playSound('feed'));
  };

  // Run on mount
  useEffect(() => {
    const saved = localStorage.getItem('aurora_farm_save');
    if (!saved) {
      initGame();
    }
  }, []);

  // Splash Screen progress simulator and auto-transition to title screen
  useEffect(() => {
    if (currentScreen === 'splash') {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setCurrentScreen('title');
            }, 300);
            return 100;
          }
          return prev + 5;
        });
      }, 90);
      return () => clearInterval(interval);
    }
  }, [currentScreen]);

  // Unlocks audio context on user interaction to abide by modern browser policies
  useEffect(() => {
    const unlockAudio = () => {
      sfx.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Keyboard Shortcuts (D, S, M, H, 1, 2, 3, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut interference when typing inside input elements
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          setEditingId(null);
        }
        return;
      }

      const key = e.key.toLowerCase();

      if (e.key === 'Escape') {
        setShowTutorialModal(false);
        setShowMarketModal(false);
        setShowAutomationModal(false);
        setShowAchievementsModal(false);
        setShowWeeklyReport(false);
        setShowSellAllConfirmModal(false);
        setShowBuyMenu(false);
      } else if (key === 'd' || key === 's') {
        advanceDay(null as any);
      } else if (key === 'm') {
        setShowMarketModal(prev => !prev);
      } else if (key === 'h') {
        setShowTutorialModal(prev => !prev);
      } else if (key === '1') {
        craftCheese();
      } else if (key === '2') {
        craftScarf();
      } else if (key === '3') {
        craftMayonese(null as any);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  // BUG 9 FIX: adicionadas dependências faltantes para evitar valores stale no handler de teclado
  }, [animals, inventory, currentDay, weather, weeklySales, showBuyMenu, machines, farmLevel, queijosEmMaturacao, merchantActive, daysSinceMerchant, nextMerchantDay, dailyEarning, weeklyStats]);

  // Sync log scrollbar
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Persist State Updates Automatically to LocalStorage
  useEffect(() => {
    // Prevent wiping save if loaded empty
    if (animals.length > 0 || currentDay > 1 || gold !== 120) {
      const saveData = {
        gold,
        currentDay,
        farmLevel,
        inventory,
        animals,
        stats,
        merchantActive,
        daysSinceMerchant,
        nextMerchantDay,
        logs,
        weeklyStats,
        weeklySales,
        previousPrices,
        machines,
        priceHistory,
        queijosEmMaturacao,
        maxPrateleiras,
        totalQueijosFabricados,
        queijosFabricadosTipos,
        // BUG 9 FIX: persiste histórico de ganhos e estatísticas all-time (eram perdidas ao recarregar)
        earningsHistory,
        allTimeStats,
        missions,
        notifications,
        // Novas funcionalidades
        farmWisdomBonus,
        contracts,
        insurance,
        landLots,
        wellLevel,
        solarLevel,
        irrigationLevel,
        queijariaNivel
      };
      localStorage.setItem('aurora_farm_save', JSON.stringify(saveData));
    }
  }, [gold, currentDay, farmLevel, inventory, animals, stats, merchantActive, daysSinceMerchant, nextMerchantDay, logs, weeklyStats, weeklySales, previousPrices, machines, priceHistory, queijosEmMaturacao, maxPrateleiras, totalQueijosFabricados, queijosFabricadosTipos, earningsHistory, allTimeStats, missions, notifications]);

  // Centralized achievement condition checker
  // BUG 5 FIX: usa callback funcional para evitar perda de conquistas quando múltiplas são desbloqueadas
  const checkAndUnlockAchievement = (id: string) => {
    const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
    if (!ach) return;

    setUnlockedAchievements(prev => {
      if (prev.includes(id)) return prev;
      const newList = [...prev, id];
      localStorage.setItem('aurora_achievements_save', JSON.stringify(newList));
      return newList;
    });

    // Show popup (we call this outside the setState to avoid closure issues;
    // it may fire even if already unlocked but that's acceptable UX)
    setAchievementNotification(prev => {
      // Only show if not already shown for the same achievement
      if (prev?.id === id) return prev;
      return {
        id: ach.id,
        title: ach.title,
        emoji: ach.emoji,
        description: ach.description
      };
    });

    // Play level up chime
    triggerAudioResult(() => sfx.playSound('levelup'));
  };

  const triggerAchievementCheck = (
    currentStats: FarmStats = stats,
    currentGold = gold,
    currentLevel = farmLevel,
    currentAnimals = animals
  ) => {
    // 1. 🌱 Primeiros Passos: Coletar o primeiro leite ou lã
    const hasFirstItems = (currentStats.totalMilk || 0) > 0 || (currentStats.totalWool || 0) > 0;
    if (hasFirstItems) {
      checkAndUnlockAchievement('first_steps');
    }

    // 2. 🥛 Mestre Leiteiro: Coletar 100 leites no total
    if ((currentStats.totalMilk || 0) >= 100) {
      checkAndUnlockAchievement('master_milk');
    }

    // 3. 🧶 Rei da Lã: Coletar 50 lãs no total
    if ((currentStats.totalWool || 0) >= 50) {
      checkAndUnlockAchievement('king_wool');
    }

    // 4. 🐂 Magnata da Carne: Vender 5 bois
    if ((currentStats.totalOxSold || 0) >= 5) {
      checkAndUnlockAchievement('beef_magnate');
    }

    // 5. ❤️ Amigo dos Animais: Ter 1 vaca, 1 ovelha e 1 boi como "Melhor Amigo" ao mesmo tempo
    const bestFriends = currentAnimals.filter(a => a.isBestFriend);
    const uniqueFriendTypes = new Set(bestFriends.map(a => a.type));
    if (uniqueFriendTypes.has('vaca') && uniqueFriendTypes.has('ovelha') && uniqueFriendTypes.has('boi')) {
      checkAndUnlockAchievement('animal_friend');
    }

    // 6. 🧀 Queijeiro Artesanal: Fazer 10 queijos
    if ((currentStats.totalCheese || 0) >= 10) {
      checkAndUnlockAchievement('cheese_artisan');
    }

    // 6b. 🧀 Queijeiro Iniciante: fabricar 5 queijos no total
    if ((totalQueijosFabricados || 0) >= 5) {
      checkAndUnlockAchievement('cheese_beginner');
    }

    // 6c. 🧀 Mestre dos Queijos: fabricar pelo menos 1 de cada tipo
    if (queijosFabricadosTipos.includes('coalho') && queijosFabricadosTipos.includes('mucarela') && queijosFabricadosTipos.includes('brie')) {
      checkAndUnlockAchievement('cheese_master');
    }

    // 7. 🧣 Tecelão Mestre: Fazer 10 cachecóis
    if ((currentStats.totalScarf || 0) >= 10) {
      checkAndUnlockAchievement('master_weaver');
    }

    // 8. 📈 Fazenda Nível 5: Alcançar nível 5 de fazenda
    if (currentLevel >= 5) {
      checkAndUnlockAchievement('level_5');
    }

    // 9. 🧙‍♂️ Parceiro do Mercador: Negociar com o comerciante viajante 5 vezes
    if ((currentStats.totalMerchantTrades || 0) >= 5) {
      checkAndUnlockAchievement('merchant_partner');
    }

    // 10. 💰 Milionário: Acumular 1000 moedas
    if (currentGold >= 1000) {
      checkAndUnlockAchievement('millionaire');
    }
  };

  // Monitor states to unlock achievements dynamically
  useEffect(() => {
    if (currentScreen === 'game') {
      triggerAchievementCheck(stats, gold, farmLevel, animals);
    }
  }, [stats, gold, farmLevel, animals, currentScreen, totalQueijosFabricados, queijosFabricadosTipos]);

  useEffect(() => {
    if (achievementNotification) {
      const t = setTimeout(() => {
        setAchievementNotification(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [achievementNotification]);

  useEffect(() => {
    localStorage.setItem('sound_enabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    if (showLevelUpModal) {
      triggerConfetti();
      const t1 = setTimeout(() => triggerConfetti(), 250);
      const t2 = setTimeout(() => triggerConfetti(), 550);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [showLevelUpModal]);

  // --- FUNCIONALIDADE 1: Auto-avanço useEffect ---
  // isGameOver derivado antecipado para uso no useEffect de auto-avanço (preço mínimo galinha = 40 moedas base)
  const isGameOverForAutoAdvance = animals.length === 0 && gold < 40;

  // BUG 1 FIX: advanceDayRef é declarado logo após advanceDay (ver abaixo).
  // Este ref será atribuído ali; o useEffect do auto-avanço o usa aqui.
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const advanceDayRef = useRef<(e: React.MouseEvent) => void>(() => {});

  useEffect(() => {
    if (!autoAdvance || isGameOverForAutoAdvance || isSleeping) return;
    const anyModalOpen = showBuyMenu || showLevelUpModal !== null || showWeeklyReport || showTutorialModal || showAchievementsModal || showAutomationModal || showMarketModal || showSellAllConfirmModal || showQueijariaModal || showMissionsModal || showNotifications || showStatsModal;
    if (anyModalOpen) return;

    const interval = setInterval(() => {
      if (!isSleepingRef.current) {
        isSleepingRef.current = true;
        setIsSleeping(true);
        setTimeout(() => {
          advanceDayRef.current(null as any);
          setIsSleeping(false);
          isSleepingRef.current = false;
        }, 1000);
      }
    }, autoSpeed * 1000);

    return () => clearInterval(interval);
  }, [autoAdvance, autoSpeed, isGameOverForAutoAdvance, isSleeping, showBuyMenu, showLevelUpModal, showWeeklyReport, showTutorialModal, showAchievementsModal, showAutomationModal, showMarketModal, showSellAllConfirmModal, showQueijariaModal, showMissionsModal, showNotifications, showStatsModal]);

  // Initialize missions on first load if empty
  useEffect(() => {
    if (missions.length === 0 && currentScreen === 'game') {
      const dailies = generateDailyMissions(currentDay);
      const weeklies = generateWeeklyMissions(currentDay);
      setMissions([...dailies, ...weeklies]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen]);

  // Add a log entry dynamically
  // BUG 18 FIX: parâmetro overrideDay permite registrar dia correto dentro de advanceDay
  const addLog = (msg: string, type: LogMessage['type'] = 'info', overrideDay?: number) => {
    const newLog: LogMessage = {
      id: Math.random().toString(36).substring(2, 9),
      day: overrideDay ?? currentDay,
      message: msg,
      type
    };
    setLogs(prev => [...prev.slice(-25), newLog]); // Keep up to 25 logs
  };

  // --- FUNCIONALIDADE 4: Adicionar notificação persistente ---
  // BUG FIX: aceita overrideDay para que notificações disparadas via setTimeout dentro de
  // advanceDay (onde currentDay ainda não foi atualizado) registrem o dia correto.
  const addNotification = (message: string, type: GameNotification['type'] = 'system', overrideDay?: number) => {
    setNotifications(prev => {
      const newNotif: GameNotification = {
        id: Math.random().toString(36).substr(2, 9),
        message,
        type,
        day: overrideDay ?? currentDay,
        read: false,
      };
      return [newNotif, ...prev].slice(0, 20);
    });
  };

  // --- FUNCIONALIDADE 2: Traits dos animais ---
  const TRAITS_LIST: AnimalTrait[] = ['gulosa', 'preguicosa', 'feliz', 'estressada', 'saudavel', 'trabalhadora'];
  const getRandomTrait = (): AnimalTrait => TRAITS_LIST[Math.floor(Math.random() * TRAITS_LIST.length)];
  const getTraitInfo = (trait: AnimalTrait): { emoji: string; label: string; description: string } => {
    switch (trait) {
      case 'gulosa': return { emoji: '🍽️', label: 'Gulosa', description: 'Consome +20% de ração por dia (fome cai mais rápido)' };
      case 'preguicosa': return { emoji: '😴', label: 'Preguiçosa', description: 'Produz -15% (menos leite/lã/ovos)' };
      case 'feliz': return { emoji: '😊', label: 'Feliz', description: '+5 de felicidade por dia sem custo extra' };
      case 'estressada': return { emoji: '😰', label: 'Estressada', description: 'Perde -5 de felicidade por dia mesmo alimentada' };
      case 'saudavel': return { emoji: '💪', label: 'Saudável', description: 'Imune a eventos negativos de saúde' };
      case 'trabalhadora': return { emoji: '⚡', label: 'Trabalhadora', description: 'Produz +15%' };
    }
  };

  // --- FUNCIONALIDADE 3: Geração de missões ---
  const generateDailyMissions = (day: number): Mission[] => {
    const missions: Mission[] = [
      {
        id: `daily_milk_${day}`,
        title: 'Leiteiro Dedicado',
        description: 'Venda 5 litros de leite hoje',
        type: 'daily',
        goal: 5,
        current: 0,
        reward: 30,
        expiresOnDay: day + 1,
        completed: false,
        claimed: false,
        missionKey: 'sell_milk'
      },
      {
        id: `daily_collect_${day}`,
        title: 'Colheita do Dia',
        description: 'Colete 3 itens hoje (leite, lã ou ovos)',
        type: 'daily',
        goal: 3,
        current: 0,
        reward: 25,
        expiresOnDay: day + 1,
        completed: false,
        claimed: false,
        missionKey: 'collect_items'
      },
      {
        id: `daily_happy_${day}`,
        title: 'Fazenda Feliz',
        description: 'Mantenha todos os animais com felicidade > 70%',
        type: 'daily',
        goal: 1,
        current: 0,
        reward: 50,
        expiresOnDay: day + 1,
        completed: false,
        claimed: false,
        missionKey: 'happy_animals'
      }
    ];
    return missions;
  };

  const generateWeeklyMissions = (day: number): Mission[] => {
    return [
      {
        id: `weekly_gold_${day}`,
        title: 'Capitalista Semanal',
        description: 'Ganhe 200 moedas esta semana',
        type: 'weekly',
        goal: 200,
        current: 0,
        reward: 100,
        expiresOnDay: day + 7,
        completed: false,
        claimed: false,
        missionKey: 'earn_gold'
      },
      {
        id: `weekly_feed_${day}`,
        title: 'Cuidador de Rebanho',
        description: 'Alimente animais 10 vezes esta semana',
        type: 'weekly',
        goal: 10,
        current: 0,
        reward: 80,
        expiresOnDay: day + 7,
        completed: false,
        claimed: false,
        missionKey: 'feed_animals'
      }
    ];
  };

  // BUG 11 FIX: aceita overrideDay para que notificações disparadas dentro de advanceDay
  // (onde currentDay ainda não foi atualizado pelo React) registrem o dia correto.
  const updateMissionProgress = (key: Mission['missionKey'], amount: number = 1, overrideDay?: number) => {
    setMissions(prev => prev.map(m => {
      if (m.completed || m.claimed) return m;
      if (m.missionKey !== key) return m;
      const newCurrent = Math.min(m.goal, m.current + amount);
      const nowCompleted = newCurrent >= m.goal;
      if (nowCompleted && !m.completed) {
        addNotification(`🎯 Missão "${m.title}" concluída! Clique em Missões para resgatar ${m.reward} moedas!`, 'success', overrideDay);
      }
      return { ...m, current: newCurrent, completed: nowCompleted };
    }));
  };

  // --- ACTIONS ---

  // 1. Rename Animal
  const startRename = (id: number, currentName: string) => {
    setEditingId(id);
    setTempName(currentName);
    triggerAudioResult(() => sfx.playSound('click'));
  };

  const saveRename = (id: number) => {
    if (!tempName.trim()) return;
    setAnimals(prev => prev.map(a => a.id === id ? { ...a, name: tempName.trim() } : a));
    addLog(`✏️ O animal id #${id} foi rebatizado de "${tempName.trim()}"!`);
    setEditingId(null);
    triggerAudioResult(() => sfx.playSound('click'));
  };

  // 2. Feed Animal (Consumes 1 corresponding feed item from inventory)
  const feedAnimal = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal) return;
    
    let feedType: 'racaoLeite' | 'racaoOvelha' | 'racaoBoi' | 'racaoGalinha' = 'racaoLeite';
    let feedLabel = 'Ração de Vaca';
    if (animal.type === 'ovelha') { feedType = 'racaoOvelha'; feedLabel = 'Ração de Ovelha'; }
    else if (animal.type === 'boi') { feedType = 'racaoBoi'; feedLabel = 'Ração de Boi'; }
    else if (animal.type === 'galinha') { feedType = 'racaoGalinha'; feedLabel = 'Ração de Galinha'; }
    
    if ((inventory[feedType] ?? 0) < 1) {
      addLog(`🌽 Ração insuficiente para alimentar ${animal.name}! Compre mais ${feedLabel} no Silo de Rações.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Sem Ração!', event);
      return;
    }

    setInventory(prev => ({
      ...prev,
      [feedType]: prev[feedType] - 1
    }));

    setAnimals(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          hunger: Math.min(100, a.hunger + 35),
          happiness: Math.min(100, a.happiness + 12)
        };
      }
      return a;
    }));

    setStats(prev => ({ ...prev, totalFed: prev.totalFed + 1 }));
    addLog(`🌽 Você alimentou ${animal.name} com ${feedLabel}! +Fome +Felicidade.`, 'success');
    triggerAudioResult(() => sfx.playSound('feed'));
    spawnFeedback('🌽', '+Fome!', event);
    // Missão: alimentar animais
    updateMissionProgress('feed_animals', 1);
  };

  // Feed pricing helpers
  const getFeedBasePrice = (type: 'racaoLeite' | 'racaoOvelha' | 'racaoBoi' | 'racaoGalinha'): number => {
    if (type === 'racaoLeite') return 2;
    if (type === 'racaoOvelha') return 2;
    if (type === 'racaoBoi') return 3;
    if (type === 'racaoGalinha') return 1;
    return 2;
  };

  const getFeedPriceWithModifiers = (type: 'racaoLeite' | 'racaoOvelha' | 'racaoBoi' | 'racaoGalinha', day = currentDay): number => {
    let base = getFeedBasePrice(type);
    
    // Desconto de 10% no nível 4 ou superior
    if (farmLevel >= 4) {
      base = Math.max(1, Math.round(base * 0.9));
    }

    const estacao = getEstacaoKey(day);
    if (estacao === 'inverno') {
      return Math.max(1, Math.round(base * 1.5));
    }
    return base;
  };

  // Buy feed packages with bulk discounts
  const buyFeed = (
    type: 'racaoLeite' | 'racaoOvelha' | 'racaoBoi' | 'racaoGalinha',
    quantity: 1 | 10 | 50,
    event: React.MouseEvent
  ) => {
    if (event) event.preventDefault();
    const pricePerUnit = getFeedPriceWithModifiers(type);
    let totalCost = pricePerUnit * quantity;
    
    if (quantity === 10) {
      totalCost = Math.floor(totalCost * 0.95); // 5% discount
    } else if (quantity === 50) {
      totalCost = Math.floor(totalCost * 0.88); // 12% discount
    }
    
    if (gold < totalCost) {
      addLog(`💰 Moedas insuficientes! Requer ${totalCost} moedas para levar ${quantity} units.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Falta 💰!', event);
      return;
    }
    
    setGold(prev => prev - totalCost);
    setInventory(prev => ({
      ...prev,
      [type]: (prev[type] ?? 0) + quantity
    }));
    setWeeklyStats(prev => ({
      ...prev,
      spending: prev.spending + totalCost
    }));
    
    const feedLabel = type === 'racaoLeite' ? 'Ração de Vaca' : type === 'racaoOvelha' ? 'Ração de Ovelha' : type === 'racaoBoi' ? 'Ração de Boi' : 'Ração de Galinha';
    addLog(`🛍️ Compra realizada: +${quantity}u de ${feedLabel} por ${totalCost} moedas!`, 'success');
    triggerAudioResult(() => sfx.playSound('click'));
    spawnFeedback('🌽', `-${totalCost}💰`, event);
  };

  // Collect Egg (Galinha)
  const collectEgg = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'galinha') return;

    if (!animal.hasProducedToday) {
      addLog(`🥚 ${animal.name} já teve seu ovo coletado ou não produziu hoje!`, 'error');
      spawnFeedback('⏳', 'Vazia', event);
      return;
    }

    let efficiency = (animal.happiness / 100) * (1 - (Math.max(0, 100 - animal.hunger) / 200));
    efficiency = Math.max(0.3, Math.min(1.2, efficiency));

    let baseOvo = 1;
    let bonus = (efficiency > 0.8) ? 1 : 0;
    let totalOvos = baseOvo + (Math.random() < 0.4 ? bonus : 0);

    if (animal.isBestFriend) {
      totalOvos += 1;
    }
    // BUG 6 FIX: aplica efeito de trait de produção (trabalhadora +15%, preguicosa -15%)
    if (animal.trait === 'trabalhadora') {
      totalOvos = Math.max(1, Math.round(totalOvos * 1.15));
    } else if (animal.trait === 'preguicosa') {
      totalOvos = Math.max(1, Math.round(totalOvos * 0.85));
    }
    
    // Bônus de bando: cada 2 galinhas adicionais na fazenda além da primeira concede +1 ovo extra (distribuído de forma probabilística por coleta diária para evitar multiplicação)
    const totalGalinhas = animals.filter(a => a.type === 'galinha').length;
    let bandoBonus = 0;
    if (totalGalinhas > 1) {
      const flockBonusTotal = Math.floor((totalGalinhas - 1) / 2);
      if (flockBonusTotal > 0 && Math.random() < (flockBonusTotal / totalGalinhas)) {
        bandoBonus = 1;
        totalOvos += 1;
      }
    }
    
    if (weather === 'chuva') {
      totalOvos = Math.max(1, Math.round(totalOvos * 0.8));
    }

    setInventory(prev => ({
      ...prev,
      egg: (prev.egg ?? 0) + totalOvos
    }));

    setStats(prev => ({ 
      ...prev, 
      totalCollected: prev.totalCollected + totalOvos,
      totalEggs: (prev.totalEggs || 0) + totalOvos
    }));

    setWeeklyStats(prev => ({
      ...prev,
      egg: (prev.egg ?? 0) + totalOvos
    }));

    setAnimals(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, hasProducedToday: false };
      }
      return a;
    }));

    const bandoTxt = bandoBonus > 0 ? ` (com +${bandoBonus} ovos extras de bônus do efeito de bando!)` : '';
    addLog(`🥚 ${animal.name} produziu ${totalOvos} ovo(s) de quintal enviado(s) ao Armazém!${bandoTxt}`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥚', `+${totalOvos} Ovo`, event);
    // Missão: coletar itens
    updateMissionProgress('collect_items', totalOvos);
  };

  // Craft Mayonnaise in Atelier
  const craftMayonese = (event: React.MouseEvent) => {
    if (event) event.preventDefault();
    if ((inventory.egg ?? 0) < 2) {
      addLog(`🥚 Ovos insuficientes! Você precisa de pelo menos 2 Ovos para fazer Maionese.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Falta Ovos!', event);
      return;
    }

    setInventory(prev => ({
      ...prev,
      egg: prev.egg - 2,
      mayo: (prev.mayo ?? 0) + 1
    }));
    setStats(prev => ({
      ...prev,
      totalMayo: (prev.totalMayo || 0) + 1
    }));
    setWeeklyStats(prev => ({
      ...prev,
      mayo: (prev.mayo ?? 0) + 1
    }));
    addLog(`🥣 Sucesso! Você misturou vitoriosamente 2 Ovos em 1 pote de Maionese cremosa!`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥣', '+1 Maionese', event);
  };

  // Prices for animals based on level 4 discount
  const getAnimalPurchasePrice = (type: AnimalType): number => {
    let basePrice = 80;
    if (type === 'ovelha') basePrice = 70;
    if (type === 'boi') basePrice = 100;
    if (type === 'galinha') basePrice = 40;
    if (farmLevel >= 4) {
      return Math.round(basePrice * 0.9);
    }
    return basePrice;
  };

  // Estação key helper
  const getEstacaoKey = (day: number): 'primavera' | 'verao' | 'outono' | 'inverno' => {
    const idx = Math.floor(((day - 1) % 120) / 30);
    if (idx === 0) return 'primavera';
    if (idx === 1) return 'verao';
    if (idx === 2) return 'outono';
    return 'inverno';
  };

  const getSeasonalityMultiplier = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie', day: number) => {
    const estacao = getEstacaoKey(day);
    if (itemType === 'wool' && estacao === 'inverno') return 1.3;
    if (itemType === 'milk' && estacao === 'verao') return 0.8;
    if ((itemType === 'cheese' || itemType === 'queijoCoalho' || itemType === 'queijoMucarela' || itemType === 'queijoBrie') && estacao === 'outono') return 1.15;
    if (itemType === 'scarf' && estacao === 'primavera') return 1.1;
    if (itemType === 'egg' && estacao === 'primavera') return 1.25; // Eggs bountiful in spring!
    if (itemType === 'egg' && estacao === 'inverno') return 0.75; // Chickens produce less in winter
    if (itemType === 'mayo' && estacao === 'verao') return 1.15; // Picnic season
    return 1.0;
  };

  const getWeatherMultiplier = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie', currentW: 'chuva' | 'sol' | 'nublado') => {
    if (currentW === 'chuva') {
      if (itemType === 'milk') return 0.9;
      if (itemType === 'wool') return 0.8;
      if (itemType === 'egg') return 0.9; // Chickens like rainy days less
    } else if (currentW === 'sol') {
      if (itemType === 'milk') return 1.1;
      if (itemType === 'egg') return 1.1;
    }
    return 1.0;
  };

  // Base raw item prices (increases with levels)
  const getItemBaseSellPrice = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie'): number => {
    if (itemType === 'milk') {
      return farmLevel >= 2 ? 6 : 5;
    }
    if (itemType === 'wool') {
      return farmLevel >= 3 ? 15 : 12;
    }
    if (itemType === 'cheese') {
      return 20;
    }
    if (itemType === 'queijoCoalho') {
      return 14;
    }
    if (itemType === 'queijoMucarela') {
      return 28;
    }
    if (itemType === 'queijoBrie') {
      return 65;
    }
    if (itemType === 'scarf') {
      return 30;
    }
    if (itemType === 'egg') {
      return 4;
    }
    if (itemType === 'mayo') {
      return 16;
    }
    return 0;
  };

  // Keep 1 decimal place precision for display
  const getDynamicPrice = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie', d = currentDay, w = weather, sales = weeklySales): number => {
    const base = getItemBaseSellPrice(itemType);
    const offerMult = Math.max(0.6, Math.min(1.2, 1 - (sales[itemType] || 0) / 100));
    const seasonMult = getSeasonalityMultiplier(itemType, d);
    const weatherMult = getWeatherMultiplier(itemType, w);
    let finalPrice = base * offerMult * seasonMult * weatherMult;
    if (merchantActive) {
      finalPrice *= 1.5;
    }
    if (farmLevel > 5) {
      // Reputação pós-nível 5: +5% permanente de bônus por nível extra
      finalPrice *= (1.0 + (farmLevel - 5) * 0.05);
    }
    return Math.max(1, Math.round(finalPrice * 10) / 10);
  };

  // Rounded to nearest integer for actual gold conversion
  const getDynamicTransactionPrice = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie', d = currentDay, w = weather, sales = weeklySales): number => {
    const base = getItemBaseSellPrice(itemType);
    const offerMult = Math.max(0.6, Math.min(1.2, 1 - (sales[itemType] || 0) / 100));
    const seasonMult = getSeasonalityMultiplier(itemType, d);
    const weatherMult = getWeatherMultiplier(itemType, w);
    let finalPrice = base * offerMult * seasonMult * weatherMult;
    if (merchantActive) {
      finalPrice *= 1.5;
    }
    if (farmLevel > 5) {
      // Reputação pós-nível 5: +5% permanente de bônus por nível extra
      finalPrice *= (1.0 + (farmLevel - 5) * 0.05);
    }
    return Math.max(1, Math.round(finalPrice));
  };

  // Final processed sell prices including dynamic pricing equations
  const getActualSellPrice = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie'): number => {
    return getDynamicTransactionPrice(itemType);
  };

  const getTrendIconAndColor = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie' | 'carne') => {
    let current = 0;
    if (itemType === 'carne') {
      current = Math.max(50, Math.round(150 * getCarneMultiplier()));
    } else {
      current = getDynamicPrice(itemType);
    }
    const prev = previousPrices[itemType] ?? current;
    
    if (current > prev) {
      return { icon: '⬆️', color: 'text-emerald-600 font-black animate-pulse', label: 'Alta' };
    } else if (current < prev) {
      return { icon: '⬇️', color: 'text-red-500 font-black', label: 'Queda' };
    } else {
      return { icon: '↔️', color: 'text-amber-500 font-bold', label: 'Estável' };
    }
  };

  // 3. Collect Milk (Vaca)
  const collectMilk = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'vaca') return;

    if (!animal.hasProducedToday) {
      addLog(`🥛 ${animal.name} já foi ordenhada ou não produziu leite hoje!`, 'error');
      spawnFeedback('⏳', 'Vazia', event);
      return;
    }

    let efficiency = (animal.happiness / 100) * (1 - (Math.max(0, 100 - animal.hunger) / 200));
    efficiency = Math.max(0.3, Math.min(1.2, efficiency));

    let baseLeite = 1;
    let bonus = (efficiency > 0.8) ? 1 : 0;
    let totalLeite = baseLeite + (Math.random() < 0.3 ? bonus : 0);

    // Apply Best Friend, Sol Forte, and Chuva factors
    if (animal.isBestFriend) {
      totalLeite += 1;
    }
    if (weather === 'sol') {
      totalLeite += 1;
    }
    if (weather === 'chuva') {
      totalLeite = Math.max(1, Math.round(totalLeite * 0.8));
    }
    // BUG 6 FIX: aplica efeito de trait de produção (trabalhadora +15%, preguicosa -15%)
    if (animal.trait === 'trabalhadora') {
      totalLeite = Math.max(1, Math.round(totalLeite * 1.15));
    } else if (animal.trait === 'preguicosa') {
      totalLeite = Math.max(1, Math.round(totalLeite * 0.85));
    }

    setInventory(prev => ({
      ...prev,
      milk: prev.milk + totalLeite
    }));

    setStats(prev => ({ 
      ...prev, 
      totalCollected: prev.totalCollected + totalLeite,
      totalMilk: (prev.totalMilk || 0) + totalLeite
    }));

    setWeeklyStats(prev => ({
      ...prev,
      milk: prev.milk + totalLeite
    }));

    setAnimals(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, hasProducedToday: false };
      }
      return a;
    }));

    addLog(`🥛 ${animal.name} produziu ${totalLeite} balde(s) de leite cru enviados ao Armazém!`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🥛', `+${totalLeite} Leite`, event);
    // Missão: coletar itens
    updateMissionProgress('collect_items', totalLeite);
  };

  // 4. Collect Wool (Ovelha)
  const collectWool = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'ovelha') return;

    if (!animal.woolReady) {
      addLog(`🐑 ${animal.name} ainda está crescendo a lã!`, 'error');
      spawnFeedback('⏳', 'Sem lã', event);
      return;
    }

    let quality = (animal.happiness / 100) * (animal.hunger / 100);
    let woolBonus = quality > 0.7 ? 2 : 1;
    // BUG 6 FIX: aplica efeito de trait de produção (trabalhadora +15%, preguicosa -15%)
    if (animal.trait === 'trabalhadora') {
      woolBonus = Math.max(1, Math.round(woolBonus * 1.15));
    } else if (animal.trait === 'preguicosa') {
      woolBonus = Math.max(1, Math.round(woolBonus * 0.85));
    }

    setInventory(prev => ({
      ...prev,
      wool: prev.wool + woolBonus
    }));

    setStats(prev => ({ 
      ...prev, 
      totalCollected: prev.totalCollected + 1,
      totalWool: (prev.totalWool || 0) + woolBonus
    }));

    setWeeklyStats(prev => ({
      ...prev,
      wool: prev.wool + woolBonus
    }));

    setAnimals(prev => prev.map(a => {
      if (a.id === id) {
        return { 
          ...a, 
          woolReady: false,
          daysSinceLastWool: 0
        };
      }
      return a;
    }));

    addLog(`🧶 ${animal.name} foi tosquiada! Adicionado +${woolBonus} lã(s) crua(s) no Armazém.`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧶', `+${woolBonus} Lã`, event);
    // Missão: coletar itens
    updateMissionProgress('collect_items', woolBonus);
  };

  // 5. Sell Ox (Boi)
  const sellOx = (id: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    const animal = animals.find(a => a.id === id);
    if (!animal || animal.type !== 'boi') return;

    const value = calculateBoiValue(animal);
    
    setGold(prev => prev + value);
    setDailyEarning(prev => prev + value);
    setStats(prev => ({ 
      ...prev, 
      totalEarned: prev.totalEarned + value,
      totalSold: prev.totalSold + 1,
      totalOxSold: (prev.totalOxSold || 0) + 1,
      totalMerchantTrades: merchantActive ? (prev.totalMerchantTrades || 0) + 1 : (prev.totalMerchantTrades || 0)
    }));

    setWeeklyStats(prev => ({
      ...prev,
      earnings: prev.earnings + value,
      oxSold: prev.oxSold + 1
    }));

    // Update weeklySales count for karne/carne
    setWeeklySales(prev => ({
      ...prev,
      carne: (prev.carne || 0) + 1
    }));

    // Remove ox
    setAnimals(prev => prev.filter(a => a.id !== id));
    addLog(`💰 ${animal.name} (Boi) foi vendido na feira por ${value} moedas!`, 'success');
    
    triggerAudioResult(() => sfx.playSound('sell'));
    triggerConfetti(event);
    spawnFeedback('💰', `+${value} 💰`, event);
  };

  const getCarneMultiplier = (d = currentDay): number => {
    const offerMult = Math.max(0.6, Math.min(1.2, 1 - ((weeklySales.carne || 0) / 100)));
    const estacao = getEstacaoKey(d);
    let seasonMult = 1.0;
    if (estacao === 'primavera') seasonMult = 1.1;
    else if (estacao === 'outono') seasonMult = 0.95;
    let mult = offerMult * seasonMult;
    if (merchantActive) {
      mult *= 1.5;
    }
    return mult;
  };

  const calculateBoiValue = (boi: Animal): number => {
    const growthFactor = boi.weightGain || 0.0;
    let base = 60 + (growthFactor * 240); // Max 300 base
    let happinessBonus = (boi.happiness / 100) * 40; // Max 40 bonus
    let finalValueBase = Math.floor(base + happinessBonus);
    
    if (farmLevel >= 5) {
      finalValueBase += 5; // Level 5 ox bonus
    }
    if (farmLevel > 5) {
      // Reputação pós-nível 5: +5% permanente de bônus por nível extra
      finalValueBase *= (1.0 + (farmLevel - 5) * 0.05);
    }
    
    return Math.max(20, Math.round(finalValueBase * getCarneMultiplier()));
  };

  // 6. Buy Animal (Feira / Mercado)
  const buyAnimal = (type: AnimalType, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    
    const maxAnimals = Math.min(farmLevel * 4, 20);
    if (animals.length >= maxAnimals) {
      addLog(`❌ Limite de animais alcançado! Sua fazenda de Nível ${farmLevel} suporta no máximo ${maxAnimals} animais. Avance os dias para subir o nível!`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Limite!', event);
      return;
    }

    const price = getAnimalPurchasePrice(type);
    if (gold < price) {
      addLog(`💰 Moedas insuficientes para fechar negócio! Compre quando tiver ${price} moedas.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Falta 💰!', event);
      return;
    }

    const name = type === 'boi' ? getUniqueOxName(animals) : getRandomName(type);
    const newId = animals.length > 0 ? Math.max(...animals.map(a => a.id)) + 1 : 1;
    
    // Custom initial stats
    const hunger = Math.floor(Math.random() * 21) + 65; // between 65 and 85
    const happiness = Math.floor(Math.random() * 21) + 60; // between 60 and 80

    const newAnimal: Animal = {
      id: newId,
      type,
      name,
      hunger,
      happiness,
      consecutiveHappyDays: 0,
      daysBelow80: 0,
      isBestFriend: false,
      trait: getRandomTrait(),
      ...(type === 'vaca' && { hasProducedToday: false }),
      ...(type === 'ovelha' && { daysUntilWool: 3, daysSinceLastWool: 2, woolReady: false }),
      ...(type === 'galinha' && { hasProducedToday: false }),
      ...(type === 'boi' && { weightGain: 0.10 })
    };

    setGold(prev => prev - price);
    setAnimals(prev => [...prev, newAnimal]);
    setWeeklyStats(prev => ({ ...prev, spending: prev.spending + price }));
    
    let typeLabel = '🐄 Vaca';
    if (type === 'ovelha') typeLabel = '🐑 Ovelha';
    else if (type === 'boi') typeLabel = '🐂 Boi';
    else if (type === 'galinha') typeLabel = '🐔 Galinha';
    
    addLog(`✨ Parabéns! Você comprou ${newAnimal.name} (${typeLabel}) por ${price} moedas!`, 'success');
    triggerAudioResult(() => sfx.playSound('click'));
    spawnFeedback('🎁', `-${price} 💰`, event);
  };

  // --- PROCESSING & SALES INTEGRATIONS ---
  const craftCheese = (event?: React.MouseEvent) => {
    if (event && event.preventDefault) event.preventDefault();
    if (inventory.milk < 2) {
      addLog(`🥛 Leite insuficiente! Você precisa de pelo menos 2 Baldes de Leite Cru.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Falta Leite!', event);
      return;
    }

    setInventory(prev => ({
      ...prev,
      milk: prev.milk - 2,
      cheese: prev.cheese + 1
    }));
    setStats(prev => ({
      ...prev,
      totalCheese: (prev.totalCheese || 0) + 1
    }));
    setWeeklyStats(prev => ({
      ...prev,
      cheese: prev.cheese + 1
    }));
    addLog(`🧀 Sucesso! Você transformou 2 Leites Crus em 1 Queijo de alta qualidade!`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧀', '+1 Queijo', event);
  };

  const craftQueijo = (tipo: 'coalho' | 'mucarela' | 'brie', event?: React.MouseEvent) => {
    if (event && event.preventDefault) event.preventDefault();

    // BUG 19 FIX: queijaria artesanal exige nível 5
    if (farmLevel < 5) {
      addLog('A Queijaria Artesanal é desbloqueada no Nível 5!', 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }

    if (queijosEmMaturacao.length >= maxPrateleiras) {
      addLog(`🧀 Suas prateleiras estão cheias! Amplie sua queijaria ou aguarde a maturação de outros queijos.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', 'Prateleiras Cheias!', event);
      return;
    }

    const requiredMilk = tipo === 'coalho' ? 3 : tipo === 'mucarela' ? 5 : 8;
    const diasMaturation = tipo === 'coalho' ? 1 : tipo === 'mucarela' ? 3 : 7;
    const label = tipo === 'coalho' ? 'Queijo Coalho' : tipo === 'mucarela' ? 'Queijo Muçarela' : 'Queijo Brie';

    if (inventory.milk < requiredMilk) {
      addLog(`🥛 Leite insuficiente! Você precisa de pelo menos ${requiredMilk} Baldes de Leite Cru para fabricar ${label}.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      if (event) spawnFeedback('❌', `Falta Leite! (${requiredMilk})`, event);
      return;
    }

    // Spend milk
    setInventory(prev => ({
      ...prev,
      milk: prev.milk - requiredMilk
    }));

    // Add to maturing array
    setQueijosEmMaturacao(prev => [...prev, { tipo, diasRestantes: diasMaturation }]);

    // Award statistics & achievements
    // TODO BUG 11: mover setTotalQueijosFabricados e setStats(totalCheese) para quando o queijo ficar pronto
    // (processarMaturacaoQueijos em advanceDay), pois a conquista deveria contar conclusão, não início da maturação
    setTotalQueijosFabricados(prev => prev + 1);
    setQueijosFabricadosTipos(prev => prev.includes(tipo) ? prev : [...prev, tipo]);

    setStats(prev => ({
      ...prev,
      totalCheese: (prev.totalCheese || 0) + 1
    }));
    
    setWeeklyStats(prev => ({
      ...prev,
      cheese: (prev.cheese ?? 0) + 1
    }));

    addLog(`🧀 Você iniciou a maturação de ${label}. Ficará pronto em ${diasMaturation} dia(s).`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    if (event) spawnFeedback('🧀', `Iniciou ${label}`, event);
  };

  const craftScarf = (event?: React.MouseEvent) => {
    if (event && event.preventDefault) event.preventDefault();
    if (inventory.wool < 2) {
      addLog(`🧶 Lã insuficiente! Você precisa de pelo menos 2 Novelos de Lã Crua.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Falta Lã!', event);
      return;
    }

    setInventory(prev => ({
      ...prev,
      wool: prev.wool - 2,
      scarf: prev.scarf + 1
    }));
    setStats(prev => ({
      ...prev,
      totalScarf: (prev.totalScarf || 0) + 1
    }));
    setWeeklyStats(prev => ({
      ...prev,
      scarf: prev.scarf + 1
    }));
    addLog(`🧣 Sucesso! Você teceu 2 Novelos em 1 lindo Cachecol elegante!`, 'success');
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🧣', '+1 Cachecol', event);
  };

  const sellProduct = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie', qty: number, event: React.MouseEvent) => {
    if (event) event.preventDefault();
    if ((inventory[itemType] ?? 0) < qty) {
      addLog(`📦 Estoque insuficiente deste produto no Armazém!`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      spawnFeedback('❌', 'Sem estoque!', event);
      return;
    }

    const pricePerUnit = getActualSellPrice(itemType);
    const profit = pricePerUnit * qty;

    setInventory(prev => ({
      ...prev,
      [itemType]: (prev[itemType] ?? 0) - qty
    }));

    setGold(prev => prev + profit);
    setDailyEarning(prev => prev + profit);
    setStats(prev => ({
      ...prev,
      totalEarned: prev.totalEarned + profit,
      totalMerchantTrades: merchantActive ? (prev.totalMerchantTrades || 0) + qty : (prev.totalMerchantTrades || 0)
    }));
    // BUG 15 FIX: atualiza weeklyStats para todos os tipos de produto, não apenas egg e mayo
    setWeeklyStats(prev => ({
      ...prev,
      earnings: prev.earnings + profit,
      milk: itemType === 'milk' ? (prev.milk || 0) + qty : (prev.milk || 0),
      wool: itemType === 'wool' ? (prev.wool || 0) + qty : (prev.wool || 0),
      cheese: itemType === 'cheese' ? (prev.cheese || 0) + qty : (prev.cheese || 0),
      scarf: itemType === 'scarf' ? (prev.scarf || 0) + qty : (prev.scarf || 0),
      egg: itemType === 'egg' ? (prev.egg || 0) + qty : (prev.egg || 0),
      mayo: itemType === 'mayo' ? (prev.mayo || 0) + qty : (prev.mayo || 0),
    }));

    // Update weeklySales count
    setWeeklySales(prev => ({
      ...prev,
      [itemType]: (prev[itemType] || 0) + qty
    }));

    let label = '';
    if (itemType === 'milk') label = 'Leite Cru';
    else if (itemType === 'wool') label = 'Lã Crua';
    else if (itemType === 'cheese') label = 'Queijo Simples';
    else if (itemType === 'queijoCoalho') label = 'Queijo Coalho';
    else if (itemType === 'queijoMucarela') label = 'Queijo Muçarela';
    else if (itemType === 'queijoBrie') label = 'Queijo Brie';
    else if (itemType === 'scarf') label = 'Cachecol';
    else if (itemType === 'egg') label = 'Ovo';
    else if (itemType === 'mayo') label = 'Maionese';

    addLog(`💰 Venda realizada: ${qty} unidades de ${label} por +${profit} moedas!`, 'success');

    triggerAudioResult(() => sfx.playSound('sell'));
    spawnFeedback('💰', `+${profit} 💰`, event);
    // Missões: vender leite, vender qualquer coisa, ganhar ouro
    if (itemType === 'milk') updateMissionProgress('sell_milk', qty);
    updateMissionProgress('sell_any', qty);
    updateMissionProgress('earn_gold', profit);
  };

  // --- AUTOMATION AND MASS SELLING SYSTEM ---
  const sellAllItemsNoConfirm = (quietValue = false) => {
    const milkQty = inventory.milk;
    const woolQty = inventory.wool;
    const cheeseQty = inventory.cheese;
    const scarfQty = inventory.scarf;
    const eggQty = inventory.egg || 0;
    const mayoQty = inventory.mayo || 0;
    const coalhoQty = inventory.queijoCoalho || 0;
    const mucarelaQty = inventory.queijoMucarela || 0;
    const brieQty = inventory.queijoBrie || 0;

    if (milkQty === 0 && woolQty === 0 && cheeseQty === 0 && scarfQty === 0 && eggQty === 0 && mayoQty === 0 && coalhoQty === 0 && mucarelaQty === 0 && brieQty === 0) {
      if (!quietValue) {
        addLog(`📦 Seu Armazém está completamente vazio de mercadorias para vender!`, 'error');
        triggerAudioResult(() => sfx.playSound('error'));
      }
      return;
    }

    const milkPrice = getDynamicTransactionPrice('milk');
    const woolPrice = getDynamicTransactionPrice('wool');
    const cheesePrice = getDynamicTransactionPrice('cheese');
    const scarfPrice = getDynamicTransactionPrice('scarf');
    const eggPrice = getDynamicTransactionPrice('egg');
    const mayoPrice = getDynamicTransactionPrice('mayo');
    const coalhoPrice = getDynamicTransactionPrice('queijoCoalho');
    const mucarelaPrice = getDynamicTransactionPrice('queijoMucarela');
    const briePrice = getDynamicTransactionPrice('queijoBrie');

    const totalEarningCalculated = 
      (milkQty * milkPrice) + 
      (woolQty * woolPrice) + 
      (cheeseQty * cheesePrice) + 
      (scarfQty * scarfPrice) +
      (eggQty * eggPrice) +
      (mayoQty * mayoPrice) +
      (coalhoQty * coalhoPrice) +
      (mucarelaQty * mucarelaPrice) +
      (brieQty * briePrice);

    if (totalEarningCalculated <= 0) return;

    setGold(prev => prev + totalEarningCalculated);
    setDailyEarning(prev => prev + totalEarningCalculated);

    setInventory(prev => ({
      ...prev,
      milk: 0,
      wool: 0,
      cheese: 0,
      scarf: 0,
      egg: 0,
      mayo: 0,
      queijoCoalho: 0,
      queijoMucarela: 0,
      queijoBrie: 0
    }));

    // Update weekly sales statistics
    setWeeklySales(prev => ({
      ...prev,
      milk: prev.milk + milkQty,
      wool: prev.wool + woolQty,
      cheese: prev.cheese + cheeseQty,
      scarf: prev.scarf + scarfQty,
      egg: prev.egg + eggQty,
      mayo: prev.mayo + mayoQty,
      queijoCoalho: (prev.queijoCoalho ?? 0) + coalhoQty,
      queijoMucarela: (prev.queijoMucarela ?? 0) + mucarelaQty,
      queijoBrie: (prev.queijoBrie ?? 0) + brieQty
    }));

    setStats(prev => ({
      ...prev,
      totalEarned: prev.totalEarned + totalEarningCalculated,
      totalSold: prev.totalSold + (milkQty + woolQty + cheeseQty + scarfQty + eggQty + mayoQty + coalhoQty + mucarelaQty + brieQty),
      totalMerchantTrades: merchantActive 
        ? (prev.totalMerchantTrades || 0) + (milkQty + woolQty + cheeseQty + scarfQty + eggQty + mayoQty + coalhoQty + mucarelaQty + brieQty)
        : (prev.totalMerchantTrades || 0)
    }));

    // BUG 7 FIX: weeklyStats agora atualiza todos os produtos vendidos, não só egg/mayo
    setWeeklyStats(prev => ({
      ...prev,
      earnings: prev.earnings + totalEarningCalculated,
      milk: (prev.milk || 0) + milkQty,
      wool: (prev.wool || 0) + woolQty,
      cheese: (prev.cheese || 0) + cheeseQty,
      scarf: (prev.scarf || 0) + scarfQty,
      egg: prev.egg + eggQty,
      mayo: prev.mayo + mayoQty
    }));

    let messageParts = [];
    if (milkQty > 0) messageParts.push(`${milkQty} leites`);
    if (woolQty > 0) messageParts.push(`${woolQty} lãs`);
    if (cheeseQty > 0) messageParts.push(`${cheeseQty} queijos simples`);
    if (coalhoQty > 0) messageParts.push(`${coalhoQty} queijos coalho`);
    if (mucarelaQty > 0) messageParts.push(`${mucarelaQty} muçarelas`);
    if (brieQty > 0) messageParts.push(`${brieQty} queijos brie`);
    if (scarfQty > 0) messageParts.push(`${scarfQty} cachecóis`);
    if (eggQty > 0) messageParts.push(`${eggQty} ovos`);
    if (mayoQty > 0) messageParts.push(`${mayoQty} maioneses`);

    addLog(`💰 Você vendeu tudo: ${messageParts.join(', ')} por ${totalEarningCalculated} moedas!`, 'success');
    triggerAudioResult(() => sfx.playSound('sell'));
    
    // Custom feedback
    spawnFeedback('💰', `+${totalEarningCalculated} 💰`, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 } as any);
  };

  const buyMachine = (machineKey: 'milker' | 'shearer' | 'feeder') => {
    let price = 500;
    let reqLevel = 3;
    let label = "";
    if (machineKey === 'shearer') { price = 450; reqLevel = 3; label = "Tosquiadeira Elétrica"; }
    else if (machineKey === 'feeder') { price = 300; reqLevel = 2; label = "Alimentador Automático"; }
    else { label = "Ordenhadeira Automática"; }

    if (gold < price) {
      addLog(`💰 Moedas insuficientes para comprar ${label}! Precisa de ${price} moedas.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }
    if (farmLevel < reqLevel) {
      addLog(`🔒 Nível de Fazenda insuficiente! ${label} requer Nível ${reqLevel}.`, 'error');
      triggerAudioResult(() => sfx.playSound('error'));
      return;
    }

    setGold(prev => prev - price);
    setWeeklyStats(prev => ({ ...prev, spending: prev.spending + price }));
    setMachines(prev => ({
      ...prev,
      [`${machineKey}Purchased`]: true,
      [`${machineKey}Active`]: true // Start as active by default
    }));

    addLog(`🏭 Parabéns! Você comprou e ativou: ${label}!`, 'success');
    triggerAudioResult(() => sfx.playSound('levelup'));
  };

  const toggleMachine = (machineKey: 'milker' | 'shearer' | 'feeder') => {
    setMachines(prev => {
      const field = `${machineKey}Active` as const;
      const nextVal = !prev[field];
      addLog(`🏭 Máquina ${machineKey === 'milker' ? 'Ordenhadeira' : machineKey === 'shearer' ? 'Tosquiadeira' : 'Alimentador'} foi ${nextVal ? 'LIGADA' : 'DESLIGADA'}!`, 'info');
      triggerAudioResult(() => sfx.playSound('click'));
      return {
        ...prev,
        [field]: nextVal
      };
    });
  };

  // --- SUB-FUNÇÕES PURAS DO CICLO DIÁRIO (Refatoração de advanceDay) ---

  // Constante de custo de manutenção por máquina ativa (escalando de acordo com nível)
  const getCustoManutencaoMaquinas = (level: number) => 4 + 2 * level;

  /**
   * 1. aplicarManutencaoMaquinas: Aplica ou falha manutenção diária caso haja máquinas ativas.
   */
  const aplicarManutencaoMaquinas = (
    machinesObj: typeof machines,
    currentGold: number,
    currentLevel: number,
    logs: { msg: string; type: LogMessage['type'] }[]
  ) => {
    let activeCount = 0;
    if (machinesObj.milkerPurchased && machinesObj.milkerActive) activeCount++;
    if (machinesObj.shearerPurchased && machinesObj.shearerActive) activeCount++;
    if (machinesObj.feederPurchased && machinesObj.feederActive) activeCount++;

    const custoUnitario = getCustoManutencaoMaquinas(currentLevel);
    const totalCost = activeCount * custoUnitario;
    const canAfford = currentGold >= totalCost;

    if (activeCount > 0) {
      if (!canAfford) {
        logs.push({
          msg: `❌ Manutenção das máquinas falhou! Você precisava de ${totalCost} moedas (${activeCount} ativas a ${custoUnitario}💰 cada), mas tinha apenas ${currentGold}. Elas não operaram hoje.`,
          type: 'error'
        });
        return { paid: false, cost: 0, nextGold: currentGold };
      } else {
        logs.push({
          msg: `⚙️ Manutenção das máquinas paga: -${totalCost} moedas (${activeCount} máquinas ativas a ${custoUnitario}💰 cada).`,
          type: 'system'
        });
        return { paid: true, cost: totalCost, nextGold: currentGold - totalCost };
      }
    }
    return { paid: true, cost: 0, nextGold: currentGold };
  };

  /**
   * 2. processarAutomatizacao: Executa coletas automáticas (ordenha, tosquia, alimentação) se pagas.
   */
  const processarAutomatizacao = (
    machinesObj: typeof machines,
    hasPaidMaintenance: boolean,
    animalsList: Animal[],
    inventoryObj: typeof inventory,
    currentWeather: typeof weather,
    logs: { msg: string; type: LogMessage['type'] }[]
  ) => {
    let updatedAnimals = [...animalsList];
    let nextInv = { ...inventoryObj };
    let statsCollected = { milk: 0, wool: 0, milkedCows: 0, shearedSheep: 0, fedCount: 0 };
    let missingFeeds: string[] = [];

    if (!hasPaidMaintenance || updatedAnimals.length === 0) {
      return { updatedAnimals, nextInv, statsCollected, missingFeeds };
    }

    // A. Ordenhadeira Automática
    if (machinesObj.milkerPurchased && machinesObj.milkerActive) {
      updatedAnimals = updatedAnimals.map(a => {
        if (a.type === 'vaca' && a.hasProducedToday) {
          let efficiency = (a.happiness / 100) * (1 - (Math.max(0, 100 - a.hunger) / 200));
          efficiency = Math.max(0.3, Math.min(1.2, efficiency));

          let baseLeite = 1;
          let bonus = (efficiency > 0.8) ? 1 : 0;
          let totalLeite = baseLeite + (Math.random() < 0.3 ? bonus : 0);

          if (a.isBestFriend) {
            totalLeite += 1;
          }
          if (currentWeather === 'sol') {
            totalLeite += 1;
          }
          if (currentWeather === 'chuva') {
            totalLeite = Math.max(1, Math.round(totalLeite * 0.8));
          }
          // BUG 6 FIX: aplica trait de produção na ordenhadeira automática
          if (a.trait === 'trabalhadora') {
            totalLeite = Math.max(1, Math.round(totalLeite * 1.15));
          } else if (a.trait === 'preguicosa') {
            totalLeite = Math.max(1, Math.round(totalLeite * 0.85));
          }

          statsCollected.milk += totalLeite;
          statsCollected.milkedCows++;
          return { ...a, hasProducedToday: false };
        }
        return a;
      });
    }

    // B. Tosquiadeira Elétrica
    if (machinesObj.shearerPurchased && machinesObj.shearerActive) {
      updatedAnimals = updatedAnimals.map(a => {
        if (a.type === 'ovelha' && a.woolReady) {
          let quality = (a.happiness / 100) * (a.hunger / 100);
          let woolBonus = quality > 0.7 ? 2 : 1;
          // BUG 6 FIX: aplica trait de produção na tosquiadeira automática
          if (a.trait === 'trabalhadora') {
            woolBonus = Math.max(1, Math.round(woolBonus * 1.15));
          } else if (a.trait === 'preguicosa') {
            woolBonus = Math.max(1, Math.round(woolBonus * 0.85));
          }

          statsCollected.wool += woolBonus;
          statsCollected.shearedSheep++;
          return { ...a, woolReady: false, daysSinceLastWool: 0 };
        }
        return a;
      });
    }

    // C. Alimentador Automático
    if (machinesObj.feederPurchased && machinesObj.feederActive) {
      updatedAnimals = updatedAnimals.map(a => {
        let feedType: 'racaoLeite' | 'racaoOvelha' | 'racaoBoi' | 'racaoGalinha' = 'racaoLeite';
        let feedLabel = 'Ração de Vaca';
        if (a.type === 'ovelha') { feedType = 'racaoOvelha'; feedLabel = 'Ração de Ovelha'; }
        else if (a.type === 'boi') { feedType = 'racaoBoi'; feedLabel = 'Ração de Boi'; }
        else if (a.type === 'galinha') { feedType = 'racaoGalinha'; feedLabel = 'Ração de Galinha'; }
        
        if ((nextInv[feedType] ?? 0) >= 1) {
          nextInv[feedType] -= 1;
          statsCollected.fedCount++;
          return {
            ...a,
            hunger: Math.min(100, a.hunger + 35),
            happiness: Math.min(100, a.happiness + 12)
          };
        } else {
          if (!missingFeeds.includes(feedLabel)) {
            missingFeeds.push(feedLabel);
          }
          return a;
        }
      });
    }

    return { updatedAnimals, nextInv, statsCollected, missingFeeds };
  };

  /**
   * 3. atualizarClimaEEventos: Calcula aleatoriamente e notifica o clima do dia seguinte.
   */
  const atualizarClimaEEventos = (
    currentDayVal: number,
    logs: { msg: string; type: LogMessage['type'] }[]
  ) => {
    const weatherRoll = Math.random();
    let nextWeather: 'chuva' | 'sol' | 'nublado' = 'nublado';
    if (weatherRoll < 0.15) {
       nextWeather = 'chuva';
    } else if (weatherRoll < 0.30) {
       nextWeather = 'sol';
    }

    if (nextWeather === 'chuva') {
      logs.push({ msg: `🌧️ Nova previsão do clima: Chuvoso! Ovelhas têm 30% chance de falhar na tosquia e vacas produzem 20% menos leite.`, type: 'event' });
    } else if (nextWeather === 'sol') {
      logs.push({ msg: `☀️ Nova previsão do clima: Ensolarado! Vacas se animam e vão produzir +1 de leite hoje!`, type: 'event' });
    } else {
      logs.push({ msg: `☁️ Nova previsão do clima: Nublado e de temperatura equilibrada. Produções padrão.`, type: 'info' });
    }

    return nextWeather;
  };

  /**
   * 4. processarFomeFelicidade: Calcula fomes, felicidades decays e humores/produções naturais para os animais.
   */
  const processarFomeFelicidade = (
    animalsList: Animal[],
    currentW: 'chuva' | 'sol' | 'nublado',
    logs: { msg: string; type: LogMessage['type'] }[]
  ) => {
    return animalsList.map(animal => {
      const copy = { ...animal };

      // Perda de fome diária: 12 + random 0-7 (gulosa consome +20%)
      const baseHungerLoss = 12 + Math.floor(Math.random() * 8);
      const hungerLoss = copy.trait === 'gulosa' ? Math.round(baseHungerLoss * 1.2) : baseHungerLoss;
      copy.hunger = Math.max(0, copy.hunger - hungerLoss);

      // Regras de felicidade baseadas na fome:
      if (copy.hunger < 30) {
        copy.happiness = Math.max(0, copy.happiness - 10);
      } else if (copy.hunger > 70) {
        copy.happiness = Math.min(100, copy.happiness + 3);
      }

      // Decaimento natural leve de felicidade
      copy.happiness = Math.max(0, copy.happiness - 2);

      // Penalidade extra de fome extrema
      if (copy.hunger <= 5) {
        copy.happiness = Math.max(0, copy.happiness - 12);
      }

      // Efeito de trait de felicidade
      if (copy.trait === 'feliz') {
        copy.happiness = Math.min(100, copy.happiness + 5);
      } else if (copy.trait === 'estressada') {
        copy.happiness = Math.max(0, copy.happiness - 5);
      }

      // Evento de humor aleatório por animal (15% chance - saudavel é imune)
      if (Math.random() < 0.15 && copy.trait !== 'saudavel') {
        if (Math.random() > 0.5) {
          copy.happiness = Math.max(0, copy.happiness - 20);
          logs.push({
            msg: `⚠️ ${copy.name} ficou estressado com ruídos da mata! -20 Felicidade.`,
            type: 'error'
          });
        } else {
          copy.happiness = Math.min(100, copy.happiness + 12);
          logs.push({
            msg: `✨ ${copy.name} encontrou um trevo de quatro folhas suculento! +12 Felicidade.`,
            type: 'success'
          });
        }
      }

      // Atualizações de produção baseadas nas espécies
      if (copy.type === 'vaca') {
        const canProduce = copy.hunger > 25 && copy.happiness > 30;
        copy.hasProducedToday = canProduce;
        if (!canProduce) {
          if (copy.hunger <= 25) {
            logs.push({ msg: `🐄 ${copy.name} está com muita fome e não produziu leite hoje.`, type: 'error' });
          } else if (copy.happiness <= 30) {
            logs.push({ msg: `🐄 ${copy.name} está desanimada e não produziu leite hoje.`, type: 'error' });
          }
        } else {
          logs.push({ msg: `🐄 ${copy.name} produziu leite fresquinho!`, type: 'info' });
        }
      }
      else if (copy.type === 'ovelha') {
        copy.daysSinceLastWool = (copy.daysSinceLastWool || 0) + 1;
        const requiredDays = copy.isBestFriend ? 2 : 3;
        if (copy.daysSinceLastWool >= requiredDays && !copy.woolReady) {
          if (copy.hunger > 20 && copy.happiness > 25) {
            if (currentW === 'chuva' && Math.random() < 0.30) {
              logs.push({ msg: `🌧️ A lã de ${copy.name} ficou ensopada pela chuva e não pôde se firmar hoje!`, type: 'error' });
            } else {
              copy.woolReady = true;
              logs.push({ msg: `🐑 ${copy.name} está com a pelagem cheia! Pronta para tosquia.`, type: 'success' });
            }
          } else {
            logs.push({ msg: `🐑 O pelo da ovelha ${copy.name} não cresceu por falta de cuidados básicos.`, type: 'error' });
          }
        }
      }
      else if (copy.type === 'boi') {
        let gain = 0.02;
        if (copy.hunger > 65) gain += 0.025;
        if (copy.happiness > 70) gain += 0.015;
        if (copy.hunger < 20) gain -= 0.02;
        
        if (copy.isBestFriend) {
          gain += 0.05;
        }
        
        if (copy.hunger < 12) {
          gain = -0.015; // Perda real de peso se estiver faminto
        } else {
          gain = Math.min(0.07, Math.max(0, gain));
        }
        
        copy.weightGain = Math.max(0.05, Math.min(1.0, (copy.weightGain || 0.15) + gain));

        if (copy.weightGain >= 0.95 && (copy.weightGain || 0) < 1.0) {
          logs.push({ msg: `🏆 ${copy.name} (Boi) atingiu o peso ideal de abate! Você obterá valor máximo na venda!`, type: 'success' });
        }
      }
      else if (copy.type === 'galinha') {
        const canProduce = copy.hunger > 25 && copy.happiness > 30;
        copy.hasProducedToday = canProduce;
        if (!canProduce) {
          if (copy.hunger <= 25) {
            logs.push({ msg: `🐔 ${copy.name} está com fome e não botou ovo hoje.`, type: 'error' });
          } else if (copy.happiness <= 30) {
            logs.push({ msg: `🐔 ${copy.name} está triste e não botou ovo hoje.`, type: 'error' });
          }
        } else {
          logs.push({ msg: `🐔 ${copy.name} botou um lindo ovo de quintal!`, type: 'info' });
        }
      }

      // Verificação do status de Melhor Amigo
      copy.consecutiveHappyDays = copy.consecutiveHappyDays || 0;
      copy.daysBelow80 = copy.daysBelow80 || 0;

      // BUG 6 FIX: alinha com UI que documenta 100% de felicidade para Melhor Amigo
      if (copy.happiness >= 100) {
        copy.consecutiveHappyDays += 1;
        if (copy.consecutiveHappyDays >= 3 && !copy.isBestFriend) {
          copy.isBestFriend = true;
          copy.daysBelow80 = 0;
          let benefitTxt = "";
          if (copy.type === 'vaca') benefitTxt = "+1 leite diário permanente!";
          if (copy.type === 'ovelha') benefitTxt = "lã a cada 2 dias em vez de 3!";
          if (copy.type === 'boi') benefitTxt = "+0.05 de ganho de peso!";
          if (copy.type === 'galinha') benefitTxt = "+1 ovo diário permanente!";
          
          logs.push({
            msg: `💖 ${copy.name} atingiu a felicidade suprema por 3 dias e virou seu MELHOR AMIGO! Benefício: ${benefitTxt}`,
            type: 'success'
          });
        }
      } else {
        copy.consecutiveHappyDays = 0;
      }

      if (copy.isBestFriend) {
        if (copy.happiness < 80) {
          copy.daysBelow80 += 1;
          if (copy.daysBelow80 > 1) {
            copy.isBestFriend = false;
            copy.daysBelow80 = 0;
            copy.consecutiveHappyDays = 0;
            logs.push({
              msg: `💔 ${copy.name} ficou triste por 2 dias (felicidade < 80) e perdeu o nível de Melhor Amigo.`,
              type: 'error'
            });
          } else {
            logs.push({
              msg: `⚠️ ${copy.name} está desanimada! Se a felicidade não subir para 80 hoje, amanhã perderá o status de Melhor Amigo.`,
              type: 'error'
            });
          }
        } else {
          copy.daysBelow80 = 0;
        }
      }

      return copy;
    });
  };

  /**
   * 5. processarMaturacaoQueijos: Reduz tempo de maturação nos queijos e devolve inventário pronto.
   */
  const processarMaturacaoQueijos = (
    currentMaturacao: typeof queijosEmMaturacao,
    nextDayVal: number,
    logs: { msg: string; type: LogMessage['type'] }[]
  ) => {
    const readyQueijos: string[] = [];
    const remaining: typeof queijosEmMaturacao = [];

    currentMaturacao.forEach(item => {
      const nextDias = item.diasRestantes - 1;
      if (nextDias <= 0) {
        readyQueijos.push(item.tipo);
      } else {
        remaining.push({ ...item, diasRestantes: nextDias });
      }
    });

    readyQueijos.forEach(tipo => {
      const label = tipo === 'coalho' ? 'Queijo Coalho' : tipo === 'mucarela' ? 'Queijo Muçarela' : 'Queijo Brie';
      logs.push({
        msg: `🧀 Seu fantástico ${label} terminou sua maturação e está pronto para venda!`,
        type: 'success'
      });
      // BUG FIX: passa nextDayVal para que a notificação mostre o dia correto
      setTimeout(() => addNotification(`🧀 ${label} terminou maturação e está pronto para vender!`, 'success', nextDayVal), 0);
    });

    return { remaining, readyQueijos };
  };

  /**
   * 6. verificarNivelFazenda: Avança e notifica mudança de nível a cada 10 dias.
   */
  const verificarNivelFazenda = (
    nextDayVal: number,
    currentLevel: number,
    logs: { msg: string; type: LogMessage['type'] }[]
  ) => {
    const newLevel = Math.floor((nextDayVal - 1) / 10) + 1;
    let levelUpOccurred = false;
    if (newLevel > currentLevel) {
      levelUpOccurred = true;
      logs.push({
        msg: `🏆 EXCELENTE! O nível da Fazenda Aurora subiu para o NÍVEL ${newLevel}!`,
        type: 'success'
      });
      if (newLevel === 2) {
        logs.push({ msg: `🥛 Benefício Desbloqueado: Preço de venda base do Leite Cru subiu para 6 moedas!`, type: 'system' });
      } else if (newLevel === 3) {
        logs.push({ msg: `🧶 Benefício Desbloqueado: Preço de venda base da Lã Crua subiu para 15 moedas!`, type: 'system' });
      } else if (newLevel === 4) {
        logs.push({ msg: `🏷️ Benefício Desbloqueado: Desconto permanente de 10% na compra de novos animais!`, type: 'system' });
      } else if (newLevel >= 5) {
        logs.push({ msg: `🐂 Benefício Desbloqueado: Ganhe +5 moedas extras de bônus na venda de qualquer Boi!`, type: 'system' });
      }
    }
    return { newLevel, levelUpOccurred };
  };

  /**
   * 7. processarComercianteViajante: Lida com chance de comerciante aparecer e suas rotatividades.
   */
  const processarComercianteViajante = (
    daysSinceMerc: number,
    nextMercDay: number,
    nextDayVal: number,
    logs: { msg: string; type: LogMessage['type'] }[]
  ) => {
    let isMerchantNextDay = false;
    let newDaysSinceMerchant = daysSinceMerc + 1;
    let newNextMerchantDay = nextMercDay;
    if (newDaysSinceMerchant >= nextMercDay) {
      isMerchantNextDay = true;
      newDaysSinceMerchant = 0;
      newNextMerchantDay = Math.floor(Math.random() * 5) + 3; // 3 to 7
    }

    if (isMerchantNextDay) {
      logs.push({
        msg: `🧙‍♂️ Um Comerciante Viajante chegou na fazenda! Ele compra todos os produtos e bois por 1.5x o preço hoje!`,
        type: 'event'
      });
      // BUG FIX: passa nextDayVal para que a notificação mostre o dia correto
      setTimeout(() => addNotification('🧙‍♂️ Comerciante Viajante chegou! Venda tudo por 1.5x hoje!', 'event', nextDayVal), 0);
    }

    return { isMerchantNextDay, newDaysSinceMerchant, newNextMerchantDay };
  };

  /**
   * 8. verificarMortesAnimais: Remove animais famintos ou tristes e notifica mortes no log.
   */
  const verificarMortesAnimais = (
    animalsList: Animal[],
    logs: { msg: string; type: LogMessage['type'] }[]
  ) => {
    let deceasedCount = 0;
    const survivors = animalsList.filter(animal => {
      if (animal.hunger <= 0 || animal.happiness <= 0) {
        logs.push({ 
          msg: `💀 Infelizmente, o animal ${animal.name} não resistiu à fome extrema ou tristeza e faleceu.`, 
          type: 'error' 
        });
        deceasedCount++;
        return false;
      }
      return true;
    });
    return { survivors, deceasedCount };
  };

  /**
   * 9. processarGlobalEvent: Dispara eventos mundiais aleatórios (ganhar/perder moedas).
   */
  const processarGlobalEvent = (
    logs: { msg: string; type: LogMessage['type'] }[]
  ) => {
    let finalGoldBonus = 0;
    if (Math.random() < 0.2) {
      const isPositive = Math.random() > 0.6;
      if (isPositive) {
        const bonus = 15 + Math.floor(Math.random() * 20);
        finalGoldBonus += bonus;
        logs.push({
          msg: `✨ Um mascate viajante visitou o vilarejo e comprou suas sobras de capim! +${bonus} moedas!`,
          type: 'event'
        });
      } else {
        const loss = 10 + Math.floor(Math.random() * 15);
        finalGoldBonus -= loss;
        logs.push({
          msg: `⚠️ Surto de resfriado bovino nos arredores da Aurora: taxa de higienização veterinária paga -${loss} moedas.`,
          type: 'event'
        });
      }
    }
    return finalGoldBonus;
  };

  /**
   * 10. registrarLogsDiaAnterior: Registra as balanças do dia anterior.
   */
  const registrarLogsDiaAnterior = (
    day: number,
    earnings: number,
    logs: { msg: string; type: LogMessage['type'] }[]
  ) => {
    logs.push({
      msg: `📊 Resumo das Finanças do Dia ${day}: Você faturou +${earnings} moedas com vendas e coletas na feira!`,
      type: 'system'
    });
  };

  // 11. Salvar Estado (Mantém compatibilidade com a assinatura lógica mas delega ao effect reativo)
  const salvarEstado = () => {
    // A autosalvaguarda do jogo já ocorre reativamente via useEffect sobre as dependências do estado.
    // Esta subfunção atua como âncora de segurança estrutural.
  };

  // 7. Advance Day
  const advanceDay = (event: React.MouseEvent) => {
    try {
      spawnFeedback('🌞', 'Dia Avançou!', event);

      let logsToAdd: { msg: string; type: LogMessage['type'] }[] = [];

      // Salva histórico de preços antes do avanço dinâmico diário
      const currentPricesObj = {
        milk: getDynamicTransactionPrice('milk'),
        wool: getDynamicTransactionPrice('wool'),
        cheese: getDynamicTransactionPrice('cheese'),
        scarf: getDynamicTransactionPrice('scarf'),
        carne: Math.max(50, Math.round(150 * getCarneMultiplier())),
        egg: getDynamicTransactionPrice('egg'),
        mayo: getDynamicTransactionPrice('mayo'),
        queijoCoalho: getDynamicTransactionPrice('queijoCoalho'),
        queijoMucarela: getDynamicTransactionPrice('queijoMucarela'),
        queijoBrie: getDynamicTransactionPrice('queijoBrie')
      };
      setPreviousPrices(currentPricesObj);

      // Pré-calcula a viabilidade da manutenção para decidir o funcionamento das máquinas no dia
      let activeCount = 0;
      if (machines.milkerPurchased && machines.milkerActive) activeCount++;
      if (machines.shearerPurchased && machines.shearerActive) activeCount++;
      if (machines.feederPurchased && machines.feederActive) activeCount++;
      const costReal = activeCount * getCustoManutencaoMaquinas(farmLevel);
      const maintPaid = gold >= costReal;

      // --- SUBFUNÇÃO 2: Processamento de Automatização ---
      const { 
        updatedAnimals: animalsAfterAuto, 
        nextInv: invAfterAuto, 
        statsCollected, 
        missingFeeds 
      } = processarAutomatizacao(machines, maintPaid, animals, inventory, weather, logsToAdd);

      // Aktualiza inventário se as automações realizaram alterações
      // BUG 10 / BUG 1 FIX: usa callback funcional para evitar race condition com o setInventory de queijos prontos
      if (statsCollected.milk > 0 || statsCollected.wool > 0 || statsCollected.fedCount > 0) {
        setInventory(prev => ({ ...prev, ...invAfterAuto }));
      }
      
      if (statsCollected.milk > 0) {
        setStats(prev => ({
          ...prev,
          totalCollected: prev.totalCollected + statsCollected.milk,
          totalMilk: (prev.totalMilk || 0) + statsCollected.milk
        }));
        setWeeklyStats(prev => ({ ...prev, milk: prev.milk + statsCollected.milk }));
        logsToAdd.push({
          msg: `🏭 Ordenhadeira Automática: Coletou +${statsCollected.milk} Leite(s) de ${statsCollected.milkedCows} vacas e enviou ao Armazém!`,
          type: 'success'
        });
      }

      if (statsCollected.wool > 0) {
        setStats(prev => ({
          ...prev,
          totalCollected: prev.totalCollected + 1,
          totalWool: (prev.totalWool || 0) + statsCollected.wool
        }));
        setWeeklyStats(prev => ({ ...prev, wool: prev.wool + statsCollected.wool }));
        logsToAdd.push({
          msg: `🏭 Tosquiadeira Elétrica: Coletou +${statsCollected.wool} Lã(s) de ${statsCollected.shearedSheep} ovelhas e enviou ao Armazém!`,
          type: 'success'
        });
      }

      if (statsCollected.fedCount > 0) {
        setStats(prev => ({ ...prev, totalFed: prev.totalFed + statsCollected.fedCount }));
        logsToAdd.push({
          msg: `🌾 Alimentador Automático: Alimentou ${statsCollected.fedCount} de ${animalsAfterAuto.length} animais consumindo ração do Armazém!`,
          type: 'success'
        });
      }

      if (missingFeeds.length > 0) {
        logsToAdd.push({
          msg: `❌ Alimentador Automático falhou para alguns animais devido à falta de: ${missingFeeds.join(', ')}.`,
          type: 'error'
        });
      }

      // --- SUBFUNÇÃO 1: Manutenção de Máquinas Ativas ---
      const { paid: maintPaidFinal, cost: maintCost, nextGold: goldAfterMaint } = aplicarManutencaoMaquinas(machines, gold, farmLevel, logsToAdd);

      // --- SUBFUNÇÃO 3: Processamento e Previsão do Clima ---
      const nextWeather = atualizarClimaEEventos(currentDay, logsToAdd);
      setWeather(nextWeather);

      const nextDayValue = currentDay + 1;

      // Desliza o histórico de preço semanal adicionando a nova estimativa simulada de manhã
      setPriceHistory(prev => {
        // BUG 14 FIX: removida chave duplicada 'meat'
        const keys = ['milk', 'wool', 'cheese', 'scarf', 'egg', 'mayo', 'queijoCoalho', 'queijoMucarela', 'queijoBrie', 'carne'];
        const nextHist: Record<string, number[]> = {};
        keys.forEach((key) => {
          let currentP;
          let base;
          if (key === 'carne' || key === 'meat') {
            base = 150;
            currentP = Math.max(50, Math.round(150 * getCarneMultiplier(nextDayValue)));
          } else {
            base = getItemBaseSellPrice(key as any);
            currentP = getDynamicTransactionPrice(key as any, nextDayValue, nextWeather, weeklySales);
          }
          const hist = prev[key] || [base, base, base, base, base, base, base, base, base];
          nextHist[key] = [...hist.slice(1), currentP];
        });
        return nextHist;
      });

      // --- SUBFUNÇÃO 6: Verificação de Nível da Fazenda ---
      const { newLevel, levelUpOccurred } = verificarNivelFazenda(nextDayValue, farmLevel, logsToAdd);
      if (levelUpOccurred) {
        setFarmLevel(newLevel);
        setShowLevelUpModal(newLevel);
        setTimeout(() => addNotification(`🏆 Fazenda subiu para o Nível ${newLevel}! +100 moedas de celebração!`, 'success', nextDayValue), 0);
      }

      // --- SUBFUNÇÃO 7: Processamento do Comerciante Viajante ---
      const { isMerchantNextDay, newDaysSinceMerchant, newNextMerchantDay } = processarComercianteViajante(daysSinceMerchant, nextMerchantDay, nextDayValue, logsToAdd);
      setMerchantActive(isMerchantNextDay);
      setDaysSinceMerchant(newDaysSinceMerchant);
      setNextMerchantDay(newNextMerchantDay);

      // Toques sonoros contextuais
      if (levelUpOccurred) {
        triggerAudioResult(() => sfx.playSound('levelup'));
      } else if (isMerchantNextDay) {
        triggerAudioResult(() => sfx.playSound('event'));
      } else {
        triggerAudioResult(() => sfx.playSound('click'));
      }

      // Logs financeiros de entrada
      registrarLogsDiaAnterior(currentDay, dailyEarning, logsToAdd);

      // --- FUNCIONALIDADE 5: Atualizar histórico de ganhos ---
      setEarningsHistory(prev => [...prev, dailyEarning].slice(-14));
      // BUG 10 FIX: worstDay agora registra corretamente qualquer dia, incluindo dias de
      // ganho zero. Só ignora o primeiro dia (worstDay===0 como sentinela de "nunca calculado").
      setAllTimeStats(prev => ({
        ...prev,
        bestDay: Math.max(prev.bestDay, dailyEarning),
        worstDay: prev.worstDay === 0 && dailyEarning === 0 ? 0 : prev.worstDay === 0 ? dailyEarning : Math.min(prev.worstDay, dailyEarning)
      }));

      // --- FUNCIONALIDADE 3: Renovar missões diárias ao avançar o dia ---
      // BUG 2 FIX: usa >= (não >) para que missões que expiram EXATAMENTE no próximo
      // dia ainda apareçam nesse dia e possam ser resgatadas antes de sumir.
      setMissions(prev => {
        const nextDayMissions = prev.filter(m => m.expiresOnDay >= currentDay + 1);
        const hasDaily = nextDayMissions.some(m => m.type === 'daily' && m.expiresOnDay >= currentDay + 1);
        const hasWeekly = nextDayMissions.some(m => m.type === 'weekly' && m.expiresOnDay >= currentDay + 1);
        const newMissions = [...nextDayMissions];
        if (!hasDaily) {
          newMissions.push(...generateDailyMissions(currentDay + 1));
        }
        if (!hasWeekly) {
          newMissions.push(...generateWeeklyMissions(currentDay + 1));
        }
        return newMissions;
      });

      setDailyEarning(0);

      // --- SUBFUNÇÃO 4: Processamento de Fome, Felicidade e Produções Naturais ---
      let updatedAnimalsList = processarFomeFelicidade(animalsAfterAuto, nextWeather, logsToAdd);

      // --- FUNCIONALIDADE 3: Verificar missão de animais felizes ---
      // BUG 3 FIX: usa updatedAnimalsList (felicidade já processada) em vez de
      // animals stale (felicidade do dia anterior).
      const happyCount = updatedAnimalsList.filter(a => a.happiness > 70).length;
      if (updatedAnimalsList.length > 0 && happyCount === updatedAnimalsList.length) {
        updateMissionProgress('happy_animals', 1);
      }

      // --- SUBFUNÇÃO 8: Verificação de Mortes Secundárias ---
      const { survivors, deceasedCount } = verificarMortesAnimais(updatedAnimalsList, logsToAdd);
      if (deceasedCount > 0) {
        triggerAudioResult(() => sfx.playSound('error'));
      }
      setAnimals(survivors);

      // BUG 4 FIX: notificações de infelicidade agora usam `survivors` (sem animais
      // já mortos), evitando spam de aviso sobre animais que acabaram de falecer.
      survivors.forEach(a => {
        if (a.happiness < 20) {
          setTimeout(() => addNotification(`⚠️ ${a.name} está muito infeliz (${Math.floor(a.happiness)}%)! Alimente-o urgentemente!`, 'warning'), 0);
        }
      });

      // --- SUBFUNÇÃO 9: Processamento do Evento Global Dinâmico ---
      const globalGoldBonus = processarGlobalEvent(logsToAdd);

      // Liquidação financeira final do balanceamento
      // BUG 2 FIX: usa callback funcional para não sobrescrever ouro com valor de closure stale
      setGold(prev => Math.max(0, prev - maintCost + globalGoldBonus));

      // --- SUBFUNÇÃO: Gerar Relatório Semanal ---
      if (currentDay % 7 === 0) {
        setWeeklyReportData({ ...weeklyStats });
        setShowWeeklyReport(true);
        setWeeklyStats({ earnings: 0, spending: 0, milk: 0, wool: 0, oxSold: 0, cheese: 0, scarf: 0, egg: 0, mayo: 0 });
        setWeeklySales({ milk: 0, wool: 0, cheese: 0, scarf: 0, carne: 0, egg: 0, mayo: 0, queijoCoalho: 0, queijoMucarela: 0, queijoBrie: 0 });
      }

      // --- SUBFUNÇÃO 5: Processamento da Maturação de Queijos ---
      const { remaining: maturacaoRemaining, readyQueijos } = processarMaturacaoQueijos(queijosEmMaturacao, nextDayValue, logsToAdd);
      setQueijosEmMaturacao(maturacaoRemaining);

      if (readyQueijos.length > 0) {
        setInventory(inv => {
          const nextInv = { ...inv };
          readyQueijos.forEach(tipo => {
            const key = tipo === 'coalho' ? 'queijoCoalho' : tipo === 'mucarela' ? 'queijoMucarela' : 'queijoBrie';
            nextInv[key] = (nextInv[key] ?? 0) + 1;
          });
          return nextInv;
        });
        setTimeout(() => {
          triggerAudioResult(() => sfx.playSound('collect'));
        }, 100);
      }

      // --- SUBFUNÇÃO 11: Salvar Estado ---
      salvarEstado();

      // Próximo dia
      setCurrentDay(prev => prev + 1);

      setLogs(prev => {
        const dayLabel = currentDay + 1;
        const parsedNewLogs: LogMessage[] = [
          {
            id: Math.random().toString(36),
            day: currentDay,
            message: `🌙 O sol se põe... Amanhece o Dia ${dayLabel}!`,
            type: 'system'
          },
          ...logsToAdd.map(l => ({
            id: Math.random().toString(36),
            day: dayLabel,
            message: l.msg,
            type: l.type
          }))
        ];
        return [...prev.slice(-20), ...parsedNewLogs];
      });

    } catch (error) {
      console.error("Erro ao avançar o dia:", error);
      addLog(`⚠️ Ocorreu um erro ao avançar o dia: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  // BUG 1 FIX: mantém o ref sempre apontando para a versão mais recente de advanceDay
  advanceDayRef.current = advanceDay;

  // --- RENDERING HANDLERS & BADGES ---
  const renderGrowthBadge = (weight: number) => {
    let text = 'Magro';
    let color = 'bg-stone-200 text-stone-700';
    if (weight >= 0.8) {
      text = '🏆 Premium';
      color = 'bg-amber-100 border border-amber-300 text-amber-800 font-bold animate-pulse';
    } else if (weight >= 0.5) {
      text = '⚡ Gordo';
      color = 'bg-emerald-100 text-emerald-800';
    } else if (weight >= 0.2) {
      text = '🌿 Médio';
      color = 'bg-blue-100 text-blue-800';
    }
    return <span className={`px-2 py-0.5 text-xs rounded-full ${color}`}>{text}</span>;
  };

  // BUG 16 FIX: usa galinha (animal mais barato) como referência para game over
  const isGameOver = animals.length === 0 && gold < getAnimalPurchasePrice('galinha');

  const { name: seasonName, bg: seasonBg, textColor: seasonTextColor } = (() => {
    const index = Math.floor(((currentDay - 1) % 120) / 30);
    switch (index) {
      case 0:
        return { name: 'Primavera 🌸', bg: 'from-green-800 via-emerald-800 to-teal-800', textColor: 'text-green-300' };
      case 1:
        return { name: 'Verão ☀️', bg: 'from-amber-800 via-yellow-700 to-amber-900', textColor: 'text-yellow-300' };
      case 2:
        return { name: 'Outono 🍂', bg: 'from-orange-950 via-amber-900 to-orange-900', textColor: 'text-orange-300' };
      case 3:
      default:
        return { name: 'Inverno ❄️', bg: 'from-sky-900 via-blue-900 to-indigo-950', textColor: 'text-sky-300' };
    }
  })();

  const getBoiEmoji = (weight: number): string => {
    if (weight < 0.25) return '🐂';
    if (weight < 0.50) return '🐃';
    if (weight < 0.75) return '🐂✨';
    return '🐂👑';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentScreen === 'game' ? seasonBg : 'from-emerald-800 via-[#064e3b] to-emerald-950'} p-4 sm:p-6 md:p-8 flex items-center justify-center font-sans relative overflow-hidden transition-all duration-1000`}>
      
      {/* Background Seasonal Canvas Particles */}
      <SeasonalParticles season={Math.floor(((currentDay - 1) % 120) / 30) === 0 ? 'spring' : Math.floor(((currentDay - 1) % 120) / 30) === 1 ? 'summer' : Math.floor(((currentDay - 1) % 120) / 30) === 2 ? 'autumn' : 'winter'} />
      
      {/* Decorative floating elements in layout background */}
      <div className="absolute top-10 left-10 w-32 h-10 bg-white/5 rounded-full blur-sm pointer-events-none" />
      <div className="absolute top-40 right-20 w-48 h-12 bg-white/5 rounded-full blur-sm pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-36 h-8 bg-white/5 rounded-full blur-sm pointer-events-none" />

      {/* Floating particles list */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {floaters.map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 1, y: f.y, x: f.x, scale: 0.8 }}
              animate={{ opacity: 0, y: f.y - 120, x: f.targetX, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute text-sm font-bold bg-[#78350f] text-[#fef3c7] px-3 py-1.5 rounded-full border-2 border-[#fbbf24] shadow-lg flex items-center gap-1.5"
            >
              <span>{f.emoji}</span>
              <span className="font-display uppercase tracking-wide">{f.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confetti Spawner overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {confetti.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, x: p.x, y: p.y, scale: 0.5, rotate: p.angle }}
              animate={{
                opacity: 0,
                // BUG 17 FIX: usa targetY/targetX pré-calculados, não Math.random() no render
                y: p.targetY,
                x: p.targetX,
                scale: p.scale * 1.5,
                rotate: p.angle + 180
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute text-2xl select-none"
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- SPLASH SCREEN --- */}
      <AnimatePresence>
        {currentScreen === 'splash' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center text-center max-w-xl w-full bg-[#064e3b] border-8 border-[#78350f] rounded-[32px] sm:rounded-[48px] shadow-[0_24px_50px_rgba(0,0,0,0.8)] p-8 sm:p-12 z-40 relative my-auto"
          >
            {/* Ambient retro glowing farm scene */}
            <div className="text-6xl sm:text-8xl drop-shadow-[0_4px_0_#451a03] mb-6 animate-bounce" style={{ animationDuration: '3s' }}>
              🌾🌻🏡
            </div>
            
            <h1 className="text-white text-4xl sm:text-6xl font-display font-black uppercase tracking-wider mb-2 animate-pulse" style={{ textShadow: '3.5px 3.5px 0px #451a03', animationDuration: '2s' }}>
              Fazenda Aurora
            </h1>
            <p className="text-[#fcd57e] text-xs sm:text-sm font-mono tracking-widest uppercase mb-8">
              🚜 Simulador de Animais Retro
            </p>

            {/* Simulated wooden loader container */}
            <div className="w-full max-w-xs bg-[#78350f] border-4 border-[#92400e] rounded-full p-1.5 shadow-[0_4px_0_#451a03] relative mb-4">
              <div 
                className="bg-gradient-to-r from-yellow-400 via-amber-500 to-emerald-500 h-6 rounded-full transition-all duration-300 shadow-inner flex items-center justify-end pr-2 overflow-hidden" 
                style={{ width: `${loadingProgress}%` }}
              >
                <span className="text-[10px] text-white font-mono font-black tracking-tighter mix-blend-difference">
                  {loadingProgress}%
                </span>
              </div>
            </div>
            <p className="text-white/80 text-[10px] font-mono tracking-wide uppercase animate-pulse">
              Carregando pastos fofinhos...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TITLE SCREEN --- */}
      <AnimatePresence>
        {currentScreen === 'title' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center text-center max-w-2xl w-full bg-[#064e3b] border-8 border-[#78350f] rounded-[32px] sm:rounded-[48px] shadow-[0_24px_50px_rgba(0,0,0,0.8)] p-6 sm:p-12 z-40 relative my-auto"
          >
            {/* Header / Game Name */}
            <div className="text-7xl sm:text-8xl drop-shadow-[0_4px_0_#451a03] mb-6 flex gap-4 justify-center animate-bounce" style={{ animationDuration: '4s' }}>
              <span>🐄</span>
              <span>🐑</span>
              <span>🐂</span>
            </div>

            <h1 className="text-white text-4xl sm:text-6xl font-display font-black uppercase tracking-wider mb-2" style={{ textShadow: '4px 4px 0px #451a03' }}>
              Fazenda Aurora
            </h1>
            <p className="text-[#fcd57e] text-xs sm:text-sm font-mono tracking-widest uppercase mb-10 max-w-md mx-auto">
              👑 O melhor simulador de animais com estações, rafting de recursos & comércio dinâmico!
            </p>

            {/* Menu Buttons container */}
            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md mb-8">
              
              {/* 🌱 NOVO JOGO BUTTON */}
              <button
                onClick={() => {
                  initGame();
                  setCurrentScreen('game');
                  sfx.playSound('click');
                }}
                className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white border-b-8 border-[#047857] shadow-xl px-6 py-4 rounded-2xl font-display font-black text-sm uppercase tracking-wider hover:scale-[1.03] active:translate-y-1 active:border-b-4 transition-all cursor-pointer flex flex-col items-center gap-1.5"
              >
                <text className="text-2xl sm:text-3xl">🌱</text>
                <span>Novo Jogo</span>
                <span className="text-[9px] text-[#ecfdf5]/80 font-mono font-medium lowercase tracking-normal">Zera tudo e começa do zero</span>
              </button>

              {/* 📀 CONTINUAR BUTTON */}
              <button
                onClick={() => {
                  if (localStorage.getItem('aurora_farm_save')) {
                    setCurrentScreen('game');
                    sfx.playSound('click');
                  } else {
                    alert("📀 Nenhum save encontrado! Iniciando nova fazenda...");
                    initGame();
                    setCurrentScreen('game');
                    sfx.playSound('click');
                  }
                }}
                className="flex-1 bg-[#ffcd7e] hover:bg-[#fbbf24] text-[#78350f] border-b-8 border-[#d97706] shadow-xl px-6 py-4 rounded-2xl font-display font-black text-sm uppercase tracking-wider hover:scale-[1.03] active:translate-y-1 active:border-b-4 transition-all cursor-pointer flex flex-col items-center gap-1.5"
              >
                <text className="text-2xl sm:text-3xl">📀</text>
                <span>Continuar</span>
                <span className="text-[9px] text-[#78350f]/70 font-mono font-medium lowercase tracking-normal">
                  {localStorage.getItem('aurora_farm_save') ? 'Restaurar progresso salvo' : 'Nenhum save (cria novidade)'}
                </span>
              </button>

            </div>

            {/* Title Screen Footer */}
            <div className="border-t-2 border-white/10 pt-4 w-full text-center">
              <p className="text-white/60 text-xs font-mono tracking-wider uppercase">
                💡 Dica: mantenha a felicidade em 100% por 3 dias para virar Melhor Amigo!
              </p>
              <p className="text-[#fcd57e] text-[10px] font-mono mt-1 opacity-70 uppercase tracking-widest">
                Fazenda Aurora • 2026 Edition
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <div className={`max-w-6xl w-full bg-[#064e3b] border-8 border-[#78350f] rounded-[32px] sm:rounded-[48px] shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between ${currentScreen !== 'game' ? 'hidden' : ''}`}>
        
        {/* --- RESOURCE HEADER BAR (WOOD HUD DESIGN) --- */}
        <div className="bg-[#78350f] border-4 border-[#92400e] rounded-[32px] sm:rounded-full p-4 sm:p-5 m-4 sm:m-6 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-[0_8px_0_#451a03]">
          
          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl drop-shadow-[0_3px_0_#451a03] animate-bounce" style={{ animationDuration: '4s' }}>🏡</span>
            <div>
              <h1 className="text-white text-2xl sm:text-3xl font-display font-black uppercase tracking-wider" style={{ textShadow: '2.5px 2.5px 0px #451a03' }}>
                Fazenda Aurora
              </h1>
              <div className="flex flex-col mt-0.5">
                <span className="text-[#fcd57e] text-xs uppercase font-mono font-bold tracking-widest block">
                  🌾 Nível {farmLevel} ({getFarmTitle(farmLevel)}) • Clima: {weather === 'chuva' ? '🌧️ Chuva' : weather === 'sol' ? '☀️ Sol Forte' : '☁️ Nublado'} • Estação: {seasonName}
                </span>
                
                {/* Indicador de progresso do nível */}
                <div className="flex items-center gap-1.5 mt-1" title={`Cada nível requer 10 dias. Faltam ${10 - ((currentDay - 1) % 10)} dias para o Nível ${farmLevel + 1}`}>
                  <span className="text-[10px] text-white/90 font-mono font-bold uppercase tracking-wider shrink-0">
                    ⬆️ Próximo nível em {10 - ((currentDay - 1) % 10)} {10 - ((currentDay - 1) % 10) === 1 ? 'dia' : 'dias'}
                  </span>
                  <div className="w-16 sm:w-24 bg-black/40 h-2 rounded-full overflow-hidden border border-[#92400e] shadow-inner flex shrink-0">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full transition-all duration-500" 
                      style={{ width: `${((currentDay - 1) % 10) * 10}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#fcd57e] font-mono font-bold shrink-0">
                    {((currentDay - 1) % 10)}/10 dias
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
            
            {/* Real-time Inventory counters in Top Bar */}
            <div 
              className="bg-[#fef3c7] border-3 border-[#fbbf24] rounded-full px-4 py-2 flex items-center justify-center gap-3.5 shadow-[inset_0_4px_0_rgba(255,255,255,0.5),0_4px_0_#451a03] text-[#92400e] font-black text-sm font-mono shrink-0 select-none" 
              title="Armazém de produtos coletados. Use-os para Crafting ou venda no Mercado!"
            >
              <div className="flex items-center gap-1" title="🥛 Leite Cru coletado do seu rebanho">
                <span>🥛</span>
                <span>{inventory.milk}</span>
              </div>
              <div className="flex items-center gap-1" title="🧶 Lã Crua tosquiada das suas ovelhas">
                <span>🧶</span>
                <span>{inventory.wool}</span>
              </div>
              <div className="flex items-center gap-1" title="🧀 Queijo artesanal curado">
                <span>🧀</span>
                <span>{inventory.cheese}</span>
              </div>
              <div className="flex items-center gap-1" title="🧣 Cachecol elegante trançado">
                <span>🧣</span>
                <span>{inventory.scarf}</span>
              </div>
            </div>

            {/* Coins display */}
            <div className="bg-[#fef3c7] border-3 border-[#fbbf24] rounded-full px-5 py-2 flex items-center gap-2 shadow-[inset_0_4px_0_rgba(255,255,255,0.5),0_4px_0_#451a03] text-[#92400e] font-black text-lg sm:text-xl font-mono" title="Seu montante em moedas de ouro para alimentação e compras">
              <span className="text-xl sm:text-2xl">💰</span>
              <span>{Math.floor(gold)}</span>
              <span className="text-xs uppercase font-bold tracking-wide text-[#b45309] ml-1">moedas</span>
            </div>

            {/* Day display */}
            <div className="bg-[#fef3c7] border-3 border-[#fbbf24] rounded-full px-5 py-2 flex items-center gap-2 shadow-[inset_0_4px_0_rgba(255,255,255,0.5),0_4px_0_#451a03] text-[#92400e] font-black text-lg sm:text-xl font-mono" title="Dia atual de atividade. Estações mudam a cada 30 dias.">
              <span className="text-xl sm:text-2xl">📅</span>
              <span>Dia {currentDay}</span>
            </div>

            {/* 🏭 Automação Button */}
            <button 
              onClick={() => {
                setShowAutomationModal(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="bg-emerald-600 border-3 border-emerald-400 hover:bg-emerald-500 text-white font-mono font-black text-sm px-4 py-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#064e3b] cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 focus:outline-none"
              title="Gerenciar Máquinas Automáticas de Coleta e Alimentação"
            >
              <span>🏭</span>
              <span>Automação</span>
            </button>

            {/* 📊 Mercado Button */}
            <button 
              onClick={() => {
                setShowMarketModal(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="bg-sky-600 border-3 border-sky-400 hover:bg-sky-500 text-white font-mono font-black text-sm px-4 py-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#0c4a6e] cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 focus:outline-none"
              title="Painel de Preços Flutuantes, Sazonalidade e Oferta"
            >
              <span>📊</span>
              <span>Mercado</span>
            </button>

            {/* 🧀 Queijaria Button */}
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowQueijariaModal(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="bg-amber-600 border-3 border-amber-400 hover:bg-amber-500 text-white font-mono font-black text-sm px-4 py-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#451a03] cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 focus:outline-none"
              title="Acesse a Queijaria para maturação de queijos artesanais e ampliação"
            >
              <span>🧀</span>
              <span>Queijaria</span>
              {queijosEmMaturacao.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold font-mono">
                  {queijosEmMaturacao.length}
                </span>
              )}
            </button>

            {/* 💰 Vender Tudo Button */}
            <button 
              onClick={() => {
                setShowSellAllConfirmModal(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="bg-amber-500 border-3 border-amber-300 hover:bg-amber-400 text-[#451a03] font-mono font-black text-sm px-4 py-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#78350f] cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 focus:outline-none"
              title="Liquidar todo o estoque do seu Armazém instantaneamente por moedas"
            >
              <span>💰</span>
              <span>Vender Tudo</span>
            </button>

            {/* Sound Toggle */}
            <button 
              onClick={() => {
                const nw = !soundEnabled;
                setSoundEnabled(nw);
                sfx.isMuted = !nw;
                if (nw) {
                  sfx.playSound('click');
                }
              }}
              className="bg-[#ffcd7e] border-3 border-[#fbbf24] hover:bg-[#fbc550] text-[#78350f] p-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#92400e] cursor-pointer transition-all hover:scale-105 font-mono text-lg font-black leading-none flex items-center justify-center w-[46px] h-[46px] focus:outline-none"
              title={soundEnabled ? "Desativar efeitos sonoros" : "Ativar efeitos sonoros"}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>

            {/* Achievements Trophy Room Button */}
            <button 
              onClick={() => {
                setShowAchievementsModal(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="bg-amber-500 border-3 border-amber-300 hover:bg-amber-600 text-white p-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#92400e] cursor-pointer transition-all hover:scale-105 font-mono text-lg font-black leading-none flex items-center justify-center w-[46px] h-[46px] focus:outline-none"
              title="Sala de Troféus & Conquistas"
            >
              🏆
            </button>

            {/* 🔔 Notificações Button */}
            <button
              onClick={() => {
                setShowNotifications(prev => !prev);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="relative bg-[#ffcd7e] border-3 border-[#fbbf24] hover:bg-[#fbc550] text-[#78350f] p-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#92400e] cursor-pointer transition-all hover:scale-105 font-mono text-lg font-black leading-none flex items-center justify-center w-[46px] h-[46px] focus:outline-none"
              title="Notificações persistentes"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* 🎯 Missões Button */}
            <button
              onClick={() => {
                setShowMissionsModal(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="relative bg-purple-600 border-3 border-purple-400 hover:bg-purple-500 text-white p-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#581c87] cursor-pointer transition-all hover:scale-105 font-mono text-lg font-black leading-none flex items-center justify-center w-[46px] h-[46px] focus:outline-none"
              title="Missões e objetivos"
            >
              <Target className="w-5 h-5" />
              {missions.filter(m => m.completed && !m.claimed).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-[#451a03] text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            {/* 📊 Stats Button */}
            <button
              onClick={() => {
                setShowStatsModal(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="bg-teal-600 border-3 border-teal-400 hover:bg-teal-500 text-white p-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#0f766e] cursor-pointer transition-all hover:scale-105 font-mono text-lg font-black leading-none flex items-center justify-center w-[46px] h-[46px] focus:outline-none"
              title="Estatísticas históricas"
            >
              <BarChart2 className="w-5 h-5" />
            </button>

            {/* Reset Game button */}
            <button
              onClick={() => {
                if (window.confirm('Tem certeza? Todo o progresso será perdido!')) {
                  initGame();
                  triggerAudioResult(() => sfx.playSound('click'));
                } else {
                  triggerAudioResult(() => sfx.playSound('click'));
                }
              }}
              className="bg-[#dc2626] border-3 border-[#991b1b] hover:bg-[#b91c1c] active:translate-y-0.5 shadow-[0_4px_0_#7f1d1d] p-2.5 rounded-full text-[#fef3c7] cursor-pointer transition-all hover:scale-105 focus:outline-none"
              title="Resetar Jogo (Apaga progresso permanente)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

          </div>

        </div>

        {/* --- TRAVEL MERCHANT SPECIAL NOTICE --- */}
        {merchantActive && (
          <div className="bg-gradient-to-r from-purple-800 to-indigo-900 border-x-8 border-y-4 border-yellow-400 p-3 mx-6 rounded-2xl flex items-center justify-between text-yellow-300 font-extrabold text-sm shadow-lg animate-pulse uppercase select-none font-sans">
            <span className="flex items-center gap-2">🧙‍♂️ MERCADOR VIAJANTE NA ÁREA: Todos os produtos brutos, manufaturados e bois valem 1.5x moedas hoje!</span>
            <span className="text-xs bg-yellow-400 text-purple-950 px-2.5 py-1 rounded-lg">Bônus Ativo!</span>
          </div>
        )}

        {/* --- MAIN GAMEBODY BENTO LAYOUT --- */}
        <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 bg-transparent">
          
          {/* --- LEFT HAND SIDE: ACTIVE ANIMALS (8/12 Cols) --- */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-[#78350f]/60 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-spin" style={{ animationDuration: '6s' }}>🌾</span>
                <h2 className="text-[#fef3c7] text-xl sm:text-2xl font-display font-black tracking-wide" style={{ textShadow: '1.5px 1.5px 0px #451a03' }}>
                  CURRAL DA AURORA ({animals.length}/{Math.min(farmLevel * 4, 20)} Animais)
                </h2>
                <span className="text-[10px] text-amber-200/90 font-mono font-bold block uppercase mt-0.5 tracking-wider leading-none">
                  Capacidade Máxima: {Math.min(farmLevel * 4, 20)} · {farmLevel * 4 < 20 ? "Próximo nível expande +4 vagas" : "Limite Máximo Atingido"}
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Collapsible purchase Menu button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowBuyMenu(!showBuyMenu);
                  }}
                  className={`${showBuyMenu ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white border-b-4 ${showBuyMenu ? 'border-indigo-800' : 'border-[#1d4ed8]'} px-4 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5`}
                  title="Comprar Animais: abre o catálogo para expandir seu rebanho"
                >
                  🛒 COMPRAR ANIMAL
                </button>
 
                {/* HELP / TUTORIAL BUTTON */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTutorialModal(true);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="bg-emerald-600 hover:bg-[#059669] text-white border-b-4 border-[#047857] px-4 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Ajuda & Tutorial: veja como jogar e as regras de pontuação"
                >
                  📖 TUTORIAL
                </button>
 
                {/* ADVANCE DAY */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    advanceDay(e);
                  }}
                  disabled={isGameOver}
                  className="bg-[#f59e0b] hover:bg-[#d97706] disabled:bg-stone-500 text-white border-b-4 border-[#b45309] px-4 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Avançar Dia: passa para o próximo dia, animais perdem fome e podem produzir"
                >
                  🌞 AVANÇAR DIA
                </button>
 
                {/* DORMIR BUTTON */}
                <button
                  type="button"
                  onClick={(e) => {
                    // BUG 20 FIX: usa ref para evitar duplo-clique
                    e.preventDefault();
                    if (isSleepingRef.current) return;
                    isSleepingRef.current = true;
                    setIsSleeping(true);
                    triggerAudioResult(() => sfx.playSound('click'));
                    setTimeout(() => {
                      advanceDay(null as any);
                      setIsSleeping(false);
                      isSleepingRef.current = false;
                    }, 1250);
                  }}
                  disabled={isGameOver || isSleeping}
                  className="bg-indigo-600 hover:bg-indigo-750 disabled:bg-stone-500 text-white border-b-4 border-indigo-900 px-4 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Dormir: vai para a cama e inicia o próximo dia com uma bela transição de descanso"
                >
                  😴 DORMIR
                </button>

                {/* AUTO-AVANÇO BUTTON */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setAutoAdvance(prev => !prev);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  disabled={isGameOver}
                  className={`${autoAdvance ? 'bg-emerald-600 border-emerald-800 hover:bg-emerald-500' : 'bg-slate-600 border-slate-800 hover:bg-slate-500'} disabled:bg-stone-500 text-white border-b-4 px-3 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1`}
                  title={autoAdvance ? 'Auto-avanço ativo — clique para pausar' : 'Ativar auto-avanço de dias'}
                >
                  {autoAdvance ? `▶ AUTO (${autoSpeed}s)` : '⏸ AUTO'}
                </button>

                {/* SELETOR DE VELOCIDADE */}
                <select
                  value={autoSpeed}
                  onChange={(e) => setAutoSpeed(Number(e.target.value))}
                  className="bg-slate-700 text-white border-2 border-slate-500 rounded-xl px-2 py-2 font-mono font-black text-xs cursor-pointer focus:outline-none"
                  title="Velocidade do auto-avanço"
                >
                  <option value={10}>🐢 Lento (10s)</option>
                  <option value={5}>🐇 Médio (5s)</option>
                  <option value={3}>⚡ Rápido (3s)</option>
                </select>
              </div>
            </div>

            {/* Collapsible Purchasing Tray Drawer */}
            <AnimatePresence>
              {showBuyMenu && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#fde68a]/30 border-4 border-[#fbbf24] rounded-[28px] p-5 flex flex-col md:flex-row gap-4 items-center justify-around mb-2 shadow-inner overflow-hidden"
                >
                  {/* Cow */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel >= 4 && (
                      <span className="absolute -top-2.5 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">10% Off</span>
                    )}
                    <span className="text-4xl">🐄</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Vaca Leiteira</h4>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('vaca')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('vaca', e)}
                      disabled={gold < getAnimalPurchasePrice('vaca')}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra uma Vaca leiteira. Gera leite diário no Armazém após o primeiro dia."
                    >
                      Comprar
                    </button>
                  </div>
                  
                  {/* Sheep */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel >= 4 && (
                      <span className="absolute -top-2.5 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">10% Off</span>
                    )}
                    <span className="text-4xl">🐑</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Ovelha de Lã</h4>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('ovelha')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('ovelha', e)}
                      disabled={gold < getAnimalPurchasePrice('ovelha')}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra uma Ovelha. Fornece lã a cada 3 dias (a cada 2 dias se for melhor amigo)."
                    >
                      Comprar
                    </button>
                  </div>
                  
                  {/* Ox */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel >= 4 && (
                      <span className="absolute -top-2.5 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">10% Off</span>
                    )}
                    <span className="text-4xl">🐂</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Boi de Corte</h4>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('boi')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('boi', e)}
                      disabled={gold < getAnimalPurchasePrice('boi')}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra um Boi. Acumula peso de corte diariamente e vende na feira por alto retorno."
                    >
                      Comprar
                    </button>
                  </div>
                  
                  {/* Chicken */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel >= 4 && (
                      <span className="absolute -top-2.5 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">10% Off</span>
                    )}
                    <span className="text-4xl">🐔</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Galinha de Quintal</h4>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('galinha')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('galinha', e)}
                      disabled={gold < getAnimalPurchasePrice('galinha')}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra uma Galinha. Fornece ovos saudáveis diariamente se alimentada."
                    >
                      Comprar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {animals.length === 0 ? (
              <div className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[48px] p-8 text-center flex flex-col items-center justify-center gap-4 py-12 shadow-[0_12px_0_#d97706]">
                <span className="text-5xl animate-bounce">💀</span>
                <h3 className="text-xl sm:text-2xl font-display font-black text-[#dc2626] uppercase">
                  O Curral está vazio!
                </h3>
                <p className="text-sm font-sans max-w-sm text-[#78350f] font-semibold">
                  Todos os seus animais foram vendidos ou infelizmente faleceram por fome ou estresse extremo. Abra o catálogo clicando em comprar animal no topo, ou reinicie a fazenda!
                </p>
                {isGameOver && (
                  <div className="mt-2 bg-[#fee2e2] border-2 border-[#ef4444] p-3 rounded-2xl max-w-xs text-[#991b1b] font-mono text-xs font-bold uppercase">
                    ⚠️ <strong>FALÊNCIA!</strong> Moedas insuficientes para comprar animais no mercado.
                  </div>
                )}
                <button 
                  onClick={initGame}
                  className="bg-[#10b981] hover:bg-[#059669] text-white border-b-4 border-[#065f46] px-6 py-3 rounded-2xl font-display font-black shadow-md active:translate-y-0.5 cursor-pointer flex items-center gap-2 uppercase tracking-wider text-sm hover:scale-105 transition-all animate-pulse"
                >
                  <RotateCcw className="w-4 h-4 text-white stroke-[3]" /> Recomeçar Fazenda do Zero
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <AnimatePresence>
                  {animals.map((animal) => {
                    const isEditing = editingId === animal.id;
                    const valueOfOx = animal.type === 'boi' ? calculateBoiValue(animal) : 0;
                    
                    const isCritical = animal.happiness < 20 || animal.hunger < 25;
                    
                    return (
                      <motion.div
                        key={animal.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className={`rounded-[48px] p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-all relative border-4 ${
                          isCritical 
                            ? 'bg-red-50/70 border-red-600 shadow-[0_12px_0_#991b1b]' 
                            : 'bg-[#fffbeb] border-[#fbbf24] shadow-[0_12px_0_#d97706] hover:border-[#f59e0b]'
                        }`}
                      >
                        {/* Critical Danger warning badge */}
                        {isCritical && (
                          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-red-600 to-red-800 text-white font-black text-[9px] sm:text-[10px] px-3 py-1 rounded-full uppercase shadow-md flex items-center gap-1.5 animate-pulse border-2 border-white select-none">
                            ⚠️ Risco de Morte Amanhã!
                          </div>
                        )}

                        {/* Best friend decorative badge */}
                        {animal.isBestFriend && (
                          <div className="absolute -top-3.5 -left-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase shadow-md flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3s' }}>
                            <span className="animate-heart-pulse">💖</span> Melhor Amigo!
                          </div>
                        )}

                        {/* Animal header with edit rename */}
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="flex-1">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5 max-w-full">
                                <input 
                                  type="text" 
                                  value={tempName}
                                  maxLength={14}
                                  onChange={(e) => setTempName(e.target.value)}
                                  className="border-2 border-[#fbbf24] rounded-xl px-2 py-1 text-xs text-[#78350f] bg-[#fffbeb] outline-none font-bold w-24 sm:w-28 focus:ring-2 focus:ring-[#10b981]"
                                />
                                <button 
                                  onClick={() => saveRename(animal.id)}
                                  className="bg-[#10b981] hover:bg-[#059669] text-white text-[10px] px-2.5 py-1 rounded-lg cursor-pointer font-black uppercase tracking-wider border-b-2 border-[#065f46]"
                                >
                                  Salvar
                                </button>
                                <button 
                                  onClick={() => setEditingId(null)}
                                  className="bg-stone-300 hover:bg-stone-400 text-stone-800 text-[10px] px-2.5 py-1 rounded-lg cursor-pointer font-black uppercase tracking-wider border-b-2 border-stone-500"
                                >
                                  X
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 group/nametooltip relative">
                                <h3 className="font-display font-black text-xl sm:text-2xl text-[#78350f] leading-none uppercase tracking-wide cursor-pointer hover:text-emerald-700 transition-colors">
                                  {animal.name}
                                </h3>
                                <button 
                                  onClick={() => startRename(animal.id, animal.name)}
                                  className="opacity-40 hover:opacity-100 hover:text-[#10b981] transition-opacity cursor-pointer p-0.5 rounded"
                                  title="Renomear Animal: altere o nome deste simpático bichinho"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-[#92400e]" />
                                </button>
                                
                                {/* Name tooltip code check */}
                                <div className="absolute top-full left-0 mt-1 w-52 bg-[#78350f] text-[#fef3c7] text-[10px] font-mono rounded-xl p-2.5 shadow-xl border-2 border-[#fbbf24] hidden group-hover/nametooltip:block z-50 pointer-events-none leading-normal normal-case">
                                  <div className="font-bold text-[#fbbf24] mb-0.5 uppercase">📋 Código #{animal.id}:</div>
                                  {animal.isBestFriend 
                                    ? "🌟 Um vínculo supremo se formou! Ele é seu melhor amigo de confiança da Aurora." 
                                    : "❤️ Trate com carinho. Mantenha a felicidade em 100% por 3 dias para torná-lo Melhor Amigo."}
                                </div>
                              </div>
                            )}

                            {/* Animal Badge */}
                            <span className="text-[10px] uppercase font-mono tracking-widest text-[#92400e] font-black block mt-1">
                              {animal.type === 'vaca' ? '🐄 Vaca Leiteira' : animal.type === 'ovelha' ? '🐑 Ovelha de Lã' : animal.type === 'boi' ? '🐂 Boi de Corte' : '🐔 Galinha de Quintal'}
                            </span>
                            {/* Trait badge */}
                            {animal.trait && (() => {
                              const t = getTraitInfo(animal.trait);
                              return (
                                <span
                                  className="inline-flex items-center gap-1 mt-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 cursor-help"
                                  title={t.description}
                                >
                                  {t.emoji} {t.label}
                                </span>
                              );
                            })()}
                          </div>

                          {/* Avatar component with product context tooltip */}
                          <div className="relative group/avatartooltip">
                            <div className={`rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-[inset_0_-4px_0_#d97706] border-4 border-[#f59e0b] shrink-0 relative ${animal.isBestFriend ? 'bg-pink-100 border-pink-400 shadow-pink-500' : 'bg-[#fde68a]'} cursor-help`}>
                              {/* Visual Anim decorations on avatar icons */}
                              {animal.type === 'vaca' && (
                                <>
                                  <span className="select-none">🐄</span>
                                  {animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-droplet-flow select-none">🥛</span>}
                                </>
                              )}
                              {animal.type === 'ovelha' && (
                                <>
                                  <span className="select-none">🐑</span>
                                  {animal.woolReady && <span className="absolute -bottom-2 -right-1 text-base animate-wool-shiny select-none">🧶</span>}
                                </>
                              )}
                              {animal.type === 'galinha' && (
                                <>
                                  <span className="select-none">🐔</span>
                                  {animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🥚</span>}
                                </>
                              )}
                              {animal.type === 'boi' && (
                                <span className="select-none">{getBoiEmoji(animal.weightGain || 0.15)}</span>
                              )}
                            </div>

                            {/* Avatar tooltip */}
                            <div className="absolute top-full right-0 mt-1 w-56 bg-[#78350f] text-[#fef3c7] text-[10px] font-mono rounded-xl p-2.5 shadow-xl border-2 border-[#fbbf24] hidden group-hover/avatartooltip:block z-50 pointer-events-none leading-relaxed normal-case text-left">
                              <div className="font-bold text-[#fbbf24] mb-0.5 uppercase border-b border-white/10 pb-0.5">🌾 RENDIMENTO:</div>
                              {animal.type === 'vaca' 
                                ? "🥛 Ordenhe leite diariamente. Dá mais leite se feliz ou em clima de Sol Forte." 
                                : animal.type === 'ovelha' 
                                ? "🧶 Fornece lã crua para fabricar cachecóis premium a cada 3 dias." 
                                : animal.type === 'boi'
                                ? "🐂 Ganha peso corporal contínuo para revenda de alta lucratividade."
                                : "🥚 Bota ricos ovos de quintal se manter felicidade > 30% e fome > 25%."}
                            </div>
                          </div>
                        </div>

                        {/* Stats - Fome and Felicidade */}
                        <div className="bg-[#fffbeb] rounded-[24px] p-4 mb-4 space-y-3.5 border-2 border-[#fbbf24] shadow-inner">
                          
                          {/* Hunger bar */}
                          <div className="relative group/hungertooltip">
                            <div className="flex justify-between items-center text-xs font-sans font-extrabold uppercase tracking-wider text-[#92400e]">
                              <span className="flex items-center gap-1">🍽️ Fome</span>
                              <span>{Math.floor(animal.hunger)}%</span>
                            </div>
                            <div className="bg-[#e5e7eb] h-4 rounded-full overflow-hidden mt-1 border-2 border-[#d1d5db] shadow-inner relative cursor-help">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  animal.hunger < 25 ? 'bg-red-500 animate-pulse' : animal.hunger < 60 ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                                }`}
                                style={{ width: `${animal.hunger}%` }}
                              />
                            </div>

                            {/* Floating bubble tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#78350f] text-[#fef3c7] text-[10px] font-mono rounded-xl p-2.5 shadow-xl border-2 border-[#fbbf24] hidden group-hover/hungertooltip:block z-50 pointer-events-none leading-relaxed normal-case">
                              <div className="font-bold text-[#fbbf24] mb-0.5 border-b border-white/15 pb-1">🍽️ STATUS DE NUTRIÇÃO:</div>
                              • <span className="text-red-400 font-bold">Abaixo de 30%</span>: Não produz leite/lã e perde felicidade diária.<br/>
                              • <span className="text-green-400 font-bold">Acima de 70%</span>: Ganho extra de peso diário (para o Boi).
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] w-0.5 h-0.5 border-4 border-transparent border-t-[#fbbf24] bg-transparent" />
                            </div>
                          </div>

                          {/* Happiness bar */}
                          <div className="relative group/happinesstooltip">
                            <div className="flex justify-between items-center text-xs font-sans font-extrabold uppercase tracking-wider text-[#92400e]">
                              <span className="flex items-center gap-1">😊 Felicidade</span>
                              <span>{Math.floor(animal.happiness)}%</span>
                            </div>
                            <div className="bg-[#e5e7eb] h-4 rounded-full overflow-hidden mt-1 border-2 border-[#d1d5db] shadow-inner relative cursor-help">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  animal.happiness < 30 ? 'bg-red-500 animate-pulse' : 'bg-[#10b981]'
                                }`}
                                style={{ width: `${animal.happiness}%` }}
                              />
                            </div>

                            {/* Floating bubble tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#78350f] text-[#fef3c7] text-[10px] font-mono rounded-xl p-2.5 shadow-xl border-2 border-[#fbbf24] hidden group-hover/happinesstooltip:block z-50 pointer-events-none leading-relaxed normal-case">
                              <div className="font-bold text-[#fbbf24] mb-0.5 border-b border-white/15 pb-1">😊 STATUS DE HUMOR:</div>
                              • <span className="text-red-400 font-bold">Abaixo de 30%</span>: Produção reduzida de leite em 50%.<br/>
                              • <span className="text-blue-400 font-bold">Acima de 80%</span>: Maior peso/lã e rapidez no crescimento.<br/>
                              • <span className="text-green-400 font-bold">100% por 3 dias</span>: Torna-se Melhor Amigo de confiança!
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[5px] w-0.5 h-0.5 border-4 border-transparent border-t-[#fbbf24] bg-transparent" />
                            </div>
                          </div>

                        </div>

                        {/* Production Info Box */}
                        {(() => {
                          const isReady = (animal.type === 'vaca' && animal.hasProducedToday) || (animal.type === 'ovelha' && animal.woolReady) || (animal.type === 'boi' && (animal.weightGain || 0) >= 0.8) || (animal.type === 'galinha' && animal.hasProducedToday);
                          return (
                            <div className={`border rounded-[18px] p-3 text-center mb-4 text-xs font-extrabold flex flex-col items-center justify-center gap-1.5 uppercase tracking-wide shadow-sm min-h-[58px] ${
                              isReady 
                                ? 'bg-[#dcfce7] border-dashed border-[#166534] text-[#166534]' 
                                : 'bg-[#fffbeb] border-dashed border-[#fbbf24] text-[#92400e] '
                            }`}>
                              {animal.type === 'vaca' && (
                                <>
                                  {animal.hasProducedToday ? (
                                    <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                                      🥛 Balde de leite cru pronto! (colete para o Armazém)
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                                      ⏳ Leite ordenhado hoje (Retorna amanhã)
                                    </span>
                                  )}
                                </>
                              )}

                              {animal.type === 'ovelha' && (
                                <>
                                  {animal.woolReady ? (
                                    <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                                      🧶 Novelo de lã crescendo de alta qualidade!
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                                      ⏳ Lã cresce em {Math.max(0, (animal.isBestFriend ? 2 : 3) - (animal.daysSinceLastWool || 0))} dias (tosquia)
                                    </span>
                                  )}
                                </>
                              )}

                              {animal.type === 'galinha' && (
                                <>
                                  {animal.hasProducedToday ? (
                                    <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                                      🥚 Ovo de quintal fresquinho pronto para coleta!
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                                      ⏳ Próximo ovo amanhã se saudável e alimentada
                                    </span>
                                  )}
                                </>
                              )}

                              {animal.type === 'boi' && (
                                <div className="flex flex-col gap-1 w-full uppercase">
                                  <div className="flex justify-between items-center w-full">
                                    <span className="flex items-center gap-1 text-[11px]">
                                      📈 Peso: <span className="font-mono font-black ml-1 text-xs">{Math.floor((animal.weightGain || 0.15) * 100)}%</span>
                                    </span>
                                    {renderGrowthBadge(animal.weightGain || 0.15)}
                                  </div>
                                  <div className="w-full bg-[#e5e7eb] h-2.5 rounded-full overflow-hidden mt-1 border border-stone-300 relative">
                                    <div 
                                      className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.floor((animal.weightGain || 0.15) * 100)}%` }}
                                    />
                                  </div>
                                  <div className="text-[10px] text-[#78350f]/80 font-mono text-left border-t border-[#fbbf24]/50 pt-1 mt-1.5 leading-none self-start w-full">
                                    Valor atual na Feira: 💰 ~{valueOfOx} moedas
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* CARD ACTION BUTTONS */}
                        <div className="flex gap-2 flex-wrap justify-between mt-auto">
                          
                          {/* Alimentar (Dynamic feed count based on animal type) */}
                          {(() => {
                            const feedType = animal.type === 'vaca' ? 'racaoLeite' : animal.type === 'ovelha' ? 'racaoOvelha' : animal.type === 'boi' ? 'racaoBoi' : 'racaoGalinha';
                            const feedQty = inventory[feedType] ?? 0;
                            const label = animal.type === 'vaca' ? 'Ração Vaca' : animal.type === 'ovelha' ? 'Ração Ovelha' : animal.type === 'boi' ? 'Ração Boi' : 'Ração Galinha';
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  feedAnimal(animal.id, e);
                                }}
                                className="bg-[#10b981] hover:bg-[#059669] active:translate-y-0.5 border-b-4 border-[#065f46] shadow-md rounded-[16px] px-4 py-2.5 font-display text-[10px] sm:text-xs text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1 flex-1 select-none transition-all hover:scale-[1.02]"
                                title={`Alimentar: Consome 1un de ${label}. Estoque atual: ${feedQty}.`}
                              >
                                <Utensils className="w-3.5 h-3.5" /> Alimentar ({feedQty} unidades)
                              </button>
                            );
                          })()}

                          {/* Collect milk (Cows) */}
                          {animal.type === 'vaca' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                collectMilk(animal.id, e);
                              }}
                              disabled={!animal.hasProducedToday}
                              className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${
                                animal.hasProducedToday 
                                  ? 'bg-[#3b82f6] hover:bg-[#2563eb] border-b-4 border-[#1d4ed8] shadow-md active:translate-y-0.5 hover:scale-[1.02]' 
                                  : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'
                              }`}
                              title={animal.hasProducedToday ? "Coletar Leite: coleta baldes de Leite Cru prontinhos para o seu Ateliê de Queijo" : "Aguarde o amanhecer para a ordenha"}
                            >
                              🥛 Coletar
                            </button>
                          )}

                          {/* Chop wool (Sheep) */}
                          {animal.type === 'ovelha' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                collectWool(animal.id, e);
                              }}
                              disabled={!animal.woolReady}
                              className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${
                                animal.woolReady 
                                  ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] border-b-4 border-[#5b21b6] shadow-md active:translate-y-0.5 hover:scale-[1.02]' 
                                  : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'
                              }`}
                              title={animal.woolReady ? "Tosquiar: extrai lã quentinha direto para o seu estoque manufaturado" : "A lã ainda está em fase de crescimento"}
                            >
                              <Scissors className="w-3.5 h-3.5" /> Tosquiar
                            </button>
                          )}

                          {/* Collect Egg (Chickens) */}
                          {animal.type === 'galinha' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                collectEgg(animal.id, e);
                              }}
                              disabled={!animal.hasProducedToday}
                              className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${
                                animal.hasProducedToday 
                                  ? 'bg-amber-500 hover:bg-amber-400 border-b-4 border-amber-700 text-white shadow-md active:translate-y-0.5 hover:scale-[1.02]' 
                                  : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'
                              }`}
                              title={animal.hasProducedToday ? "Coletar Ovo: recolhe ovos de quintal saudáveis" : "Aguarde o próximo pôr do sol"}
                            >
                              🥚 Coletar
                            </button>
                          )}

                          {/* Sell Oxen (Ox) */}
                          {animal.type === 'boi' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                sellOx(animal.id, e);
                              }}
                              className="bg-red-500 hover:bg-[#dc2626] border-b-4 border-[#991b1b] shadow-md rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1.5 flex-1 select-none transition-all hover:scale-[1.02]"
                              title={`Vender Boi: venda imediata na Feira. Retorna moedas baseadas no peso (%): 💰 ~${valueOfOx}`}
                            >
                              💰 Vender
                            </button>
                          )}

                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* --- IN-APP MINI METRICS TRACKER --- */}
            <div className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[32px] p-5 shadow-[0_8px_0_#d97706]">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-[#78350f] mb-3.5 flex items-center gap-1.5">
                📈 Relatório Geral de Lucros
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="bg-[#fffbeb] p-3 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <div className="text-[10px] text-[#92400e] uppercase font-black leading-none">Total Faturado</div>
                  <div className="text-base font-black text-emerald-700 mt-1">💰 {stats.totalEarned}</div>
                </div>
                <div className="bg-[#fffbeb] p-3 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <div className="text-[10px] text-[#92400e] uppercase font-black leading-none">Alimentações</div>
                  <div className="text-base font-black text-blue-700 mt-1">🌽 {stats.totalFed}</div>
                </div>
                <div className="bg-[#fffbeb] p-3 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <div className="text-[10px] text-[#92400e] uppercase font-black leading-none">Itens Coletados</div>
                  <div className="text-base font-black text-purple-700 mt-1">📦 {stats.totalCollected}</div>
                </div>
                <div className="bg-[#fffbeb] p-3 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <div className="text-[10px] text-[#92400e] uppercase font-black leading-none">Gado Comercializado</div>
                  <div className="text-base font-black text-amber-700 mt-1">🐂 {stats.totalSold}</div>
                </div>
              </div>
            </div>

          </div>

          {/* --- RIGHT HAND SIDE: COOPERATIVE WORKSHOP (ATELIÊ) & ACTION LOGS (4/12 Cols) --- */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* --- ATELIÊ & ARMAZÉM DE PROCESSAMENTO --- */}
            <div className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[32px] p-5 shadow-[0_12px_0_#d97706] flex flex-col">
              <div className="flex items-center gap-2 border-b-2 border-[#fbbf24] pb-2 mb-4">
                <ChefHat className="w-5 h-5 text-[#78350f]" />
                <h3 className="text-base sm:text-lg font-display font-black text-[#78350f] uppercase tracking-wider">
                  Ateliê & Armazém
                </h3>
              </div>
              
              {/* Resource grid totals */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#fbbf24] flex items-center justify-between shadow-inner">
                  <span className="text-xs font-bold text-[#78350f] uppercase tracking-tight flex items-center gap-1">🥛 Leite</span>
                  <span className="font-mono font-black text-blue-700 text-sm bg-blue-50/60 px-2 py-0.5 rounded-md border border-blue-100">{inventory.milk}u</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#fbbf24] flex items-center justify-between shadow-inner">
                  <span className="text-xs font-bold text-[#78350f] uppercase tracking-tight flex items-center gap-1">🧶 Lã</span>
                  <span className="font-mono font-black text-purple-700 text-sm bg-purple-50/60 px-2 py-0.5 rounded-md border border-purple-100">{inventory.wool}u</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#fbbf24] flex items-center justify-between shadow-inner">
                  <span className="text-xs font-bold text-[#78350f] uppercase tracking-tight flex items-center gap-1">🥚 Ovo</span>
                  <span className="font-mono font-black text-amber-505 text-sm bg-amber-50/60 px-2 py-0.5 rounded-md border border-amber-100">{inventory.egg ?? 0}u</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#fbbf24] flex items-center justify-between shadow-inner">
                  <span className="text-xs font-bold text-[#78350f] uppercase tracking-tight flex items-center gap-1">🧀 Queijo Simp.</span>
                  <span className="font-mono font-black text-amber-600 text-sm bg-amber-50/60 px-2 py-0.5 rounded-md border border-amber-100">{inventory.cheese}u</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#fbbf24] flex items-center justify-between shadow-inner">
                  <span className="text-xs font-bold text-[#78350f] uppercase tracking-tight flex items-center gap-1">🧣 Cachecol</span>
                  <span className="font-mono font-black text-indigo-700 text-sm bg-indigo-50/60 px-2 py-0.5 rounded-md border border-indigo-100">{inventory.scarf}u</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#fbbf24] flex items-center justify-between shadow-inner">
                  <span className="text-xs font-bold text-[#78350f] uppercase tracking-tight flex items-center gap-1">🥣 Maio</span>
                  <span className="font-mono font-black text-yellow-700 text-sm bg-yellow-50/60 px-2 py-0.5 rounded-md border border-yellow-100">{inventory.mayo ?? 0}u</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#fbbf24] flex items-center justify-between shadow-inner">
                  <span className="text-xs font-bold text-[#78350f] uppercase tracking-tight flex items-center gap-1">🧀 Q. Coalho</span>
                  <span className="font-mono font-black text-amber-700 text-sm bg-amber-50/60 px-2 py-0.5 rounded-md border border-amber-100">{inventory.queijoCoalho ?? 0}u</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#fbbf24] flex items-center justify-between shadow-inner">
                  <span className="text-xs font-bold text-[#78350f] uppercase tracking-tight flex items-center gap-1">🧀 Muçarela</span>
                  <span className="font-mono font-black text-yellow-800 text-sm bg-yellow-50/60 px-2 py-0.5 rounded-md border border-yellow-100">{inventory.queijoMucarela ?? 0}u</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#fbbf24] flex items-center justify-between shadow-inner col-span-2">
                  <span className="text-xs font-bold text-[#78350f] uppercase tracking-tight flex items-center gap-1">🧀 Queijo Brie</span>
                  <span className="font-mono font-black text-orange-850 text-sm bg-orange-50/60 px-2 py-0.5 rounded-md border border-orange-100">{inventory.queijoBrie ?? 0}u</span>
                </div>
              </div>

              {/* Advanced Refining/Manufaturing recipes */}
              <div className="space-y-3 border-t border-dashed border-[#fbbf24]/50 pt-3">
                <h4 className="text-[11px] font-sans font-black uppercase text-[#92400e] tracking-wider mb-2">Refinar Matérias-Primas:</h4>
                
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      craftCheese(e);
                    }}
                    className="bg-[#10b981] hover:bg-[#059669] text-white border-b-2 border-[#065f46] py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all shadow-sm"
                    title="Requer 2 Leites Crus. Fabrica 1 Queijo nobre para ganho superior de ouro. [Atalho rápido: Tecla 1]"
                  >
                    🧀 Fazer Queijo (🥛x2) <span className="text-[9px] text-[#fef3c7] ml-1 opacity-80">[Atalho: 1]</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      craftScarf(e);
                    }}
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-b-2 border-[#5b21b6] py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all shadow-sm"
                    title="Requer 2 Novelos de Lã Crua. Tece 1 Cachecol elegante. [Atalho rápido: Tecla 2]"
                  >
                    🧣 Tecer Cachecol (🧶x2) <span className="text-[9px] text-[#fef3c7] ml-1 opacity-80">[Atalho: 2]</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      craftMayonese(e);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-white border-b-2 border-amber-700 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all shadow-sm"
                    title="Requer 2 Ovos caipiras. Prepara 1 Maionese cremosa. [Atalho rápido: Tecla 3]"
                  >
                    🥣 Maionese Cremosa (🥚x2) <span className="text-[9px] text-[#fef3c7] ml-1 opacity-80">[Atalho: 3]</span>
                  </button>
                </div>

                <h4 className="text-[11px] font-sans font-black uppercase text-[#92400e] tracking-wider pt-2 mb-2 border-t border-[#fbbf24]/30">Vendas Diretas p/ a Feira:</h4>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => sellProduct('milk', 1, e)}
                    disabled={inventory.milk < 1}
                    className="bg-stone-100 hover:bg-stone-250 border border-stone-300 disabled:opacity-40 text-[#78350f] py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vender leite cru. Preço de venda: 5 moedas base."
                  >
                    Vender Leite ({getActualSellPrice('milk')}💰)
                  </button>

                  <button
                    onClick={(e) => sellProduct('wool', 1, e)}
                    disabled={inventory.wool < 1}
                    className="bg-stone-100 hover:bg-stone-250 border border-stone-300 disabled:opacity-40 text-[#78350f] py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vender lã crua. Preço de venda: 12 moedas base."
                  >
                    Vender Lã ({getActualSellPrice('wool')}💰)
                  </button>

                  <button
                    onClick={(e) => sellProduct('egg', 1, e)}
                    disabled={(inventory.egg ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vender Ovo de Quintal. Preço de venda: 4 moedas base."
                  >
                    Vender Ovo ({getActualSellPrice('egg')}💰)
                  </button>

                  <button
                    onClick={(e) => sellProduct('mayo', 1, e)}
                    disabled={(inventory.mayo ?? 0) < 1}
                    className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-350 disabled:opacity-40 text-yellow-950 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vender Maionese Cremosa. Preço de venda: 10 moedas base."
                  >
                    Vender Maio ({getActualSellPrice('mayo')}💰)
                  </button>

                  <button
                    type="button"
                    onClick={(e) => sellProduct('cheese', 1, e)}
                    disabled={inventory.cheese < 1}
                    className="bg-amber-105 hover:bg-amber-150 border border-amber-300 disabled:opacity-40 text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm col-span-2"
                    title="Vende 1 Queijo nobre."
                  >
                    Vender Queijo Simp. ({getActualSellPrice('cheese')}💰)
                  </button>

                  <button
                    type="button"
                    onClick={(e) => sellProduct('queijoCoalho', 1, e)}
                    disabled={(inventory.queijoCoalho ?? 0) < 1}
                    className="bg-amber-100/60 hover:bg-amber-100 border border-amber-350 disabled:opacity-40 text-[#78350f] py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Queijo Coalho."
                  >
                    Vender Q. Coalho ({getActualSellPrice('queijoCoalho')}💰)
                  </button>

                  <button
                    type="button"
                    onClick={(e) => sellProduct('queijoMucarela', 1, e)}
                    disabled={(inventory.queijoMucarela ?? 0) < 1}
                    className="bg-yellow-105 hover:bg-yellow-150 border border-yellow-350 disabled:opacity-40 text-yellow-950 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Queijo Muçarela."
                  >
                    Vender Muçarela ({getActualSellPrice('queijoMucarela')}💰)
                  </button>

                  <button
                    type="button"
                    onClick={(e) => sellProduct('queijoBrie', 1, e)}
                    disabled={(inventory.queijoBrie ?? 0) < 1}
                    className="bg-orange-105 hover:bg-orange-150 border border-orange-300 disabled:opacity-40 text-orange-950 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm col-span-2"
                    title="Vende 1 Queijo Brie."
                  >
                    Vender Q. Brie ({getActualSellPrice('queijoBrie')}💰)
                  </button>

                  <button
                    type="button"
                    onClick={(e) => sellProduct('scarf', 1, e)}
                    disabled={inventory.scarf < 1}
                    className="bg-indigo-100 hover:bg-indigo-150 border border-indigo-300 disabled:opacity-40 text-indigo-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm col-span-2"
                    title="Vende 1 Cachecol elegante."
                  >
                    Vender Cachecol ({getActualSellPrice('scarf')}💰)
                  </button>
                </div>

              </div>

            </div>

            {/* --- SILO DE RAÇÕES SEGMENTADAS --- */}
            <div className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[32px] p-5 shadow-[0_12px_0_#d97706] flex flex-col">
              <div className="flex items-center gap-2 border-b-2 border-[#fbbf24] pb-2 mb-4">
                <span className="text-xl">🌾</span>
                <h3 className="text-base sm:text-lg font-display font-black text-[#78350f] uppercase tracking-wider">
                  Silo de Rações
                </h3>
              </div>
              
              <p className="text-[10px] text-[#92400e] font-sans font-extrabold uppercase tracking-wide mb-3 leading-tight">
                Adquira pacotes com descontos progressivos (10% no Nível 4+). {getEstacaoKey(currentDay) === 'inverno' ? '❄️ PREÇOS DO INVERNO: +50% ENCARECIDOS!' : '☀️ Preços normais de entressafra.'}
              </p>

              <div className="space-y-4">
                {([
                  { key: 'racaoLeite', label: '🥦 Ração de Vaca', desc: 'Para vacas leiteiras.' },
                  { key: 'racaoOvelha', label: '🍀 Ração de Ovelha', desc: 'Nutre ovelhas de pelo denso.' },
                  { key: 'racaoBoi', label: '🌾 Ração de Boi', desc: 'Ração rica de engorda.' },
                  { key: 'racaoGalinha', label: '🌽 Ração de Galinha', desc: 'Alimento de gramíneas fino.' }
                ] as const).map((feed) => {
                  const currentStock = inventory[feed.key] ?? 0;
                  const unitPrice = getFeedPriceWithModifiers(feed.key);
                  return (
                    <div key={feed.key} className="bg-white/80 p-3 rounded-2xl border-2 border-[#fbbf24]/50 hover:border-[#fbbf24] transition-all flex flex-col gap-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-sans font-black text-[#78350f] text-xs uppercase leading-tight">{feed.label}</h4>
                          <p className="text-[9px] text-[#92400e]/70 font-mono mt-0.5">{feed.desc}</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] text-[#92400e] font-mono uppercase font-black tracking-wider leading-none">Estoque</span>
                          <span className="font-mono text-sm font-black text-rose-800">{currentStock}u</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-[#fbbf25]/25">
                        <button
                          type="button"
                          onClick={(e) => buyFeed(feed.key, 1, e)}
                          disabled={gold < unitPrice}
                          className="bg-stone-100 hover:bg-stone-200 text-[#78350f] text-[9px] font-mono font-bold py-1 px-0.5 rounded-lg border border-stone-300 disabled:opacity-40 transition-all cursor-pointer text-center leading-none"
                        >
                          +1u ({unitPrice}💰)
                        </button>
                        <button
                          type="button"
                          onClick={(e) => buyFeed(feed.key, 10, e)}
                          disabled={gold < Math.floor(unitPrice * 10 * 0.95)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[9px] font-mono font-bold py-1 px-0.5 rounded-lg border border-indigo-200 disabled:opacity-40 transition-all cursor-pointer text-center leading-none"
                          title="Desconto de 5% em pacotes de 10 unidades!"
                        >
                          +10u ({Math.floor(unitPrice * 10 * 0.95)}💰)
                        </button>
                        <button
                          type="button"
                          onClick={(e) => buyFeed(feed.key, 50, e)}
                          disabled={gold < Math.floor(unitPrice * 50 * 0.88)}
                          className="bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981] text-[9px] font-mono font-bold py-1 px-0.5 rounded-lg border border-[#10b981]/30 disabled:opacity-40 transition-all cursor-pointer text-center leading-none"
                          title="Desconto de 12% em pacotes de 50 unidades!"
                        >
                          +50u ({Math.floor(unitPrice * 50 * 0.88)}💰)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --- DIÁRIO DA FAZENDA (ACTION LOGS) --- */}
            <div className="bg-[#fffbeb] border-4 border-[#fbbf24] rounded-[32px] p-5 shadow-[0_12px_0_#d97706] flex flex-col flex-1 h-[280px] lg:h-[350px]">
              
              <div className="flex items-center justify-between border-b-2 border-[#fbbf24] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#78350f]" />
                  <h3 className="text-lg font-display font-black text-[#78350f] uppercase tracking-wider">
                    Diário da Fazenda
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setLogs([]);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="text-[10px] font-mono font-black hover:text-red-600 text-[#92400e] cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-[#fef3c7] rounded-lg border-2 border-[#fbbf24] transition-all hover:scale-105 active:translate-y-0.5 shadow-sm uppercase"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" /> Limpar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-2 font-mono divide-y divide-[#fbbf24]/30" style={{ scrollbarWidth: 'thin' }}>
                {logs.length === 0 ? (
                  <div className="text-center text-[#92400e]/50 italic pt-16 font-bold uppercase tracking-wider">
                    Nenhum registro ainda hoje.
                  </div>
                ) : (
                  logs.map((log) => {
                    let textClass = 'text-[#78350f] font-bold';
                    let bgClass = '';
                    if (log.type === 'error') {
                      textClass = 'text-[#991b1b] font-black uppercase';
                      bgClass = 'bg-[#fee2e2] p-2 rounded-xl border-2 border-[#fecaca]';
                    } else if (log.type === 'success') {
                      textClass = 'text-[#166534] font-black uppercase';
                      bgClass = 'bg-[#dcfce7] p-2 rounded-xl border-2 border-[#bbf7d0]';
                    } else if (log.type === 'system') {
                      textClass = 'text-[#1e3a8a] font-black italic uppercase';
                      bgClass = 'bg-[#dbeafe] p-2 rounded-xl border-2 border-[#bfdbfe]';
                    } else if (log.type === 'event') {
                      textClass = 'text-[#854d0e] font-black uppercase';
                      bgClass = 'bg-[#fef9c3] p-2 rounded-xl border-2 border-[#fef08a]';
                    }

                    return (
                      <div 
                        key={log.id} 
                        className={`pt-2 first:pt-0 ${bgClass} transition-all flex items-start gap-1 pb-1.5`}
                      >
                        <span className="text-[9px] bg-[#fde68a] border border-[#fbbf24] text-[#78350f] px-1.5 py-0.5 rounded-md font-black mr-1 inline-block uppercase shrink-0 leading-none">
                          Dia {log.day}
                        </span>
                        <span className={`${textClass} leading-tight`}>{log.message}</span>
                      </div>
                    );
                  })
                )}
                <div ref={logsEndRef} />
              </div>

            </div>

          </div>

        </div>

        {/* --- FARM REGULATORY FOOTER --- */}
        <footer className="bg-[#78350f] border-t-8 border-[#451a03] text-center p-4 text-[10px] sm:text-xs font-mono text-[#fcd57e] select-none flex flex-col sm:flex-row items-center justify-between px-6 gap-3 uppercase font-black">
          <span>🐮 Leite (🥛 Queijo) • 🐑 Tosquia (🧣 Cachecol) • 🐂 Peso (+5 moedas bônus no nível 5)</span>
          <span className="text-[#fef3c7]/60 text-[9px]">Fazenda Aurora © 2026 - Cuide com carinho!</span>
        </footer>

      </div>

      {/* --- TUTORIAL / HELP MODAL --- */}
      <AnimatePresence>
        {showTutorialModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTutorialModal(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-[#78350f] rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              {/* Header */}
              <div className="bg-[#78350f] p-5 border-b-4 border-[#92400e] text-center shrink-0">
                <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2 animate-pulse" style={{ textShadow: '1.5px 1.5px 0px #451a03', animationDuration: '4s' }}>
                  📖 Manual da Fazenda Aurora
                </h3>
                <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
                  Tudo sobre a criação de animais, fabricação e vendas!
                </p>
                <button
                  onClick={() => {
                    setShowTutorialModal(false);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-[#92400e] hover:bg-[#b45309] border-2 border-[#78350f] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold"
                  title="Fechar"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm font-sans" style={{ scrollbarWidth: 'thin' }}>
                
                {/* 1. Cuidados Básicos */}
                <div className="bg-white/75 p-4 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <h4 className="font-display font-black text-xs sm:text-sm text-[#78350f] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    🌽 Cuidados & Alimentação
                  </h4>
                  <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">
                    Alimentar os animais consome <strong className="text-[#b45309]">🌽 4 moedas de ouro</strong>. Isso restaura <strong className="text-green-700">+35% de Fome</strong> e <strong className="text-green-700">+12% de Felicidade</strong>. Se os animais ficarem com fome extrema abaixo de 30% ou felicidade muito baixa, eles começam a perder felicidade até definharem. Mantenha-os alimentados!
                  </p>
                </div>

                {/* 2. Produção de Matérias-Primas */}
                <div className="bg-white/75 p-4 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <h4 className="font-display font-black text-xs sm:text-sm text-[#78350f] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    🥛 Produção dos Animais
                  </h4>
                  <ul className="text-stone-700 space-y-2 text-xs sm:text-sm list-disc pl-4">
                    <li>
                      <strong className="text-[#b45309]">🐄 Vacas Leiteiras:</strong> Produzem <strong className="text-[#1d4ed8]">Leite Cru</strong> diariamente no Armazém desde que estejam felizes e alimentadas.
                    </li>
                    <li>
                      <strong className="text-[#b45309]">🐑 Ovelhas de Lã:</strong> Produzem <strong className="text-purple-700">Novelo de Lã</strong> após 3 dias de crescimento (ou a cada 2 dias se for Melhor Amigo). Estão sujeitas a falhas se tosquiadas em clima inadequado.
                    </li>
                    <li>
                      <strong className="text-[#b45309]">🐂 Bois de Corte:</strong> Não geram recursos diários, mas ganham peso físico todos os dias. Quando estiverem pesados, podem ser vendidos na feira por um retorno altíssimo!
                    </li>
                  </ul>
                </div>

                {/* 3. Nível da Fazenda */}
                <div className="bg-white/75 p-4 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <h4 className="font-display font-black text-xs sm:text-sm text-[#78350f] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    🏆 Progressão & Nível da Fazenda
                  </h4>
                  <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">
                    Sua fazenda evolui automaticamente a cada <strong className="text-[#b45309]">10 dias acumulados</strong>. Cada novo nível traz benefícios fixos permanentes de mercado:
                  </p>
                  <ul className="text-stone-700 space-y-1 mt-2 text-xs list-none pl-1">
                    <li>⭐ <strong>Nível 2:</strong> Preço base do Leite Cru sobe de 5 para <strong>6 moedas</strong>.</li>
                    <li>⭐ <strong>Nível 3:</strong> Preço base da Lã Crua sobe de 12 para <strong>15 moedas</strong>.</li>
                    <li>⭐ <strong>Nível 4:</strong> Desconto de <strong>10%</strong> na compra de qualquer novo animal.</li>
                    <li>⭐ <strong>Nível 5:</strong> Bônus extra de de mais <strong>+5 moedas</strong> na venda de qualquer Boi.</li>
                  </ul>
                </div>

                {/* 4. Clima Estações & Mercador */}
                <div className="bg-white/75 p-4 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <h4 className="font-display font-black text-xs sm:text-sm text-[#78350f] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    🌧️ Eventos, Clima & Mercador Viajante
                  </h4>
                  <ul className="text-stone-700 space-y-2 text-xs sm:text-sm list-disc pl-4">
                    <li>
                      <strong>🌧️ Clima Chuvoso:</strong> Reduz a produção de leite das vacas em 20% e traz 30% de chance das ovelhas molharem a lã, atrasando a tosquia do dia.
                    </li>
                    <li>
                      <strong>☀️ Clima Ensolarado:</strong> Anima as vacas e faz com que produzam +1 balde extra de leite cru!
                    </li>
                    <li>
                      <strong>🧙‍♂️ Mercador Viajante:</strong> Aparece na fazenda de forma aleatória (a cada 3-7 dias). O mercador paga generosos <strong>1.5x moedas adicionais</strong> por qualquer produto ou animal vendido naquele dia!
                    </li>
                  </ul>
                </div>

                {/* 5. Melhor Amigo e Crafting */}
                <div className="bg-white/75 p-4 rounded-2xl border-2 border-[#fbbf24] shadow-sm">
                  <h4 className="font-display font-black text-xs sm:text-sm text-[#78350f] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    💖 Melhor Amigo & Fabricação (Ateliê)
                  </h4>
                  <ul className="text-stone-700 space-y-2 text-xs sm:text-sm list-disc pl-4">
                    <li>
                      <strong>💖 Status Melhor Amigo:</strong> Se mantiver a felicidade do animal em <strong className="text-rose-600">100% por 3 dias consecutivos</strong>, ele se torna seu melhor amigo de forma permanente (dando bônus: +1 leite para vaca, lã a cada 2 dias para ovelha, e ganho acelerado de peso para o boi). Cuidado! Se a felicidade cair abaixo de 80% por 2 dias, o status de melhor amigo será perdido.
                    </li>
                    <li>
                      <strong>🧀 Ateliê de Queijo:</strong> Combine <strong>2 Leites Crus</strong> no Ateliê para fabricar 1 <strong>Queijo Nobre</strong> (vende por 15 moedas base, aumentando ainda mais o lucro!).
                    </li>
                    <li>
                      <strong>🧣 Ateliê de Costura:</strong> Combine <strong>2 Lãs Cruas</strong> no Ateliê para costurar 1 elegante <strong>Cachecol</strong> (vende por 30 moedas base!).
                    </li>
                  </ul>
                </div>

              </div>

              {/* Footer */}
              <div className="bg-[#78350f]/10 p-4 border-t-2 border-[#78350f]/20 flex justify-end shrink-0">
                <button
                  onClick={() => {
                    setShowTutorialModal(false);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="bg-[#10b981] hover:bg-[#059669] text-white border-b-4 border-[#065f46] shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer"
                >
                  Entendi, Voltar ao Jogo!
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 😴 SLEEP OVERLAY */}
      <AnimatePresence>
        {isSleeping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center text-center select-none"
          >
            <div className="flex flex-col items-center gap-4">
              <span className="text-6xl sm:text-8xl animate-bounce" style={{ animationDuration: '2.5s' }}>😴</span>
              <div className="relative">
                <span className="text-white text-3xl font-display font-black uppercase tracking-widest block">Dormindo...</span>
                <div className="flex justify-center gap-1.5 mt-2">
                  <span className="text-amber-300 text-xl font-black font-mono animate-pulse delay-[200ms]">Z</span>
                  <span className="text-amber-300 text-2xl font-black font-mono animate-pulse delay-[400ms]">z</span>
                  <span className="text-amber-300 text-3xl font-black font-mono animate-pulse delay-[600ms]">z</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏆 ACHIEVEMENT NOTIFICATION POPUP */}
      <AnimatePresence>
        {achievementNotification && (
          <motion.div
            initial={{ opacity: 0, x: 200, y: 15 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 200, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="fixed bottom-6 right-6 z-[95] max-w-sm w-80 sm:w-96 bg-[#78350f] border-4 border-[#fbbf24] text-[#fef3c7] rounded-3xl p-4.5 shadow-2xl flex items-start gap-3.5"
          >
            <div className="bg-[#fbbf24] rounded-2xl w-12 h-12 flex items-center justify-center text-3xl shadow-[inset_0_-3px_0_#d97706] shrink-0 border border-amber-300">
              {achievementNotification.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[#fcd57e] text-[9px] uppercase font-mono tracking-widest font-black block">🎉 Conquista Desbloqueada!</span>
              <h4 className="font-display font-black text-sm uppercase tracking-wide text-white mt-0.5 truncate">{achievementNotification.title}</h4>
              <p className="text-xs text-stone-200 mt-1 line-clamp-2 leading-normal">{achievementNotification.description}</p>
            </div>
            <button 
              onClick={() => setAchievementNotification(null)}
              className="text-stone-300 hover:text-white shrink-0 text-sm font-bold bg-black/20 hover:bg-black/40 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer transition-all active:scale-90"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏆 ACHIEVEMENTS GALLERY MODAL */}
      <AnimatePresence>
        {showAchievementsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAchievementsModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[90] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-[#78350f] rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative animate-fade-in"
            >
              {/* Header */}
              <div className="bg-[#78350f] p-5 border-b-4 border-[#92400e] text-center shrink-0">
                <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2 animate-pulse" style={{ textShadow: '1.5px 1.5px 0px #451a03', animationDuration: '4s' }}>
                  🏆 Galeria de Medalhas & Conquistas
                </h3>
                <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
                  Seus marcos heroicos na Fazenda Aurora
                </p>
                <button
                  onClick={() => {
                    setShowAchievementsModal(false);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-[#92400e] hover:bg-[#b45309] border-2 border-[#78350f] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold"
                  title="Fechar"
                >
                  ✕
                </button>
              </div>

              {/* Progress indicator */}
              <div className="bg-[#fef3c7] px-6 py-4 border-b-2 border-[#fbbf24] flex items-center justify-between gap-4 shrink-0">
                <div className="flex-1">
                  <div className="flex justify-between items-center text-xs font-mono font-bold uppercase text-[#78350f] mb-1">
                    <span>Progresso de Desbloqueio:</span>
                    <span>{unlockedAchievements.length} de {ACHIEVEMENTS_LIST.length} ({Math.round((unlockedAchievements.length / ACHIEVEMENTS_LIST.length) * 100)}%)</span>
                  </div>
                  <div className="bg-stone-200 h-3 rounded-full overflow-hidden border border-[#d1d5db] shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-500"
                      style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS_LIST.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Scrollable grid of achievements */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ scrollbarWidth: 'thin' }}>
                {ACHIEVEMENTS_LIST.map((ach) => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);
                  return (
                    <div 
                      key={ach.id}
                      className={`border-4 rounded-3xl p-4 flex items-start gap-3 transition-all ${
                        isUnlocked 
                          ? 'bg-amber-50/70 border-amber-400 shadow-md translate-y-[-1px]' 
                          : 'bg-stone-100/50 border-stone-200/80 grayscale opacity-60'
                      }`}
                    >
                      <div className={`rounded-xl w-11 h-11 flex items-center justify-center text-2xl shrink-0 ${
                        isUnlocked ? 'bg-[#fbbf24] text-white shadow-md' : 'bg-stone-300 text-stone-500'
                      }`}>
                        {isUnlocked ? ach.emoji : '🔒'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className={`font-display font-black text-xs sm:text-sm uppercase tracking-wider ${
                            isUnlocked ? 'text-[#78350f]' : 'text-stone-500'
                          }`}>
                            {ach.title}
                          </h4>
                          {isUnlocked && <span className="text-[10px] text-amber-600">🏆</span>}
                        </div>
                        <p className={`text-xs mt-1 leading-normal ${
                          isUnlocked ? 'text-stone-600' : 'text-stone-400'
                        }`}>
                          {ach.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Close footer button */}
              <div className="bg-[#78350f]/10 p-4 border-t-2 border-[#78350f]/20 flex justify-end shrink-0">
                <button
                  onClick={() => {
                    setShowAchievementsModal(false);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="bg-[#10b981] hover:bg-[#059669] text-white border-b-4 border-[#065f46] shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer"
                >
                  Voltar à Fazenda
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏆 SPECTACULAR LEVEL UP MODAL */}
      <AnimatePresence>
        {showLevelUpModal !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              // BUG 7 FIX: fechar pelo backdrop também concede +100 moedas
              setShowLevelUpModal(null);
              setGold(prev => prev + 100);
            }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, rotate: -2 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.9, y: 30, rotate: 2 }}
              transition={{ type: 'spring', damping: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-amber-50 to-amber-100 border-8 border-yellow-500 rounded-[40px] max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl relative flex flex-col p-6 sm:p-8 text-center"
            >
              {/* Top Banner Accent */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-amber-400 rounded-full blur-xl opacity-50 animate-pulse" />

              {/* Header Visual Badge */}
              <div className="relative mx-auto -mt-12 sm:-mt-16 bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-600 border-4 border-white w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <span className="text-4xl sm:text-5xl">🏆</span>
                <span className="absolute -top-1 -right-1 text-base">✨</span>
                <span className="absolute -bottom-1 -left-1 text-base">✨</span>
              </div>

              {/* Title Header */}
              <h3 className="text-yellow-600 text-sm font-mono tracking-widest font-black uppercase mt-4">
                LEVEL UP COMPLETED!
              </h3>
              
              <h2 className="text-[#78350f] text-2xl sm:text-3xl font-display font-black leading-tight uppercase mt-1">
                Fazenda Subiu de Nível!
              </h2>

              {/* Tier / Title display */}
              <div className="bg-[#78350f]/15 border-2 border-[#78350f]/20 rounded-2xl px-4 py-2 mt-3 select-none flex items-center justify-center gap-2">
                <span className="text-xl">⭐</span>
                <span className="text-[#78350f] font-mono font-black text-xs sm:text-sm uppercase tracking-wide">
                  Nível {showLevelUpModal} · {getFarmTitle(showLevelUpModal)}
                </span>
                <span className="text-xl">⭐</span>
              </div>

              {/* Perks details lists of the unlocked level */}
              <div className="mt-5 text-left border-t border-[#78350f]/10 pt-4 flex-1">
                <p className="text-stone-700 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 justify-center">
                  ✨ Benefícios & Desbloqueios ✨
                </p>

                <div className="space-y-2.5">
                  {getLevelUpDetails(showLevelUpModal).perks.map((perk, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-start gap-2 bg-white/70 border border-yellow-300 rounded-xl p-3 shadow-xs"
                    >
                      <span className="text-emerald-500 text-base shrink-0">✅</span>
                      <p className="text-xs sm:text-sm font-bold text-stone-700 font-sans leading-snug">
                        {perk}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Awesome Level Reward Extra Gold Gift */}
              <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-emerald-500/15 border-2 border-emerald-400 rounded-2xl px-4 py-3 mt-4 text-center">
                <span className="text-xs uppercase font-mono tracking-widest font-extrabold text-emerald-700 block leading-none">
                  🎁 Bônus de Celebração Real 🎁
                </span>
                <span className="text-[#78350f] font-mono font-black text-sm block mt-1">
                  +100 moedas de ouro creditadas!
                </span>
              </div>

              {/* Button footer */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={(e) => {
                    // BUG 7 FIX: stopPropagation evita duplo disparo com o backdrop (que já chama setGold)
                    e.stopPropagation();
                    setShowLevelUpModal(null);
                    setGold(prev => prev + 100);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="bg-[#10b981] hover:bg-[#059669] text-white border-b-6 border-[#065f46] shadow-lg hover:shadow-xl px-10 py-3 rounded-2xl font-display font-black uppercase text-sm tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer max-w-xs w-full text-center"
                >
                  Continuar Fazenda!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📅 WEEKLY BALANCE SHEET REPORT BOARD */}
      <AnimatePresence>
        {showWeeklyReport && weeklyReportData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWeeklyReport(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-indigo-900 rounded-[36px] max-w-xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              {/* Plaque Header */}
              <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-5 border-b-4 border-indigo-950 text-center shrink-0">
                <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2" style={{ textShadow: '1.5px 1.5px 0px #1e1b4b' }}>
                  📅 Plano de Balanço Semanal
                </h3>
                <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
                  Relatório do Dia {currentDay - 7} ao Dia {currentDay - 1} de atividade
                </p>
                <button
                  onClick={() => {
                    setShowWeeklyReport(false);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-indigo-950 hover:bg-indigo-800 border-2 border-indigo-900 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold"
                  title="Fechar"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable report body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm font-sans" style={{ scrollbarWidth: 'thin' }}>
                <div className="text-center font-bold text-[#78350f] uppercase tracking-wide text-xs mb-1">
                  📊 Resumo Estatístico dos Últimos 7 Dias
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
                    <span className="text-2xl">💰</span>
                    <div>
                      <div className="text-[10px] font-mono tracking-wider font-black text-emerald-700 uppercase leading-none">Lucro Bruto</div>
                      <div className="text-base font-black font-mono text-[#78350f] mt-1">+{weeklyReportData.earnings} moedas</div>
                    </div>
                  </div>

                  <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
                    <span className="text-2xl">🌽</span>
                    <div>
                      <div className="text-[10px] font-mono tracking-wider font-black text-red-700 uppercase leading-none">Despesas</div>
                      <div className="text-base font-black font-mono text-[#78350f] mt-1">-{weeklyReportData.spending} moedas</div>
                    </div>
                  </div>

                  <div className="bg-[#fef3c7] border-2 border-[#fbbf24] rounded-2xl p-3 flex items-center gap-3 col-span-2 shadow-xs">
                    <span className="text-2xl">⚖️</span>
                    <div>
                      <div className="text-[10px] font-mono tracking-wider font-black text-stone-700 uppercase leading-none">Balanço Líquido</div>
                      <div className={`text-base font-black font-mono mt-1 ${
                        (weeklyReportData.earnings - weeklyReportData.spending) >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {(weeklyReportData.earnings - weeklyReportData.spending) >= 0 ? '+' : ''}
                        {weeklyReportData.earnings - weeklyReportData.spending} moedas de ouro
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processed/Harvested Items list */}
                <div className="bg-white/75 border-2 border-[#fbbf24] rounded-2xl p-4 shadow-sm">
                  <h4 className="font-display font-black text-xs text-[#78350f] uppercase tracking-wider mb-2 border-b border-stone-200 pb-1">
                    📦 Itens Obtidos & Produzidos
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-stone-700">
                    <div className="flex items-center gap-1.5">
                      <span>🥛 Leite Ordenhado:</span>
                      <span className="font-bold text-[#78350f]">{weeklyReportData.milk} baldes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>🧶 Novelo de Lã:</span>
                      <span className="font-bold text-[#78350f]">{weeklyReportData.wool} fardos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>🧀 Queijo Nobre:</span>
                      <span className="font-bold text-yellow-600 font-extrabold">{weeklyReportData.cheese} un</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>🧣 Cachecóis Tecidos:</span>
                      <span className="font-bold text-indigo-600 font-extrabold">{weeklyReportData.scarf} un</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>🥚 Ovos Coletados:</span>
                      <span className="font-bold text-orange-600">{weeklyReportData.egg || 0} un</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>🥣 Maionese Pronta:</span>
                      <span className="font-bold text-[#78350f]">{weeklyReportData.mayo || 0} un</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 border-t border-dashed border-stone-200 pt-1.5 mt-1.5">
                      <span>🐂 Bois Vendidos na Feira:</span>
                      <span className="font-bold text-[#78350f]">{weeklyReportData.oxSold} animais</span>
                    </div>
                  </div>
                </div>

                {/* Agricultural expert recommendation tip bubble */}
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-4 text-xs leading-relaxed text-indigo-950 flex gap-2.5 items-start">
                  <span className="text-xl shrink-0 selection-none">🧙‍♂️</span>
                  <div>
                    <div className="font-bold text-indigo-900 uppercase tracking-widest text-[9px] mb-0.5">Dica de Gestão do Consultor:</div>
                    {(() => {
                      if (weeklyReportData.cheese === 0 && weeklyReportData.scarf === 0) {
                        return "Seu Ateliê está ocioso! Transforme seu Leite Cru e Lã Crua em Queijo Nobre e Cachecol. Itens manufaturados dobram seu retorno de moedas!";
                      }
                      if (weeklyReportData.earnings < 120) {
                        return "Faturamento baixo! Compre mais Vacas Leiteiras ou tosquie Ovelhas. Climas de Sol Forte dão leite extra diariamente!";
                      }
                      if (weeklyReportData.spending > weeklyReportData.earnings) {
                        return "Cuidado! Suas despesas excederam o lucro semanal. Certifique-se de vender os Bois Gordos quando atingirem o status Premium na feira!";
                      }
                      return "Sua gestão está excelente! Aproveite as visitas periódicas do Mercador Viajante para escoar sua produção manufaturada com bônus de 1.5x moedas!";
                    })()}
                  </div>
                </div>
              </div>

              {/* Confirm button */}
              <div className="bg-indigo-900/10 p-4 border-t-2 border-indigo-900/20 flex justify-end shrink-0">
                <button
                  onClick={() => {
                    setShowWeeklyReport(false);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="bg-indigo-600 hover:bg-indigo-750 text-white border-b-4 border-indigo-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer"
                >
                  Confirmar Balanço
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏭 AUTOMATION / MACHINES MODAL */}
      <AnimatePresence>
        {showAutomationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAutomationModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-[#1e3a8a] rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              {/* Wooden Accent Header */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-5 border-b-4 border-indigo-950 text-center shrink-0">
                <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2" style={{ textShadow: '1.5px 1.5px 0px #1e1b4b' }}>
                  🏭 Oficina de Automação Tecnológica
                </h3>
                <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
                  Melhore as instalações da Fazenda Aurora com maquinários permanentes
                </p>
                <button
                  onClick={() => {
                    setShowAutomationModal(false);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-[#1e3a8a] hover:bg-[#1e40af] border-2 border-[#1e1b4b] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold"
                  title="Fechar"
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <div className="bg-[#fef3c7] px-6 py-4 border-b-2 border-yellow-250 shrink-0">
                <p className="text-xs text-[#78350f] font-mono leading-relaxed">
                  💡 <strong>Como funcionam:</strong> Após compradas, as máquinas passam a operar de forma permanente no final de cada dia de trabalho (ao avançar o dia ou dormir), desde que o interruptor esteja <strong>LIGADO</strong>.
                </p>
              </div>

              {/* Scrollable list of machines */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: 'thin' }}>
                
                {/* 1. Ordenhadeira Automática */}
                <div className={`border-4 rounded-3xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all ${
                  machines.milkerPurchased ? 'bg-emerald-50/50 border-emerald-400 shadow-xs' : 'bg-white border-stone-200'
                }`}>
                  <div className="rounded-2xl w-14 h-14 bg-blue-150 flex items-center justify-center text-3xl shrink-0 border-2 border-blue-250 select-none">
                    🥛
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h4 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-[#78350f]">
                        🥛 Ordenhadeira Automática
                      </h4>
                      {machines.milkerPurchased ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">Adquirido</span>
                      ) : (
                        <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border border-[#fbbf24]">Nível 3+</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Coleta automaticamente o leite cru de <strong>TODAS</strong> as vacas produtoras ao final de cada dia. A produção é enviada diretamente para o Armazém.
                    </p>
                    <div className="text-[10px] text-stone-400 font-mono mt-1.5 uppercase tracking-wide">
                      ⚡ Custo: 500 moedas • Nível mín: 3
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="shrink-0 flex items-center justify-center w-full sm:w-auto">
                    {!machines.milkerPurchased ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          buyMachine('milker');
                        }}
                        disabled={gold < 500 || farmLevel < 3}
                        className={`font-mono font-black text-xs uppercase px-5 py-2.5 rounded-2xl cursor-pointer border-b-4 transition-all shadow-sm ${
                          gold >= 500 && farmLevel >= 3
                            ? 'bg-amber-500 hover:bg-amber-400 text-[#451a03] border-amber-700 hover:scale-105 active:translate-y-0.5'
                            : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Comprar (500💰)
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 bg-emerald-100/60 p-2.5 rounded-2xl border border-emerald-200">
                        <span className="text-[9px] uppercase font-mono font-black text-emerald-800">Estado</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleMachine('milker');
                          }}
                          className={`font-mono font-black text-xs px-4 py-1.5 rounded-xl cursor-pointer transition-all uppercase ${
                            machines.milkerActive
                              ? 'bg-emerald-600 hover:bg-emerald-550 text-white shadow-inner'
                              : 'bg-stone-400 hover:bg-stone-300 text-white'
                          }`}
                        >
                          {machines.milkerActive ? '🟢 LIGADO' : '🔴 DESLIGADO'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Tosquiadeira Elétrica */}
                <div className={`border-4 rounded-3xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all ${
                  machines.shearerPurchased ? 'bg-emerald-50/50 border-emerald-400 shadow-xs' : 'bg-white border-stone-200'
                }`}>
                  <div className="rounded-2xl w-14 h-14 bg-yellow-100 flex items-center justify-center text-3xl shrink-0 border-2 border-yellow-255 select-none">
                    ✂️
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h4 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-[#78350f]">
                        ✂️ Tosquiadeira Elétrica
                      </h4>
                      {machines.shearerPurchased ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">Adquirido</span>
                      ) : (
                        <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border border-[#fbbf24]">Nível 3+</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Coleta automaticamente a lã de <strong>TODAS</strong> as ovelha com lã madura no fim do dia. Envia fardos ao Armazém sem perda de bônus por qualidade.
                    </p>
                    <div className="text-[10px] text-stone-400 font-mono mt-1.5 uppercase tracking-wide">
                      ⚡ Custo: 450 moedas • Nível mín: 3
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="shrink-0 flex items-center justify-center w-full sm:w-auto">
                    {!machines.shearerPurchased ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          buyMachine('shearer');
                        }}
                        disabled={gold < 450 || farmLevel < 3}
                        className={`font-mono font-black text-xs uppercase px-5 py-2.5 rounded-2xl cursor-pointer border-b-4 transition-all shadow-sm ${
                          gold >= 450 && farmLevel >= 3
                            ? 'bg-amber-500 hover:bg-amber-400 text-[#451a03] border-amber-700 hover:scale-105 active:translate-y-0.5'
                            : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Comprar (450💰)
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 bg-emerald-100/60 p-2.5 rounded-2xl border border-emerald-200">
                        <span className="text-[9px] uppercase font-mono font-black text-emerald-800">Estado</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleMachine('shearer');
                          }}
                          className={`font-mono font-black text-xs px-4 py-1.5 rounded-xl cursor-pointer transition-all uppercase ${
                            machines.shearerActive
                              ? 'bg-emerald-600 hover:bg-emerald-550 text-white shadow-inner'
                              : 'bg-stone-400 hover:bg-stone-300 text-white'
                          }`}
                        >
                          {machines.shearerActive ? '🟢 LIGADO' : '🔴 DESLIGADO'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Alimentador Automático */}
                <div className={`border-4 rounded-3xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all ${
                  machines.feederPurchased ? 'bg-emerald-50/50 border-emerald-400 shadow-xs' : 'bg-white border-stone-200'
                }`}>
                  <div className="rounded-2xl w-14 h-14 bg-lime-100 flex items-center justify-center text-3xl shrink-0 border-2 border-lime-250 select-none">
                    🌾
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <h4 className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-[#78350f]">
                        🌾 Alimentador Automático
                      </h4>
                      {machines.feederPurchased ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">Adquirido</span>
                      ) : (
                        <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border border-[#fbbf24]">Nível 2+</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Alimenta <strong>TODOS</strong> os animais do seu rebanho no final do dia. Cada refeição custa uma taxa reduzida de apenas 3 moedas de ouro por animal.
                    </p>
                    <p className="text-[10px] text-stone-400 font-mono mt-1.5 uppercase tracking-wide">
                      {/* BUG 12 FIX: exibe custo real de manutenção por máquina ativa conforme getCustoManutencaoMaquinas */}
                      ⚡ Custo: 300 moedas • Nível mín: 2 • Operacional: {getCustoManutencaoMaquinas(farmLevel)} moedas/dia por máquina ativa
                    </p>
                  </div>

                  {/* Actions column */}
                  <div className="shrink-0 flex items-center justify-center w-full sm:w-auto">
                    {!machines.feederPurchased ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          buyMachine('feeder');
                        }}
                        disabled={gold < 300 || farmLevel < 2}
                        className={`font-mono font-black text-xs uppercase px-5 py-2.5 rounded-2xl cursor-pointer border-b-4 transition-all shadow-sm ${
                          gold >= 300 && farmLevel >= 2
                            ? 'bg-amber-500 hover:bg-amber-400 text-[#451a03] border-amber-700 hover:scale-105 active:translate-y-0.5'
                            : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Comprar (300💰)
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 bg-emerald-100/60 p-2.5 rounded-2xl border border-emerald-200">
                        <span className="text-[9px] uppercase font-mono font-black text-emerald-800">Estado</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleMachine('feeder');
                          }}
                          className={`font-mono font-black text-xs px-4 py-1.5 rounded-xl cursor-pointer transition-all uppercase ${
                            machines.feederActive
                              ? 'bg-emerald-600 hover:bg-emerald-555 text-white shadow-inner'
                              : 'bg-stone-400 hover:bg-stone-300 text-white'
                          }`}
                        >
                          {machines.feederActive ? '🟢 LIGADO' : '🔴 DESLIGADO'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Close footer button */}
              <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowAutomationModal(false);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="bg-[#10b981] hover:bg-[#059669] text-white border-b-4 border-[#065f46] shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer"
                >
                  Fechar Oficina
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧀 QUEIJARIA ARTESANAL MODAL */}
      <AnimatePresence>
        {showQueijariaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQueijariaModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-amber-950 rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              {/* Wooden Accent Header */}
              <div className="bg-gradient-to-r from-amber-700 to-yellow-800 p-5 border-b-4 border-amber-950 text-center shrink-0">
                <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2" style={{ textShadow: '1.5px 1.5px 0px #451a03' }}>
                  🧀 Queijaria Artesanal Aurora
                </h3>
                <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
                  Inicie a maturação de queijos finos e amplie sua produção artesanal
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowQueijariaModal(false);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-amber-950 hover:bg-amber-900 border-2 border-amber-950 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold"
                  title="Fechar"
                >
                  ✕
                </button>
              </div>

              {/* Prateleira HUD Bar */}
              <div className="bg-[#fef3c7] px-6 py-4 border-b-2 border-yellow-250 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
                <div className="text-xs text-[#78350f] leading-relaxed">
                  📦 <strong>Status das Prateleiras:</strong> <span className="bg-[#f59e0b]/20 px-2 py-0.5 rounded-md font-bold text-amber-955">{queijosEmMaturacao.length} / {maxPrateleiras} ocupadas</span>
                </div>
                {maxPrateleiras === 2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (gold >= 500) {
                        setGold(prev => prev - 500);
                        setMaxPrateleiras(5);
                        addLog(`🔧 Queijaria ampliada! Agora você possui 5 prateleiras para maturação de queijos.`, 'success');
                        triggerAudioResult(() => sfx.playSound('levelup'));
                        spawnFeedback('🔧', '-500 💰', e);
                      }
                    }}
                    disabled={gold < 500}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-mono font-black text-xs px-3.5 py-2 rounded-xl active:translate-y-0.5 shadow-[0_3px_0_#581c87] cursor-pointer transition-all hover:scale-102 flex items-center gap-1.5 focus:outline-none"
                  >
                    <span>🔧 Ampliar Queijaria (+3 vagas por 500 💰)</span>
                  </button>
                )}
              </div>

              {/* Core Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'thin' }}>
                
                {/* Seção 1: Maturômetro / Queijos Ativos */}
                <div>
                  <h4 className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-[#78350f] mb-3 flex items-center gap-1.5">
                    ⏳ Maturômetro de Queijos ({queijosEmMaturacao.length} ativos)
                  </h4>
                  {queijosEmMaturacao.length === 0 ? (
                    <div className="border-4 border-dashed border-stone-200 rounded-2xl p-6 text-center text-xs text-stone-500 bg-white/50">
                      🥛 Nenhuma prateleira ocupada no momento. Escolha uma das receitas abaixo para começar a maturar leite cru fresco!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {queijosEmMaturacao.map((item, idx) => {
                        const totalDays = item.tipo === 'coalho' ? 1 : item.tipo === 'mucarela' ? 3 : 7;
                        const elapsed = totalDays - item.diasRestantes;
                        const progressPct = Math.min(100, Math.round((elapsed / totalDays) * 100));
                        const label = item.tipo === 'coalho' ? 'Queijo Coalho' : item.tipo === 'mucarela' ? 'Queijo Muçarela' : 'Queijo Brie';
                        const emoji = '🧀';

                        return (
                          <div key={idx} className="bg-white border-3 border-amber-800/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-amber-800/30 transition-all shadow-xs">
                            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl border border-amber-250 select-none shrink-0">
                              {emoji}
                            </div>
                            <div className="flex-1 w-full text-center sm:text-left">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                <span className="font-display font-black text-sm uppercase tracking-wider text-[#78350f]">
                                  {label}
                                </span>
                                <span className="text-[10px] text-amber-800 font-mono font-bold uppercase tracking-wide bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                                  ⌛ Faltando {item.diasRestantes} dia(s)
                                </span>
                              </div>
                              {/* Progress bar */}
                              <div className="mt-2.5 w-full bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-150 shadow-inner relative flex">
                                <div 
                                  className="bg-gradient-to-r from-amber-400 via-yellow-500 to-green-500 h-full transition-all duration-500"
                                  style={{ width: `${progressPct}%` }}
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-black text-stone-700">
                                  {progressPct}% de maturação
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Seção 2: Receitas */}
                <div>
                  <h4 className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-[#78350f] mb-3 flex items-center gap-1.5">
                    📖 Receitas de Queijo Disponíveis
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {/* 1. Coalho */}
                    <div className="bg-white border-2 border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl bg-amber-50 border border-amber-100/50 p-2 rounded-xl">🧀</span>
                        <div>
                          <h5 className="font-display font-black text-xs uppercase tracking-wider text-amber-900">Queijo Coalho</h5>
                          <p className="text-[10px] font-mono text-stone-500 mt-0.5">
                            Fácil de fazer, textura firme, ótimo grelhado.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1 py-0.5 rounded-lg">
                            <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-100">🥛 Requer: 3 leite(s)</span>
                            <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded border border-blue-100">⌛ Matura: 1 dia</span>
                            <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-100">💰 Preço Base: 14 moedas</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => craftQueijo('coalho', e)}
                        disabled={inventory.milk < 3 || queijosEmMaturacao.length >= maxPrateleiras}
                        className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-mono font-black text-xs px-4 py-2 rounded-xl active:translate-y-0.5 shadow-[0_3px_0_#7af00b] cursor-pointer transition-all"
                      >
                        Fabricar
                      </button>
                    </div>

                    {/* 2. Mucarela */}
                    <div className="bg-white border-2 border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl bg-amber-50 border border-amber-100/50 p-2 rounded-xl">🧀</span>
                        <div>
                          <h5 className="font-display font-black text-xs uppercase tracking-wider text-amber-900">Queijo Muçarela</h5>
                          <p className="text-[10px] font-mono text-stone-500 mt-0.5">
                            Uso geral, amanteigado e de alto derretimento.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1 py-0.5 rounded-lg">
                            <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-100">🥛 Requer: 5 leite(s)</span>
                            <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded border border-blue-100">⌛ Matura: 3 dias</span>
                            <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-100">💰 Preço Base: 28 moedas</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => craftQueijo('mucarela', e)}
                        disabled={inventory.milk < 5 || queijosEmMaturacao.length >= maxPrateleiras}
                        className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-mono font-black text-xs px-4 py-2 rounded-xl active:translate-y-0.5 shadow-[0_3px_0_#7af00b] cursor-pointer transition-all"
                      >
                        Fabricar
                      </button>
                    </div>

                    {/* 3. Brie */}
                    <div className="bg-white border-2 border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl bg-amber-50 border border-amber-100/50 p-2 rounded-xl">🧀</span>
                        <div>
                          <h5 className="font-display font-black text-xs uppercase tracking-wider text-amber-900">Queijo Brie</h5>
                          <p className="text-[10px] font-mono text-stone-500 mt-0.5">
                            Casca fofinha de fungo branco e textura muito cremosa.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1 py-0.5 rounded-lg">
                            <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-100">🥛 Requer: 8 leite(s)</span>
                            <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded border border-blue-100">⌛ Matura: 7 dias</span>
                            <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-100">💰 Preço Base: 65 moedas</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => craftQueijo('brie', e)}
                        disabled={inventory.milk < 8 || queijosEmMaturacao.length >= maxPrateleiras}
                        className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-mono font-black text-xs px-4 py-2 rounded-xl active:translate-y-0.5 shadow-[0_3px_0_#7af00b] cursor-pointer transition-all"
                      >
                        Fabricar
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Close footer button */}
              <div className="bg-amber-50 p-4 border-t border-amber-100 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowQueijariaModal(false);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="bg-amber-700 hover:bg-amber-600 text-white border-b-4 border-amber-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer focus:outline-none"
                >
                  Fechar Queijaria
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📊 COMMODITY MARKET BOARD MODAL */}
      <AnimatePresence>
        {showMarketModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMarketModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-sky-800 rounded-[36px] max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              {/* Plaque Header */}
              <div className="bg-gradient-to-r from-sky-800 to-indigo-900 p-5 border-b-4 border-sky-950 text-center shrink-0">
                <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2" style={{ textShadow: '1.5px 1.5px 0px #0c4a6e' }}>
                  📊 Painel Financeiro do Mercado
                </h3>
                <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
                  Fatores dinâmicos, ofertas semanais e flutuações de preços
                </p>
                <button
                  onClick={() => {
                    setShowMarketModal(false);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-sky-950 hover:bg-sky-850 border-2 border-sky-900 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 text-lg font-bold"
                  title="Fechar"
                >
                  ✕
                </button>
              </div>

              {/* Informative banners about market rules */}
              <div className="bg-[#e0f2fe] border-b border-sky-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-sky-950 font-mono shrink-0">
                <div>
                  ⚖️ <strong>Oferta e Procura:</strong> Quanto mais unidades de um item você vende na semana, menor fica seu preço de venda (-0.4% por unidade). O preço reinicia no relatório semanal a cada 7 dias!
                </div>
                <div>
                  🌸 <strong>Fatores Sazonais:</strong> Estações mudam a demanda de produtos (🧶 lã cresce 30% no Inverno, 🥛 leite cai 20% no Verão). Climas e Mercador também modificam o preço!
                </div>
              </div>

              {/* Commodities listings scrollable container */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5" style={{ scrollbarWidth: 'thin' }}>
                
                {/* Product row helper */}
                {([
                  { key: 'milk', label: '🥛 Leite Cru', base: getItemBaseSellPrice('milk'), desc: 'Produzido por vacas leiteiras comuns.', formula: 'Sazonalidade: Verão (-20%) | Clima: Chuva (-10%), Sol (+10%)' },
                  { key: 'wool', label: '🧶 Lã Crua', base: getItemBaseSellPrice('wool'), desc: 'Tosquiada das ovelhas de pelagem densa.', formula: 'Sazonalidade: Inverno (+30%) | Clima: Chuva (Sem lã / -20% valor)' },
                  { key: 'cheese', label: '🧀 Queijo Nobre', base: getItemBaseSellPrice('cheese'), desc: 'Feito com carinho no Ateliê com 2 leites.', formula: 'Sazonalidade: Outono (+15%) | Clima: Sem impacto' },
                  { key: 'scarf', label: '🧣 Cachecol Elegante', base: getItemBaseSellPrice('scarf'), desc: 'Tecido com cuidado no Ateliê com 2 lãs.', formula: 'Sazonalidade: Primavera (+10%) | Clima: Sem impacto' },
                  { key: 'egg', label: '🥚 Ovo de Quintal', base: getItemBaseSellPrice('egg'), desc: 'Produzido por galinhas felizes e bem alimentadas.', formula: 'Sazonalidade: Primavera (+25%), Inverno (-25%) | Clima: Chuva (-10%), Sol (+10%)' },
                  { key: 'mayo', label: '🥣 Maionese Cremosa', base: getItemBaseSellPrice('mayo'), desc: 'Preparada misturando 2 ovos de quintal no Ateliê.', formula: 'Sazonalidade: Verão (+15%) | Clima: Sem impacto' }
                ] as const).map((item) => {
                  const currentP = getDynamicPrice(item.key);
                  const trend = getTrendIconAndColor(item.key);
                  const basePrice = item.base;
                  const weeklyQty = weeklySales[item.key] || 0;
                  // BUG 13 FIX: usa Math.min para limitar penalidade a 40%, não Math.max
                  const demandPenalty = Math.min(40, Math.round((weeklyQty * 0.4) * 10) / 10);
                  const stock = inventory[item.key] || 0;
                  const quantityToSell = Math.min(stock, sellQuantities[item.key] || 1);

                  return (
                    <div key={item.key} className="bg-white border-3 border-stone-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
                      
                      {/* Name of Product */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-sm uppercase text-[#78350f] tracking-wide">{item.label}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#e0f1fc] text-sky-800 font-mono`}>
                            Estoque: {stock}u
                          </span>
                        </div>
                        <p className="text-stone-400 text-[10px] mt-0.5 font-sans leading-relaxed">{item.desc}</p>
                        <div className="text-[9px] text-stone-500 font-mono mt-1 uppercase tracking-wider leading-relaxed">
                          ⚙️ {item.formula}
                        </div>
                      </div>

                      {/* Sparkline Canvas and stats info */}
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {/* Factors and Trends info display */}
                        <div className="bg-slate-50 p-2 rounded-xl border border-stone-100 flex items-center justify-between gap-4 shrink-0 text-center font-mono text-[11px] min-w-[140px]">
                          <div>
                            <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">Venda Semanal</div>
                            <div className="text-stone-700 font-extrabold mt-0.5">{weeklyQty} u</div>
                            <div className="text-[8px] text-red-500 font-extrabold font-mono mt-0.5">{weeklyQty > 0 ? `-${demandPenalty}%` : 'Alta Procura!'}</div>
                          </div>
                          <div className="border-l border-stone-200 h-8" />
                          <div>
                            <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">Tendência</div>
                            <div className={`text-xs mt-0.5 flex items-center justify-center gap-0.5 leading-none ${trend.color}`} title={trend.label}>
                              <span>{trend.icon}</span> <span>{trend.label}</span>
                            </div>
                          </div>
                        </div>

                        {/* Sparkline Price chart */}
                        <PriceChart history={priceHistory[item.key] || [basePrice, basePrice, basePrice, basePrice, basePrice, basePrice, basePrice]} basePrice={basePrice} />
                      </div>

                      {/* Selection Controls and Sell Button */}
                      <div className="shrink-0 flex flex-col items-end gap-1.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-100 min-w-[210px] w-full lg:w-auto">
                        <div className="text-right w-full flex lg:flex-col justify-between items-center lg:items-end">
                          <span className="block text-[9px] text-stone-400 font-mono uppercase font-black tracking-wider">Preço por un.</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-indigo-900 font-black font-mono text-lg">{currentP} moedas</span>
                            <span className="text-[9px] font-mono text-stone-400">Base: {basePrice}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 w-full justify-between mt-0.5">
                          <div className="flex items-center bg-stone-100 border-2 border-stone-200 rounded-xl p-0.5 overflow-hidden">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setSellQuantities(prev => ({
                                  ...prev,
                                  [item.key]: Math.max(1, (prev[item.key] || 1) - 1)
                                }));
                                triggerAudioResult(() => sfx.playSound('click'));
                              }}
                              disabled={stock < 1}
                              className="w-7 h-7 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-200 rounded-lg active:scale-95 disabled:opacity-30 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-mono font-black text-xs text-sky-950">
                              {quantityToSell}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setSellQuantities(prev => ({
                                  ...prev,
                                  [item.key]: Math.min(stock, (prev[item.key] || 1) + 1)
                                }));
                                triggerAudioResult(() => sfx.playSound('click'));
                              }}
                              disabled={stock <= (sellQuantities[item.key] || 1)}
                              className="w-7 h-7 flex items-center justify-center font-bold text-stone-600 hover:bg-stone-200 rounded-lg active:scale-95 disabled:opacity-30 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setSellQuantities(prev => ({
                                ...prev,
                                [item.key]: stock
                              }));
                              triggerAudioResult(() => sfx.playSound('click'));
                            }}
                            disabled={stock < 1}
                            className="bg-sky-100 hover:bg-sky-200 text-sky-800 font-mono font-bold text-[9px] uppercase px-2 py-1.5 rounded-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            MÁX
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            if (quantityToSell < 1) return;
                            sellProduct(item.key, quantityToSell, e);
                            setSellQuantities(prev => ({
                              ...prev,
                              [item.key]: 1
                            }));
                          }}
                          disabled={stock < 1}
                          className={`w-full font-mono font-black text-[11px] uppercase py-2.5 px-3 border-b-2 rounded-xl text-center leading-none tracking-wide transition-all active:translate-y-0.5 ${
                            stock > 0
                              ? 'bg-amber-400 hover:bg-amber-300 text-[#451a03] border-amber-600 cursor-pointer'
                              : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-50'
                          }`}
                        >
                          Vender {quantityToSell} {quantityToSell === 1 ? 'unidade' : 'unidades'} (+{(currentP * quantityToSell).toFixed(0)} 💰)
                        </button>
                      </div>

                    </div>
                  );
                })}

                {/* 🥩 Specialty segment for Beef (Carne de Boi) */}
                {(() => {
                  const currentP = Math.max(50, Math.round(150 * getCarneMultiplier()));
                  const trend = getTrendIconAndColor('carne');
                  const weeklyQty = weeklySales.carne || 0;
                  // BUG 13 FIX: usa Math.min para limitar penalidade a 40%, não Math.max
                  const demandPenalty = Math.min(40, Math.round((weeklyQty * 0.4) * 10) / 10);
                  const boiCount = animals.filter(a => a.type === 'boi').length;

                  return (
                    <div className="bg-white border-3 border-orange-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-sm uppercase text-[#78350f] tracking-wide">🥩 Carne de Boi</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-orange-100 text-orange-800 font-mono`}>
                            Plantel: {boiCount} bois
                          </span>
                        </div>
                        <p className="text-stone-400 text-[10px] mt-0.5 font-sans leading-relaxed">
                          Influencia diretamente os lucros das vendas de Bois Gordos na feira.
                        </p>
                        <div className="text-[9px] text-stone-500 font-mono mt-1 uppercase tracking-wider leading-relaxed">
                          ⚙️ Sazonalidade: Primavera (+10%) | Clima: Sem impacto
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-stone-100 flex items-center justify-between gap-6 shrink-0 text-center font-mono text-xs">
                          <div>
                            <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">Vendas de Boi</div>
                            <div className="text-stone-700 font-extrabold mt-0.5">{weeklyQty} animais</div>
                            <div className="text-[8px] text-red-500 font-extrabold font-mono mt-0.5">{weeklyQty > 0 ? `-${demandPenalty}% queda` : 'Alta Procura! 📈'}</div>
                          </div>
                          <div className="border-l border-stone-200 h-8" />
                          <div>
                            <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">Tendência do Boi</div>
                            <div className={`text-sm mt-0.5 flex items-center justify-center gap-1 leading-none ${trend.color}`} title={trend.label}>
                              <span>{trend.icon}</span> <span>{trend.label}</span>
                            </div>
                          </div>
                        </div>

                        <PriceChart history={priceHistory.carne || [150, 150, 150, 150, 150, 150, 150]} basePrice={150} />
                      </div>

                      <div className="shrink-0 text-right min-w-[120px] md:border-l border-stone-100 md:pl-4">
                        <span className="block text-[9px] text-stone-400 font-mono uppercase font-black tracking-wider">Fator Multiplicativo</span>
                        <div className="text-orange-950 font-black font-mono text-xl">x{Math.round(getCarneMultiplier() * 100) / 100}</div>
                        <span className="block text-[8px] font-mono text-stone-400">Preço Nominal: {currentP} moedas</span>
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Mass Selling footer trigger */}
              <div className="bg-sky-50 p-4 border-t-2 border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="text-center sm:text-left">
                  <div className="text-xs text-sky-900 font-bold uppercase tracking-wider font-mono">Bens Totais Armazenados</div>
                  <div className="text-stone-700 font-semibold text-[11px] mt-0.5">
                    🥛 {inventory.milk}L, 🧶 {inventory.wool} Lã, 🧀 {inventory.cheese} Queijo, 🧣 {inventory.scarf} Cachecol, 🥚 {inventory.egg || 0} Ovo, 🥣 {inventory.mayo || 0} Maionese
                  </div>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setShowSellAllConfirmModal(true);
                      triggerAudioResult(() => sfx.playSound('click'));
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-[#451a03] border-b-4 border-amber-700 shadow-md px-5 py-2.5 rounded-2xl font-mono font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer leading-none"
                    title="Liquidar todo o estoque no Armazém com os multiplicadores correntes"
                  >
                    💰 Vender Todo o Estoque!
                  </button>
                  <button
                    onClick={() => {
                      setShowMarketModal(false);
                      triggerAudioResult(() => sfx.playSound('click'));
                    }}
                    className="bg-[#10b981] hover:bg-[#059669] text-white border-b-4 border-[#065f46] shadow-md px-5 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer leading-none"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💰 DYNAMIC MASS LIQUIDATION / SELL ALL CONFIRMATION MODAL */}
      <AnimatePresence>
        {showSellAllConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-[#fffbeb] border-8 border-yellow-500 rounded-[40px] max-w-md w-full p-6 text-center shadow-2xl relative"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-500 hover:bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-md select-none border-4 border-[#fffbeb]">
                💰
              </div>

              <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-[#78350f] mt-8">
                Confirmar Liquidação Geral?
              </h3>
              <p className="text-stone-500 text-xs font-mono mt-1 uppercase tracking-widest">
                Armazém de Commodities Aurora
              </p>

               {/* Items inventory breakdown table */}
              <div className="bg-amber-50/70 border-2 border-yellow-200 rounded-2xl p-4 my-5 space-y-2 text-xs font-mono text-[#78350f] max-h-64 overflow-y-auto">
                <div className="flex justify-between items-center text-stone-500 font-bold border-b border-yellow-100 pb-1 text-[10px] uppercase">
                  <span>Produto</span> <span className="mr-auto pl-3">Qtd</span> <span className="pr-4">Preço</span> <span>Total do Item</span>
                </div>
                
                {(() => {
                  const itemsToSell = [
                    { key: 'milk', label: 'Leite Cru', qty: inventory.milk, icon: '🥛' },
                    { key: 'wool', label: 'Lã Crua', qty: inventory.wool, icon: '🧶' },
                    { key: 'cheese', label: 'Queijo Nobre', qty: inventory.cheese, icon: '🧀' },
                    { key: 'scarf', label: 'Cachecol Elegante', qty: inventory.scarf, icon: '🧣' },
                    { key: 'egg', label: 'Ovo de Quintal', qty: inventory.egg || 0, icon: '🥚' },
                    { key: 'mayo', label: 'Maionese Cremosa', qty: inventory.mayo || 0, icon: '🥣' },
                    { key: 'queijoCoalho', label: 'Queijo Coalho', qty: inventory.queijoCoalho || 0, icon: '🧀' },
                    { key: 'queijoMucarela', label: 'Queijo Muçarela', qty: inventory.queijoMucarela || 0, icon: '🧀' },
                    { key: 'queijoBrie', label: 'Queijo Brie', qty: inventory.queijoBrie || 0, icon: '🧀' },
                  ].filter(i => i.qty > 0);

                  if (itemsToSell.length === 0) {
                    return <div className="text-center text-stone-400 py-4 italic">Nenhum item disponível para liquidação.</div>;
                  }

                  return (
                    <>
                      {itemsToSell.map(item => {
                        const price = getDynamicTransactionPrice(item.key as any);
                        const subtotal = item.qty * price;
                        return (
                          <div key={item.key} className="flex justify-between items-center">
                            <span className="flex items-center gap-1 font-bold">
                              <span>{item.icon}</span> {item.label}:
                            </span>
                            <span className="mr-auto pl-2 font-mono text-stone-500 font-bold">{item.qty}u</span>
                            <span className="text-stone-400 font-mono pr-2">{price}💰</span>
                            <span className="font-mono font-extrabold text-[#78350f]">{subtotal} moedas</span>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}

                {/* Subtotal */}
                <div className="border-t-2 border-yellow-250 pt-2 flex justify-between items-center font-display font-black text-[#92400e] text-sm uppercase">
                  <span>Liquidação Estimada:</span>
                  <span className="text-amber-600">
                    {(() => {
                      const milkQty = inventory.milk;
                      const woolQty = inventory.wool;
                      const cheeseQty = inventory.cheese;
                      const scarfQty = inventory.scarf;
                      const eggQty = inventory.egg || 0;
                      const mayoQty = inventory.mayo || 0;
                      const coalhoQty = inventory.queijoCoalho || 0;
                      const mucarelaQty = inventory.queijoMucarela || 0;
                      const brieQty = inventory.queijoBrie || 0;
                      return (
                        (milkQty * getDynamicTransactionPrice('milk')) + 
                        (woolQty * getDynamicTransactionPrice('wool')) + 
                        (cheeseQty * getDynamicTransactionPrice('cheese')) + 
                        (scarfQty * getDynamicTransactionPrice('scarf')) +
                        (eggQty * getDynamicTransactionPrice('egg')) +
                        (mayoQty * getDynamicTransactionPrice('mayo')) +
                        (coalhoQty * getDynamicTransactionPrice('queijoCoalho')) +
                        (mucarelaQty * getDynamicTransactionPrice('queijoMucarela')) +
                        (brieQty * getDynamicTransactionPrice('queijoBrie'))
                      );
                    })()} Moedas
                  </span>
                </div>
              </div>

              {/* Confirmation choice */}
              <div className="flex items-center gap-3.5 mt-2">
                <button
                  onClick={() => {
                    sellAllItemsNoConfirm(false);
                    setShowSellAllConfirmModal(false);
                  }}
                  disabled={
                    !(inventory.milk > 0 || inventory.wool > 0 || inventory.cheese > 0 || inventory.scarf > 0 || (inventory.egg || 0) > 0 || (inventory.mayo || 0) > 0 || (inventory.queijoCoalho || 0) > 0 || (inventory.queijoMucarela || 0) > 0 || (inventory.queijoBrie || 0) > 0)
                  }
                  className={`flex-1 shadow-md px-5 py-3 rounded-2xl font-mono font-black uppercase text-xs tracking-wider border-b-4 transition-all hover:scale-102 cursor-pointer active:translate-y-0.5 ${
                    (inventory.milk > 0 || inventory.wool > 0 || inventory.cheese > 0 || inventory.scarf > 0 || (inventory.egg || 0) > 0 || (inventory.mayo || 0) > 0 || (inventory.queijoCoalho || 0) > 0 || (inventory.queijoMucarela || 0) > 0 || (inventory.queijoBrie || 0) > 0)
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800'
                      : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'
                  }`}
                >
                  Confirmar Venda!
                </button>
                <button
                  onClick={() => {
                    setShowSellAllConfirmModal(false);
                    triggerAudioResult(() => sfx.playSound('click'));
                  }}
                  className="flex-1 bg-red-650 hover:bg-red-600 hover:scale-102 text-white border-b-4 border-red-800 shadow-md px-5 py-3 rounded-2xl font-mono font-black uppercase text-xs tracking-wider transition-all active:translate-y-0.5 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              {!(inventory.milk > 0 || inventory.wool > 0 || inventory.cheese > 0 || inventory.scarf > 0 || (inventory.egg || 0) > 0 || (inventory.mayo || 0) > 0 || (inventory.queijoCoalho || 0) > 0 || (inventory.queijoMucarela || 0) > 0 || (inventory.queijoBrie || 0) > 0) && (
                <p className="text-[10px] text-red-500 mt-3 font-mono font-bold animate-pulse">
                  ⚠️ Nenhum produto armazenado disponível para venda!
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔔 NOTIFICAÇÕES PANEL (DRAWER) */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-0 right-0 h-full w-80 bg-[#fffbeb] border-l-8 border-[#78350f] z-[95] flex flex-col shadow-2xl"
          >
            <div className="bg-[#78350f] p-4 border-b-4 border-[#92400e] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-white font-display font-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Notificações
                </h3>
                <p className="text-[#fcd57e] text-[9px] font-mono uppercase tracking-wider mt-0.5">
                  {notifications.filter(n => !n.read).length} não lidas
                </p>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some(n => !n.read) && (
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="text-[9px] font-mono text-[#fcd57e] hover:text-white uppercase font-bold cursor-pointer"
                  >
                    Ler todas
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#fcd57e] hover:text-white bg-[#92400e] hover:bg-[#b45309] w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: 'thin' }}>
              {notifications.length === 0 ? (
                <div className="text-center text-[#92400e]/50 italic pt-8 text-xs font-bold uppercase">
                  Nenhuma notificação ainda.
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all text-xs font-sans leading-relaxed ${
                      !notif.read
                        ? notif.type === 'success' ? 'bg-emerald-50 border-emerald-300 font-bold' : notif.type === 'warning' ? 'bg-red-50 border-red-300 font-bold' : notif.type === 'event' ? 'bg-yellow-50 border-yellow-300 font-bold' : 'bg-blue-50 border-blue-300 font-bold'
                        : 'bg-stone-50 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="flex-1 leading-snug">{notif.message}</span>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />}
                    </div>
                    <div className="text-[9px] text-stone-400 font-mono mt-1">Dia {notif.day}</div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-3 border-t-2 border-[#fbbf24] shrink-0">
                <button
                  onClick={() => setNotifications([])}
                  className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-mono font-bold text-[10px] uppercase py-2 rounded-xl transition-all cursor-pointer"
                >
                  Limpar Tudo
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎯 MISSÕES MODAL */}
      <AnimatePresence>
        {showMissionsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMissionsModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[90] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-purple-800 rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              <div className="bg-gradient-to-r from-purple-800 to-indigo-900 p-5 border-b-4 border-purple-950 text-center shrink-0">
                <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">
                  🎯 Missões &amp; Objetivos
                </h3>
                <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
                  Complete tarefas para ganhar recompensas extras!
                </p>
                <button
                  onClick={() => setShowMissionsModal(false)}
                  className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-purple-950 hover:bg-purple-800 border-2 border-purple-900 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: 'thin' }}>
                <div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-purple-800 mb-2 flex items-center gap-1.5">📅 Missões Diárias</h4>
                  <div className="space-y-3">
                    {missions.filter(m => m.type === 'daily').length === 0 && (
                      <p className="text-stone-500 text-xs italic text-center py-4">Nenhuma missão diária ativa. Avance o dia para gerar novas missões!</p>
                    )}
                    {missions.filter(m => m.type === 'daily').map(m => (
                      <div key={m.id} className={`border-4 rounded-3xl p-4 flex flex-col gap-2 ${m.claimed ? 'bg-stone-100 border-stone-200 opacity-60' : m.completed ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-purple-200'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h5 className="font-display font-black text-sm uppercase text-[#78350f]">{m.title}</h5>
                            <p className="text-xs text-stone-500 mt-0.5">{m.description}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-600 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shrink-0">
                            🏆 {m.reward} moedas
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-stone-200 h-2.5 rounded-full overflow-hidden border border-stone-300">
                            <div
                              className={`h-full rounded-full transition-all ${m.completed ? 'bg-emerald-500' : 'bg-purple-500'}`}
                              style={{ width: `${Math.min(100, (m.current / m.goal) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-stone-600 shrink-0">{m.current}/{m.goal}</span>
                          {m.completed && !m.claimed && (
                            <button
                              onClick={() => {
                                setMissions(prev => prev.map(mis => mis.id === m.id ? { ...mis, claimed: true } : mis));
                                setGold(prev => prev + m.reward);
                                addLog(`🎯 Missão "${m.title}" concluída! +${m.reward} moedas resgatadas!`, 'success');
                                spawnFeedback('🎯', `+${m.reward} 💰`, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 } as any);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-[10px] uppercase px-3 py-1 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0"
                            >
                              Resgatar!
                            </button>
                          )}
                          {m.claimed && <span className="text-[10px] font-mono text-stone-400 shrink-0">✓ Resgatado</span>}
                        </div>
                        <div className="text-[9px] text-stone-400 font-mono">Expira no Dia {m.expiresOnDay}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-indigo-800 mb-2 flex items-center gap-1.5 mt-2">📆 Missões Semanais</h4>
                  <div className="space-y-3">
                    {missions.filter(m => m.type === 'weekly').length === 0 && (
                      <p className="text-stone-500 text-xs italic text-center py-4">Nenhuma missão semanal ativa. Avance o dia para gerar novas missões!</p>
                    )}
                    {missions.filter(m => m.type === 'weekly').map(m => (
                      <div key={m.id} className={`border-4 rounded-3xl p-4 flex flex-col gap-2 ${m.claimed ? 'bg-stone-100 border-stone-200 opacity-60' : m.completed ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-indigo-200'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h5 className="font-display font-black text-sm uppercase text-[#78350f]">{m.title}</h5>
                            <p className="text-xs text-stone-500 mt-0.5">{m.description}</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-600 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shrink-0">
                            🏆 {m.reward} moedas
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-stone-200 h-2.5 rounded-full overflow-hidden border border-stone-300">
                            <div
                              className={`h-full rounded-full transition-all ${m.completed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                              style={{ width: `${Math.min(100, (m.current / m.goal) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-stone-600 shrink-0">{m.current}/{m.goal}</span>
                          {m.completed && !m.claimed && (
                            <button
                              onClick={() => {
                                setMissions(prev => prev.map(mis => mis.id === m.id ? { ...mis, claimed: true } : mis));
                                setGold(prev => prev + m.reward);
                                addLog(`🎯 Missão "${m.title}" concluída! +${m.reward} moedas resgatadas!`, 'success');
                                spawnFeedback('🎯', `+${m.reward} 💰`, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 } as any);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-[10px] uppercase px-3 py-1 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0"
                            >
                              Resgatar!
                            </button>
                          )}
                          {m.claimed && <span className="text-[10px] font-mono text-stone-400 shrink-0">✓ Resgatado</span>}
                        </div>
                        <div className="text-[9px] text-stone-400 font-mono">Expira no Dia {m.expiresOnDay}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 border-t-2 border-purple-200 flex justify-end shrink-0">
                <button
                  onClick={() => setShowMissionsModal(false)}
                  className="bg-purple-600 hover:bg-purple-500 text-white border-b-4 border-purple-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer"
                >
                  Voltar à Fazenda
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📊 STATS / ANALYTICS MODAL */}
      <AnimatePresence>
        {showStatsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStatsModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[90] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-teal-800 rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              <div className="bg-gradient-to-r from-teal-800 to-teal-900 p-5 border-b-4 border-teal-950 text-center shrink-0">
                <h3 className="text-white text-xl sm:text-2xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">
                  📊 Painel de Estatísticas
                </h3>
                <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
                  Histórico de ganhos, produção e desempenho da fazenda
                </p>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-teal-950 hover:bg-teal-800 border-2 border-teal-900 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'thin' }}>

                {/* Resumo Geral */}
                <div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">📋 Resumo Geral</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 text-center">
                      <div className="text-[9px] font-mono text-emerald-700 uppercase font-black">Total Faturado</div>
                      <div className="text-base font-black font-mono text-[#78350f] mt-1">💰 {stats.totalEarned}</div>
                    </div>
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 text-center">
                      <div className="text-[9px] font-mono text-amber-700 uppercase font-black">Melhor Dia</div>
                      <div className="text-base font-black font-mono text-[#78350f] mt-1">💰 {allTimeStats.bestDay}</div>
                    </div>
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-3 text-center">
                      <div className="text-[9px] font-mono text-blue-700 uppercase font-black">Total Coletado</div>
                      <div className="text-base font-black font-mono text-[#78350f] mt-1">📦 {stats.totalCollected}</div>
                    </div>
                    <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-3 text-center">
                      <div className="text-[9px] font-mono text-purple-700 uppercase font-black">Total Alimentados</div>
                      <div className="text-base font-black font-mono text-[#78350f] mt-1">🌽 {stats.totalFed}</div>
                    </div>
                  </div>
                </div>

                {/* Gráfico de Ganhos Diários */}
                <div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">📈 Ganhos Diários (últimos {earningsHistory.length} dias)</h4>
                  {earningsHistory.length === 0 ? (
                    <div className="text-xs text-stone-500 italic text-center py-4">Avance dias para ver o histórico de ganhos.</div>
                  ) : (
                    <div className="bg-white border-2 border-teal-200 rounded-2xl p-4">
                      <div className="flex items-end gap-1.5 h-24 w-full">
                        {earningsHistory.map((val, i) => {
                          const maxVal = Math.max(...earningsHistory, 1);
                          const heightPct = Math.max(5, (val / maxVal) * 100);
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar" title={`Dia ${currentDay - earningsHistory.length + i}: ${val} moedas`}>
                              <div
                                className="w-full bg-teal-500 rounded-t-md transition-all group-hover/bar:bg-teal-400"
                                style={{ height: `${heightPct}%` }}
                              />
                              <span className="text-[7px] font-mono text-stone-400 leading-none">{val > 0 ? val : '-'}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[8px] text-stone-400 font-mono mt-1">
                        <span>-{earningsHistory.length}d</span>
                        <span>hoje</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Distribuição de Produtos */}
                <div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">🥧 Produção por Tipo</h4>
                  <div className="space-y-2">
                    {[
                      { label: '🥛 Leite Coletado', val: stats.totalMilk || 0, color: 'bg-blue-400' },
                      { label: '🧶 Lã Coletada', val: stats.totalWool || 0, color: 'bg-purple-400' },
                      { label: '🥚 Ovos Coletados', val: stats.totalEggs || 0, color: 'bg-amber-400' },
                      { label: '🧀 Queijos Fabricados', val: stats.totalCheese || 0, color: 'bg-yellow-500' },
                      { label: '🧣 Cachecóis Tecidos', val: stats.totalScarf || 0, color: 'bg-indigo-400' },
                      { label: '🥣 Maioneses Feitas', val: stats.totalMayo || 0, color: 'bg-green-400' },
                      { label: '🐂 Bois Vendidos', val: stats.totalOxSold || 0, color: 'bg-orange-400' },
                    ].map(item => {
                      const maxVal = Math.max(stats.totalMilk || 0, stats.totalWool || 0, stats.totalEggs || 0, stats.totalCheese || 0, stats.totalScarf || 0, stats.totalMayo || 0, stats.totalOxSold || 0, 1);
                      const widthPct = Math.max(2, (item.val / maxVal) * 100);
                      return (
                        <div key={item.label} className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-stone-600 w-36 shrink-0">{item.label}</span>
                          <div className="flex-1 bg-stone-200 h-4 rounded-full overflow-hidden border border-stone-300 flex items-center">
                            <div className={`${item.color} h-full rounded-full transition-all`} style={{ width: `${widthPct}%` }} />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-stone-700 w-8 text-right shrink-0">{item.val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="bg-teal-50 p-4 border-t-2 border-teal-200 flex justify-end shrink-0">
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="bg-teal-600 hover:bg-teal-500 text-white border-b-4 border-teal-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer"
                >
                  Fechar Stats
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
