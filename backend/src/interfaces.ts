export interface Product {
    id: number;
    name: string;
}

export interface ProductPayload {
    id: number;
    name: string;
    action: 'add' | 'delete';
}

export interface Battle {
    id: number;
    maker: string;
    taker: string;
}

export interface InspectPayload {
    action: 'create-battle' | 'send-attack';
    hash: `0x${string}`;
    battle_id?: string;
}