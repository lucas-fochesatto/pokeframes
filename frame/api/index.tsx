import { serveStatic } from '@hono/node-server/serve-static'
import { Button, FrameContext, Frog, parseEther } from 'frog'
import { getFarcasterUserInfo } from '../lib/neynar.js';
import { publicClient } from '../lib/contracts.js';
import { devtools } from 'frog/dev';
import { handle } from 'frog/vercel';
import { serve } from '@hono/node-server';
import { BACKEND_URL } from '../constant/config.js';
import { BlankInput } from 'hono/types';
import { getGameInfoByGameId } from '../lib/database.js';

const title = 'cartesi-frame';

type State = {
  verifiedAddresses?: `0x${string}`[];
  pfp_url: any;
  userName: any;
}

export const app = new Frog<{State: State}>({
  title,
  assetsPath: '/',
  basePath: '/api',
  initialState: {
    verifiedAddresses: [],
    pfp_url: '',
    userName: '',
  },
})

app.use('/*', serveStatic({ root: './public' }))

app.frame('/', (c) => {
  return c.res({
    title,
    image: '/pikachu.jpg',
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/verify`}>PLAY 🔴</Button>,
    ],
  })
})

app.frame('/verify', async (c) => {
  const fid = c.frameData?.fid;
  if (fid) {  
    const { verifiedAddresses } = await getFarcasterUserInfo(fid);
    if (!verifiedAddresses || verifiedAddresses.length === 0) {
      return c.res({
        title,
        image: 'https://i.imgur.com/2tRZhkQ.jpeg',
        imageAspectRatio: '1:1',
        intents: [
          <Button action={`https://verify.warpcast.com/verify/${fid}`}>VERIFY WALLET</Button>,
          <Button.Reset>RESET</Button.Reset>,
        ],
      });
    }
    c.deriveState((prevState: any) => {
      prevState.verifiedAddresses = verifiedAddresses;
    });
  }
  return c.res({
    title,
    image: 'https://i.imgur.com/2tRZhkQ.jpeg',
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/online/0x`}>ONLINE</Button>,
    <Button action={`/solo`}>SOLO</Button>,
    <Button action={`/pokedex/0x/0`}>POKEDEX</Button>,
    <Button action={`/scores`}>SCORES</Button>,
    ],
  })
})


app.frame('/online/:playerId', (c) => {
  const playerAddress = c.req.param('playerId');
  return c.res({
    title,
    image: 'https://i.imgur.com/2tRZhkQ.jpeg',
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/pokemons/${playerAddress}/0/0`}>POKEMONS ➡️</Button>,
    <Button action={`/verify`}>BACK ⬅️</Button>,
    ],
  })
})

app.frame('/pokemons/:playerId/:pokemonId/:index', (c) => {
  const playerAddress = c.req.param('playerId');
  const pokemonId = c.req.param('pokemonId');
  const index = c.req.param('index');
  return c.res({
    title,
    image: `/${pokemonId}.png`,
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/pokemons/${playerAddress}/${pokemonId}/0`}>⬅️</Button>,
    <Button action={`/pokemons/${playerAddress}/${pokemonId}/0`}>➡️</Button>,
    <Button action={`/pokemons/${playerAddress}/${pokemonId}/0`}>✅</Button>,
    <Button action={`/`}>BACK 🏠</Button>,
    ],
  })
})

app.frame('/solo', (c) => {
  return c.res({
    title,
    image: 'https://i.imgur.com/2tRZhkQ.jpeg',
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/`}>RESET</Button>,
    ],
  })
})

