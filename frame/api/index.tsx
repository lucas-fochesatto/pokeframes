import { serveStatic } from '@hono/node-server/serve-static'
import { Button, FrameContext, Frog, parseEther } from 'frog'
import { getFarcasterUserInfo } from '../lib/neynar.js';
import { publicClient } from '../lib/contracts.js';
import { devtools } from 'frog/dev';
import { handle } from 'frog/vercel';
import { serve } from '@hono/node-server';
import { BACKEND_URL } from '../constant/config.js';
import { BlankInput } from 'hono/types';
import { assignPokemonToUser, getGameInfoByGameId } from '../lib/database.js';
import { SHARE_INTENT, SHARE_TEXT, SHARE_EMBEDS, FRAME_URL, SHARE_GACHA, title} from '../constant/config.js';
import { boundIndex } from '../lib/utils/boundIndex.js';

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
    image: '/ok.jpg',
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/battle`}>BATTLE</Button>,
    <Button action={`/pokedex/0`}>POKEDEX</Button>,
    <Button action={`/scores`}>SCORES</Button>,
    ],
  })
})

app.frame('/battle', async (c) => {
  // const { frameData } = c;
  // const fid = frameData?.fid;
  // const { verifiedAddresses } = c.previousState ? c.previousState : await getFarcasterUserInfo(fid);
  // const playerAddress = verifiedAddresses[0] as `0x${string}`;
  return c.res({
    title,
    image: '/battle.png',
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/pokemons/0/0`}>POKEMONS</Button>,
    <Button action={`/verify`}>BACK</Button>,
    ],
  })
})

app.frame('/pokemons/:pokemonId/:index', async (c) => {
  const { frameData } = c;
  const fid = frameData?.fid;
  const { verifiedAddresses } = c.previousState ? c.previousState : await getFarcasterUserInfo(fid);
  const playerAddress = verifiedAddresses[0] as `0x${string}`;
  const pokemonId = Number(c.req.param('pokemonId')) || 0;
  const playerPokemons = ['1', '2'];
  const totalPlayerPokemons = playerPokemons.length;
  const index = Number(c.req.param('index')); 
  if (index == 3) {
  return c.res({
    title,
    image: `/pokeball.gif`,
    imageAspectRatio: '1:1',
    intents: [
    <Button.Transaction action={`/battle/handle/0/0x`} target='/mint'>✅</Button.Transaction>,
    <Button action={`/`}>BACK 🏠</Button>,
    ],
  })
} if (pokemonId == 0) {
  return c.res({
    title,
    image: `/${playerPokemons[pokemonId]}.png`,
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/pokemons/${boundIndex(pokemonId - 1, totalPlayerPokemons)}/${index}`}>⬅️</Button>,
    <Button action={`/pokemons/${boundIndex(pokemonId + 1, totalPlayerPokemons)}/${index}`}>➡️</Button>,
    <Button action={`/pokemons/${boundIndex(pokemonId, totalPlayerPokemons)}/${index+1}`}>✅</Button>,
    <Button action={`/`}>BACK 🏠</Button>,
    ],
  })
} else {
  return c.res({
    title,
    image: `/${playerPokemons[pokemonId]}.png`,
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/pokemons/${boundIndex(pokemonId - 1, totalPlayerPokemons)}/${index}`}>⬅️</Button>,
    <Button action={`/pokemons/${boundIndex(pokemonId + 1, totalPlayerPokemons)}/${index}`}>➡️</Button>,
    <Button action={`/pokemons/${boundIndex(pokemonId, totalPlayerPokemons)}/${index+1}`}>✅</Button>,
    <Button action={`/`}>BACK 🏠</Button>,
    ],
  })
}
})

