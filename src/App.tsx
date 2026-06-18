/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import SplashScreen from './components/SplashScreen';
import { useAnimals } from './hooks/useAnimals';
import { useInventory } from './hooks/useInventory';
import { useFairs } from './hooks/useFairs';
import { useEconomy } from './hooks/useEconomy';
import { useFarm, getFarmTitle, getLevelUpDetails, getXpForLevel } from './hooks/useFarm';
import { useMissions } from './hooks/useMissions';
import { useWorkers } from './hooks/useWorkers';
import { ACHIEVEMENTS_LIST } from './data/achievements';
import { MERCHANT_SPECIAL_ITEMS } from './data/merchantItems';
import PriceChart from './components/PriceChart';
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
import { Animal, AnimalType, AnimalTrait, FarmStats, LogMessage, Contract, FarmSpecialization, FairResult, LandLot, BiomeType } from './types';
import { getRandomName, getUniqueOxName } from './names';
import { sfx } from './utils/audio';
import SeasonalParticles from './components/SeasonalParticles';
import { ContractsModal, PendingContractModal } from './components/ContractsModal';
import { AnimalCard, AnimalListRow } from './components/AnimalCard';
import { MissionsModal } from './components/MissionsModal';
import WorkersModal from './components/WorkersModal';
import TutorialModal from './components/TutorialModal';
import MelhoriasModal from './components/MelhoriasModal';
import QueijariaModal from './components/QueijariaModal';
import AutomationModal from './components/AutomationModal';
import MarketModal from './components/MarketModal';
import AchievementsModal from './components/AchievementsModal';
import LevelUpModal from './components/LevelUpModal';
import WeeklyReportModal from './components/WeeklyReportModal';
import StatsModal from './components/StatsModal';
import FinancasModal from './components/FinancasModal';
import SellAllModal from './components/SellAllModal';
import { ReproducoesModal, RankingModal, FairResultModal, AllTimeStatsModal, CruzamentoModal } from './components/SmallModals';
import GameSidebar from './components/GameSidebar';
import AnimalGrid from './components/AnimalGrid';


interface FloatingText {
  id: string;
  emoji: string;
  text: string;
  x: number;
  y: number;
  // BUG 13 FIX: targetX pré-calculado na criação para evitar Math.random() no JSX durante re-render
  targetX: number;
}




export default function App() {
  const hasSave = !!localStorage.getItem('aurora_farm_save');
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  if (!gameStarted) {
    return <SplashScreen onStart={() => setGameStarted(true)} hasSave={hasSave} />;
  }

  return <GameApp />;
}

