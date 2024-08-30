import { BACKEND_URL } from "../constant/config";

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

  if(response.ok) {
    return "Pokemon assigned";
  } else {
    return "Failed to assign pokemon";
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

export const createBattle = async (maker: number, maker_pokemons: number[]) => {
  const response = await fetch(`${BACKEND_URL}/create-battle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ maker, maker_pokemons })
  })

  if(response.ok) {
    return "Battle created";
  } else {
    return "Failed to create battle";
  }
}