import createClient from "openapi-fetch";
import { components, paths } from "./schema";
import { fromHex, toHex } from 'viem'
import { readFileSync } from 'fs';
// Importing and initializing DB
const { Database } = require("node-sqlite3-wasm");

import { Product, ProductPayload } from './interfaces';

import { pokemons } from "../pokemons/allpokemons.js";

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;

console.log('Will start SQLITE Database');
async function fetchJsonFromIpfs(url: string): Promise<string> {
  try {
    const gatewayUrl = `${url}`;
    const response = await fetch(gatewayUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON from IPFS: ${response.statusText}`);
    }
    const jsonString = await response.text();
    return jsonString;
  } catch (error) {
    console.error('Error fetching JSON from IPFS:', error);
    throw error;
  }
}
// Instatiate Database
const db = new Database('/tmp/database.db');
try {
  db.run('CREATE TABLE IF NOT EXISTS pokemons (id INTEGER PRIMARY KEY, name TEXT, type TEXT, hp INTEGER, attack INTEGER, defense INTEGER, speed INTEGER, atk1 TEXT, atk2 TEXT, atk3 TEXT, image TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS players (playerid TEXT, inventory TEXT)');
} catch (e) {
  console.log('ERROR initializing databas: ', e)
}
console.log('Backend Database initialized');

for (let i = 0; i < 25; i++) {
  db.run('INSERT INTO pokemons VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [Number(pokemons[i]!.id), pokemons[i]!.name, pokemons[i]!.type, pokemons[i]!.hp, pokemons[i]!.attack, pokemons[i]!.defense, pokemons[i]!.speed, pokemons[i]!.atk1, pokemons[i]!.atk2, pokemons[i]!.atk3, pokemons[i]!.image]);
}

type AdvanceRequestData = components["schemas"]["Advance"];
type InspectRequestData = components["schemas"]["Inspect"];
type RequestHandlerResult = components["schemas"]["Finish"]["status"];
type RollupsRequest = components["schemas"]["RollupRequest"];
type InspectRequestHandler = (data: InspectRequestData) => Promise<string>;
type AdvanceRequestHandler = (
  data: AdvanceRequestData
) => Promise<RequestHandlerResult>;

const rollupServer = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollupServer);

const handleAdvance: AdvanceRequestHandler = async (data) => {
  console.log("Received advance request data " + JSON.stringify(data));
  const payload = data.payload;
  try {
    const productPayload = JSON.parse(fromHex(payload, 'string')) as ProductPayload;
    console.log(`Managing user ${productPayload.id}/${productPayload.name} - ${productPayload.action}`);
    if (!productPayload.action) throw new Error('No action provided');
    if (productPayload.action === 'add')
      db.run('INSERT INTO products VALUES (?, ?)', [productPayload.id, productPayload.name]);
    if (productPayload.action === 'delete')
      db.run('DELETE FROM products WHERE id = ?', [productPayload.id]);

    const advance_req = await fetch(rollup_server + '/notice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ payload })
    });
    console.log("Received notice status ", await advance_req.text())
    return "accept";
  } catch (e) {
    console.log(`Error executing parameters: "${payload}"`);
    return "reject";
  }
};

const handleInspect: InspectRequestHandler = async (data) => {
  console.log("Received inspect request data " + JSON.stringify(data));
  try {
    const listOfProducts = await db.all(`SELECT * FROM pokemons`);
    const payload = toHex(JSON.stringify(listOfProducts));
    const inspect_req = await fetch(rollup_server + '/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ payload })
    });
    console.log("Received report status " + inspect_req.status);
    return "accept";
  } catch (e) {
    console.log(`Error generating report with binary value "${data.payload}"`);
    return "reject";
  }
};

const main = async () => {
  const { POST } = createClient<paths>({ baseUrl: rollupServer });
  let status: RequestHandlerResult = "accept";
  while (true) {
    const { response } = await POST("/finish", {
      body: { status },
      parseAs: "text",
    });

    if (response.status === 200) {
      const data = (await response.json()) as RollupsRequest;
      switch (data.request_type) {
        case "advance_state":
          status = await handleAdvance(data.data as AdvanceRequestData);
          break;
        case "inspect_state":
          await handleInspect(data.data as InspectRequestData);
          break;
      }
    } else if (response.status === 202) {
      console.log(await response.text());
    }
  }
};

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
