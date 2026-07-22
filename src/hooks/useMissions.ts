/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Animal, Mission } from '../types';
import { InventoryState } from './useAnimals';

export type { Mission };

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
  sentiment: string; // emoji livre — as missões sazonais usam vários
}

const SEASONAL_WEEKLY_MISSIONS: Record<SeasonKey, MissionTemplate[]> = {
  primavera: [
    {
      id: 'p_fish',
      title: '🎣 Águas que Acordam',
      description: 'A água esquentou e as tilápias voltaram a crescer depressa. Pesque 5 nesta semana — o tanque agradece o movimento.',
      missionKey: 'collect_fish',
      goal: 5,
      reward: 110,
      minLevel: 12,
      sentiment: '🎣',
    },
    {
      id: 'p_caip',
      title: '🥚 Ninhada Dourada',
      description: 'Galinha caipira feliz na primavera é ovo de gema alaranjada. Colete 4 ovos caipiras — o Empório da Vila vive perguntando por eles.',
      missionKey: 'collect_caipira',
      goal: 4,
      reward: 100,
      minLevel: 4,
      sentiment: '🥚',
    },
    {
      id: 'p_jers',
      title: '🐄 Rota do Leite Premium',
      description: 'A Jersey está no auge com o pasto verde. Ordenhe-a 5 vezes nesta semana — leite gordo assim não fica parado na prateleira.',
      missionKey: 'collect_jersey',
      goal: 5,
      reward: 110,
      minLevel: 15,
      sentiment: '🐄',
    },
    {
      id: 'p_craft',
      title: '🍳 Cozinha de Primavera',
      description: 'A estação pede sabores frescos! Fabrique 3 produtos no Ateliê ou na Cozinha nesta semana — queijos, bolos, defumados, o que sua fazenda produzir de melhor.',
      missionKey: 'craft_items',
      goal: 3,
      reward: 110,
      minLevel: 3,
      sentiment: '🍳',
    },
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
      reward: 60,
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
      id: 'v_feed2',
      title: '🌾 Calor Exige Cuidado',
      description: 'O sol forte castiga o rebanho. Alimente seus animais 25 vezes nesta semana — no verão, quem descuida do cocho perde produção.',
      missionKey: 'feed_animals',
      goal: 25,
      reward: 90,
      minLevel: 2,
      sentiment: '🌾',
    },
    {
      id: 'v_sella',
      title: '🧺 Feirão de Verão',
      description: 'O maior movimento do ano! Venda 20 itens de qualquer tipo nesta semana e aproveite a multidão — banca vazia não vende.',
      missionKey: 'sell_any',
      goal: 20,
      reward: 110,
      minLevel: 3,
      sentiment: '🧺',
    },
    {
      id: 'v_fish',
      title: '🎣 Pesca de Verão',
      description: 'Água quente é festa para as tilápias: ciclo de 3 dias! Pesque 6 nesta semana — é a melhor estação do tanque, não desperdice.',
      missionKey: 'collect_fish',
      goal: 6,
      reward: 130,
      minLevel: 12,
      sentiment: '🎣',
    },
    {
      id: 'v_caip',
      title: '🥚 Caipira Resistente',
      description: 'Mesmo no calor, a caipira bem cuidada não falha. Colete 4 ovos caipiras — felicidade alta é o segredo, capriche na sombra e na ração.',
      missionKey: 'collect_caipira',
      goal: 4,
      reward: 105,
      minLevel: 4,
      sentiment: '🥚',
    },
    {
      id: 'v_jers',
      title: '🐄 Jersey à Sombra',
      description: 'A Jersey sente o calor, mas o leite gordo dela vale cada cuidado. Ordenhe-a 5 vezes nesta semana.',
      missionKey: 'collect_jersey',
      goal: 5,
      reward: 115,
      minLevel: 15,
      sentiment: '🐄',
    },
    {
      id: 'v_craft',
      title: '🍳 Sabores de Verão',
      description: 'O calor traz visitantes famintos! Fabrique 3 produtos artesanais nesta semana e mostre o que a cozinha da fazenda sabe fazer.',
      missionKey: 'craft_items',
      goal: 3,
      reward: 110,
      minLevel: 3,
      sentiment: '🍳',
    },
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
      reward: 80,
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
      id: 'o_milk2',
      title: '🥛 Estoque de Outono',
      description: 'As queijarias estocam para o inverno e pagam em dia. Venda 10 leites nesta semana antes que a estação vire.',
      missionKey: 'sell_milk',
      goal: 10,
      reward: 90,
      minLevel: 2,
      sentiment: '🥛',
    },
    {
      id: 'o_feed2',
      title: '🌾 Engorda de Outono',
      description: 'Todo criador sabe: animal entra gordo no inverno ou sofre. Alimente 25 vezes nesta semana e prepare o rebanho para o frio.',
      missionKey: 'feed_animals',
      goal: 25,
      reward: 95,
      minLevel: 2,
      sentiment: '🌾',
    },
    {
      id: 'o_fish',
      title: '🎣 Última Safra do Tanque',
      description: 'A água começa a esfriar e o ciclo estica. Pesque 4 tilápias nesta semana, antes que o inverno deixe tudo mais lento.',
      missionKey: 'collect_fish',
      goal: 4,
      reward: 100,
      minLevel: 12,
      sentiment: '🎣',
    },
    {
      id: 'o_caip',
      title: '🥚 Reserva da Caipira',
      description: 'Ovo caipira no outono é encomenda certa das confeitarias. Colete 4 nesta semana — o Bolo Caipira não se faz sozinho.',
      missionKey: 'collect_caipira',
      goal: 4,
      reward: 105,
      minLevel: 4,
      sentiment: '🥚',
    },
    {
      id: 'o_jers',
      title: '🐄 Creme de Outono',
      description: 'É a época da manteiga e do doce de leite. Ordenhe a Jersey 5 vezes — a cozinha inteira depende desse leite.',
      missionKey: 'collect_jersey',
      goal: 5,
      reward: 115,
      minLevel: 15,
      sentiment: '🐄',
    },
    {
      id: 'o_live',
      title: '🥩 Venda Antes do Frio',
      description: 'Engordar no inverno custa caro — pecuarista esperto vende no outono. Venda 2 animais de corte (frango, boi ou Angus) nesta semana.',
      missionKey: 'sell_livestock',
      goal: 2,
      reward: 220,
      minLevel: 4,
      sentiment: '🥩',
    },
    {
      id: 'o_craft',
      title: '🍳 Fornadas de Outono',
      description: 'Tempo de colheita é tempo de cozinha cheia. Fabrique 4 produtos no Ateliê nesta semana para estocar o inverno que vem.',
      missionKey: 'craft_items',
      goal: 4,
      reward: 130,
      minLevel: 3,
      sentiment: '🍳',
    },
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
      reward: 70,
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
      id: 'i_milk2',
      title: '🥛 Leite Quente',
      description: 'No frio, ninguém dispensa leite quentinho — e pagam bem por ele. Venda 8 leites nesta semana; a meta é menor, o valor é maior.',
      missionKey: 'sell_milk',
      goal: 8,
      reward: 100,
      minLevel: 2,
      sentiment: '🥛',
    },
    {
      id: 'i_sella',
      title: '🧺 Mercado de Inverno',
      description: 'Feira vazia, mas quem vai, compra. Venda 12 itens de qualquer tipo nesta semana — no inverno, constância vale mais que volume.',
      missionKey: 'sell_any',
      goal: 12,
      reward: 95,
      minLevel: 3,
      sentiment: '🧺',
    },
    {
      id: 'i_fish',
      title: '🎣 Pesca Paciente',
      description: 'Água fria, peixe lento: o ciclo do tanque estica para 5 dias. Pesque 3 tilápias nesta semana — paciência também é ofício.',
      missionKey: 'collect_fish',
      goal: 3,
      reward: 95,
      minLevel: 12,
      sentiment: '🎣',
    },
    {
      id: 'i_caip',
      title: '🥚 Ovo Raro de Inverno',
      description: 'Manter a caipira feliz no frio é para poucos. Colete 3 ovos caipiras nesta semana — cada um vale ouro nesta época.',
      missionKey: 'collect_caipira',
      goal: 3,
      reward: 110,
      minLevel: 4,
      sentiment: '🥚',
    },
    {
      id: 'i_jers',
      title: '🐄 Jersey do Inverno',
      description: 'A vantagem da Jersey aparece agora: come 25% menos numa época de ração cara. Ordenhe-a 4 vezes nesta semana.',
      missionKey: 'collect_jersey',
      goal: 4,
      reward: 120,
      minLevel: 15,
      sentiment: '🐄',
    },
    {
      id: 'i_live',
      title: '🥩 Carne Valorizada',
      description: 'No inverno a carne está em alta e pouca gente tem animal no ponto. Venda 1 animal de corte bem terminado — timing é tudo.',
      missionKey: 'sell_livestock',
      goal: 1,
      reward: 180,
      minLevel: 4,
      sentiment: '🥩',
    },
    {
      id: 'i_craft',
      title: '🍳 Cozinha de Inverno',
      description: 'Nada aquece como comida de fazenda! Fabrique 3 produtos artesanais nesta semana — o mercado paga bem no frio.',
      missionKey: 'craft_items',
      goal: 3,
      reward: 120,
      minLevel: 3,
      sentiment: '🍳',
    },
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
      reward: 100,
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

    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
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
