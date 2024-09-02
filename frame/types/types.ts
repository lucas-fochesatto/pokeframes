export type Attack = {
    atk: string,
    type: PokemonType;
}

export type PokemonType = {
    name: string,
    color: string,
}

export type Battle = {
    id: number,
    maker: number,
    taker: number,
    maker_pokemons: number[],
    maker_battling_pokemons: number[],
    taker_pokemons: number[],
    taker_battling_pokemons: number[],
    maker_move: number,
    taker_move: number,
    status: "waiting" | "ongoing" | "finished"
    current_turn: number,
    battle_log: string[],
}