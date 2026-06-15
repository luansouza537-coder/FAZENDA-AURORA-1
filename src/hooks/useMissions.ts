/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Animal } from '../types';
import { InventoryState } from './useAnimals';

export interface Mission {
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

export interface UseMissionsProps {
  animals: Animal[];
  farmLevel: number;
  inventory: InventoryState;
}

export function useMissions({ animals, farmLevel, inventory: _inventory }: UseMissionsProps) {
  const generateDailyMissions = (day: number): Mission[] => {
    const animalTypes = new Set(animals.map(a => a.type));
    const hasEggBirds = ['galinha','pato','codorna','ganso','pavao','avestruz'].some(t => animalTypes.has(t as any));
    const hasMilkAnimals = ['vaca','cabra','bufalo'].some(t => animalTypes.has(t as any));
    const hasWoolAnimals = ['ovelha','lhama','alpaca','coelho_angora'].some(t => animalTypes.has(t as any));
    const hasOrganicAnimals = ['minhoca','caracol'].some(t => animalTypes.has(t as any));
    const hasSilkworm = animalTypes.has('bicho_seda');
    const hasExotic = ['caracol','jacare','bicho_seda','avestruz'].some(t => animalTypes.has(t as any));

    // Pool A: produção — filtra por animais que o jogador realmente tem
    const poolA = [
      { id: `daily_collect_${day}`, title: 'Colheita do Dia',     description: 'Colete 4 itens quaisquer (leite, lã ou ovos)',            missionKey: 'collect_items' as const, goal: 4,  reward: 6  },
      ...(hasMilkAnimals  ? [{ id: `daily_milk_${day}`,    title: 'Leiteiro do Dia',     description: 'Colete leite de qualquer vaca, cabra ou búfala',         missionKey: 'collect_items' as const, goal: 2,  reward: 5  }] : []),
      ...(hasEggBirds     ? [{ id: `daily_egg_${day}`,     title: 'Coleta de Ovos',      description: 'Colete ovos de qualquer ave hoje',                        missionKey: 'collect_items' as const, goal: 3,  reward: 5  }] : []),
      ...(hasWoolAnimals  ? [{ id: `daily_wool_${day}`,    title: 'Dia de Tosquia',      description: 'Colete lã de qualquer animal hoje',                       missionKey: 'collect_items' as const, goal: 1,  reward: 5  }] : []),
      ...(hasOrganicAnimals ? [{ id: `daily_organic_${day}`, title: 'Produção Orgânica', description: 'Colete húmus ou muco hoje',                               missionKey: 'organic_day'   as const, goal: 1,  reward: 6  }] : []),
    ];
    // Pool B: vendas — filtra por animais disponíveis
    const poolB = [
      { id: `daily_sell_${day}`,    title: 'Vendedor do Dia',     description: 'Venda pelo menos 3 itens do Armazém hoje',               missionKey: 'sell_milk'     as const, goal: 3,  reward: 6  },
      { id: `daily_schs_${day}`,    title: 'Queijo no Balcão',    description: 'Venda 1 queijo de qualquer tipo hoje',                   missionKey: 'sell_cheese'   as const, goal: 1,  reward: 8  },
      ...(hasMilkAnimals  ? [{ id: `daily_smilk_${day}`,   title: 'Venda de Leite',      description: 'Venda 4 litros de leite hoje',                           missionKey: 'sell_milk'     as const, goal: 4,  reward: 7  }] : []),
      ...(hasWoolAnimals  ? [{ id: `daily_swool_${day}`,   title: 'Venda de Lã',         description: 'Venda 2 unidades de lã hoje',                            missionKey: 'sell_wool'     as const, goal: 2,  reward: 6  }] : []),
      ...(hasEggBirds     ? [{ id: `daily_segg_${day}`,    title: 'Mercado de Ovos',     description: 'Venda 4 ovos (qualquer tipo) hoje',                      missionKey: 'sell_milk'     as const, goal: 4,  reward: 6  }] : []),
    ];
    // Pool C: cuidados (sempre disponível)
    const poolC = [
      { id: `daily_happy_${day}`,   title: 'Fazenda Feliz',       description: 'Todos os animais com felicidade > 70% hoje',             missionKey: 'happy_animals' as const, goal: 1,  reward: 7  },
      { id: `daily_feed_${day}`,    title: 'Hora da Ração',       description: 'Alimente pelo menos 2 animais manualmente hoje',         missionKey: 'feed_animals'  as const, goal: 2,  reward: 5  },
      { id: `daily_nosick_${day}`,  title: 'Rebanho Saudável',    description: 'Termine o dia sem nenhum animal doente',                 missionKey: 'happy_animals' as const, goal: 1,  reward: 6  },
    ];
    // Pool D: bônus difícil — filtra por animais disponíveis
    const poolD = [
      { id: `daily_cheese2_${day}`, title: 'Queijaria Ativa',     description: 'Inicie a maturação de 1 queijo na Queijaria hoje',       missionKey: 'sell_cheese'   as const, goal: 1,  reward: 10 },
      { id: `daily_contract_${day}`,title: 'Entrega do Dia',      description: 'Entregue itens a qualquer contrato ativo hoje',          missionKey: 'sell_milk'     as const, goal: 1,  reward: 14 },
      ...(hasSilkworm ? [{ id: `daily_silk_${day}`,    title: 'Coleta de Seda',      description: 'Colete seda bruta do bicho-da-seda hoje',                missionKey: 'collect_silk'  as const, goal: 1,  reward: 12 }] : []),
      ...(hasExotic   ? [{ id: `daily_exotic_${day}`,  title: 'Produto Exótico',     description: 'Venda 1 produto exótico (muco, couro ou seda)',          missionKey: 'sell_exotic'   as const, goal: 1,  reward: 12 }] : []),
    ];

    const pick = <T,>(pool: T[]) => pool[Math.floor(Math.random() * pool.length)];
    const toMission = (m: typeof poolA[0]): Mission => ({
      ...m, type: 'daily' as const, current: 0, expiresOnDay: day + 1, completed: false, claimed: false,
    });

    return [pick(poolA), pick(poolB), pick(poolC), pick(poolD)].map(toMission);
  };

  const generateWeeklyMissions = (day: number): Mission[] => {
    const animalTypes = new Set(animals.map(a => a.type));
    const hasMilkAnimals = ['vaca','cabra','bufalo'].some(t => animalTypes.has(t as any));
    const hasWoolAnimals = ['ovelha','lhama','alpaca','coelho_angora'].some(t => animalTypes.has(t as any));
    const hasEggBirds   = ['galinha','pato','codorna','ganso','pavao','avestruz'].some(t => animalTypes.has(t as any));
    const hasOrganicAnimals = ['minhoca','caracol'].some(t => animalTypes.has(t as any));

    type PoolEntry = Omit<Mission, 'id'|'type'|'current'|'expiresOnDay'|'completed'|'claimed'>;
    // Always available from level 1
    const basePool: PoolEntry[] = [
      { title: 'Produção Semanal',   description: 'Colete 20 itens quaisquer esta semana',          missionKey: 'collect_items' as const, goal: 20,  reward: 18 },
      { title: 'Mercado da Semana',  description: 'Venda pelo menos 10 itens esta semana',           missionKey: 'sell_milk'     as const, goal: 10,  reward: 16 },
      { title: 'Rebanho Alimentado', description: 'Alimente animais 12 vezes esta semana',           missionKey: 'feed_animals'  as const, goal: 12,  reward: 16 },
      { title: 'Animais Felizes',    description: 'Mantenha todos os animais felizes (>70%) por 3 dias', missionKey: 'happy_animals' as const, goal: 3, reward: 18 },
      { title: 'Renda Semanal',      description: 'Ganhe 80 moedas em vendas esta semana',           missionKey: 'earn_gold'     as const, goal: 80,  reward: 16 },
    ];
    // Level 2+ (unlocked with ovelha/more animals)
    const mid1Pool: PoolEntry[] = [
      ...(hasMilkAnimals  ? [{ title: 'Semana Leiteira', description: 'Venda 10 litros de leite esta semana',         missionKey: 'sell_milk'  as const, goal: 10, reward: 20 } as PoolEntry] : []),
      ...(hasWoolAnimals  ? [{ title: 'Semana da Lã',    description: 'Venda 6 unidades de lã esta semana',           missionKey: 'sell_wool'  as const, goal: 6,  reward: 18 } as PoolEntry] : []),
      ...(hasEggBirds     ? [{ title: 'Ovos da Semana',  description: 'Venda 15 ovos (qualquer tipo) esta semana',    missionKey: 'sell_milk'  as const, goal: 15, reward: 18 } as PoolEntry] : []),
      { title: 'Renda Crescente',    description: 'Ganhe 150 moedas em vendas esta semana',          missionKey: 'earn_gold'     as const, goal: 150, reward: 22 },
    ];
    // Level 3+ (queijaria)
    const mid2Pool: PoolEntry[] = [
      { title: 'Queijos da Semana',  description: 'Produza ou venda 3 queijos esta semana',          missionKey: 'sell_cheese'   as const, goal: 3,   reward: 24 },
      { title: 'Animais Felizes+',   description: 'Mantenha todos com felicidade >70% por 5 dias',   missionKey: 'happy_animals' as const, goal: 5,   reward: 22 },
    ];
    // Level 5+ (exotic/organic)
    const advPool: PoolEntry[] = [
      ...(hasOrganicAnimals ? [{ title: 'Semana Orgânica', description: 'Colete húmus ou muco 4 vezes esta semana', missionKey: 'organic_day' as const, goal: 4, reward: 20 } as PoolEntry] : []),
      { title: 'Grande Mercado',     description: 'Venda pelo menos 25 itens esta semana',           missionKey: 'sell_milk'     as const, goal: 25,  reward: 24 },
    ];

    let pool = [...basePool];
    if (farmLevel >= 2) pool = [...pool, ...mid1Pool];
    if (farmLevel >= 3) pool = [...pool, ...mid2Pool];
    if (farmLevel >= 5) pool = [...pool, ...advPool];

    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
    return shuffled.map((m, i) => ({
      ...m, id: `weekly_${i}_${day}`, type: 'weekly' as const, current: 0,
      expiresOnDay: day + 7, completed: false, claimed: false,
    }));
  };

  const generateEpicMissions = (day: number): Mission[] => {
    const animalTypes = new Set(animals.map(a => a.type));
    const hasMilkAnimals = ['vaca','cabra','bufalo'].some(t => animalTypes.has(t as any));
    const hasWoolAnimals = ['ovelha','lhama','alpaca','coelho_angora'].some(t => animalTypes.has(t as any));
    const hasEggBirds   = ['galinha','pato','codorna','ganso','avestruz'].some(t => animalTypes.has(t as any));

    const all = [
      // Always available
      {
        id: `epic_gold_${day}`, title: '💰 Poupança Rural',
        description: farmLevel <= 2 ? 'Acumule 500 moedas' : 'Acumule 2.000 moedas em 60 dias',
        type: 'epic' as const, goal: farmLevel <= 2 ? 500 : 2000, current: 0,
        reward: farmLevel <= 2 ? 80 : 250, expiresOnDay: day + 60, completed: false, claimed: false,
        missionKey: 'earn_gold' as const, minLevel: 1,
      },
      {
        id: `epic_feed_${day}`, title: '🌾 Cuidador Dedicado',
        description: 'Alimente animais 40 vezes nos próximos 30 dias',
        type: 'epic' as const, goal: 40, current: 0,
        reward: 80, expiresOnDay: day + 30, completed: false, claimed: false,
        missionKey: 'feed_animals' as const, minLevel: 1,
      },
      {
        id: `epic_happy_${day}`, title: '😊 Fazenda Exemplar',
        description: 'Mantenha todos os animais felizes (>70%) por 10 dias seguidos',
        type: 'epic' as const, goal: 10, current: 0,
        reward: 180, expiresOnDay: day + 45, completed: false, claimed: false,
        missionKey: 'happy_animals' as const, minLevel: 1,
      },
      // Level 2+ with milk animals
      ...(farmLevel >= 2 && hasMilkAnimals ? [{
        id: `epic_milk_${day}`, title: '🥛 Leiteria em Marcha',
        description: 'Venda 60 litros de leite nos próximos 30 dias',
        type: 'epic' as const, goal: 60, current: 0,
        reward: 120, expiresOnDay: day + 30, completed: false, claimed: false,
        missionKey: 'sell_milk' as const, minLevel: 2,
      }] : []),
      // Level 2+ with egg birds
      ...(farmLevel >= 2 && hasEggBirds ? [{
        id: `epic_egg_${day}`, title: '🥚 Galinheiro Produtivo',
        description: 'Venda 50 ovos (qualquer tipo) em 30 dias',
        type: 'epic' as const, goal: 50, current: 0,
        reward: 90, expiresOnDay: day + 30, completed: false, claimed: false,
        missionKey: 'sell_milk' as const, minLevel: 2,
      }] : []),
      // Level 2+ with wool animals
      ...(farmLevel >= 2 && hasWoolAnimals ? [{
        id: `epic_wool_${day}`, title: '🧶 Fio a Fio',
        description: 'Venda 40 unidades de lã ou têxteis em 45 dias',
        type: 'epic' as const, goal: 40, current: 0,
        reward: 100, expiresOnDay: day + 45, completed: false, claimed: false,
        missionKey: 'sell_wool' as const, minLevel: 2,
      }] : []),
      // Level 3+ (queijaria)
      ...(farmLevel >= 3 ? [{
        id: `epic_cheese_${day}`, title: '🧀 Queijaria da Aurora',
        description: 'Produza 10 queijos de qualquer tipo em 45 dias',
        type: 'epic' as const, goal: 10, current: 0,
        reward: 150, expiresOnDay: day + 45, completed: false, claimed: false,
        missionKey: 'sell_cheese' as const, minLevel: 3,
      }] : []),
      // Level 4+ (bigger herd)
      ...(farmLevel >= 4 ? [{
        id: `epic_animals_${day}`, title: '🐄 Rebanho Próspero',
        description: 'Tenha 10 animais adultos ao mesmo tempo',
        type: 'epic' as const, goal: 10, current: 0,
        reward: 200, expiresOnDay: day + 60, completed: false, claimed: false,
        missionKey: 'have_animals' as const, minLevel: 4,
      }] : []),
    ];

    // Strip the minLevel helper field before returning
    return all.map(({ minLevel: _ml, ...m }) => m);
  };

  return { generateDailyMissions, generateWeeklyMissions, generateEpicMissions };
}
