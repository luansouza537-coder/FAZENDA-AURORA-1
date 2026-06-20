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

type SeasonKey = 'primavera' | 'verao' | 'outono' | 'inverno';

interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  missionKey: Mission['missionKey'];
  goal: number;
  reward: number;
  minLevel: number;
  sentiment: '😊' | '😤' | '🤔' | '📖';
}

const SEASONAL_WEEKLY_MISSIONS: Record<SeasonKey, MissionTemplate[]> = {
  primavera: [
    {
      id: 'p1',
      title: '😊 Colheita de Primavera',
      description: 'A primavera chegou e com ela a abundância! Colete 15 itens do celeiro nesta semana para aproveitar a safra da estação. Cada grama conta para o crescimento da sua fazenda.',
      missionKey: 'collect_items',
      goal: 15,
      reward: 80,
      minLevel: 1,
      sentiment: '😊',
    },
    {
      id: 'p2',
      title: '😊 Leite Fresco',
      description: 'Com o clima ameno da primavera, as vacas produzem mais. Venda 8 litros de leite nesta semana e mostre que sua fazenda está em pleno vigor. Leiteiros felizes, fazenda próspera!',
      missionKey: 'sell_milk',
      goal: 8,
      reward: 70,
      minLevel: 1,
      sentiment: '😊',
    },
    {
      id: 'p3',
      title: '😊 Animais Contentes',
      description: 'Primavera é tempo de alegria! Mantenha seus animais felizes por 5 dias esta semana. Um rebanho saudável é o alicerce de toda fazenda de sucesso.',
      missionKey: 'happy_animals',
      goal: 5,
      reward: 60,
      minLevel: 1,
      sentiment: '😊',
    },
    {
      id: 'p4',
      title: '😤 Venda Pesada',
      description: 'A feira de primavera está aquecida! Venda 20 itens diferentes esta semana e mostre que sua fazenda é a mais produtiva da região. Não deixe o estoque encalhar!',
      missionKey: 'sell_any',
      goal: 20,
      reward: 150,
      minLevel: 2,
      sentiment: '😤',
    },
    {
      id: 'p5',
      title: '😤 Meta de Ouro',
      description: 'O mercado de primavera está em alta. Acumule 300 moedas nesta semana — combine vendas, contratos e negociações para bater a meta. Cada decisão importa!',
      missionKey: 'earn_gold',
      goal: 300,
      reward: 120,
      minLevel: 2,
      sentiment: '😤',
    },
    {
      id: 'p6',
      title: '🤔 Alimentação Eficiente',
      description: 'Na primavera, o pasto é farto, mas a disciplina alimentar faz a diferença. Alimente seus animais 25 vezes nesta semana. Rotina de alimentação é a base de um rebanho produtivo.',
      missionKey: 'feed_animals',
      goal: 25,
      reward: 100,
      minLevel: 1,
      sentiment: '🤔',
    },
    {
      id: 'p7',
      title: '🤔 Expansão do Rebanho',
      description: 'É hora de expandir! Tenha ao menos 6 animais na fazenda ao final desta semana. Cada novo animal é uma nova fonte de renda e uma peça no seu plano de crescimento.',
      missionKey: 'have_animals',
      goal: 6,
      reward: 110,
      minLevel: 2,
      sentiment: '🤔',
    },
    {
      id: 'p8',
      title: '📖 Lenda da Primavera',
      description: 'A vovó Aurora dizia: "Três dias sem química é o segredo da terra viva." Mantenha 3 dias orgânicos esta semana — sem remédios, sem atalhos. Deixe a natureza guiar sua colheita.',
      missionKey: 'organic_day',
      goal: 3,
      reward: 90,
      minLevel: 1,
      sentiment: '📖',
    },
    {
      id: 'p9',
      title: '📖 O Primeiro Queijo',
      description: 'Certa primavera, o ancião Mateus ensinou a arte do queijo artesanal à jovem Aurora. Venda 2 queijos nesta semana e mantenha viva essa tradição que atravessa gerações na fazenda.',
      missionKey: 'sell_cheese',
      goal: 2,
      reward: 100,
      minLevel: 5,
      sentiment: '📖',
    },
    {
      id: 'p10',
      title: '📖 Estação dos Patos',
      description: 'Os patos chegaram ao lago da fazenda na primavera! Desde então, cada estação de flores traz novas oportunidades. Venda 12 itens esta semana e honre a tradição da abundância de primavera.',
      missionKey: 'sell_any',
      goal: 12,
      reward: 85,
      minLevel: 3,
      sentiment: '📖',
    },
  ],

  verao: [
    {
      id: 'v1',
      title: '😊 Sol e Seda',
      description: 'O calor do verão é perfeito para os bichos-seda! Colete 3 unidades de seda bruta nesta semana. A fazenda Aurora é conhecida pela qualidade excepcional da sua seda artesanal.',
      missionKey: 'collect_silk',
      goal: 3,
      reward: 130,
      minLevel: 10,
      sentiment: '😊',
    },
    {
      id: 'v2',
      title: '😊 Rebanho de Verão',
      description: 'O calor pede atenção especial! Mantenha seus animais felizes por 5 dias nesta semana de verão. Sombra, água fresca e carinho — é tudo que eles precisam para prosperar no calor.',
      missionKey: 'happy_animals',
      goal: 5,
      reward: 70,
      minLevel: 1,
      sentiment: '😊',
    },
    {
      id: 'v3',
      title: '😊 Leite de Verão',
      description: 'Com o sol forte do verão, a produção de leite pode variar. Venda 10 litros esta semana e mostre que sua fazenda mantém qualidade em qualquer estação. Consistência é tudo!',
      missionKey: 'sell_milk',
      goal: 10,
      reward: 90,
      minLevel: 1,
      sentiment: '😊',
    },
    {
      id: 'v4',
      title: '😤 Caça ao Exótico',
      description: 'O verão atrai colecionadores de itens raros! Venda 3 produtos exóticos — seda, mel especial ou outro item raro — nesta semana. Esses compradores pagam bem, mas são exigentes!',
      missionKey: 'sell_exotic',
      goal: 3,
      reward: 200,
      minLevel: 10,
      sentiment: '😤',
    },
    {
      id: 'v5',
      title: '😤 Grande Colheita de Verão',
      description: 'A safra de verão é a mais abundante do ano! Colete 30 itens nesta semana e encha o celeiro até a última prateleira. Uma colheita generosa garante o inverno tranquilo.',
      missionKey: 'collect_items',
      goal: 30,
      reward: 180,
      minLevel: 2,
      sentiment: '😤',
    },
    {
      id: 'v6',
      title: '🤔 Muco Precioso',
      description: 'O muco de caracol vale ouro no mercado de cosméticos! Venda 2 produtos exóticos nesta semana aproveitando seus caracóis. Quem investe nos animais certos colhe recompensas surpreendentes.',
      missionKey: 'sell_exotic',
      goal: 2,
      reward: 160,
      minLevel: 7,
      sentiment: '🤔',
    },
    {
      id: 'v7',
      title: '🤔 Leite em Dobro',
      description: 'Dobrar a produção de leite exige planejamento! Alimente bem as vacas, mantenha-as felizes e venda 12 litros nesta semana. Uma fazenda organizada é uma fazenda lucrativa.',
      missionKey: 'sell_milk',
      goal: 12,
      reward: 140,
      minLevel: 3,
      sentiment: '🤔',
    },
    {
      id: 'v8',
      title: '📖 O Verão de Aurora',
      description: 'Naquele verão de 1987, Aurora fez sua primeira grande venda e comprou mais três vacas. Acumule 400 moedas nesta semana e repita o feito histórico que fundou o legado da fazenda.',
      missionKey: 'earn_gold',
      goal: 400,
      reward: 160,
      minLevel: 3,
      sentiment: '📖',
    },
    {
      id: 'v9',
      title: '📖 Feira dos Artesãos',
      description: 'Toda última semana de verão, os artesãos da região se reúnem para trocar receitas de queijo. Venda 4 queijos nesta semana e represente com orgulho a tradição queijeira da Fazenda Aurora.',
      missionKey: 'sell_cheese',
      goal: 4,
      reward: 150,
      minLevel: 5,
      sentiment: '📖',
    },
    {
      id: 'v10',
      title: '📖 Manada Crescente',
      description: 'O velho livro de Aurora registra: "No verão que tivemos 10 animais, a fazenda finalmente falou por si." Tenha ao menos 10 animais nesta semana e escreva um novo capítulo nessa história.',
      missionKey: 'have_animals',
      goal: 10,
      reward: 170,
      minLevel: 4,
      sentiment: '📖',
    },
  ],

  outono: [
    {
      id: 'o1',
      title: '😊 Colheita de Outono',
      description: 'As folhas caem e os frutos amadurecem! Colete 20 itens nesta semana de outono. É a estação da fartura e da preparação — cada item recolhido é reserva para os dias frios que se aproximam.',
      missionKey: 'collect_items',
      goal: 20,
      reward: 90,
      minLevel: 1,
      sentiment: '😊',
    },
    {
      id: 'o2',
      title: '😊 Lã Quentinha',
      description: 'O outono pede lã! Com a chegada do frio, a lã das ovelhas e alpacas se torna ouro. Venda 4 unidades de lã nesta semana e atenda à demanda crescente por tecidos quentinhos.',
      missionKey: 'sell_wool',
      goal: 4,
      reward: 85,
      minLevel: 3,
      sentiment: '😊',
    },
    {
      id: 'o3',
      title: '😊 Animais Aconchegantes',
      description: 'O vento frio começa a soprar! Cuide bem dos seus animais por 5 dias nesta semana de outono. Abrigo adequado e alimentação caprichada são o mínimo que eles merecem nessa transição.',
      missionKey: 'happy_animals',
      goal: 5,
      reward: 70,
      minLevel: 1,
      sentiment: '😊',
    },
    {
      id: 'o4',
      title: '😤 Queijo de Estação',
      description: 'O outono é a melhor estação para queijos curados! Venda 5 queijos nesta semana e aproveite o pico de demanda sazonal. Os melhores queijeiros do vale já estão com os tachos aquecidos!',
      missionKey: 'sell_cheese',
      goal: 5,
      reward: 180,
      minLevel: 5,
      sentiment: '😤',
    },
    {
      id: 'o5',
      title: '😤 Lucro de Outono',
      description: 'As feiras de outono movimentam muito dinheiro! Acumule 350 moedas nesta semana combinando vendas, contratos e produtos de alto valor. É agora ou nunca antes do inverno!',
      missionKey: 'earn_gold',
      goal: 350,
      reward: 160,
      minLevel: 2,
      sentiment: '😤',
    },
    {
      id: 'o6',
      title: '🤔 Seda de Outono',
      description: 'Os bichos-seda produzem mais no outono quando as temperaturas caem levemente. Colete 4 unidades de seda nesta semana e prepare o estoque antes que o inverno interrompa a produção.',
      missionKey: 'collect_silk',
      goal: 4,
      reward: 190,
      minLevel: 10,
      sentiment: '🤔',
    },
    {
      id: 'o7',
      title: '🤔 Mestre Queijeiro',
      description: 'Ser mestre queijeiro exige disciplina e técnica. Venda 5 queijos artesanais nesta semana e prove que domina essa arte milenar. Cada peça vendida é um atestado da qualidade da sua fazenda.',
      missionKey: 'sell_cheese',
      goal: 5,
      reward: 170,
      minLevel: 5,
      sentiment: '🤔',
    },
    {
      id: 'o8',
      title: '📖 A Colheita de Mateus',
      description: 'O velho Mateus sempre dizia que uma boa colheita de outono garante o sorriso no inverno. Venda 25 itens nesta semana — diversifique, negocie, e honre a sabedoria do ancião da fazenda.',
      missionKey: 'sell_any',
      goal: 25,
      reward: 140,
      minLevel: 2,
      sentiment: '📖',
    },
    {
      id: 'o9',
      title: '📖 Receita da Vovó',
      description: 'A vovó Aurora guardava a sete chaves sua receita de queijo de outono. Venda 3 queijos nesta semana e lembre que cada fatia carrega décadas de tradição e amor dedicado à arte queijeira.',
      missionKey: 'sell_cheese',
      goal: 3,
      reward: 120,
      minLevel: 5,
      sentiment: '📖',
    },
    {
      id: 'o10',
      title: '📖 Rebanho de Inverno',
      description: 'Antes do inverno chegar, Aurora sempre contava seus animais três vezes. Tenha ao menos 8 animais na fazenda ao final desta semana de outono. Um rebanho forte é abrigo contra qualquer tempestade.',
      missionKey: 'have_animals',
      goal: 8,
      reward: 130,
      minLevel: 3,
      sentiment: '📖',
    },
  ],

  inverno: [
    {
      id: 'i1',
      title: '😊 Alimentação de Inverno',
      description: 'No inverno, os animais precisam de mais alimento para se aquecer. Alimente seus animais 30 vezes nesta semana — o frio aumenta o apetite e a necessidade de cuidado do rebanho.',
      missionKey: 'feed_animals',
      goal: 30,
      reward: 100,
      minLevel: 1,
      sentiment: '😊',
    },
    {
      id: 'i2',
      title: '😊 Lã do Inverno',
      description: 'A lã é o ouro do inverno! Com o frio intenso, todos querem cobertores e agasalhos. Venda 6 unidades de lã nesta semana e atenda à maior demanda da estação mais fria do ano.',
      missionKey: 'sell_wool',
      goal: 6,
      reward: 110,
      minLevel: 3,
      sentiment: '😊',
    },
    {
      id: 'i3',
      title: '😊 Animais Aquecidos',
      description: 'O inverno rigoroso testa a dedicação do fazendeiro! Mantenha seus animais felizes por 5 dias nesta semana. Fogo na lareira, feno seco no cocho — os detalhes que fazem toda a diferença.',
      missionKey: 'happy_animals',
      goal: 5,
      reward: 80,
      minLevel: 1,
      sentiment: '😊',
    },
    {
      id: 'i4',
      title: '😤 Meta de Ferro',
      description: 'O inverno é duro, mas os preços estão em alta! Acumule 500 moedas nesta semana — use contratos premium, venda itens raros e maximize cada oportunidade. Só os fortes chegam ao topo!',
      missionKey: 'earn_gold',
      goal: 500,
      reward: 220,
      minLevel: 4,
      sentiment: '😤',
    },
    {
      id: 'i5',
      title: '😤 Seda Rara',
      description: 'Seda de inverno é a mais rara e valorizada! Colete 5 unidades de seda bruta nesta semana difícil. Os bichos-seda precisam de cuidado extra no frio, mas a recompensa é incomparável.',
      missionKey: 'collect_silk',
      goal: 5,
      reward: 230,
      minLevel: 10,
      sentiment: '😤',
    },
    {
      id: 'i6',
      title: '🤔 Húmus no Frio',
      description: 'As minhocas continuam trabalhando mesmo no inverno! Venda 2 produtos exóticos nesta semana — húmus orgânico é especialmente valorizado pelos agricultores que preparam a terra para a primavera.',
      missionKey: 'sell_exotic',
      goal: 2,
      reward: 170,
      minLevel: 6,
      sentiment: '🤔',
    },
    {
      id: 'i7',
      title: '🤔 Renda no Frio',
      description: 'Manter a renda no inverno exige planejamento e diversificação. Acumule 400 moedas nesta semana usando todas as fontes disponíveis — contratos, vendas, lã e queijo. A fazenda não para!',
      missionKey: 'earn_gold',
      goal: 400,
      reward: 180,
      minLevel: 3,
      sentiment: '🤔',
    },
    {
      id: 'i8',
      title: '📖 Estoque de Inverno',
      description: 'Aurora sempre estocava lã antes do inverno profundo — era sua estratégia para os dias sem feira. Venda 10 unidades de lã nesta semana e prove que planejamento é o maior talento de um fazendeiro.',
      missionKey: 'sell_wool',
      goal: 10,
      reward: 200,
      minLevel: 4,
      sentiment: '📖',
    },
    {
      id: 'i9',
      title: '📖 A Noite mais Longa',
      description: 'Na noite mais longa do inverno, Aurora ficou acordada alimentando cada animal um por um. Alimente seus animais 35 vezes nesta semana e reviva a dedicação que fez desta fazenda uma lenda.',
      missionKey: 'feed_animals',
      goal: 35,
      reward: 160,
      minLevel: 2,
      sentiment: '📖',
    },
    {
      id: 'i10',
      title: '📖 Rebanho Forte',
      description: 'O velho provérbio da fazenda diz: "Animal feliz no inverno é animal que chega na primavera." Mantenha seus animais felizes por 6 dias nesta semana e mostre que cuida do seu rebanho como Aurora cuidava.',
      missionKey: 'happy_animals',
      goal: 6,
      reward: 190,
      minLevel: 4,
      sentiment: '📖',
    },
  ],
};

