type Battle = {
  id: string;
  maker: number;
  taker: number;
  maker_pokemons: any;
  maker_battling_pokemons: any;
  taker_pokemons: any;
  taker_battling_pokemons: any;
  maker_move: string;
  taker_move: string;
  status: string;
  current_turn: number;
  battle_log: string[]; 
}

export const getPlayers = (userFid: number, battle: Battle) => {
  let player, opponent;

  const makerPokemons = battle.maker_pokemons;
  const makerBattlingPokemons = battle.maker_battling_pokemons;
  const takerPokemons = battle.taker_pokemons;
  const takerBattlingPokemons = battle.taker_battling_pokemons;

  if (battle.maker === userFid) {
    player = {
      id: battle.maker,
      pokemons: makerPokemons,
      battling_pokemons: makerBattlingPokemons,
      move: battle.maker_move,
      currentPokemon: makerPokemons[makerBattlingPokemons[0]]
    };

    opponent = {
      id: battle.taker,
      pokemons: takerPokemons,
      battling_pokemons: takerBattlingPokemons,
      move: battle.taker_move,
      currentPokemon: takerPokemons[takerBattlingPokemons[0]]
    };
  } else {
    player = {
      id: battle.taker,
      pokemons: takerPokemons,
      battling_pokemons: takerBattlingPokemons,
      move: battle.taker_move,
      currentPokemon: takerPokemons[takerBattlingPokemons[0]]
    };

    opponent = {
      id: battle.maker,
      pokemons: makerPokemons,
      battling_pokemons: makerBattlingPokemons,
      move: battle.maker_move,
      currentPokemon: makerPokemons[makerBattlingPokemons[0]]
    };
  }

  return { player, opponent };
}