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

export const getPokemonsByPlayerId = async (playerId: `0x${string}`) => {
  const payload = toHex(JSON.stringify({ action: 'get-user-pokemons', msgSender: playerId }))

  const response = await fetch(`${BACKEND_INSPECT_URL}/${payload}`);

  const data = await response.json();

  return data;
}