function getSeasonKey(day: number): SeasonKey {
  const idx = Math.floor(((day - 1) % 120) / 30);
  const keys: SeasonKey[] = ['primavera', 'verao', 'outono', 'inverno'];
  return keys[idx];
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function useMissions({ animals: _animals, farmLevel, inventory: _inventory }: UseMissionsProps) {
  const generateDailyMissions = (_day: number): Mission[] => {
    return [];
  };

  const generateWeeklyMissions = (day: number): Mission[] => {
    const season = getSeasonKey(day);
    const pool = SEASONAL_WEEKLY_MISSIONS[season].filter(m => farmLevel >= m.minLevel);

    if (pool.length === 0) return [];

    // Use week number as seed so missions stay stable within the same week
    const weekNumber = Math.floor((day - 1) / 7);
    const rand = seededRandom(weekNumber * 31 + ['primavera', 'verao', 'outono', 'inverno'].indexOf(season));

    const shuffled = [...pool].sort(() => rand() - 0.5);
    const picked = shuffled.slice(0, Math.min(3, shuffled.length));

    const expiresOnDay = day + (7 - ((day - 1) % 7));

    return picked.map(template => ({
      id: `weekly_${template.id}_w${weekNumber}`,
      title: template.title,
      description: template.description,
      type: 'weekly' as const,
      missionKey: template.missionKey,
      goal: template.goal,
      current: 0,
      reward: template.reward,
      expiresOnDay,
      completed: false,
      claimed: false,
    }));
  };

  const generateEpicMissions = (_day: number): Mission[] => {
    return [];
  };

  return { generateDailyMissions, generateWeeklyMissions, generateEpicMissions };
}
