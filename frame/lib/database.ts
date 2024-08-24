import { BACKEND_INSPECT_URL } from "../constant/config";
import { fromHex, toHex } from 'viem'

export const getGameInfoByGameId = async (id: string) => {
  /* const payload = toHex(JSON.stringify({ game_id: id })); */

  const response = await fetch(`${BACKEND_INSPECT_URL}`)
  const data = await response.json();
  const payload = data.reports[0].payload;

  return JSON.parse(fromHex(payload, 'string'));
}