import { BACKEND_INSPECT_URL, BACKEND_URL } from "../constant/config";
import { fromHex, toHex } from 'viem'

export const getGameInfoByGameId = async (id: string) => {
  const response = await fetch(`${BACKEND_URL}/battle/${id}`);

  const data = await response.json();

  return data;
}

export const assignPokemonToUser = async (senderId: number, hash: `0x${string}`) => {
  const response = await fetch(`${BACKEND_URL}/assign-pokemon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ senderId, hash })
  })

  if(response.status === 400) {
    const data = await response.json();
    return data.message;
  }
  
  if(response.status === 200) {
    const data = await response.json();
    return data;
  }
}

export const getPokemonsByPlayerId = async (senderId: number, selectedPokemons: number[] = []) => {
  const response = await fetch(`${BACKEND_URL}/user/${senderId}/pokemons`);

  const data = await response.json();

  const inventory = data.inventory as number[];

  // gotta remove the selected pokemons from the inventory
  selectedPokemons.forEach(pokemonId => {
    const index = inventory.indexOf(pokemonId);
    if(index > -1) {
      inventory.splice(index, 1);
    }
  });

  return inventory; // { "inventory": [ 25, 25, 1, 10 ] }
}

export const getPokemonImage = async (pokemonId : number) => {
  const response = await fetch(`${BACKEND_URL}/pokemon/${pokemonId}/image`);

  const data = await response.json();

  return data.image;
}