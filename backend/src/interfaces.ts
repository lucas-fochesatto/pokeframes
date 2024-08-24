export interface Product {
    id: number;
    name: string;
}

export interface ProductPayload {
    id: number;
    name: string;
    action: 'add' | 'delete';
} 