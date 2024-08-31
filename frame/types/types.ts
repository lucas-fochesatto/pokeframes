export type Attack = {
    atk: string,
    PP: number,
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
    taker_pokemons: number[],
    maker_hp: number[],
    taker_hp: number[],
    status: "waiting" | "ongoing" | "finished"
}