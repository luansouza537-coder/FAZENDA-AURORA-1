/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAnimals } from './hooks/useAnimals';
import { useInventory } from './hooks/useInventory';
import { useFairs } from './hooks/useFairs';
import { useEconomy } from './hooks/useEconomy';
import { useFarm, getFarmTitle, getLevelUpDetails, getXpForLevel } from './hooks/useFarm';
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
import { Animal, AnimalType, AnimalTrait, FarmStats, LogMessage, Contract, FarmSpecialization, FairResult, FarmWorker, LandLot, BiomeType } from './types';
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
  { id: 'silk_producer', title: 'Mestre da Seda', emoji: '🪲', description: 'Coletou 10 sedas brutas do Bicho-da-seda' },
  { id: 'exotic_farmer', title: 'Fazendeiro Exótico', emoji: '🐊', description: 'Criou um Jacaré na fazenda' },
  { id: 'organic_master', title: 'Mestre Orgânico', emoji: '🌿', description: 'Produziu 20 unidades de húmus ou muco' },
  { id: 'rare_feathers', title: 'Colecionador de Penas', emoji: '🦤', description: 'Coletou 5 penas de avestruz' },
  { id: 'level_10', title: 'Fazenda Centenária', emoji: '🌾', description: 'Alcançou o nível 10 de fazenda' },
  { id: 'level_20', title: 'Império Aurora', emoji: '🌌', description: 'Alcançou o nível máximo 20!' },
  { id: 'angora_breeder', title: 'Criador de Angorá', emoji: '🐇', description: 'O Coelho Angorá se reproduziu pela primeira vez' },
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

const WORKER_TYPES = [
  { role: 'tratador' as const, name: 'Tratador', emoji: '🧑‍🌾', dailyCost: 6, desc: 'Alimenta todos os animais diariamente. Essencial para rebanhos grandes.', minLevel: 2 },
  { role: 'composteiro' as const, name: 'Composteiro', emoji: '🌱', dailyCost: 6, desc: 'Coleta húmus das minhocas e a cada 3 dias produz 1 húmus bônus de compostagem.', minLevel: 3 },
  { role: 'tosquiador' as const, name: 'Tosquiador', emoji: '✂️', dailyCost: 7, desc: 'Coleta lã de ovelhas e coelhos angorá prontos. Tem chance de lã premium (+10%).', minLevel: 3 },
  { role: 'ordenhador' as const, name: 'Ordenhador', emoji: '🥛', dailyCost: 8, desc: 'Ordena vacas, cabras, búfalos e alpacas automaticamente ao fim do dia.', minLevel: 4 },
  { role: 'avicultor' as const, name: 'Avicultor', emoji: '🥚', dailyCost: 7, desc: 'Coleta ovos de galinhas, codornas, patos e avestruzes prontos.', minLevel: 5 },
  { role: 'queijeiro' as const, name: 'Queijeiro', emoji: '🧀', dailyCost: 12, desc: 'Transforma automaticamente 3 leites em 1 Queijo Coalho por dia. Bônus +5% de venda.', minLevel: 5 },
  { role: 'tratador_exotico' as const, name: 'Tratador Exótico', emoji: '🦎', dailyCost: 14, desc: 'Cuida de jacarés, rãs e caracóis: +5 felicidade/dia e -50% chance de epidemia nesses animais.', minLevel: 8 },
  { role: 'veterinario' as const, name: 'Veterinário', emoji: '💉', dailyCost: 15, desc: 'Cura doenças, remove estresse e adiciona +5 felicidade para todos os animais por dia.', minLevel: 10 },
  { role: 'comerciante_residente' as const, name: 'Comerciante', emoji: '💰', dailyCost: 20, desc: '+8% no preço de venda de leite, lã, ovos, seda, couro e carne bruta.', minLevel: 10 },
];

const MERCHANT_SPECIAL_ITEMS = [
  { id: 'vacina', label: '💉 Vacina Veterinária', desc: 'Previne próxima epidemia garantido', price: 80, effect: 'prevent_epidemic' },
  { id: 'adubo_especial', label: '🌱 Adubo Especial', desc: 'Equivale a 7 dias de fertilizante', price: 60, effect: 'fertilizante_7days' },
  { id: 'racao_premium', label: '🥣 Ração Premium', desc: '10 rações de qualquer tipo com +20% eficiência por 3 dias', price: 40, effect: 'premium_feed' },
  { id: 'bebedouro', label: '🪣 Bebedouro Automático', desc: 'Animais nunca ficam com sede, -5% epidemia', price: 150, effect: 'bebedouro', oneTime: true },
  { id: 'cert_sanitario', label: '📜 Certificado Sanitário', desc: '+10% preço de venda de carne permanente', price: 200, effect: 'cert_sanitario', oneTime: true },
  { id: 'licenca_exotica_item', label: '📋 Licença Exótica', desc: 'Permite criar Jacaré legalmente', price: 280, effect: 'licenca_exotica', oneTime: true },
  { id: 'licenca_criadouro', label: '📜 Licença de Criadouro', desc: 'Permite reprodução controlada de Vaca, Cabra, Ovelha e Galinha', price: 400, effect: 'licenca_criadouro', oneTime: true },
] as const;

export default function App() {
  // --- STATE WITH LOCALSTORAGE INITIALIZATION ---
  // NOTE: gold, debt, dailyEarning, earningsHistory, weeklySales, weeklyStats,
  // previousPrices, priceHistory, merchantActive, daysSinceMerchant, nextMerchantDay,
  // insurance are now managed by useEconomy (initialized below after other state)

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

  // farmLevel, farmXp — managed by useFarm hook (initialized below after useEconomy)



  const [showQueijariaModal, setShowQueijariaModal] = useState<boolean>(false);

  // --- FUNCIONALIDADES 1-12: Novos estados ---

  // farmWisdomBonus, contracts — managed by useFarm hook
  const [showContractsModal, setShowContractsModal] = useState<boolean>(false);

  // F5: Seguro agrícola moved to useEconomy

  // landLots, wellLevel, solarLevel, irrigationLevel — managed by useFarm hook


  const [showUpgradesModal, setShowUpgradesModal] = useState<boolean>(false);

  // hasStable, hasSilo, hasFridge, hasTipBox — managed by useFarm hook

  // --- FEATURE 1: Animal List Filters ---
  const [animalFilter, setAnimalFilter] = useState<string>('all');
  const [animalSort, setAnimalSort] = useState<'happiness'|'production'|'age'|'name'>('name');
  const [animalSortDir, setAnimalSortDir] = useState<'asc'|'desc'>('asc');

  // --- FEATURE 2: Worker NPCs ---
  const [workers, setWorkers] = useState<FarmWorker[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).workers ?? [];
    } catch(e) {}
    return [];
  });
  const [showWorkersModal, setShowWorkersModal] = useState(false);

  // --- FEATURE 3: Land Biomes ---
  const [landBiomes, setLandBiomes] = useState<LandLot[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).landBiomes ?? [];
    } catch(e) {}
    return [];
  });

  // Grupo 4b: receita semanal para cálculo de imposto
  const [weeklyTaxPaid, setWeeklyTaxPaid] = useState<number>(0);

  // Ateliê: mostrar itens vazios toggle
  const [showEmptyItems, setShowEmptyItems] = useState<boolean>(false);

  // priceHistory moved to useEconomy

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

  // animals state moved to useAnimals hook (see bottom of state section)

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

  // merchantActive, daysSinceMerchant, nextMerchantDay moved to useEconomy

  // --- EXPANDED MERCHANT SHOP ---
  const [hasBebedouro, setHasBebedouro] = useState<boolean>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).hasBebedouro ?? false; } catch(e) {} return false;
  });
  const [hasCertSanitario, setHasCertSanitario] = useState<boolean>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).hasCertSanitario ?? false; } catch(e) {} return false;
  });
  const [licencaCriadouro, setLicencaCriadouro] = useState<boolean>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).licencaCriadouro ?? false; } catch(e) {} return false;
  });
  const [reproducaoAtiva, setReproducaoAtiva] = useState<{
    animalId1: number; animalId2: number; type: AnimalType; gestacaoEnd: number;
  }[]>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).reproducaoAtiva ?? []; } catch(e) {} return [];
  });
  const [epidemicPrevented, setEpidemicPrevented] = useState<boolean>(false);
  const [merchantSpecialItems, setMerchantSpecialItems] = useState<string[]>([]);
  const [cruzarModal, setCruzarModal] = useState<{ animalId: number; type: AnimalType } | null>(null);
  const [biomeWeeklyIncome, setBiomeWeeklyIncome] = useState<{ pasto: number; lago: number; floresta: number; pomar: number }>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).biomeWeeklyIncome ?? { pasto: 0, lago: 0, floresta: 0, pomar: 0 }; } catch(e) {} return { pasto: 0, lago: 0, floresta: 0, pomar: 0 };
  });
  const [reproHistory, setReproHistory] = useState<{ day: number; animalType: AnimalType; name: string; method: 'natural' | 'gestacao' | 'filhote' }[]>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).reproHistory ?? []; } catch(e) {} return [];
  });
  const [showReproModal, setShowReproModal] = useState<boolean>(false);

  const REPRODUCAO_CONFIG: Partial<Record<AnimalType, { gestacao: number; minAge: number }>> = {
    vaca: { gestacao: 12, minAge: 30 },
    cabra: { gestacao: 8, minAge: 20 },
    ovelha: { gestacao: 10, minAge: 25 },
    galinha: { gestacao: 5, minAge: 10 },
    pato: { gestacao: 7, minAge: 15 },
    bufalo: { gestacao: 14, minAge: 30 },
  };

  const [weather, setWeather] = useState<'chuva' | 'sol' | 'nublado'>('nublado');
  // dailyEarning moved to useEconomy

  // MECHANIC 2: Ganso alarm — pre-drawn event for next day
  const [activeMarketEvent, setActiveMarketEvent] = useState<{ title: string; desc: string; items: string[]; mult: number; daysLeft: number } | null>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).activeMarketEvent ?? null;
    } catch (e) {}
    return null;
  });

  const [nextDayEvent, setNextDayEvent] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).nextDayEvent ?? null;
    } catch (e) {}
    return null;
  });

  // --- NOVOS SISTEMAS: Especialização, Dívida, Turismo, Feiras, Crises ---
  // specialization — managed by useFarm hook
  const [showSpecializationModal, setShowSpecializationModal] = useState<boolean>(false);

  // debt moved to useEconomy

  // hasTourism — managed by useFarm hook

  const [showFairResultModal, setShowFairResultModal] = useState<FairResult | null>(null);

  const [lastEpidemicDay, setLastEpidemicDay] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).lastEpidemicDay ?? 0;
    } catch (e) {}
    return 0;
  });
  const [droughtDaysRemaining, setDroughtDaysRemaining] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) return JSON.parse(saved).droughtDaysRemaining ?? 0;
    } catch (e) {}
    return 0;
  });
  const [showBuyMenu, setShowBuyMenu] = useState<boolean>(false);
  const [showTutorialModal, setShowTutorialModal] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'title' | 'game'>('splash');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // New features: Weekly Sales, Previous Prices, Machines and Modals
  // weeklySales moved to useEconomy

  // previousPrices moved to useEconomy

  // machines — managed by useFarm hook

  const [showAutomationModal, setShowAutomationModal] = useState<boolean>(false);
  const [showMarketModal, setShowMarketModal] = useState<boolean>(false);
  const [showSellAllConfirmModal, setShowSellAllConfirmModal] = useState<boolean>(false);

  // licencaExotica and coelhoReproCount moved to useAnimals hook

  // Buff states (persisted)

  // Ateliê tab state (UI-only, no persistence)

  // Improvement 2: Profit Panel
  const [showProfitPanel, setShowProfitPanel] = useState<boolean>(false);

  // Improvement 4: Ranking Modal
  const [showRankingModal, setShowRankingModal] = useState<boolean>(false);

  // Improvement 5: Big Notification
  const [bigNotification, setBigNotification] = useState<{title: string, body: string, emoji: string, color: string} | null>(null);

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

  // weeklyStats moved to useEconomy

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
    waterCost: number;
    energyCost: number;
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
    missionKey: 'sell_milk' | 'sell_any' | 'happy_animals' | 'earn_gold' | 'feed_animals' | 'collect_items' | 'collect_silk' | 'sell_exotic' | 'organic_day';
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
  // earningsHistory moved to useEconomy
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showAllTimeStats, setShowAllTimeStats] = useState(false);
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
  const logsContainerRef = useRef<HTMLDivElement>(null);

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
    setGold(80);
    setCurrentDay(1);
    setFarmLevel(1);
    setFarmXp(0);
    setInventory({
      milk: 0,
      wool: 0,
      cheese: 0,
      scarf: 0,
      egg: 0,
      mayo: 0,
      racaoBovina: 5,
      racaoOvinos: 5,
      racaoAves: 5,
      racaoAquatica: 0,
      racaoCoelho: 0,
      racaoCarnivora: 0,
      queijoCoalho: 0,
      queijoMucarela: 0,
      queijoBrie: 0,
      goat_milk: 0,
      llama_wool: 0,
      duck_egg: 0,
      goose_egg: 0,
      buffalo_milk: 0,
      buffalo_mozzarella: 0,
      feather: 0,
      peacock_feather: 0,
      butter: 0,
      yogurt: 0,
      fertile_egg: 0,
      quail_egg: 0,
      alpaca_wool: 0,
      humus: 0,
      muco: 0,
      angora_wool: 0,
      seda_bruta: 0,
      coxa_ra: 0,
      carne_avestruz: 0,
      pena_grande: 0,
      couro_avestruz: 0,
      carne_jacare: 0,
      couro_jacare: 0,
      folha_amoreira: 0,
      sal: 0,
      queijo_cabra: 0,
      iogurte_cabra: 0,
      leite_condensado: 0,
      tapete_lhama: 0,
      cachecol_angora: 0,
      tecido_alpaca: 0,
      fio_seda: 0,
      manta_premium: 0,
      pate_pato: 0,
      ovo_defumado: 0,
      conserva_codorna: 0,
      creme_cosmetico: 0,
      sabonete_natural: 0,
      almofada_penas: 0,
      colete_couro: 0,
      bolsa_exotica: 0,
      enfeite_pavao: 0,
      peixe: 0,
      mel: 0,
      cogumelo: 0,
    });
    setRacaoOrganicaDays(0);
    setFertilizanteDays(0);
    setLicencaExotica(false);
    setHasBebedouro(false);
    setHasCertSanitario(false);
    setLicencaCriadouro(false);
    setReproducaoAtiva([]);
    setReproHistory([]);
    setBiomeWeeklyIncome({ pasto: 0, lago: 0, floresta: 0, pomar: 0 });
    setEpidemicPrevented(false);
    setMerchantSpecialItems([]);
    setCoelhoReproCount(0);
    setHasStable(false);
    setHasSilo(false);
    setHasFridge(false);
    setHasTipBox(false);
    setProductFreshness({ milk: 3, egg: 3, goat_milk: 3, duck_egg: 3, goose_egg: 3, buffalo_milk: 3, fertile_egg: 3 });
    setWeeklyTaxPaid(0);
    setPriceHistory({
      milk: [5, 5, 5, 5, 5, 5, 5],
      wool: [12, 12, 12, 12, 12, 12, 12],
      cheese: [20, 20, 20, 20, 20, 20, 20],
      scarf: [30, 30, 30, 30, 30, 30, 30],
      egg: [4, 4, 4, 4, 4, 4, 4],
      mayo: [16, 16, 16, 16, 16, 16, 16],
      queijoCoalho: [28, 28, 28, 28, 28, 28, 28],
      queijoMucarela: [28, 28, 28, 28, 28, 28, 28],
      queijoBrie: [65, 65, 65, 65, 65, 65, 65],
      // BUG 14 FIX: removida chave duplicada 'meat'
      carne: [150, 150, 150, 150, 150, 150, 150],
      // BUG FIX: novos produtos incluídos no histórico
      goat_milk: [38, 38, 38, 38, 38, 38, 38],
      llama_wool: [45, 45, 45, 45, 45, 45, 45],
      duck_egg: [18, 18, 18, 18, 18, 18, 18],
      goose_egg: [50, 50, 50, 50, 50, 50, 50],
      buffalo_milk: [55, 55, 55, 55, 55, 55, 55],
      buffalo_mozzarella: [120, 120, 120, 120, 120, 120, 120],
      feather: [15, 15, 15, 15, 15, 15, 15],
      peacock_feather: [80, 80, 80, 80, 80, 80, 80],
      butter: [45, 45, 45, 45, 45, 45, 45],
      yogurt: [35, 35, 35, 35, 35, 35, 35],
      fertile_egg: [36, 36, 36, 36, 36, 36, 36],
      quail_egg: [22, 22, 22, 22, 22, 22, 22],
      alpaca_wool: [65, 65, 65, 65, 65, 65, 65],
      humus: [35, 35, 35, 35, 35, 35, 35],
      muco: [120, 120, 120, 120, 120, 120, 120],
      angora_wool: [90, 90, 90, 90, 90, 90, 90],
      seda_bruta: [100, 100, 100, 100, 100, 100, 100],
      coxa_ra: [110, 110, 110, 110, 110, 110, 110],
      carne_avestruz: [220, 220, 220, 220, 220, 220, 220],
      pena_grande: [90, 90, 90, 90, 90, 90, 90],
      couro_avestruz: [300, 300, 300, 300, 300, 300, 300],
      carne_jacare: [300, 300, 300, 300, 300, 300, 300],
      couro_jacare: [500, 500, 500, 500, 500, 500, 500],
      queijo_cabra: [90, 90, 90, 90, 90, 90, 90],
      iogurte_cabra: [55, 55, 55, 55, 55, 55, 55],
      leite_condensado: [100, 100, 100, 100, 100, 100, 100],
      tapete_lhama: [110, 110, 110, 110, 110, 110, 110],
      cachecol_angora: [160, 160, 160, 160, 160, 160, 160],
      tecido_alpaca: [180, 180, 180, 180, 180, 180, 180],
      fio_seda: [200, 200, 200, 200, 200, 200, 200],
      manta_premium: [420, 420, 420, 420, 420, 420, 420],
      pate_pato: [95, 95, 95, 95, 95, 95, 95],
      ovo_defumado: [120, 120, 120, 120, 120, 120, 120],
      conserva_codorna: [80, 80, 80, 80, 80, 80, 80],
      creme_cosmetico: [220, 220, 220, 220, 220, 220, 220],
      sabonete_natural: [140, 140, 140, 140, 140, 140, 140],
      almofada_penas: [170, 170, 170, 170, 170, 170, 170],
      colete_couro: [550, 550, 550, 550, 550, 550, 550],
      bolsa_exotica: [800, 800, 800, 800, 800, 800, 800],
      enfeite_pavao: [200, 200, 200, 200, 200, 200, 200],
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
    setWeeklyStats({ earnings: 0, spending: 0, milk: 0, wool: 0, oxSold: 0, cheese: 0, scarf: 0, egg: 0, mayo: 0, waterCost: 0, energyCost: 0 });
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
        trait: getRandomTrait(),
        age: 0,
        maxAge: Math.round(120 * (1 + (Math.random() * 0.4 - 0.2)))
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
        trait: getRandomTrait(),
        age: 0,
        maxAge: Math.round(90 * (1 + (Math.random() * 0.4 - 0.2)))
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
        trait: getRandomTrait(),
        age: 0,
        maxAge: Math.round(150 * (1 + (Math.random() * 0.4 - 0.2)))
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
    // Novas funcionalidades F1-F12
    setFarmWisdomBonus({ vaca: 0, ovelha: 0, boi: 0, galinha: 0 });
    setContracts([]);
    setInsurance({ active: false, premium: 50, daysLeft: 0 });
    setLandLots(1);
    setWellLevel(0);
    setSolarLevel(0);
    setIrrigationLevel(0);
    setQueijariaNivel(1);
    setNextDayEvent(null);
    setActiveMarketEvent(null);
    setSpecialization(null);
    setDebt(0);
    setHasTourism(false);
    setNextFairDay(30);
    setFairResults([]);
    setLastEpidemicDay(0);
    setPrestigePoints(0);
    prestigeNotifiedRef.current = [];
    setNextExposicaoDay(45);
    setNextFeiraProdutosDay(33);
    setNextFeiraExoticaDay(60);
    setNextFestivalDay(120);
    setDroughtDaysRemaining(0);
    setWorkers([]);
    setLandBiomes([]);
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

  // BUG FIX: sincroniza sfx.isMuted com o estado persistido ao montar o componente
  useEffect(() => {
    sfx.isMuted = !soundEnabled;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Ref para rastrear conquistas já desbloqueadas sem depender do estado React (evita stale closure e duplos no StrictMode)
  const unlockedAchievementsRef = useRef<string[]>(unlockedAchievements);
  useEffect(() => {
    unlockedAchievementsRef.current = unlockedAchievements;
  }, [unlockedAchievements]);

  // Centralized achievement condition checker
  // BUG 3 FIX: usa ref para verificar conquistas já desbloqueadas ANTES do setState, evitando
  // notificações repetidas causadas por stale closure ou dupla execução do updater no StrictMode.
  const checkAndUnlockAchievement = (id: string) => {
    const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
    if (!ach) return;

    // Verifica via ref (síncrono, sempre atualizado) antes de chamar qualquer setState
    if (unlockedAchievementsRef.current.includes(id)) return;

    // Atualiza o ref imediatamente para bloquear chamadas concorrentes do mesmo id
    unlockedAchievementsRef.current = [...unlockedAchievementsRef.current, id];

    setUnlockedAchievements(prev => {
      if (prev.includes(id)) return prev; // guarda dupla via estado
      const newList = [...prev, id];
      localStorage.setItem('aurora_achievements_save', JSON.stringify(newList));
      return newList;
    });

    // Dispara notificação fora do updater para evitar dupla execução no StrictMode
    setAchievementNotification(current => {
      if (current?.id === id) return current;
      return {
        id: ach.id,
        title: ach.title,
        emoji: ach.emoji,
        description: ach.description
      };
    });
    triggerAudioResult(() => sfx.playSound('levelup'));
  };

  // --- useEconomy hook ---
  // gold/setGold and other economy state are initialized from localStorage in useEconomy.
  const {
    gold,
    setGold,
    debt,
    setDebt,
    dailyEarning,
    setDailyEarning,
    earningsHistory,
    setEarningsHistory,
    weeklySales,
    setWeeklySales,
    weeklyStats,
    setWeeklyStats,
    previousPrices,
    setPreviousPrices,
    priceHistory,
    setPriceHistory,
    merchantActive,
    setMerchantActive,
    daysSinceMerchant,
    setDaysSinceMerchant,
    nextMerchantDay,
    setNextMerchantDay,
    insurance,
    setInsurance,
  } = useEconomy();

  // --- useFarm hook ---
  const {
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
  } = useFarm({ gold, setGold, checkAndUnlockAchievement });

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

  // BUG 1 FIX: advanceDayRef é declarado logo após advanceDay (ver abaixo).
  // Este ref será atribuído ali; o useEffect do auto-avanço o usa aqui.
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const advanceDayRef = useRef<(e: React.MouseEvent) => void>(() => {});

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

  // --- FUNCIONALIDADE 2: Traits dos animais --- (moved to useAnimals hook)

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
        reward: 30,
        expiresOnDay: day + 1,
        completed: false,
        claimed: false,
        missionKey: 'happy_animals'
      }
    ];

    // Randomly add new mission types to the daily pool
    const rand = Math.random();
    if (rand < 0.33) {
      missions.push({
        id: `daily_silk_${day}`,
        title: 'Mestre da Seda',
        description: 'Colete 3 sedas brutas',
        type: 'daily',
        goal: 3,
        current: 0,
        reward: 60,
        expiresOnDay: day + 1,
        completed: false,
        claimed: false,
        missionKey: 'collect_silk'
      });
    } else if (rand < 0.66) {
      missions.push({
        id: `daily_exotic_${day}`,
        title: 'Vendedor Exótico',
        description: 'Venda 1 produto exótico (muco, couro, seda)',
        type: 'daily',
        goal: 1,
        current: 0,
        reward: 50,
        expiresOnDay: day + 1,
        completed: false,
        claimed: false,
        missionKey: 'sell_exotic'
      });
    } else {
      missions.push({
        id: `daily_organic_${day}`,
        title: 'Dia Orgânico',
        description: 'Produza húmus ou muco hoje',
        type: 'daily',
        goal: 1,
        current: 0,
        reward: 40,
        expiresOnDay: day + 1,
        completed: false,
        claimed: false,
        missionKey: 'organic_day'
      });
    }

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

  // feedAnimal moved to useAnimals hook

  // Feed pricing helpers
  const getFeedBasePrice = (type: 'racaoBovina' | 'racaoOvinos' | 'racaoAves' | 'racaoAquatica' | 'racaoCoelho' | 'racaoCarnivora'): number => {
    if (type === 'racaoBovina') return 3;
    if (type === 'racaoOvinos') return 3;
    if (type === 'racaoAves') return 2;
    if (type === 'racaoAquatica') return 4;
    if (type === 'racaoCoelho') return 2;
    if (type === 'racaoCarnivora') return 6;
    return 2;
  };

  const getFeedPriceWithModifiers = (type: 'racaoBovina' | 'racaoOvinos' | 'racaoAves' | 'racaoAquatica' | 'racaoCoelho' | 'racaoCarnivora', day = currentDay): number => {
    let base = getFeedBasePrice(type);

    // Desconto de 10% no nível 4 ou superior
    if (farmLevel >= 4) {
      base = Math.max(1, Math.round(base * 0.9));
    }

    // Desconto de especialização: -10% para animais focados na especialização
    const specFeedDiscount =
      (specialization === 'leiteira' && type === 'racaoBovina') ? 0.9 :
      (specialization === 'fibras' && type === 'racaoOvinos') ? 0.9 :
      (specialization === 'avicultura' && (type === 'racaoAves' || type === 'racaoAquatica')) ? 0.9 : 1.0;
    base = Math.max(1, Math.round(base * specFeedDiscount));

    // F8: desconto do poço d'água (10% por nível)
    if (wellLevel > 0) {
      base = Math.max(1, Math.round(base * (1 - wellLevel * 0.1)));
    }

    const estacao = getEstacaoKey(day);
    if (estacao === 'inverno') {
      return Math.max(1, Math.round(base * 1.5));
    }
    return base;
  };

  // Buy feed packages with bulk discounts
  const buyFeed = (
    type: 'racaoBovina' | 'racaoOvinos' | 'racaoAves' | 'racaoAquatica' | 'racaoCoelho' | 'racaoCarnivora',
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
    // Silo de grãos: 15% desconto em todas as compras de ração
    if (hasSilo) {
      totalCost = Math.floor(totalCost * 0.85);
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
    
    const feedLabel = type === 'racaoBovina' ? 'Ração Bovina 🌾' : type === 'racaoOvinos' ? 'Ração de Ovinos 🐐' : type === 'racaoAves' ? 'Ração de Aves 🐔' : type === 'racaoAquatica' ? 'Ração Aquática 🦆' : type === 'racaoCoelho' ? 'Ração de Coelhos 🐰' : 'Ração Carnívora 🍖';
    addLog(`🛍️ Compra realizada: +${quantity}u de ${feedLabel} por ${totalCost} moedas!`, 'success');
    triggerAudioResult(() => sfx.playSound('click'));
    spawnFeedback('🌽', `-${totalCost}💰`, event);
  };



  // Prices for animals based on level 4 discount
  // getAnimalPurchasePrice moved to useAnimals hook

  // Estação key helper
  const getEstacaoKey = (day: number): 'primavera' | 'verao' | 'outono' | 'inverno' => {
    const idx = Math.floor(((day - 1) % 120) / 30);
    if (idx === 0) return 'primavera';
    if (idx === 1) return 'verao';
    if (idx === 2) return 'outono';
    return 'inverno';
  };

  // Returns life phase info for an animal
  const getLifePhase = (animal: { age?: number; maxAge?: number; isAdult?: boolean; adulthoodDay?: number }): {
    phase: 'filhote' | 'juvenil' | 'adulto_jovem' | 'adulto' | 'idoso' | 'muito_idoso';
    label: string;
    emoji: string;
    prodMult: number; // production multiplier for this phase
    color: string;
  } => {
    if (animal.isAdult === false) return { phase: 'filhote', label: 'Filhote', emoji: '🐣', prodMult: 0, color: 'bg-yellow-100 border-yellow-300 text-yellow-800' };
    if (!animal.age || !animal.maxAge) return { phase: 'adulto', label: 'Adulto', emoji: '⭐', prodMult: 1.0, color: 'bg-blue-100 border-blue-300 text-blue-800' };
    const ratio = animal.age / animal.maxAge;
    if (ratio < 0.15) return { phase: 'juvenil', label: 'Juvenil', emoji: '🌱', prodMult: 0.6, color: 'bg-lime-100 border-lime-300 text-lime-800' };
    if (ratio < 0.50) return { phase: 'adulto_jovem', label: 'Adulto Jovem', emoji: '⭐', prodMult: 1.1, color: 'bg-emerald-100 border-emerald-300 text-emerald-800' };
    if (ratio < 0.75) return { phase: 'adulto', label: 'Adulto', emoji: '🐄', prodMult: 1.0, color: 'bg-blue-100 border-blue-300 text-blue-800' };
    if (ratio < 0.90) return { phase: 'idoso', label: 'Idoso', emoji: '🧓', prodMult: 0.7, color: 'bg-orange-100 border-orange-300 text-orange-800' };
    return { phase: 'muito_idoso', label: 'Muito Idoso', emoji: '☠️', prodMult: 0.4, color: 'bg-red-100 border-red-300 text-red-800' };
  };

  // F6: multiplicadores sazonais de preço
  const getSeasonalityMultiplier = (itemType: string, day: number): number => {
    const estacao = getEstacaoKey(day);
    // --- LATICÍNIOS (leite, manteiga, iogurte, leite condensado) ---
    const laticinios = new Set(['milk','goat_milk','buffalo_milk','butter','yogurt','iogurte_cabra','leite_condensado']);
    if (laticinios.has(itemType)) {
      if (estacao === 'primavera') return 1.1;
      if (estacao === 'verao') return 1.2;
      return 1.0;
    }
    // --- QUEIJOS ---
    const queijos = new Set(['cheese','queijoCoalho','queijoMucarela','queijoBrie','queijo_cabra','buffalo_mozzarella']);
    if (queijos.has(itemType)) {
      if (estacao === 'verao') return 1.1;
      if (estacao === 'outono') return 1.2;
      return 1.0;
    }
    // --- LÃS E FIBRAS (ovelha, lhama, alpaca, angorá, seda) ---
    const las = new Set(['wool','llama_wool','alpaca_wool','angora_wool','seda_bruta','fio_seda','tecido_alpaca','cachecol_angora','tapete_lhama','manta_premium']);
    if (las.has(itemType)) {
      if (estacao === 'outono') return 1.15;
      if (estacao === 'inverno') return 1.35;
      if (estacao === 'verao') return 0.85;
      return 1.0;
    }
    // --- CACHECOL / ARTIGOS DE INVERNO ---
    if (itemType === 'scarf') {
      if (estacao === 'inverno') return 1.4;
      if (estacao === 'verao') return 0.7;
      return 1.0;
    }
    // --- OVOS (todas as aves) ---
    const ovos = new Set(['egg','duck_egg','goose_egg','quail_egg','fertile_egg','ovo_defumado','conserva_codorna']);
    if (ovos.has(itemType)) {
      if (estacao === 'primavera') return 1.2;
      if (estacao === 'inverno') return 0.75;
      return 1.0;
    }
    // --- MAIONESE / PÂTÉ ---
    if (itemType === 'mayo' || itemType === 'pate_pato') {
      if (estacao === 'verao') return 1.15;
      return 1.0;
    }
    // --- MEL E PRODUTOS DA FLORESTA ---
    if (itemType === 'mel' || itemType === 'mel_envasado' || itemType === 'hidromel') {
      if (estacao === 'verao') return 1.3;
      if (estacao === 'primavera') return 1.1;
      return 1.0;
    }
    if (itemType === 'cogumelo' || itemType === 'risoto_cogumelo' || itemType === 'sopa_cogumelo') {
      if (estacao === 'outono') return 1.3;
      if (estacao === 'inverno') return 1.15;
      return 1.0;
    }
    // --- PEIXE ---
    if (itemType === 'peixe' || itemType === 'conserva_peixe') {
      if (estacao === 'verao') return 1.2;
      if (estacao === 'inverno') return 0.9;
      return 1.0;
    }
    // --- EXÓTICOS (carne, couro, muco, penas) ---
    const exoticos = new Set(['coxa_ra','carne_avestruz','couro_avestruz','carne_jacare','couro_jacare','muco','feather','peacock_feather','pena_grande','bolsa_exotica','colete_couro','creme_cosmetico','sabonete_natural']);
    if (exoticos.has(itemType)) {
      if (estacao === 'verao') return 1.1;
      if (estacao === 'inverno') return 0.9;
      return 1.0;
    }
    return 1.0;
  };

  const getWeatherMultiplier = (itemType: string, currentW: 'chuva' | 'sol' | 'nublado'): number => {
    if (currentW === 'chuva') {
      const laticinios = new Set(['milk','goat_milk','buffalo_milk','butter','yogurt','iogurte_cabra','leite_condensado']);
      if (laticinios.has(itemType)) return 0.9;
      const las = new Set(['wool','llama_wool','alpaca_wool','angora_wool']);
      if (las.has(itemType)) return 0.8;
      const ovos = new Set(['egg','duck_egg','goose_egg','quail_egg','fertile_egg']);
      if (ovos.has(itemType)) return 0.9;
      if (itemType === 'mel' || itemType === 'mel_envasado') return 0.85;
      if (itemType === 'cogumelo') return 1.2; // cogumelo cresce na chuva
    } else if (currentW === 'sol') {
      const laticinios = new Set(['milk','goat_milk','buffalo_milk']);
      if (laticinios.has(itemType)) return 1.1;
      const ovos = new Set(['egg','duck_egg','quail_egg']);
      if (ovos.has(itemType)) return 1.1;
      if (itemType === 'mel' || itemType === 'mel_envasado') return 1.15;
      if (itemType === 'peixe') return 1.1;
    }
    return 1.0;
  };

  // Base raw item prices (increases with levels)
  const getItemBaseSellPrice = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie' | 'goat_milk' | 'llama_wool' | 'duck_egg' | 'goose_egg' | 'buffalo_milk' | 'buffalo_mozzarella' | 'feather' | 'peacock_feather' | 'butter' | 'yogurt' | 'fertile_egg' | 'quail_egg' | 'alpaca_wool' | 'humus' | 'muco' | 'angora_wool' | 'seda_bruta' | 'coxa_ra' | 'carne_avestruz' | 'pena_grande' | 'couro_avestruz' | 'carne_jacare' | 'couro_jacare' | 'queijo_cabra' | 'iogurte_cabra' | 'leite_condensado' | 'tapete_lhama' | 'cachecol_angora' | 'tecido_alpaca' | 'fio_seda' | 'manta_premium' | 'pate_pato' | 'ovo_defumado' | 'conserva_codorna' | 'creme_cosmetico' | 'sabonete_natural' | 'almofada_penas' | 'colete_couro' | 'bolsa_exotica' | 'enfeite_pavao'): number => {
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
      return 28;
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
      return farmLevel >= 5 ? 5 : 4;
    }
    if (itemType === 'mayo') {
      return 16;
    }
    if (itemType === 'goat_milk') return farmLevel >= 4 ? 42 : 38;
    if (itemType === 'llama_wool') return 45;
    if (itemType === 'duck_egg') return farmLevel >= 5 ? 22 : 18;
    if (itemType === 'goose_egg') return 50;
    if (itemType === 'buffalo_milk') return farmLevel >= 6 ? 62 : 55;
    if (itemType === 'buffalo_mozzarella') return 120;
    if (itemType === 'feather') return 15;
    if (itemType === 'peacock_feather') return 80;
    if (itemType === 'butter') return 45;
    if (itemType === 'yogurt') return 35;
    if (itemType === 'fertile_egg') return 36;
    if (itemType === 'quail_egg') return farmLevel >= 5 ? 26 : 22;
    if (itemType === 'alpaca_wool') return farmLevel >= 6 ? 75 : 65;
    if (itemType === 'humus') return 20;
    if (itemType === 'muco') return 120;
    if (itemType === 'angora_wool') return 90;
    if (itemType === 'seda_bruta') return 100;
    if (itemType === 'coxa_ra') return 110;
    if (itemType === 'carne_avestruz') return 220;
    if (itemType === 'pena_grande') return 90;
    if (itemType === 'couro_avestruz') return 300;
    if (itemType === 'carne_jacare') return 300;
    if (itemType === 'couro_jacare') return 500;
    if (itemType === 'queijo_cabra') return 90;
    if (itemType === 'iogurte_cabra') return 55;
    if (itemType === 'leite_condensado') return 100;
    if (itemType === 'tapete_lhama') return 110;
    if (itemType === 'cachecol_angora') return 160;
    if (itemType === 'tecido_alpaca') return 180;
    if (itemType === 'fio_seda') return 200;
    if (itemType === 'manta_premium') return 420;
    if (itemType === 'pate_pato') return 95;
    if (itemType === 'ovo_defumado') return 120;
    if (itemType === 'conserva_codorna') return 80;
    if (itemType === 'creme_cosmetico') return 220;
    if (itemType === 'sabonete_natural') return 140;
    if (itemType === 'almofada_penas') return 170;
    if (itemType === 'colete_couro') return 550;
    if (itemType === 'bolsa_exotica') return 800;
    if (itemType === 'enfeite_pavao') return 200;
    if ((itemType as string) === 'peixe') return 45;
    if ((itemType as string) === 'mel') return 80;
    if ((itemType as string) === 'cogumelo') return 35;
    if ((itemType as string) === 'hidromel') return 180;
    if ((itemType as string) === 'risoto_cogumelo') return 120;
    if ((itemType as string) === 'conserva_peixe') return 95;
    if ((itemType as string) === 'mel_envasado') return 200;
    if ((itemType as string) === 'sopa_cogumelo') return 80;
    return 0;
  };

  // Keep 1 decimal place precision for display
  const getDynamicPrice = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie' | 'goat_milk' | 'llama_wool' | 'duck_egg' | 'goose_egg' | 'buffalo_milk' | 'buffalo_mozzarella' | 'feather' | 'peacock_feather' | 'butter' | 'yogurt' | 'fertile_egg' | 'quail_egg' | 'alpaca_wool' | 'humus' | 'muco' | 'angora_wool' | 'seda_bruta' | 'coxa_ra' | 'carne_avestruz' | 'pena_grande' | 'couro_avestruz' | 'carne_jacare' | 'couro_jacare' | 'queijo_cabra' | 'iogurte_cabra' | 'leite_condensado' | 'tapete_lhama' | 'cachecol_angora' | 'tecido_alpaca' | 'fio_seda' | 'manta_premium' | 'pate_pato' | 'ovo_defumado' | 'conserva_codorna' | 'creme_cosmetico' | 'sabonete_natural' | 'almofada_penas' | 'colete_couro' | 'bolsa_exotica' | 'enfeite_pavao', d = currentDay, w = weather, sales = weeklySales): number => {
    const base = getItemBaseSellPrice(itemType);
    const weekSales2 = (sales[itemType as keyof typeof sales] || 0);
    let offerMult2: number;
    if (weekSales2 === 0) offerMult2 = 1.15;
    else if (weekSales2 < 5) offerMult2 = 1.05;
    else offerMult2 = Math.max(0.6, 1 - weekSales2 / 100);
    const seasonMult = getSeasonalityMultiplier(itemType, d);
    const weatherMult = getWeatherMultiplier(itemType, w);
    const marketBonus2 = activeMarketEvent && activeMarketEvent.items.includes(itemType) ? activeMarketEvent.mult : 1.0;
    let finalPrice = base * offerMult2 * seasonMult * weatherMult * marketBonus2;
    if (merchantActive) {
      finalPrice *= 1.5;
    }
    if (farmLevel > 5) {
      // Reputação: +5% por nível 6-10, +3% por nível 11-20
      const bonusPct = farmLevel <= 10
        ? (farmLevel - 5) * 0.05
        : 0.25 + (farmLevel - 10) * 0.03;
      finalPrice *= (1.0 + bonusPct);
    }
    // Pavão price bonus: +3% with 1 pavão (happiness>=80), +5% with 2+ (happiness>=80)
    // BUG FIX: bônus só conta pavões com happiness >= 80, conforme especificação
    const pavaoCount = animals.filter(a => a.type === 'pavao' && a.happiness >= 80).length;
    if (pavaoCount >= 2) finalPrice *= 1.05;
    else if (pavaoCount === 1) finalPrice *= 1.03;
    // Prestige bonus: +5% at 300 pts
    if (prestigePoints >= 300) finalPrice *= 1.05;
    return Math.max(1, Math.round(finalPrice * 10) / 10);
  };

  // Rounded to nearest integer for actual gold conversion
  const getDynamicTransactionPrice = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie' | 'goat_milk' | 'llama_wool' | 'duck_egg' | 'goose_egg' | 'buffalo_milk' | 'buffalo_mozzarella' | 'feather' | 'peacock_feather' | 'butter' | 'yogurt' | 'fertile_egg' | 'quail_egg' | 'alpaca_wool' | 'humus' | 'muco' | 'angora_wool' | 'seda_bruta' | 'coxa_ra' | 'carne_avestruz' | 'pena_grande' | 'couro_avestruz' | 'carne_jacare' | 'couro_jacare' | 'queijo_cabra' | 'iogurte_cabra' | 'leite_condensado' | 'tapete_lhama' | 'cachecol_angora' | 'tecido_alpaca' | 'fio_seda' | 'manta_premium' | 'pate_pato' | 'ovo_defumado' | 'conserva_codorna' | 'creme_cosmetico' | 'sabonete_natural' | 'almofada_penas' | 'colete_couro' | 'bolsa_exotica' | 'enfeite_pavao', d = currentDay, w = weather, sales = weeklySales): number => {
    const base = getItemBaseSellPrice(itemType);
    // Oferta: cada unidade vendida reduz 1%; demanda reprimida se vendeu <5 unidades (+5% a +15%)
    const weekSales = (sales[itemType as keyof typeof sales] || 0);
    let offerMult: number;
    if (weekSales === 0) offerMult = 1.15;
    else if (weekSales < 5) offerMult = 1.05;
    else offerMult = Math.max(0.6, 1 - weekSales / 100);
    const seasonMult = getSeasonalityMultiplier(itemType, d);
    const weatherMult = getWeatherMultiplier(itemType, w);
    // Produtos processados vinculados ao preço do ingrediente base
    let processedLinkMult = 1.0;
    const milkSeasonMult = getSeasonalityMultiplier('milk', d);
    const woolSeasonMult = getSeasonalityMultiplier('wool', d);
    const eggSeasonMult = getSeasonalityMultiplier('egg', d);
    const queijos = new Set(['cheese','queijoCoalho','queijoMucarela','queijoBrie','queijo_cabra','buffalo_mozzarella','iogurte_cabra','leite_condensado','butter','yogurt']);
    const tecidos = new Set(['scarf','tapete_lhama','cachecol_angora','tecido_alpaca','manta_premium']);
    const ovosProc = new Set(['mayo','ovo_defumado','conserva_codorna','pate_pato','fertile_egg']);
    if (queijos.has(itemType)) processedLinkMult = 0.5 + milkSeasonMult * 0.5;
    else if (tecidos.has(itemType)) processedLinkMult = 0.5 + woolSeasonMult * 0.5;
    else if (ovosProc.has(itemType)) processedLinkMult = 0.5 + eggSeasonMult * 0.5;
    // Raridade premium: itens vendidos em baixo volume têm bônus de raridade
    const RARE_ITEMS = new Set(['couro_jacare','carne_jacare','muco','seda_bruta','angora_wool','bolsa_exotica','colete_couro','manta_premium']);
    const rarityMult = RARE_ITEMS.has(itemType) && weekSales <= 2 ? 1.1 : 1.0;
    // Evento de mercado ativo
    const marketBonus = activeMarketEvent && activeMarketEvent.items.includes(itemType) ? activeMarketEvent.mult : 1.0;
    let finalPrice = base * offerMult * seasonMult * weatherMult * processedLinkMult * rarityMult * marketBonus;
    if (merchantActive) {
      finalPrice *= 1.5;
    }
    if (farmLevel > 5) {
      // Reputação: +5% por nível 6-10, +3% por nível 11-20
      const bonusPct = farmLevel <= 10
        ? (farmLevel - 5) * 0.05
        : 0.25 + (farmLevel - 10) * 0.03;
      finalPrice *= (1.0 + bonusPct);
    }
    // Pavão price bonus: +3% with 1 pavão (happiness>=80), +5% with 2+ (happiness>=80)
    // BUG FIX: bônus só conta pavões com happiness >= 80, conforme especificação
    const pavaoCount = animals.filter(a => a.type === 'pavao' && a.happiness >= 80).length;
    if (pavaoCount >= 2) finalPrice *= 1.05;
    else if (pavaoCount === 1) finalPrice *= 1.03;
    // Prestígio 300+: +5% permanente nos preços
    if (prestigePoints >= 300) finalPrice *= 1.05;
    // Certificado Sanitário: +10% para produtos de carne
    const meatItems = ['coxa_ra', 'carne_avestruz', 'carne_jacare'] as string[];
    if (hasCertSanitario && meatItems.includes(itemType as string)) finalPrice *= 1.1;
    return Math.max(1, Math.round(finalPrice));
  };

  // Final processed sell prices including dynamic pricing equations
  const COMERCIANTE_BONUS_ITEMS = new Set(['milk','wool','egg','goat_milk','llama_wool','duck_egg','goose_egg','buffalo_milk','quail_egg','alpaca_wool','humus','muco','angora_wool','seda_bruta','coxa_ra','carne_avestruz','couro_avestruz','carne_jacare','couro_jacare','feather','peacock_feather']);
  const getActualSellPrice = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie' | 'goat_milk' | 'llama_wool' | 'duck_egg' | 'goose_egg' | 'buffalo_milk' | 'buffalo_mozzarella' | 'feather' | 'peacock_feather' | 'butter' | 'yogurt' | 'fertile_egg' | 'quail_egg' | 'alpaca_wool' | 'humus' | 'muco' | 'angora_wool' | 'seda_bruta' | 'coxa_ra' | 'carne_avestruz' | 'pena_grande' | 'couro_avestruz' | 'carne_jacare' | 'couro_jacare' | 'queijo_cabra' | 'iogurte_cabra' | 'leite_condensado' | 'tapete_lhama' | 'cachecol_angora' | 'tecido_alpaca' | 'fio_seda' | 'manta_premium' | 'pate_pato' | 'ovo_defumado' | 'conserva_codorna' | 'creme_cosmetico' | 'sabonete_natural' | 'almofada_penas' | 'colete_couro' | 'bolsa_exotica' | 'enfeite_pavao'): number => {
    const base = getDynamicTransactionPrice(itemType);
    const hasComercianteBonus = workers.some(w => w.role === 'comerciante_residente') && COMERCIANTE_BONUS_ITEMS.has(itemType);
    return hasComercianteBonus ? Math.round(base * 1.08) : base;
  };

  const getTrendIconAndColor = (itemType: 'milk' | 'wool' | 'cheese' | 'scarf' | 'egg' | 'mayo' | 'queijoCoalho' | 'queijoMucarela' | 'queijoBrie' | 'goat_milk' | 'llama_wool' | 'duck_egg' | 'goose_egg' | 'buffalo_milk' | 'buffalo_mozzarella' | 'feather' | 'peacock_feather' | 'carne') => {
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
  // collectMilk...collectAvestruzPena moved to useAnimals hook

  // sellAvestruz, sellJacare, sellOx, getCarneMultiplier, calculateBoiValue, getAnimalFeedType, buyAnimal moved to useAnimals hook

  // --- useInventory hook (placeholder animals/setAnimals/getRandomTrait will be overridden by useAnimals below) ---
  const {
    inventory,
    setInventory,
    productFreshness,
    setProductFreshness,
    queijosEmMaturacao,
    setQueijosEmMaturacao,
    maxPrateleiras,
    setMaxPrateleiras,
    totalQueijosFabricados,
    setTotalQueijosFabricados,
    queijosFabricadosTipos,
    setQueijosFabricadosTipos,
    queijariaNivel,
    setQueijariaNivel,
    atelieTab,
    setAtelieTab,
    racaoOrganicaDays,
    setRacaoOrganicaDays,
    fertilizanteDays,
    setFertilizanteDays,
    craftBuffaloMozzarella,
    craftMayonese,
    craftButter,
    craftYogurt,
    craftQueijoCabra,
    craftIogurteCabra,
    craftLeiteCondensado,
    craftTapeteLhama,
    craftCachecolAngora,
    craftTecidoAlpaca,
    craftFioSeda,
    craftMantaPremium,
    craftPatePato,
    craftOvoDefumado,
    craftConservaCodorna,
    craftCremeCosmetico,
    craftSaboneteNatural,
    craftRacaoOrganica,
    craftFertilizante,
    craftAlmofadaPenas,
    craftColeteCouro,
    craftBolsaExotica,
    craftEnfeitePavao,
    craftCheese,
    craftQueijo,
    craftScarf,
    craftHidromel,
    craftRisotoCogumelo,
    craftConservaPeixe,
    craftMelEnvasado,
    craftSopaCogumelo,
    sellProduct,
    sellAllItemsNoConfirm,
    buyFolhaAmoreira,
  } = useInventory({
    gold,
    setGold,
    farmLevel,
    setFarmXp,
    setStats,
    setWeeklyStats,
    setWeeklySales,
    setContracts,
    setDailyEarning,
    merchantActive,
    getActualSellPrice,
    getDynamicTransactionPrice,
    soundEnabled,
    addLog,
    addNotification,
    spawnFeedback,
    triggerAudioResult,
    updateMissionProgress,
  });

  // --- useAnimals hook ---
  const {
    animals,
    setAnimals,
    licencaExotica,
    setLicencaExotica,
    coelhoReproCount,
    setCoelhoReproCount,
    getRandomTrait,
    getTraitInfo,
    getAnimalFeedType,
    getAnimalPurchasePrice,
    getCarneMultiplier,
    calculateBoiValue,
    calcFairScore,
    feedAnimal,
    collectEgg,
    collectGoatMilk,
    collectLlamaWool,
    collectDuckEgg,
    collectGooseProduct,
    collectBuffaloMilk,
    collectMilk,
    collectWool,
    collectAlpacaWool,
    collectCoelhoWool,
    collectRa,
    collectAvestruzPena,
    sellAvestruz,
    sellJacare,
    sellOx,
    buyAnimal,
    buyAnimalFilhote,
  } = useAnimals({
    gold,
    setGold,
    farmLevel,
    setFarmXp,
    inventory,
    setInventory,
    setStats,
    setWeeklyStats,
    setWeeklySales,
    setProductFreshness,
    setDailyEarning,
    setMissions,
    debt,
    landLots,
    specialization,
    farmWisdomBonus,
    weather,
    currentDay,
    merchantActive,
    weeklySales,
    soundEnabled,
    addLog,
    addNotification,
    spawnFeedback,
    triggerAudioResult,
    updateMissionProgress,
    checkAndUnlockAchievement,
    triggerConfetti,
    onFilhoteBought: (type: AnimalType, name: string) => {
      setReproHistory(prev => [{ day: currentDay, animalType: type, name, method: 'filhote' }, ...prev].slice(0, 50));
    },
  });

  // --- useFairs hook ---
  const {
    nextFairDay,
    setNextFairDay,
    fairResults,
    setFairResults,
    prestigePoints,
    setPrestigePoints,
    nextExposicaoDay,
    setNextExposicaoDay,
    nextFeiraProdutosDay,
    setNextFeiraProdutosDay,
    nextFeiraExoticaDay,
    setNextFeiraExoticaDay,
    nextFestivalDay,
    setNextFestivalDay,
    prestigeNotifiedRef,
  } = useFairs({ addNotification });

  // Monitor states to unlock achievements dynamically
  useEffect(() => {
    if (currentScreen === 'game') {
      triggerAchievementCheck(stats, gold, farmLevel, animals);
    }
  }, [stats, gold, farmLevel, animals, currentScreen, totalQueijosFabricados, queijosFabricadosTipos]);

  // --- FUNCIONALIDADE 1: Auto-avanço useEffect ---
  // isGameOver derivado antecipado para uso no useEffect de auto-avanço (galinha = 60 moedas base)
  // BUG FIX: usa 60 como referência correta (preço base da galinha sem especialização/nível)
  const isGameOverForAutoAdvance = (animals.length === 0 && gold < 60) || debt > 1000;

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

  // Sync log scrollbar — scroll only inside the logs container, not the whole page
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Persist State Updates Automatically to LocalStorage
  useEffect(() => {
    // Prevent wiping save if loaded empty
    if (animals.length > 0 || currentDay > 1 || gold !== 80) {
      const saveData = {
        gold,
        currentDay,
        farmLevel,
        farmXp,
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
        queijariaNivel,
        nextDayEvent,
        activeMarketEvent,
        hasStable,
        hasSilo,
        hasFridge,
        hasTipBox,
        productFreshness,
        specialization,
        debt,
        hasTourism,
        nextFairDay,
        fairResults,
        lastEpidemicDay,
        droughtDaysRemaining,
        licencaExotica,
        coelhoReproCount,
        racaoOrganicaDays,
        fertilizanteDays,
        prestigePoints,
        nextExposicaoDay,
        nextFeiraProdutosDay,
        nextFeiraExoticaDay,
        nextFestivalDay,
        workers,
        landBiomes,
        hasBebedouro,
        hasCertSanitario,
        licencaCriadouro,
        reproducaoAtiva,
        biomeWeeklyIncome,
        reproHistory,
      };
      localStorage.setItem('aurora_farm_save', JSON.stringify(saveData));
    }
  // BUG FIX: adicionados farmWisdomBonus, contracts, insurance, landLots, wellLevel, solarLevel, irrigationLevel, queijariaNivel nas dependências
  }, [gold, currentDay, farmLevel, farmXp, inventory, animals, stats, merchantActive, daysSinceMerchant, nextMerchantDay, logs, weeklyStats, weeklySales, previousPrices, machines, priceHistory, queijosEmMaturacao, maxPrateleiras, totalQueijosFabricados, queijosFabricadosTipos, earningsHistory, allTimeStats, missions, notifications, farmWisdomBonus, contracts, insurance, landLots, wellLevel, solarLevel, irrigationLevel, queijariaNivel, nextDayEvent, activeMarketEvent, hasStable, hasSilo, hasFridge, hasTipBox, productFreshness, specialization, debt, hasTourism, nextFairDay, fairResults, lastEpidemicDay, droughtDaysRemaining, licencaExotica, coelhoReproCount, racaoOrganicaDays, fertilizanteDays, prestigePoints, nextExposicaoDay, nextFeiraProdutosDay, nextFeiraExoticaDay, nextFestivalDay, workers, landBiomes, hasBebedouro, hasCertSanitario, licencaCriadouro, reproducaoAtiva, biomeWeeklyIncome, reproHistory]);

  const buyMachine = (machineKey: 'milker' | 'shearer' | 'feeder') => {
    let price = 2500;
    let reqLevel = 6;
    let label = "";
    if (machineKey === 'shearer') { price = 2000; reqLevel = 5; label = "Tosquiadeira Elétrica"; }
    else if (machineKey === 'feeder') { price = 1500; reqLevel = 4; label = "Alimentador Automático"; }
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
    setFarmXp(prev => prev + 15);
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
  // F9: desconto do gerador solar (15% por nível)
  const getCustoManutencaoMaquinas = (level: number) => {
    const base = 4 + 2 * level;
    const solarDiscount = 1 - Math.min(solarLevel * 0.15, 0.45);
    // Lhama passive: -5% per llama, max -15%
    const llamaCount = animals.filter(a => a.type === 'lhama').length;
    const llamaDiscount = 1 - Math.min(llamaCount * 0.05, 0.15);
    return Math.max(1, Math.round(base * solarDiscount * llamaDiscount));
  };

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
        let feedType: 'racaoBovina' | 'racaoOvinos' | 'racaoAves' | 'racaoAquatica' | 'racaoCoelho' | 'racaoCarnivora' = 'racaoBovina';
        let feedLabel = 'Ração Bovina';
        if (a.type === 'vaca' || a.type === 'boi' || a.type === 'bufalo') { feedType = 'racaoBovina'; feedLabel = 'Ração Bovina'; }
        else if (a.type === 'ovelha' || a.type === 'cabra' || a.type === 'lhama' || a.type === 'alpaca') { feedType = 'racaoOvinos'; feedLabel = 'Ração de Ovinos'; }
        else if (a.type === 'galinha' || a.type === 'codorna' || a.type === 'pavao') { feedType = 'racaoAves'; feedLabel = 'Ração de Aves'; }
        else if (a.type === 'pato' || a.type === 'ganso') { feedType = 'racaoAquatica'; feedLabel = 'Ração Aquática'; }
        else if (a.type === 'coelho_angora') { feedType = 'racaoCoelho'; feedLabel = 'Ração de Coelhos'; }
        else if (a.type === 'ra' || a.type === 'avestruz' || a.type === 'jacare') { feedType = 'racaoCarnivora'; feedLabel = 'Ração Carnívora'; }
        
        if ((nextInv[feedType] ?? 0) >= 1) {
          nextInv[feedType] -= 1;
          statsCollected.fedCount++;
          return {
            ...a,
            hunger: Math.min(100, a.hunger + 35),
            happiness: Math.min(100, a.happiness + 12),
            // BUG FIX: reseta contador de dias sem comida ao alimentar via alimentador automático
            daysWithoutFood: 0
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
    logs: { msg: string; type: LogMessage['type'] }[],
    dayForSeason: number = currentDay
  ) => {
    return animalsList.map(animal => {
      const copy = { ...animal };

      // Animals that don't eat: skip hunger processing
      const noHungerTypes = ['minhoca', 'caracol'];
      const skipHunger = noHungerTypes.includes(copy.type);

      // Perda de fome diária: 12 + random 0-7 (gulosa consome +20%)
      const baseHungerLoss = 12 + Math.floor(Math.random() * 8);
      const hungerLoss = copy.trait === 'gulosa' ? Math.round(baseHungerLoss * 1.2) : baseHungerLoss;
      if (!skipHunger) copy.hunger = Math.max(0, copy.hunger - hungerLoss);

      // Regras de felicidade baseadas na fome:
      if (copy.hunger < 30) {
        copy.happiness = Math.max(0, copy.happiness - 10);
      } else if (copy.hunger > 70) {
        copy.happiness = Math.min(100, copy.happiness + 3);
      }

      // Decaimento natural leve de felicidade
      copy.happiness = Math.max(0, copy.happiness - 2);

      // Penalidade extra de fome extrema (BUG 6 FIX)
      if (!skipHunger && copy.hunger <= 0) {
        // Incrementa dias consecutivos sem comida
        copy.daysWithoutFood = (copy.daysWithoutFood ?? 0) + 1;
        // Penalidade de felicidade: -25/dia após 3 dias consecutivos, senão -15/dia
        const starvePenalty = copy.daysWithoutFood >= 3 ? 25 : 15;
        copy.happiness = Math.max(0, copy.happiness - starvePenalty);
        logs.push({
          msg: `⚠️ ${copy.name} está passando fome! Alimente urgente!`,
          type: 'error'
        });
      } else {
        // Reset contador se comeu hoje
        copy.daysWithoutFood = 0;
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

      // IMPROVEMENT 9: Sick animals produce 50% less (50% chance to skip production)
      const sickProductionBlock = copy.isSick && Math.random() < 0.5;

      // Atualizações de produção baseadas nas espécies
      if (copy.type === 'vaca') {
        const ageRatio = (copy.age && copy.maxAge) ? copy.age / copy.maxAge : 0.5;
        const basePhaseMult = ageRatio < 0.15 ? 0.6 : ageRatio < 0.50 ? 1.1 : ageRatio < 0.75 ? 1.0 : ageRatio < 0.90 ? 0.7 : 0.4;
        const adjustedPhaseMult = Math.min(1.15, basePhaseMult + (copy.isVeteran ? 0.05 : 0) + (copy.juvenileBonus || 0));
        const lifePhaseBlock = adjustedPhaseMult < 1.0 && Math.random() > adjustedPhaseMult;
        const canProduce = copy.isAdult !== false && copy.hunger > 25 && copy.happiness > 30 && !sickProductionBlock && !lifePhaseBlock;
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
        const ageRatio = (copy.age && copy.maxAge) ? copy.age / copy.maxAge : 0.5;
        const basePhaseMult = ageRatio < 0.15 ? 0.6 : ageRatio < 0.50 ? 1.1 : ageRatio < 0.75 ? 1.0 : ageRatio < 0.90 ? 0.7 : 0.4;
        const adjustedPhaseMult = Math.min(1.15, basePhaseMult + (copy.isVeteran ? 0.05 : 0) + (copy.juvenileBonus || 0));
        const lifePhaseBlock = adjustedPhaseMult < 1.0 && Math.random() > adjustedPhaseMult;
        const canProduce = copy.isAdult !== false && copy.hunger > 25 && copy.happiness > 30 && !sickProductionBlock && !lifePhaseBlock;
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
      else if (copy.type === 'cabra') {
        // Lactation cycle management
        if (copy.isLactating) {
          copy.lactationCycle = (copy.lactationCycle ?? 0) + 1;
          if ((copy.lactationCycle ?? 0) >= 20) {
            copy.isLactating = false;
            copy.lactationCycle = 15;
            copy.hasProducedToday = false; // BUG FIX: garante que o botão de coleta fique desabilitado imediatamente ao entrar na secagem
            logs.push({ msg: `🐐 ${copy.name} entrou no período de secagem (15 dias).`, type: 'info' });
          } else {
            const ageRatioGoat = (copy.age && copy.maxAge) ? copy.age / copy.maxAge : 0.5;
            const basePhaseMultGoat = ageRatioGoat < 0.15 ? 0.6 : ageRatioGoat < 0.50 ? 1.1 : ageRatioGoat < 0.75 ? 1.0 : ageRatioGoat < 0.90 ? 0.7 : 0.4;
            const adjustedPhaseMultGoat = Math.min(1.15, basePhaseMultGoat + (copy.isVeteran ? 0.05 : 0) + (copy.juvenileBonus || 0));
            const lifePhaseBlockGoat = adjustedPhaseMultGoat < 1.0 && Math.random() > adjustedPhaseMultGoat;
            const canProduce = copy.hunger > 25 && copy.happiness > 30 && !sickProductionBlock && !lifePhaseBlockGoat;
            copy.hasProducedToday = canProduce;
            if (canProduce) {
              logs.push({ msg: `🐐 ${copy.name} está lactando e produziu leite de cabra!`, type: 'info' });
            }
          }
        } else {
          copy.lactationCycle = Math.max(0, (copy.lactationCycle ?? 15) - 1);
          if ((copy.lactationCycle ?? 0) <= 0) {
            copy.isLactating = true;
            copy.lactationCycle = 0;
            logs.push({ msg: `🐐 ${copy.name} teve uma cria e voltou a produzir!`, type: 'success' });
          }
          copy.hasProducedToday = false;
        }
        // Passive happiness bonus to all other animals
        animalsList.forEach(a => {
          if (a.id !== copy.id) {
            // bonus applied via ref copy (won't work here as we iterate separately; handled below)
          }
        });
      }
      else if (copy.type === 'lhama') {
        // Accumulate wool each day (regardless of season)
        copy.woolAccumulated = (copy.woolAccumulated ?? 0) + 1;
        // In winter, llama does NOT lose happiness
        if (currentW === 'nublado' || currentW === 'chuva' || currentW === 'sol') {
          // Already processed happiness loss above; for lhama in inverno, restore it
        }
        logs.push({ msg: `🦙 ${copy.name} acumulou lã (total: ${copy.woolAccumulated}). ${Math.floor(((copy.age ?? 0) + 1) % 120 / 30) === 0 && (copy.woolAccumulated ?? 0) >= 3 ? 'Pronta para colheita na Primavera!' : ''}`, type: 'info' });
      }
      else if (copy.type === 'pato') {
        const currentSeason = Math.floor(((dayForSeason - 1) % 120) / 30); // use actual current day for season
        const ageRatio = (copy.age && copy.maxAge) ? copy.age / copy.maxAge : 0.5;
        const basePhaseMult = ageRatio < 0.15 ? 0.6 : ageRatio < 0.50 ? 1.1 : ageRatio < 0.75 ? 1.0 : ageRatio < 0.90 ? 0.7 : 0.4;
        const adjustedPhaseMult = Math.min(1.15, basePhaseMult + (copy.isVeteran ? 0.05 : 0) + (copy.juvenileBonus || 0));
        const lifePhaseBlock = adjustedPhaseMult < 1.0 && Math.random() > adjustedPhaseMult;
        const canProduce = copy.isAdult !== false && copy.hunger > 25 && copy.happiness > 30 && !sickProductionBlock && !lifePhaseBlock;
        copy.hasProducedToday = canProduce;
        if (canProduce) {
          logs.push({ msg: `🦆 ${copy.name} botou um ovo de pato!`, type: 'info' });
        }
      }
      else if (copy.type === 'ganso') {
        // Track days for egg and feather timers
        copy.daysSinceLastGooseEgg = (copy.daysSinceLastGooseEgg ?? 0) + 1;
        copy.daysSinceLastGooseFeather = (copy.daysSinceLastGooseFeather ?? 0) + 1;
        // Ganso infeliz reduz felicidade de patos e galinhas (handled below)
        // Alarm mechanic: check upcoming events (simplified — notify if weather is rainy next day)
        // This is handled in atualizarClimaEEventos, so just log ganso behavior here
        logs.push({ msg: `🦢 ${copy.name} nada tranquilamente.`, type: 'info' });
      }
      else if (copy.type === 'bufalo') {
        // Summer heat stress
        // We don't have currentDay here but we can check currentW or use approximation
        const ageRatio = (copy.age && copy.maxAge) ? copy.age / copy.maxAge : 0.5;
        const basePhaseMult = ageRatio < 0.15 ? 0.6 : ageRatio < 0.50 ? 1.1 : ageRatio < 0.75 ? 1.0 : ageRatio < 0.90 ? 0.7 : 0.4;
        const adjustedPhaseMult = Math.min(1.15, basePhaseMult + (copy.isVeteran ? 0.05 : 0) + (copy.juvenileBonus || 0));
        const lifePhaseBlock = adjustedPhaseMult < 1.0 && Math.random() > adjustedPhaseMult;
        const canProduce = copy.isAdult !== false && copy.hunger > 25 && copy.happiness > 30 && !sickProductionBlock && !lifePhaseBlock;
        copy.hasProducedToday = canProduce;
        if (canProduce) {
          logs.push({ msg: `🐃 ${copy.name} produziu leite de búfala!`, type: 'info' });
        }
        // Only lose 50% happiness from hunger (handled below by overriding)
      }
      else if (copy.type === 'pavao') {
        // No active production; peacock feathers generated weekly in separate logic
        copy.hasProducedToday = false;
      }
      else if (copy.type === 'codorna') {
        const ageRatio = (copy.age && copy.maxAge) ? copy.age / copy.maxAge : 0.5;
        const basePhaseMult = ageRatio < 0.15 ? 0.6 : ageRatio < 0.50 ? 1.1 : ageRatio < 0.75 ? 1.0 : ageRatio < 0.90 ? 0.7 : 0.4;
        const adjustedPhaseMult = Math.min(1.15, basePhaseMult + (copy.isVeteran ? 0.05 : 0) + (copy.juvenileBonus || 0));
        const lifePhaseBlock = adjustedPhaseMult < 1.0 && Math.random() > adjustedPhaseMult;
        const canProduce = copy.isAdult !== false && copy.hunger > 25 && copy.happiness > 30 && !sickProductionBlock && !lifePhaseBlock;
        copy.hasProducedToday = canProduce;
        if (canProduce) {
          logs.push({ msg: `🐦 ${copy.name} (codorna) botou ovos de codorna!`, type: 'info' });
        }
      }
      else if (copy.type === 'alpaca') {
        // alpaca heat stress in summer
        const seaIdx = Math.floor(((dayForSeason - 1) % 120) / 30);
        if (seaIdx === 1) { // summer
          copy.heatStress = true;
          copy.happiness = Math.max(0, copy.happiness - 5);
        } else {
          copy.heatStress = false;
        }
        copy.daysSinceLastWool = (copy.daysSinceLastWool || 0) + 1;
        if ((copy.daysSinceLastWool || 0) >= 4 && !copy.woolReady) {
          if (copy.hunger > 20 && copy.happiness > 25) {
            copy.woolReady = true;
            logs.push({ msg: `🦙 ${copy.name} (alpaca) está pronta para tosquia!`, type: 'success' });
          }
        }
      }
      else if (copy.type === 'minhoca') {
        // minhoca: never hungry, happiness always 100
        copy.hunger = 100;
        copy.happiness = 100;
        copy.daysWithoutFood = 0;
      }
      else if (copy.type === 'caracol') {
        // caracol: never hungry
        copy.hunger = 100;
        copy.daysWithoutFood = 0;
        // happiness decays normally but reset from initial forced 100
      }
      else if (copy.type === 'coelho_angora') {
        copy.daysSinceLastWool = (copy.daysSinceLastWool || 0) + 1;
        if ((copy.daysSinceLastWool || 0) >= 5 && !copy.woolReady) {
          if (copy.hunger > 20 && copy.happiness > 25) {
            copy.woolReady = true;
            logs.push({ msg: `🐰 ${copy.name} (coelho angorá) está pronto para tosquia!`, type: 'success' });
          }
        }
      }
      else if (copy.type === 'bicho_seda') {
        // bicho_seda: consumes folha_amoreira (handled in advanceDay)
        // here just decay happiness if no folha_amoreira was available (tracked via hunger proxy — we use hunger=0 signal)
        // hunger stays 100 if folha_amoreira was provided, else -30 set in advanceDay
        copy.daysWithoutFood = 0; // reset so it won't die of daysWithoutFood (we handle separately)
        if (copy.hunger <= 0) {
          copy.happiness = Math.max(0, copy.happiness - 30);
          logs.push({ msg: `🐛 ${copy.name} (bicho-da-seda) está sem folha de amoreira! -30 felicidade!`, type: 'error' });
        }
      }
      else if (copy.type === 'ra') {
        // ra produces every 7 days
        copy.daysSinceLastWool = (copy.daysSinceLastWool || 0) + 1;
        if ((copy.daysSinceLastWool || 0) >= 7) {
          if (copy.hunger > 20 && copy.happiness > 25) {
            copy.woolReady = true;
            logs.push({ msg: `🐸 ${copy.name} (rã) está pronta para coleta!`, type: 'success' });
          }
        }
      }
      else if (copy.type === 'avestruz') {
        // avestruz: pena_grande every 7 days (woolReady pattern)
        copy.daysSinceLastWool = (copy.daysSinceLastWool || 0) + 1;
        if ((copy.daysSinceLastWool || 0) >= 7 && !copy.woolReady) {
          copy.woolReady = true;
          logs.push({ msg: `🦤 ${copy.name} (avestruz) perdeu penas! Pronta para coletar.`, type: 'success' });
        }
      }
      else if (copy.type === 'jacare') {
        // jacaré: no daily production (handled in advanceDay for incidents)
        // just logs
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

      // IMPROVEMENT 5: Best Friend Streak (more tolerant — 85% over 5 days)
      if (copy.happiness >= 85) {
        copy.happinessStreak = (copy.happinessStreak ?? 0) + 1;
        if (copy.happinessStreak >= 5 && !copy.isBestFriend) {
          copy.isBestFriend = true;
          logs.push({ msg: `❤️ ${copy.name} se tornou seu Melhor Amigo! Felicidade sustentada por 5 dias!`, type: 'success' });
        }
      } else {
        copy.happinessStreak = 0;
      }

      // IMPROVEMENT 6: Premium quality flag
      if (copy.happiness > 90 && copy.hunger > 70) {
        copy.isHighQuality = true;
      } else {
        copy.isHighQuality = false;
      }

      // IMPROVEMENT 7: Stress state tracking
      if ((copy.stressedDays ?? 0) > 0) {
        copy.stressedDays = (copy.stressedDays ?? 0) - 1;
      }

      // IMPROVEMENT 9: Sick state from prolonged sadness
      if (copy.happiness < 20) {
        copy.lowHappinessDays = (copy.lowHappinessDays ?? 0) + 1;
      } else {
        copy.lowHappinessDays = Math.max(0, (copy.lowHappinessDays ?? 0) - 1);
      }
      if ((copy.lowHappinessDays ?? 0) >= 3 && !copy.isSick) {
        copy.isSick = true;
        copy.sickDays = 0;
        logs.push({ msg: `🤒 ${copy.name} adoeceu de tristeza! Produção reduzida em 50%. Trate com Veterinário!`, type: 'error' });
      }
      if (copy.isSick) {
        copy.sickDays = (copy.sickDays ?? 0) + 1;
      }

      // IMPROVEMENT 1: Critical happiness log
      if (copy.happiness < 15) {
        logs.push({ msg: `💔 ${copy.name} (${copy.type}) está crítico! Felicidade: ${Math.floor(copy.happiness)}%`, type: 'error' });
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
      const label = tipo === 'coalho' ? 'Queijo Coalho' : tipo === 'mucarela' ? 'Queijo Muçarela' : tipo === 'buffalo_mozzarella' ? 'Muçarela de Búfala' : tipo === 'yogurt' ? 'Iogurte' : 'Queijo Brie';
      logs.push({
        msg: `🧀 Seu fantástico ${label} terminou sua maturação e está pronto para venda!`,
        type: 'success'
      });
      // BUG FIX: passa nextDayVal para que a notificação mostre o dia correto
      setTimeout(() => addNotification(`🧀 ${label} terminou maturação e está pronto para vender!`, 'success', nextDayVal), 0);
    });

    return { remaining, readyQueijos };
  };

  // getLevelUpGoldCost, verificarNivelFazenda — moved to useFarm hook

  // F4: gerar contrato pelo comerciante
  const generateMerchantContract = (nextDayVal: number) => {
    if (contracts.filter(c => c.active).length >= 2) return; // Máx 2 contratos
    const products: Array<'milk' | 'wool' | 'egg' | 'cheese'> = ['milk', 'wool', 'egg', 'cheese'];
    const product = products[Math.floor(Math.random() * products.length)];
    const basePrices: Record<string, number> = { milk: 5, wool: 12, egg: 4, cheese: 20 };
    const pricePerUnit = Math.round(basePrices[product] * 1.15);
    const quantity = 5 + Math.floor(Math.random() * 11); // 5-15
    const deadline = nextDayVal + 5 + Math.floor(Math.random() * 6); // 5-10 dias
    const penalty = pricePerUnit * Math.floor(quantity * 0.5);
    const newContract: Contract = {
      id: Math.random().toString(36).substring(2, 9),
      product, quantity, delivered: 0, pricePerUnit, deadline, penalty, active: true
    };
    setContracts(prev => [...prev, newContract]);
    setTimeout(() => addNotification(`📋 Comerciante ofereceu contrato: entregar ${quantity} un de ${product} até o dia ${deadline} por ${pricePerUnit} moedas/un!`, 'event', nextDayVal), 0);
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
    // Com dívida > 500, comerciante não aparece
    if (debt > 500) {
      return { isMerchantNextDay: false, newDaysSinceMerchant: daysSinceMerc + 1, newNextMerchantDay: nextMercDay };
    }
    let isMerchantNextDay = false;
    let newDaysSinceMerchant = daysSinceMerc + 1;
    let newNextMerchantDay = nextMercDay;
    // Prestígio 150+: comerciante aparece com mais frequência (threshold reduzido de 3-7 para 2-5)
    const merchantThreshold = prestigePoints >= 150 ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 5) + 3;
    if (newDaysSinceMerchant >= nextMercDay) {
      isMerchantNextDay = true;
      newDaysSinceMerchant = 0;
      newNextMerchantDay = merchantThreshold;
    }

    if (isMerchantNextDay) {
      logs.push({
        msg: `🧙‍♂️ Um Comerciante Viajante chegou na fazenda! Ele compra todos os produtos e bois por 1.5x o preço hoje!`,
        type: 'event'
      });
      // BUG FIX: passa nextDayVal para que a notificação mostre o dia correto
      setTimeout(() => addNotification('🧙‍♂️ Comerciante Viajante chegou! Venda tudo por 1.5x hoje!', 'event', nextDayVal), 0);
      // F4: comerciante pode oferecer contrato
      if (Math.random() < 0.6) {
        setTimeout(() => generateMerchantContract(nextDayVal), 50);
      }
      // 30% chance to gift folha_amoreira
      if (Math.random() < 0.3) {
        setTimeout(() => {
          setInventory(prev => ({ ...prev, folha_amoreira: (prev.folha_amoreira ?? 0) + 5 }));
          addNotification('🌿 Comerciante trouxe 5 Folhas de Amoreira de presente!', 'event', nextDayVal);
        }, 100);
      }
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
      // BUG FIX: morte por fome só ocorre após 3 dias consecutivos sem comer (daysWithoutFood >= 3).
      // A condição antiga `hunger <= 0` foi removida para não anular o sistema de 3 dias — o animal
      // pode ter fome zerada por 1 ou 2 dias sem morrer, apenas acumulando daysWithoutFood e sofrendo
      // penalidades de felicidade. Morte imediata por felicidade zerada é mantida separadamente.
      if ((animal.daysWithoutFood ?? 0) >= 3) {
        logs.push({
          msg: `💀 ${animal.name} morreu de fome após 3 dias sem alimentação! Alimente seus animais regularmente!`,
          type: 'error'
        });
        setTimeout(() => addNotification(`💀 ${animal.name} morreu de fome após 3 dias sem comer!`, 'warning'), 0);
        deceasedCount++;
        return false;
      } else if (animal.happiness <= 0) {
        // Morte por tristeza extrema (felicidade zerada) — mantida como condição independente
        logs.push({
          msg: `💀 Infelizmente, o animal ${animal.name} não resistiu à tristeza profunda e faleceu.`,
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
        let loss = 10 + Math.floor(Math.random() * 15);
        // F5: seguro agrícola reduz impacto em 70%
        if (insurance.active) {
          loss = Math.round(loss * 0.3);
          logs.push({ msg: `🛡️ Seguro agrícola ativo! Impacto do evento reduzido em 70%.`, type: 'info' });
        }
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
  // craftIncubarOvos needs setAnimals/getRandomTrait from useAnimals, so defined here
  const craftIncubarOvos = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (farmLevel < 7) { addLog('🐣 Incubação requer Nível 7!', 'error'); triggerAudioResult(() => sfx.playSound('error')); return; }
    if ((inventory.fertile_egg ?? 0) < 3) { addLog('🥚 Falta Ovo Fértil! Precisa de 3.', 'error'); triggerAudioResult(() => sfx.playSound('error')); if (event) spawnFeedback('❌', 'Falta Ov.Fértil!', event); return; }
    setInventory(prev => ({ ...prev, fertile_egg: (prev.fertile_egg ?? 0) - 3 }));
    const newId = animals.length > 0 ? Math.max(...animals.map(a => a.id)) + 1 : 1;
    const newChicken = {
      id: newId,
      type: 'galinha' as const,
      name: getRandomName('galinha'),
      hunger: 80,
      happiness: 80,
      hasProducedToday: false,
      consecutiveHappyDays: 0,
      daysBelow80: 0,
      isBestFriend: false,
      trait: getRandomTrait(),
      age: 0,
      maxAge: Math.round(60 * (1 + (Math.random() * 0.4 - 0.2))),
    };
    setAnimals(prev => [...prev, newChicken]);
    addLog(`🐣 Você incubou 3 ovos férteis e nasceu uma nova galinha: ${newChicken.name}!`, 'success');
    setFarmXp(prev => prev + 3);
    triggerAudioResult(() => sfx.playSound('collect'));
    spawnFeedback('🐣', `+1 Galinha!`, event ?? { clientX: window.innerWidth/2, clientY: window.innerHeight/2 } as any);
  };

  // 11. Salvar Estado (Mantém compatibilidade com a assinatura lógica mas delega ao effect reativo)
  const salvarEstado = () => {
    // A autosalvaguarda do jogo já ocorre reativamente via useEffect sobre as dependências do estado.
    // Esta subfunção atua como âncora de segurança estrutural.
  };
  // calcFairScore moved to useAnimals hook

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
      // BUG CRITICAL FIX: invAfterAuto contém apenas as deduções de ração do alimentador (feeder).
      // Leite e lã coletados pelas máquinas são rastreados em statsCollected e precisam ser adicionados
      // explicitamente ao inventário; sem isso os produtos automáticos são registrados nos logs mas nunca aparecem no armazém.
      if (statsCollected.milk > 0 || statsCollected.wool > 0 || statsCollected.fedCount > 0) {
        setInventory(prev => ({
          ...prev,
          ...invAfterAuto,
          milk: (invAfterAuto.milk ?? prev.milk) + statsCollected.milk,
          wool: (invAfterAuto.wool ?? prev.wool) + statsCollected.wool,
        }));
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

      // --- Buff: Ração Orgânica ---
      if (racaoOrganicaDays > 0) {
        logsToAdd.push({ msg: '🌿 Ração Orgânica: consumo de ração reduzido hoje!', type: 'info' });
        setRacaoOrganicaDays(prev => Math.max(0, prev - 1));
      }

      // --- Buff: Fertilizante ---
      if (fertilizanteDays > 0) {
        logsToAdd.push({ msg: '🌱 Fertilizante: produção +15% hoje!', type: 'info' });
        setFertilizanteDays(prev => Math.max(0, prev - 1));
      }

      // --- SUBFUNÇÃO 3: Processamento e Previsão do Clima ---
      const nextWeather = atualizarClimaEEventos(currentDay, logsToAdd);
      setWeather(nextWeather);

      const nextDayValue = currentDay + 1;

      // Desliza o histórico de preço semanal adicionando a nova estimativa simulada de manhã
      setPriceHistory(prev => {
        // BUG 14 FIX: removida chave duplicada 'meat'
        // BUG FIX: novos produtos incluídos no slide de histórico
        const keys = ['milk', 'wool', 'cheese', 'scarf', 'egg', 'mayo', 'queijoCoalho', 'queijoMucarela', 'queijoBrie', 'carne',
          'goat_milk', 'llama_wool', 'duck_egg', 'goose_egg', 'buffalo_milk', 'buffalo_mozzarella',
          'feather', 'peacock_feather', 'butter', 'yogurt', 'fertile_egg',
          'quail_egg', 'alpaca_wool', 'humus', 'muco', 'angora_wool', 'seda_bruta',
          'coxa_ra', 'carne_avestruz', 'pena_grande', 'couro_avestruz', 'carne_jacare', 'couro_jacare',
          'queijo_cabra', 'iogurte_cabra', 'leite_condensado', 'tapete_lhama', 'cachecol_angora',
          'tecido_alpaca', 'fio_seda', 'manta_premium', 'pate_pato', 'ovo_defumado', 'conserva_codorna',
          'creme_cosmetico', 'sabonete_natural', 'almofada_penas', 'colete_couro', 'bolsa_exotica', 'enfeite_pavao'];
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

      // --- XP DIÁRIO: animais vivos + dia sobrevivido ---
      const dailyXp = 2 + Math.floor(animals.length * 0.5);
      const newFarmXp = farmXp + dailyXp;
      setFarmXp(newFarmXp);

      // --- SUBFUNÇÃO 6: Verificação de Nível da Fazenda ---
      const { newLevel, levelUpOccurred } = verificarNivelFazenda(nextDayValue, farmLevel, newFarmXp, logsToAdd);
      if (levelUpOccurred) {
        setFarmLevel(newLevel);
        setShowLevelUpModal(newLevel);
        setTimeout(() => addNotification(`🏆 Fazenda subiu para o Nível ${newLevel}! (${newFarmXp} XP total)`, 'success', nextDayValue), 0);
        setTimeout(() => triggerBigNotification(`NÍVEL ${newLevel}!`, `Sua fazenda evoluiu! Novos benefícios desbloqueados.`, '🏆'), 300);
        // Mostrar modal de especialização ao atingir nível 2 pela primeira vez
        if (newLevel === 2 && specialization === null) {
          setTimeout(() => setShowSpecializationModal(true), 800);
        }
        if (newLevel === 5) setTimeout(() => checkAndUnlockAchievement('level_5'), 0);
        if (newLevel === 20) {
          setTimeout(() => checkAndUnlockAchievement('level_20'), 0);
          setTimeout(() => addNotification('🌌 PARABÉNS! Você atingiu o Nível 20 — IMPÉRIO AURORA! Você é uma lenda!', 'success', nextDayValue), 0);
        }
      }

      // --- SUBFUNÇÃO 7: Processamento do Comerciante Viajante ---
      const { isMerchantNextDay, newDaysSinceMerchant, newNextMerchantDay } = processarComercianteViajante(daysSinceMerchant, nextMerchantDay, nextDayValue, logsToAdd);
      setMerchantActive(isMerchantNextDay);
      setDaysSinceMerchant(newDaysSinceMerchant);
      setNextMerchantDay(newNextMerchantDay);
      // Generate merchant special items for this visit
      if (isMerchantNextDay) {
        const availableMerchItems = MERCHANT_SPECIAL_ITEMS.filter(item => {
          if (!('oneTime' in item) || !item.oneTime) return true;
          if (item.effect === 'bebedouro' && hasBebedouro) return false;
          if (item.effect === 'cert_sanitario' && hasCertSanitario) return false;
          if (item.effect === 'licenca_exotica' && licencaExotica) return false;
          if (item.effect === 'licenca_criadouro' && licencaCriadouro) return false;
          return true;
        });
        const shuffled = [...availableMerchItems].sort(() => Math.random() - 0.5);
        setMerchantSpecialItems(shuffled.slice(0, 4).map(i => i.id));
      }

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
      let updatedAnimalsList = processarFomeFelicidade(animalsAfterAuto, nextWeather, logsToAdd, nextDayValue);

      // --- GRUPO 2c: Ovo Fértil — galinhas felizes (>=95) têm 20% chance de ovo fértil ---
      {
        let fertilEggsProduced = 0;
        updatedAnimalsList = updatedAnimalsList.map(a => {
          if (a.type === 'galinha' && a.hasProducedToday && a.happiness >= 95 && Math.random() < 0.20) {
            fertilEggsProduced++;
            logsToAdd.push({ msg: `✨ ${a.name} está super feliz e botou um ovo fértil especial!`, type: 'success' });
            // BUG FIX: marca hasProducedToday=false para evitar coleta dupla (ovo fértil + ovo normal no mesmo dia)
            return { ...a, hasProducedToday: false };
          }
          return a;
        });
        if (fertilEggsProduced > 0) {
          setInventory(prev => ({ ...prev, fertile_egg: (prev.fertile_egg ?? 0) + fertilEggsProduced }));
          setProductFreshness(prev => ({ ...prev, fertile_egg: 3 }));
        }
      }

      // --- GRUPO 3a: Estábulo — no inverno, animais recuperam metade da felicidade perdida ---
      if (hasStable && getEstacaoKey(nextDayValue) === 'inverno') {
        updatedAnimalsList = updatedAnimalsList.map(a => ({
          ...a,
          happiness: Math.min(100, a.happiness + 5) // recupera ~metade do decay de inverno
        }));
      }

      // --- GRUPO 4b: Imposto municipal (a cada 7 dias) ---
      // BUG FIX: taxAmount calculado aqui mas deduzido no setGold consolidado final,
      // evitando dois setGold separados que calculavam taxActual com gold stale do closure.
      let taxAmount = 0;
      if (currentDay % 7 === 0) {
        const weekEarnings = weeklyStats.earnings;
        let tax = Math.round(weekEarnings * 0.05);
        tax = Math.max(10, Math.min(200, tax));
        taxAmount = tax; // será limitado ao ouro disponível no setGold consolidado abaixo
        setWeeklyTaxPaid(tax);
        logsToAdd.push({ msg: `🏛️ Imposto municipal: -${tax} moedas (5% dos lucros da semana)`, type: 'system' });
      }

      // --- GRUPO 4c: Caixinha de gorjeta ---
      if (hasTipBox && Math.random() < 0.25) {
        const tip = 5 + Math.floor(Math.random() * 21); // 5-25
        setGold(prev => prev + tip);
        logsToAdd.push({ msg: `🪙 Um visitante deixou uma gorjeta de ${tip} moedas!`, type: 'success' });
      }

      // --- GRUPO 4a: Frescor dos produtos perecíveis ---
      {
        type FreshnessKey = 'milk' | 'egg' | 'goat_milk' | 'duck_egg' | 'goose_egg' | 'buffalo_milk' | 'fertile_egg';
        const perishables: FreshnessKey[] = ['milk', 'egg', 'goat_milk', 'duck_egg', 'goose_egg', 'buffalo_milk', 'fertile_egg'];
        setProductFreshness(prev => {
          const next = { ...prev };
          perishables.forEach(key => {
            const qty = (inventory as any)[key] ?? 0;
            if (qty > 0) {
              const decay = hasFridge ? 0.5 : 1;
              next[key] = Math.max(0, prev[key] - decay);
            }
          });
          return next;
        });
        // Check for spoilage and warnings (use current freshness before decrement)
        perishables.forEach(key => {
          const qty = (inventory as any)[key] ?? 0;
          if (qty > 0) {
            const newFresh = productFreshness[key] - (hasFridge ? 0.5 : 1);
            if (newFresh <= 0) {
              const lost = Math.floor(qty * 0.3);
              if (lost > 0) {
                setInventory(prev => ({ ...prev, [key]: Math.max(0, (prev as any)[key] - lost) }));
                setProductFreshness(prev => ({ ...prev, [key]: 3 }));
                logsToAdd.push({ msg: `🦠 Parte do ${key === 'milk' ? 'leite' : key === 'egg' ? 'ovo' : key} estragou! Venda mais rápido.`, type: 'error' });
              }
            } else if (Math.floor(newFresh) === 1 && newFresh > 0) {
              setTimeout(() => addNotification(`⚠️ Seu(s) ${key === 'milk' ? 'leite' : key} vai estragar amanhã!`, 'warning', nextDayValue), 0);
            }
          }
        });
      }

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
      // NOTE: setAnimals(survivors) is deferred to after the age-cycle block below,
      // which also calls setAnimals with the fully-processed list (age increments + elder deaths).

      // BUG 4 FIX: notificações de infelicidade agora usam `survivors` (sem animais
      // já mortos), evitando spam de aviso sobre animais que acabaram de falecer.
      survivors.forEach(a => {
        if (a.happiness < 20) {
          setTimeout(() => addNotification(`⚠️ ${a.name} está muito infeliz (${Math.floor(a.happiness)}%)! Alimente-o urgentemente!`, 'warning'), 0);
        }
      });

      // --- SUBFUNÇÃO 9: Processamento do Evento Global Dinâmico ---
      const globalGoldBonus = processarGlobalEvent(logsToAdd);

      // --- F4: Pré-calcular multas de contratos vencidos (síncrono, para incluir no setGold final) ---
      let contractPenaltyForGold = 0;
      contracts.forEach(c => {
        if (c.active && nextDayValue > c.deadline && c.delivered < c.quantity) {
          contractPenaltyForGold += c.penalty;
        }
      });

      // Decrementar evento de mercado ativo
      if (activeMarketEvent) {
        const newDaysLeft = activeMarketEvent.daysLeft - 1;
        if (newDaysLeft <= 0) {
          setActiveMarketEvent(null);
          logsToAdd.push({ msg: `📰 Evento de mercado encerrado: ${activeMarketEvent.title}`, type: 'system' });
        } else {
          setActiveMarketEvent(prev => prev ? { ...prev, daysLeft: newDaysLeft } : null);
        }
      }

      // --- FUNCIONALIDADE 1: Custos fixos de água e energia ---
      // Cálculo da conta de água
      const baseWaterCost = 10 + (animals.length * 2);
      const waterDiscount = wellLevel >= 1 ? 0.8 : 0;
      const waterCost = Math.round(baseWaterCost * (1 - waterDiscount));

      // Cálculo da conta de energia
      // Cada máquina tem custo de energia distinto por dia de operação
      const milkerEnergy = machines.milkerPurchased && machines.milkerActive ? 8 : 0;
      const shearerEnergy = machines.shearerPurchased && machines.shearerActive ? 6 : 0;
      const feederEnergy = machines.feederPurchased && machines.feederActive ? 5 : 0;
      const machineEnergyCost = milkerEnergy + shearerEnergy + feederEnergy;
      const baseEnergyCost = 15 + machineEnergyCost;
      const energyDiscount = solarLevel === 1 ? 0.4 : solarLevel === 2 ? 0.7 : solarLevel >= 3 ? 1.0 : 0;
      const energyCost = Math.round(baseEnergyCost * (1 - energyDiscount));

      // Acumular no weeklyStats
      setWeeklyStats(prev => ({
        ...prev,
        waterCost: (prev.waterCost || 0) + waterCost,
        energyCost: (prev.energyCost || 0) + energyCost,
      }));

      // Verificar se pode pagar água e energia (usando gold atual da closure)
      const canAffordWater = gold >= waterCost;
      const canAffordEnergy = gold >= energyCost;

      if (!canAffordWater) {
        logsToAdd.push({ msg: '💧 Sem água suficiente! Animais sofrendo.', type: 'error' });
        // debuff: -8 felicidade extra para todos os animais
        setTimeout(() => {
          setAnimals(al => al.map(a => ({ ...a, happiness: Math.max(0, a.happiness - 8) })));
        }, 0);
      } else {
        logsToAdd.push({ msg: `💧 Conta de água paga: -${waterCost} moedas.`, type: 'system' });
      }

      if (!canAffordEnergy && energyCost > 0) {
        logsToAdd.push({ msg: '⚡ Sem energia! Máquinas paradas hoje.', type: 'error' });
      } else if (energyCost > 0) {
        logsToAdd.push({ msg: `⚡ Conta de energia paga: -${energyCost} moedas.`, type: 'system' });
      }

      // Liquidação financeira final do balanceamento (inclui multas de contratos vencidos e imposto)
      // BUG 2 FIX: usa callback funcional para não sobrescrever ouro com valor de closure stale
      // BUG FIX: taxAmount incluído aqui para evitar setGold duplo com gold stale no cálculo do imposto
      setGold(prev => {
        const totalCosts = maintCost + contractPenaltyForGold + taxAmount + waterCost + energyCost;
        const newGold = prev - totalCosts + globalGoldBonus;
        if (newGold < 0) {
          // Acumular dívida em vez de ir para negativo (sem juros aqui; juros aplicados no bloco de dívida abaixo)
          const newDebtAmount = Math.abs(newGold);
          setDebt(d => d + newDebtAmount);
          return 0;
        }
        // Se tem dívida e ouro sobrando, abater parte da dívida
        if (debt > 0 && newGold > 0) {
          const payment = Math.min(debt, Math.floor(newGold * 0.3));
          if (payment > 0) {
            setDebt(d => Math.max(0, d - payment));
            return newGold - payment;
          }
        }
        return newGold;
      });

      // --- SUBFUNÇÃO: Gerar Relatório Semanal ---
      if (currentDay % 7 === 0) {
        setWeeklyReportData({ ...weeklyStats });
        setShowWeeklyReport(true);
        // Evento de mercado: ~30% chance todo domingo
        if (Math.random() < 0.3) {
          const MARKET_EVENTS = [
            { title: '📰 Feira Gastronômica', desc: 'Queijos e laticínios +25% por 3 dias!', items: ['cheese','queijoCoalho','queijoMucarela','queijoBrie','queijo_cabra','buffalo_mozzarella','butter','yogurt'], mult: 1.25, daysLeft: 3 },
            { title: '📰 Demanda de Exportação', desc: 'Lãs e fibras +30% por 2 dias!', items: ['wool','llama_wool','alpaca_wool','angora_wool','seda_bruta','fio_seda'], mult: 1.30, daysLeft: 2 },
            { title: '📰 Festival de Ovos', desc: 'Todos os ovos +20% por 3 dias!', items: ['egg','duck_egg','goose_egg','quail_egg','fertile_egg'], mult: 1.20, daysLeft: 3 },
            { title: '📰 Crise do Laticínio', desc: 'Leites -20% esta semana.', items: ['milk','goat_milk','buffalo_milk'], mult: 0.80, daysLeft: 5 },
            { title: '📰 Boom Orgânico', desc: 'Húmus e mel +35% por 2 dias!', items: ['humus','mel','mel_envasado'], mult: 1.35, daysLeft: 2 },
            { title: '📰 Procura de Luxo', desc: 'Produtos exóticos +20% por 3 dias!', items: ['couro_jacare','carne_jacare','muco','bolsa_exotica','colete_couro'], mult: 1.20, daysLeft: 3 },
            { title: '📰 Concorrência Importada', desc: 'Lã e cachecol -15% por 4 dias.', items: ['wool','scarf','llama_wool'], mult: 0.85, daysLeft: 4 },
          ];
          const evt = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
          setActiveMarketEvent(evt);
          logsToAdd.push({ msg: `${evt.title}: ${evt.desc}`, type: 'event' });
          addNotification(`${evt.title}: ${evt.desc}`, 'info');
        }
        setWeeklyStats({ earnings: 0, spending: 0, milk: 0, wool: 0, oxSold: 0, cheese: 0, scarf: 0, egg: 0, mayo: 0, waterCost: 0, energyCost: 0 });
        setWeeklySales({ milk: 0, wool: 0, cheese: 0, scarf: 0, carne: 0, egg: 0, mayo: 0, queijoCoalho: 0, queijoMucarela: 0, queijoBrie: 0 });
        setWeeklyTaxPaid(0);
        setBiomeWeeklyIncome({ pasto: 0, lago: 0, floresta: 0, pomar: 0 });
      }

      // --- F1/F2: Ciclo de vida dos animais (idade e morte por velhice) ---
      // BUG FIX: calcula os animais que morrem de velhice de forma síncrona (fora do updater
      // de setAnimals) para evitar side-effects (push em logsToAdd, wisdomBonusUpdates)
      // sendo executados duas vezes no StrictMode do React.
      const wisdomBonusUpdates: { vaca: number; ovelha: number; boi: number; galinha: number } = { vaca: 0, ovelha: 0, boi: 0, galinha: 0 };
      const agedAnimals = survivors.map(a => {
        const newAge = (a.age || 0) + 1;
        const maxAge = a.maxAge || 999;
        const wasVeteran = a.isVeteran;
        const becameVeteran = !wasVeteran && newAge >= maxAge * 0.5;
        if (becameVeteran) {
          logsToAdd.push({ msg: `🏅 ${a.name} (${a.type}) completou metade da vida e se tornou Veterano! +5% produção permanente.`, type: 'success' });
        }
        return { ...a, age: newAge, isVeteran: wasVeteran || becameVeteran };
      });
      const survivorsAfterAge = agedAnimals.filter(a => {
        const maxAge = a.maxAge || 999;
        if (a.age >= maxAge) {
          logsToAdd.push({
            msg: `👴 ${a.name} (${a.type}) viveu ${a.age} dias e partiu de velhice. Sua sabedoria permanece no rebanho!`,
            type: 'error'
          });
          const key = a.type as keyof typeof wisdomBonusUpdates;
          if (key in wisdomBonusUpdates) wisdomBonusUpdates[key] = Math.min(0.1, (wisdomBonusUpdates[key] || 0) + 0.02);
          setTimeout(() => addNotification(`👴 ${a.name} (${a.type}) viveu ${a.age} dias e deixou sua sabedoria!`, 'event', nextDayValue), 0);
          // Avestruz: couro ao morrer de velhice
          if (a.type === 'avestruz') {
            setTimeout(() => setInventory(prev => ({ ...prev, couro_avestruz: (prev.couro_avestruz ?? 0) + 1 })), 0);
            logsToAdd.push({ msg: `🦤 ${a.name} legou 1 Couro de Avestruz ao morrer de velhice!`, type: 'success' });
          }
          // Jacaré: couro ao morrer de velhice
          if (a.type === 'jacare') {
            setTimeout(() => setInventory(prev => ({ ...prev, couro_jacare: (prev.couro_jacare ?? 0) + 1 })), 0);
            logsToAdd.push({ msg: `🐊 ${a.name} legou 1 Couro de Jacaré ao morrer de velhice!`, type: 'success' });
          }
          return false;
        }
        return true;
      });
      // --- NOVOS ANIMAIS: Mecânicas especiais diárias ---
      const currentSeasonIdx = Math.floor(((nextDayValue - 1) % 120) / 30);

      // Cabra: bônus de felicidade passivo +3 para todos os outros animais
      const hasGoat = survivorsAfterAge.some(a => a.type === 'cabra');
      // Lhama: reduz custo de manutenção (já implementado via getCustoManutencaoMaquinas implicitamente, aplicamos aqui como info)
      const llamaCount = survivorsAfterAge.filter(a => a.type === 'lhama').length;
      // Pato: controle de pragas (reduz eventos negativos — implementado in event logic)
      const hasDuck = survivorsAfterAge.some(a => a.type === 'pato');
      // Ganso: alarme de clima ruim
      const hasGoose = survivorsAfterAge.some(a => a.type === 'ganso');
      // Búfalo: estresse térmico no verão
      // Pavão: bônus de felicidade e preço (verificamos aqui)
      const peacockCount = survivorsAfterAge.filter(a => a.type === 'pavao' && a.happiness > 80).length;

      const finalAnimals = survivorsAfterAge.map(a => {
        const copy = { ...a };

        // Cabra: +3 felicidade para todos os outros animais
        if (hasGoat && a.type !== 'cabra') {
          copy.happiness = Math.min(100, copy.happiness + 3);
        }

        // Pavão: +10% felicidade para todos os outros animais (não stackable)
        if (peacockCount > 0 && a.type !== 'pavao') {
          copy.happiness = Math.min(100, copy.happiness + Math.round(copy.happiness * 0.10));
        }

        // Ganso infeliz: reduz patos e galinhas (IMPROVEMENT 3: threshold 30, penalty -1)
        const unhappyGoose = survivorsAfterAge.some(a2 => a2.type === 'ganso' && a2.happiness < 30);
        if (unhappyGoose && (a.type === 'pato' || a.type === 'galinha')) {
          copy.happiness = Math.max(0, copy.happiness - 1);
        }

        // Búfalo: calor no verão
        if (a.type === 'bufalo') {
          if (currentSeasonIdx === 1) { // verão
            copy.heatStress = true;
            copy.happiness = Math.max(0, copy.happiness - 3);
          } else {
            copy.heatStress = false;
          }
        }

        // Lhama: não perde felicidade no inverno
        if (a.type === 'lhama' && currentSeasonIdx === 3) {
          // Undo the happiness loss from cold (restore 2 that was lost by decaimento natural)
          copy.happiness = Math.min(100, copy.happiness + 2);
        }

        // Pavão: gerar pena de pavão semanalmente (primavera/verão)
        if (a.type === 'pavao' && (currentSeasonIdx === 0 || currentSeasonIdx === 1)) {
          if (nextDayValue % 7 === 0) {
            setTimeout(() => {
              setInventory(prev => ({ ...prev, peacock_feather: (prev.peacock_feather ?? 0) + 1 }));
              addNotification(`🦚 ${a.name} perdeu penas lindas! +1 Pena de Pavão`, 'success', nextDayValue);
            }, 0);
            logsToAdd.push({ msg: `🦚 ${a.name} perdeu penas lindas! +1 Pena de Pavão no Armazém.`, type: 'success' });
          }
        }

        // Minhoca: produz 1 húmus a cada 3 dias
        if (a.type === 'minhoca' && (a.age || 0) > 0 && (a.age || 0) % 3 === 0) {
          const humusAmt = specialization === 'organica' ? 2 : 1;
          setTimeout(() => {
            setInventory(prev => {
              const newTotal = (prev.humus ?? 0) + humusAmt;
              if (newTotal >= 20) checkAndUnlockAchievement('organic_master');
              return { ...prev, humus: newTotal };
            });
          }, 0);
          logsToAdd.push({ msg: `🪱 ${a.name} (minhoca) produziu ${humusAmt} húmus!`, type: 'success' });
          updateMissionProgress('organic_day', 1, nextDayValue);
        }

        // Caracol: produz 1 muco a cada 3 dias (2x na chuva)
        if (a.type === 'caracol' && (a.age || 0) > 0 && (a.age || 0) % 3 === 0) {
          // Easter egg: if player has 'sal' in inventory, don't produce (salt kills snails — just a comment here)
          const mucoAmt = (nextWeather === 'chuva' || weather === 'chuva') ? 2 : 1;
          const finalMuco = specialization === 'organica' ? mucoAmt * 2 : mucoAmt;
          setTimeout(() => {
            setInventory(prev => {
              const newTotal = (prev.muco ?? 0) + finalMuco;
              if (newTotal >= 20) checkAndUnlockAchievement('organic_master');
              return { ...prev, muco: newTotal };
            });
          }, 0);
          logsToAdd.push({ msg: `🐌 ${a.name} (caracol) produziu ${finalMuco} muco!`, type: 'success' });
          updateMissionProgress('organic_day', 1, nextDayValue);
        }

        // Bicho-da-seda: a cada 14 dias produz 3 seda_bruta; consome 1 folha_amoreira/dia
        if (a.type === 'bicho_seda') {
          if ((a.age || 0) > 0 && (a.age || 0) % 14 === 0) {
            setTimeout(() => {
              setInventory(prev => {
                const newTotal = (prev.seda_bruta ?? 0) + 3;
                if (newTotal >= 10) checkAndUnlockAchievement('silk_producer');
                return { ...prev, seda_bruta: newTotal };
              });
            }, 0);
            logsToAdd.push({ msg: `🐛 ${a.name} (bicho-da-seda) produziu 3 seda bruta!`, type: 'success' });
            updateMissionProgress('collect_silk', 3, nextDayValue);
          }
        }

        // Codorna: produz quail_egg diariamente se hasProducedToday
        // (production set in processarFomeFelicidade, collected here)

        return copy;
      });

      // IMPROVEMENT 2: Species-specific climate preferences
      const finalAnimalsWithClimate = finalAnimals.map(a => {
        if (!a.isAdult) return a;
        let happyDelta = 0;
        const currentW2 = nextWeather; // weather being set for this new day

        if (currentW2 === 'chuva') {
          if (a.type === 'bufalo') happyDelta += 5;
          if (a.type === 'pato' || a.type === 'ganso') happyDelta += 8;
          if (a.type === 'minhoca' || a.type === 'caracol') happyDelta += 10;
          if (a.type === 'galinha' || a.type === 'codorna') happyDelta -= 3;
          if (a.type === 'avestruz') happyDelta -= 5;
        }

        if (currentW2 === 'sol') {
          if (a.type === 'galinha' || a.type === 'codorna' || a.type === 'pavao') happyDelta += 5;
          if (a.type === 'jacare') happyDelta += 8;
          if (a.type === 'pato' || a.type === 'ganso') happyDelta -= 5;
          if (a.type === 'minhoca' || a.type === 'caracol') happyDelta -= 5;
        }

        if (currentSeasonIdx === 1) { // verão
          if (a.type === 'lhama' || a.type === 'alpaca') happyDelta -= 8;
          if (a.type === 'jacare' || a.type === 'ra') happyDelta += 5;
          if (a.type === 'minhoca' || a.type === 'caracol') happyDelta -= 10;
        }
        if (currentSeasonIdx === 3) { // inverno
          if (a.type === 'lhama' || a.type === 'alpaca') happyDelta += 5;
          if (a.type === 'jacare') happyDelta -= 10;
          if (a.type === 'ra') happyDelta -= 8;
        }

        if (happyDelta === 0) return a;
        return { ...a, happiness: Math.min(100, Math.max(0, a.happiness + happyDelta)) };
      });

      // MECHANIC 1: Sistema de Pragas (Pato reduz probabilidade)
      {
        const basePestChance = 0.08;
        const hasDuckAlive = finalAnimals.some(a => a.type === 'pato');
        const pestChance = hasDuckAlive ? basePestChance * 0.6 : basePestChance; // 40% redução com pato
        if (Math.random() < pestChance) {
          const pestItems: Array<keyof typeof inventory> = ['milk', 'goat_milk', 'egg', 'duck_egg', 'goose_egg'];
          let totalLost = 0;
          const lossMultiplier = insurance.active ? 0.3 : 1.0; // seguro reduz 70%
          const pestLossFraction = (0.10 + Math.random() * 0.15) * lossMultiplier; // 10–25%, modificado pelo seguro
          setInventory(prev => {
            const next = { ...prev };
            pestItems.forEach(key => {
              const current = (prev[key] ?? 0) as number;
              if (current > 0) {
                const lost = Math.floor(current * pestLossFraction);
                totalLost += lost;
                (next as any)[key] = Math.max(0, current - lost);
              }
            });
            return next;
          });
          const insuranceTxt = insurance.active ? ' (Seguro reduziu 70% das perdas!)' : '';
          logsToAdd.push({ msg: `🐀 Pragas invadiram o celeiro! Perdeu itens perecíveis.${insuranceTxt}`, type: 'error' });
          setTimeout(() => addNotification(`🐀 Pragas invadiram o celeiro! Itens perecíveis afetados.${insuranceTxt}`, 'warning', nextDayValue), 0);
        }
      }

      // MECHANIC 2: Ganso — alarme de evento pré-sorteado
      // Processar o evento pré-sorteado do dia atual (nextDayEvent) antes de sortear o próximo
      // Sortear evento do próximo dia
      {
        const negativeEvents = ['praga', 'tempestade', 'seca', 'geada', 'predador'];
        const positiveEvents = ['chuva_leve', 'sol_forte', 'vento_bom'];
        const allEvents = [...negativeEvents, ...positiveEvents];
        const nextEvent = allEvents[Math.floor(Math.random() * allEvents.length)];
        setNextDayEvent(nextEvent);
        const hasGooseAlive = finalAnimals.some(a => a.type === 'ganso');
        if (hasGooseAlive && negativeEvents.includes(nextEvent)) {
          logsToAdd.push({ msg: `🦢 Os gansos estão agitados! Prepare-se para amanhã...`, type: 'event' });
          setTimeout(() => addNotification('🦢 Os gansos estão agitados! Prepare-se para amanhã...', 'warning', nextDayValue), 0);
        }
      }

      // MECHANIC 5: Búfalo — log de estresse térmico no primeiro dia de verão
      {
        const prevSeasonIdx = Math.floor(((currentDay - 1) % 120) / 30);
        const isFirstDayOfSummer = currentSeasonIdx === 1 && prevSeasonIdx !== 1;
        const hasBuffalo = finalAnimals.some(a => a.type === 'bufalo');
        if (isFirstDayOfSummer && hasBuffalo) {
          logsToAdd.push({ msg: `🐃 O calor do verão está afetando seus búfalos! Produção reduzida.`, type: 'event' });
          setTimeout(() => addNotification('🐃 Búfalos sob estresse térmico de verão! Produção reduzida em 40%.', 'warning', nextDayValue), 0);
        }
      }

      // Ganso: alarme legado de clima ruim (mantém compatibilidade)
      if (finalAnimals.some(a => a.type === 'ganso') && nextWeather === 'chuva') {
        // já coberto pelo sistema de nextDayEvent acima — sem duplicidade
      }

      // --- NOVOS ANIMAIS: Produções e Mecânicas Diárias ---

      // Bicho-da-seda: consome 1 folha_amoreira por bicho_seda por dia
      {
        const bichoCount = finalAnimals.filter(a => a.type === 'bicho_seda').length;
        if (bichoCount > 0) {
          setInventory(prev => {
            const available = prev.folha_amoreira ?? 0;
            if (available >= bichoCount) {
              return { ...prev, folha_amoreira: available - bichoCount };
            } else {
              // not enough folha: bichos lose hunger (signal: set hunger=0 on those without food)
              const missing = bichoCount - available;
              logsToAdd.push({ msg: `🐛 Faltaram ${missing} folha(s) de amoreira! Bichos-da-seda passando fome!`, type: 'error' });
              return { ...prev, folha_amoreira: 0 };
            }
          });
        }
      }

      // Codorna: auto-collect quail_eggs
      {
        const codornaCount = finalAnimals.filter(a => a.type === 'codorna' && a.hasProducedToday).length;
        if (codornaCount > 0) {
          const eggs = codornaCount * 6;
          setTimeout(() => setInventory(prev => ({ ...prev, quail_egg: (prev.quail_egg ?? 0) + eggs })), 0);
          logsToAdd.push({ msg: `🐦 ${codornaCount} codorna(s) botaram ${eggs} ovos de codorna!`, type: 'success' });
        }
      }

      // Rã: coleta automática de coxa_ra quando woolReady (handled via collect button but also auto here)
      // Auto-reset cooldown handled via daysSinceLastWool in processarFomeFelicidade

      // Jacaré: incidentes e fiscalização
      {
        const jacaresAlive = finalAnimals.filter(a => a.type === 'jacare');
        if (jacaresAlive.length > 0) {
          if (!licencaExotica) {
            // 5% fiscalização = -300 moedas
            if (Math.random() < 0.05) {
              setGold(prev => Math.max(0, prev - 300));
              logsToAdd.push({ msg: `🚔 Fiscalização! Jacaré sem Licença Exótica: multa de -300 moedas!`, type: 'error' });
              setTimeout(() => addNotification('🚔 Fiscalização de jacaré! -300 moedas de multa!', 'warning', nextDayValue), 0);
            }
          }
          // 2% incidente = -50 moedas (unless 'exotica' specialization)
          if (specialization !== 'exotica' && Math.random() < 0.02) {
            setGold(prev => Math.max(0, prev - 50));
            logsToAdd.push({ msg: `🐊 Incidente com o jacaré! -50 moedas de danos.`, type: 'error' });
          }
        }
      }

      // Coelho Angorá: reprodução (a cada 15 dias se 2+ coelhos)
      {
        const coelhos = finalAnimals.filter(a => a.type === 'coelho_angora');
        if (coelhos.length >= 2 && coelhoReproCount < 4) {
          // Check if any coelho has age that's a multiple of 15
          const shouldRepro = coelhos.some(c => (c.age || 0) > 0 && (c.age || 0) % 15 === 0);
          if (shouldRepro) {
            const newId = finalAnimals.length > 0 ? Math.max(...finalAnimals.map(a => a.id)) + 100 : 100;
            const newBaby: Animal = {
              id: newId,
              type: 'coelho_angora',
              name: getRandomName('coelho_angora'),
              hunger: 80,
              happiness: 90,
              consecutiveHappyDays: 0,
              daysBelow80: 0,
              isBestFriend: false,
              trait: getRandomTrait(),
              age: 0,
              maxAge: Math.round(100 * (1 + (Math.random() * 0.4 - 0.2))),
              daysUntilWool: 5,
              daysSinceLastWool: 0,
              woolReady: false,
            };
            setAnimals(prev => [...prev, newBaby]);
            setCoelhoReproCount(prev => prev + 1);
            logsToAdd.push({ msg: `🐰 Os coelhos angorá tiveram um filhote! ${newBaby.name} chegou à fazenda!`, type: 'success' });
            setTimeout(() => checkAndUnlockAchievement('angora_breeder'), 0);
          }
        }
      }

      // --- LAYER 1: Filhotes atingindo maturidade ---
      const baseMaxAgeMapAdult: Record<string, number> = { vaca: 120, ovelha: 90, boi: 150, galinha: 60, cabra: 200, lhama: 180, pato: 80, ganso: 150, bufalo: 220, pavao: 160, codorna: 60, alpaca: 180, minhoca: 365, caracol: 200, coelho_angora: 100, bicho_seda: 60, ra: 120, avestruz: 365, jacare: 400 };
      const finalAnimalsWithAdulthood: Animal[] = finalAnimalsWithClimate.map(a => {
        if (!a.isAdult && a.adulthoodDay !== undefined && nextDayValue >= a.adulthoodDay) {
          logsToAdd.push({ msg: `🎉 ${a.name} cresceu e se tornou adulto! Pronto para produzir!`, type: 'success' });
          setTimeout(() => addNotification(`🎉 ${a.name} (${a.type}) cresceu e está pronto para produzir!`, 'success', nextDayValue), 0);
          const baseMax = baseMaxAgeMapAdult[a.type] ?? 90;
          return { ...a, isAdult: true, adulthoodDay: undefined, maxAge: a.maxAge ?? Math.round(baseMax * (1 + (Math.random() * 0.4 - 0.2))) };
        }
        return a;
      });

      // --- LAYER 2: Reprodução Controlada — gestações concluídas ---
      const completedGestacoes = reproducaoAtiva.filter(r => nextDayValue >= r.gestacaoEnd);
      const maxAnimalsLayer2 = landLots * 5;
      completedGestacoes.forEach(r => {
        if (finalAnimalsWithAdulthood.length >= maxAnimalsLayer2) {
          logsToAdd.push({ msg: `❌ Fazenda cheia! Filhote de ${r.type} não pôde nascer. Expanda o terreno!`, type: 'error' });
          return;
        }
        const newId = finalAnimalsWithAdulthood.length > 0 ? Math.max(...finalAnimalsWithAdulthood.map(a => a.id)) + 200 + Math.floor(Math.random() * 100) : 200;
        const baseMax2 = baseMaxAgeMapAdult[r.type] ?? 90;
        const daysToAdultMap: Partial<Record<AnimalType, number>> = { vaca: 10, boi: 15, bufalo: 12, cabra: 8, pavao: 20, ovelha: 8, galinha: 7, pato: 7 };
        const daysToAdult = daysToAdultMap[r.type] ?? 10;
        const newFilhote: Animal = {
          id: newId,
          type: r.type,
          name: getRandomName(r.type),
          hunger: 80,
          happiness: 90,
          consecutiveHappyDays: 0,
          daysBelow80: 0,
          isBestFriend: false,
          trait: getRandomTrait(),
          age: 0,
          maxAge: Math.round(baseMax2 * (1 + (Math.random() * 0.4 - 0.2))),
          isAdult: false,
          adulthoodDay: nextDayValue + daysToAdult,
          hasProducedToday: false,
          ...(r.type === 'ovelha' && { daysUntilWool: 3, daysSinceLastWool: 0, woolReady: false }),
          ...(r.type === 'cabra' && { isLactating: false, lactationCycle: 0 }),
          ...(r.type === 'bufalo' && { heatStress: false }),
          ...(r.type === 'boi' && { weightGain: 0.05 }),
        };
        // 15% chance of good trait
        if (Math.random() < 0.15) {
          (newFilhote as any).trait = Math.random() < 0.5 ? 'trabalhadora' : 'saudavel';
        }
        finalAnimalsWithAdulthood.push(newFilhote);
        logsToAdd.push({ msg: `👶 Nasceu um filhote de ${r.type}! ${newFilhote.name} chegou à fazenda!`, type: 'success' });
        setTimeout(() => addNotification(`👶 ${newFilhote.name} (filhote de ${r.type}) nasceu na fazenda!`, 'success', nextDayValue), 0);
        setReproHistory(prev => [{ day: nextDayValue, animalType: r.type, name: newFilhote.name, method: 'gestacao' }, ...prev].slice(0, 50));
      });
      if (completedGestacoes.length > 0) {
        setReproducaoAtiva(prev => prev.filter(r => nextDayValue < r.gestacaoEnd));
      }

      // --- LAYER 3: Reprodução Natural (Galinha) ---
      {
        const galinhas = finalAnimalsWithAdulthood.filter(a => a.type === 'galinha' && a.isAdult !== false);
        const totalGalinhas = galinhas.length;
        const maxGalinhas = 10;
        let naturalBirths = 0;
        const maxNaturalPerDay = 2;
        if (totalGalinhas < maxGalinhas) {
          galinhas.forEach(a => {
            if (naturalBirths >= maxNaturalPerDay) return;
            if (finalAnimalsWithAdulthood.length >= maxAnimalsLayer2) return;
            if ((a.happiness ?? 0) > 80 && Math.random() < 0.03) {
              const newId2 = finalAnimalsWithAdulthood.length > 0 ? Math.max(...finalAnimalsWithAdulthood.map(x => x.id)) + 300 + Math.floor(Math.random() * 100) : 300;
              const pintinho: Animal = {
                id: newId2,
                type: 'galinha',
                name: getRandomName('galinha'),
                hunger: 80,
                happiness: 90,
                consecutiveHappyDays: 0,
                daysBelow80: 0,
                isBestFriend: false,
                trait: getRandomTrait(),
                age: 0,
                maxAge: Math.round(60 * (1 + (Math.random() * 0.4 - 0.2))),
                isAdult: false,
                adulthoodDay: nextDayValue + 7,
                hasProducedToday: false,
              };
              finalAnimalsWithAdulthood.push(pintinho);
              naturalBirths++;
              logsToAdd.push({ msg: `🐣 ${a.name} chocou um pintinho! ${pintinho.name} chegou à fazenda!`, type: 'success' });
              setReproHistory(prev => [{ day: nextDayValue, animalType: 'galinha' as AnimalType, name: pintinho.name, method: 'natural' }, ...prev].slice(0, 50));
            }
          });
        }
      }

      // Reset weeklyProduction every 7 days
      const animalsWithWeekly = nextDayValue % 7 === 0
        ? finalAnimalsWithAdulthood.map(a => ({ ...a, weeklyProduction: 0 }))
        : finalAnimalsWithAdulthood;
      setAnimals(animalsWithWeekly);
      // Apply accumulated wisdom bonuses
      if (Object.values(wisdomBonusUpdates).some(v => v > 0)) {
        setFarmWisdomBonus(prev => ({
          vaca: Math.min(0.1, prev.vaca + wisdomBonusUpdates.vaca),
          ovelha: Math.min(0.1, prev.ovelha + wisdomBonusUpdates.ovelha),
          boi: Math.min(0.1, prev.boi + wisdomBonusUpdates.boi),
          galinha: Math.min(0.1, prev.galinha + wisdomBonusUpdates.galinha),
        }));
      }

      // --- F4: Verificar contratos vencidos ---
      // BUG FIX: toda a lógica de log e notificação de contratos vencidos é executada
      // de forma síncrona aqui (usando o array `contracts` da closure), e o setContracts
      // abaixo apenas marca inativos — sem side-effects no updater.
      contracts.forEach(c => {
        if (c.active && nextDayValue > c.deadline && c.delivered < c.quantity) {
          logsToAdd.push({ msg: `📋 Contrato vencido! Multa de -${c.penalty} moedas por não entregar ${c.quantity - c.delivered} un de ${c.product}!`, type: 'error' });
          setTimeout(() => addNotification(`📋 Contrato expirou! Multa de -${c.penalty} moedas aplicada!`, 'warning', nextDayValue), 0);
        }
      });
      setContracts(prev => prev.map(c => {
        if (!c.active) return c;
        if (nextDayValue > c.deadline && c.delivered < c.quantity) {
          return { ...c, active: false };
        }
        return c;
      }));

      // --- F5: Decrementar seguro agrícola ---
      // BUG FIX: side-effects (log/notificação) extraídos para fora do updater,
      // calculados com `insurance` da closure para evitar dupla execução em StrictMode.
      if (insurance.active) {
        const newDaysLeft = insurance.daysLeft - 1;
        if (newDaysLeft <= 0) {
          logsToAdd.push({ msg: `🛡️ Seu seguro agrícola expirou! Renove nas Melhorias para continuar protegido.`, type: 'event' });
          setTimeout(() => addNotification(`🛡️ Seguro agrícola expirou!`, 'warning', nextDayValue), 0);
        } else if (newDaysLeft === 2) {
          setTimeout(() => addNotification(`⚠️ Seguro agrícola expira em 2 dias! Renove nas Melhorias.`, 'warning', nextDayValue), 0);
        }
      }
      setInsurance(prev => {
        if (!prev.active) return prev;
        const newDaysLeft = prev.daysLeft - 1;
        if (newDaysLeft <= 0) {
          return { ...prev, active: false, daysLeft: 0 };
        }
        return { ...prev, daysLeft: newDaysLeft };
      });

      // --- SUBFUNÇÃO 5: Processamento da Maturação de Queijos ---
      const { remaining: maturacaoRemaining, readyQueijos } = processarMaturacaoQueijos(queijosEmMaturacao, nextDayValue, logsToAdd);
      setQueijosEmMaturacao(maturacaoRemaining);

      if (readyQueijos.length > 0) {
        setInventory(inv => {
          const nextInv = { ...inv };
          readyQueijos.forEach(tipo => {
            const key = tipo === 'coalho' ? 'queijoCoalho' : tipo === 'mucarela' ? 'queijoMucarela' : tipo === 'buffalo_mozzarella' ? 'buffalo_mozzarella' : tipo === 'yogurt' ? 'yogurt' : 'queijoBrie';
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

      // --- SISTEMA DE CRISES ---
      // Epidemia (3% por dia, max 1 a cada 30 dias, -5% se bebedouro)
      const epidemicChance = hasBebedouro ? 0.025 : 0.03;
      if (Math.random() < epidemicChance && (currentDay - lastEpidemicDay) >= 30) {
        if (epidemicPrevented) {
          setEpidemicPrevented(false);
          logsToAdd.push({ msg: `💉 Vacina Veterinária bloqueou uma epidemia iminente!`, type: 'success' });
        } else {
          const affected = finalAnimals.filter(() => Math.random() < 0.3);
          if (affected.length > 0) {
            setLastEpidemicDay(nextDayValue);
            setAnimals(prev => prev.map(a => {
              if (affected.some(af => af.id === a.id)) {
                // IMPROVEMENT 7: stress state from epidemic (-30 happiness drop)
                return { ...a, happiness: Math.max(0, a.happiness - 30), stressedDays: 3 };
              }
              return a;
            }));
            logsToAdd.push({ msg: `🦠 Epidemia! ${affected.length} animais foram afetados e perderam 30 de felicidade!`, type: 'error' });
            setTimeout(() => addNotification(`🦠 Epidemia atingiu ${affected.length} animais da fazenda!`, 'warning', nextDayValue), 0);
            triggerAudioResult(() => sfx.playSound('error'));
          }
        }
      }

      // Seca prolongada (5% no verão)
      {
        let currentDrought = droughtDaysRemaining;
        if (currentDrought > 0) {
          logsToAdd.push({ msg: `🏜️ Seca prolongada! Custo de água triplicado este dia.`, type: 'error' });
          setDroughtDaysRemaining(prev => prev - 1);
          // Additional water cost handled below via extra gold deduction
          // BUG FIX: gera dívida se ouro insuficiente (consistente com o sistema de dívida)
          setGold(prev => {
            const cost = waterCost * 2;
            if (prev < cost) {
              setDebt(d => d + (cost - prev));
              return 0;
            }
            return prev - cost;
          }); // extra 2x cost (total 3x)
        } else if (currentSeasonIdx === 1 && Math.random() < 0.05) {
          logsToAdd.push({ msg: `🏜️ Uma seca prolongada começou! Custo de água será triplicado por 3 dias!`, type: 'error' });
          setTimeout(() => addNotification('🏜️ Seca prolongada por 3 dias! Custo de água triplicado!', 'warning', nextDayValue), 0);
          setDroughtDaysRemaining(3);
        }
      }

      // Roubo noturno (4% de chance, não ocorre nos primeiros 5 dias)
      // BUG FIX: protege dias iniciais de roubo para não punir jogador recém-começado
      if (currentDay > 5 && Math.random() < 0.04) {
        const stolenPercent = 0.2 + Math.random() * 0.2;
        setInventory(prev => ({
          ...prev,
          milk: Math.floor(prev.milk * (1 - stolenPercent)),
          wool: Math.floor(prev.wool * (1 - stolenPercent)),
          egg: Math.floor(prev.egg * (1 - stolenPercent)),
          cheese: Math.floor(prev.cheese * (1 - stolenPercent)),
          goat_milk: Math.floor(prev.goat_milk * (1 - stolenPercent)),
          buffalo_milk: Math.floor(prev.buffalo_milk * (1 - stolenPercent)),
          duck_egg: Math.floor(prev.duck_egg * (1 - stolenPercent)),
          goose_egg: Math.floor(prev.goose_egg * (1 - stolenPercent)),
        }));
        logsToAdd.push({ msg: `🦹 Roubo noturno! Perdeu ${Math.round(stolenPercent * 100)}% do inventário de produtos!`, type: 'error' });
        setTimeout(() => addNotification(`🦹 Roubo noturno! Perdeu ${Math.round(stolenPercent * 100)}% do inventário!`, 'warning', nextDayValue), 0);
      }

      // --- SISTEMA DE TURISMO ---
      if (hasTourism && nextDayValue % 7 === 0) {
        const pavaoCount = finalAnimals.filter(a => a.type === 'pavao').length;
        const avestruzCount = finalAnimals.filter(a => a.type === 'avestruz').length;
        const jacareCount = finalAnimals.filter(a => a.type === 'jacare').length;
        const alpacaCount = finalAnimals.filter(a => a.type === 'alpaca').length;
        const coelhoAngoraCount = finalAnimals.filter(a => a.type === 'coelho_angora').length;
        let tourismRevenue = (farmLevel * 20) + (finalAnimals.length * 5) + (pavaoCount * 30) + (avestruzCount * 40) + (jacareCount * 60) + (alpacaCount * 15) + (coelhoAngoraCount * 10);
        const happyAnimalsBonus = finalAnimals.filter(a => a.happiness >= 90).length * 3;
        tourismRevenue += happyAnimalsBonus;
        const allHappy = finalAnimals.length > 0 && finalAnimals.every(a => a.happiness >= 80);
        if (allHappy) tourismRevenue = Math.round(tourismRevenue * 1.5);
        if (prestigePoints >= 50) tourismRevenue = Math.round(tourismRevenue * 1.1);
        setGold(prev => prev + tourismRevenue);
        logsToAdd.push({ msg: `🏕️ Turistas visitaram sua fazenda! +${tourismRevenue} moedas de receita de turismo!`, type: 'success' });
        setTimeout(() => addNotification(`🏕️ Visita de turistas! +${tourismRevenue} moedas!`, 'success', nextDayValue), 0);
      }

      // --- SISTEMA DE FEIRAS E CONCURSOS ---

      // Fair 1: Feira Agropecuária (every 30 days)
      if (nextDayValue >= nextFairDay) {
        const npcScore = () => 55 + Math.floor(Math.random() * 40);
        let fairGold = 0; let fairWins = 0;
        const fairLog: { msg: string; type: LogMessage['type'] }[] = [];

        const leiteiros = finalAnimals.filter(a => ['vaca','cabra','bufalo','alpaca'].includes(a.type));
        if (leiteiros.length > 0) {
          const best = leiteiros.reduce((a,b) => calcFairScore(a) > calcFairScore(b) ? a : b);
          if (calcFairScore(best) > npcScore()) {
            fairGold += 180; fairWins++;
            fairLog.push({ msg: `🥛 Feira: ${best.name} venceu Melhor Leiteiro! +180💰`, type: 'success' });
          } else {
            fairLog.push({ msg: `🥛 Feira: Perdeu Melhor Leiteiro. Melhore a produção semanal!`, type: 'info' });
          }
        }

        const fibras = finalAnimals.filter(a => ['ovelha','lhama','alpaca','coelho_angora'].includes(a.type));
        if (fibras.length > 0) {
          const best = fibras.reduce((a,b) => calcFairScore(a) > calcFairScore(b) ? a : b);
          if (calcFairScore(best) > npcScore()) {
            fairGold += 180; fairWins++;
            fairLog.push({ msg: `🧶 Feira: ${best.name} venceu Melhor Fibra! +180💰`, type: 'success' });
          } else {
            fairLog.push({ msg: `🧶 Feira: Perdeu Melhor Fibra.`, type: 'info' });
          }
        }

        const aves = finalAnimals.filter(a => ['galinha','pato','ganso','codorna'].includes(a.type));
        if (aves.length > 0) {
          const best = aves.reduce((a,b) => calcFairScore(a) > calcFairScore(b) ? a : b);
          if (calcFairScore(best) > npcScore()) {
            fairGold += 180; fairWins++;
            fairLog.push({ msg: `🥚 Feira: ${best.name} venceu Melhor Ave! +180💰`, type: 'success' });
          } else {
            fairLog.push({ msg: `🥚 Feira: Perdeu Melhor Ave.`, type: 'info' });
          }
        }

        if (farmLevel >= 6) {
          const organicos = finalAnimals.filter(a => ['minhoca','caracol'].includes(a.type));
          if (organicos.length > 0) {
            const best = organicos.reduce((a,b) => calcFairScore(a) > calcFairScore(b) ? a : b);
            if (calcFairScore(best) > npcScore() - 10) {
              fairGold += 150; fairWins++;
              fairLog.push({ msg: `🌿 Feira: ${best.name} venceu Melhor Orgânico! +150💰`, type: 'success' });
            } else {
              fairLog.push({ msg: `🌿 Feira: Perdeu Melhor Orgânico.`, type: 'info' });
            }
          }
        }

        if (fairWins >= 3) { fairGold += 500; fairLog.push({ msg: `🏆 CAMPEÃO DA FEIRA AGROPECUÁRIA! +500💰 bônus!`, type: 'success' }); }
        const fairPrestige = fairWins * 10;
        if (fairPrestige > 0) {
          setPrestigePoints(prev => prev + fairPrestige);
          fairLog.push({ msg: `⭐ +${fairPrestige} Pontos de Prestígio pela Feira!`, type: 'system' });
        }

        if (fairGold > 0) {
          setGold(prev => prev + fairGold);
          logsToAdd.push(...fairLog);
          const newResult: FairResult = { day: nextDayValue, category: `Agropecuária - ${fairWins} cats`, winner: 'Fazenda Aurora', earned: fairGold };
          setFairResults(prev => [...prev, newResult]);
          setTimeout(() => { setShowFairResultModal(newResult); addNotification(`🎪 Feira Agropecuária: ${fairWins} vitórias, +${fairGold}💰!`, 'event', nextDayValue); }, 500);
        } else {
          logsToAdd.push(...fairLog);
          logsToAdd.push({ msg: `🎪 Feira Agropecuária passou. Nenhuma categoria vencida desta vez.`, type: 'info' });
        }
        setNextFairDay(nextDayValue + 30);
      }

      // Fair 2: Exposição de Raças (every 45 days, Level 5+)
      if (farmLevel >= 5 && nextDayValue >= nextExposicaoDay) {
        const npcExpScore = () => 60 + Math.floor(Math.random() * 35);
        let expGold = 0; let expWins = 0;
        const expLog: { msg: string; type: LogMessage['type'] }[] = [];

        const milkCandidates = finalAnimals.filter(a => ['vaca','cabra','bufalo'].includes(a.type));
        if (milkCandidates.length > 0) {
          const best = milkCandidates.reduce((a,b) => calcFairScore(a) > calcFairScore(b) ? a : b);
          if (calcFairScore(best) > npcExpScore()) {
            expGold += 300; expWins++;
            setAnimals(prev => prev.map(a => a.id === best.id ? { ...a, isCampiao: true } : a));
            setTimeout(() => triggerBigNotification(`${best.name} é CAMPEÃ!`, `Raça Leiteira — Título permanente + +300💰`, '🏆'), 500);
            expLog.push({ msg: `🏆 Exposição: ${best.name} é CAMPEÃ de Raça Leiteira! +300💰 + título permanente!`, type: 'success' });
          } else {
            expLog.push({ msg: `🏆 Exposição: Perdeu Raça Leiteira. Invista em traits positivos!`, type: 'info' });
          }
        }

        const fiberCandidates = finalAnimals.filter(a => ['ovelha','alpaca','coelho_angora'].includes(a.type));
        if (fiberCandidates.length > 0) {
          const best = fiberCandidates.reduce((a,b) => calcFairScore(a) > calcFairScore(b) ? a : b);
          if (calcFairScore(best) > npcExpScore()) {
            expGold += 300; expWins++;
            setAnimals(prev => prev.map(a => a.id === best.id ? { ...a, isCampiao: true } : a));
            expLog.push({ msg: `🧶 Exposição: ${best.name} é CAMPEÃ de Raça de Fibra! +300💰 + título!`, type: 'success' });
          } else {
            expLog.push({ msg: `🧶 Exposição: Perdeu Raça de Fibra.`, type: 'info' });
          }
        }

        if (farmLevel >= 12) {
          const exoticCandidates = finalAnimals.filter(a => ['avestruz','jacare','bicho_seda'].includes(a.type));
          if (exoticCandidates.length > 0) {
            const best = exoticCandidates.reduce((a,b) => calcFairScore(a) > calcFairScore(b) ? a : b);
            if (calcFairScore(best) > npcExpScore() - 5) {
              expGold += 400; expWins++;
              setAnimals(prev => prev.map(a => a.id === best.id ? { ...a, isCampiao: true } : a));
              expLog.push({ msg: `🦎 Exposição: ${best.name} é CAMPEÃO Exótico! +400💰 + título!`, type: 'success' });
            } else {
              expLog.push({ msg: `🦎 Exposição: Perdeu Exótico.`, type: 'info' });
            }
          }
        }

        const expPrestige = expWins * 20;
        if (expPrestige > 0) setPrestigePoints(prev => prev + expPrestige);
        if (expGold > 0) {
          setGold(prev => prev + expGold);
          logsToAdd.push(...expLog);
          logsToAdd.push({ msg: `⭐ +${expPrestige} Pontos de Prestígio pela Exposição!`, type: 'system' });
          const newResult: FairResult = { day: nextDayValue, category: `Exposição de Raças - ${expWins} cats`, winner: 'Fazenda Aurora', earned: expGold };
          setFairResults(prev => [...prev, newResult]);
          setTimeout(() => { setShowFairResultModal(newResult); addNotification(`🏆 Exposição de Raças: ${expWins} campeões, +${expGold}💰!`, 'event', nextDayValue); }, 600);
        } else {
          logsToAdd.push(...expLog);
        }
        setNextExposicaoDay(nextDayValue + 45);
      }

      // Fair 3: Feira Regional de Produtos (every 30 days, Level 6+)
      if (farmLevel >= 6 && nextDayValue >= nextFeiraProdutosDay) {
        const prodLog: { msg: string; type: LogMessage['type'] }[] = [];
        let prodGold = 0; let prodWins = 0;

        const hasQueijo = (inventory.queijoCoalho ?? 0) + (inventory.queijoMucarela ?? 0) + (inventory.queijoBrie ?? 0) + (inventory.queijo_cabra ?? 0) > 0;
        if (hasQueijo) {
          const score = (inventory.queijoCoalho ?? 0) * 1 + (inventory.queijoMucarela ?? 0) * 2 + (inventory.queijoBrie ?? 0) * 4 + (inventory.queijo_cabra ?? 0) * 2;
          if (score >= 2) {
            prodGold += 250; prodWins++;
            prodLog.push({ msg: `🧀 Feira de Produtos: Seu queijo venceu! +250💰`, type: 'success' });
          } else {
            prodLog.push({ msg: `🧀 Feira de Produtos: Queijo insuficiente para vencer.`, type: 'info' });
          }
        }

        const hasTextil = (inventory.scarf ?? 0) + (inventory.manta_premium ?? 0) + (inventory.tecido_alpaca ?? 0) + (inventory.cachecol_angora ?? 0) > 0;
        if (hasTextil) {
          const score = (inventory.scarf ?? 0) * 1 + (inventory.cachecol_angora ?? 0) * 2 + (inventory.tecido_alpaca ?? 0) * 3 + (inventory.manta_premium ?? 0) * 6;
          if (score >= 3) {
            prodGold += 200; prodWins++;
            prodLog.push({ msg: `🧶 Feira de Produtos: Seu têxtil venceu! +200💰`, type: 'success' });
          } else {
            prodLog.push({ msg: `🧶 Feira de Produtos: Têxtil insuficiente.`, type: 'info' });
          }
        }

        if (farmLevel >= 15) {
          const hasRare = (inventory.bolsa_exotica ?? 0) + (inventory.colete_couro ?? 0) > 0;
          if (hasRare) {
            prodGold += 500; prodWins++;
            prodLog.push({ msg: `🏺 Feira de Produtos: Produto raro venceu a categoria! +500💰`, type: 'success' });
          }
        }

        const prodPrestige = prodWins * 15;
        if (prodPrestige > 0) setPrestigePoints(prev => prev + prodPrestige);
        if (prodGold > 0) {
          setGold(prev => prev + prodGold);
          logsToAdd.push(...prodLog);
          if (prodPrestige > 0) logsToAdd.push({ msg: `⭐ +${prodPrestige} Pontos de Prestígio!`, type: 'system' });
          const newResult: FairResult = { day: nextDayValue, category: `Feira de Produtos - ${prodWins} cats`, winner: 'Fazenda Aurora', earned: prodGold };
          setFairResults(prev => [...prev, newResult]);
          setTimeout(() => { setShowFairResultModal(newResult); addNotification(`🛒 Feira de Produtos: ${prodWins} vitórias, +${prodGold}💰!`, 'event', nextDayValue); }, 700);
        } else {
          logsToAdd.push(...prodLog);
          logsToAdd.push({ msg: `🛒 Feira Regional de Produtos passou. Acumule mais produtos para vencer!`, type: 'info' });
        }
        setNextFeiraProdutosDay(nextDayValue + 30);
      }

      // Fair 4: Feira de Animais Exóticos (every 60 days, Level 15+ AND licencaExotica)
      if (farmLevel >= 15 && licencaExotica && nextDayValue >= nextFeiraExoticaDay) {
        const exoticLog: { msg: string; type: LogMessage['type'] }[] = [];
        let exoticGold = 0;
        const exoticAnimals = finalAnimals.filter(a => ['avestruz','jacare','bicho_seda','caracol','ra'].includes(a.type));

        if (exoticAnimals.length > 0) {
          const npcExoticScore = 70 + Math.floor(Math.random() * 30);
          const scores = exoticAnimals.map(a => {
            const ageBonus = Math.min(50, (a.age ?? 0) * 0.2);
            const rarityBonus: Record<string, number> = { jacare: 40, avestruz: 30, bicho_seda: 20, caracol: 15, ra: 10 };
            return calcFairScore(a) + ageBonus + (rarityBonus[a.type] ?? 0);
          });
          const maxScore = Math.max(...scores);
          const winner = exoticAnimals[scores.indexOf(maxScore)];

          if (maxScore > npcExoticScore) {
            exoticGold = 600 + Math.floor(maxScore * 5);
            setAnimals(prev => prev.map(a => a.id === winner.id ? { ...a, isCampiao: true } : a));
            exoticLog.push({ msg: `🦎 Feira Exótica: ${winner.name} (${winner.type}) venceu com ${Math.round(maxScore)} pontos! +${exoticGold}💰!`, type: 'success' });
            setPrestigePoints(prev => prev + 30);
            exoticLog.push({ msg: `⭐ +30 Pontos de Prestígio pela Feira Exótica!`, type: 'system' });
          } else {
            exoticLog.push({ msg: `🦎 Feira Exótica: Não foi desta vez. NPC teve ${npcExoticScore} pontos.`, type: 'info' });
          }
        } else {
          exoticLog.push({ msg: `🦎 Feira Exótica: Sem animais exóticos para competir! (Avestruz, Jacaré, etc.)`, type: 'event' });
        }

        if (exoticGold > 0) {
          setGold(prev => prev + exoticGold);
          const newResult: FairResult = { day: nextDayValue, category: 'Feira Exótica', winner: 'Fazenda Aurora', earned: exoticGold };
          setFairResults(prev => [...prev, newResult]);
          setTimeout(() => { setShowFairResultModal(newResult); addNotification(`🐍 Feira Exótica: +${exoticGold}💰!`, 'event', nextDayValue); }, 800);
        }
        logsToAdd.push(...exoticLog);
        setNextFeiraExoticaDay(nextDayValue + 60);
      }

      // Fair 5: Festival Cultural da Aurora (every 120 days, Level 8+)
      if (farmLevel >= 8 && nextDayValue >= nextFestivalDay) {
        const festLog: { msg: string; type: LogMessage['type'] }[] = [];
        let festGold = 0;

        const farmScore = finalAnimals.reduce((sum, a) => sum + calcFairScore(a), 0) + farmLevel * 10;
        const npcFarmScore = 200 + Math.floor(Math.random() * 300);

        festLog.push({ msg: `🎪 FESTIVAL CULTURAL DA AURORA! Pontuação da fazenda: ${farmScore} vs NPC: ${npcFarmScore}`, type: 'event' });

        if (farmScore > npcFarmScore) {
          festGold += 1000 + farmLevel * 50;
          festLog.push({ msg: `🏆 Fazenda Aurora venceu o Festival! +${festGold}💰!`, type: 'success' });
          setPrestigePoints(prev => prev + 50);
          festLog.push({ msg: `⭐ +50 Pontos de Prestígio pelo Festival Cultural!`, type: 'system' });
          setMerchantActive(true);
          setTimeout(() => addNotification(`🎭 Festival Cultural: VITÓRIA! Comerciante especial por 3 dias! +${festGold}💰`, 'event', nextDayValue), 1000);
        } else {
          festGold = 300;
          festLog.push({ msg: `🎪 Festival: Não venceu, mas recebeu 300💰 de participação!`, type: 'info' });
          setPrestigePoints(prev => prev + 15);
        }

        setGold(prev => prev + festGold);
        logsToAdd.push(...festLog);
        const newResult: FairResult = { day: nextDayValue, category: 'Festival Cultural', winner: farmScore > npcFarmScore ? 'Fazenda Aurora' : 'NPC', earned: festGold };
        setFairResults(prev => [...prev, newResult]);
        setTimeout(() => setShowFairResultModal(newResult), 1200);
        setNextFestivalDay(nextDayValue + 120);
      }

      // --- SISTEMA DE PEÕES (WORKERS) ---
      if (workers.length > 0) {
        const workerCost = workers.reduce((sum, w) => sum + w.dailyCost, 0);
        setGold(prev => prev - workerCost);
        logsToAdd.push({ msg: `👷 Peões trabalharam hoje! Custo diário: -${workerCost}💰`, type: 'info' });

        // --- Tratador: alimenta todos os animais ---
        if (workers.some(w => w.role === 'tratador')) {
          setAnimals(prev => prev.map(a => ({ ...a, hunger: Math.min(100, a.hunger + 40) })));
        }

        // --- Veterinário: cura doenças + +5 felicidade ---
        if (workers.some(w => w.role === 'veterinario')) {
          setAnimals(prev => prev.map(a => ({
            ...a,
            happiness: Math.min(100, (a.happiness ?? 0) + 5),
            isSick: false, sickDays: 0, stressedDays: 0, lowHappinessDays: 0,
          })));
        }

        // --- Tratador Exótico: +5 felicidade + -epidemia para exóticos ---
        if (workers.some(w => w.role === 'tratador_exotico')) {
          setAnimals(prev => prev.map(a => {
            if (['jacare', 'ra', 'caracol'].includes(a.type)) {
              return { ...a, happiness: Math.min(100, (a.happiness ?? 0) + 5), isSick: false, sickDays: 0 };
            }
            return a;
          }));
        }

        // --- Ordenhador: coleta leite de vaca/cabra/bufalo adultos; tosquia alpaca quando woolReady ---
        if (workers.some(w => w.role === 'ordenhador')) {
          let cowMilkCollected = 0;
          let goatMilkCollected = 0;
          let buffaloMilkCollected = 0;
          let alpacaWoolCollected = 0;
          setAnimals(prev => prev.map(a => {
            if (a.type === 'vaca' && a.isAdult !== false && a.hasProducedToday) {
              cowMilkCollected++;
              return { ...a, hasProducedToday: false };
            }
            if (a.type === 'cabra' && a.isAdult !== false && a.hasProducedToday) {
              goatMilkCollected++;
              return { ...a, hasProducedToday: false };
            }
            if (a.type === 'bufalo' && a.isAdult !== false && a.hasProducedToday) {
              buffaloMilkCollected++;
              return { ...a, hasProducedToday: false };
            }
            // Alpaca produces wool (woolReady), not milk — ordenhador tosquia alpaca
            if (a.type === 'alpaca' && a.isAdult !== false && a.woolReady) {
              alpacaWoolCollected++;
              return { ...a, woolReady: false, daysSinceLastWool: 0 };
            }
            return a;
          }));
          if (cowMilkCollected > 0) {
            setInventory(prev => ({ ...prev, milk: prev.milk + cowMilkCollected }));
            logsToAdd.push({ msg: `🥛 Ordenhador coletou +${cowMilkCollected} leite(s) de vaca automaticamente!`, type: 'success' });
          }
          if (goatMilkCollected > 0) {
            setInventory(prev => ({ ...prev, goat_milk: (prev.goat_milk ?? 0) + goatMilkCollected }));
            logsToAdd.push({ msg: `🐐 Ordenhador coletou +${goatMilkCollected} leite(s) de cabra automaticamente!`, type: 'success' });
          }
          if (buffaloMilkCollected > 0) {
            setInventory(prev => ({ ...prev, buffalo_milk: (prev.buffalo_milk ?? 0) + buffaloMilkCollected }));
            logsToAdd.push({ msg: `🐃 Ordenhador coletou +${buffaloMilkCollected} leite(s) de búfala automaticamente!`, type: 'success' });
          }
          if (alpacaWoolCollected > 0) {
            setInventory(prev => ({ ...prev, alpaca_wool: (prev.alpaca_wool ?? 0) + alpacaWoolCollected }));
            logsToAdd.push({ msg: `🦙 Ordenhador tosquiou +${alpacaWoolCollected} lã(s) de alpaca automaticamente!`, type: 'success' });
          }
        }

        // --- Tosquiador: coleta lã de ovelha e coelho angorá com chance de premium ---
        if (workers.some(w => w.role === 'tosquiador')) {
          let woolCollected = 0;
          let angoraCollected = 0;
          setAnimals(prev => prev.map(a => {
            if (a.type === 'ovelha' && a.isAdult !== false && a.woolReady) {
              woolCollected++;
              return { ...a, woolReady: false, daysUntilWool: 7, daysSinceLastWool: 0 };
            }
            if (a.type === 'coelho_angora' && a.isAdult !== false && a.woolReady) {
              angoraCollected++;
              return { ...a, woolReady: false, daysUntilWool: 5, daysSinceLastWool: 0 };
            }
            return a;
          }));
          if (woolCollected > 0) {
            const bonus = Math.random() < 0.1 ? 1 : 0;
            setInventory(prev => ({ ...prev, wool: prev.wool + woolCollected + bonus }));
            logsToAdd.push({ msg: `✂️ Tosquiador coletou +${woolCollected + bonus} lã(s)${bonus > 0 ? ' (lã premium!)' : ''} automaticamente!`, type: 'success' });
          }
          if (angoraCollected > 0) {
            setInventory(prev => ({ ...prev, angora_wool: (prev.angora_wool ?? 0) + angoraCollected }));
            logsToAdd.push({ msg: `🐇 Tosquiador coletou +${angoraCollected} lã angorá automaticamente!`, type: 'success' });
          }
        }

        // --- Avicultor: coleta ovos de galinha/codorna/pato; coleta penas de avestruz (woolReady) ---
        if (workers.some(w => w.role === 'avicultor')) {
          let eggsCollected = 0;
          let quailEggs = 0;
          let duckEggs = 0;
          let ostrichFeathers = 0;
          setAnimals(prev => prev.map(a => {
            if (a.type === 'galinha' && a.isAdult !== false && a.hasProducedToday) {
              eggsCollected++;
              return { ...a, hasProducedToday: false };
            }
            if (a.type === 'codorna' && a.isAdult !== false && a.hasProducedToday) {
              quailEggs++;
              return { ...a, hasProducedToday: false };
            }
            if (a.type === 'pato' && a.isAdult !== false && a.hasProducedToday) {
              duckEggs++;
              return { ...a, hasProducedToday: false };
            }
            // Avestruz produces pena_grande via woolReady (not hasProducedToday)
            if (a.type === 'avestruz' && a.isAdult !== false && a.woolReady) {
              ostrichFeathers++;
              return { ...a, woolReady: false, daysSinceLastWool: 0 };
            }
            return a;
          }));
          if (eggsCollected > 0) {
            setInventory(prev => ({ ...prev, egg: prev.egg + eggsCollected }));
            logsToAdd.push({ msg: `🥚 Avicultor coletou +${eggsCollected} ovo(s) de galinha!`, type: 'success' });
          }
          if (quailEggs > 0) {
            setInventory(prev => ({ ...prev, quail_egg: (prev.quail_egg ?? 0) + quailEggs }));
            logsToAdd.push({ msg: `🥚 Avicultor coletou +${quailEggs} ovo(s) de codorna!`, type: 'success' });
          }
          if (duckEggs > 0) {
            setInventory(prev => ({ ...prev, duck_egg: (prev.duck_egg ?? 0) + duckEggs }));
            logsToAdd.push({ msg: `🥚 Avicultor coletou +${duckEggs} ovo(s) de pato!`, type: 'success' });
          }
          if (ostrichFeathers > 0) {
            setInventory(prev => ({ ...prev, pena_grande: (prev.pena_grande ?? 0) + ostrichFeathers }));
            logsToAdd.push({ msg: `🦤 Avicultor coletou +${ostrichFeathers} pena(s) grande(s) de avestruz!`, type: 'success' });
          }
        }

        // --- Composteiro: coleta húmus de minhocas (produzem a cada 3 dias via age%3) + bônus a cada 3 dias ---
        if (workers.some(w => w.role === 'composteiro')) {
          // Minhoca production is age-based (age % 3 === 0), not hasProducedToday
          const minhocasProducing = finalAnimals.filter(
            a => a.type === 'minhoca' && a.isAdult !== false && (a.age || 0) > 0 && (a.age || 0) % 3 === 0
          ).length;
          const bonusHumus = nextDayValue % 3 === 0 ? 1 : 0;
          // Avoid double-counting: the main loop already added humus via setTimeout;
          // the composteiro adds any minhocas it "supervises" that didn't produce in the main loop
          // (this covers minhocas on days the composteiro should reinforce collection).
          // We only add the worker bonus here to avoid duplicate humus from main loop.
          const totalHumus = bonusHumus;
          if (minhocasProducing > 0 || bonusHumus > 0) {
            if (totalHumus > 0) {
              setInventory(prev => ({ ...prev, humus: (prev.humus ?? 0) + totalHumus }));
            }
            logsToAdd.push({ msg: `🌱 Composteiro supervisionou ${minhocasProducing} minhoca(s)${bonusHumus > 0 ? ' + bônus de compostagem!' : '!'} `, type: 'success' });
          }
        }

        // --- Queijeiro: converte 3 leites em 1 queijo coalho (entra na maturação de 1 dia) ---
        if (workers.some(w => w.role === 'queijeiro')) {
          const currentMilk = inventory.milk ?? 0;
          if (currentMilk >= 3) {
            logsToAdd.push({ msg: `🧀 Queijeiro colocou 1 Queijo Coalho para maturar (pronto amanhã)!`, type: 'success' });
            setInventory(prev => ({ ...prev, milk: (prev.milk ?? 0) - 3 }));
            setQueijosEmMaturacao(prev => [...prev, { tipo: 'coalho', diasRestantes: 1 }]);
          }
        }
      }

      // --- BIOME BONUSES ---
      if (landBiomes.length > 0) {
        const hasPomar = landBiomes.some(b => b.biome === 'pomar');
        if (hasPomar) {
          setAnimals(prev => prev.map(a => ({ ...a, happiness: Math.min(100, (a.happiness ?? 0) + 2) })));
        }

        // Lago biome: produces 1 fish every 3 days
        const lagoCount = landBiomes.filter(b => b.biome === 'lago').length;
        if (lagoCount > 0 && nextDayValue % 3 === 0) {
          const fishAmt = lagoCount;
          setInventory(prev => ({ ...prev, peixe: (prev.peixe ?? 0) + fishAmt }));
          setBiomeWeeklyIncome(prev => ({ ...prev, lago: prev.lago + fishAmt * 45 }));
          logsToAdd.push({ msg: `🐟 Lago produziu ${fishAmt} peixe(s)!`, type: 'success' });
        }

        // Floresta biome: produces honey every 5 days, mushroom every 4 days
        const florestaCount = landBiomes.filter(b => b.biome === 'floresta').length;
        if (florestaCount > 0 && nextDayValue % 5 === 0) {
          const melAmt = florestaCount;
          setInventory(prev => ({ ...prev, mel: (prev.mel ?? 0) + melAmt }));
          setBiomeWeeklyIncome(prev => ({ ...prev, floresta: prev.floresta + melAmt * 80 }));
          logsToAdd.push({ msg: `🍯 Floresta produziu ${melAmt} mel!`, type: 'success' });
        }
        if (florestaCount > 0 && nextDayValue % 4 === 0) {
          const cogAmt = florestaCount;
          setInventory(prev => ({ ...prev, cogumelo: (prev.cogumelo ?? 0) + cogAmt }));
          setBiomeWeeklyIncome(prev => ({ ...prev, floresta: prev.floresta + cogAmt * 35 }));
          logsToAdd.push({ msg: `🍄 Floresta produziu ${cogAmt} cogumelo(s)!`, type: 'success' });
        }
      }

      // --- SISTEMA DE DÍVIDA ---
      // Aplicar juros de 5% sobre dívida existente (antes de verificar game over)
      if (debt > 0) {
        const debtInterest = Math.round(debt * 0.05);
        setDebt(prev => Math.round(prev * 1.05));
        logsToAdd.push({ msg: `💳 Juros de 5% sobre dívida: ${debtInterest} moedas adicionados.`, type: 'error' });
      }
      // Verificar se a dívida passa de 1000 (game over) — usa debt após juros estimados
      const debtAfterInterest = debt > 0 ? Math.round(debt * 1.05) : debt;
      if (debtAfterInterest > 1000) {
        logsToAdd.push({ msg: `💸 FALÊNCIA! Sua fazenda acumulou uma dívida impagável de ${debtAfterInterest} moedas. Fim de jogo!`, type: 'error' });
        setTimeout(() => addNotification(`💸 FALÊNCIA! Dívida de ${debtAfterInterest} moedas. Sua fazenda faliu!`, 'warning', nextDayValue), 0);
      }

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

  // Previsão de preço para os próximos dias baseada na tendência histórica
  const getPriceForecast = (itemType: string): { day1: number; day2: number; day3: number; trend: number } => {
    const hist = priceHistory[itemType];
    if (!hist || hist.length < 3) return { day1: 0, day2: 0, day3: 0, trend: 0 };
    const last = hist.slice(-7);
    const avgChange = last.length >= 2 ? last.reduce((acc, v, i) => i === 0 ? acc : acc + (v - last[i - 1]), 0) / (last.length - 1) : 0;
    const lastPrice = last[last.length - 1];
    return {
      day1: Math.max(1, Math.round(lastPrice + avgChange)),
      day2: Math.max(1, Math.round(lastPrice + avgChange * 2)),
      day3: Math.max(1, Math.round(lastPrice + avgChange * 3)),
      trend: avgChange,
    };
  };

  // Calcula tendência de preço baseada em priceHistory (últimos 3 vs 3 anteriores)
  const getPriceTrend = (itemType: string): { symbol: string; color: string; pct: number } => {
    const hist = priceHistory[itemType];
    if (!hist || hist.length < 6) return { symbol: '→', color: 'text-yellow-500', pct: 0 };
    const recent = hist.slice(-3);
    const older = hist.slice(-6, -3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / 3;
    const olderAvg = older.reduce((a, b) => a + b, 0) / 3;
    if (olderAvg === 0) return { symbol: '→', color: 'text-yellow-500', pct: 0 };
    const pct = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
    if (pct > 5) return { symbol: '▲', color: 'text-green-600 font-black', pct };
    if (pct < -5) return { symbol: '▼', color: 'text-red-500 font-black', pct };
    return { symbol: '→', color: 'text-yellow-500', pct };
  };

  // Indicador de frescor
  const getFreshnessIndicator = (key: 'milk' | 'egg' | 'goat_milk' | 'duck_egg' | 'goose_egg' | 'buffalo_milk' | 'fertile_egg') => {
    const f = productFreshness[key];
    if (f >= 3) return <span className="text-[9px] text-green-600 font-black ml-1">●{f}d</span>;
    if (f >= 2) return <span className="text-[9px] text-yellow-500 font-black ml-1">●{f}d</span>;
    return <span className="text-[9px] text-red-500 font-black animate-pulse ml-1">●{Math.ceil(f)}d</span>;
  };

  // BUG 16 FIX: usa galinha (animal mais barato) como referência para game over
  // Também considera falência por dívida > 1000
  const isGameOver = (animals.length === 0 && gold < getAnimalPurchasePrice('galinha')) || debt > 1000;

  // Improvement 2: Daily profit helper
  const getAnimalDailyProfit = (type: AnimalType): { revenue: number, cost: number, profit: number } => {
    const feedCostMap: Record<string, number> = {
      vaca: 3, boi: 3, bufalo: 3,
      ovelha: 3, cabra: 3, lhama: 3, alpaca: 3,
      galinha: 2, codorna: 2, pavao: 2,
      pato: 4, ganso: 4,
      coelho_angora: 2,
      ra: 6, avestruz: 6, jacare: 6,
      minhoca: 0, caracol: 0, bicho_seda: 0,
    };
    const cost = feedCostMap[type] ?? 0;
    let revenue = 0;
    if (type === 'vaca') revenue = getItemBaseSellPrice('milk') * 1; // ~1/day
    else if (type === 'ovelha') revenue = getItemBaseSellPrice('wool') / 3; // every 3 days
    else if (type === 'boi') revenue = 0; // sell on maturity
    else if (type === 'galinha') revenue = getItemBaseSellPrice('egg') * 1;
    else if (type === 'cabra') revenue = getItemBaseSellPrice('goat_milk') * 2 * (20/35); // 20d lactation / 35d cycle
    else if (type === 'lhama') revenue = getItemBaseSellPrice('llama_wool') / 30; // per season
    else if (type === 'pato') revenue = getItemBaseSellPrice('duck_egg') * 0.7; // seasonal avg
    else if (type === 'ganso') revenue = getItemBaseSellPrice('goose_egg') / 3;
    else if (type === 'bufalo') revenue = getItemBaseSellPrice('buffalo_milk') * 3;
    else if (type === 'pavao') revenue = getItemBaseSellPrice('peacock_feather') / 7;
    else if (type === 'codorna') revenue = getItemBaseSellPrice('quail_egg') * 6;
    else if (type === 'alpaca') revenue = getItemBaseSellPrice('alpaca_wool') / 4;
    else if (type === 'minhoca') revenue = getItemBaseSellPrice('humus') / 3;
    else if (type === 'caracol') revenue = getItemBaseSellPrice('muco') / 3;
    else if (type === 'coelho_angora') revenue = getItemBaseSellPrice('angora_wool') / 5;
    else if (type === 'bicho_seda') revenue = getItemBaseSellPrice('seda_bruta') * 3 / 14;
    else if (type === 'ra') revenue = getItemBaseSellPrice('coxa_ra') / 7;
    else if (type === 'avestruz') revenue = getItemBaseSellPrice('pena_grande') / 7;
    else if (type === 'jacare') revenue = getItemBaseSellPrice('carne_jacare') / 60; // very long term
    revenue = Math.round(revenue * 10) / 10;
    const profit = Math.round((revenue - cost) * 10) / 10;
    return { revenue, cost, profit };
  };

  // Improvement 5: trigger big notification helper
  const triggerBigNotification = (title: string, body: string, emoji: string, color: string = '#064e3b') => {
    setBigNotification({ title, body, emoji, color });
    setTimeout(() => setBigNotification(null), 3000);
  };

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

      {/* Improvement 5: Big Notification Banner */}
      <AnimatePresence>
        {bigNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none"
          >
            <div className="bg-[#064e3b] border-4 border-[#fbbf24] rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4">
              <div className="text-6xl mb-3">{bigNotification.emoji}</div>
              <div className="text-2xl font-black text-[#fef3c7] font-display">{bigNotification.title}</div>
              <div className="text-sm text-[#fde68a] mt-2 font-mono">{bigNotification.body}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                
                {/* Indicador de progresso XP */}
                {farmLevel < 20 ? (() => {
                  const xpCurrent = getXpForLevel(farmLevel);
                  const xpNext = getXpForLevel(farmLevel + 1);
                  const xpProgress = farmXp - xpCurrent;
                  const xpNeeded = xpNext - xpCurrent;
                  const pct = Math.min(100, Math.round((xpProgress / xpNeeded) * 100));
                  return (
                    <div className="flex items-center gap-1.5 mt-1" title={`${farmXp} XP total • Faltam ${xpNext - farmXp} XP para Nível ${farmLevel + 1}`}>
                      <span className="text-[10px] text-white/90 font-mono font-bold uppercase tracking-wider shrink-0">
                        ⭐ {xpNext - farmXp} XP p/ Nv.{farmLevel + 1}
                      </span>
                      <div className="w-16 sm:w-24 bg-black/40 h-2 rounded-full overflow-hidden border border-[#92400e] shadow-inner flex shrink-0">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#fcd57e] font-mono font-bold shrink-0">
                        {pct}%
                      </span>
                    </div>
                  );
                })() : (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-yellow-300 font-mono font-bold uppercase tracking-wider">
                      🌌 Nível Máximo Atingido! ({farmXp} XP)
                    </span>
                  </div>
                )}
                {prestigePoints > 0 && (
                  <span className="text-[10px] text-yellow-200 font-mono mt-0.5">⭐ {prestigePoints} Prestígio</span>
                )}
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
              {debt > 0 && (
                <span className="text-red-600 font-bold text-xs ml-2" title={`Dívida acumulada com juros de 5%/dia. ${debt > 200 ? 'Não pode comprar animais!' : ''} ${debt > 500 ? 'Comerciante não aparece!' : ''} ${debt > 1000 ? 'FALÊNCIA!' : ''}`}>
                  💳 -{debt}
                </span>
              )}
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

            {/* 📋 Contratos Button */}
            <button
              onClick={() => {
                setShowContractsModal(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="relative bg-violet-600 border-3 border-violet-400 hover:bg-violet-500 text-white font-mono font-black text-sm px-4 py-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#4c1d95] cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 focus:outline-none"
              title="Contratos de fornecimento"
            >
              <span>📋</span>
              <span>Contratos</span>
              {contracts.filter(c => c.active).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-[#451a03] text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {contracts.filter(c => c.active).length}
                </span>
              )}
            </button>

            {/* 🔧 Melhorias Button */}
            <button
              onClick={() => {
                setShowUpgradesModal(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="bg-orange-600 border-3 border-orange-400 hover:bg-orange-500 text-white font-mono font-black text-sm px-4 py-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#7c2d12] cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 focus:outline-none"
              title="Melhorias da Fazenda: poço, solar, irrigação, terreno"
            >
              <span>🔧</span>
              <span>Melhorias</span>
            </button>

            {/* 👷 Peões Button */}
            <button
              onClick={() => {
                setShowWorkersModal(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="bg-[#064e3b] border-3 border-[#fbbf24] hover:bg-[#065f46] text-[#fef3c7] font-mono font-black text-sm px-4 py-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#022c22] cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 focus:outline-none"
              title="Contratar Peões: trabalhadores que automatizam tarefas diárias"
            >
              <span>👷</span>
              <span>Peões {workers.length > 0 ? `(${workers.length})` : ''}</span>
            </button>

            {/* 🛡️ Seguro Status */}
            {insurance.active && (
              <div className="bg-green-700 border-3 border-green-400 text-white font-mono font-black text-xs px-3 py-2 rounded-full flex items-center gap-1" title={`Seguro ativo: ${insurance.daysLeft} dias restantes`}>
                🛡️ {insurance.daysLeft}d
              </div>
            )}

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
              <span>🏭</span>
              <span>Produção</span>
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

            {/* 📊 Recordes Button */}
            <button
              onClick={() => {
                setShowAllTimeStats(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="bg-[#92400e] border-3 border-[#fbbf24] hover:bg-[#78350f] text-[#fef3c7] p-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#78350f] cursor-pointer transition-all hover:scale-105 font-mono text-lg font-black leading-none flex items-center justify-center w-[46px] h-[46px] focus:outline-none"
              title="Recordes da Fazenda Aurora"
            >
              🏅
            </button>

            {/* 🐣 Reproduções Button */}
            <button
              onClick={() => {
                setShowReproModal(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="bg-pink-600 border-3 border-pink-400 hover:bg-pink-500 text-white p-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#9d174d] cursor-pointer transition-all hover:scale-105 font-mono text-lg font-black leading-none flex items-center justify-center w-[46px] h-[46px] focus:outline-none"
              title="Histórico de Reproduções"
            >
              🐣
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

        {/* --- MERCHANT SPECIAL SHOP --- */}
        {merchantActive && merchantSpecialItems.length > 0 && (
          <div className="mx-6 mt-3 bg-[#064e3b]/90 border-4 border-[#fbbf24] rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🧙‍♂️</span>
              <h3 className="text-[#fef3c7] font-display font-black text-sm uppercase tracking-wider">Loja Especial do Mercador</h3>
              <span className="text-[10px] text-[#fbbf24] font-mono ml-auto">Disponível hoje apenas!</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {merchantSpecialItems.map(itemId => {
                const item = MERCHANT_SPECIAL_ITEMS.find(i => i.id === itemId);
                if (!item) return null;
                return (
                  <div key={item.id} className="bg-[#022c22] border border-[#fbbf24]/50 rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-sm font-black text-[#fef3c7]">{item.label}</span>
                    <span className="text-[10px] text-[#fef3c7]/70 font-mono">{item.desc}</span>
                    <button
                      onClick={() => {
                        if (gold < item.price) { addLog(`💰 Moedas insuficientes! Precisa de ${item.price} moedas.`, 'error'); return; }
                        setGold(prev => prev - item.price);
                        addLog(`🧙‍♂️ Comprou ${item.label} por ${item.price}💰!`, 'success');
                        if (item.effect === 'prevent_epidemic') { setEpidemicPrevented(true); addLog('💉 Próxima epidemia será prevenida!', 'success'); }
                        else if (item.effect === 'fertilizante_7days') { setFertilizanteDays((prev: number) => prev + 7); addLog('🌱 +7 dias de fertilizante adicionados!', 'success'); }
                        else if (item.effect === 'premium_feed') {
                          setInventory((prev: any) => ({ ...prev, racaoBovina: (prev.racaoBovina ?? 0) + 10, racaoOvinos: (prev.racaoOvinos ?? 0) + 10, racaoAves: (prev.racaoAves ?? 0) + 10, racaoAquatica: (prev.racaoAquatica ?? 0) + 10, racaoCoelho: (prev.racaoCoelho ?? 0) + 10, racaoCarnivora: (prev.racaoCarnivora ?? 0) + 10 }));
                          addLog('🥣 +10 de cada ração adicionadas ao Armazém!', 'success');
                        }
                        else if (item.effect === 'bebedouro') { setHasBebedouro(true); addLog('🪣 Bebedouro Automático instalado! Animais sempre hidratados.', 'success'); }
                        else if (item.effect === 'cert_sanitario') { setHasCertSanitario(true); addLog('📜 Certificado Sanitário adquirido! +10% preço de carne permanente.', 'success'); }
                        else if (item.effect === 'licenca_exotica') { setLicencaExotica(true); addLog('📋 Licença Exótica obtida! Agora pode criar Jacaré legalmente.', 'success'); }
                        else if (item.effect === 'licenca_criadouro') { setLicencaCriadouro(true); addLog('📜 Licença de Criadouro obtida! Reprodução controlada desbloqueada.', 'success'); }
                        setMerchantSpecialItems(prev => prev.filter(id => id !== item.id));
                        triggerAudioResult(() => sfx.playSound('sell'));
                      }}
                      disabled={gold < item.price}
                      className="mt-auto bg-[#fbbf24] hover:bg-[#f59e0b] disabled:bg-stone-600 disabled:text-stone-400 text-[#78350f] font-black text-[10px] uppercase px-3 py-1.5 rounded-lg border-b-2 border-[#b45309] disabled:border-stone-700 transition-all cursor-pointer"
                    >
                      {item.price}💰 Comprar
                    </button>
                  </div>
                );
              })}
            </div>
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
                  CURRAL DA AURORA ({animals.length}/{landLots * 5} Animais)
                </h2>
                <span className="text-[10px] text-amber-200/90 font-mono font-bold block uppercase mt-0.5 tracking-wider leading-none">
                  🏡 Lote {landLots}/5 · Capacidade: {landLots * 5} animais {landLots < 5 ? '· Expanda o terreno!' : '· Máximo atingido'}
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

                {/* Improvement 2: Profit Panel Toggle */}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowProfitPanel(prev => !prev); triggerAudioResult(() => sfx.playSound('click')); }}
                  className={`${showProfitPanel ? 'bg-emerald-600 border-emerald-800' : 'bg-teal-700 border-teal-900'} text-white border-b-4 px-4 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5`}
                  title="Painel de Lucro: mostra receita, custo e lucro estimado por animal"
                >
                  💹 LUCRO
                </button>

                {/* Improvement 4: Ranking Modal */}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowRankingModal(true); triggerAudioResult(() => sfx.playSound('click')); }}
                  className="bg-amber-600 border-b-4 border-amber-800 text-white px-4 py-2.5 rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Ranking de Animais por produção semanal"
                >
                  🏆 RANKING
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
                  className="bg-[#fde68a]/30 border-4 border-[#fbbf24] rounded-[28px] p-5 flex flex-col gap-4 mb-2 shadow-inner overflow-hidden"
                >
                  {/* BUG 1 FIX: grade responsiva com scroll para que todos os animais sejam acessíveis em mobile e desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
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
                      Comprar + 1 🌾
                    </button>
                    <button
                      type="button"
                      onClick={(e) => buyAnimalFilhote('vaca', e)}
                      disabled={gold < 60}
                      className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra um filhote de Vaca por 60 moedas. Cresce em 10 dias."
                    >
                      🍼 Filhote 60💰
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
                      Comprar + 1 🌾
                    </button>
                    <button
                      type="button"
                      onClick={(e) => buyAnimalFilhote('ovelha', e)}
                      disabled={gold < 40}
                      className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra um filhote de Ovelha por 40 moedas. Cresce em 8 dias."
                    >
                      🍼 Filhote 40💰
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
                      Comprar + 1 🌾
                    </button>
                    <button
                      type="button"
                      onClick={(e) => buyAnimalFilhote('boi', e)}
                      disabled={gold < 75}
                      className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra um filhote de Boi por 75 moedas. Cresce em 15 dias."
                    >
                      🍼 Filhote 75💰
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
                      Comprar + 1 🌾
                    </button>
                  </div>

                  {/* Cabra (Nível 2+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 2 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv2+</span>}
                    {farmLevel >= 4 && <span className="absolute -top-2.5 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">10% Off</span>}
                    <span className="text-4xl">🐐</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Cabra Leiteira</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Leite premium 38💰/u. Ciclo de lactação de 20d + bônus passivo de felicidade!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('cabra')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('cabra', e)}
                      disabled={gold < getAnimalPurchasePrice('cabra') || farmLevel < 2}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      {farmLevel < 2 ? 'Nível 2+' : 'Comprar + 1 🌾'}
                    </button>
                    {farmLevel >= 2 && (
                      <button
                        type="button"
                        onClick={(e) => buyAnimalFilhote('cabra', e)}
                        disabled={gold < 55}
                        className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                        title="Compra um filhote de Cabra por 55 moedas. Cresce em 8 dias."
                      >
                        🍼 Filhote 55💰
                      </button>
                    )}
                  </div>

                  {/* Pato (Nível 1+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel >= 4 && <span className="absolute -top-2.5 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">10% Off</span>}
                    <span className="text-4xl">🦆</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Pato de Quintal</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Ovos de pato 18💰/u + penas! Reduz pragas 40%.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('pato')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('pato', e)}
                      disabled={gold < getAnimalPurchasePrice('pato')}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      Comprar + 1 🌾
                    </button>
                    <button
                      type="button"
                      onClick={(e) => buyAnimalFilhote('pato', e)}
                      disabled={gold < 25}
                      className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                      title="Compra um filhote de Pato por 25 moedas. Cresce em 6 dias."
                    >
                      🍼 Filhote 25💰
                    </button>
                  </div>

                  {/* Lhama (Nível 2+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 2 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv2+</span>}
                    {farmLevel >= 4 && <span className="absolute -top-2.5 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">10% Off</span>}
                    <span className="text-4xl">🦙</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Lhama de Lã</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Lã 45💰/u (Primavera). Não perde felicidade no Inverno!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('lhama')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('lhama', e)}
                      disabled={gold < getAnimalPurchasePrice('lhama') || farmLevel < 2}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      {farmLevel < 2 ? 'Nível 2+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>

                  {/* Ganso (Nível 3+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 3 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv3+</span>}
                    {farmLevel >= 4 && <span className="absolute -top-2.5 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">10% Off</span>}
                    <span className="text-4xl">🦢</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Ganso Vigia</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Ovos de ganso 50💰/u (Outono/Inverno). Alarme de eventos!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('ganso')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('ganso', e)}
                      disabled={gold < getAnimalPurchasePrice('ganso') || farmLevel < 3}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      {farmLevel < 3 ? 'Nível 3+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>

                  {/* Búfalo (Nível 4+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 4 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv4+</span>}
                    {farmLevel >= 4 && <span className="absolute -top-2.5 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">10% Off</span>}
                    <span className="text-4xl">🐃</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Búfalo Leiteiro</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Leite de búfala 55💰/u. Pode virar Muçarela 120💰!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('bufalo')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('bufalo', e)}
                      disabled={gold < getAnimalPurchasePrice('bufalo') || farmLevel < 4}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      {farmLevel < 4 ? 'Nível 4+' : 'Comprar + 1 🌾'}
                    </button>
                    {farmLevel >= 4 && (
                      <button
                        type="button"
                        onClick={(e) => buyAnimalFilhote('bufalo', e)}
                        disabled={gold < 110}
                        className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                        title="Compra um filhote de Búfalo por 110 moedas. Cresce em 12 dias."
                      >
                        🍼 Filhote 110💰
                      </button>
                    )}
                  </div>

                  {/* Pavão (Nível 5+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 5 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv5+</span>}
                    {farmLevel >= 5 && <span className="absolute -top-2.5 -right-2 bg-yellow-400 text-amber-900 font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">👑 Elite</span>}
                    <span className="text-4xl">🦚</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Pavão de Prestígio</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">+10% felicidade todos os animais. +3% preço de vendas. Penas 80💰/u!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('pavao')}</span>
                    <button
                      type="button"
                      onClick={(e) => buyAnimal('pavao', e)}
                      disabled={gold < getAnimalPurchasePrice('pavao') || farmLevel < 5}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      {farmLevel < 5 ? 'Nível 5+' : 'Comprar + 1 🌾'}
                    </button>
                    {farmLevel >= 5 && (
                      <button
                        type="button"
                        onClick={(e) => buyAnimalFilhote('pavao', e)}
                        disabled={gold < 175}
                        className="mt-1 bg-pink-500 hover:bg-pink-600 disabled:bg-stone-300 disabled:text-stone-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border-b-2 border-pink-800 tracking-wider active:translate-y-0.5 transition-all cursor-pointer"
                        title="Compra um filhote de Pavão por 175 moedas. Cresce em 20 dias."
                      >
                        🍼 Filhote 175💰
                      </button>
                    )}
                  </div>

                  {/* Codorna (Nível 3+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 3 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv3+</span>}
                    <span className="text-4xl">🐦</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Codorna</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">6 ovos de codorna/dia 22💰/u. Ração de galinha.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('codorna')}</span>
                    <button type="button" onClick={(e) => buyAnimal('codorna', e)} disabled={gold < getAnimalPurchasePrice('codorna') || farmLevel < 3}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 3 ? 'Nível 3+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>

                  {/* Alpaca (Nível 5+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 5 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv5+</span>}
                    <span className="text-4xl">🦙</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Alpaca</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Lã 65💰/u a cada 4 dias. Estresse térmico no verão.</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('alpaca')}</span>
                    <button type="button" onClick={(e) => buyAnimal('alpaca', e)} disabled={gold < getAnimalPurchasePrice('alpaca') || farmLevel < 5}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 5 ? 'Nível 5+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>

                  {/* Minhoca (Nível 6+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 6 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv6+</span>}
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Minhoca">
                      <ellipse cx="20" cy="28" rx="6" ry="8" fill="#c084fc"/>
                      <ellipse cx="14" cy="22" rx="6" ry="7" fill="#d8b4fe"/>
                      <ellipse cx="22" cy="16" rx="6" ry="7" fill="#c084fc"/>
                      <ellipse cx="27" cy="10" rx="5" ry="6" fill="#e879f9"/>
                      <circle cx="30" cy="7" r="4" fill="#f0abfc"/>
                      <circle cx="28.5" cy="5.5" r="1" fill="#1e1b4b"/>
                      <circle cx="31.5" cy="5.5" r="1" fill="#1e1b4b"/>
                      <line x1="29" y1="4" x2="28" y2="2" stroke="#a21caf" strokeWidth="1" strokeLinecap="round"/>
                      <line x1="31" y1="4" x2="32" y2="2" stroke="#a21caf" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Minhoca</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Produz húmus 35💰/u a cada 3 dias. Não precisa de ração!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('minhoca')}</span>
                    <button type="button" onClick={(e) => buyAnimal('minhoca', e)} disabled={gold < getAnimalPurchasePrice('minhoca') || farmLevel < 6}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 6 ? 'Nível 6+' : 'Comprar Kit 🌿'}
                    </button>
                  </div>

                  {/* Caracol (Nível 7+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 7 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv7+</span>}
                    <span className="text-4xl">🐌</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Caracol</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Muco 120💰/u a cada 3 dias. 2x na chuva. Sem ração!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('caracol')}</span>
                    <button type="button" onClick={(e) => buyAnimal('caracol', e)} disabled={gold < getAnimalPurchasePrice('caracol') || farmLevel < 7}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 7 ? 'Nível 7+' : 'Comprar + 1 🌿'}
                    </button>
                  </div>

                  {/* Coelho Angorá (Nível 8+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 8 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv8+</span>}
                    <span className="text-4xl">🐰</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Coelho Angorá</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Lã 90💰/u a cada 5 dias. Reproduz (máx 4x)!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('coelho_angora')}</span>
                    <button type="button" onClick={(e) => buyAnimal('coelho_angora', e)} disabled={gold < getAnimalPurchasePrice('coelho_angora') || farmLevel < 8}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 8 ? 'Nível 8+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>

                  {/* Bicho-da-Seda (Nível 10+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 10 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv10+</span>}
                    <span className="text-4xl">🐛</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Bicho-da-Seda</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">3 seda bruta (80💰/u) a cada 14 dias. Requer folha de amoreira/dia!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('bicho_seda')}</span>
                    <button type="button" onClick={(e) => buyAnimal('bicho_seda', e)} disabled={gold < getAnimalPurchasePrice('bicho_seda') || farmLevel < 10}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 10 ? 'Nível 10+' : 'Comprar Lote 🌿'}
                    </button>
                  </div>

                  {/* Rã (Nível 12+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 12 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv12+</span>}
                    <span className="text-4xl">🐸</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Rã</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Coxa de rã 70💰/u a cada 7 dias. +50% na chuva!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('ra')}</span>
                    <button type="button" onClick={(e) => buyAnimal('ra', e)} disabled={gold < getAnimalPurchasePrice('ra') || farmLevel < 12}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 12 ? 'Nível 12+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>

                  {/* Avestruz (Nível 15+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 15 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv15+</span>}
                    {farmLevel >= 15 && <span className="absolute -top-2.5 -right-2 bg-purple-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">🌟 Raro</span>}
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Avestruz">
                      {/* corpo */}
                      <ellipse cx="20" cy="28" rx="9" ry="8" fill="#d97706"/>
                      {/* pescoço */}
                      <rect x="18" y="14" width="5" height="14" rx="2.5" fill="#fbbf24"/>
                      {/* cabeça */}
                      <ellipse cx="20" cy="12" rx="5" ry="4" fill="#fbbf24"/>
                      {/* bico */}
                      <polygon points="24,11 28,12 24,13" fill="#f59e0b"/>
                      {/* olho */}
                      <circle cx="22" cy="11" r="1.2" fill="#1c1917"/>
                      <circle cx="22.4" cy="10.6" r="0.4" fill="white"/>
                      {/* pernas */}
                      <line x1="17" y1="35" x2="15" y2="40" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="23" y1="35" x2="25" y2="40" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/>
                      {/* pés */}
                      <line x1="15" y1="40" x2="12" y2="39" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="25" y1="40" x2="28" y2="39" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round"/>
                      {/* asa */}
                      <ellipse cx="13" cy="27" rx="5" ry="4" fill="#b45309" transform="rotate(-20 13 27)"/>
                    </svg>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Avestruz</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Penas 60💰/u (7d), carne 180💰, couro 300💰 (na morte)!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('avestruz')}</span>
                    <button type="button" onClick={(e) => buyAnimal('avestruz', e)} disabled={gold < getAnimalPurchasePrice('avestruz') || farmLevel < 15}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 15 ? 'Nível 15+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>

                  {/* Jacaré (Nível 18+) */}
                  <div className="flex flex-col items-center p-3.5 bg-white/90 rounded-[24px] border-2 border-[#fbbf24] w-full max-w-[190px] text-center shadow-md relative">
                    {farmLevel < 18 && <span className="absolute -top-2.5 -right-2 bg-stone-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">Nv18+</span>}
                    {farmLevel >= 18 && <span className="absolute -top-2.5 -right-2 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase scale-90">⚠️ Exótico</span>}
                    <span className="text-4xl">🐊</span>
                    <h4 className="font-display font-black text-[#78350f] text-xs uppercase mt-1">Jacaré</h4>
                    <p className="text-[8px] text-stone-500 font-mono mt-0.5 leading-tight">Carne 250💰, couro 400💰 (na morte). Requer Licença Exótica!</p>
                    <span className="text-[#92400e] text-xs font-mono font-bold mt-1">Custo: 💰 {getAnimalPurchasePrice('jacare')}</span>
                    <button type="button" onClick={(e) => buyAnimal('jacare', e)} disabled={gold < getAnimalPurchasePrice('jacare') || farmLevel < 18}
                      className="mt-2.5 bg-[#10b981] hover:bg-[#059669] disabled:bg-stone-300 disabled:text-stone-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl border-b-2 border-[#065f46] shadow-sm tracking-wider active:translate-y-0.5 transition-all cursor-pointer">
                      {farmLevel < 18 ? 'Nível 18+' : 'Comprar + 1 🌾'}
                    </button>
                  </div>

                  </div>{/* fim grid BUG 1 FIX */}
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
                {/* Worker Visual Feedback Bar */}
                {workers.length > 0 && (
                  <div className="col-span-full flex flex-wrap gap-2 mb-3">
                    {workers.map(worker => {
                      const def = WORKER_TYPES.find(w => w.role === worker.role);
                      return (
                        <div key={worker.id} className="flex items-center gap-1.5 bg-[#064e3b]/80 border border-[#fbbf24]/60 rounded-full px-3 py-1">
                          <span className="text-base">{def?.emoji ?? '👷'}</span>
                          <span className="text-[10px] font-mono text-[#fef3c7] font-black">{worker.name}</span>
                          <span className="text-[9px] text-[#fbbf24] font-mono">-{worker.dailyCost}💰/dia</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Feature 1: Animal Filter Bar */}
                <div className="col-span-full flex flex-wrap gap-2 mb-3">
                  <select value={animalFilter} onChange={e => setAnimalFilter(e.target.value)}
                    className="bg-[#064e3b] border-2 border-[#fbbf24] text-[#fef3c7] text-xs font-mono rounded-xl px-3 py-1.5">
                    <option value="all">🐾 Todos</option>
                    {[...new Set(animals.map(a => a.type))].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {(['happiness','production','age','name'] as const).map(s => (
                    <button key={s} onClick={() => { if (animalSort === s) setAnimalSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setAnimalSort(s); setAnimalSortDir('desc'); }}}
                      className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 ${animalSort === s ? 'bg-[#fbbf24] border-[#fbbf24] text-[#78350f]' : 'bg-transparent border-[#fbbf24]/40 text-[#fef3c7]'}`}>
                      {s === 'happiness' ? '😊 Feliz' : s === 'production' ? '📦 Prod' : s === 'age' ? '📅 Idade' : '🔤 Nome'}
                      {animalSort === s ? (animalSortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </button>
                  ))}
                  <button onClick={() => { setAnimalFilter('all'); setAnimalSort('production'); setAnimalSortDir('desc'); }}
                    className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 border-[#10b981]/60 text-[#10b981] bg-transparent">
                    🏆 Top Prod
                  </button>
                  <button onClick={() => { setAnimalFilter('all'); setAnimalSort('happiness'); setAnimalSortDir('asc'); }}
                    className="text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 border-red-400/60 text-red-400 bg-transparent">
                    ⚠️ Tristes
                  </button>
                  <button onClick={() => setAnimalFilter(animalFilter === 'ready' ? 'all' : 'ready')}
                    className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 ${animalFilter === 'ready' ? 'bg-yellow-400 border-yellow-400 text-yellow-900' : 'border-yellow-400/60 text-yellow-300 bg-transparent'}`}>
                    ⚡ Prontos
                  </button>
                  <span className="text-[10px] text-[#fef3c7]/60 font-mono self-center ml-1">
                    Mostrando {animals.filter(a => {
                      if (animalFilter === 'all') return true;
                      if (animalFilter === 'ready') return (a.type === 'vaca' && !a.hasProducedToday) || (a.type === 'ovelha' && a.woolReady) || ((a.type === 'galinha' || a.type === 'codorna') && !a.hasProducedToday) || (a.type === 'cabra' && a.isLactating) || (a.type === 'lhama' && (a.woolAccumulated ?? 0) > 0) || (a.type === 'pato' && a.feathersReady) || (a.type === 'bufalo' && !a.hasProducedToday);
                      return a.type === animalFilter;
                    }).length} de {animals.length} animais
                  </span>
                </div>
                <AnimatePresence>
                  {(() => {
                    const filteredAnimals = animals
                      .filter(a => {
                        if (animalFilter === 'all') return true;
                        if (animalFilter === 'ready') return (a.type === 'vaca' && !a.hasProducedToday) || (a.type === 'ovelha' && a.woolReady) || ((a.type === 'galinha' || a.type === 'codorna') && !a.hasProducedToday) || (a.type === 'cabra' && a.isLactating) || (a.type === 'lhama' && (a.woolAccumulated ?? 0) > 0) || (a.type === 'pato' && a.feathersReady) || (a.type === 'bufalo' && !a.hasProducedToday);
                        return a.type === animalFilter;
                      })
                      .sort((a, b) => {
                        let cmp = 0;
                        if (animalSort === 'happiness') cmp = (a.happiness ?? 0) - (b.happiness ?? 0);
                        else if (animalSort === 'production') cmp = (a.weeklyProduction ?? 0) - (b.weeklyProduction ?? 0);
                        else if (animalSort === 'age') cmp = (a.age ?? 0) - (b.age ?? 0);
                        else cmp = a.name.localeCompare(b.name);
                        return animalSortDir === 'asc' ? cmp : -cmp;
                      });
                    return filteredAnimals.map((animal) => {
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

                        {/* Champion badge */}
                        {animal.isCampiao && (
                          <div className="absolute -top-3.5 -right-2.5 z-10">
                            <span className="bg-yellow-400 text-yellow-900 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">🏆 Campeão</span>
                          </div>
                        )}

                        {/* Best friend decorative badge */}
                        {animal.isBestFriend && (
                          <div className="absolute -top-3.5 -left-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase shadow-md flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3s' }}>
                            <span className="animate-heart-pulse">💖</span> Melhor Amigo!
                          </div>
                        )}

                        {/* Badge de galinha super feliz (pode gerar ovo fértil) */}
                        {animal.type === 'galinha' && animal.happiness >= 95 && !animal.isBestFriend && (
                          <div className="absolute -top-3.5 -left-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase shadow-md flex items-center gap-1 animate-pulse" style={{ animationDuration: '2s' }}>
                            ✨ Feliz
                          </div>
                        )}

                        {/* IMPROVEMENT 1: Progressive happiness alert badges */}
                        {animal.happiness < 30 && !isCritical && (
                          <span className="absolute top-1 left-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse z-10">🔴 CRÍTICO</span>
                        )}
                        {animal.happiness >= 30 && animal.happiness < 50 && (
                          <span className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10">⚠️ TRISTE</span>
                        )}

                        {/* IMPROVEMENT 7: Stress badge */}
                        {(animal.stressedDays ?? 0) > 0 && (
                          <span className="absolute top-1 right-1 text-[8px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-black z-10">😰 Estressado ({animal.stressedDays}d)</span>
                        )}

                        {/* IMPROVEMENT 9: Sick badge */}
                        {animal.isSick && (
                          <span className="absolute top-6 left-1 text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-black animate-pulse z-10">🤒 Doente</span>
                        )}

                        {/* IMPROVEMENT 6: Premium quality badge */}
                        {animal.isHighQuality && (
                          <span className="absolute top-6 right-1 text-[8px] bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-black z-10">✨ Premium</span>
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
                              {animal.type === 'vaca' ? '🐄 Vaca Leiteira' : animal.type === 'ovelha' ? '🐑 Ovelha de Lã' : animal.type === 'boi' ? '🐂 Boi de Corte' : animal.type === 'galinha' ? '🐔 Galinha de Quintal' : animal.type === 'cabra' ? '🐐 Cabra Leiteira' : animal.type === 'lhama' ? '🦙 Lhama de Lã' : animal.type === 'pato' ? '🦆 Pato de Quintal' : animal.type === 'ganso' ? '🦢 Ganso Vigia' : animal.type === 'bufalo' ? '🐃 Búfalo Leiteiro' : animal.type === 'pavao' ? '🦚 Pavão de Prestígio' : animal.type === 'codorna' ? '🐦 Codorna' : animal.type === 'alpaca' ? '🦙 Alpaca' : animal.type === 'minhoca' ? '🪱 Minhoca' : animal.type === 'caracol' ? '🐌 Caracol' : animal.type === 'coelho_angora' ? '🐰 Coelho Angorá' : animal.type === 'bicho_seda' ? '🐛 Bicho-da-Seda' : animal.type === 'ra' ? '🐸 Rã' : animal.type === 'avestruz' ? '🦤 Avestruz' : animal.type === 'jacare' ? '🐊 Jacaré' : '🐾 Animal'}
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
                            {/* MECHANIC 3: Cabra — badge de lactação */}
                            {animal.type === 'cabra' && (
                              animal.isLactating ? (
                                <span
                                  className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-green-100 border border-green-400 text-green-800 cursor-help"
                                  title="Produzindo leite de cabra"
                                >
                                  🍼 Lactando
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-yellow-100 border border-yellow-400 text-yellow-800 cursor-help"
                                  title={`Em período de secagem: ${animal.lactationCycle ?? 0} dias restantes para a próxima lactação`}
                                >
                                  ⏳ Secagem ({animal.lactationCycle ?? 0}d)
                                </span>
                              )
                            )}
                            {/* MECHANIC 4: Lhama — badge de lã acumulada */}
                            {animal.type === 'lhama' && (
                              <span
                                className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-purple-100 border border-purple-300 text-purple-800 cursor-help"
                                title={`Lã acumulada ao longo das estações. Colheita disponível na Primavera com mínimo 3.`}
                              >
                                🧶 Lã: {animal.woolAccumulated ?? 0}/3
                              </span>
                            )}
                            {/* Filhote badge */}
                            {!animal.isAdult && animal.adulthoodDay !== undefined && (
                              <span
                                className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-pink-100 border border-pink-400 text-pink-800 cursor-help"
                                title={`Filhote: adulto no dia ${animal.adulthoodDay}`}
                              >
                                🍼 Filhote — adulto em {Math.max(0, animal.adulthoodDay - currentDay)}d
                              </span>
                            )}
                            {/* MECHANIC 5: Búfalo — badge de estresse térmico */}
                            {animal.type === 'bufalo' && animal.heatStress && (
                              <span
                                className="inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-red-100 border border-red-400 text-red-800 cursor-help animate-pulse"
                                title="Estresse térmico do verão: -3 felicidade/dia extra e produção de leite reduzida em 40%"
                              >
                                🌡️ Estresse Térmico
                              </span>
                            )}
                            {/* F1/F2: Idade e badge idoso */}
                            {animal.age !== undefined && animal.maxAge !== undefined && (() => {
                              const ratio = animal.age / animal.maxAge;
                              const isElder = ratio >= 0.75;
                              const lifeLabel = ratio < 0.33 ? 'Jovem' : ratio < 0.75 ? 'Adulto' : 'Idoso';
                              const lifeColor = ratio < 0.33 ? 'bg-green-100 border-green-300 text-green-800' : ratio < 0.75 ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-orange-100 border-orange-300 text-orange-800';
                              return (
                                <span
                                  className={`inline-flex items-center gap-1 mt-1 ml-1 text-[9px] font-mono font-black px-2 py-0.5 rounded-full border cursor-help ${lifeColor}`}
                                  title={isElder ? `Idoso: produz 30% menos, mas dá +2% de bônus para outros ${animal.type}s (stackable)` : `Dia ${animal.age} de ${animal.maxAge}`}
                                >
                                  {isElder ? '🧓 Idoso' : `📅 ${lifeLabel} (${animal.age}d)`}
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
                              {animal.type === 'cabra' && (
                                <>
                                  <span className="select-none">🐐</span>
                                  {animal.isLactating && animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🥛</span>}
                                </>
                              )}
                              {animal.type === 'lhama' && (
                                <>
                                  <span className="select-none">🦙</span>
                                  {(animal.woolAccumulated ?? 0) >= 3 && <span className="absolute -bottom-2 -right-1 text-base animate-wool-shiny select-none">🧶</span>}
                                </>
                              )}
                              {animal.type === 'pato' && (
                                <>
                                  <span className="select-none">🦆</span>
                                  {animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🥚</span>}
                                </>
                              )}
                              {animal.type === 'ganso' && (
                                <>
                                  <span className="select-none">🦢</span>
                                </>
                              )}
                              {animal.type === 'bufalo' && (
                                <>
                                  <span className="select-none">🐃</span>
                                  {animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-droplet-flow select-none">🥛</span>}
                                </>
                              )}
                              {animal.type === 'pavao' && (
                                <span className="select-none">🦚</span>
                              )}
                              {animal.type === 'codorna' && (
                                <>
                                  <span className="select-none">🐦</span>
                                  {animal.hasProducedToday && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🥚</span>}
                                </>
                              )}
                              {animal.type === 'alpaca' && (
                                <>
                                  <span className="select-none">🦙</span>
                                  {animal.woolReady && <span className="absolute -bottom-2 -right-1 text-base animate-wool-shiny select-none">🧶</span>}
                                </>
                              )}
                              {animal.type === 'minhoca' && <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="28" rx="6" ry="8" fill="#c084fc"/><ellipse cx="14" cy="22" rx="6" ry="7" fill="#d8b4fe"/><ellipse cx="22" cy="16" rx="6" ry="7" fill="#c084fc"/><ellipse cx="27" cy="10" rx="5" ry="6" fill="#e879f9"/><circle cx="30" cy="7" r="4" fill="#f0abfc"/><circle cx="28.5" cy="5.5" r="1" fill="#1e1b4b"/><circle cx="31.5" cy="5.5" r="1" fill="#1e1b4b"/></svg>}
                              {animal.type === 'caracol' && <span className="select-none">🐌</span>}
                              {animal.type === 'coelho_angora' && (
                                <>
                                  <span className="select-none">🐰</span>
                                  {animal.woolReady && <span className="absolute -bottom-2 -right-1 text-base animate-wool-shiny select-none">🧶</span>}
                                </>
                              )}
                              {animal.type === 'bicho_seda' && <span className="select-none">🐛</span>}
                              {animal.type === 'ra' && (
                                <>
                                  <span className="select-none">🐸</span>
                                  {animal.woolReady && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🍖</span>}
                                </>
                              )}
                              {animal.type === 'avestruz' && (
                                <>
                                  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="28" rx="9" ry="8" fill="#d97706"/><rect x="18" y="14" width="5" height="14" rx="2.5" fill="#fbbf24"/><ellipse cx="20" cy="12" rx="5" ry="4" fill="#fbbf24"/><polygon points="24,11 28,12 24,13" fill="#f59e0b"/><circle cx="22" cy="11" r="1.2" fill="#1c1917"/><line x1="17" y1="35" x2="15" y2="40" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/><line x1="23" y1="35" x2="25" y2="40" stroke="#92400e" strokeWidth="2" strokeLinecap="round"/><ellipse cx="13" cy="27" rx="5" ry="4" fill="#b45309" transform="rotate(-20 13 27)"/></svg>
                                  {animal.woolReady && <span className="absolute -bottom-2 -right-1 text-base animate-bounce select-none">🪶</span>}
                                </>
                              )}
                              {animal.type === 'jacare' && <span className="select-none">🐊</span>}
                            </div>

                            {/* Avatar tooltip */}
                            <div className="absolute top-full right-0 mt-1 w-56 bg-[#78350f] text-[#fef3c7] text-[10px] font-mono rounded-xl p-2.5 shadow-xl border-2 border-[#fbbf24] hidden group-hover/avatartooltip:block z-50 pointer-events-none leading-relaxed normal-case text-left">
                              <div className="font-bold text-[#fbbf24] mb-0.5 uppercase border-b border-white/10 pb-0.5">🌾 RENDIMENTO:</div>
                              {/* BUG 2 FIX: descrições corretas para todos os tipos de animal */}
                              {animal.type === 'vaca'
                                ? "🥛 Ordenhe leite diariamente. Dá mais leite se feliz ou em clima de Sol Forte."
                                : animal.type === 'ovelha'
                                ? "🧶 Fornece lã crua para fabricar cachecóis premium a cada 3 dias."
                                : animal.type === 'boi'
                                ? "🐂 Ganha peso corporal contínuo para revenda de alta lucratividade."
                                : animal.type === 'cabra'
                                ? "🐐 Produz leite de cabra em ciclos de lactação. Cada ciclo dura 20 dias de produção seguidos de 15 dias de secagem. Dá +3 felicidade/dia para todos os animais da fazenda."
                                : animal.type === 'lhama'
                                ? "🦙 Acumula lã ao longo das estações. Colheita somente na Primavera (mín. 3u). Não perde felicidade no Inverno e reduz custo de manutenção das máquinas."
                                : animal.type === 'pato'
                                ? "🦆 Bota ovos de pato diariamente (mais na Primavera, menos no Inverno). Também gera penas ocasionalmente. Reduz chance de pragas em 40%."
                                : animal.type === 'ganso'
                                ? "🦢 Bota ovos de ganso a cada 3 dias no Outono/Inverno. Fora dessa época, gera penas a cada 7 dias. Funciona como alarme de eventos negativos."
                                : animal.type === 'bufalo'
                                ? "🐃 Produz leite de búfala em grandes quantidades (3u/dia). No Verão sofre estresse térmico (-1u). Seu leite pode virar Muçarela de Búfala (120💰)."
                                : animal.type === 'pavao'
                                ? "🦚 Animal de prestígio. Gera penas semanalmente na Primavera/Verão (80💰/u). Com felicidade ≥80%, bônus de +10% felicidade para todos e +3-5% nos preços de venda."
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
                              <span className="flex items-center gap-1">😊 Felicidade
                                {/* IMPROVEMENT 4: Cabra bonus tooltip */}
                                {animal.type !== 'cabra' && animals.some(a => a.type === 'cabra' && a.isAdult !== false) && (
                                  <span className="text-[8px] text-emerald-400 font-mono" title="Bônus da Cabra: +3 felicidade/dia">🐐+3</span>
                                )}
                              </span>
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
                          const isReady = (animal.type === 'vaca' && animal.hasProducedToday) || (animal.type === 'ovelha' && animal.woolReady) || (animal.type === 'boi' && (animal.weightGain || 0) >= 0.8) || (animal.type === 'galinha' && animal.hasProducedToday) || (animal.type === 'cabra' && animal.isLactating && animal.hasProducedToday) || (animal.type === 'lhama' && (animal.woolAccumulated ?? 0) >= 3) || (animal.type === 'pato' && animal.hasProducedToday) || (animal.type === 'bufalo' && animal.hasProducedToday);
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
                              {animal.type === 'cabra' && (
                                <>
                                  {animal.isLactating && animal.hasProducedToday ? (
                                    <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                                      🥛 Leite de cabra pronto! (2 unidades)
                                    </span>
                                  ) : animal.isLactating ? (
                                    <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                                      ⏳ Leite coletado hoje (retorna amanhã)
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                                      🔒 Secagem: {animal.lactationCycle ?? 0} dias restantes
                                    </span>
                                  )}
                                </>
                              )}
                              {animal.type === 'lhama' && (
                                <>
                                  {(animal.woolAccumulated ?? 0) >= 3 && Math.floor(((currentDay - 1) % 120) / 30) === 0 ? (
                                    <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                                      🧶 Lã de lhama pronta para colheita! ({animal.woolAccumulated}u)
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                                      🧶 Lã acumulada: {animal.woolAccumulated ?? 0}u {Math.floor(((currentDay - 1) % 120) / 30) !== 0 ? '(colher na Primavera)' : '(mín. 3 para colher)'}
                                    </span>
                                  )}
                                </>
                              )}
                              {animal.type === 'pato' && (
                                <>
                                  {animal.hasProducedToday ? (
                                    <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                                      🥚 Ovo de pato pronto para coleta!
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                                      ⏳ Próximo ovo de pato amanhã
                                    </span>
                                  )}
                                </>
                              )}
                              {animal.type === 'ganso' && (
                                <>
                                  {(() => {
                                    const season = Math.floor(((currentDay - 1) % 120) / 30);
                                    const isEggSeason = season === 2 || season === 3;
                                    const daysSince = animal.daysSinceLastGooseEgg ?? 0;
                                    const daysSinceFeather = animal.daysSinceLastGooseFeather ?? 0;
                                    if (isEggSeason) {
                                      return daysSince >= 3 ? (
                                        <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">🥚 Ovo de ganso disponível!</span>
                                      ) : (
                                        <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">⏳ Próximo ovo em {3 - daysSince} dia(s)</span>
                                      );
                                    } else {
                                      return daysSinceFeather >= 7 ? (
                                        <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">🪶 Pena disponível! (Fora época)</span>
                                      ) : (
                                        <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">⏳ Pena em {7 - daysSinceFeather}d (Postura: Outono/Inverno)</span>
                                      );
                                    }
                                  })()}
                                </>
                              )}
                              {animal.type === 'bufalo' && (
                                <>
                                  {animal.hasProducedToday ? (
                                    <span className="flex items-center gap-1.5 text-[#166534] font-display animate-pulse">
                                      🥛 Leite de búfala pronto! {animal.heatStress ? '(2u — estresse térmico)' : '(3u)'}
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                                      ⏳ Leite coletado hoje {animal.heatStress ? '⚠️ Estresse térmico!' : ''}
                                    </span>
                                  )}
                                </>
                              )}
                              {animal.type === 'pavao' && (
                                <span className="flex items-center gap-1.5 text-[#78350f] font-sans font-bold">
                                  🦚 Animal de prestígio — bônus passivos ativos {animal.happiness > 80 ? '✅' : '❌ (felicidade < 80)'}
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        {/* CARD ACTION BUTTONS */}
                        <div className="flex gap-2 flex-wrap justify-between mt-auto">
                          
                          {/* Alimentar (Dynamic feed count based on animal type) */}
                          {(() => {
                            // Animais que não comem ração
                            const noFeedUI = ['minhoca', 'caracol', 'bicho_seda'];
                            if (noFeedUI.includes(animal.type)) {
                              return <span className="text-[10px] text-stone-400 font-mono italic flex-1 flex items-center justify-center">Sem ração necessária 🌿</span>;
                            }
                            // BUG FIX: novos animais usam a ração correta na UI
                            const feedType = (animal.type === 'vaca' || animal.type === 'boi' || animal.type === 'bufalo') ? 'racaoBovina' : (animal.type === 'ovelha' || animal.type === 'cabra' || animal.type === 'lhama' || animal.type === 'alpaca') ? 'racaoOvinos' : (animal.type === 'galinha' || animal.type === 'codorna' || animal.type === 'pavao') ? 'racaoAves' : (animal.type === 'pato' || animal.type === 'ganso') ? 'racaoAquatica' : animal.type === 'coelho_angora' ? 'racaoCoelho' : (animal.type === 'ra' || animal.type === 'avestruz' || animal.type === 'jacare') ? 'racaoCarnivora' : 'racaoBovina';
                            const feedQty = inventory[feedType] ?? 0;
                            const label = feedType === 'racaoBovina' ? 'Ração Bovina' : feedType === 'racaoOvinos' ? 'Ração de Ovinos' : feedType === 'racaoAves' ? 'Ração de Aves' : feedType === 'racaoAquatica' ? 'Ração Aquática' : feedType === 'racaoCoelho' ? 'Ração de Coelhos' : 'Ração Carnívora';
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

                          {/* Coletar Leite de Cabra */}
                          {animal.type === 'cabra' && (
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); collectGoatMilk(animal.id, e); }}
                              disabled={!animal.isLactating || !animal.hasProducedToday}
                              className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.isLactating && animal.hasProducedToday ? 'bg-[#3b82f6] hover:bg-[#2563eb] border-b-4 border-[#1d4ed8] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
                              title={!animal.isLactating ? `Em período de secagem — ${animal.lactationCycle ?? 0} dias restantes` : !animal.hasProducedToday ? 'Leite já coletado hoje' : 'Coletar leite de cabra'}
                            >
                              🥛 Leite Cabra
                            </button>
                          )}

                          {/* Coletar Lã de Lhama */}
                          {animal.type === 'lhama' && (
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); collectLlamaWool(animal.id, e); }}
                              disabled={(animal.woolAccumulated ?? 0) < 3 || Math.floor(((currentDay - 1) % 120) / 30) !== 0}
                              className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${(animal.woolAccumulated ?? 0) >= 3 && Math.floor(((currentDay - 1) % 120) / 30) === 0 ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] border-b-4 border-[#5b21b6] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
                              title={Math.floor(((currentDay - 1) % 120) / 30) !== 0 ? 'A lhama só pode ser tosquiada na primavera 🌸' : (animal.woolAccumulated ?? 0) < 3 ? `Lã acumulada: ${animal.woolAccumulated ?? 0}/3` : 'Coletar lã de lhama'}
                            >
                              🧶 Lã Lhama ({animal.woolAccumulated ?? 0}u)
                            </button>
                          )}

                          {/* Coletar Ovo de Pato */}
                          {animal.type === 'pato' && (
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); collectDuckEgg(animal.id, e); }}
                              disabled={!animal.hasProducedToday}
                              className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.hasProducedToday ? 'bg-amber-500 hover:bg-amber-400 border-b-4 border-amber-700 text-white shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
                              title="Coletar ovo de pato"
                            >
                              🥚 Ovo Pato
                            </button>
                          )}

                          {/* Coletar Ganso (ovo ou pena) */}
                          {animal.type === 'ganso' && (() => {
                            const season = Math.floor(((currentDay - 1) % 120) / 30);
                            const isEggSeason = season === 2 || season === 3;
                            const canCollect = isEggSeason ? (animal.daysSinceLastGooseEgg ?? 0) >= 3 : (animal.daysSinceLastGooseFeather ?? 0) >= 7;
                            return (
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); collectGooseProduct(animal.id, e); }}
                                disabled={!canCollect}
                                className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${canCollect ? 'bg-teal-500 hover:bg-teal-400 border-b-4 border-teal-700 shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
                                title={isEggSeason ? "Coletar ovo de ganso (1 a cada 3 dias)" : "Coletar pena de ganso (1 a cada 7 dias fora da época)"}
                              >
                                {isEggSeason ? '🥚 Ovo Ganso' : '🪶 Pena'}
                              </button>
                            );
                          })()}

                          {/* Coletar Leite de Búfala */}
                          {animal.type === 'bufalo' && (
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); collectBuffaloMilk(animal.id, e); }}
                              disabled={!animal.hasProducedToday}
                              className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.hasProducedToday ? 'bg-[#3b82f6] hover:bg-[#2563eb] border-b-4 border-[#1d4ed8] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
                              title="Coletar leite de búfala"
                            >
                              🥛 Leite Búfala
                            </button>
                          )}

                          {/* Alpaca: coletar lã */}
                          {animal.type === 'alpaca' && (
                            <button type="button" onClick={(e) => { e.preventDefault(); collectAlpacaWool(animal.id, e); }} disabled={!animal.woolReady}
                              className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.woolReady ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] border-b-4 border-[#5b21b6] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
                              title={animal.woolReady ? 'Tosquiar alpaca' : `Aguarde ${4 - (animal.daysSinceLastWool ?? 0)} dia(s)`}>
                              <Scissors className="w-3.5 h-3.5" /> Tosquiar Alpaca
                            </button>
                          )}

                          {/* Coelho Angorá: coletar lã */}
                          {animal.type === 'coelho_angora' && (
                            <button type="button" onClick={(e) => { e.preventDefault(); collectCoelhoWool(animal.id, e); }} disabled={!animal.woolReady}
                              className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.woolReady ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] border-b-4 border-[#5b21b6] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
                              title={animal.woolReady ? 'Tosquiar coelho angorá' : 'Aguarde'}>
                              <Scissors className="w-3.5 h-3.5" /> Tosquiar Coelho
                            </button>
                          )}

                          {/* Rã: coletar coxa */}
                          {animal.type === 'ra' && (
                            <button type="button" onClick={(e) => { e.preventDefault(); collectRa(animal.id, e); }} disabled={!animal.woolReady}
                              className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.woolReady ? 'bg-teal-500 hover:bg-teal-400 border-b-4 border-teal-700 shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
                              title={animal.woolReady ? 'Coletar coxa de rã' : 'Aguarde 7 dias'}>
                              🍖 Coletar Rã
                            </button>
                          )}

                          {/* Avestruz: coletar pena ou vender */}
                          {animal.type === 'avestruz' && (
                            <>
                              <button type="button" onClick={(e) => { e.preventDefault(); collectAvestruzPena(animal.id, e); }} disabled={!animal.woolReady}
                                className={`rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold flex-1 cursor-pointer flex items-center justify-center gap-1.5 transition-all select-none ${animal.woolReady ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] border-b-4 border-[#5b21b6] shadow-md active:translate-y-0.5 hover:scale-[1.02]' : 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60 shadow-none'}`}
                                title={animal.woolReady ? 'Coletar pena grande' : 'Aguarde'}>
                                🪶 Pena Grande
                              </button>
                              <button type="button" onClick={(e) => { e.preventDefault(); sellAvestruz(animal.id, e); }}
                                className="bg-red-500 hover:bg-[#dc2626] border-b-4 border-[#991b1b] shadow-md rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1.5 flex-1 select-none transition-all hover:scale-[1.02]"
                                title="Abater avestruz (+180💰 + 1 carne)">
                                💰 Abater
                              </button>
                            </>
                          )}

                          {/* Jacaré: vender */}
                          {animal.type === 'jacare' && (
                            <button type="button" onClick={(e) => { e.preventDefault(); sellJacare(animal.id, e); }}
                              className="bg-red-500 hover:bg-[#dc2626] border-b-4 border-[#991b1b] shadow-md rounded-[16px] px-4 py-2.5 font-display text-xs text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1.5 flex-1 select-none transition-all hover:scale-[1.02]"
                              title={`Abater jacaré (+250💰 + 1 carne). ${!licencaExotica ? '⚠️ Sem licença: risco de fiscalização!' : '✅ Licenciado'}`}>
                              🐊 Abater {!licencaExotica && '⚠️'}
                            </button>
                          )}

                          {/* Cruzar (Layer 2: Reprodução Controlada) */}
                          {licencaCriadouro && animal.isAdult !== false && REPRODUCAO_CONFIG[animal.type] && (() => {
                            const alreadyInReproducao = reproducaoAtiva.some(r => r.animalId1 === animal.id || r.animalId2 === animal.id);
                            return (
                              <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setCruzarModal({ animalId: animal.id, type: animal.type }); }}
                                disabled={alreadyInReproducao}
                                className={`rounded-[16px] px-3 py-2 font-display text-[10px] text-white uppercase tracking-wider font-extrabold cursor-pointer flex items-center justify-center gap-1 transition-all select-none ${alreadyInReproducao ? 'bg-stone-300 text-stone-500 border-none cursor-not-allowed opacity-60' : 'bg-fuchsia-500 hover:bg-fuchsia-600 border-b-2 border-fuchsia-800 shadow-md active:translate-y-0.5 hover:scale-[1.02]'}`}
                                title={alreadyInReproducao ? 'Já em gestação' : 'Iniciar reprodução controlada'}
                              >
                                🤝 Cruzar
                              </button>
                            );
                          })()}
                        </div>

                          {/* Improvement 2: Profit Panel Badge */}
                          {showProfitPanel && (() => {
                            const prof = getAnimalDailyProfit(animal.type);
                            const badgeColor = prof.profit > 5
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                              : prof.profit >= 1
                              ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                              : 'bg-red-100 border-red-400 text-red-700';
                            const indicator = prof.profit > 5 ? '🟢' : prof.profit >= 1 ? '🟡' : '🔴';
                            return (
                              <div className={`mt-2 mx-1 p-2 rounded-xl border-2 ${badgeColor} flex items-center justify-between gap-2 text-[10px] font-mono font-black`}>
                                <span>{indicator} Receita: <span className="font-black">{prof.revenue}💰/dia</span></span>
                                <span>Custo: {prof.cost}💰/dia</span>
                                <span className={prof.profit >= 0 ? 'text-emerald-700' : 'text-red-600'}>Lucro: {prof.profit >= 0 ? '+' : ''}{prof.profit}💰</span>
                              </div>
                            );
                          })()}

                      </motion.div>
                    );
                  });
                  })()}
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
              
              {/* Toggle mostrar vazios */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-[#92400e] font-mono font-bold uppercase tracking-wider">Estoque</span>
                <button
                  onClick={() => setShowEmptyItems(prev => !prev)}
                  className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-lg border transition-all ${showEmptyItems ? 'bg-amber-200 border-amber-400 text-amber-900' : 'bg-stone-100 border-stone-300 text-stone-600'}`}
                >
                  {showEmptyItems ? '👁 Ocultar vazios' : '👁 Mostrar vazios'}
                </button>
              </div>

              {/* Resource grid totals — grouped by category */}
              {(() => {
                type InvItem = {
                  key: string;
                  label: string;
                  qty: number;
                  priceKey?: 'milk'|'wool'|'cheese'|'scarf'|'egg'|'mayo'|'queijoCoalho'|'queijoMucarela'|'queijoBrie'|'goat_milk'|'llama_wool'|'duck_egg'|'goose_egg'|'buffalo_milk'|'buffalo_mozzarella'|'feather'|'peacock_feather'|'butter'|'yogurt'|'fertile_egg';
                  freshKey?: 'milk'|'egg'|'goat_milk'|'duck_egg'|'goose_egg'|'buffalo_milk'|'fertile_egg';
                  colSpan?: boolean;
                };
                const groups: { title: string; bg: string; items: InvItem[] }[] = [
                  {
                    title: '🐄 Produção Animal',
                    bg: 'bg-blue-50/60 border-blue-200',
                    items: [
                      { key: 'milk', label: '🥛 Leite', qty: inventory.milk, priceKey: 'milk', freshKey: 'milk' },
                      { key: 'goat_milk', label: '🥛 L. Cabra', qty: inventory.goat_milk ?? 0, priceKey: 'goat_milk', freshKey: 'goat_milk' },
                      { key: 'buffalo_milk', label: '🥛 L. Búfala', qty: inventory.buffalo_milk ?? 0, priceKey: 'buffalo_milk', freshKey: 'buffalo_milk' },
                      { key: 'wool', label: '🧶 Lã', qty: inventory.wool, priceKey: 'wool' },
                      { key: 'llama_wool', label: '🧶 Lã Lhama', qty: inventory.llama_wool ?? 0, priceKey: 'llama_wool' },
                      { key: 'egg', label: '🥚 Ovo', qty: inventory.egg ?? 0, priceKey: 'egg', freshKey: 'egg' },
                      { key: 'duck_egg', label: '🥚 Ov. Pato', qty: inventory.duck_egg ?? 0, priceKey: 'duck_egg', freshKey: 'duck_egg' },
                      { key: 'goose_egg', label: '🥚 Ov. Ganso', qty: inventory.goose_egg ?? 0, priceKey: 'goose_egg', freshKey: 'goose_egg' },
                      { key: 'fertile_egg', label: '✨ Ovo Fértil', qty: inventory.fertile_egg ?? 0, priceKey: 'fertile_egg', freshKey: 'fertile_egg' },
                      { key: 'feather', label: '🪶 Penas', qty: inventory.feather ?? 0, priceKey: 'feather' },
                      { key: 'peacock_feather', label: '🪶 P. Pavão', qty: inventory.peacock_feather ?? 0, priceKey: 'peacock_feather' },
                    ]
                  },
                  {
                    title: '🏭 Produção & Processados',
                    bg: 'bg-amber-50/60 border-amber-200',
                    items: [
                      { key: 'cheese', label: '🧀 Queijo Simp.', qty: inventory.cheese, priceKey: 'cheese' },
                      { key: 'queijoCoalho', label: '🧀 Q. Coalho', qty: inventory.queijoCoalho ?? 0, priceKey: 'queijoCoalho' },
                      { key: 'queijoMucarela', label: '🧀 Muçarela', qty: inventory.queijoMucarela ?? 0, priceKey: 'queijoMucarela' },
                      { key: 'queijoBrie', label: '🧀 Queijo Brie', qty: inventory.queijoBrie ?? 0, priceKey: 'queijoBrie' },
                      { key: 'buffalo_mozzarella', label: '🧀 Muç. Búfala', qty: inventory.buffalo_mozzarella ?? 0, priceKey: 'buffalo_mozzarella' },
                      { key: 'butter', label: '🧈 Manteiga', qty: inventory.butter ?? 0, priceKey: 'butter' },
                      { key: 'yogurt', label: '🥛 Iogurte', qty: inventory.yogurt ?? 0, priceKey: 'yogurt' },
                    ]
                  },
                  {
                    title: '🧵 Artesanato',
                    bg: 'bg-purple-50/60 border-purple-200',
                    items: [
                      { key: 'scarf', label: '🧣 Cachecol', qty: inventory.scarf, priceKey: 'scarf' },
                      { key: 'mayo', label: '🥣 Maionese', qty: inventory.mayo ?? 0, priceKey: 'mayo' },
                    ]
                  },
                  {
                    title: '🌿 Novos Animais',
                    bg: 'bg-green-50/60 border-green-200',
                    items: [
                      { key: 'quail_egg', label: '🐦 Ov. Codorna', qty: inventory.quail_egg ?? 0, priceKey: 'quail_egg' as any },
                      { key: 'alpaca_wool', label: '🦙 Lã Alpaca', qty: inventory.alpaca_wool ?? 0, priceKey: 'alpaca_wool' as any },
                      { key: 'angora_wool', label: '🐰 Lã Angorá', qty: inventory.angora_wool ?? 0, priceKey: 'angora_wool' as any },
                      { key: 'humus', label: '🪱 Húmus', qty: inventory.humus ?? 0, priceKey: 'humus' as any },
                      { key: 'muco', label: '🐌 Muco', qty: inventory.muco ?? 0, priceKey: 'muco' as any },
                      { key: 'seda_bruta', label: '🐛 Seda Bruta', qty: inventory.seda_bruta ?? 0, priceKey: 'seda_bruta' as any },
                      { key: 'coxa_ra', label: '🐸 Coxa Rã', qty: inventory.coxa_ra ?? 0, priceKey: 'coxa_ra' as any },
                      { key: 'pena_grande', label: '🦤 Pena Grande', qty: inventory.pena_grande ?? 0, priceKey: 'pena_grande' as any },
                      { key: 'carne_avestruz', label: '🦤 Carne Avestruz', qty: inventory.carne_avestruz ?? 0, priceKey: 'carne_avestruz' as any },
                      { key: 'couro_avestruz', label: '🦤 Couro Avestruz', qty: inventory.couro_avestruz ?? 0, priceKey: 'couro_avestruz' as any },
                      { key: 'carne_jacare', label: '🐊 Carne Jacaré', qty: inventory.carne_jacare ?? 0, priceKey: 'carne_jacare' as any },
                      { key: 'couro_jacare', label: '🐊 Couro Jacaré', qty: inventory.couro_jacare ?? 0, priceKey: 'couro_jacare' as any },
                      { key: 'folha_amoreira', label: '🌿 Folha Amoreira', qty: inventory.folha_amoreira ?? 0 },
                    ]
                  }
                ];

                return (
                  <div className="space-y-3 mb-4">
                    {groups.map(group => {
                      const visibleItems = group.items.filter(item => showEmptyItems || item.qty > 0);
                      if (visibleItems.length === 0) return null;
                      return (
                        <div key={group.title}>
                          <div className={`text-[10px] font-black uppercase tracking-wider text-[#78350f] mb-1.5 border-b border-[#fbbf24]/40 pb-0.5`}>{group.title}</div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {visibleItems.map(item => {
                              const trend = item.priceKey ? getPriceTrend(item.priceKey) : null;
                              const price = item.priceKey ? getActualSellPrice(item.priceKey) : null;
                              const isEmpty = item.qty === 0;
                              return (
                                <div key={item.key} className={`bg-white/80 p-2 rounded-xl border border-[#fbbf24] flex flex-col gap-0.5 shadow-inner ${isEmpty ? 'opacity-40' : ''}`}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-[#78350f] uppercase tracking-tight leading-none flex items-center">
                                      {item.label}
                                      {item.freshKey && item.qty > 0 && getFreshnessIndicator(item.freshKey)}
                                    </span>
                                    <span className="font-mono font-black text-blue-700 text-xs bg-blue-50/60 px-1.5 py-0.5 rounded border border-blue-100">{item.qty}u</span>
                                  </div>
                                  {price !== null && (
                                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                      <span className="text-[9px] text-stone-500 font-mono">{price}💰</span>
                                      {trend && (
                                        <span className={`text-[9px] font-black ${trend.color}`}>
                                          {trend.symbol}{Math.abs(trend.pct) > 0 ? ` ${trend.pct > 0 ? '+' : ''}${trend.pct}%` : ''}
                                        </span>
                                      )}
                                      {trend && trend.pct >= 15 && (
                                        <span className="text-[8px] font-black px-1 py-0.5 rounded bg-amber-400 text-amber-900 animate-pulse" title="Preço subindo! Pode valer a pena esperar para vender">
                                          📈 Alta!
                                        </span>
                                      )}
                                      {trend && trend.pct <= -15 && (
                                        <span className="text-[8px] font-black px-1 py-0.5 rounded bg-red-400 text-white" title="Preço caindo! Melhor vender agora">
                                          📉 Vender já!
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

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

                  {farmLevel >= 2 && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); craftButter(e); }}
                      className="bg-yellow-500 hover:bg-yellow-400 text-white border-b-2 border-yellow-700 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all shadow-sm"
                      title="Requer 2 Leites. Fabrica 1 Manteiga artesanal (45💰)."
                    >
                      🧈 Manteiga (🥛x2)
                    </button>
                  )}

                  {farmLevel >= 2 && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); craftYogurt(e); }}
                      className="bg-pink-500 hover:bg-pink-400 text-white border-b-2 border-pink-700 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider cursor-pointer active:translate-y-0.5 transition-all shadow-sm"
                      title="Requer 1 Leite. Fermenta em 1 dia para 1 Iogurte (35💰)."
                    >
                      🥛 Iogurte (🥛x1, 1 dia)
                    </button>
                  )}
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
                    Vender Maionese ({getActualSellPrice('mayo')}💰)
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

                  {/* BUG 5 FIX: itens especiais só aparecem se o jogador tem o animal produtor OU quantidade > 0 */}
                  {(animals.some(a => a.type === 'cabra') || (inventory.goat_milk ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('goat_milk', 1, e)}
                    disabled={(inventory.goat_milk ?? 0) < 1}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-300 disabled:opacity-40 text-blue-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Leite de Cabra. Preço base: 38 moedas."
                  >
                    L. Cabra ({getActualSellPrice('goat_milk')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'lhama') || (inventory.llama_wool ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('llama_wool', 1, e)}
                    disabled={(inventory.llama_wool ?? 0) < 1}
                    className="bg-purple-50 hover:bg-purple-100 border border-purple-300 disabled:opacity-40 text-purple-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Lã de Lhama. Preço base: 45 moedas."
                  >
                    L. Lhama ({getActualSellPrice('llama_wool')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'pato') || (inventory.duck_egg ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('duck_egg', 1, e)}
                    disabled={(inventory.duck_egg ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Ovo de Pato. Preço base: 18 moedas."
                  >
                    Ov. Pato ({getActualSellPrice('duck_egg')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'ganso') || (inventory.goose_egg ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('goose_egg', 1, e)}
                    disabled={(inventory.goose_egg ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Ovo de Ganso. Preço base: 50 moedas."
                  >
                    Ov. Ganso ({getActualSellPrice('goose_egg')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'bufalo') || (inventory.buffalo_milk ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('buffalo_milk', 1, e)}
                    disabled={(inventory.buffalo_milk ?? 0) < 1}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-300 disabled:opacity-40 text-blue-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Leite de Búfala. Preço base: 55 moedas."
                  >
                    L. Búfala ({getActualSellPrice('buffalo_milk')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'bufalo') || (inventory.buffalo_mozzarella ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('buffalo_mozzarella', 1, e)}
                    disabled={(inventory.buffalo_mozzarella ?? 0) < 1}
                    className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 disabled:opacity-40 text-yellow-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm col-span-2"
                    title="Vende 1 Muçarela de Búfala. Preço base: 120 moedas."
                  >
                    Muç. Búfala ({getActualSellPrice('buffalo_mozzarella')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'pato' || a.type === 'ganso') || (inventory.feather ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('feather', 1, e)}
                    disabled={(inventory.feather ?? 0) < 1}
                    className="bg-teal-50 hover:bg-teal-100 border border-teal-300 disabled:opacity-40 text-teal-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Pena de Pato/Ganso. Preço base: 15 moedas."
                  >
                    Penas ({getActualSellPrice('feather')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'pavao') || (inventory.peacock_feather ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('peacock_feather', 1, e)}
                    disabled={(inventory.peacock_feather ?? 0) < 1}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 disabled:opacity-40 text-emerald-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Pena de Pavão. Preço base: 80 moedas."
                  >
                    P. Pavão ({getActualSellPrice('peacock_feather')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'vaca') || (inventory.butter ?? 0) > 0 || inventory.milk > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('butter', 1, e)}
                    disabled={(inventory.butter ?? 0) < 1}
                    className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 disabled:opacity-40 text-yellow-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Manteiga. Preço base: 45 moedas."
                  >
                    Manteiga ({getActualSellPrice('butter')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'vaca') || (inventory.yogurt ?? 0) > 0 || inventory.milk > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('yogurt', 1, e)}
                    disabled={(inventory.yogurt ?? 0) < 1}
                    className="bg-pink-50 hover:bg-pink-100 border border-pink-300 disabled:opacity-40 text-pink-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Iogurte. Preço base: 35 moedas."
                  >
                    Iogurte ({getActualSellPrice('yogurt')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'galinha') || (inventory.fertile_egg ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('fertile_egg', 1, e)}
                    disabled={(inventory.fertile_egg ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Ovo Fértil. Preço base: 36 moedas."
                  >
                    ✨ Ov. Fértil ({getActualSellPrice('fertile_egg')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'avestruz') || (inventory.couro_avestruz ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('couro_avestruz', 1, e)}
                    disabled={(inventory.couro_avestruz ?? 0) < 1}
                    className="bg-stone-50 hover:bg-stone-100 border border-stone-300 disabled:opacity-40 text-stone-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Couro de Avestruz. Preço base: 300 moedas."
                  >
                    🦤 Couro Avestruz ({getActualSellPrice('couro_avestruz')}💰)
                  </button>
                  )}

                  {(animals.some(a => a.type === 'jacare') || (inventory.couro_jacare ?? 0) > 0) && (
                  <button
                    type="button"
                    onClick={(e) => sellProduct('couro_jacare', 1, e)}
                    disabled={(inventory.couro_jacare ?? 0) < 1}
                    className="bg-green-50 hover:bg-green-100 border border-green-300 disabled:opacity-40 text-green-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Couro de Jacaré. Preço base: 400 moedas."
                  >
                    🐊 Couro Jacaré ({getActualSellPrice('couro_jacare')}💰)
                  </button>
                  )}

                  {(inventory.queijo_cabra ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('queijo_cabra', 1, e)} disabled={(inventory.queijo_cabra ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🧀 Q.Cabra ({getActualSellPrice('queijo_cabra')}💰)
                  </button>
                  )}
                  {(inventory.iogurte_cabra ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('iogurte_cabra', 1, e)} disabled={(inventory.iogurte_cabra ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🥛 Iog.Cabra ({getActualSellPrice('iogurte_cabra')}💰)
                  </button>
                  )}
                  {(inventory.leite_condensado ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('leite_condensado', 1, e)} disabled={(inventory.leite_condensado ?? 0) < 1}
                    className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 disabled:opacity-40 text-yellow-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🥛 L.Condensado ({getActualSellPrice('leite_condensado')}💰)
                  </button>
                  )}
                  {(inventory.tapete_lhama ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('tapete_lhama', 1, e)} disabled={(inventory.tapete_lhama ?? 0) < 1}
                    className="bg-purple-50 hover:bg-purple-100 border border-purple-300 disabled:opacity-40 text-purple-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🪢 Tapete Lhama ({getActualSellPrice('tapete_lhama')}💰)
                  </button>
                  )}
                  {(inventory.cachecol_angora ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('cachecol_angora', 1, e)} disabled={(inventory.cachecol_angora ?? 0) < 1}
                    className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 disabled:opacity-40 text-indigo-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🧣 Cachecol Angorá ({getActualSellPrice('cachecol_angora')}💰)
                  </button>
                  )}
                  {(inventory.tecido_alpaca ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('tecido_alpaca', 1, e)} disabled={(inventory.tecido_alpaca ?? 0) < 1}
                    className="bg-violet-50 hover:bg-violet-100 border border-violet-300 disabled:opacity-40 text-violet-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🧶 Tecido Alpaca ({getActualSellPrice('tecido_alpaca')}💰)
                  </button>
                  )}
                  {(inventory.fio_seda ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('fio_seda', 1, e)} disabled={(inventory.fio_seda ?? 0) < 1}
                    className="bg-sky-50 hover:bg-sky-100 border border-sky-300 disabled:opacity-40 text-sky-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🪡 Fio de Seda ({getActualSellPrice('fio_seda')}💰)
                  </button>
                  )}
                  {(inventory.manta_premium ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('manta_premium', 1, e)} disabled={(inventory.manta_premium ?? 0) < 1}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-300 disabled:opacity-40 text-purple-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm col-span-2">
                    ✨ Manta Premium ({getActualSellPrice('manta_premium')}💰)
                  </button>
                  )}
                  {(inventory.pate_pato ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('pate_pato', 1, e)} disabled={(inventory.pate_pato ?? 0) < 1}
                    className="bg-orange-50 hover:bg-orange-100 border border-orange-300 disabled:opacity-40 text-orange-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🍖 Patê Pato ({getActualSellPrice('pate_pato')}💰)
                  </button>
                  )}
                  {(inventory.ovo_defumado ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('ovo_defumado', 1, e)} disabled={(inventory.ovo_defumado ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🥚 Ov.Defumado ({getActualSellPrice('ovo_defumado')}💰)
                  </button>
                  )}
                  {(inventory.conserva_codorna ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('conserva_codorna', 1, e)} disabled={(inventory.conserva_codorna ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🥚 Conserva Codorna ({getActualSellPrice('conserva_codorna')}💰)
                  </button>
                  )}
                  {(inventory.creme_cosmetico ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('creme_cosmetico', 1, e)} disabled={(inventory.creme_cosmetico ?? 0) < 1}
                    className="bg-pink-50 hover:bg-pink-100 border border-pink-300 disabled:opacity-40 text-pink-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🧴 Creme Cosm. ({getActualSellPrice('creme_cosmetico')}💰)
                  </button>
                  )}
                  {(inventory.sabonete_natural ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('sabonete_natural', 1, e)} disabled={(inventory.sabonete_natural ?? 0) < 1}
                    className="bg-teal-50 hover:bg-teal-100 border border-teal-300 disabled:opacity-40 text-teal-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🧼 Sabonete Nat. ({getActualSellPrice('sabonete_natural')}💰)
                  </button>
                  )}
                  {(inventory.almofada_penas ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('almofada_penas', 1, e)} disabled={(inventory.almofada_penas ?? 0) < 1}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-300 disabled:opacity-40 text-blue-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🛋️ Almofada Penas ({getActualSellPrice('almofada_penas')}💰)
                  </button>
                  )}
                  {(inventory.colete_couro ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('colete_couro', 1, e)} disabled={(inventory.colete_couro ?? 0) < 1}
                    className="bg-stone-50 hover:bg-stone-100 border border-stone-300 disabled:opacity-40 text-stone-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🦺 Colete Couro ({getActualSellPrice('colete_couro')}💰)
                  </button>
                  )}
                  {(inventory.bolsa_exotica ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('bolsa_exotica', 1, e)} disabled={(inventory.bolsa_exotica ?? 0) < 1}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 disabled:opacity-40 text-emerald-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm col-span-2">
                    👜 Bolsa Exótica ({getActualSellPrice('bolsa_exotica')}💰)
                  </button>
                  )}
                  {(inventory.enfeite_pavao ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('enfeite_pavao', 1, e)} disabled={(inventory.enfeite_pavao ?? 0) < 1}
                    className="bg-teal-50 hover:bg-teal-100 border border-teal-300 disabled:opacity-40 text-teal-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🦚 Enfeite Pavão ({getActualSellPrice('enfeite_pavao')}💰)
                  </button>
                  )}

                  {/* Biome exclusive products */}
                  {(inventory.peixe ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('peixe' as any, 1, e)} disabled={(inventory.peixe ?? 0) < 1}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-300 disabled:opacity-40 text-blue-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Peixe do Lago. Preço base: 45 moedas.">
                    🐟 Peixe ({getActualSellPrice('peixe' as any)}💰)
                  </button>
                  )}

                  {(inventory.mel ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('mel' as any, 1, e)} disabled={(inventory.mel ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Mel da Floresta. Preço base: 80 moedas.">
                    🍯 Mel ({getActualSellPrice('mel' as any)}💰)
                  </button>
                  )}

                  {(inventory.cogumelo ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('cogumelo' as any, 1, e)} disabled={(inventory.cogumelo ?? 0) < 1}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 disabled:opacity-40 text-emerald-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm"
                    title="Vende 1 Cogumelo da Floresta. Preço base: 35 moedas.">
                    🍄 Cogumelo ({getActualSellPrice('cogumelo' as any)}💰)
                  </button>
                  )}

                  {/* Biome craft products */}
                  {(inventory.hidromel ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('hidromel' as any, 1, e)} disabled={(inventory.hidromel ?? 0) < 1}
                    className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 disabled:opacity-40 text-yellow-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🍺 Hidromel ({getActualSellPrice('hidromel' as any)}💰)
                  </button>
                  )}
                  {(inventory.risoto_cogumelo ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('risoto_cogumelo' as any, 1, e)} disabled={(inventory.risoto_cogumelo ?? 0) < 1}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 disabled:opacity-40 text-emerald-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🍄 Risoto ({getActualSellPrice('risoto_cogumelo' as any)}💰)
                  </button>
                  )}
                  {(inventory.conserva_peixe ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('conserva_peixe' as any, 1, e)} disabled={(inventory.conserva_peixe ?? 0) < 1}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-300 disabled:opacity-40 text-blue-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🐟 Conserva ({getActualSellPrice('conserva_peixe' as any)}💰)
                  </button>
                  )}
                  {(inventory.mel_envasado ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('mel_envasado' as any, 1, e)} disabled={(inventory.mel_envasado ?? 0) < 1}
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 disabled:opacity-40 text-amber-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🍯 Mel Envasado ({getActualSellPrice('mel_envasado' as any)}💰)
                  </button>
                  )}
                  {(inventory.sopa_cogumelo ?? 0) > 0 && (
                  <button type="button" onClick={(e) => sellProduct('sopa_cogumelo' as any, 1, e)} disabled={(inventory.sopa_cogumelo ?? 0) < 1}
                    className="bg-stone-50 hover:bg-stone-100 border border-stone-300 disabled:opacity-40 text-stone-900 py-2 rounded-xl text-[10px] font-sans font-extrabold uppercase active:scale-98 transition-all cursor-pointer shadow-sm">
                    🍲 Sopa ({getActualSellPrice('sopa_cogumelo' as any)}💰)
                  </button>
                  )}
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
                  { key: 'racaoBovina', label: '🌾 Ração Bovina', desc: 'Para Vaca, Boi e Búfalo. 3💰/dia.' },
                  { key: 'racaoOvinos', label: '🐐 Ração de Ovinos', desc: 'Para Ovelha, Cabra, Lhama e Alpaca. 3💰/dia.' },
                  { key: 'racaoAves', label: '🐔 Ração de Aves', desc: 'Para Galinha, Codorna e Pavão. 2💰/dia.' },
                  { key: 'racaoAquatica', label: '🦆 Ração Aquática', desc: 'Para Pato e Ganso. 4💰/dia.' },
                  { key: 'racaoCoelho', label: '🐰 Ração de Coelhos', desc: 'Para Coelho Angorá. 2💰/dia.' },
                  { key: 'racaoCarnivora', label: '🍖 Ração Carnívora', desc: 'Para Rã, Avestruz e Jacaré. 6💰/dia.' }
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

              {/* --- LOJA DE INSUMOS: Folha de Amoreira --- */}
              {farmLevel >= 10 && (
                <div className="mt-4 bg-white/80 p-3 rounded-2xl border-2 border-emerald-300 hover:border-emerald-400 transition-all flex flex-col gap-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-sans font-black text-emerald-900 text-xs uppercase leading-tight">🌿 Folha de Amoreira</h4>
                      <p className="text-[9px] text-emerald-700/70 font-mono mt-0.5">Alimento do Bicho-da-seda (1/dia por bicho)</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] text-emerald-700 font-mono uppercase font-black tracking-wider leading-none">Estoque</span>
                      <span className="font-mono text-sm font-black text-emerald-800">{inventory.folha_amoreira ?? 0}u</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-emerald-200/50">
                    <button
                      type="button"
                      onClick={(e) => buyFolhaAmoreira(1, e)}
                      disabled={gold < 5}
                      className="bg-stone-100 hover:bg-stone-200 text-emerald-900 text-[9px] font-mono font-bold py-1 px-0.5 rounded-lg border border-emerald-200 disabled:opacity-40 transition-all cursor-pointer text-center leading-none"
                    >
                      +1u (5💰)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => buyFolhaAmoreira(10, e)}
                      disabled={gold < 50}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[9px] font-mono font-bold py-1 px-0.5 rounded-lg border border-emerald-200 disabled:opacity-40 transition-all cursor-pointer text-center leading-none"
                    >
                      +10u (50💰)
                    </button>
                  </div>
                </div>
              )}
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

              <div ref={logsContainerRef} className="flex-1 overflow-y-auto pr-1 text-xs space-y-2 font-mono divide-y divide-[#fbbf24]/30" style={{ scrollbarWidth: 'thin' }}>
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
          <div className="flex items-center gap-3">
            <span className="text-[#fef3c7]/60 text-[9px]">Fazenda Aurora © 2026 - Cuide com carinho!</span>
            <a
              href="https://ko-fi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-[#FF5E5B] hover:bg-[#ff4845] text-white text-xs rounded-full transition-colors"
              title="Apoiar o desenvolvimento"
            >
              ☕ Apoiar
            </a>
          </div>
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
                    {weeklyTaxPaid > 0 && (
                      <div className="flex items-center gap-1.5 col-span-2 text-red-700">
                        <span>🏛️ Imposto pago:</span>
                        <span className="font-bold">-{weeklyTaxPaid} moedas</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 col-span-2 text-blue-700">
                      <span>💧 Água gasta:</span>
                      <span className="font-bold">-{weeklyReportData.waterCost || 0} moedas</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 text-amber-700">
                      <span>⚡ Energia gasta:</span>
                      <span className="font-bold">-{weeklyReportData.energyCost || 0} moedas</span>
                    </div>
                  </div>
                </div>

                {/* Workers weekly salary */}
                {workers.length > 0 && (
                <div className="bg-white/75 border-2 border-[#fbbf24] rounded-2xl p-4 shadow-sm">
                  <h4 className="font-display font-black text-xs text-[#78350f] uppercase tracking-wider mb-2 border-b border-stone-200 pb-1">
                    👷 Salários da Semana
                  </h4>
                  <div className="space-y-1.5 text-xs font-mono text-stone-700">
                    {workers.map(worker => {
                      const def = WORKER_TYPES.find(w => w.role === worker.role);
                      return (
                        <div key={worker.id} className="flex items-center justify-between">
                          <span>{def?.emoji ?? '👷'} {worker.name} ({worker.role})</span>
                          <span className="font-bold text-red-600">-{worker.dailyCost * 7} moedas</span>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between border-t border-stone-200 pt-1.5 mt-1">
                      <span className="font-black uppercase text-stone-800">Total Funcionários:</span>
                      <span className="font-black text-red-700">-{workers.reduce((sum, w) => sum + w.dailyCost * 7, 0)} moedas</span>
                    </div>
                  </div>
                </div>
                )}

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
                        <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border border-[#fbbf24]">Nível 6+</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Coleta automaticamente o leite cru de <strong>TODAS</strong> as vacas produtoras ao final de cada dia. A produção é enviada diretamente para o Armazém.
                    </p>
                    <div className="text-[10px] text-stone-400 font-mono mt-1.5 uppercase tracking-wide">
                      ⚡ Compra: 2.500💰 • Nível mín: 6 • Operacional: <span className="text-orange-500 font-black">8⚡/dia</span>
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
                        disabled={gold < 2500 || farmLevel < 6}
                        className={`font-mono font-black text-xs uppercase px-5 py-2.5 rounded-2xl cursor-pointer border-b-4 transition-all shadow-sm ${
                          gold >= 2500 && farmLevel >= 6
                            ? 'bg-amber-500 hover:bg-amber-400 text-[#451a03] border-amber-700 hover:scale-105 active:translate-y-0.5'
                            : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Comprar (2.500💰)
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
                        <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border border-[#fbbf24]">Nível 5+</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Coleta automaticamente a lã de <strong>TODAS</strong> as ovelha com lã madura no fim do dia. Envia fardos ao Armazém sem perda de bônus por qualidade.
                    </p>
                    <div className="text-[10px] text-stone-400 font-mono mt-1.5 uppercase tracking-wide">
                      ⚡ Compra: 2.000💰 • Nível mín: 5 • Operacional: <span className="text-orange-500 font-black">6⚡/dia</span>
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
                        disabled={gold < 2000 || farmLevel < 5}
                        className={`font-mono font-black text-xs uppercase px-5 py-2.5 rounded-2xl cursor-pointer border-b-4 transition-all shadow-sm ${
                          gold >= 2000 && farmLevel >= 5
                            ? 'bg-amber-500 hover:bg-amber-400 text-[#451a03] border-amber-700 hover:scale-105 active:translate-y-0.5'
                            : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Comprar (2.000💰)
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
                        <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border border-[#fbbf24]">Nível 4+</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Alimenta <strong>TODOS</strong> os animais do seu rebanho no final do dia. Cada refeição consome ração do Armazém conforme o tipo de cada animal.
                    </p>
                    <p className="text-[10px] text-stone-400 font-mono mt-1.5 uppercase tracking-wide">
                      ⚡ Compra: 1.500💰 • Nível mín: 4 • Operacional: <span className="text-orange-500 font-black">5⚡/dia</span>
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
                        disabled={gold < 1500 || farmLevel < 4}
                        className={`font-mono font-black text-xs uppercase px-5 py-2.5 rounded-2xl cursor-pointer border-b-4 transition-all shadow-sm ${
                          gold >= 1500 && farmLevel >= 4
                            ? 'bg-amber-500 hover:bg-amber-400 text-[#451a03] border-amber-700 hover:scale-105 active:translate-y-0.5'
                            : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'
                        }`}
                      >
                        Comprar (1.500💰)
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
                  🏺 Ateliê Aurora
                </h3>
                <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
                  Transforme matérias-primas em produtos artesanais de valor
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

              {/* Tab Navigation */}
              <div className="bg-amber-50 px-4 pt-3 pb-0 border-b-2 border-amber-200 shrink-0 flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
                {([
                  { key: 'queijaria', label: '🏭 Produção' },
                  { key: 'tecelagem', label: '🧶 Tecelagem' },
                  { key: 'cozinha', label: '🥣 Cozinha' },
                  { key: 'cosmeticos', label: '🌿 Cosméticos' },
                  { key: 'luxo', label: '🏺 Luxo' },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setAtelieTab(tab.key)}
                    className={`whitespace-nowrap text-[10px] font-mono font-black uppercase px-3 py-2 rounded-t-xl border-2 border-b-0 transition-all cursor-pointer focus:outline-none ${
                      atelieTab === tab.key
                        ? 'bg-[#fffbeb] border-amber-400 text-amber-900'
                        : 'bg-amber-100/60 border-transparent text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Prateleira HUD Bar — visible in queijaria tab */}
              {atelieTab === 'queijaria' && (
              <div className="bg-[#fef3c7] px-6 py-3 border-b-2 border-yellow-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
                <div className="text-xs text-[#78350f] leading-relaxed">
                  📦 <strong>Prateleiras:</strong> <span className="bg-[#f59e0b]/20 px-2 py-0.5 rounded-md font-bold text-amber-900">{queijosEmMaturacao.length} / {maxPrateleiras} ocupadas</span>
                  {racaoOrganicaDays > 0 && <span className="ml-2 text-green-700 font-bold">🌿 Ração Orgânica: {racaoOrganicaDays}d</span>}
                  {fertilizanteDays > 0 && <span className="ml-2 text-emerald-700 font-bold">🌱 Fertilizante: {fertilizanteDays}d</span>}
                </div>
                <button type="button" onClick={() => { setShowQueijariaModal(false); setShowUpgradesModal(true); }}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 focus:outline-none">
                  🔧 Ampliar Queijaria
                </button>
              </div>
              )}

              {/* Core Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>

                {/* ===== TAB: QUEIJARIA ===== */}
                {atelieTab === 'queijaria' && (
                  <div className="space-y-4">
                    {/* Maturômetro */}
                    <div>
                      <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#78350f] mb-2 flex items-center gap-1.5">⏳ Maturômetro ({queijosEmMaturacao.length} ativos)</h4>
                      {queijosEmMaturacao.length === 0 ? (
                        <div className="border-4 border-dashed border-stone-200 rounded-2xl p-4 text-center text-xs text-stone-500 bg-white/50">🥛 Nenhuma prateleira ocupada. Escolha uma receita abaixo!</div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {queijosEmMaturacao.map((item, idx) => {
                            const totalDays = item.tipo === 'coalho' ? 1 : item.tipo === 'mucarela' ? 3 : item.tipo === 'buffalo_mozzarella' ? 2 : item.tipo === 'yogurt' ? 1 : 7;
                            const elapsed = totalDays - item.diasRestantes;
                            const progressPct = Math.min(100, Math.round((elapsed / totalDays) * 100));
                            const label = item.tipo === 'coalho' ? 'Queijo Coalho' : item.tipo === 'mucarela' ? 'Queijo Muçarela' : item.tipo === 'buffalo_mozzarella' ? 'Muçarela de Búfala' : item.tipo === 'yogurt' ? 'Iogurte' : 'Queijo Brie';
                            return (
                              <div key={idx} className="bg-white border-2 border-amber-100 rounded-xl p-3 flex items-center gap-3">
                                <span className="text-2xl">🧀</span>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-display font-black text-xs uppercase text-[#78350f]">{label}</span>
                                    <span className="text-[9px] text-amber-800 font-mono font-bold bg-amber-50 px-1.5 py-0.5 rounded">⌛ {item.diasRestantes}d</span>
                                  </div>
                                  <div className="mt-1.5 w-full bg-stone-100 h-2 rounded-full overflow-hidden relative">
                                    <div className="bg-gradient-to-r from-amber-400 to-green-500 h-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {/* Receitas Queijaria */}
                    <div>
                      <h4 className="font-display font-black text-xs uppercase tracking-wider text-[#78350f] mb-2">📖 Receitas</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { label: 'Queijo Coalho', emoji: '🧀', req: `🥛 3 leite (${inventory.milk}/3) • ⌛ 1d`, canCraft: inventory.milk >= 3 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 1, onClick: (e: React.MouseEvent) => craftQueijo('coalho', e) },
                          { label: 'Queijo Muçarela', emoji: '🧀', req: `🥛 5 leite (${inventory.milk}/5) • ⌛ 3d • Nv3`, canCraft: farmLevel >= 3 && inventory.milk >= 5 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 3, onClick: (e: React.MouseEvent) => craftQueijo('mucarela', e) },
                          { label: 'Queijo Brie', emoji: '🧀', req: `🥛 8 leite (${inventory.milk}/8) • ⌛ 7d • Nv5`, canCraft: farmLevel >= 5 && inventory.milk >= 8 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 5, onClick: (e: React.MouseEvent) => craftQueijo('brie', e) },
                          { label: 'Muçarela Búfala', emoji: '🧀', req: `🥛 3 L.Búfala (${inventory.buffalo_milk ?? 0}/3) • ⌛ 2d • Nv4`, canCraft: farmLevel >= 4 && (inventory.buffalo_milk ?? 0) >= 3 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 4, onClick: (e: React.MouseEvent) => craftBuffaloMozzarella(e) },
                          { label: 'Manteiga', emoji: '🧈', req: `🥛 2 leite (${inventory.milk}/2) • Nv2`, canCraft: farmLevel >= 2 && inventory.milk >= 2, reqLevel: 2, onClick: (e: React.MouseEvent) => craftButter(e) },
                          { label: 'Iogurte', emoji: '🥛', req: `🥛 1 leite (${inventory.milk}/1) • ⌛ 1d • Nv2`, canCraft: farmLevel >= 2 && inventory.milk >= 1 && queijosEmMaturacao.length < maxPrateleiras, reqLevel: 2, onClick: (e: React.MouseEvent) => craftYogurt(e) },
                          { label: 'Queijo de Cabra', emoji: '🧀', req: `🐐 3 L.Cabra (${inventory.goat_milk ?? 0}/3) • Nv3`, canCraft: farmLevel >= 3 && (inventory.goat_milk ?? 0) >= 3, reqLevel: 3, onClick: (e: React.MouseEvent) => craftQueijoCabra(e) },
                          { label: 'Iogurte de Cabra', emoji: '🥛', req: `🐐 2 L.Cabra (${inventory.goat_milk ?? 0}/2) • Nv4`, canCraft: farmLevel >= 4 && (inventory.goat_milk ?? 0) >= 2, reqLevel: 4, onClick: (e: React.MouseEvent) => craftIogurteCabra(e) },
                          { label: 'Leite Condensado', emoji: '🥛', req: `🥛 4 leite (${inventory.milk}/4) + 🧈 1 manteiga (${inventory.butter ?? 0}/1) • Nv6`, canCraft: farmLevel >= 6 && inventory.milk >= 4 && (inventory.butter ?? 0) >= 1, reqLevel: 6, onClick: (e: React.MouseEvent) => craftLeiteCondensado(e) },
                        ].map((r, i) => (
                          <div key={i} className="bg-white border-2 border-stone-200 rounded-xl p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{r.emoji}</span>
                              <div>
                                <div className="font-display font-black text-xs uppercase text-amber-900 flex items-center gap-1">
                                  {r.label}
                                  {farmLevel < r.reqLevel && <span className="text-[8px] bg-stone-400 text-white px-1 py-0.5 rounded">🔒 Nv{r.reqLevel}+</span>}
                                </div>
                                <div className="text-[9px] font-mono text-stone-500 mt-0.5">{r.req}</div>
                              </div>
                            </div>
                            <button type="button" onClick={r.onClick} disabled={!r.canCraft}
                              className="shrink-0 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                              {farmLevel < r.reqLevel ? `🔒 Nv${r.reqLevel}` : 'Fabricar'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== TAB: TECELAGEM ===== */}
                {atelieTab === 'tecelagem' && (
                  <div className="space-y-2">
                    <h4 className="font-display font-black text-xs uppercase tracking-wider text-indigo-900 mb-2">🧶 Tecelagem & Fibras</h4>
                    {[
                      { label: 'Cachecol (Lã)', emoji: '🧣', req: `🧶 2 lã (${inventory.wool}/2) • Nv1`, canCraft: inventory.wool >= 2, reqLevel: 1, onClick: (e: React.MouseEvent) => craftScarf(e) },
                      { label: 'Tapete de Lhama', emoji: '🪢', req: `🦙 3 Lã Lhama (${inventory.llama_wool ?? 0}/3) • Nv4`, canCraft: farmLevel >= 4 && (inventory.llama_wool ?? 0) >= 3, reqLevel: 4, onClick: (e: React.MouseEvent) => craftTapeteLhama(e) },
                      { label: 'Cachecol Angorá', emoji: '🧣', req: `🐇 2 Lã Angorá (${inventory.angora_wool ?? 0}/2) • Nv8`, canCraft: farmLevel >= 8 && (inventory.angora_wool ?? 0) >= 2, reqLevel: 8, onClick: (e: React.MouseEvent) => craftCachecolAngora(e) },
                      { label: 'Tecido de Alpaca', emoji: '🧶', req: `🦙 3 Lã Alpaca (${inventory.alpaca_wool ?? 0}/3) • Nv5`, canCraft: farmLevel >= 5 && (inventory.alpaca_wool ?? 0) >= 3, reqLevel: 5, onClick: (e: React.MouseEvent) => craftTecidoAlpaca(e) },
                      { label: 'Fio de Seda', emoji: '🪡', req: `🪲 2 Seda Bruta (${inventory.seda_bruta ?? 0}/2) • Nv10`, canCraft: farmLevel >= 10 && (inventory.seda_bruta ?? 0) >= 2, reqLevel: 10, onClick: (e: React.MouseEvent) => craftFioSeda(e) },
                      { label: 'Manta Premium', emoji: '✨', req: `🪡 1 Fio Seda (${inventory.fio_seda ?? 0}/1) + 🧣 1 Cachecol Angorá (${inventory.cachecol_angora ?? 0}/1) + 🧶 1 Tecido Alpaca (${inventory.tecido_alpaca ?? 0}/1) • Nv13`, canCraft: farmLevel >= 13 && (inventory.fio_seda ?? 0) >= 1 && (inventory.cachecol_angora ?? 0) >= 1 && (inventory.tecido_alpaca ?? 0) >= 1, reqLevel: 13, onClick: (e: React.MouseEvent) => craftMantaPremium(e) },
                    ].map((r, i) => (
                      <div key={i} className="bg-white border-2 border-indigo-100 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{r.emoji}</span>
                          <div>
                            <div className="font-display font-black text-xs uppercase text-indigo-900 flex items-center gap-1">
                              {r.label}
                              {farmLevel < r.reqLevel && <span className="text-[8px] bg-stone-400 text-white px-1 py-0.5 rounded">🔒 Nv{r.reqLevel}+</span>}
                            </div>
                            <div className="text-[9px] font-mono text-stone-500 mt-0.5">{r.req}</div>
                          </div>
                        </div>
                        <button type="button" onClick={r.onClick} disabled={!r.canCraft}
                          className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                          {farmLevel < r.reqLevel ? `🔒 Nv${r.reqLevel}` : 'Fabricar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ===== TAB: COZINHA ===== */}
                {atelieTab === 'cozinha' && (
                  <div className="space-y-2">
                    <h4 className="font-display font-black text-xs uppercase tracking-wider text-orange-900 mb-2">🥣 Cozinha & Processados</h4>
                    {[
                      { label: 'Maionese', emoji: '🥣', req: `🥚 2 ovos (${inventory.egg}/2) • Nv1`, canCraft: inventory.egg >= 2, reqLevel: 1, onClick: (e: React.MouseEvent) => craftMayonese(e) },
                      { label: 'Patê de Pato', emoji: '🍖', req: `🦆 2 Ov.Pato (${inventory.duck_egg ?? 0}/2) + 🧈 1 Manteiga (${inventory.butter ?? 0}/1) • Nv5`, canCraft: farmLevel >= 5 && (inventory.duck_egg ?? 0) >= 2 && (inventory.butter ?? 0) >= 1, reqLevel: 5, onClick: (e: React.MouseEvent) => craftPatePato(e) },
                      { label: 'Ovo Defumado', emoji: '🥚', req: `🪿 1 Ov.Ganso (${inventory.goose_egg ?? 0}/1) • Nv6`, canCraft: farmLevel >= 6 && (inventory.goose_egg ?? 0) >= 1, reqLevel: 6, onClick: (e: React.MouseEvent) => craftOvoDefumado(e) },
                      { label: 'Conserva de Codorna', emoji: '🥚', req: `🐦 6 Ov.Codorna (${inventory.quail_egg ?? 0}/6) • Nv4`, canCraft: farmLevel >= 4 && (inventory.quail_egg ?? 0) >= 6, reqLevel: 4, onClick: (e: React.MouseEvent) => craftConservaCodorna(e) },
                      { label: 'Incubar Ovos (Nova Galinha)', emoji: '🐣', req: `🥚 3 Ov.Férteis (${inventory.fertile_egg ?? 0}/3) • Nv7`, canCraft: farmLevel >= 7 && (inventory.fertile_egg ?? 0) >= 3, reqLevel: 7, onClick: (e: React.MouseEvent) => craftIncubarOvos(e) },
                      { label: 'Hidromel Artesanal', emoji: '🍺', req: `🍯 2 Mel (${inventory.mel ?? 0}/2) + 🥛 3 Leite (${inventory.milk}/3) • Nv8`, canCraft: farmLevel >= 8 && (inventory.mel ?? 0) >= 2 && inventory.milk >= 3, reqLevel: 8, onClick: (e: React.MouseEvent) => craftHidromel(e) },
                      { label: 'Risoto de Cogumelo', emoji: '🍄', req: `🍄 3 Cogumelos (${inventory.cogumelo ?? 0}/3) • Nv5`, canCraft: farmLevel >= 5 && (inventory.cogumelo ?? 0) >= 3, reqLevel: 5, onClick: (e: React.MouseEvent) => craftRisotoCogumelo(e) },
                      { label: 'Conserva de Peixe', emoji: '🐟', req: `🐟 2 Peixe (${inventory.peixe ?? 0}/2) • Nv4`, canCraft: farmLevel >= 4 && (inventory.peixe ?? 0) >= 2, reqLevel: 4, onClick: (e: React.MouseEvent) => craftConservaPeixe(e) },
                      { label: 'Mel Envasado', emoji: '🍯', req: `🍯 3 Mel (${inventory.mel ?? 0}/3) • Nv3`, canCraft: farmLevel >= 3 && (inventory.mel ?? 0) >= 3, reqLevel: 3, onClick: (e: React.MouseEvent) => craftMelEnvasado(e) },
                      { label: 'Sopa de Cogumelo', emoji: '🍲', req: `🍄 2 Cogumelos (${inventory.cogumelo ?? 0}/2) • Nv3`, canCraft: farmLevel >= 3 && (inventory.cogumelo ?? 0) >= 2, reqLevel: 3, onClick: (e: React.MouseEvent) => craftSopaCogumelo(e) },
                    ].map((r, i) => (
                      <div key={i} className="bg-white border-2 border-orange-100 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{r.emoji}</span>
                          <div>
                            <div className="font-display font-black text-xs uppercase text-orange-900 flex items-center gap-1">
                              {r.label}
                              {farmLevel < r.reqLevel && <span className="text-[8px] bg-stone-400 text-white px-1 py-0.5 rounded">🔒 Nv{r.reqLevel}+</span>}
                            </div>
                            <div className="text-[9px] font-mono text-stone-500 mt-0.5">{r.req}</div>
                          </div>
                        </div>
                        <button type="button" onClick={r.onClick} disabled={!r.canCraft}
                          className="shrink-0 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                          {farmLevel < r.reqLevel ? `🔒 Nv${r.reqLevel}` : 'Fabricar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ===== TAB: COSMÉTICOS ===== */}
                {atelieTab === 'cosmeticos' && (
                  <div className="space-y-2">
                    <h4 className="font-display font-black text-xs uppercase tracking-wider text-green-900 mb-2">🌿 Cosméticos & Orgânicos</h4>
                    {[
                      { label: 'Creme Cosmético', emoji: '🧴', req: `🐌 2 Muco (${inventory.muco ?? 0}/2) + 🐐 1 L.Cabra (${inventory.goat_milk ?? 0}/1) • Nv7`, canCraft: farmLevel >= 7 && (inventory.muco ?? 0) >= 2 && (inventory.goat_milk ?? 0) >= 1, reqLevel: 7, onClick: (e: React.MouseEvent) => craftCremeCosmetico(e) },
                      { label: 'Sabonete Natural', emoji: '🧼', req: `🐌 1 Muco (${inventory.muco ?? 0}/1) + 🧈 1 Manteiga (${inventory.butter ?? 0}/1) + 🥛 1 Leite (${inventory.milk}/1) • Nv9`, canCraft: farmLevel >= 9 && (inventory.muco ?? 0) >= 1 && (inventory.butter ?? 0) >= 1 && inventory.milk >= 1, reqLevel: 9, onClick: (e: React.MouseEvent) => craftSaboneteNatural(e) },
                      { label: 'Ração Orgânica (+3d buff)', emoji: '🌿', req: `🪱 2 Húmus (${inventory.humus ?? 0}/2) • Nv6`, canCraft: farmLevel >= 6 && (inventory.humus ?? 0) >= 2, reqLevel: 6, onClick: (e: React.MouseEvent) => craftRacaoOrganica(e) },
                      { label: 'Fertilizante (+5d buff)', emoji: '🌱', req: `🪱 3 Húmus (${inventory.humus ?? 0}/3) • Nv8`, canCraft: farmLevel >= 8 && (inventory.humus ?? 0) >= 3, reqLevel: 8, onClick: (e: React.MouseEvent) => craftFertilizante(e) },
                    ].map((r, i) => (
                      <div key={i} className="bg-white border-2 border-green-100 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{r.emoji}</span>
                          <div>
                            <div className="font-display font-black text-xs uppercase text-green-900 flex items-center gap-1">
                              {r.label}
                              {farmLevel < r.reqLevel && <span className="text-[8px] bg-stone-400 text-white px-1 py-0.5 rounded">🔒 Nv{r.reqLevel}+</span>}
                            </div>
                            <div className="text-[9px] font-mono text-stone-500 mt-0.5">{r.req}</div>
                          </div>
                        </div>
                        <button type="button" onClick={r.onClick} disabled={!r.canCraft}
                          className="shrink-0 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                          {farmLevel < r.reqLevel ? `🔒 Nv${r.reqLevel}` : 'Fabricar'}
                        </button>
                      </div>
                    ))}
                    {/* Buff status */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 text-xs text-green-800 font-mono">
                      <div className="font-black mb-1">🌟 Buffs Ativos:</div>
                      <div>🌿 Ração Orgânica: {racaoOrganicaDays > 0 ? `${racaoOrganicaDays} dias restantes` : 'Inativo'}</div>
                      <div>🌱 Fertilizante: {fertilizanteDays > 0 ? `${fertilizanteDays} dias restantes` : 'Inativo'}</div>
                    </div>
                  </div>
                )}

                {/* ===== TAB: LUXO ===== */}
                {atelieTab === 'luxo' && (
                  <div className="space-y-2">
                    <h4 className="font-display font-black text-xs uppercase tracking-wider text-purple-900 mb-2">🏺 Produtos de Luxo</h4>
                    {[
                      { label: 'Almofada de Penas', emoji: '🛋️', req: `🪶 3 Penas (${inventory.feather ?? 0}/3) + 🦤 2 P.Grande (${inventory.pena_grande ?? 0}/2) • Nv8`, canCraft: farmLevel >= 8 && (inventory.feather ?? 0) >= 3 && (inventory.pena_grande ?? 0) >= 2, reqLevel: 8, onClick: (e: React.MouseEvent) => craftAlmofadaPenas(e) },
                      { label: 'Colete de Couro', emoji: '🦺', req: `🦤 1 Couro Avestruz (${inventory.couro_avestruz ?? 0}/1) • Nv15`, canCraft: farmLevel >= 15 && (inventory.couro_avestruz ?? 0) >= 1, reqLevel: 15, onClick: (e: React.MouseEvent) => craftColeteCouro(e) },
                      { label: 'Bolsa Exótica', emoji: '👜', req: `🐊 1 Couro Jacaré (${inventory.couro_jacare ?? 0}/1) • Nv18`, canCraft: farmLevel >= 18 && (inventory.couro_jacare ?? 0) >= 1, reqLevel: 18, onClick: (e: React.MouseEvent) => craftBolsaExotica(e) },
                      { label: 'Enfeite de Pavão', emoji: '🦚', req: `🦚 2 P.Pavão (${inventory.peacock_feather ?? 0}/2) + 🦤 1 P.Grande (${inventory.pena_grande ?? 0}/1) • Nv10`, canCraft: farmLevel >= 10 && (inventory.peacock_feather ?? 0) >= 2 && (inventory.pena_grande ?? 0) >= 1, reqLevel: 10, onClick: (e: React.MouseEvent) => craftEnfeitePavao(e) },
                    ].map((r, i) => (
                      <div key={i} className={`bg-white border-2 rounded-xl p-3 flex items-center justify-between gap-3 ${farmLevel >= r.reqLevel ? 'border-purple-200' : 'border-stone-200 opacity-70'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{r.emoji}</span>
                          <div>
                            <div className="font-display font-black text-xs uppercase text-purple-900 flex items-center gap-1">
                              {r.label}
                              {farmLevel < r.reqLevel && <span className="text-[8px] bg-stone-400 text-white px-1 py-0.5 rounded">🔒 Nv{r.reqLevel}+</span>}
                            </div>
                            <div className="text-[9px] font-mono text-stone-500 mt-0.5">{r.req}</div>
                          </div>
                        </div>
                        <button type="button" onClick={r.onClick} disabled={!r.canCraft}
                          className="shrink-0 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-black text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                          {farmLevel < r.reqLevel ? `🔒 Nv${r.reqLevel}` : 'Fabricar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

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
                  Fechar Ateliê
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📋 CONTRATOS MODAL */}
      <AnimatePresence>
        {showContractsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowContractsModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-violet-800 rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              <div className="bg-gradient-to-r from-violet-800 to-purple-900 p-5 border-b-4 border-violet-950 text-center shrink-0">
                <h3 className="text-white text-xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">
                  📋 Contratos de Fornecimento
                </h3>
                <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
                  Acordos com o comerciante viajante — preços garantidos!
                </p>
                <button onClick={() => setShowContractsModal(false)} className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-violet-950 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {contracts.filter(c => c.active).length === 0 ? (
                  <div className="text-center text-stone-500 py-8 font-mono text-sm">
                    📋 Nenhum contrato ativo. O comerciante viajante oferece contratos quando visita a fazenda!
                  </div>
                ) : (
                  contracts.filter(c => c.active).map(c => {
                    const pct = Math.round((c.delivered / c.quantity) * 100);
                    const daysLeft = c.deadline - currentDay;
                    return (
                      <div key={c.id} className={`border-4 rounded-3xl p-5 ${daysLeft <= 2 ? 'border-red-400 bg-red-50' : 'border-violet-300 bg-white'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-display font-black text-sm uppercase text-[#78350f]">
                              {c.product === 'milk' ? '🥛 Leite Cru' : c.product === 'wool' ? '🧶 Lã Crua' : c.product === 'egg' ? '🥚 Ovos' : '🧀 Queijo'}
                            </h4>
                            <p className="text-xs text-stone-500 font-mono mt-0.5">{c.pricePerUnit} moedas/un (garantido)</p>
                          </div>
                          <span className={`text-xs font-mono font-bold px-2 py-1 rounded-full ${daysLeft <= 2 ? 'bg-red-500 text-white' : 'bg-violet-100 text-violet-800'}`}>
                            {daysLeft > 0 ? `${daysLeft}d restante(s)` : 'VENCIDO!'}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-stone-600 mb-2">
                          Entregue: {c.delivered}/{c.quantity} un • Multa se falhar: {c.penalty} moedas
                        </div>
                        <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200">
                          <div className="bg-gradient-to-r from-violet-400 to-purple-500 h-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-[10px] font-mono text-center mt-1 text-stone-500">{pct}% entregue</div>
                      </div>
                    );
                  })
                )}
                {contracts.filter(c => !c.active).length > 0 && (
                  <div>
                    <h4 className="font-display font-black text-xs uppercase text-stone-400 mb-2">Histórico (concluídos/expirados)</h4>
                    {contracts.filter(c => !c.active).slice(-3).map(c => (
                      <div key={c.id} className="text-xs text-stone-400 font-mono border border-stone-200 rounded-xl p-2 mb-1">
                        {c.product} • {c.delivered}/{c.quantity} entregues
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-violet-50 p-4 border-t border-violet-100 flex justify-end shrink-0">
                <button onClick={() => setShowContractsModal(false)} className="bg-violet-600 hover:bg-violet-500 text-white border-b-4 border-violet-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider cursor-pointer">
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 👷 WORKERS MODAL */}
      <AnimatePresence>
        {showWorkersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWorkersModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#064e3b] border-8 border-[#fbbf24] rounded-[36px] max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              <div className="bg-[#065f46] p-5 border-b-4 border-[#fbbf24] text-center shrink-0">
                <h3 className="text-[#fef3c7] text-xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">
                  👷 Peões da Fazenda
                </h3>
                <p className="text-[#fbbf24] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
                  Vagas: {workers.length}/{Math.max(1, Math.floor(farmLevel / 3))} • 1 vaga a cada 3 níveis
                </p>
                <button onClick={() => setShowWorkersModal(false)} className="absolute top-4 right-4 text-[#fef3c7] bg-[#022c22] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {workers.length > 0 && (
                  <div className="bg-[#065f46] border-2 border-[#fbbf24]/40 rounded-2xl p-4">
                    <h4 className="text-[#fbbf24] font-black text-xs uppercase mb-3">Peões Contratados</h4>
                    <div className="space-y-2">
                      {workers.map(w => {
                        const wt = WORKER_TYPES.find(t => t.role === w.role);
                        return (
                          <div key={w.id} className="flex items-center justify-between bg-[#022c22] rounded-xl px-3 py-2">
                            <span className="text-[#fef3c7] font-mono text-sm">{wt?.emoji} {w.name}</span>
                            <span className="text-[#fbbf24] font-mono text-xs">-{w.dailyCost}💰/dia</span>
                            <button onClick={() => {
                              setWorkers(prev => prev.filter(x => x.id !== w.id));
                              addLog(`👷 ${w.name} foi dispensado.`, 'info');
                            }} className="text-red-400 text-xs font-black px-2 py-1 rounded-lg border border-red-400/40 hover:bg-red-400/20 cursor-pointer">
                              Dispensar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-[#fbbf24] font-mono text-xs mt-3 text-right">
                      Custo total: -{workers.reduce((s, w) => s + w.dailyCost, 0)}💰/dia
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  <h4 className="text-[#fbbf24] font-black text-xs uppercase">Disponíveis para Contratar</h4>
                  {WORKER_TYPES.map(wt => {
                    const alreadyHired = workers.some(w => w.role === wt.role);
                    const maxSlots = Math.max(1, Math.floor(farmLevel / 3));
                    const atMax = workers.length >= maxSlots;
                    const levelOk = farmLevel >= wt.minLevel;
                    const canHire = !alreadyHired && !atMax && levelOk;
                    return (
                      <div key={wt.role} className={`bg-[#065f46] border-2 rounded-2xl p-4 transition-all ${alreadyHired ? 'border-[#10b981]' : levelOk ? 'border-[#fbbf24]/50' : 'border-[#fbbf24]/15 opacity-60'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[#fef3c7] font-black text-sm">{wt.emoji} {wt.name}</span>
                              {alreadyHired && <span className="text-[9px] bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 rounded-full px-2 py-0.5 font-mono uppercase">Contratado</span>}
                              {!levelOk && <span className="text-[9px] bg-red-900/40 text-red-300 border border-red-500/30 rounded-full px-2 py-0.5 font-mono uppercase">🔒 Nível {wt.minLevel}</span>}
                            </div>
                            <div className="text-[#fef3c7]/70 text-[11px] font-mono mt-1 leading-relaxed">{wt.desc}</div>
                            <div className="text-[#fbbf24] text-[10px] font-mono mt-1.5">
                              -{wt.dailyCost}💰/dia
                            </div>
                          </div>
                          <button
                            disabled={!canHire}
                            onClick={() => {
                              if (!canHire) return;
                              const newWorker: FarmWorker = {
                                id: Math.random().toString(36).substring(2, 9),
                                role: wt.role,
                                name: wt.name,
                                dailyCost: wt.dailyCost,
                                hiredDay: currentDay,
                              };
                              setWorkers(prev => [...prev, newWorker]);
                              addLog(`👷 ${wt.name} foi contratado! Custo: -${wt.dailyCost}💰/dia`, 'success');
                            }}
                            className={`shrink-0 text-xs font-black uppercase px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                              alreadyHired ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981] cursor-not-allowed' :
                              !levelOk ? 'bg-[#022c22] border-[#fbbf24]/10 text-[#fef3c7]/20 cursor-not-allowed' :
                              atMax ? 'bg-[#022c22] border-[#fbbf24]/20 text-[#fef3c7]/30 cursor-not-allowed' :
                              'bg-[#fbbf24] border-[#fbbf24] text-[#78350f] hover:bg-[#f59e0b] hover:scale-105 active:translate-y-0.5'
                            }`}
                          >
                            {alreadyHired ? '✅ Ativo' : !levelOk ? `🔒 Nível ${wt.minLevel}` : atMax ? `🚫 Máx ${maxSlots}` : 'Contratar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔧 MELHORIAS MODAL (F7 terreno, F8 poço, F9 solar, F10 irrigação, F5 seguro, F11 queijaria) */}
      <AnimatePresence>
        {showUpgradesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUpgradesModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-orange-800 rounded-[36px] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              <div className="bg-gradient-to-r from-orange-700 to-amber-800 p-5 border-b-4 border-orange-950 text-center shrink-0">
                <h3 className="text-white text-xl font-display font-black uppercase tracking-wider flex items-center justify-center gap-2">
                  🔧 Melhorias da Fazenda
                </h3>
                <p className="text-[#fcd57e] text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">
                  Expanda o terreno, instale infraestrutura e proteja sua fazenda
                </p>
                <button onClick={() => setShowUpgradesModal(false)} className="absolute top-4 right-4 text-[#fcd57e] bg-orange-950 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* F7: Expansão de Terreno + Biome Selection */}
                <div className="bg-white border-4 border-green-300 rounded-3xl p-4">
                  <h4 className="font-display font-black text-sm uppercase text-green-800 mb-1">🏡 Expansão de Terreno</h4>
                  <p className="text-xs text-stone-500 font-mono mb-3">Cada lote permite +5 animais. Atual: Lote {landLots}/5 ({landLots * 5} animais máx)</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { lot: 2, price: 200 }, { lot: 3, price: 400 }, { lot: 4, price: 800 }, { lot: 5, price: 1600 }
                    ].map(({ lot, price }) => (
                      <button
                        key={lot}
                        disabled={landLots >= lot || gold < price}
                        onClick={() => {
                          if (gold >= price && landLots < lot) {
                            setGold(prev => prev - price);
                            setLandLots(lot);
                            addLog(`🏡 Terreno expandido! Agora você tem ${lot} lote(s) e pode ter até ${lot * 5} animais.`, 'success');
                            triggerAudioResult(() => sfx.playSound('levelup'));
                          }
                        }}
                        className={`text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${landLots >= lot ? 'bg-green-100 border-green-300 text-green-700' : gold >= price ? 'bg-amber-500 hover:bg-amber-400 text-white border-amber-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                      >
                        {landLots >= lot ? `✅ Lote ${lot}` : `Lote ${lot} (${price}💰)`}
                      </button>
                    ))}
                  </div>
                  {/* Biome Selection */}
                  <div className="border-t-2 border-green-200 pt-3">
                    <h5 className="font-display font-black text-xs uppercase text-green-700 mb-2">🌿 Biomas de Terreno</h5>
                    <p className="text-[10px] text-stone-500 font-mono mb-2">Atribua biomas aos lotes para bônus especiais</p>
                    <div className="space-y-2">
                      {[
                        { biome: 'pasto' as BiomeType, emoji: '🌾', label: 'Pasto', price: 50, desc: 'Padrão', minLevel: 1 },
                        { biome: 'lago' as BiomeType, emoji: '🌊', label: 'Lago', price: 120, desc: 'Rã 2x, Pato/Ganso +20%', minLevel: 8 },
                        { biome: 'floresta' as BiomeType, emoji: '🌲', label: 'Floresta', price: 150, desc: 'Minhoca/Caracol +50%', minLevel: 10 },
                        { biome: 'pomar' as BiomeType, emoji: '🍎', label: 'Pomar', price: 200, desc: 'Todos +2 felicidade/dia', minLevel: 12 },
                      ].map(({ biome, emoji, label, price, desc, minLevel }) => {
                        const owned = landBiomes.filter(b => b.biome === biome).length;
                        const canBuy = farmLevel >= minLevel && gold >= price && landBiomes.length < landLots;
                        return (
                          <div key={biome} className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
                            <div>
                              <span className="font-mono font-black text-xs text-green-900">{emoji} {label}</span>
                              <span className="text-[10px] text-stone-500 font-mono ml-2">{desc}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-stone-500 font-mono">×{owned}</span>
                              <button
                                disabled={!canBuy}
                                onClick={() => {
                                  if (!canBuy) return;
                                  setGold(prev => prev - price);
                                  setLandBiomes(prev => [...prev, { id: prev.length + 1, biome, purchasedDay: currentDay }]);
                                  addLog(`🌿 Bioma ${label} adicionado ao terreno! (${price}💰)`, 'success');
                                }}
                                className={`text-[10px] font-black px-2 py-1 rounded-lg border cursor-pointer transition-all ${!canBuy ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed' : 'bg-green-500 border-green-700 text-white hover:bg-green-400'}`}
                              >
                                {farmLevel < minLevel ? `🔒 Nv${minLevel}` : `+${price}💰`}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {landBiomes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {landBiomes.map((b, i) => (
                          <span key={i} className="text-[10px] bg-green-100 text-green-800 border border-green-300 rounded-full px-2 py-0.5 font-mono">
                            {b.biome === 'pasto' ? '🌾' : b.biome === 'lago' ? '🌊' : b.biome === 'floresta' ? '🌲' : '🍎'} {b.biome}
                          </span>
                        ))}
                      </div>
                    )}
                    {landBiomes.length > 0 && (Object.values(biomeWeeklyIncome).some((v: number) => v > 0)) && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
                        <div className="text-[10px] font-black uppercase text-green-800 mb-2">📊 Receita Semanal por Bioma</div>
                        <div className="space-y-1">
                          {([['lago', '🌊', biomeWeeklyIncome.lago], ['floresta', '🌲', biomeWeeklyIncome.floresta], ['pasto', '🌾', biomeWeeklyIncome.pasto], ['pomar', '🍎', biomeWeeklyIncome.pomar]] as [string, string, number][]).map(([key, emoji, val]) => val > 0 ? (
                            <div key={key} className="flex items-center gap-2">
                              <span className="text-xs">{emoji} {key}</span>
                              <div className="flex-1 bg-green-100 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (val / Math.max(...(Object.values(biomeWeeklyIncome) as number[]), 1)) * 100)}%` }} />
                              </div>
                              <span className="text-[10px] font-mono font-black text-green-700">+{val}💰</span>
                            </div>
                          ) : null)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* F8: Poço d'água */}
                <div className="bg-white border-4 border-blue-300 rounded-3xl p-4">
                  <h4 className="font-display font-black text-sm uppercase text-blue-800 mb-1">💧 Poço d'Água</h4>
                  <p className="text-xs text-stone-500 font-mono mb-2">Reduz custo de ração em 10% por nível. Atual: Nível {wellLevel}/3 ({wellLevel * 10}% desconto)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ lvl: 1, price: 150 }, { lvl: 2, price: 300 }, { lvl: 3, price: 500 }].map(({ lvl, price }) => (
                      <button
                        key={lvl}
                        disabled={wellLevel >= lvl || gold < price}
                        onClick={() => {
                          if (gold >= price && wellLevel < lvl) {
                            setGold(prev => prev - price);
                            setWellLevel(lvl);
                            addLog(`💧 Poço d'água nível ${lvl} instalado! Ração ${lvl * 10}% mais barata.`, 'success');
                            triggerAudioResult(() => sfx.playSound('levelup'));
                          }
                        }}
                        className={`text-xs font-mono font-black py-2 px-2 rounded-xl border-b-2 transition-all cursor-pointer ${wellLevel >= lvl ? 'bg-blue-100 border-blue-300 text-blue-700' : gold >= price ? 'bg-blue-500 hover:bg-blue-400 text-white border-blue-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                      >
                        {wellLevel >= lvl ? `✅ Nv${lvl}` : `Nv${lvl} (${price}💰)`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* F9: Gerador Solar */}
                <div className="bg-white border-4 border-yellow-300 rounded-3xl p-4">
                  <h4 className="font-display font-black text-sm uppercase text-yellow-800 mb-1">☀️ Gerador Solar</h4>
                  <p className="text-xs text-stone-500 font-mono mb-2">
                    Reduz manutenção e conta de energia das máquinas. Atual: Nível {solarLevel}/3<br/>
                    Nv1: -15% manutenção de máquinas, -40% conta de energia<br/>
                    Nv2: -30% manutenção, -70% conta de energia<br/>
                    Nv3: -45% manutenção, energia GRATUITA 🆓 (Nv5+ da fazenda)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ lvl: 1, price: 200 }, { lvl: 2, price: 400 }, { lvl: 3, price: 700 }].map(({ lvl, price }) => {
                      const requiresFarmLevel5 = lvl === 3 && farmLevel < 5;
                      const canAfford = gold >= price && solarLevel < lvl && !requiresFarmLevel5;
                      return (
                        <button
                          key={lvl}
                          disabled={solarLevel >= lvl || !canAfford}
                          onClick={() => {
                            if (canAfford) {
                              setGold(prev => prev - price);
                              setSolarLevel(lvl);
                              addLog(`☀️ Gerador solar nível ${lvl} instalado! Manutenção ${lvl * 15}% mais barata.`, 'success');
                              triggerAudioResult(() => sfx.playSound('levelup'));
                            } else if (requiresFarmLevel5) {
                              addLog('☀️ Gerador solar nível 3 requer Fazenda Nível 5!', 'error');
                            }
                          }}
                          className={`text-xs font-mono font-black py-2 px-2 rounded-xl border-b-2 transition-all cursor-pointer ${solarLevel >= lvl ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : canAfford ? 'bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                        >
                          {solarLevel >= lvl ? `✅ Nv${lvl}` : requiresFarmLevel5 ? `Nv${lvl} (Nv5 fazenda)` : `Nv${lvl} (${price}💰)`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* F10: Irrigação */}
                <div className="bg-white border-4 border-cyan-300 rounded-3xl p-4">
                  <h4 className="font-display font-black text-sm uppercase text-cyan-800 mb-1">🌊 Sistema de Irrigação</h4>
                  <p className="text-xs text-stone-500 font-mono mb-2">
                    Nv1: eventos de seca -40% impacto. Nv2: imunidade total a secas. Atual: Nível {irrigationLevel}/2
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ lvl: 1, price: 250 }, { lvl: 2, price: 500 }].map(({ lvl, price }) => (
                      <button
                        key={lvl}
                        disabled={irrigationLevel >= lvl || gold < price}
                        onClick={() => {
                          if (gold >= price && irrigationLevel < lvl) {
                            setGold(prev => prev - price);
                            setIrrigationLevel(lvl);
                            addLog(`🌊 Irrigação nível ${lvl} instalada! Eventos de seca ${lvl === 2 ? 'imunes' : '40% menos impacto'}.`, 'success');
                            triggerAudioResult(() => sfx.playSound('levelup'));
                          }
                        }}
                        className={`text-xs font-mono font-black py-2 px-2 rounded-xl border-b-2 transition-all cursor-pointer ${irrigationLevel >= lvl ? 'bg-cyan-100 border-cyan-300 text-cyan-700' : gold >= price ? 'bg-cyan-500 hover:bg-cyan-400 text-white border-cyan-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                      >
                        {irrigationLevel >= lvl ? `✅ Nv${lvl}` : `Nv${lvl} (${price}💰)`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* F5: Seguro Agrícola */}
                <div className="bg-white border-4 border-emerald-300 rounded-3xl p-4">
                  <h4 className="font-display font-black text-sm uppercase text-emerald-800 mb-1">🛡️ Seguro Agrícola</h4>
                  <p className="text-xs text-stone-500 font-mono mb-2">
                    Reduz impacto de eventos negativos em 70% por 7 dias. {insurance.active ? `Ativo: ${insurance.daysLeft} dias restantes` : 'Inativo'}
                  </p>
                  <button
                    disabled={insurance.active || gold < 50}
                    onClick={() => {
                      if (!insurance.active && gold >= 50) {
                        setGold(prev => prev - 50);
                        setInsurance({ active: true, premium: 50, daysLeft: 7 });
                        addLog('🛡️ Seguro agrícola contratado por 7 dias por 50 moedas!', 'success');
                        triggerAudioResult(() => sfx.playSound('levelup'));
                      }
                    }}
                    className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${insurance.active ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : gold >= 50 ? 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                  >
                    {insurance.active ? `✅ Seguro Ativo (${insurance.daysLeft}d)` : 'Contratar Seguro (50💰 / 7 dias)'}
                  </button>
                </div>

                {/* Grupo 3a: Estábulo */}
                <div className="bg-white border-4 border-stone-300 rounded-3xl p-4">
                  <h4 className="font-display font-black text-sm uppercase text-stone-800 mb-1">🏠 Estábulo</h4>
                  <p className="text-xs text-stone-500 font-mono mb-2">
                    No inverno, animais perdem 50% menos felicidade (recuperam +5 por dia). {hasStable ? '✅ Instalado' : 'Não instalado'}
                  </p>
                  <button
                    disabled={hasStable || gold < 200}
                    onClick={() => {
                      if (!hasStable && gold >= 200) {
                        setGold(prev => prev - 200);
                        setHasStable(true);
                        addLog('🏠 Estábulo construído! Animais mais confortáveis no inverno.', 'success');
                        triggerAudioResult(() => sfx.playSound('levelup'));
                      }
                    }}
                    className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${hasStable ? 'bg-stone-100 border-stone-300 text-stone-700' : gold >= 200 ? 'bg-stone-500 hover:bg-stone-400 text-white border-stone-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                  >
                    {hasStable ? '✅ Estábulo Construído' : 'Construir Estábulo (200💰)'}
                  </button>
                </div>

                {/* Grupo 3b: Silo de Grãos */}
                <div className="bg-white border-4 border-orange-200 rounded-3xl p-4">
                  <h4 className="font-display font-black text-sm uppercase text-orange-800 mb-1">🏗️ Silo de Grãos</h4>
                  <p className="text-xs text-stone-500 font-mono mb-2">
                    15% de desconto em todas as compras de ração. {hasSilo ? '✅ Instalado' : 'Não instalado'}
                  </p>
                  <button
                    disabled={hasSilo || gold < 150}
                    onClick={() => {
                      if (!hasSilo && gold >= 150) {
                        setGold(prev => prev - 150);
                        setHasSilo(true);
                        addLog('🏗️ Silo de grãos construído! 15% de desconto em rações.', 'success');
                        triggerAudioResult(() => sfx.playSound('levelup'));
                      }
                    }}
                    className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${hasSilo ? 'bg-orange-100 border-orange-300 text-orange-700' : gold >= 150 ? 'bg-orange-500 hover:bg-orange-400 text-white border-orange-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                  >
                    {hasSilo ? '✅ Silo Instalado' : 'Instalar Silo (150💰)'}
                  </button>
                </div>

                {/* Grupo 3c: Geladeira Industrial */}
                <div className="bg-white border-4 border-sky-200 rounded-3xl p-4">
                  <h4 className="font-display font-black text-sm uppercase text-sky-800 mb-1">🧊 Geladeira Industrial</h4>
                  <p className="text-xs text-stone-500 font-mono mb-2">
                    Previne perda de qualidade dos produtos perecíveis (leite, ovos duram 50% mais). {hasFridge ? '✅ Instalada' : 'Não instalada'}
                  </p>
                  <button
                    disabled={hasFridge || gold < 250}
                    onClick={() => {
                      if (!hasFridge && gold >= 250) {
                        setGold(prev => prev - 250);
                        setHasFridge(true);
                        addLog('🧊 Geladeira industrial instalada! Produtos perecíveis duram mais.', 'success');
                        triggerAudioResult(() => sfx.playSound('levelup'));
                      }
                    }}
                    className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${hasFridge ? 'bg-sky-100 border-sky-300 text-sky-700' : gold >= 250 ? 'bg-sky-500 hover:bg-sky-400 text-white border-sky-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                  >
                    {hasFridge ? '✅ Geladeira Instalada' : 'Instalar Geladeira (250💰)'}
                  </button>
                </div>

                {/* Grupo 4c: Caixinha de Gorjeta */}
                <div className="bg-white border-4 border-yellow-200 rounded-3xl p-4">
                  <h4 className="font-display font-black text-sm uppercase text-yellow-800 mb-1">🪙 Caixinha de Gorjeta</h4>
                  <p className="text-xs text-stone-500 font-mono mb-2">
                    25% de chance por dia de receber gorjeta de 5-25 moedas de visitantes. {hasTipBox ? '✅ Instalada' : 'Não instalada'}
                  </p>
                  <button
                    disabled={hasTipBox || gold < 50}
                    onClick={() => {
                      if (!hasTipBox && gold >= 50) {
                        setGold(prev => prev - 50);
                        setHasTipBox(true);
                        addLog('🪙 Caixinha de gorjeta colocada! Visitantes poderão deixar gorjetas.', 'success');
                        triggerAudioResult(() => sfx.playSound('levelup'));
                      }
                    }}
                    className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${hasTipBox ? 'bg-yellow-100 border-yellow-300 text-yellow-700' : gold >= 50 ? 'bg-yellow-500 hover:bg-yellow-400 text-white border-yellow-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                  >
                    {hasTipBox ? '✅ Caixinha Instalada' : 'Instalar Caixinha (50💰)'}
                  </button>
                </div>

                {/* 🏕️ Área de Visitantes (Turismo Rural) */}
                <div className="bg-white border-4 border-teal-300 rounded-3xl p-4">
                  <h4 className="font-display font-black text-sm uppercase text-teal-800 mb-1">🏕️ Área de Visitantes (Turismo Rural)</h4>
                  <p className="text-xs text-stone-500 font-mono mb-2">
                    Receba turistas semanalmente! Receita = (nível×20) + (animais×5) + (pavões×30) moedas. Requer Nível 4+. {hasTourism ? '✅ Instalada' : 'Não instalada'}
                  </p>
                  <button
                    disabled={hasTourism || gold < 400 || farmLevel < 4}
                    onClick={() => {
                      if (!hasTourism && gold >= 400 && farmLevel >= 4) {
                        setGold(prev => prev - 400);
                        setHasTourism(true);
                        addLog('🏕️ Área de Visitantes construída! Turistas virão toda semana.', 'success');
                        triggerAudioResult(() => sfx.playSound('levelup'));
                      }
                    }}
                    className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${hasTourism ? 'bg-teal-100 border-teal-300 text-teal-700' : farmLevel >= 4 && gold >= 400 ? 'bg-teal-500 hover:bg-teal-400 text-white border-teal-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                  >
                    {hasTourism ? '✅ Área de Visitantes Instalada' : farmLevel < 4 ? '🔒 Requer Nível 4 (400💰)' : 'Construir Área de Visitantes (400💰)'}
                  </button>
                </div>

                {/* F11: Expansão da Queijaria */}
                <div className="bg-white border-4 border-amber-300 rounded-3xl p-4">
                  <h4 className="font-display font-black text-sm uppercase text-amber-800 mb-1">🧀 Expansão da Queijaria</h4>
                  <p className="text-xs text-stone-500 font-mono mb-2">
                    Prateleiras atuais: {maxPrateleiras}. Mais prateleiras = mais queijos simultaneamente.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ slots: 4, price: 150 }, { slots: 6, price: 300 }, { slots: 8, price: 500 }].map(({ slots, price }) => (
                      <button
                        key={slots}
                        disabled={maxPrateleiras >= slots || gold < price}
                        onClick={() => {
                          if (gold >= price && maxPrateleiras < slots) {
                            setGold(prev => prev - price);
                            setMaxPrateleiras(slots);
                            addLog(`🧀 Queijaria ampliada para ${slots} prateleiras!`, 'success');
                            triggerAudioResult(() => sfx.playSound('levelup'));
                          }
                        }}
                        className={`text-xs font-mono font-black py-2 px-2 rounded-xl border-b-2 transition-all cursor-pointer ${maxPrateleiras >= slots ? 'bg-amber-100 border-amber-300 text-amber-700' : gold >= price ? 'bg-amber-500 hover:bg-amber-400 text-white border-amber-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                      >
                        {maxPrateleiras >= slots ? `✅ ${slots} prateleiras` : `${slots} prateleiras (${price}💰)`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Licença de Fauna Exótica */}
                <div className="bg-white border-4 border-purple-300 rounded-3xl p-4">
                  <h4 className="font-display font-black text-sm uppercase text-purple-800 mb-1">🦎 Licença de Fauna Exótica</h4>
                  <p className="text-xs text-stone-500 font-mono mb-2">
                    Autoriza criação de jacaré sem multas de fiscalização (5%/dia = -300💰). Requer Nível 18. {licencaExotica ? '✅ Obtida' : 'Não obtida'}
                  </p>
                  <button
                    disabled={licencaExotica || gold < 500 || farmLevel < 18}
                    onClick={() => {
                      if (!licencaExotica && gold >= 500 && farmLevel >= 18) {
                        setGold(prev => prev - 500);
                        setLicencaExotica(true);
                        addLog('🦎 Licença de Fauna Exótica obtida! Jacarés não serão multados.', 'success');
                        triggerAudioResult(() => sfx.playSound('levelup'));
                      }
                    }}
                    className={`w-full text-xs font-mono font-black py-2 px-3 rounded-xl border-b-2 transition-all cursor-pointer ${licencaExotica ? 'bg-purple-100 border-purple-300 text-purple-700' : farmLevel >= 18 && gold >= 500 ? 'bg-purple-500 hover:bg-purple-400 text-white border-purple-700' : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed opacity-60'}`}
                  >
                    {licencaExotica ? '✅ Licença Obtida' : farmLevel < 18 ? '🔒 Requer Nível 18 (500💰)' : 'Obter Licença (500💰)'}
                  </button>
                </div>

              </div>
              <div className="bg-orange-50 p-4 border-t border-orange-100 flex justify-end shrink-0">
                <button onClick={() => setShowUpgradesModal(false)} className="bg-orange-600 hover:bg-orange-500 text-white border-b-4 border-orange-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider cursor-pointer">
                  Fechar Melhorias
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

              {/* Active market event banner */}
              {activeMarketEvent && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3 mb-4 mx-4 mt-2">
                  <div className="font-black text-amber-800 text-sm">{activeMarketEvent.title}</div>
                  <div className="text-amber-700 text-xs mt-0.5">{activeMarketEvent.desc}</div>
                  <div className="text-amber-500 font-mono text-[10px] mt-1">⏳ {activeMarketEvent.daysLeft} dia(s) restante(s)</div>
                </div>
              )}

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
                  // F6: verificar alta temporada
                  const seasonalMult = getSeasonalityMultiplier(item.key, currentDay);
                  const isHighSeason = seasonalMult > 1.0;

                  return (
                    <div key={item.key} className={`border-3 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs ${isHighSeason ? 'bg-amber-50 border-amber-300' : 'bg-white border-stone-200'}`}>

                      {/* Name of Product */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-sm uppercase text-[#78350f] tracking-wide">{item.label}</span>
                          {isHighSeason && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 animate-pulse">🔥 Alta Temporada! +{Math.round((seasonalMult - 1) * 100)}%</span>}
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

                        {/* Previsão de preço para os próximos 3 dias */}
                        {(() => {
                          const forecast = getPriceForecast(item.key);
                          if (!forecast.day1) return null;
                          return (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[9px] font-mono w-full">
                              <div className="text-stone-400 font-bold uppercase tracking-wider mb-1">📅 Previsão:</div>
                              <div className="flex gap-2">
                                <span>Amanhã: ~{forecast.day1}💰 {forecast.trend > 0 ? '▲' : forecast.trend < 0 ? '▼' : '→'}</span>
                                <span>|</span>
                                <span>+2d: ~{forecast.day2}💰</span>
                                <span>|</span>
                                <span>+3d: ~{forecast.day3}💰</span>
                              </div>
                            </div>
                          );
                        })()}

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

                {/* Novos animais exóticos — gráficos de preço */}
                {farmLevel >= 3 && (
                  <div className="border-t-2 border-stone-100 pt-3 mt-1">
                    <div className="text-[10px] font-mono font-black text-stone-400 uppercase tracking-widest mb-3">🌿 Produtos Exóticos e Novos Animais</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {([
                        { key: 'quail_egg', label: '🐦 Ovo de Codorna', base: 8 },
                        { key: 'alpaca_wool', label: '🦙 Lã de Alpaca', base: 65 },
                        { key: 'humus', label: '🪱 Húmus', base: 20 },
                        { key: 'muco', label: '🐌 Muco de Caracol', base: 120 },
                        { key: 'angora_wool', label: '🐇 Lã Angorá', base: 90 },
                        { key: 'seda_bruta', label: '🪲 Seda Bruta', base: 80 },
                        { key: 'coxa_ra', label: '🐸 Coxa de Rã', base: 70 },
                        { key: 'carne_avestruz', label: '🦤 Carne de Avestruz', base: 200 },
                        { key: 'pena_grande', label: '🦤 Pena de Avestruz', base: 60 },
                        { key: 'couro_avestruz', label: '🦤 Couro de Avestruz', base: 300 },
                        { key: 'carne_jacare', label: '🐊 Carne de Jacaré', base: 250 },
                        { key: 'couro_jacare', label: '🐊 Couro de Jacaré', base: 400 },
                      ] as const).map(item => (
                        <div key={item.key} className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-display font-black text-xs uppercase text-[#78350f]">{item.label}</div>
                            <div className="text-stone-400 text-[9px] font-mono">Base: {item.base}💰 | Atual: {getDynamicTransactionPrice(item.key)}💰</div>
                            <div className="text-[9px] text-stone-400 font-mono">Estoque: {inventory[item.key] ?? 0}u</div>
                          </div>
                          <PriceChart history={priceHistory[item.key] || [item.base, item.base, item.base, item.base, item.base, item.base, item.base]} basePrice={item.base} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Biome Exclusive Products */}
                {((inventory.peixe ?? 0) > 0 || (inventory.mel ?? 0) > 0 || (inventory.cogumelo ?? 0) > 0 || landBiomes.some(b => b.biome === 'lago' || b.biome === 'floresta')) && (
                  <div className="bg-[#064e3b]/10 border-2 border-[#fbbf24]/40 rounded-2xl p-4">
                    <h4 className="font-display font-black text-xs uppercase text-[#78350f] mb-3">🌿 Produtos Exclusivos de Bioma</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {landBiomes.some(b => b.biome === 'lago') && (
                        <div className="bg-white border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-display font-black text-xs uppercase text-[#78350f]">🐟 Peixe (Lago)</div>
                            <div className="text-stone-400 text-[9px] font-mono">Base: 45💰 | Atual: {getActualSellPrice('peixe' as any)}💰</div>
                            <div className="text-[9px] text-stone-400 font-mono">Estoque: {inventory.peixe ?? 0}u · Produz a cada 3 dias</div>
                          </div>
                        </div>
                      )}
                      {landBiomes.some(b => b.biome === 'floresta') && (
                        <>
                          <div className="bg-white border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3">
                            <div>
                              <div className="font-display font-black text-xs uppercase text-[#78350f]">🍯 Mel (Floresta)</div>
                              <div className="text-stone-400 text-[9px] font-mono">Base: 80💰 | Atual: {getActualSellPrice('mel' as any)}💰</div>
                              <div className="text-[9px] text-stone-400 font-mono">Estoque: {inventory.mel ?? 0}u · Produz a cada 5 dias</div>
                            </div>
                          </div>
                          <div className="bg-white border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3">
                            <div>
                              <div className="font-display font-black text-xs uppercase text-[#78350f]">🍄 Cogumelo (Floresta)</div>
                              <div className="text-stone-400 text-[9px] font-mono">Base: 35💰 | Atual: {getActualSellPrice('cogumelo' as any)}💰</div>
                              <div className="text-[9px] text-stone-400 font-mono">Estoque: {inventory.cogumelo ?? 0}u · Produz a cada 4 dias</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

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

              {/* Prestige Points */}
              {prestigePoints > 0 && (
                <div className="px-6 pb-4">
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-yellow-700 mb-3 flex items-center gap-1.5">⭐ Pontos de Prestígio</h4>
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black font-mono text-yellow-800">⭐ {prestigePoints} pts</span>
                      <span className="text-[10px] font-mono text-yellow-600">
                        {prestigePoints >= 500 ? '🌌 LENDA DO AGRO' : prestigePoints >= 300 ? '👑 Mestre' : prestigePoints >= 150 ? '🥇 Experiente' : prestigePoints >= 50 ? '🥈 Reconhecido' : '🌱 Iniciante'}
                      </span>
                    </div>
                    {[
                      { pts: 50, label: 'Turismo +10%', achieved: prestigePoints >= 50 },
                      { pts: 150, label: 'Comerciante mais frequente', achieved: prestigePoints >= 150 },
                      { pts: 300, label: 'Preços +5% permanente', achieved: prestigePoints >= 300 },
                      { pts: 500, label: 'LENDA DO AGRO', achieved: prestigePoints >= 500 },
                    ].map(m => (
                      <div key={m.pts} className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-mono ${m.achieved ? 'text-yellow-700 font-bold' : 'text-stone-400'}`}>
                          {m.achieved ? '✅' : '⬜'} {m.pts} pts: {m.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      {/* 🐣 MODAL DE HISTÓRICO DE REPRODUÇÕES */}
      <AnimatePresence>
        {showReproModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReproModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-pink-700 rounded-[36px] max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              <div className="bg-gradient-to-r from-pink-700 to-pink-900 p-5 border-b-4 border-pink-950 text-center shrink-0">
                <h3 className="text-white text-xl font-display font-black uppercase tracking-wider">🐣 Histórico de Reproduções</h3>
                <p className="text-pink-200 text-[11px] font-mono font-bold uppercase tracking-widest mt-0.5">Últimos 50 nascimentos registrados</p>
                <button onClick={() => setShowReproModal(false)}
                  className="absolute top-4 right-4 text-pink-200 hover:text-white bg-pink-950 hover:bg-pink-800 border-2 border-pink-900 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all text-lg font-bold">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ scrollbarWidth: 'thin' }}>
                {reproHistory.length === 0 ? (
                  <div className="text-center text-stone-500 text-xs italic py-8">Nenhuma reprodução registrada ainda.</div>
                ) : reproHistory.map((r, i) => (
                  <div key={i} className="bg-white border-2 border-pink-200 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{r.method === 'natural' ? '🐣' : r.method === 'gestacao' ? '👶' : '🍼'}</span>
                      <div>
                        <div className="font-black text-xs text-pink-900">{r.name}</div>
                        <div className="text-[9px] font-mono text-stone-500">{r.animalType} • {r.method === 'natural' ? 'Natural' : r.method === 'gestacao' ? 'Gestação' : 'Filhote comprado'}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 shrink-0">Dia {r.day}</span>
                  </div>
                ))}
              </div>
              <div className="bg-pink-50 p-4 border-t-2 border-pink-200 flex justify-end shrink-0">
                <button onClick={() => setShowReproModal(false)}
                  className="bg-pink-600 hover:bg-pink-500 text-white border-b-4 border-pink-900 shadow-md px-6 py-2.5 rounded-2xl font-display font-black uppercase text-xs tracking-wider transition-all hover:scale-105 active:translate-y-0.5 cursor-pointer">
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌟 MODAL DE ESPECIALIZAÇÃO */}
      <AnimatePresence>
        {showSpecializationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#fffbeb] border-8 border-emerald-700 rounded-[36px] max-w-lg w-full shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-5 border-b-4 border-emerald-900 text-center">
                <h3 className="text-white text-xl font-display font-black uppercase tracking-wider">🌟 Escolha sua Especialização!</h3>
                <p className="text-emerald-200 text-xs font-mono mt-1">Sua fazenda atingiu nível 2! Escolha um foco permanente.</p>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'leiteira' as FarmSpecialization, emoji: '🥛', title: 'LEITEIRA', desc: 'Foco em vacas, cabras e búfalos', bonuses: '+20% produção de leite\n-10% ração leiteira\n+10% custo de aves/ovelhas', minLevel: 1 },
                  { key: 'fibras' as FarmSpecialization, emoji: '🧶', title: 'FIBRAS', desc: 'Foco em ovelhas e lhamas', bonuses: '+20% produção de lã\n-10% ração de ovelha/lhama\n+10% custo de outros animais', minLevel: 1 },
                  { key: 'avicultura' as FarmSpecialization, emoji: '🥚', title: 'AVICULTURA', desc: 'Foco em galinhas, patos e gansos', bonuses: '+20% produção de ovos\n-10% ração de aves\n+10% custo de outros animais', minLevel: 1 },
                  { key: 'diversificada' as FarmSpecialization, emoji: '🌿', title: 'DIVERSIFICADA', desc: 'Sem bônus nem penalidades', bonuses: 'Jogo no modo padrão\nSem modificadores especiais\nLiberdade total de escolha', minLevel: 1 },
                  { key: 'organica' as FarmSpecialization, emoji: '🌱', title: 'ORGÂNICA', desc: 'Foco em minhocas e caracóis (Nv5+)', bonuses: '+20% produção de húmus/muco\nMinhoca e caracol nunca morrem\nEspecial: animais da terra', minLevel: 5 },
                  { key: 'exotica' as FarmSpecialization, emoji: '🦎', title: 'EXÓTICA', desc: 'Foco em animais raros (Nv8+)', bonuses: '+25% preços de couro/carne rara\nJacaré sem incidentes\nCouro de avestruz garantido na morte', minLevel: 8 },
                ].filter(opt => farmLevel >= opt.minLevel).map(opt => (
                  <button
                    key={String(opt.key)}
                    onClick={() => {
                      setSpecialization(opt.key);
                      setShowSpecializationModal(false);
                      addLog(`🌟 Você escolheu a especialização ${opt.title}!`, 'success');
                      addNotification(`🌟 Especialização ${opt.title} ativa! Seus bônus estão aplicados.`, 'event');
                      triggerAudioResult(() => sfx.playSound('levelup'));
                    }}
                    className="bg-white border-4 border-emerald-200 hover:border-emerald-500 rounded-2xl p-3 text-left cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="font-display font-black text-sm text-emerald-800 uppercase">{opt.title}</div>
                    <div className="text-xs text-stone-500 font-mono mb-1">{opt.desc}</div>
                    <pre className="text-[9px] text-stone-400 font-mono whitespace-pre-line leading-relaxed">{opt.bonuses}</pre>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏆 MODAL RANKING DE ANIMAIS */}
      <AnimatePresence>
        {showRankingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRankingModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[120] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-[#fbbf24] rounded-[36px] max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              <div className="bg-gradient-to-r from-[#78350f] to-[#92400e] p-5 text-center shrink-0">
                <div className="text-4xl mb-1">🏆</div>
                <h3 className="text-[#fef3c7] text-xl font-display font-black uppercase tracking-wider">Ranking de Animais</h3>
                <p className="text-[#fcd57e] text-[11px] font-mono mt-0.5">Por produção semanal</p>
                <button
                  onClick={() => setShowRankingModal(false)}
                  className="absolute top-4 right-4 text-[#fcd57e] hover:text-white bg-[#78350f] hover:bg-[#92400e] border-2 border-[#fbbf24] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-lg font-bold"
                >✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-2" style={{ scrollbarWidth: 'thin' }}>
                {animals.length === 0 ? (
                  <p className="text-center text-stone-500 font-mono text-sm py-8">Nenhum animal na fazenda ainda.</p>
                ) : (
                  [...animals]
                    .sort((a, b) => (b.weeklyProduction ?? 0) - (a.weeklyProduction ?? 0))
                    .map((animal, idx) => {
                      const medals = ['🏆', '🥈', '🥉'];
                      const medal = idx < 3 ? medals[idx] : `${idx + 1}º`;
                      const typeEmoji = animal.type === 'vaca' ? '🐄' : animal.type === 'ovelha' ? '🐑' : animal.type === 'boi' ? '🐂' : animal.type === 'galinha' ? '🐔' : animal.type === 'cabra' ? '🐐' : animal.type === 'lhama' ? '🦙' : animal.type === 'pato' ? '🦆' : animal.type === 'ganso' ? '🦢' : animal.type === 'bufalo' ? '🐃' : animal.type === 'pavao' ? '🦚' : animal.type === 'codorna' ? '🐦' : animal.type === 'alpaca' ? '🦙' : animal.type === 'minhoca' ? '🪱' : animal.type === 'caracol' ? '🐌' : animal.type === 'coelho_angora' ? '🐰' : animal.type === 'bicho_seda' ? '🐛' : animal.type === 'ra' ? '🐸' : animal.type === 'avestruz' ? '🦤' : animal.type === 'jacare' ? '🐊' : '🐾';
                      return (
                        <div key={animal.id} className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${idx === 0 ? 'bg-amber-50 border-amber-400' : idx === 1 ? 'bg-slate-50 border-slate-300' : idx === 2 ? 'bg-orange-50 border-orange-300' : 'bg-white border-stone-200'}`}>
                          <span className="text-lg font-black w-8 text-center shrink-0">{medal}</span>
                          <span className="text-2xl shrink-0">{typeEmoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-display font-black text-[#78350f] text-sm truncate">{animal.name}</div>
                            <div className="text-[10px] font-mono text-stone-500 capitalize">{animal.type}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-mono font-black text-emerald-700 text-sm">{animal.weeklyProduction ?? 0} prod.</div>
                            {animal.isCampiao && <div className="text-[9px] font-black text-amber-600">⭐ Campeão</div>}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🤝 MODAL DE CRUZAMENTO (Layer 2) */}
      <AnimatePresence>
        {cruzarModal && (() => {
          const cfg = REPRODUCAO_CONFIG[cruzarModal.type];
          const candidates = animals.filter(a => a.type === cruzarModal.type && a.id !== cruzarModal.id && a.isAdult !== false && !reproducaoAtiva.some(r => r.animalId1 === a.id || r.animalId2 === a.id));
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
              onClick={() => setCruzarModal(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                className="bg-[#fef3c7] border-4 border-[#fbbf24] rounded-3xl p-6 max-w-sm w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="font-display font-black text-xl text-[#78350f] uppercase mb-2 flex items-center gap-2">🤝 Reprodução Controlada</h2>
                <p className="text-[11px] text-stone-600 font-mono mb-3">Gestação: {cfg?.gestacao ?? '?'} dias. Selecione o parceiro para cruzar.</p>
                {candidates.length === 0 ? (
                  <p className="text-[11px] text-red-600 font-mono">Nenhum parceiro disponível! Compre outro {cruzarModal.type} adulto.</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {candidates.map(partner => (
                      <button key={partner.id} type="button"
                        onClick={() => {
                          setReproducaoAtiva(prev => [...prev, {
                            animalId1: cruzarModal.animalId,
                            animalId2: partner.id,
                            type: cruzarModal.type,
                            gestacaoEnd: currentDay + (cfg?.gestacao ?? 10),
                          }]);
                          addLog(`🤝 Iniciada gestação entre dois ${cruzarModal.type}s! Filhote esperado em ${cfg?.gestacao ?? 10} dias.`, 'success');
                          addNotification(`🤝 Gestação iniciada! Filhote de ${cruzarModal.type} em ${cfg?.gestacao ?? 10} dias.`, 'success');
                          setCruzarModal(null);
                        }}
                        className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-black text-xs uppercase px-4 py-2 rounded-xl border-b-2 border-fuchsia-800 transition-all cursor-pointer"
                      >
                        {partner.name} (😊 {Math.floor(partner.happiness)}%)
                      </button>
                    ))}
                  </div>
                )}
                <button type="button" onClick={() => setCruzarModal(null)} className="mt-3 w-full bg-stone-300 hover:bg-stone-400 text-stone-800 font-black text-xs uppercase px-4 py-2 rounded-xl border-b-2 border-stone-500 transition-all cursor-pointer">Cancelar</button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* 🎪 MODAL RESULTADO DA FEIRA */}
      <AnimatePresence>
        {showFairResultModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFairResultModal(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[199] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fffbeb] border-8 border-amber-600 rounded-[36px] max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-600 to-yellow-700 p-5 text-center">
                <div className="text-5xl mb-2">🎪</div>
                <h3 className="text-white text-xl font-display font-black uppercase">Resultado da Feira!</h3>
                <p className="text-amber-200 text-xs font-mono mt-1">Dia {showFairResultModal.day}</p>
              </div>
              <div className="p-6 text-center">
                <div className="text-4xl font-black text-amber-700 mb-2">+{showFairResultModal.earned} 💰</div>
                <div className="text-stone-600 font-mono text-sm mb-1">Categoria: {showFairResultModal.category}</div>
                <div className="text-stone-500 font-mono text-xs mb-4">{showFairResultModal.winner}</div>
                <button
                  onClick={() => setShowFairResultModal(null)}
                  className="bg-amber-500 hover:bg-amber-400 text-white border-b-4 border-amber-700 px-8 py-3 rounded-2xl font-display font-black uppercase text-sm cursor-pointer transition-all hover:scale-105"
                >
                  Fechar 🎉
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📊 ALL-TIME STATS / RECORDES MODAL */}
      {showAllTimeStats && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAllTimeStats(false)}>
          <div className="bg-[#064e3b] border-4 border-[#fbbf24] rounded-[32px] p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-display font-black text-[#fef3c7] text-xl uppercase text-center mb-4">📊 Recordes da Fazenda Aurora</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">💰 Total Faturado</div>
                <div className="text-lg font-black font-mono text-[#fef3c7]">{stats.totalEarned}</div>
              </div>
              <div className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">🌟 Melhor Dia</div>
                <div className="text-lg font-black font-mono text-[#fef3c7]">{allTimeStats.bestDay}</div>
              </div>
              <div className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">📦 Itens Coletados</div>
                <div className="text-lg font-black font-mono text-[#fef3c7]">{stats.totalCollected}</div>
              </div>
              <div className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">🌽 Animais Alimentados</div>
                <div className="text-lg font-black font-mono text-[#fef3c7]">{stats.totalFed}</div>
              </div>
              <div className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">🥛 Leite Produzido</div>
                <div className="text-lg font-black font-mono text-[#fef3c7]">{stats.totalMilk ?? 0}</div>
              </div>
              <div className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">🧶 Lã Coletada</div>
                <div className="text-lg font-black font-mono text-[#fef3c7]">{stats.totalWool ?? 0}</div>
              </div>
              <div className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">🥚 Ovos Coletados</div>
                <div className="text-lg font-black font-mono text-[#fef3c7]">{stats.totalEggs ?? 0}</div>
              </div>
              <div className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">🧀 Queijos Fabricados</div>
                <div className="text-lg font-black font-mono text-[#fef3c7]">{stats.totalCheese ?? 0}</div>
              </div>
              <div className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">🐂 Bois Vendidos</div>
                <div className="text-lg font-black font-mono text-[#fef3c7]">{stats.totalOxSold ?? 0}</div>
              </div>
              <div className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">📅 Dias Jogados</div>
                <div className="text-lg font-black font-mono text-[#fef3c7]">{currentDay}</div>
              </div>
              <div className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">🧣 Cachecóis Tecidos</div>
                <div className="text-lg font-black font-mono text-[#fef3c7]">{stats.totalScarf ?? 0}</div>
              </div>
              <div className="bg-[#065f46] border-2 border-[#fbbf24] rounded-2xl p-3 text-center">
                <div className="text-[10px] font-mono text-[#fbbf24] uppercase font-black mb-1">🥣 Maioneses Feitas</div>
                <div className="text-lg font-black font-mono text-[#fef3c7]">{stats.totalMayo ?? 0}</div>
              </div>
            </div>
            <button onClick={() => setShowAllTimeStats(false)} className="mt-4 w-full bg-[#78350f] text-[#fef3c7] font-black uppercase py-2 rounded-xl border-2 border-[#fbbf24] hover:bg-[#92400e] transition-colors cursor-pointer">Fechar</button>
          </div>
        </div>
      )}

    </div>
  );
}