app.frame('/pokedex/:playeraddress/:id', (c) => {
  const id = Number(c.req.param('id')) || 0;
  const playerAddress = String(c.req.param('playeraddress')) || "0x";
  const totalPlayerPokemons = 2;
  
  function boundIndex (index: number) {
    return ((index % totalPlayerPokemons) + totalPlayerPokemons) % totalPlayerPokemons
  }

  return c.res({
    title,
    image: `/${boundIndex(id)+1}.png`,
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/pokedex/${playerAddress}/${boundIndex(id-1)}`}>⬅️</Button>,
    <Button action={`/pokedex/${playerAddress}/${boundIndex(id+1)}`}>➡️</Button>,
    <Button action={`/verify`}>OK ✅</Button>,
    <Button action={`/new`}>NEW 🎲</Button>,
    ],
  })
})

app.frame('/new', (c) => {
  const pokemonId = 2;
  return c.res({
    title,
    image: 'https://i.imgur.com/2tRZhkQ.jpeg',
    imageAspectRatio: '1:1',
    intents: [
    <Button.Transaction action={`/loading/${pokemonId}/0x`} target={`/mint`}>CAPTURE 🍀</Button.Transaction>,
    <Button action={`/`}>BACK</Button>,
    ],
  })
})

app.frame('/loading/:pokemonId/:txid', async (c) => {
  const txId = c.req.param('txid');
  const pokemonId = c.req.param('pokemonId');
  let transactionReceipt;
  if (c.transactionId === undefined && txId === undefined) return c.error({ message: 'No txId' });

  if (txId !== '0x') {
    c.transactionId = txId as `0x${string}`;
  }
  try {
    transactionReceipt = await publicClient.getTransactionReceipt({
      hash: txId as `0x${string}`,
    });
    if (transactionReceipt && transactionReceipt.status == 'reverted') {
      return c.error({ message: 'Transaction failed' });
    }
  } catch (error) {
    console.log(error)
  }

  if (transactionReceipt?.status === 'success') {
    return c.res({
      title,
      image: `/pokeball.gif`,
      imageAspectRatio: '1:1',
      intents: [
        <Button action={`/gotcha/${pokemonId}`}>CATCH</Button>,
        <Button action={`/`}>RESET</Button>,
      ],
    })
  } else {
    return c.res({
      title,
      image: `/loading.gif`,
      imageAspectRatio: '1:1',
      intents: [
        <Button action={`/loading/${pokemonId}/${c.transactionId}`}>REFRESH 🔄️</Button>,
      ],
    })
  } 

app.frame('/challenge/random', async(c) => {
  const { frameData } = c;
  const fid = frameData?.fid;
  const { verifiedAddresses } = c.previousState ? c.previousState : await getFarcasterUserInfo(fid);

  if (!verifiedAddresses || verifiedAddresses.length === 0) {
    return c.res({
      title,
      image: '/images/verify.png',
      imageAspectRatio: '1:1',
      intents: [<Button action="/">Back</Button>],
    });
  }

  const address = verifiedAddresses[0] as `0x${string}`;

  const response = await fetch(
    `${BACKEND_URL!}/war/getRandomChallengableGame?exept_maker=${address}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  const game = await response.json();
  if (!game.game_id) return c.error({ message: 'No game found' });

  return await challengeFrame(c, game.game_id);
})

app.frame('/challenge/:gameId', async (c) => {
  const gameId = c.req.param('gameId') as string;
  return await challengeFrame(c, gameId);
});

const challengeFrame = async(
  c: FrameContext<
    {
      State: State;
    },
    '/challenge/:gameId' | '/challenge/random',
    BlankInput
  >, 
  gameId: string
) => {
  let gameInfo = await getGameInfoByGameId(gameId);

  if(!gameInfo) {
    return c.res({
      title,
      image: <div>
        <p>NOT FOUND</p>
      </div>,
      imageAspectRatio: '1:1',
      intents: [<Button action="/">Back</Button>],
    })
  }

  const gameName = gameInfo[0].name;

  return c.res({
    title,
    image: <div>
      <p>FOUND CHALLENGE!</p>
      <p>{gameName}</p>
    </div>,
    imageAspectRatio: '1:1',
    intents: [
      <Button action='/'>BATER</Button>
    ]
  })
}

})

app.transaction('/mint', (c) => {
  const mintCost  = '0.0001'; 
  // Send transaction response.
  return c.send({
    chainId: 'eip155:11155111', //sepolia
    to: '0xaBf8cb2F85a1f423f26296aCa3c2E36c882C5f5D',
    value: parseEther(mintCost as string),
  })
})

app.frame('/gotcha/:pokemonId', (c) => {
  const pokemonId = c.req.param('pokemonId');
  return c.res({
    title,
    image: `/${pokemonId}.png`,
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/`}>RESET</Button>,
    ],
  })
})

app.frame('/scores', (c) => {
  return c.res({
    title,
    image: 'https://i.imgur.com/2tRZhkQ.jpeg',
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/`}>RESET</Button>,
    ],
  })
})
if (process.env.NODE_ENV !== 'production') {
  devtools(app, { serveStatic });
}

serve({ fetch: app.fetch, port: Number(process.env.PORT) || 5173 });
console.log(`Server started: ${new Date()} `);

export const GET = handle(app)
export const POST = handle(app)
