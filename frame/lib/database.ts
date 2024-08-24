import { BACKEND_INSPECT_URL } from "../constant/config";

const toHex = (str: string) => {
  return Buffer.from(str).toString('hex');
}

const toStr = (hex: string) => {
  return Buffer.from(hex, 'hex').toString();
}

export const getGameInfoByGameId = async (id: string) => {
  /* const payload = toHex(JSON.stringify({ game_id: id })); */

  const response = await fetch(`${BACKEND_INSPECT_URL}`)
  const data = await response.json();
  const payload = data.reports[0].payload;
/* 
  JSON.parse(fromHex(payload, 'string')) */

  console.log(data.reports[0].payload);

  return JSON.parse(toStr(data.reports[0]));
}