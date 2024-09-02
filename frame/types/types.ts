export type Attack = {
    atk: string,
    type: PokemonType;
}

export type PokemonType = {
    name: string,
    color: string,
}

export type Battle = {
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