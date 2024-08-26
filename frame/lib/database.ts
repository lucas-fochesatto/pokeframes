import { BACKEND_INSPECT_URL } from "../constant/config";
import { fromHex, toHex } from 'viem'

export const getGameInfoByGameId = async (id: string) => {
  /* const payload = toHex(JSON.stringify({ game_id: id })); */

  const response = await fetch(`${BACKEND_INSPECT_URL}`)
  const data = await response.json();
  const payload = data.reports[0].payload;

  return JSON.parse(fromHex(payload, 'string'));
}

export const assignPokemonToUser = async (senderId: number, senderWallet: `0x${string}`, hash: `0x${string}`) => {
  const payload = toHex(JSON.stringify({ action: 'mint-pokemon', hash, senderId, senderWallet }))

  const response = await fetch(`${BACKEND_INSPECT_URL}/${payload}`);

  const data = await response.json();

  return data;
}

export const getPokemonsByPlayerId = async (playerId: number) => {
  const payload = toHex(JSON.stringify({ action: 'get-user-pokemons', msgSender: playerId }))

  const response = await fetch(`${BACKEND_INSPECT_URL}/${payload}`);

  const data = await response.json();

  return data;
}