function GameApp() {
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

  // --- DEBUG MODE ---
  const [debugMode, setDebugMode] = useState<boolean>(false);

  // --- FEATURE 1: Animal List Filters ---
  const [animalFilter, setAnimalFilter] = useState<string>('all');
  const [animalSort, setAnimalSort] = useState<'happiness'|'production'|'age'|'name'|'ready'>('name');
  const [animalSortDir, setAnimalSortDir] = useState<'asc'|'desc'>('asc');
  const [animalViewMode, setAnimalViewMode] = useState<'card'|'list'>('card');

  // --- FEATURE 2: Worker NPCs ---
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

  const [lastTheftDay, setLastTheftDay] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).lastTheftDay ?? 0; } catch(e) {} return 0;
  });
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
  const [pendingContractOffer, setPendingContractOffer] = useState<import('./types').Contract | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'title' | 'game'>('splash');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Finanças tab
  interface FinancialEntry {
    id: string;
    day: number;
    type: 'income' | 'expense';
    category: 'venda' | 'compra' | 'custo_diario' | 'trabalhador' | 'imposto' | 'evento' | 'emprestimo' | 'outro';
    description: string;
    amount: number;
  }
  const [financialLog, setFinancialLog] = useState<FinancialEntry[]>(() => {
    try {
      const saved = localStorage.getItem('aurora_farm_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.financialLog)) return parsed.financialLog.slice(0, 200);
      }
    } catch(e) {}
    return [];
  });
  const [showFinancasModal, setShowFinancasModal] = useState<boolean>(false);

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
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);
  const [showEventsPanel, setShowEventsPanel] = useState<boolean>(true);

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
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // --- SISTEMA DE EMPRÉSTIMO ---
  const [loanActive, setLoanActive] = useState<boolean>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).loanActive ?? false; } catch(e) {} return false;
  });
  const [loanAmount, setLoanAmount] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).loanAmount ?? 0; } catch(e) {} return 0;
  });
  const [loanInterestRate, setLoanInterestRate] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).loanInterestRate ?? 0.1; } catch(e) {} return 0.1;
  });
  const [loanWeeksLeft, setLoanWeeksLeft] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).loanWeeksLeft ?? 0; } catch(e) {} return 0;
  });
  const [loanDaysUntilInterest, setLoanDaysUntilInterest] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).loanDaysUntilInterest ?? 7; } catch(e) {} return 7;
  });

  // --- SEGUROS EXTRAS ---
  const [insuranceTheft, setInsuranceTheft] = useState<{ active: boolean; daysLeft: number }>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).insuranceTheft ?? { active: false, daysLeft: 0 }; } catch(e) {} return { active: false, daysLeft: 0 };
  });
  const [insuranceClimate, setInsuranceClimate] = useState<{ active: boolean; daysLeft: number }>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).insuranceClimate ?? { active: false, daysLeft: 0 }; } catch(e) {} return { active: false, daysLeft: 0 };
  });

  // --- OFICINA DE AUTOMAÇÃO ---
  const [milkerLevel, setMilkerLevel] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).milkerLevel ?? 1; } catch(e) {} return 1;
  });
  const [shearerLevel, setShearerLevel] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).shearerLevel ?? 1; } catch(e) {} return 1;
  });
  const [feederLevel, setFeederLevel] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).feederLevel ?? 1; } catch(e) {} return 1;
  });

  // --- EFEITOS DO MERCADOR EXTRAS ---
  const [fertilityBoostDays, setFertilityBoostDays] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).fertilityBoostDays ?? 0; } catch(e) {} return 0;
  });
  const [premiumPricesDays, setPremiumPricesDays] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).premiumPricesDays ?? 0; } catch(e) {} return 0;
  });
  const [productionBoostDays, setProductionBoostDays] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).productionBoostDays ?? 0; } catch(e) {} return 0;
  });
  const [antiPestDays, setAntiPestDays] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).antiPestDays ?? 0; } catch(e) {} return 0;
  });
  const [suplementoMineralDays, setSuplementoMineralDays] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).suplementoMineralDays ?? 0; } catch(e) {} return 0;
  });
  const [salMineralDays, setSalMineralDays] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).salMineralDays ?? 0; } catch(e) {} return 0;
  });
  const [seloOrganicodays, setSeloOrganicoDays] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).seloOrganicodays ?? 0; } catch(e) {} return 0;
  });
  const [silagemDays, setSilagemDays] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).silagemDays ?? 0; } catch(e) {} return 0;
  });
  const [hasBalanca, setHasBalanca] = useState<boolean>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).hasBalanca ?? false; } catch(e) {} return false;
  });
  const [hasCisterna, setHasCisterna] = useState<boolean>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).hasCisterna ?? false; } catch(e) {} return false;
  });
  const [blockNextStorm, setBlockNextStorm] = useState<boolean>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).blockNextStorm ?? false; } catch(e) {} return false;
  });
  const [blockNextDrought, setBlockNextDrought] = useState<boolean>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).blockNextDrought ?? false; } catch(e) {} return false;
  });
  const [isencaoMultaCount, setIsencaoMultaCount] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).isencaoMultaCount ?? 0; } catch(e) {} return 0;
  });

  // --- EVENTOS DO MUNDO ---
  const [worldEvent, setWorldEvent] = useState<{ id: string; title: string; desc: string; daysLeft: number; priceMult: number; items: string[] } | null>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).worldEvent ?? null; } catch(e) {} return null;
  });

  // --- FUNCIONALIDADE 3: Missões ---
  interface Mission {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'epic';
    goal: number;
    current: number;
    reward: number;
    expiresOnDay: number;
    completed: boolean;
    claimed: boolean;
    missionKey: 'sell_milk' | 'sell_any' | 'happy_animals' | 'earn_gold' | 'feed_animals' | 'collect_items' | 'collect_silk' | 'sell_exotic' | 'organic_day' | 'sell_cheese' | 'have_animals' | 'sell_wool';
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
  const [vetVisitActive, setVetVisitActive] = useState<boolean>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).vetVisitActive ?? false; } catch(e) {} return false;
  });
  const [daysSinceVetVisit, setDaysSinceVetVisit] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).daysSinceVetVisit ?? 0; } catch(e) {} return 0;
  });
  const [nextVetVisitDay, setNextVetVisitDay] = useState<number>(() => {
    try { const s = localStorage.getItem('aurora_farm_save'); if (s) return JSON.parse(s).nextVetVisitDay ?? 5; } catch(e) {} return 5;
  });

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
    hasLaboratorio,
    setHasLaboratorio,
    hasPastagem,
    setHasPastagem,
    hasExportCenter,
    setHasExportCenter,
    hasAcademia,
    setHasAcademia,
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

    // 11. 💎 Barão do Agro: 10.000 moedas
    if (currentGold >= 10000) {
      checkAndUnlockAchievement('rich_rich');
    }

    // 12. 🎉 Centenário: Dia 100
    if (currentDay >= 100) {
      checkAndUnlockAchievement('day_100');
    }

    // 13. 🌟 Veterano: Dia 200
    if (currentDay >= 200) {
      checkAndUnlockAchievement('day_200');
    }

    // 14. 😊 Fazenda Feliz: 10+ animais todos com happiness > 90
    if (currentAnimals.length >= 10 && currentAnimals.every(a => (a.happiness ?? 0) >= 90)) {
      checkAndUnlockAchievement('happy_herd');
    }

    // 15. 🏦 Empreendedor: primeiro empréstimo
    if (loanActive) {
      checkAndUnlockAchievement('loan_taken');
    }

    // 16. ⚙️ Engenheiro Rural: máquina nível máximo
    if (milkerLevel >= 3 || shearerLevel >= 3 || feederLevel >= 3) {
      checkAndUnlockAchievement('machine_maxed');
    }

    // 17. 🛡️ Segurado Total: todos os 3 seguros ativos
    if (insurance.active && insuranceTheft.active && insuranceClimate.active) {
      checkAndUnlockAchievement('all_insurance');
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

  const addFinancialEntry = (entry: Omit<FinancialEntry, 'id'>) => {
    setFinancialLog(prev => [{ ...entry, id: `${entry.day}-${Date.now()}-${Math.random()}` }, ...prev].slice(0, 200));
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

  const handleClaimMission = (m: Mission) => {
    setMissions(prev => prev.map(mis => mis.id === m.id ? { ...mis, claimed: true } : mis));
    setGold(prev => prev + m.reward);
    addLog(`🎯 Missão "${m.title}" concluída! +${m.reward} moedas resgatadas!`, 'success');
    spawnFeedback('🎯', `+${m.reward} 💰`, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 } as any);
  };

  // --- ACTIONS ---

  // Export save as JSON file
  const exportSave = () => {
    const raw = localStorage.getItem('aurora_farm_save');
    if (!raw) { addLog('❌ Nenhum save encontrado para exportar.', 'error'); return; }
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fazenda-aurora-dia${currentDay}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('💾 Save exportado com sucesso!', 'success');
  };

  // Import save from JSON file
  const importSave = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string;
          JSON.parse(text); // valida JSON antes de salvar
          localStorage.setItem('aurora_farm_save', text);
          addLog('✅ Save importado! Recarregando...', 'success');
          setTimeout(() => window.location.reload(), 1000);
        } catch {
          addLog('❌ Arquivo inválido. Use um save exportado da Fazenda Aurora.', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

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
    if (type === 'racaoBovina') return 4;
    if (type === 'racaoOvinos') return 3;
    if (type === 'racaoAves') return 3;
    if (type === 'racaoAquatica') return 4;
    if (type === 'racaoCoelho') return 3;
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
    if (animal.age === undefined || !animal.maxAge) return { phase: 'adulto', label: 'Adulto', emoji: '⭐', prodMult: 1.0, color: 'bg-blue-100 border-blue-300 text-blue-800' };
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
    // --- PREÇOS BASE BALANCEADOS ---
    // Grupo A: early game mais tenso — leite mais lucrativo, ovo mais barato
    if (itemType === 'milk') {
      return farmLevel >= 2 ? 8 : 7;  // era 6/5 — compensa custo de ração aumentado
    }
    if (itemType === 'wool') {
      return farmLevel >= 3 ? 15 : 12;
    }
    if (itemType === 'cheese') {
      return 22;  // pequeno aumento
    }
    // Grupo C: mais valor para processados mid-game
    if (itemType === 'queijoCoalho') {
      return 35;  // era 28
    }
    if (itemType === 'queijoMucarela') {
      return 40;  // era 28 — diferencia os tipos
    }
    if (itemType === 'queijoBrie') {
      return 45;  // era 65 — acessível cedo demais
    }
    if (itemType === 'scarf') {
      return 30;
    }
    // Grupo A: ovo mais barato para diminuir ROI absurdo da galinha
    if (itemType === 'egg') {
      return farmLevel >= 5 ? 4 : 3;  // era 5/4
    }
    if (itemType === 'mayo') {
      return 14;  // era 16 — proporcional ao ovo
    }
    if (itemType === 'goat_milk') return farmLevel >= 4 ? 42 : 38;
    if (itemType === 'llama_wool') return 45;
    if (itemType === 'duck_egg') return farmLevel >= 5 ? 22 : 18;
    if (itemType === 'goose_egg') return 50;
    if (itemType === 'buffalo_milk') return farmLevel >= 6 ? 62 : 55;
    if (itemType === 'buffalo_mozzarella') return 120;
    if (itemType === 'feather') return 15;
    if (itemType === 'peacock_feather') return 80;
    if (itemType === 'butter') return 55;   // era 45 — Grupo C
    if (itemType === 'yogurt') return 40;   // era 35 — Grupo C
    if (itemType === 'fertile_egg') return 36;
    if (itemType === 'quail_egg') return farmLevel >= 5 ? 26 : 22;
    if (itemType === 'alpaca_wool') return farmLevel >= 6 ? 75 : 65;
    if (itemType === 'humus') return 15;    // era 20 — Grupo B (sem custo ração)
    if (itemType === 'muco') return 35;     // era 120 — Grupo B (OP sem ração)
    if (itemType === 'angora_wool') return 90;
    if (itemType === 'seda_bruta') return 100;
    if (itemType === 'coxa_ra') return 110;
    if (itemType === 'carne_avestruz') return 220;
    if (itemType === 'pena_grande') return 90;
    if (itemType === 'couro_avestruz') return 260;  // era 300 — Grupo C
    if (itemType === 'carne_jacare') return 300;
    if (itemType === 'couro_jacare') return 500;
    if (itemType === 'queijo_cabra') return 90;
    if (itemType === 'iogurte_cabra') return 70;    // era 55 — Grupo C
    if (itemType === 'leite_condensado') return 100;
    if (itemType === 'tapete_lhama') return 110;
    if (itemType === 'cachecol_angora') return 120; // era 160 — Grupo B
    if (itemType === 'tecido_alpaca') return 180;
    if (itemType === 'fio_seda') return 180;        // era 200 — Grupo C
    if (itemType === 'manta_premium') return 420;
    if (itemType === 'pate_pato') return 95;
    if (itemType === 'ovo_defumado') return 120;
    if (itemType === 'conserva_codorna') return 80;
    if (itemType === 'creme_cosmetico') return 220;
    if (itemType === 'sabonete_natural') return 140;
    if (itemType === 'almofada_penas') return 170;
    if (itemType === 'colete_couro') return 550;
    if (itemType === 'bolsa_exotica') return 600;   // era 800 — Grupo B
    if (itemType === 'enfeite_pavao') return 200;
    if ((itemType as string) === 'peixe') return 45;
    if ((itemType as string) === 'mel') return 80;
    if ((itemType as string) === 'cogumelo') return 35;
    if ((itemType as string) === 'hidromel') return 180;
    if ((itemType as string) === 'risoto_cogumelo') return 120;
    if ((itemType as string) === 'conserva_peixe') return 95;
    if ((itemType as string) === 'mel_envasado') return 200;
    if ((itemType as string) === 'sopa_cogumelo') return 80;
    if ((itemType as string) === 'queijo_parmesao') return 200;
    if ((itemType as string) === 'queijo_serra') return 280;
    if ((itemType as string) === 'kit_gourmet') return 900;
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
    // Evento mundial ativo
    const worldEventBonus = worldEvent && worldEvent.items.includes(itemType) ? worldEvent.priceMult : 1.0;
    // Selo de qualidade premium do mercador
    const premiumPricesBonus = premiumPricesDays > 0 ? 1.25 : 1.0;
    // Selo Orgânico (+20%) e Balança de Precisão (+5%)
    const seloOrganicoBonus = seloOrganicodays > 0 ? 1.20 : 1.0;
    const balancaBonus = hasBalanca ? 1.05 : 1.0;
    let finalPrice = base * offerMult * seasonMult * weatherMult * processedLinkMult * rarityMult * marketBonus * worldEventBonus * premiumPricesBonus * seloOrganicoBonus * balancaBonus;
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
    // Suplemento Mineral: +20% para produtos lácteos
    const milkItems = ['milk', 'goat_milk', 'buffalo_milk', 'cheese', 'queijoCoalho', 'queijoMucarela', 'queijoBrie', 'queijo_cabra', 'buffalo_mozzarella', 'iogurte_cabra', 'leite_condensado', 'butter', 'yogurt'] as string[];
    if (suplementoMineralDays > 0 && milkItems.includes(itemType as string)) finalPrice *= 1.2;
    // Centro de Exportação: +20% em todos os produtos
    if (hasExportCenter) finalPrice = Math.round(finalPrice * 1.20);
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
    craftQueijoParmesao,
    craftQueijoSerra,
    craftKitGourmet,
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
    worldEvent,
    checkAndUnlockAchievement,
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
    sellAnimal,
    retireAnimal,
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
    onFilhoteAdded: () => {
      setAnimalFilter('all');
    },
  });

  // --- useWorkers hook ---
  const {
    workers,
    setWorkers,
    hireWorker,
    fireWorker,
    workerTypes,
  } = useWorkers({ currentDay, addLog });

  // --- useMissions hook ---
  const { generateDailyMissions, generateWeeklyMissions, generateEpicMissions } = useMissions({ animals, farmLevel, inventory });

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
  }, [stats, gold, farmLevel, animals, currentScreen, totalQueijosFabricados, queijosFabricadosTipos, currentDay, loanActive, milkerLevel, shearerLevel, feederLevel, insurance, insuranceTheft, insuranceClimate]);

  // --- FUNCIONALIDADE 1: Auto-avanço useEffect ---
  // isGameOver derivado antecipado para uso no useEffect de auto-avanço (galinha = 60 moedas base)
  // BUG FIX: usa 60 como referência correta (preço base da galinha sem especialização/nível)
  const isGameOverForAutoAdvance = (animals.length === 0 && gold < 60) || debt > 1000;

  useEffect(() => {
    if (!autoAdvance || isPaused || isGameOverForAutoAdvance || isSleeping) return;
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
  }, [autoAdvance, isPaused, autoSpeed, isGameOverForAutoAdvance, isSleeping, showBuyMenu, showLevelUpModal, showWeeklyReport, showTutorialModal, showAchievementsModal, showAutomationModal, showMarketModal, showSellAllConfirmModal, showQueijariaModal, showMissionsModal, showNotifications, showStatsModal]);

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
      } else if (key === 'p') {
        if (autoAdvance) setIsPaused(prev => !prev);
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
  }, [animals, inventory, currentDay, weather, weeklySales, showBuyMenu, machines, farmLevel, queijosEmMaturacao, merchantActive, daysSinceMerchant, nextMerchantDay, dailyEarning, weeklyStats, autoAdvance, isPaused]);

  // Sync log scrollbar — scroll only inside the logs container, not the whole page
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Persist State Updates Automatically to LocalStorage
  useEffect(() => {
    // Prevent wiping save if loaded empty
    if (animals.length > 0 || currentDay > 1 || gold !== 60) {
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
        vetVisitActive,
        daysSinceVetVisit,
        nextVetVisitDay,
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
        lastTheftDay,
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
        // Médio impacto
        loanActive, loanAmount, loanInterestRate, loanWeeksLeft, loanDaysUntilInterest,
        insuranceTheft, insuranceClimate,
        milkerLevel, shearerLevel, feederLevel,
        fertilityBoostDays, premiumPricesDays, productionBoostDays, antiPestDays,
        worldEvent,
        financialLog,
        suplementoMineralDays, salMineralDays, seloOrganicodays, silagemDays,
        hasBalanca, hasCisterna, blockNextStorm, blockNextDrought, isencaoMultaCount,
      };
      localStorage.setItem('aurora_farm_save', JSON.stringify(saveData));
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);
    }
  }, [gold, currentDay, farmLevel, farmXp, inventory, animals, stats, merchantActive, daysSinceMerchant, nextMerchantDay, logs, weeklyStats, weeklySales, previousPrices, machines, priceHistory, queijosEmMaturacao, maxPrateleiras, totalQueijosFabricados, queijosFabricadosTipos, earningsHistory, allTimeStats, missions, notifications, farmWisdomBonus, contracts, insurance, landLots, wellLevel, solarLevel, irrigationLevel, queijariaNivel, nextDayEvent, activeMarketEvent, hasStable, hasSilo, hasFridge, hasTipBox, productFreshness, specialization, debt, hasTourism, nextFairDay, fairResults, lastEpidemicDay, droughtDaysRemaining, licencaExotica, coelhoReproCount, racaoOrganicaDays, fertilizanteDays, prestigePoints, nextExposicaoDay, nextFeiraProdutosDay, nextFeiraExoticaDay, nextFestivalDay, workers, landBiomes, hasBebedouro, hasCertSanitario, licencaCriadouro, reproducaoAtiva, biomeWeeklyIncome, reproHistory, loanActive, loanAmount, loanInterestRate, loanWeeksLeft, loanDaysUntilInterest, insuranceTheft, insuranceClimate, milkerLevel, shearerLevel, feederLevel, fertilityBoostDays, premiumPricesDays, productionBoostDays, antiPestDays, worldEvent, financialLog]);

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
    let statsCollected = { fedCount: 0 };
    let missingFeeds: string[] = [];

    if (!hasPaidMaintenance || updatedAnimals.length === 0) {
      return { updatedAnimals, nextInv, statsCollected, missingFeeds };
    }

    // C. Alimentador Automático (runs before processarFomeFelicidade so hunger is set before health check)
    if (machinesObj.feederPurchased && machinesObj.feederActive) {
      const noFeedAnimals = ['minhoca', 'caracol', 'bicho_seda'];
      updatedAnimals = updatedAnimals.map(a => {
        if (noFeedAnimals.includes(a.type)) return a;
        if (a.isAdult === false) return a; // filhotes não consomem ração industrial
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

    return { updatedAnimals, nextInv, fedCount: statsCollected.fedCount, missingFeeds };
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

      // Animals that don't eat: skip hunger processing. Sal Mineral e Silagem evitam perda de fome.
      const noHungerTypes = ['minhoca', 'caracol'];
      const skipHunger = noHungerTypes.includes(copy.type) || salMineralDays > 0 || silagemDays > 0;

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
        const ageRatio = (copy.age !== undefined && copy.maxAge) ? copy.age / copy.maxAge : 0.5;
        const basePhaseMult = ageRatio < 0.15 ? 0.6 : ageRatio < 0.50 ? 1.1 : ageRatio < 0.75 ? 1.0 : ageRatio < 0.90 ? 0.7 : 0.4;
        const adjustedPhaseMult = Math.min(1.15, basePhaseMult + (copy.isVeteran ? 0.05 : 0) + (copy.juvenileBonus || 0));
        const lifePhaseBlock = adjustedPhaseMult < 1.0 && Math.random() > adjustedPhaseMult;
        const canProduce = copy.hunger > 25 && copy.happiness > 30 && !sickProductionBlock && !lifePhaseBlock;
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
        const ageRatio = (copy.age !== undefined && copy.maxAge) ? copy.age / copy.maxAge : 0.5;
        const basePhaseMult = ageRatio < 0.15 ? 0.6 : ageRatio < 0.50 ? 1.1 : ageRatio < 0.75 ? 1.0 : ageRatio < 0.90 ? 0.7 : 0.4;
        const adjustedPhaseMult = Math.min(1.15, basePhaseMult + (copy.isVeteran ? 0.05 : 0) + (copy.juvenileBonus || 0));
        const lifePhaseBlock = adjustedPhaseMult < 1.0 && Math.random() > adjustedPhaseMult;
        const canProduce = copy.hunger > 25 && copy.happiness > 30 && !sickProductionBlock && !lifePhaseBlock;
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
            const ageRatioGoat = (copy.age !== undefined && copy.maxAge) ? copy.age / copy.maxAge : 0.5;
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
        const ageRatio = (copy.age !== undefined && copy.maxAge) ? copy.age / copy.maxAge : 0.5;
        const basePhaseMult = ageRatio < 0.15 ? 0.6 : ageRatio < 0.50 ? 1.1 : ageRatio < 0.75 ? 1.0 : ageRatio < 0.90 ? 0.7 : 0.4;
        const adjustedPhaseMult = Math.min(1.15, basePhaseMult + (copy.isVeteran ? 0.05 : 0) + (copy.juvenileBonus || 0));
        const lifePhaseBlock = adjustedPhaseMult < 1.0 && Math.random() > adjustedPhaseMult;
        const canProduce = copy.hunger > 25 && copy.happiness > 30 && !sickProductionBlock && !lifePhaseBlock;
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
        const ageRatio = (copy.age !== undefined && copy.maxAge) ? copy.age / copy.maxAge : 0.5;
        const basePhaseMult = ageRatio < 0.15 ? 0.6 : ageRatio < 0.50 ? 1.1 : ageRatio < 0.75 ? 1.0 : ageRatio < 0.90 ? 0.7 : 0.4;
        const adjustedPhaseMult = Math.min(1.15, basePhaseMult + (copy.isVeteran ? 0.05 : 0) + (copy.juvenileBonus || 0));
        const lifePhaseBlock = adjustedPhaseMult < 1.0 && Math.random() > adjustedPhaseMult;
        const canProduce = copy.hunger > 25 && copy.happiness > 30 && !sickProductionBlock && !lifePhaseBlock;
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
        const ageRatio = (copy.age !== undefined && copy.maxAge) ? copy.age / copy.maxAge : 0.5;
        const basePhaseMult = ageRatio < 0.15 ? 0.6 : ageRatio < 0.50 ? 1.1 : ageRatio < 0.75 ? 1.0 : ageRatio < 0.90 ? 0.7 : 0.4;
        const adjustedPhaseMult = Math.min(1.15, basePhaseMult + (copy.isVeteran ? 0.05 : 0) + (copy.juvenileBonus || 0));
        const lifePhaseBlock = adjustedPhaseMult < 1.0 && Math.random() > adjustedPhaseMult;
        const canProduce = copy.hunger > 25 && copy.happiness > 30 && !sickProductionBlock && !lifePhaseBlock;
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
        if (copy.sickDays >= 7) {
          copy.diedFromIllness = true;
          logs.push({ msg: `💀 ${copy.name} (${copy.type}) não resistiu à doença e morreu após ${copy.sickDays} dias sem tratamento.`, type: 'error' });
        } else if (copy.sickDays === 5) {
          logs.push({ msg: `⚠️ ${copy.name} está crítico! Já são ${copy.sickDays} dias doente — trate urgente antes que morra!`, type: 'error' });
        }
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
      const label = tipo === 'coalho' ? 'Queijo Coalho' : tipo === 'mucarela' ? 'Queijo Muçarela' : tipo === 'buffalo_mozzarella' ? 'Muçarela de Búfala' : tipo === 'yogurt' ? 'Iogurte' : tipo === 'parmesao' ? 'Queijo Parmesão' : tipo === 'serra' ? 'Queijo da Serra' : 'Queijo Brie';
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
    if (contracts.filter(c => c.active).length >= 3) return; // Máx 3 contratos

    // Tiered contract system based on farm level
    const tier = farmLevel >= 15 ? 'premium' : farmLevel >= 10 ? 'avancado' : farmLevel >= 6 ? 'medio' : 'basico';

    const allProducts = [
      { product: 'milk', basePrice: 5, minLevel: 1 },
      { product: 'wool', basePrice: 12, minLevel: 1 },
      { product: 'egg', basePrice: 4, minLevel: 1 },
      { product: 'cheese', basePrice: 20, minLevel: 2 },
      { product: 'goat_milk', basePrice: 38, minLevel: 4 },
      { product: 'buffalo_milk', basePrice: 55, minLevel: 6 },
      { product: 'queijoCoalho', basePrice: 28, minLevel: 3 },
      { product: 'queijoMucarela', basePrice: 28, minLevel: 4 },
      { product: 'queijoBrie', basePrice: 65, minLevel: 5 },
      { product: 'butter', basePrice: 45, minLevel: 3 },
      { product: 'yogurt', basePrice: 35, minLevel: 3 },
      { product: 'duck_egg', basePrice: 18, minLevel: 4 },
      { product: 'quail_egg', basePrice: 22, minLevel: 4 },
      { product: 'feather', basePrice: 15, minLevel: 4 },
      { product: 'angora_wool', basePrice: 90, minLevel: 9 },
      { product: 'alpaca_wool', basePrice: 65, minLevel: 6 },
      { product: 'muco', basePrice: 120, minLevel: 8 },
      { product: 'seda_bruta', basePrice: 100, minLevel: 11 },
    ] as const;

    // Filter by farm level
    const available = allProducts.filter(p => farmLevel >= p.minLevel);
    const chosen = available[Math.floor(Math.random() * available.length)];

    // Tier multipliers for price premium and quantity
    const tierConfig = {
      basico:   { priceMulti: 1.15, qtyMin: 5,  qtyMax: 15, deadlineMin: 5,  deadlineMax: 10, penaltyRate: 0.5 },
      medio:    { priceMulti: 1.20, qtyMin: 10, qtyMax: 25, deadlineMin: 7,  deadlineMax: 14, penaltyRate: 0.4 },
      avancado: { priceMulti: 1.25, qtyMin: 15, qtyMax: 40, deadlineMin: 10, deadlineMax: 20, penaltyRate: 0.35 },
      premium:  { priceMulti: 1.35, qtyMin: 20, qtyMax: 60, deadlineMin: 14, deadlineMax: 30, penaltyRate: 0.3 },
    };
    const cfg = tierConfig[tier];

    const pricePerUnit = Math.round(chosen.basePrice * cfg.priceMulti);
    const quantity = cfg.qtyMin + Math.floor(Math.random() * (cfg.qtyMax - cfg.qtyMin + 1));
    const deadline = nextDayVal + cfg.deadlineMin + Math.floor(Math.random() * (cfg.deadlineMax - cfg.deadlineMin + 1));
    const penalty = Math.round(pricePerUnit * quantity * cfg.penaltyRate);

    const clientNames: Record<string, string[]> = {
      basico: ['Mercadinho do Bairro', 'Feira Local', 'Restaurante Familiar', 'Padaria Aurora'],
      medio: ['Supermercado Bom Preço', 'Buffet São José', 'Hotel Regional', 'Cooperativa Rural'],
      avancado: ['Rede Atacado Nordeste', 'Restaurante 5 Estrelas', 'Distribuidora Premium', 'Laticínios Nacionais'],
      premium: ['Exportadora Internacional', 'Rede de Hotéis Luxo', 'Gourmet Market São Paulo', 'Embaixada Gastronômica'],
    };
    const clients = clientNames[tier];
    const client = clients[Math.floor(Math.random() * clients.length)];

    const newContract: Contract = {
      id: Math.random().toString(36).substring(2, 9),
      product: chosen.product as Contract['product'],
      quantity,
      delivered: 0,
      pricePerUnit,
      deadline,
      penalty,
      active: true,
      client,
      tier,
    };
    setPendingContractOffer(newContract);
    setTimeout(() => addNotification(`📋 ${client} quer oferecer um contrato [${tier.toUpperCase()}]! Verifique a proposta para aceitar ou recusar.`, 'event', nextDayVal), 0);
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
    // Mercador aparece a cada 7 dias fixos. Prestígio 150+ reduz para 5 dias.
    const merchantThreshold = prestigePoints >= 150 ? 5 : 7;
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
      // 30% chance to gift folha_amoreira (only after silk is unlocked at level 10)
      if (farmLevel >= 10 && Math.random() < 0.3) {
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

      // --- SUBFUNÇÃO 2: Processamento de Automatização (Alimentador apenas) ---
      const {
        updatedAnimals: animalsAfterAuto,
        nextInv: invAfterAuto,
        fedCount: feederFedCount,
        missingFeeds
      } = processarAutomatizacao(machines, maintPaid, animals, inventory, weather, logsToAdd);

      // Aplica deduções de ração do alimentador ao inventário
      if (feederFedCount > 0) {
        setInventory(prev => ({ ...prev, ...invAfterAuto }));
        setStats(prev => ({ ...prev, totalFed: prev.totalFed + feederFedCount }));
        logsToAdd.push({
          msg: `🌾 Alimentador Automático: Alimentou ${feederFedCount} animal(is) — consumiu ${feederFedCount} unidade(s) de ração do Armazém. (ouro não deduzido aqui)`,
          type: 'info'
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
      let nextWeather = atualizarClimaEEventos(currentDay, logsToAdd);
      if (nextWeather === 'chuva' && blockNextStorm) {
        nextWeather = 'nublado';
        logsToAdd.push({ msg: '☂️ Cobertura Provisória protegeu a fazenda da tempestade! Clima normalizado.', type: 'success' });
        setBlockNextStorm(false);
      }
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
      const baseXp = 2 + Math.floor(animals.length * 0.5);
      const dailyXp = hasAcademia ? Math.round(baseXp * 1.15) : baseXp;
      const newFarmXp = farmXp + dailyXp;
      setFarmXp(newFarmXp);

      // --- SUBFUNÇÃO 6: Verificação de Nível da Fazenda ---
      // Pós-nível 20: cada 50 XP acumulado vira 1 ponto de prestígio
      if (farmLevel >= 20) {
        const prestigeGained = Math.floor(dailyXp / 10);
        if (prestigeGained > 0) {
          setPrestigePoints(prev => prev + prestigeGained);
          if (debugMode) logsToAdd.push({ msg: `🌌 [DEBUG] +${prestigeGained} Prestígio (nível máximo)`, type: 'system' });
        }
      }
      const { newLevel, levelUpOccurred } = verificarNivelFazenda(nextDayValue, farmLevel, newFarmXp, logsToAdd);
      if (levelUpOccurred) {
        setFarmLevel(newLevel);
        setShowLevelUpModal(newLevel);
        setInsuranceClimate(prev => ({ active: true, daysLeft: (prev.active ? prev.daysLeft : 0) + 3 }));
        logsToAdd.push({ msg: `🌦️ Nível ${newLevel} desbloqueado! Seguro Climático grátis por 3 dias!`, type: 'success' });
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
          if (item.effect === 'balanca_precisao' && hasBalanca) return false;
          if (item.effect === 'cisterna' && hasCisterna) return false;
          return true;
        });
        const shuffled = [...availableMerchItems].sort(() => Math.random() - 0.5);
        setMerchantSpecialItems(shuffled.slice(0, 4).map(i => i.id));
      }

      // --- VETERINÁRIO VISITANTE (níveis 1-9, sem veterinário contratado) ---
      {
        const hasVetWorker = workers.some(w => w.role === 'veterinario');
        if (farmLevel < 10 && !hasVetWorker) {
          const newDaysSinceVet = daysSinceVetVisit + 1;
          if (newDaysSinceVet >= nextVetVisitDay) {
            setVetVisitActive(true);
            setDaysSinceVetVisit(0);
            setNextVetVisitDay(5 + Math.floor(Math.random() * 3));
            logsToAdd.push({ msg: `💉 O Veterinário Visitante chegou! Cure seus animais doentes hoje.`, type: 'event' });
            setTimeout(() => addNotification('💉 Veterinário Visitante chegou! Cure seus animais doentes hoje.', 'event', nextDayValue), 0);
          } else {
            setVetVisitActive(false);
            setDaysSinceVetVisit(newDaysSinceVet);
          }
        } else {
          setVetVisitActive(false);
          setDaysSinceVetVisit(0);
        }
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
        const hasEpic = nextDayMissions.some(m => m.type === 'epic' && !m.completed && m.expiresOnDay > currentDay + 1);
        if (!hasEpic) {
          newMissions.push(...generateEpicMissions(currentDay + 1));
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

      // --- MÁQUINAS: Ordenhadeira e Tosquiadeira — rodam APÓS processarFomeFelicidade ---
      // Isso garante que coletam a produção do DIA ATUAL (hasProducedToday definido hoje),
      // evitando que a coleta manual do dia anterior impeça a máquina de funcionar.
      if (maintPaid) {
        // A. Ordenhadeira Automática
        if (machines.milkerPurchased && machines.milkerActive) {
          let milkCollected = 0;
          let milkedCows = 0;
          updatedAnimalsList = updatedAnimalsList.map(a => {
            if (a.type !== 'vaca' || a.isAdult === false || !a.hasProducedToday) return a;
            let efficiency = (a.happiness / 100) * (1 - (Math.max(0, 100 - a.hunger) / 200));
            efficiency = Math.max(0.3, Math.min(1.2, efficiency));
            let totalLeite = 1 + (efficiency > 0.8 && Math.random() < 0.3 ? 1 : 0);
            if (a.isBestFriend) totalLeite += 1;
            if (nextWeather === 'sol') totalLeite += 1;
            if (nextWeather === 'chuva') totalLeite = Math.max(1, Math.round(totalLeite * 0.8));
            if (a.trait === 'trabalhadora') totalLeite = Math.max(1, Math.round(totalLeite * 1.15));
            else if (a.trait === 'preguicosa') totalLeite = Math.max(1, Math.round(totalLeite * 0.85));
            // Nível da ordenhadeira: +20% por nível adicional (Nv2=+20%, Nv3=+40%)
            const milkerBonus = 1 + (milkerLevel - 1) * 0.2;
            // Poção de fertilidade
            const fertilityMult = fertilityBoostDays > 0 ? 2 : 1;
            // Manual de produção
            const productionMult = productionBoostDays > 0 ? 1.15 : 1;
            totalLeite = Math.round(totalLeite * milkerBonus * fertilityMult * productionMult);
            milkCollected += totalLeite;
            milkedCows++;
            return { ...a, hasProducedToday: false };
          });
          if (milkCollected > 0) {
            setInventory(prev => ({ ...prev, milk: prev.milk + milkCollected }));
            setStats(prev => ({ ...prev, totalCollected: prev.totalCollected + milkCollected, totalMilk: (prev.totalMilk || 0) + milkCollected }));
            setWeeklyStats(prev => ({ ...prev, milk: prev.milk + milkCollected }));
            logsToAdd.push({ msg: `🏭 Ordenhadeira Automática: Coletou +${milkCollected} Leite(s) de ${milkedCows} vacas!`, type: 'success' });
          }
        }

        // B. Tosquiadeira Elétrica
        if (machines.shearerPurchased && machines.shearerActive) {
          let woolCollected = 0;
          let shearedSheep = 0;
          updatedAnimalsList = updatedAnimalsList.map(a => {
            if (a.type !== 'ovelha' || a.isAdult === false || !a.woolReady) return a;
            let quality = (a.happiness / 100) * (a.hunger / 100);
            let woolBonus = quality > 0.7 ? 2 : 1;
            if (a.trait === 'trabalhadora') woolBonus = Math.max(1, Math.round(woolBonus * 1.15));
            else if (a.trait === 'preguicosa') woolBonus = Math.max(1, Math.round(woolBonus * 0.85));
            woolCollected += woolBonus;
            shearedSheep++;
            return { ...a, woolReady: false, daysSinceLastWool: 0 };
          });
          if (woolCollected > 0) {
            setInventory(prev => ({ ...prev, wool: prev.wool + woolCollected }));
            setStats(prev => ({ ...prev, totalCollected: prev.totalCollected + 1, totalWool: (prev.totalWool || 0) + woolCollected }));
            setWeeklyStats(prev => ({ ...prev, wool: prev.wool + woolCollected }));
            logsToAdd.push({ msg: `🏭 Tosquiadeira Elétrica: Coletou +${woolCollected} Lã(s) de ${shearedSheep} ovelhas!`, type: 'success' });
          }
        }
      }

      // --- DEBUFF DE ESPECIALIZAÇÃO: penalidade por diversidade sem peões especializados ---
      // Ativo apenas quando há 3+ categorias de animais adultos na fazenda.
      // Para cada categoria sem o peão adequado: -4 felicidade/dia nos animais daquela categoria.
      {
        const catDef: Record<string, string[]> = {
          bovinos:  ['vaca', 'boi', 'bufalo'],
          fibras:   ['ovelha', 'lhama', 'alpaca', 'coelho_angora', 'cabra'],
          aves:     ['galinha', 'codorna', 'pato', 'ganso', 'pavao'],
          exoticos: ['ra', 'avestruz', 'jacare', 'bicho_seda', 'caracol', 'minhoca'],
        };
        // Peões que cobrem cada categoria (veterinario cobre tudo)
        const catWorkers: Record<string, string[]> = {
          bovinos:  ['ordenhador', 'tratador', 'veterinario'],
          fibras:   ['tosquiador', 'tratador', 'veterinario'],
          aves:     ['avicultor', 'tratador', 'veterinario'],
          exoticos: ['tratador_exotico', 'veterinario'],
        };
        const workerRoles = new Set(workers.map(w => w.role));
        // Descobre quais categorias têm pelo menos 1 animal adulto
        const activeCategories = Object.entries(catDef).filter(([, types]) =>
          updatedAnimalsList.some(a => types.includes(a.type) && a.isAdult !== false)
        );
        if (activeCategories.length >= 3) {
          // Para cada categoria ativa sem especialista, aplica penalidade nos animais
          const penaltyCategories: string[] = [];
          activeCategories.forEach(([cat, types]) => {
            const hasSpecialist = catWorkers[cat].some(role => workerRoles.has(role));
            if (!hasSpecialist) {
              penaltyCategories.push(cat);
              updatedAnimalsList = updatedAnimalsList.map(a => {
                if (!types.includes(a.type) || a.isAdult === false) return a;
                return { ...a, happiness: Math.max(0, a.happiness - 4) };
              });
            }
          });
          if (penaltyCategories.length > 0) {
            logsToAdd.push({
              msg: `⚠️ Fazenda diversificada sem especialistas! Animais em stress: ${penaltyCategories.join(', ')} (-4 felicidade/dia). Contrate peões especializados!`,
              type: 'error'
            });
          }
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
      if (currentDay % 14 === 0) {
        const weekEarnings = weeklyStats.earnings;
        // Imposto progressivo: 5% base + 1% extra por cada 500 moedas acumuladas acima de 500
        const wealthBrackets = Math.max(0, Math.floor((gold - 500) / 500));
        const taxRate = 0.05 + wealthBrackets * 0.01;
        let tax = Math.round(weekEarnings * taxRate);
        tax = Math.max(10, tax);
        taxAmount = tax;
        setWeeklyTaxPaid(tax);
        const rateDisplay = Math.round(taxRate * 100);
        logsToAdd.push({ msg: `🏛️ Imposto municipal: -${tax} moedas (${rateDisplay}% dos lucros — ${gold > 500 ? `acúmulo de ${Math.floor(gold)}💰 eleva a alíquota` : 'alíquota base'})`, type: 'system' });
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
      let isencaoUsadas = 0;
      contracts.forEach(c => {
        if (c.active && nextDayValue > c.deadline && c.delivered < c.quantity) {
          if (isencaoMultaCount - isencaoUsadas > 0) {
            isencaoUsadas++;
            logsToAdd.push({ msg: `🚚 Contrato vencido — Contrato de Transporte isentou a multa de ${c.penalty}💰!`, type: 'success' });
          } else {
            contractPenaltyForGold += c.penalty;
          }
        }
      });
      if (isencaoUsadas > 0) setIsencaoMultaCount(prev => Math.max(0, prev - isencaoUsadas));

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

      // --- FUNCIONALIDADE 1: Contas semanais de água e energia (a cada 7 dias) ---
      const isWeeklyBillDay = nextDayValue % 7 === 0;

      // Água: base mínima + escala com número de animais. Poço reduz até 75%.
      const baseWaterCost = isWeeklyBillDay ? Math.round(8 + animals.length * 2 + irrigationLevel * 4) : 0;
      const waterDiscount = Math.min(wellLevel * 0.15 + (hasCisterna ? 0.3 : 0), 0.90);
      const waterCost = isWeeklyBillDay ? Math.round(baseWaterCost * (1 - waterDiscount)) : 0;

      // Energia: só cobra se houver infraestrutura instalada (máquinas, fridge, silo, estábulo, bebedouro, queijaria).
      const milkerEnergy = machines.milkerPurchased && machines.milkerActive ? 18 : 0;
      const shearerEnergy = machines.shearerPurchased && machines.shearerActive ? 14 : 0;
      const feederEnergy = machines.feederPurchased && machines.feederActive ? 10 : 0;
      const infraEnergy = (hasFridge ? 12 : 0) + (hasSilo ? 6 : 0) + (hasStable ? 8 : 0) + (hasBebedouro ? 5 : 0) + (queijariaNivel > 0 ? queijariaNivel * 6 : 0);
      const machineEnergyCost = milkerEnergy + shearerEnergy + feederEnergy + infraEnergy;
      const energyDiscount = solarLevel === 1 ? 0.4 : solarLevel === 2 ? 0.7 : solarLevel >= 3 ? 1.0 : 0;
      const energyCost = isWeeklyBillDay && machineEnergyCost > 0 ? Math.round(machineEnergyCost * (1 - energyDiscount)) : 0;

      // Acumular no weeklyStats
      if (isWeeklyBillDay) {
        setWeeklyStats(prev => ({
          ...prev,
          waterCost: (prev.waterCost || 0) + waterCost,
          energyCost: (prev.energyCost || 0) + energyCost,
        }));
      }

      // Verificar se pode pagar água e energia
      const canAffordWater = isWeeklyBillDay ? gold >= waterCost : true;
      const canAffordEnergy = isWeeklyBillDay ? gold >= energyCost : true;

      if (isWeeklyBillDay) {
        if (!canAffordWater && waterCost > 0) {
          logsToAdd.push({ msg: '💧 Sem moedas para pagar a conta de água semanal! Animais sofrendo.', type: 'error' });
          setTimeout(() => {
            setAnimals(al => al.map(a => ({ ...a, happiness: Math.max(0, a.happiness - 8) })));
          }, 0);
        } else if (waterCost > 0) {
          logsToAdd.push({ msg: `💧 Conta de água semanal: -${waterCost}💰 (${animals.length} animais).`, type: 'system' });
        }

        if (!canAffordEnergy && energyCost > 0) {
          logsToAdd.push({ msg: '⚡ Sem moedas para pagar a conta de energia semanal! Infraestrutura afetada.', type: 'error' });
        } else if (energyCost > 0) {
          logsToAdd.push({ msg: `⚡ Conta de energia semanal: -${energyCost}💰 (máquinas + infra).`, type: 'system' });
        }
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

      // --- DEBUG MODE: fluxo de ouro diário ---
      if (debugMode) {
        const totalCostsDebug = maintCost + contractPenaltyForGold + taxAmount + waterCost + energyCost;
        const workerCostDebug = workers.reduce((s, w) => s + w.dailyCost, 0);
        logsToAdd.push({
          msg: `🔍 [DEBUG Dia ${nextDayValue}] Entradas: +${globalGoldBonus}💰 | Saídas: água=${waterCost} energia=${energyCost} maint=${maintCost} imposto=${taxAmount} multa=${contractPenaltyForGold} workers=${workerCostDebug} | Net: ${globalGoldBonus - totalCostsDebug >= 0 ? '+' : ''}${globalGoldBonus - totalCostsDebug}💰`,
          type: 'system'
        });
      }

      // --- Registrar custos diários no log financeiro ---
      if (waterCost > 0) addFinancialEntry({ day: nextDayValue, type: 'expense', category: 'custo_diario', description: 'Conta de água', amount: waterCost });
      if (energyCost > 0) addFinancialEntry({ day: nextDayValue, type: 'expense', category: 'custo_diario', description: 'Conta de energia', amount: energyCost });
      if (maintCost > 0) addFinancialEntry({ day: nextDayValue, type: 'expense', category: 'custo_diario', description: 'Manutenção de máquinas', amount: maintCost });
      if (taxAmount > 0) addFinancialEntry({ day: nextDayValue, type: 'expense', category: 'imposto', description: 'Imposto municipal (5% dos lucros)', amount: taxAmount });

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
          addNotification(`${evt.title}: ${evt.desc}`, 'event');
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

      // Pre-compute climate event overrides so they're baked into finalAnimals pipeline
      // (avoids being overwritten by the final setAnimals call later in advanceDay)
      let predadorTargetId: number | null = null;
      if (nextDayEvent === 'tempestade' && !blockNextStorm && !insuranceClimate.active) {
        // overrides applied per-animal below
      }
      if (nextDayEvent === 'predador') {
        const vulnerable = survivorsAfterAge.filter(a => a.isAdult !== false && !['boi', 'jacare', 'bufalo'].includes(a.type));
        if (vulnerable.length > 0) {
          predadorTargetId = vulnerable[Math.floor(Math.random() * vulnerable.length)].id;
        }
      }

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

        // Pastagem Ampliada: +3 felicidade para bovinos e ovinos
        if (hasPastagem && ['vaca', 'boi', 'bufalo', 'ovelha', 'cabra', 'lhama', 'alpaca'].includes(copy.type)) {
          copy.happiness = Math.min(100, copy.happiness + 3);
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

      // Apply climate event mutations directly into finalAnimals array
      // (must happen here so they're included in the final setAnimals call)
      if (nextDayEvent === 'tempestade' && !blockNextStorm && !insuranceClimate.active) {
        finalAnimals.forEach(a => {
          if (a.isAdult !== false) {
            a.stressedDays = Math.max(a.stressedDays ?? 0, 1);
            a.happiness = Math.max(0, a.happiness - 10);
          }
        });
      }
      if (nextDayEvent === 'geada' && !insuranceClimate.active) {
        finalAnimals.forEach(a => {
          if (a.isAdult !== false) {
            a.happiness = Math.max(0, a.happiness - 15);
            a.stressedDays = Math.max(a.stressedDays ?? 0, 2);
          }
        });
      }
      if (predadorTargetId !== null) {
        const target = finalAnimals.find(a => a.id === predadorTargetId);
        if (target) {
          target.stressedDays = 3;
          target.happiness = Math.max(0, target.happiness - 15);
        }
      }

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
        const basePestChance = 0.05;
        const hasDuckAlive = finalAnimals.some(a => a.type === 'pato');
        const pestChance = hasDuckAlive ? basePestChance * 0.6 : basePestChance;
        if (antiPestDays <= 0 && Math.random() < pestChance) {
          const pestItems: Array<keyof typeof inventory> = ['milk', 'goat_milk', 'egg', 'duck_egg', 'goose_egg'];
          const itemLabels: Record<string, string> = { milk: 'leite', goat_milk: 'l.cabra', egg: 'ovos', duck_egg: 'ov.pato', goose_egg: 'ov.ganso' };
          const lossMultiplier = insurance.active ? 0.3 : 1.0;
          const pestLossFraction = (0.05 + Math.random() * 0.10) * lossMultiplier; // cap 15%
          // Compute losses upfront for detailed reporting and financial entry
          const lostDetails: string[] = [];
          let estimatedGoldLoss = 0;
          pestItems.forEach(key => {
            const current = (inventory[key] ?? 0) as number;
            if (current > 0) {
              const lost = Math.floor(current * pestLossFraction);
              if (lost > 0) {
                lostDetails.push(`${lost} ${itemLabels[key]}`);
                estimatedGoldLoss += lost * getActualSellPrice(key as string);
              }
            }
          });
          setInventory(prev => {
            const next = { ...prev };
            pestItems.forEach(key => {
              const current = (prev[key] ?? 0) as number;
              if (current > 0) {
                const lost = Math.floor(current * pestLossFraction);
                (next as any)[key] = Math.max(0, current - lost);
              }
            });
            return next;
          });
          const detailTxt = lostDetails.length > 0 ? ` Perdidos: ${lostDetails.join(', ')}.` : '';
          const insuranceTxt = insurance.active ? ' Seguro reduziu 70%!' : '';
          logsToAdd.push({ msg: `🐀 Pragas invadiram o celeiro!${detailTxt}${insuranceTxt}`, type: 'error' });
          setTimeout(() => addNotification(`🐀 Pragas!${detailTxt}${insuranceTxt}`, 'warning', nextDayValue), 0);
          if (estimatedGoldLoss > 0) {
            addFinancialEntry({ day: nextDayValue, type: 'expense', category: 'evento', description: `🐀 Pragas — ${lostDetails.join(', ')} (~${Math.round(estimatedGoldLoss)}💰 perdidos${insurance.active ? ', seguro ativo' : ''})`, amount: Math.round(estimatedGoldLoss) });
          }
        }
      }

      // MECHANIC 2: Aplicar evento pré-sorteado do dia atual + sortear próximo
      {
        // Aplicar o evento que foi sorteado ontem para hoje
        // Climate events — mutations already applied in finalAnimals pipeline above
        if (nextDayEvent === 'tempestade') {
          if (blockNextStorm) {
            logsToAdd.push({ msg: `☂️ Tempestade chegou, mas a Cobertura Provisória protegeu a fazenda!`, type: 'success' });
            setBlockNextStorm(false);
          } else if (insuranceClimate.active) {
            logsToAdd.push({ msg: `🌦️ Tempestade chegou, mas o Seguro Climático protegeu seus animais!`, type: 'success' });
          } else {
            logsToAdd.push({ msg: `⛈️ Tempestade! Animais estressados — produção reduzida e -10 felicidade hoje.`, type: 'error' });
            setTimeout(() => addNotification('⛈️ Tempestade! Produção reduzida hoje.', 'warning', nextDayValue), 0);
          }
        } else if (nextDayEvent === 'geada') {
          if (insuranceClimate.active) {
            logsToAdd.push({ msg: `🌦️ Geada chegou, mas o Seguro Climático protegeu seus animais!`, type: 'success' });
          } else {
            logsToAdd.push({ msg: `❄️ Geada! Todos os animais perderam 20 de felicidade e ficaram estressados por 2 dias.`, type: 'error' });
            setTimeout(() => addNotification('❄️ Geada! -20 felicidade e estresse nos animais.', 'warning', nextDayValue), 0);
          }
        } else if (nextDayEvent === 'predador') {
          if (predadorTargetId !== null) {
            const target = finalAnimals.find(a => a.id === predadorTargetId);
            if (target) {
              logsToAdd.push({ msg: `🐺 Predador atacou a fazenda! ${target.name} ficou assustado — estressado por 3 dias e -25 felicidade.`, type: 'error' });
              setTimeout(() => addNotification(`🐺 Predador! ${target.name} ficou estressado.`, 'warning', nextDayValue), 0);
            }
          } else {
            logsToAdd.push({ msg: `🐺 Predador rondou a fazenda, mas não encontrou animais vulneráveis!`, type: 'event' });
          }
        }

        // Sortear evento do próximo dia
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

      // Codorna: auto-collect quail_eggs (3 por codorna/dia)
      {
        const producingCodornas = finalAnimals.filter(a => a.type === 'codorna' && a.hasProducedToday);
        if (producingCodornas.length > 0) {
          const eggs = producingCodornas.length * 3;
          setInventory(prev => ({ ...prev, quail_egg: (prev.quail_egg ?? 0) + eggs }));
          logsToAdd.push({ msg: `🐦 ${producingCodornas.length} codorna(s) botaram ${eggs} ovos de codorna!`, type: 'success' });
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
          const jBonus = a.happiness >= 70 ? 0.08 : a.happiness >= 50 ? 0.04 : 0;
          if (jBonus > 0) {
            logsToAdd.push({ msg: `🌱 ${a.name} cresceu bem! Recebe +${Math.round(jBonus*100)}% de produção permanente por boa criação na juventude.`, type: 'success' });
          }
          return { ...a, isAdult: true, adulthoodDay: undefined, juvenileBonus: jBonus, maxAge: a.maxAge ?? Math.round(baseMax * (1 + (Math.random() * 0.4 - 0.2))) };
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
      // Remove animals that died from illness
      const animalsAfterDeaths = animalsWithWeekly.filter(a => !a.diedFromIllness);
      setAnimals(prev => {
        const idsInComputed = new Set(animalsAfterDeaths.map(a => a.id));
        const newlyAdded = prev.filter(a => !idsInComputed.has(a.id));
        return [...animalsAfterDeaths, ...newlyAdded];
      });
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
      const maturacaoInput = hasLaboratorio
        ? queijosEmMaturacao.map(q => ({ ...q, diasRestantes: Math.max(0, q.diasRestantes - 1) }))
        : queijosEmMaturacao;
      const { remaining: maturacaoRemaining, readyQueijos } = processarMaturacaoQueijos(maturacaoInput, nextDayValue, logsToAdd);
      setQueijosEmMaturacao(maturacaoRemaining);

      if (readyQueijos.length > 0) {
        setInventory(inv => {
          const nextInv = { ...inv };
          readyQueijos.forEach(tipo => {
            const key = tipo === 'coalho' ? 'queijoCoalho' : tipo === 'mucarela' ? 'queijoMucarela' : tipo === 'buffalo_mozzarella' ? 'buffalo_mozzarella' : tipo === 'yogurt' ? 'yogurt' : tipo === 'parmesao' ? 'queijo_parmesao' : tipo === 'serra' ? 'queijo_serra' : 'queijoBrie';
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
          const droughtExtraCost = waterCost * 2;
          addFinancialEntry({ day: nextDayValue, type: 'expense', category: 'evento', description: `🏜️ Seca — custo extra de água (${droughtExtraCost}💰)`, amount: droughtExtraCost });
          setGold(prev => {
            const cost = waterCost * 2;
            if (prev < cost) {
              setDebt(d => d + (cost - prev));
              return 0;
            }
            return prev - cost;
          }); // extra 2x cost (total 3x)
        } else if (currentSeasonIdx === 1 && Math.random() < 0.05) {
          if (insuranceClimate.active) {
            logsToAdd.push({ msg: `🌦️ Seca começou mas Seguro Climático protegeu sua fazenda! Sem custo extra.`, type: 'success' });
          } else if (blockNextDrought) {
            logsToAdd.push({ msg: `💧 Seca detectada mas a Bomba d'Água neutralizou o impacto! Animais protegidos.`, type: 'success' });
            setBlockNextDrought(false);
          } else {
            logsToAdd.push({ msg: `🏜️ Uma seca prolongada começou! Custo de água será triplicado por 3 dias!`, type: 'error' });
            setTimeout(() => addNotification('🏜️ Seca prolongada por 3 dias! Custo de água triplicado!', 'warning', nextDayValue), 0);
            setDroughtDaysRemaining(3);
          }
        }
      }

      // Roubo noturno (4% de chance, não ocorre nos primeiros 5 dias, cooldown 5 dias)
      if (currentDay > 5 && (currentDay - lastTheftDay) >= 5 && Math.random() < 0.04) {
        if (insuranceTheft.active) {
          logsToAdd.push({ msg: `🛡️ Tentativa de roubo! Seguro contra Roubo bloqueou o ladrão!`, type: 'success' });
          setTimeout(() => addNotification(`🛡️ Tentativa de roubo bloqueada pelo seguro!`, 'success', nextDayValue), 0);
          setLastTheftDay(nextDayValue);
        } else {
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
          setLastTheftDay(nextDayValue);
        }
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
        setGold(prev => {
          if (prev < workerCost) { setDebt(d => d + (workerCost - prev)); return 0; }
          return prev - workerCost;
        });
        logsToAdd.push({ msg: `👷 Peões trabalharam hoje! Custo diário: -${workerCost}💰`, type: 'info' });
        addFinancialEntry({ day: nextDayValue, type: 'expense', category: 'trabalhador', description: `Salário de ${workers.length} peão(ões)`, amount: workerCost });

        // --- Tratador: alimenta todos os animais consumindo ração correta do inventário ---
        if (workers.some(w => w.role === 'tratador')) {
          const getFeedKeyForType2 = (type: string): keyof typeof inventory => {
            if (type === 'vaca' || type === 'boi' || type === 'bufalo') return 'racaoBovina';
            if (type === 'ovelha' || type === 'cabra' || type === 'lhama' || type === 'alpaca') return 'racaoOvinos';
            if (type === 'galinha' || type === 'codorna' || type === 'pavao') return 'racaoAves';
            if (type === 'pato' || type === 'ganso') return 'racaoAquatica';
            if (type === 'coelho_angora') return 'racaoCoelho';
            return 'racaoCarnivora';
          };
          const noFeedTypes = ['minhoca', 'caracol', 'bicho_seda'];
          // Pre-compute which animals can be fed (using closure inventory snapshot)
          // Silagem ativa: não consome ração do inventário
          const tmpInv2 = { ...inventory } as Record<string, number>;
          const fedAnimalIds = new Set<number>();
          const feedDeductions: Partial<Record<string, number>> = {};
          animals.forEach(a => {
            if (noFeedTypes.includes(a.type)) return;
            if (silagemDays > 0) { fedAnimalIds.add(a.id); return; }
            const feedKey = getFeedKeyForType2(a.type) as string;
            if ((tmpInv2[feedKey] ?? 0) > 0) {
              tmpInv2[feedKey] -= 1;
              fedAnimalIds.add(a.id);
              feedDeductions[feedKey] = (feedDeductions[feedKey] ?? 0) + 1;
            }
          });
          if (fedAnimalIds.size > 0) {
            setInventory(prev => {
              const updated = { ...prev } as Record<string, number>;
              Object.entries(feedDeductions).forEach(([key, count]) => {
                updated[key] = Math.max(0, (updated[key] ?? 0) - (count as number));
              });
              return updated as typeof inventory;
            });
            setAnimals(prev => prev.map(a => {
              if (!fedAnimalIds.has(a.id)) return a;
              return { ...a, hunger: Math.min(100, a.hunger + 35), happiness: Math.min(100, a.happiness + 12), daysWithoutFood: 0 };
            }));
            setStats(prev => ({ ...prev, totalFed: prev.totalFed + fedAnimalIds.size }));
            logsToAdd.push({ msg: `🌾 Tratador alimentou ${fedAnimalIds.size} animal(is) hoje!`, type: 'success' });
          }
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
          const cowMilkCollected = finalAnimals.filter(a => a.type === 'vaca' && a.isAdult !== false && a.hasProducedToday && !(machines.milkerPurchased && machines.milkerActive)).length;
          const goatMilkCollected = finalAnimals.filter(a => a.type === 'cabra' && a.isAdult !== false && a.hasProducedToday).length;
          const buffaloMilkCollected = finalAnimals.filter(a => a.type === 'bufalo' && a.isAdult !== false && a.hasProducedToday).length;
          const alpacaWoolCollected = finalAnimals.filter(a => a.type === 'alpaca' && a.isAdult !== false && a.woolReady).length;
          const ordenhadorIds = new Set(finalAnimals.filter(a => {
            if (a.type === 'vaca' && a.isAdult !== false && a.hasProducedToday && !(machines.milkerPurchased && machines.milkerActive)) return true;
            if ((a.type === 'cabra' || a.type === 'bufalo') && a.isAdult !== false && a.hasProducedToday) return true;
            if (a.type === 'alpaca' && a.isAdult !== false && a.woolReady) return true;
            return false;
          }).map(a => a.id));
          if (ordenhadorIds.size > 0) {
            setAnimals(prev => prev.map(a => {
              if (!ordenhadorIds.has(a.id)) return a;
              if (a.type === 'alpaca') return { ...a, woolReady: false, daysSinceLastWool: 0 };
              return { ...a, hasProducedToday: false };
            }));
          }
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
          const woolCollected = finalAnimals.filter(a => a.type === 'ovelha' && a.isAdult !== false && a.woolReady && !(machines.shearerPurchased && machines.shearerActive)).length;
          const angoraCollected = finalAnimals.filter(a => a.type === 'coelho_angora' && a.isAdult !== false && a.woolReady).length;
          const tosquiadorIds = new Set(finalAnimals.filter(a => {
            if (a.type === 'ovelha' && a.isAdult !== false && a.woolReady && !(machines.shearerPurchased && machines.shearerActive)) return true;
            if (a.type === 'coelho_angora' && a.isAdult !== false && a.woolReady) return true;
            return false;
          }).map(a => a.id));
          if (tosquiadorIds.size > 0) {
            setAnimals(prev => prev.map(a => {
              if (!tosquiadorIds.has(a.id)) return a;
              const daysUntilWool = a.type === 'coelho_angora' ? 5 : 7;
              return { ...a, woolReady: false, daysUntilWool, daysSinceLastWool: 0 };
            }));
          }
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
          const eggsCollected = finalAnimals.filter(a => a.type === 'galinha' && a.isAdult !== false && a.hasProducedToday).length;
          const duckEggs = finalAnimals.filter(a => a.type === 'pato' && a.isAdult !== false && a.hasProducedToday).length;
          const ostrichFeathers = finalAnimals.filter(a => a.type === 'avestruz' && a.isAdult !== false && a.woolReady).length;
          const avicultorIds = new Set(finalAnimals.filter(a => {
            if ((a.type === 'galinha' || a.type === 'pato') && a.isAdult !== false && a.hasProducedToday) return true;
            if (a.type === 'avestruz' && a.isAdult !== false && a.woolReady) return true;
            return false;
          }).map(a => a.id));
          if (avicultorIds.size > 0) {
            setAnimals(prev => prev.map(a => {
              if (!avicultorIds.has(a.id)) return a;
              if (a.type === 'avestruz') return { ...a, woolReady: false, daysSinceLastWool: 0 };
              return { ...a, hasProducedToday: false };
            }));
          }
          if (eggsCollected > 0) {
            setInventory(prev => ({ ...prev, egg: prev.egg + eggsCollected }));
            logsToAdd.push({ msg: `🥚 Avicultor coletou +${eggsCollected} ovo(s) de galinha!`, type: 'success' });
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

      // --- ALERTA DE ESTOQUE BAIXO ---
      {
        const feedAlerts: string[] = [];
        const hasBovinos = finalAnimals.some(a => ['vaca','boi','bufalo'].includes(a.type));
        const hasOvinos = finalAnimals.some(a => ['ovelha','cabra','lhama','alpaca'].includes(a.type));
        const hasAves = finalAnimals.some(a => ['galinha','codorna','pavao'].includes(a.type));
        const hasAquatico = finalAnimals.some(a => ['pato','ganso'].includes(a.type));
        const hasCoelho = finalAnimals.some(a => a.type === 'coelho_angora');
        const hasCarnivoro = finalAnimals.some(a => ['jacare','avestruz'].includes(a.type));
        if (hasBovinos && (inventory.racaoBovina ?? 0) <= 3) feedAlerts.push('🌾 Ração Bovina');
        if (hasOvinos && (inventory.racaoOvinos ?? 0) <= 3) feedAlerts.push('🐐 Ração de Ovinos');
        if (hasAves && (inventory.racaoAves ?? 0) <= 3) feedAlerts.push('🐔 Ração de Aves');
        if (hasAquatico && (inventory.racaoAquatica ?? 0) <= 3) feedAlerts.push('🦆 Ração Aquática');
        if (hasCoelho && (inventory.racaoCoelho ?? 0) <= 3) feedAlerts.push('🐰 Ração de Coelhos');
        if (hasCarnivoro && (inventory.racaoCarnivora ?? 0) <= 3) feedAlerts.push('🍖 Ração Carnívora');
        if (feedAlerts.length > 0 && nextDayValue % 3 === 0) {
          logsToAdd.push({ msg: `⚠️ Estoque baixo! Menos de 3 unidades: ${feedAlerts.join(', ')}. Reabasteça nas lojas!`, type: 'error' });
          setTimeout(() => addNotification(`⚠️ Estoque baixo: ${feedAlerts.slice(0,2).join(', ')}`, 'warning', nextDayValue), 0);
        }
      }

      // --- SISTEMA DE EMPRÉSTIMO: juros semanais ---
      if (loanActive) {
        const newDaysUntil = loanDaysUntilInterest - 1;
        if (newDaysUntil <= 0) {
          const interest = Math.round(loanAmount * loanInterestRate);
          setGold(prev => Math.max(0, prev - interest));
          const newWeeks = loanWeeksLeft - 1;
          setLoanWeeksLeft(newWeeks);
          setLoanDaysUntilInterest(7);
          if (newWeeks <= 0) {
            setLoanActive(false);
            setLoanAmount(0);
            logsToAdd.push({ msg: `🏦 Empréstimo quitado! Último pagamento de juros: ${interest} moedas.`, type: 'success' });
            setTimeout(() => addNotification(`🏦 Empréstimo quitado!`, 'success', nextDayValue), 0);
          } else {
            logsToAdd.push({ msg: `🏦 Juros semanais do empréstimo: -${interest} moedas. Ainda ${newWeeks} semana(s) restantes.`, type: 'event' });
            setTimeout(() => addNotification(`🏦 Juros do empréstimo: -${interest}💰`, 'warning', nextDayValue), 0);
          }
        } else {
          setLoanDaysUntilInterest(newDaysUntil);
        }
      }

      // --- SEGUROS EXTRAS: decrementar dias ---
      if (insuranceTheft.active) {
        const left = insuranceTheft.daysLeft - 1;
        if (left <= 0) {
          setInsuranceTheft({ active: false, daysLeft: 0 });
          logsToAdd.push({ msg: `🛡️ Seguro contra Roubo expirou! Renove nas Melhorias.`, type: 'event' });
        } else {
          setInsuranceTheft(prev => ({ ...prev, daysLeft: left }));
        }
      }
      if (insuranceClimate.active) {
        const left = insuranceClimate.daysLeft - 1;
        if (left <= 0) {
          setInsuranceClimate({ active: false, daysLeft: 0 });
          logsToAdd.push({ msg: `🌦️ Seguro Climático expirou! Renove nas Melhorias.`, type: 'event' });
        } else {
          setInsuranceClimate(prev => ({ ...prev, daysLeft: left }));
        }
      }

      // --- EFEITOS DO MERCADOR: decrementar dias ---
      if (fertilityBoostDays > 0) setFertilityBoostDays(prev => prev - 1);
      if (premiumPricesDays > 0) setPremiumPricesDays(prev => prev - 1);
      if (productionBoostDays > 0) setProductionBoostDays(prev => prev - 1);
      if (antiPestDays > 0) setAntiPestDays(prev => prev - 1);
      if (suplementoMineralDays > 0) setSuplementoMineralDays(prev => prev - 1);
      if (salMineralDays > 0) setSalMineralDays(prev => prev - 1);
      if (seloOrganicodays > 0) setSeloOrganicoDays(prev => prev - 1);
      if (silagemDays > 0) setSilagemDays(prev => prev - 1);

      // --- EVENTOS DO MUNDO ---
      if (worldEvent) {
        const newDaysLeft = worldEvent.daysLeft - 1;
        if (newDaysLeft <= 0) {
          setWorldEvent(null);
          logsToAdd.push({ msg: `📰 Evento mundial "${worldEvent.title}" encerrado. Preços voltam ao normal.`, type: 'system' });
        } else {
          setWorldEvent(prev => prev ? { ...prev, daysLeft: newDaysLeft } : null);
        }
      } else if (nextDayValue % 15 === 0 && Math.random() < 0.45) {
        const worldEvents = [
          { id: 'guerra', title: '⚔️ Conflito Regional', desc: 'Crise aumenta demanda por alimentos! Preços sobem.', daysLeft: 5, priceMult: 1.4, items: ['milk','wool','egg','cheese','meat'] },
          { id: 'festival', title: '🎉 Festival Nacional', desc: 'Festival aumenta consumo de produtos locais!', daysLeft: 4, priceMult: 1.3, items: ['egg','mayo','cheese','honey','butter'] },
          { id: 'seca_global', title: '🏜️ Seca Global', desc: 'Escassez mundial valoriza alimentos básicos.', daysLeft: 6, priceMult: 1.5, items: ['milk','goat_milk','buffalo_milk','butter'] },
          { id: 'exportacao', title: '🚢 Abertura de Exportações', desc: 'Novos mercados abertos! Produtos exóticos valorizados.', daysLeft: 5, priceMult: 1.6, items: ['carne_jacare','couro_jacare','pena_grande','peacock_feather'] },
          { id: 'feria_gourmet', title: '🍽️ Feira Gourmet Internacional', desc: 'Queijos e derivados premium em alta demanda!', daysLeft: 4, priceMult: 1.45, items: ['queijoBrie','queijoMucarela','queijoCoalho','queijo_cabra'] },
          { id: 'boom_textil', title: '🧶 Boom Têxtil', desc: 'Indústria de moda em expansão! Lã e fibras valorizadas.', daysLeft: 5, priceMult: 1.35, items: ['wool','alpaca_wool','angora_wool','seda_bruta','fio_seda'] },
          { id: 'crise_economica', title: '📉 Crise Econômica', desc: 'Recessão reduz preços em 20% por 5 dias.', daysLeft: 5, priceMult: 0.8, items: ['milk','wool','egg','cheese','butter','mayo'] },
        ];
        const ev = worldEvents[Math.floor(Math.random() * worldEvents.length)];
        setWorldEvent(ev);
        logsToAdd.push({ msg: `🌍 EVENTO MUNDIAL: ${ev.title} — ${ev.desc} (${ev.daysLeft} dias)`, type: 'event' });
        setTimeout(() => addNotification(`🌍 Evento Mundial: ${ev.title}`, 'info', nextDayValue), 0);
        if (ev.priceMult < 1) setTimeout(() => checkAndUnlockAchievement('world_event_survived'), 0);
      }

      // --- MAIS EVENTOS POSITIVOS ALEATÓRIOS ---
      if (Math.random() < 0.12) {
        const positiveChances = [
          () => { const bonus = Math.round((30 + Math.floor(Math.random() * 70)) * (1 + (farmLevel - 1) * 0.1)); setGold(prev => prev + bonus); logsToAdd.push({ msg: `🍀 Sorte! Um visitante deixou uma gorjeta de ${bonus} moedas!`, type: 'success' }); },
          () => { setAnimals(prev => prev.map(a => a.happiness < 100 ? { ...a, happiness: Math.min(100, a.happiness + 15) } : a)); logsToAdd.push({ msg: `☀️ Dia ensolarado perfeito! Todos os animais ficaram mais felizes (+15 felicidade)!`, type: 'success' }); },
          () => { setInventory((prev: any) => ({ ...prev, racaoBovina: (prev.racaoBovina ?? 0) + 5, racaoOvinos: (prev.racaoOvinos ?? 0) + 5, racaoAves: (prev.racaoAves ?? 0) + 5 })); logsToAdd.push({ msg: `🎁 Doação! Um vizinho deixou 5 de cada ração na sua porta!`, type: 'success' }); },
          () => { const xp = 15 + Math.floor(Math.random() * 20); setFarmXp(prev => prev + xp); logsToAdd.push({ msg: `📖 Insight! Aprendeu novas técnicas de fazenda (+${xp} XP)!`, type: 'success' }); },
          () => { logsToAdd.push({ msg: `🌈 Um arco-íris apareceu sobre sua fazenda! Dizem que traz boa sorte...`, type: 'event' }); setTimeout(() => addNotification('🌈 Arco-íris! Boa sorte chegando!', 'success', nextDayValue), 0); setGold(prev => prev + 20); },
          () => { setAnimals(prev => prev.map(a => a.isSick ? { ...a, isSick: false } : a)); logsToAdd.push({ msg: `🌿 A brisa fresca curou os animais doentes naturalmente!`, type: 'success' }); },
        ];
        const roll = Math.floor(Math.random() * positiveChances.length);
        positiveChances[roll]();
      }

      // Próximo dia
      setCurrentDay(prev => prev + 1);

      setLogs(prev => {
        const dayLabel = currentDay + 1;
        // Limpar diário a cada 7 dias para evitar acúmulo
        const keepPrev = nextDayValue % 7 === 0 ? [] : prev.slice(-20);
        const parsedNewLogs: LogMessage[] = [
          {
            id: Math.random().toString(36),
            day: currentDay,
            message: nextDayValue % 7 === 0
              ? `📋 Diário reiniciado no Dia ${dayLabel}! (registros anteriores arquivados)`
              : `🌙 O sol se põe... Amanhece o Dia ${dayLabel}!`,
            type: 'system'
          },
          ...logsToAdd.map(l => ({
            id: Math.random().toString(36),
            day: dayLabel,
            message: l.msg,
            type: l.type
          }))
        ];
        return [...keepPrev, ...parsedNewLogs];
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
      vaca: 4, boi: 4, bufalo: 4,
      ovelha: 3, cabra: 3, lhama: 3, alpaca: 3,
      galinha: 3, codorna: 3, pavao: 3,
      pato: 4, ganso: 4,
      coelho_angora: 3,
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
                  🌾 Nível {farmLevel} ({getFarmTitle(farmLevel)}) • <span className={weather === 'chuva' ? 'animate-bounce inline-block' : weather === 'sol' ? 'animate-spin inline-block' : ''}>{weather === 'chuva' ? '🌧️ Chuva' : weather === 'sol' ? '☀️ Sol Forte' : '☁️ Nublado'}</span> • {seasonName}
                  {nextDayEvent && (
                    <span className="ml-2 text-[#fbbf24] text-[10px]">
                      | Amanhã: {nextDayEvent === 'praga' ? '🐀 Pragas' : nextDayEvent === 'tempestade' ? '⛈️ Tempestade' : nextDayEvent === 'seca' ? '🏜️ Seca' : nextDayEvent === 'geada' ? '❄️ Geada' : nextDayEvent === 'predador' ? '🐺 Predador' : nextDayEvent === 'chuva_leve' ? '🌦️ Chuva Leve' : nextDayEvent === 'sol_forte' ? '☀️ Sol Forte' : nextDayEvent === 'vento_bom' ? '🌬️ Vento Bom' : '🌤️ Tranquilo'}
                    </span>
                  )}
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
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] text-yellow-300 font-mono font-bold uppercase tracking-wider">
                      🌌 IMPÉRIO AURORA — Nível Máximo!
                    </span>
                    <span className="text-[10px] bg-yellow-400/20 border border-yellow-400/40 text-yellow-200 font-mono font-black px-2 py-0.5 rounded-full">
                      ⭐ {prestigePoints} Prestígio
                    </span>
                  </div>
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
                <span className="min-w-[1.5ch] text-center">{inventory.milk}</span>
              </div>
              <span className="w-px h-4 bg-[#fbbf24]/50 shrink-0" />
              <div className="flex items-center gap-1" title="🧶 Lã Crua tosquiada das suas ovelhas">
                <span>🧶</span>
                <span className="min-w-[1.5ch] text-center">{inventory.wool}</span>
              </div>
              <span className="w-px h-4 bg-[#fbbf24]/50 shrink-0" />
              <div className="flex items-center gap-1" title="🧀 Queijo artesanal curado">
                <span>🧀</span>
                <span className="min-w-[1.5ch] text-center">{inventory.cheese}</span>
              </div>
              <span className="w-px h-4 bg-[#fbbf24]/50 shrink-0" />
              <div className="flex items-center gap-1" title="🧣 Cachecol elegante trançado">
                <span>🧣</span>
                <span className="min-w-[1.5ch] text-center">{inventory.scarf}</span>
              </div>
            </div>

            {/* Coins display */}
            <div className="bg-[#fef3c7] border-3 border-[#fbbf24] rounded-full px-5 py-2 flex items-center gap-2 shadow-[inset_0_4px_0_rgba(255,255,255,0.5),0_4px_0_#451a03] text-[#92400e] font-black text-lg sm:text-xl font-mono" title="Seu montante em moedas de ouro para alimentação e compras">
              <span className="text-xl sm:text-2xl">💰</span>
              <span>{Math.floor(gold)}</span>
              <span className="text-xs uppercase font-bold tracking-wide text-[#b45309] ml-1">moedas</span>
              {dailyEarning > 0 && (
                <span className="text-emerald-700 font-bold text-xs ml-1" title="Ganhos acumulados hoje">
                  +{dailyEarning}
                </span>
              )}
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
              <div className="bg-green-700 border-3 border-green-400 text-white font-mono font-black text-xs px-3 py-2 rounded-full flex items-center gap-1" title={`Seguro agrícola: ${insurance.daysLeft} dias restantes`}>
                🛡️ {insurance.daysLeft}d
              </div>
            )}
            {insuranceTheft.active && (
              <div className="bg-orange-700 border-3 border-orange-400 text-white font-mono font-black text-xs px-3 py-2 rounded-full flex items-center gap-1" title={`Seguro contra Roubo: ${insuranceTheft.daysLeft} dias`}>
                🔒 {insuranceTheft.daysLeft}d
              </div>
            )}
            {insuranceClimate.active && (
              <div className="bg-sky-700 border-3 border-sky-400 text-white font-mono font-black text-xs px-3 py-2 rounded-full flex items-center gap-1" title={`Seguro Climático: ${insuranceClimate.daysLeft} dias`}>
                🌦️ {insuranceClimate.daysLeft}d
              </div>
            )}
            {droughtDaysRemaining > 0 && (
              <div className="bg-yellow-700 border-3 border-yellow-500 text-white font-mono font-black text-xs px-3 py-2 rounded-full flex items-center gap-1" title={`Seca ativa: custo de água triplicado por mais ${droughtDaysRemaining} dia${droughtDaysRemaining > 1 ? 's' : ''}`}>
                🏜️ {droughtDaysRemaining}d
              </div>
            )}
            {worldEvent && (
              <div className="relative group">
                <div className={`border-3 text-white font-mono font-black text-xs px-3 py-2 rounded-full flex items-center gap-1 cursor-help ${worldEvent.priceMult >= 1 ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400'}`}>
                  🌍 {worldEvent.daysLeft}d
                </div>
                <div className="absolute top-full right-0 mt-2 w-60 bg-gray-900 border border-gray-600 rounded-xl p-3 text-xs text-white hidden group-hover:block z-50 shadow-2xl pointer-events-none">
                  <div className="font-bold text-sm mb-1">{worldEvent.title}</div>
                  <div className="text-gray-300 mb-2 leading-relaxed">{worldEvent.desc}</div>
                  <div className={`font-bold text-sm ${worldEvent.priceMult >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                    {worldEvent.priceMult >= 1 ? `+${Math.round((worldEvent.priceMult - 1) * 100)}%` : `-${Math.round((1 - worldEvent.priceMult) * 100)}%`} nos preços
                  </div>
                  <div className="text-gray-400 mt-1">⏳ {worldEvent.daysLeft} dia{worldEvent.daysLeft > 1 ? 's' : ''} restante{worldEvent.daysLeft > 1 ? 's' : ''}</div>
                </div>
              </div>
            )}
            {loanActive && (
              <div className="bg-violet-700 border-3 border-violet-400 text-white font-mono font-black text-xs px-3 py-2 rounded-full flex items-center gap-1" title={`Empréstimo ativo: ${loanWeeksLeft} semanas restantes`}>
                🏦 {loanWeeksLeft}sem
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

            {/* 💰 Finanças Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowFinancasModal(true);
                triggerAudioResult(() => sfx.playSound('click'));
              }}
              className="bg-emerald-700 border-3 border-emerald-400 hover:bg-emerald-600 text-white font-mono font-black text-sm px-4 py-2.5 rounded-full active:translate-y-0.5 shadow-[0_4px_0_#064e3b] cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 focus:outline-none"
              title="Histórico de transações financeiras da fazenda"
            >
              <span>💰</span>
              <span>Finanças</span>
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
              {(() => {
                const claimable = missions.filter(m => m.completed && !m.claimed).length;
                const expiring = missions.filter(m => !m.completed && !m.claimed && m.type === 'daily' && m.expiresOnDay <= currentDay + 1).length;
                const active = missions.filter(m => !m.completed && !m.claimed).length;
                if (claimable > 0) return (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-[#451a03] text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {claimable}
                  </span>
                );
                if (expiring > 0) return (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {expiring}
                  </span>
                );
                if (active > 0) return (
                  <span className="absolute -top-1 -right-1 bg-purple-300 text-purple-900 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {active}
                  </span>
                );
                return null;
              })()}
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

        {/* Melhoria 6: Toast de autosave */}
        {showSavedToast && (
          <div className="fixed bottom-4 right-4 z-[9999] bg-emerald-700 text-white text-xs font-mono font-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse pointer-events-none">
            ✅ Salvo!
          </div>
        )}

        {/* Melhoria 7 + 10: Barra de avisos contextuais */}
        {(loanActive && loanWeeksLeft <= 1) || nextFairDay - currentDay <= 3 ? (
          <div className="flex flex-wrap gap-2 px-6 pb-2">
            {loanActive && loanWeeksLeft <= 1 && (
              <div className="bg-red-700 border-2 border-red-400 text-white text-[11px] font-mono font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
                🏦 Empréstimo vence em {loanWeeksLeft === 0 ? 'hoje' : `${loanWeeksLeft} semana`}!
              </div>
            )}
            {nextFairDay - currentDay <= 3 && nextFairDay > currentDay && (
              <div className="bg-amber-600 border-2 border-amber-400 text-white text-[11px] font-mono font-black px-3 py-1.5 rounded-full flex items-center gap-1.5">
                🎪 Feira em {nextFairDay - currentDay} dia{nextFairDay - currentDay !== 1 ? 's' : ''}!
              </div>
            )}
          </div>
        ) : null}

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
                        else if (item.effect === 'cure_all_sick') { setAnimals(prev => prev.map(a => ({ ...a, isSick: false }))); addLog('🩺 Todos os animais doentes foram curados!', 'success'); }
                        else if (item.effect === 'fertility_3days') { setFertilityBoostDays(prev => prev + 3); addLog('🧪 Poção de Fertilidade ativa! 2x produção por 3 dias!', 'success'); }
                        else if (item.effect === 'premium_prices_5days') { setPremiumPricesDays(prev => prev + 5); addLog('🏅 Selo de Qualidade Premium ativo! +25% preços por 5 dias!', 'success'); }
                        else if (item.effect === 'treasure_map') {
                          const bonus = 200 + Math.floor(Math.random() * 401);
                          setGold(prev => prev + bonus);
                          addLog(`🗺️ Mapa do Tesouro! Encontrou ${bonus} moedas enterradas na fazenda!`, 'success');
                        }
                        else if (item.effect === 'anti_pest_14days') { setAntiPestDays(prev => prev + 14); addLog('🧴 Antídoto Anti-Pragas ativo por 14 dias!', 'success'); }
                        else if (item.effect === 'happiness_boost') { setAnimals(prev => prev.map(a => ({ ...a, happiness: Math.min(100, a.happiness + 30) }))); addLog('✨ Elixir da Felicidade! +30 felicidade a todos!', 'success'); }
                        else if (item.effect === 'production_boost_7days') { setProductionBoostDays(prev => prev + 7); addLog('📚 Manual de Produção Avançada! +15% produção por 7 dias!', 'success'); }
                        else if (item.effect === 'suplemento_mineral_7days') { setSuplementoMineralDays(prev => prev + 7); addLog('💊 Suplemento Mineral aplicado! +20% produção de leite por 7 dias!', 'success'); }
                        else if (item.effect === 'cure_one_sick') { const sick = animals.find(a => a.isSick); if (sick) { setAnimals(prev => prev.map(a => a.id === sick.id ? { ...a, isSick: false } : a)); addLog(`🩹 ${sick.name} foi curado com a bandagem veterinária!`, 'success'); } else addLog('🩹 Nenhum animal doente no momento.', 'info'); }
                        else if (item.effect === 'sal_mineral_3days') { setSalMineralDays(prev => prev + 3); addLog('🧂 Sal mineral disponível! Animais não perdem fome por 3 dias!', 'success'); }
                        else if (item.effect === 'selo_organico_7days') { setSeloOrganicoDays(prev => prev + 7); addLog('🌿 Selo Orgânico ativo! +20% preço de venda por 7 dias!', 'success'); }
                        else if (item.effect === 'balanca_precisao') { setHasBalanca(true); addLog('⚖️ Balança de Precisão instalada! +5% preço de venda permanente!', 'success'); }
                        else if (item.effect === 'cisterna') { setHasCisterna(true); addLog('🪣 Cisterna de Água instalada! -30% conta de água semanal!', 'success'); }
                        else if (item.effect === 'block_storm') { setBlockNextStorm(true); addLog('☂️ Cobertura Provisória montada! Próxima tempestade não afetará a produção!', 'success'); }
                        else if (item.effect === 'block_drought') { setBlockNextDrought(true); addLog('💧 Bomba d\'Água pronta! Próxima seca não reduzirá felicidade dos animais!', 'success'); }
                        else if (item.effect === 'silagem_5days') { setSilagemDays(prev => prev + 5); addLog('🌽 Silagem Premium estocada! Animais não consomem ração por 5 dias!', 'success'); }
                        else if (item.effect === 'garantir_mercador') { setDaysSinceMerchant(6); addLog('📰 Anúncio publicado! O Mercador retornará garantido no próximo ciclo!', 'success'); }
                        else if (item.effect === 'isencao_multa_2x') { setIsencaoMultaCount(prev => prev + 2); addLog('🚚 Contrato de Transporte ativo! Próximas 2 multas por entrega vencida serão isentas!', 'success'); }
                        else if (item.effect === 'rare_animal_bait') { addLog('🎯 Isca preparada! Um animal raro pode aparecer amanhã com 50% de desconto!', 'success'); }
                        setMerchantSpecialItems(prev => prev.filter(id => id !== item.id));
                        setStats(prev => ({ ...prev, totalMerchantShopPurchases: (prev.totalMerchantShopPurchases ?? 0) + 1 }));
                        if (((stats.totalMerchantShopPurchases ?? 0) + 1) >= 10) setTimeout(() => checkAndUnlockAchievement('merchant_loyal'), 0);
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

        {/* --- ACTIVE EVENTS PANEL --- */}
        {(() => {
          const activeEvents: { icon: string; label: string; days?: number; color: string }[] = [];
          if (droughtDaysRemaining > 0) activeEvents.push({ icon: '🏜️', label: 'Seca — custo de água triplicado', days: droughtDaysRemaining, color: 'bg-yellow-800 border-yellow-500' });
          if (worldEvent) activeEvents.push({ icon: '🌍', label: `${worldEvent.title} — ${worldEvent.priceMult >= 1 ? '+' : ''}${Math.round((worldEvent.priceMult - 1) * 100)}% preços`, days: worldEvent.daysLeft, color: worldEvent.priceMult >= 1 ? 'bg-green-800 border-green-500' : 'bg-red-800 border-red-500' });
          if (activeMarketEvent) activeEvents.push({ icon: '📊', label: `${activeMarketEvent.title} — +${Math.round((activeMarketEvent.mult - 1) * 100)}% mercado`, days: activeMarketEvent.daysLeft, color: 'bg-blue-800 border-blue-500' });
          if (fertilityBoostDays > 0) activeEvents.push({ icon: '🧪', label: 'Poção de Fertilidade — 2× produção', days: fertilityBoostDays, color: 'bg-pink-800 border-pink-500' });
          if (premiumPricesDays > 0) activeEvents.push({ icon: '🏅', label: 'Selo Premium — +25% preços', days: premiumPricesDays, color: 'bg-amber-800 border-amber-500' });
          if (productionBoostDays > 0) activeEvents.push({ icon: '📚', label: 'Manual Avançado — +15% produção', days: productionBoostDays, color: 'bg-indigo-800 border-indigo-500' });
          if (antiPestDays > 0) activeEvents.push({ icon: '🧴', label: 'Anti-Pragas ativo', days: antiPestDays, color: 'bg-teal-800 border-teal-500' });
          if (activeEvents.length === 0) return null;
          return (
            <div className="mx-4 sm:mx-6 lg:mx-8 mb-0">
              <button
                onClick={() => setShowEventsPanel(p => !p)}
                className="w-full flex items-center gap-2 px-4 py-2 bg-[#022c22] border border-[#fbbf24]/30 rounded-t-xl text-[#fcd57e] text-xs font-mono font-black uppercase tracking-wider hover:bg-[#033a2c] transition-colors"
              >
                <span>⚡ Eventos Ativos ({activeEvents.length})</span>
                <span className="ml-auto">{showEventsPanel ? '▲' : '▼'}</span>
              </button>
              {showEventsPanel && (
                <div className="flex flex-wrap gap-2 px-4 py-3 bg-[#011a15] border border-t-0 border-[#fbbf24]/30 rounded-b-xl">
                  {activeEvents.map((ev, i) => (
                    <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-white text-xs font-mono font-bold ${ev.color}`}>
                      <span>{ev.icon}</span>
                      <span>{ev.label}</span>
                      {ev.days !== undefined && <span className="opacity-70">• {ev.days}d</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* --- VETERINÁRIO VISITANTE --- */}
        {vetVisitActive && (
          <div className="mx-6 mt-3 bg-gradient-to-r from-teal-800 to-emerald-900 border-x-8 border-y-4 border-teal-400 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">💉</span>
              <h3 className="text-teal-100 font-display font-black text-sm uppercase tracking-wider">Veterinário Visitante</h3>
              <span className="text-[10px] text-teal-300 font-mono ml-auto">Disponível hoje apenas!</span>
            </div>
            {animals.filter(a => a.isSick).length === 0 ? (
              <p className="text-teal-200 text-xs font-mono mb-3">✅ Nenhum animal doente no momento. Aproveite os itens preventivos!</p>
            ) : (
              <div className="mb-3">
                <p className="text-teal-200 text-xs font-mono mb-2">🤒 Animais doentes — curar individualmente por 15💰:</p>
                <div className="flex flex-wrap gap-2">
                  {animals.filter(a => a.isSick).map(animal => (
                    <button
                      key={animal.id}
                      onClick={() => {
                        if (gold < 15) { addLog('💰 Moedas insuficientes! Cura custa 15💰.', 'error'); return; }
                        setGold(prev => prev - 15);
                        setAnimals(prev => prev.map(a => a.id === animal.id ? { ...a, isSick: false, sickDays: 0, lowHappinessDays: 0 } : a));
                        addLog(`💉 ${animal.name} foi curado pelo veterinário por 15💰!`, 'success');
                        addFinancialEntry({ day: currentDay, type: 'expense', category: 'custo_diario', description: `💉 Cura veterinária — ${animal.name}`, amount: 15 });
                        triggerAudioResult(() => sfx.playSound('coin'));
                      }}
                      disabled={gold < 15}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-600 disabled:bg-stone-700 disabled:text-stone-400 text-white text-xs font-mono font-bold rounded-xl border-b-2 border-teal-900 transition-all cursor-pointer"
                    >
                      💉 {animal.name} — 15💰 {(animal.sickDays ?? 0) >= 5 ? '⚠️' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {animals.some(a => a.isSick) && (() => {
                const sickCount = animals.filter(a => a.isSick).length;
                const cost = sickCount * 12;
                return (
                  <button
                    onClick={() => {
                      if (gold < cost) { addLog(`💰 Moedas insuficientes! Curar todos custa ${cost}💰.`, 'error'); return; }
                      setGold(prev => prev - cost);
                      setAnimals(prev => prev.map(a => a.isSick ? { ...a, isSick: false, sickDays: 0, lowHappinessDays: 0 } : a));
                      addLog(`💉 ${sickCount} animais curados por ${cost}💰!`, 'success');
                      addFinancialEntry({ day: currentDay, type: 'expense', category: 'custo_diario', description: `💉 Cura veterinária — ${sickCount} animais`, amount: cost });
                      triggerAudioResult(() => sfx.playSound('coin'));
                    }}
                    disabled={gold < cost}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-700 disabled:text-stone-400 text-white text-xs font-mono font-bold rounded-xl border-b-2 border-emerald-900 transition-all cursor-pointer"
                  >
                    🩺 Curar Todos ({cost}💰)
                  </button>
                );
              })()}
              <button
                onClick={() => {
                  if (gold < 25) { addLog('💰 Moedas insuficientes! Vacina custa 25💰.', 'error'); return; }
                  setGold(prev => prev - 25);
                  setEpidemicPrevented(true);
                  addLog('🛡️ Vacina preventiva aplicada! Próxima epidemia será bloqueada.', 'success');
                  addFinancialEntry({ day: currentDay, type: 'expense', category: 'custo_diario', description: '🛡️ Vacina preventiva', amount: 25 });
                  triggerAudioResult(() => sfx.playSound('coin'));
                }}
                disabled={gold < 25}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:bg-stone-700 disabled:text-stone-400 text-white text-xs font-mono font-bold rounded-xl border-b-2 border-blue-900 transition-all cursor-pointer"
              >
                🛡️ Vacina Preventiva — 25💰
              </button>
              <button
                onClick={() => {
                  if (gold < 20) { addLog('💰 Moedas insuficientes! Suplemento custa 20💰.', 'error'); return; }
                  setGold(prev => prev - 20);
                  setAnimals(prev => prev.map(a => ({ ...a, happiness: Math.min(100, a.happiness + 15), stressedDays: 0 })));
                  addLog('🌿 Suplemento de saúde aplicado! +15 felicidade e estresse removido de todos.', 'success');
                  addFinancialEntry({ day: currentDay, type: 'expense', category: 'custo_diario', description: '🌿 Suplemento de saúde', amount: 20 });
                  triggerAudioResult(() => sfx.playSound('coin'));
                }}
                disabled={gold < 20}
                className="px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:bg-stone-700 disabled:text-stone-400 text-white text-xs font-mono font-bold rounded-xl border-b-2 border-green-900 transition-all cursor-pointer"
              >
                🌿 Suplemento Saúde — 20💰
              </button>
            </div>
          </div>
        )}

        {/* --- NEXT DAY EVENT WARNING BANNER --- */}
        {nextDayEvent && ['praga', 'tempestade', 'seca', 'geada', 'predador'].includes(nextDayEvent) && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mb-2 flex items-center gap-2 px-4 py-2.5 bg-red-900/80 border border-red-500 rounded-xl text-red-100 text-xs font-mono font-bold animate-pulse">
            <span className="text-base">
              {nextDayEvent === 'praga' ? '🐀' : nextDayEvent === 'tempestade' ? '⛈️' : nextDayEvent === 'seca' ? '🏜️' : nextDayEvent === 'geada' ? '❄️' : '🐺'}
            </span>
            <span>
              <span className="uppercase font-black">Alerta para amanhã:</span>{' '}
              {nextDayEvent === 'praga' ? 'Pragas! Proteja o celeiro — itens perecíveis em risco.' : nextDayEvent === 'tempestade' ? 'Tempestade se aproximando! Produção pode ser afetada.' : nextDayEvent === 'seca' ? 'Seca prevista! Custo de água vai triplicar por 3 dias.' : nextDayEvent === 'geada' ? 'Geada! Produção de animais pode ser reduzida.' : 'Predador! Animais em perigo — verifique o rebanho.'}
            </span>
          </div>
        )}

        {/* --- MAIN GAMEBODY BENTO LAYOUT --- */}
        <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 bg-transparent">

          {/* --- LEFT HAND SIDE: ACTIVE ANIMALS (8/12 Cols) --- */}
          <AnimalGrid
            animals={animals}
            landLots={landLots}
            showBuyMenu={showBuyMenu}
            setShowBuyMenu={setShowBuyMenu}
            showProfitPanel={showProfitPanel}
            setShowProfitPanel={setShowProfitPanel}
            showRankingModal={showRankingModal}
            setShowRankingModal={setShowRankingModal}
            setShowTutorialModal={setShowTutorialModal}
            exportSave={exportSave}
            importSave={importSave}
            debugMode={debugMode}
            setDebugMode={setDebugMode}
            isGameOver={isGameOver}
            advanceDay={advanceDay}
            isSleeping={isSleeping}
            setIsSleeping={setIsSleeping}
            isSleepingRef={isSleepingRef}
            autoAdvance={autoAdvance}
            setAutoAdvance={setAutoAdvance}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            autoSpeed={autoSpeed}
            setAutoSpeed={setAutoSpeed}
            gold={gold}
            farmLevel={farmLevel}
            getAnimalPurchasePrice={getAnimalPurchasePrice}
            buyAnimal={buyAnimal}
            buyAnimalFilhote={buyAnimalFilhote}
            stats={stats}
            currentDay={currentDay}
            inventory={inventory}
            feedAnimal={feedAnimal}
            collectMilk={collectMilk}
            collectWool={collectWool}
            collectEgg={collectEgg}
            sellOx={sellOx}
            calculateBoiValue={calculateBoiValue}
            animalFilter={animalFilter}
            setAnimalFilter={setAnimalFilter}
            animalSort={animalSort}
            setAnimalSort={setAnimalSort}
            animalSortDir={animalSortDir}
            setAnimalSortDir={setAnimalSortDir}
            animalViewMode={animalViewMode}
            setAnimalViewMode={setAnimalViewMode}
            editingId={editingId}
            setEditingId={setEditingId}
            tempName={tempName}
            setTempName={setTempName}
            licencaCriadouro={licencaCriadouro}
            licencaExotica={licencaExotica}
            reproducaoAtiva={reproducaoAtiva}
            REPRODUCAO_CONFIG={REPRODUCAO_CONFIG}
            collectGoatMilk={collectGoatMilk}
            collectLlamaWool={collectLlamaWool}
            collectDuckEgg={collectDuckEgg}
            collectGooseProduct={collectGooseProduct}
            collectBuffaloMilk={collectBuffaloMilk}
            collectAlpacaWool={collectAlpacaWool}
            collectCoelhoWool={collectCoelhoWool}
            collectRa={collectRa}
            collectAvestruzPena={collectAvestruzPena}
            sellAvestruz={sellAvestruz}
            sellJacare={sellJacare}
            sellAnimal={sellAnimal}
            retireAnimal={retireAnimal}
            getAnimalDailyProfit={getAnimalDailyProfit}
            getTraitInfo={getTraitInfo}
            getLifePhase={getLifePhase}
            getBoiEmoji={getBoiEmoji}
            renderGrowthBadge={renderGrowthBadge}
            setCruzarModal={setCruzarModal}
            saveRename={saveRename}
            startRename={startRename}
            addLog={addLog}
            workers={workers}
            workerTypes={workerTypes}
            triggerAudioResult={triggerAudioResult}
            sfx={sfx}
            initGame={initGame}
          />

          {/* --- RIGHT HAND SIDE: COOPERATIVE WORKSHOP (ATELIÊ) & ACTION LOGS (4/12 Cols) --- */}
          <GameSidebar
            inventory={inventory}
            animals={animals}
            farmLevel={farmLevel}
            gold={gold}
            currentDay={currentDay}
            logs={logs}
            showEmptyItems={showEmptyItems}
            setShowEmptyItems={setShowEmptyItems}
            setLogs={setLogs}
            logsContainerRef={logsContainerRef}
            logsEndRef={logsEndRef}
            worldEvent={worldEvent}
            getPriceTrend={getPriceTrend}
            getActualSellPrice={getActualSellPrice}
            getFreshnessIndicator={getFreshnessIndicator}
            getEstacaoKey={getEstacaoKey}
            getFeedPriceWithModifiers={getFeedPriceWithModifiers}
            buyFeed={buyFeed}
            buyFolhaAmoreira={buyFolhaAmoreira}
            sellProduct={sellProduct}
            craftCheese={craftCheese}
            craftScarf={craftScarf}
            craftMayonese={craftMayonese}
            craftButter={craftButter}
            craftYogurt={craftYogurt}
            triggerAudioResult={triggerAudioResult}
            sfx={sfx}
          />

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
      {showTutorialModal && <TutorialModal onClose={() => { setShowTutorialModal(false); triggerAudioResult(() => sfx.playSound('click')); }} />}

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
      {showAchievementsModal && (
        <AchievementsModal
          unlockedAchievements={unlockedAchievements}
          achievementsList={ACHIEVEMENTS_LIST}
          onClose={() => setShowAchievementsModal(false)}
          triggerAudioResult={triggerAudioResult} sfx={sfx}
        />
      )}

      {/* 🏆 LEVEL UP MODAL */}
      {showLevelUpModal !== null && (
        <LevelUpModal
          level={showLevelUpModal}
          getFarmTitle={getFarmTitle}
          getLevelUpDetails={getLevelUpDetails}
          onClose={() => setShowLevelUpModal(null)}
          setGold={setGold}
          triggerAudioResult={triggerAudioResult} sfx={sfx}
        />
      )}

      {/* 📅 WEEKLY BALANCE SHEET REPORT BOARD */}
      <AnimatePresence>
        {showWeeklyReport && weeklyReportData && (
          <WeeklyReportModal
            currentDay={currentDay}
            weeklyReportData={weeklyReportData}
            workers={workers}
            weeklyTaxPaid={weeklyTaxPaid}
            workerTypes={workerTypes}
            onClose={() => setShowWeeklyReport(false)}
            triggerAudioResult={triggerAudioResult} sfx={sfx}
          />
        )}
      </AnimatePresence>

      {/* 🏭 AUTOMATION / MACHINES MODAL */}
      {showAutomationModal && (
        <AutomationModal
          gold={gold} farmLevel={farmLevel} machines={machines}
          onClose={() => setShowAutomationModal(false)}
          buyMachine={buyMachine} toggleMachine={toggleMachine}
          triggerAudioResult={triggerAudioResult} sfx={sfx}
        />
      )}

      {/* 🧀 QUEIJARIA ARTESANAL MODAL */}
      {showQueijariaModal && (
        <QueijariaModal
          farmLevel={farmLevel}
          inventory={inventory}
          queijosEmMaturacao={queijosEmMaturacao}
          maxPrateleiras={maxPrateleiras}
          atelieTab={atelieTab}
          setAtelieTab={setAtelieTab}
          racaoOrganicaDays={racaoOrganicaDays}
          fertilizanteDays={fertilizanteDays}
          craftActions={{
            craftQueijo, craftBuffaloMozzarella, craftButter, craftYogurt,
            craftQueijoCabra, craftIogurteCabra, craftLeiteCondensado,
            craftQueijoParmesao, craftQueijoSerra,
            craftScarf, craftTapeteLhama, craftCachecolAngora, craftTecidoAlpaca,
            craftFioSeda, craftMantaPremium,
            craftMayonese, craftPatePato, craftOvoDefumado, craftConservaCodorna,
            craftIncubarOvos, craftHidromel, craftRisotoCogumelo, craftConservaPeixe,
            craftMelEnvasado, craftSopaCogumelo,
            craftCremeCosmetico, craftSaboneteNatural, craftRacaoOrganica, craftFertilizante,
            craftAlmofadaPenas, craftColeteCouro, craftBolsaExotica, craftEnfeitePavao, craftKitGourmet,
          }}
          onClose={() => setShowQueijariaModal(false)}
          onOpenMelhorias={() => setShowUpgradesModal(true)}
          triggerAudioResult={triggerAudioResult}
          sfx={sfx}
        />
      )}

      {/* 💰 FINANÇAS MODAL */}
      {showFinancasModal && (
        <FinancasModal
          currentDay={currentDay}
          financialLog={financialLog}
          onClose={() => setShowFinancasModal(false)}
        />
      )}

      {/* 📋 CONTRATOS MODAL */}
      <AnimatePresence>
        {showContractsModal && (
          <ContractsModal contracts={contracts} currentDay={currentDay} onClose={() => setShowContractsModal(false)} />
        )}
      </AnimatePresence>

      {/* 👷 WORKERS MODAL */}
      {showWorkersModal && (
        <WorkersModal
          workers={workers}
          farmLevel={farmLevel}
          animals={animals}
          currentDay={currentDay}
          onClose={() => setShowWorkersModal(false)}
          onFireWorker={fireWorker}
          onHireWorker={hireWorker}
        />
      )}

      {/* 🔧 MELHORIAS MODAL */}
      {showUpgradesModal && (
        <MelhoriasModal
          gold={gold} farmLevel={farmLevel} currentDay={currentDay}
          landLots={landLots} wellLevel={wellLevel} solarLevel={solarLevel}
          irrigationLevel={irrigationLevel} maxPrateleiras={maxPrateleiras}
          insurance={insurance} insuranceTheft={insuranceTheft} insuranceClimate={insuranceClimate}
          hasStable={hasStable} hasSilo={hasSilo} hasFridge={hasFridge} hasTipBox={hasTipBox}
          hasTourism={hasTourism} hasLaboratorio={hasLaboratorio} hasPastagem={hasPastagem}
          hasExportCenter={hasExportCenter} hasAcademia={hasAcademia} licencaExotica={licencaExotica}
          machines={machines} milkerLevel={milkerLevel} shearerLevel={shearerLevel} feederLevel={feederLevel}
          landBiomes={landBiomes} biomeWeeklyIncome={biomeWeeklyIncome}
          loanActive={loanActive} loanAmount={loanAmount} loanInterestRate={loanInterestRate}
          loanWeeksLeft={loanWeeksLeft} loanDaysUntilInterest={loanDaysUntilInterest}
          onClose={() => setShowUpgradesModal(false)}
          setGold={setGold} setLandLots={setLandLots} setWellLevel={setWellLevel}
          setSolarLevel={setSolarLevel} setIrrigationLevel={setIrrigationLevel}
          setMaxPrateleiras={setMaxPrateleiras} setInsurance={setInsurance}
          setInsuranceTheft={setInsuranceTheft} setInsuranceClimate={setInsuranceClimate}
          setHasStable={setHasStable} setHasSilo={setHasSilo} setHasFridge={setHasFridge}
          setHasTipBox={setHasTipBox} setHasTourism={setHasTourism}
          setHasLaboratorio={setHasLaboratorio} setHasPastagem={setHasPastagem}
          setHasExportCenter={setHasExportCenter} setHasAcademia={setHasAcademia}
          setLicencaExotica={setLicencaExotica}
          setMilkerLevel={setMilkerLevel} setShearerLevel={setShearerLevel} setFeederLevel={setFeederLevel}
          setLandBiomes={setLandBiomes}
          setLoanActive={setLoanActive} setLoanAmount={setLoanAmount}
          setLoanInterestRate={setLoanInterestRate} setLoanWeeksLeft={setLoanWeeksLeft}
          setLoanDaysUntilInterest={setLoanDaysUntilInterest}
          addLog={addLog} triggerAudioResult={triggerAudioResult} sfx={sfx}
          checkAndUnlockAchievement={checkAndUnlockAchievement}
        />
      )}

      {/* 📊 COMMODITY MARKET BOARD MODAL */}
      {showMarketModal && (
        <MarketModal
          farmLevel={farmLevel} currentDay={currentDay}
          inventory={inventory} animals={animals}
          activeMarketEvent={activeMarketEvent} worldEvent={worldEvent}
          weeklySales={weeklySales} sellQuantities={sellQuantities} setSellQuantities={setSellQuantities}
          priceHistory={priceHistory} landBiomes={landBiomes}
          marketFns={{
            getDynamicPrice, getTrendIconAndColor, getItemBaseSellPrice,
            getSeasonalityMultiplier, getDynamicTransactionPrice, getPriceForecast,
            getCarneMultiplier, getActualSellPrice, sellProduct,
          }}
          onClose={() => setShowMarketModal(false)}
          onOpenSellAll={() => setShowSellAllConfirmModal(true)}
          triggerAudioResult={triggerAudioResult} sfx={sfx}
        />
      )}

      {/* 💰 VENDA TOTAL */}
      {showSellAllConfirmModal && (
        <SellAllModal
          inventory={inventory}
          getDynamicTransactionPrice={getDynamicTransactionPrice}
          sellAllItemsNoConfirm={sellAllItemsNoConfirm}
          onClose={() => setShowSellAllConfirmModal(false)}
          triggerAudioResult={triggerAudioResult} sfx={sfx}
        />
      )}

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
          <MissionsModal missions={missions} onClose={() => setShowMissionsModal(false)} onClaimMission={handleClaimMission} />
        )}
      </AnimatePresence>

      {/* 📊 STATS / ANALYTICS MODAL */}
      <AnimatePresence>
        {showStatsModal && (
          <StatsModal
            stats={stats}
            allTimeStats={allTimeStats}
            earningsHistory={earningsHistory}
            currentDay={currentDay}
            prestigePoints={prestigePoints}
            onClose={() => setShowStatsModal(false)}
          />
        )}
      </AnimatePresence>

      {/* 🐣 MODAL DE HISTÓRICO DE REPRODUÇÕES */}
      {showReproModal && (
        <ReproducoesModal
          reproHistory={reproHistory}
          onClose={() => setShowReproModal(false)}
        />
      )}

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
      {showRankingModal && (
        <RankingModal
          animals={animals}
          onClose={() => setShowRankingModal(false)}
        />
      )}

      {/* 🤝 MODAL DE CRUZAMENTO */}
      {cruzarModal && (
        <CruzamentoModal
          cruzarModal={cruzarModal}
          animals={animals}
          reproducaoAtiva={reproducaoAtiva}
          reproducaoConfig={REPRODUCAO_CONFIG}
          currentDay={currentDay}
          onClose={() => setCruzarModal(null)}
          onConfirm={(partner) => {
            const cfg = REPRODUCAO_CONFIG[cruzarModal.type];
            if (partner.type !== cruzarModal.type) {
              addLog(`❌ Erro: ${partner.name} é de espécie diferente!`, 'error');
              setCruzarModal(null);
              return;
            }
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
          addLog={addLog}
        />
      )}

      {/* 📋 MODAL OFERTA DE CONTRATO */}
      <AnimatePresence>
        {pendingContractOffer && (
          <PendingContractModal
            offer={pendingContractOffer}
            onAccept={() => {
              setContracts(prev => [...prev, pendingContractOffer!]);
              addLog(`✅ Contrato aceito! Entregue ${pendingContractOffer.quantity} un de ${pendingContractOffer.product} até o dia ${pendingContractOffer.deadline}.`, 'success');
              setPendingContractOffer(null);
            }}
            onReject={() => {
              addLog(`❌ Proposta de contrato recusada.`, 'info');
              setPendingContractOffer(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* 🎪 MODAL RESULTADO DA FEIRA */}
      {showFairResultModal && (
        <FairResultModal
          result={showFairResultModal}
          onClose={() => setShowFairResultModal(null)}
        />
      )}

      {/* 📊 ALL-TIME STATS / RECORDES MODAL */}
      {showAllTimeStats && (
        <AllTimeStatsModal
          stats={stats}
          allTimeStats={allTimeStats}
          currentDay={currentDay}
          onClose={() => setShowAllTimeStats(false)}
        />
      )}

    </div>
  );
}
