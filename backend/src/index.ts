import createClient from "openapi-fetch";
import { components, paths } from "./schema";
import { fromHex, toHex, createPublicClient, http, parseEther } from 'viem'
import { sepolia } from 'viem/chains'

// Importing and initializing DB
const { Database } = require("node-sqlite3-wasm");

import { InspectPayload, Product, ProductPayload } from './interfaces';

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;

console.log('Will start SQLITE Database');

// Instatiate Database
const db = new Database('/tmp/database.db');
try {
  db.run('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS hashes (hash TEXT PRIMARY KEY)');
  db.run('CREATE TABLE IF NOT EXISTS battles (id TEXT PRIMARY KEY, maker TEXT, taker TEXT)');
} catch (e) {
  console.log('ERROR initializing databas: ', e)
}
console.log('Backend Database initialized');

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
})

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

const handleBattleCreation = async (maker : string) => {
  
  console.log(`Creating battle for ${maker}`);
  const timestamp = new Date().getTime();
  const taker = "AI";  
  const battleId = toHex(JSON.stringify({maker, timestamp}));

  db.run('INSERT INTO battles VALUES (?, ?, ?)', [battleId, maker, taker]);
}

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
  const payload = data.payload;
  const inspectPayload = JSON.parse(fromHex(payload, 'string')) as InspectPayload;
  
  if(inspectPayload.action === 'create-battle') {
    const hashExists = await db.get('SELECT * FROM hashes WHERE hash = ?', [inspectPayload.hash]);
    
    if (hashExists) {
      console.log(`Transaction ${inspectPayload.hash} already used`);
      return "reject";
    } else {
      
      const transaction = await publicClient.getTransaction({
        hash: inspectPayload.hash
      })

      if (!transaction) {
        console.log(`Transaction ${inspectPayload.hash} not found`);
        return "reject";
      }

      if(transaction.to?.toLowerCase() !== '0x02f37D3C000Fb5D2A824a3dc3f1a29fa5530A8D4'.toLowerCase()) {
        console.log(`Transaction ${inspectPayload.hash} not sent to the correct address`);
        return "reject";
      }

      if(transaction.value < parseEther('0.000777')) {
        console.log(`Transaction ${inspectPayload.hash} not sent with the correct amount`);
        return "reject";
      }
      
      db.run('INSERT INTO hashes VALUES (?)', [inspectPayload.hash]);
      
      await handleBattleCreation(transaction.from);
    }
  }

  try {
    const listOfProducts = await db.all(`SELECT * FROM products`);
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