app.frame('/battle/handle/:gameId/:txid', async (c) => {
  const { frameData } = c;
  const fid = frameData?.fid;
  const { verifiedAddresses } = c.previousState ? c.previousState : await getFarcasterUserInfo(fid);
  const playerAddress = verifiedAddresses[0] as `0x${string}`;
  let gameId = c.req.param('gameId') as `0x${string}`;
  const txId = c.req.param('txid');
  if (c.transactionId === undefined && txId === undefined) return c.error({ message: 'No txId' });
  let transactionReceipt;

  if (txId !== '0x') {
    c.transactionId = txId as `0x${string}`;
  
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
  }
  if (transactionReceipt?.status === 'success') {
  gameId = txId as `0x${string}` + playerAddress;   
  return c.res({
    title,
    image: `/ok.jpg`,
    imageAspectRatio: '1:1',
    intents: [
    <Button.Link href={`${SHARE_INTENT}${SHARE_TEXT}${SHARE_EMBEDS}${FRAME_URL}/battle/handle/${gameId}/${c.transactionId}`}>SHARE</Button.Link>,
    <Button action={`/battle/${gameId}`}>REFRESH</Button>,
    ],
  })
  }
  gameId = '0x';
  return c.res({
    title,
    image: `/1.png`,
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/battle/handle/${gameId}/${c.transactionId}`}>REFRESH</Button>,
    ],
  })
})

// app.frame('/battle/random', async(c) => {
//   const { frameData } = c;
//   const fid = frameData?.fid;
//   const { verifiedAddresses } = c.previousState ? c.previousState : await getFarcasterUserInfo(fid);

//   const address = verifiedAddresses[0] as `0x${string}`;

//   const response = await fetch(
//     `${BACKEND_URL!}/war/getRandomChallengableGame?exept_maker=${address}`,
//     {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     },
//   );
//   const game = await response.json();
//   if (!game.game_id) return c.error({ message: 'No game found' });

//   return await battleFrame(c, game.game_id);
// })

app.frame('/battle/:gameId', async (c) => {
  const gameId = c.req.param('gameId') as string;
  return await battleFrame(c, gameId);
});

const battleFrame = async(
  c: FrameContext<
    {
      State: State;
    },
    '/battle/:gameId' | '/battle/random',
    BlankInput
  >, 
  gameId: string
) => {
//   let gameInfo = await getGameInfoByGameId(gameId);

//   if(!gameInfo) {
//     return c.res({
//       title,
//       image: 'https://i.imgur.com/R0qW9mo.png',
//       imageAspectRatio: '1:1',
//       intents: [<Button action="/">BACK</Button>],
//     })
//   }

//   const gameName = gameInfo[0].name;

  return c.res({
    title,
    image: 'https://i.imgur.com/Izd0SLP.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button action='/'>BACK</Button>
    ]
  })
}


app.frame('/pokedex/:id', async (c) => {
  const { frameData } = c;
  const fid = frameData?.fid;
  const { verifiedAddresses } = c.previousState ? c.previousState : await getFarcasterUserInfo(fid);
  const playerAddress = verifiedAddresses[0] as `0x${string}`;
  const playerPokemons = ['1', '2'];
  const id = Number(c.req.param('id')) || 0;
  const totalPlayerPokemons = playerPokemons.length;

  return c.res({
    title,
    image: `/${playerPokemons[boundIndex(id+1, totalPlayerPokemons)]}.png`,
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/pokedex/${boundIndex(id-1, totalPlayerPokemons)}`}>⬅️</Button>,
    <Button action={`/pokedex/${boundIndex(id+1, totalPlayerPokemons)}`}>➡️</Button>,
    <Button action={`/verify`}>OK ✅</Button>,
    <Button action={`/new`}>NEW 🎲</Button>,
    ],
  })
})

app.frame('/new', (c) => {
  const pokemonId = 2;
  return c.res({
    title,
    image: '/gacha.jpg',
    imageAspectRatio: '1:1',
    intents: [
    <Button.Transaction action={`/loading/${pokemonId}`} target={`/mint`}>CAPTURE 🍀</Button.Transaction>,
    <Button action={`/`}>BACK</Button>,
    ],
  })
})

app.frame('/loading/:pokemonId', async (c) => {
  const pokemonId = c.req.param('pokemonId');

  const txId = c.transactionId ? c.transactionId : '0x';
  const fid = c.frameData?.fid;

  if (txId !== '0x') {
    try {
      const transactionReceipt = await publicClient.waitForTransactionReceipt({
        hash: txId as `0x${string}`,
      });

      console.log(transactionReceipt);

      if (transactionReceipt && transactionReceipt.status == 'reverted') {
        return c.error({ message: 'Transaction failed' });
      }

      if (transactionReceipt?.status === 'success') {
        // add a function to create a new pokemon for the user in our backend
        const data = await assignPokemonToUser(fid!, txId as `0x${string}`, Number(pokemonId))
        console.log(data);

        return c.res({
          title,
          image: `/pokeball.gif`,
          imageAspectRatio: '1:1',
          intents: [
            <Button action={`/gotcha/${pokemonId}`}>CATCH</Button>,
            <Button action={`/`}>RESET</Button>,
          ],
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
  return c.res({
    title,
    image: `/loading.gif`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/loading/${pokemonId}`}>REFRESH 🔄️</Button>,
    ],
  })
})

//// @todo ////
// -> mint a NFT on the mainnet for the appContract address 
// -> associate the user to the pokemon in our database (cartesi) 
// -> associate ownership to the user when he withdraws his NFT
app.transaction('/mint', (c) => {
  const mintCost  = '0.000777'; 
  return c.send({
    chainId: 'eip155:11155111',
    to: '0x02f37D3C000Fb5D2A824a3dc3f1a29fa5530A8D4',
    value: parseEther(mintCost as string),
  })
})

app.transaction('/create-battle', (c) => {
  const cost = '0.000777';
  return c.send({
    chainId: 'eip155:11155111',
    to: '0x02f37D3C000Fb5D2A824a3dc3f1a29fa5530A8D4',
    value: parseEther(cost as string),
  })
})

app.frame('/gotcha/:pokemonId', (c) => {
  const pokemonId = c.req.param('pokemonId');
  return c.res({
    title,
    image: `/${pokemonId}.png`,
    imageAspectRatio: '1:1',
    intents: [
    <Button.Link href={`${SHARE_INTENT}${SHARE_GACHA}${SHARE_EMBEDS}${FRAME_URL}/share/${pokemonId}`}>SHARE</Button.Link>,
    <Button action={`/`}>HOME 🏠</Button>,
    ],
  })
})

app.frame('/share/:pokemonId', (c) => {
  const pokemonId = c.req.param('pokemonId');
  return c.res({
    title,
    image: `/${pokemonId}.png`,
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/`}>TRY IT OUT 🏠</Button>,
    ],
  })
})

//// @todo ////
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
