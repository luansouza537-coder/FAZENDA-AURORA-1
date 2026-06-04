/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COW_NAMES = [
  'Mimosa', 'Estrela', 'Branquinha', 'Belinha', 'Malhada', 
  'Clarinha', 'Mumu', 'Joia', 'Amora', 'Melisse', 'Dune'
];

export const SHEEP_NAMES = [
  'Puffy', 'Algodão', 'Floquinho', 'Nuvem', 'Fofinha', 
  'Perlina', 'Suave', 'Mel', 'Lanosa', 'Pipoca', 'Alpaca'
];

export const CHICKEN_NAMES = [
  'Pipoca', 'Frajola', 'Amarelinha', 'Chica', 'Cocó', 
  'Giselda', 'Pintada', 'Pena', 'Carijó', 'Gajeta'
];

export const OX_NAMES = [
  'Rodeio', 'Trovão', 'Brutus', 'Forte', 'Dourado', 
  'Guerreiro', 'Barão', 'Gigante', 'Hércules', 'Xerife', 'Urso'
];

export function getRandomName(type: string): string {
  const names: Record<string, string[]> = {
    vaca: ['Margarida','Rosa','Violeta','Jasmim','Dália','Íris','Hortência','Camélia','Gardênia','Magnólia'],
    ovelha: ['Fofinha','Lã','Nevasca','Nuvem','Bolinha','Algodão','Branca','Flocos','Pérola','Serena'],
    boi: ['Touro','Trovão','Tempestade','Robusto','Titã','Brutus','Hércules','Golias','Sansão','Colosso'],
    galinha: ['Pintadinha','Cacareco','Belinha','Crica','Franquinha','Pipoca','Farofa','Xodó','Mimosa','Penacho'],
    cabra: ['Cheirosa','Saltinha','Cabrinha','Mozinha','Pimenta','Manjericão','Hortelã','Sálvia','Tomilho','Louro'],
    lhama: ['Cuspidora','Peluda','Serrana','Andina','Brisa','Altitude','Pampas','Nevado','Tundra','Pampa'],
    pato: ['Patinhas','Nadadeira','Mergulhão','Marreco','Quack','Aguinha','Lagoa','Riacho','Corgo','Brejo'],
    ganso: ['Guardião','Buzina','Honkão','Vigia','Alerta','Sentinela','Patrulha','Guarda','Farol','Alarme'],
    bufalo: ['Pantanal','Cerrado','Brioso','Lama','Barro','Leitão','Cremoso','Manteiga','Nata','Iogurte'],
    pavao: ['Esmeralda','Ametista','Safira','Rubi','Topázio','Opala','Turquesa','Ônix','Ágata','Jaspe'],
    codorna: ['Miúda','Pipoquinha','Bolinha','Graninho','Sementinha','Quiriri','Pitanga','Cajuína','Tapioca','Cuscuz'],
    alpaca: ['Felpudo','Veludo','Cashmere','Mohair','Angora','Merino','Pashmina','Vicunha','Suri','Huacaya'],
    minhoca: ['Argila','Húmus','Ferrita','Turfa','Compost','Terrinha','Barrozinho','Lodinho','Siltão','Adubo'],
    caracol: ['Lentinho','Espiral','Casinha','Lumache','Escargot','Babinha','Limo','Musgo','Orvalho','Sereno'],
    coelho_angora: ['Pompom','Floquinho','Algodãozinho','Penugem','Fofo','Peluche','Macio','Sedoso','Aveludado','Lanoso'],
    bicho_seda: ['Crisálida','Casulo','Fio','Seda','Trama','Urdidura','Renda','Bordado','Tecido','Fiapo'],
    ra: ['Coaxo','Pulo','Lagoa','Brejo','Charco','Açude','Tanque','Poça','Regato','Ribeirão'],
    avestruz: ['Savana','Kalahari','Serengeti','Sahara','Namibe','Karoo','Nairóbi','Kilima','Ubuntu','Baobá'],
    jacare: ['Amazonas','Araguaia','Pantanal','Tapajós','Tocantins','Xingu','Madeira','Purus','Juruá','Negro'],
  };
  const list = names[type] ?? ['Animal','Bichinho','Fazendeiro','Campeiro','Caipira'];
  return list[Math.floor(Math.random() * list.length)];
}

export function getUniqueOxName(currentAnimals: { type: string; name: string }[]): string {
  const existingNumbers = new Set(
    currentAnimals
      .filter(a => a.type === 'boi')
      .map(a => {
        const match = a.name.match(/Boi\s+(\d+)/i);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n): n is number => n !== null)
  );
  
  let attempts = 0;
  while (attempts < 1000) {
    const r = Math.floor(Math.random() * 200) + 1;
    if (!existingNumbers.has(r)) {
      return `Boi ${r}`;
    }
    attempts++;
  }
  // Safe fallback
  return `Boi ${Math.floor(Math.random() * 200) + 1}`;
}
