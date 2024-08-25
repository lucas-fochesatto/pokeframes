export interface Player {
    playerId: number;
    wallet: string;
    inventory: string;
    battles: Battle[];
}

export interface Battle {
    id: number;
    maker: string;
    taker: string;
    status: 'pending' | 'running' | 'finished';
}

export interface InspectPayload {
    action: 'mint-pokemon' | 'create-battle' | 'send-attack' | 'get-user-pokemons';
    hash?: `0x${string}`;
    battleId?: string;
    pokemonId?: number;
    senderId?: number;
}