import sharp from 'sharp';
import { serveStatic } from '@hono/node-server/serve-static'
import { Button, FrameContext, Frog, parseEther } from 'frog'
import { getFarcasterUserInfo } from '../lib/neynar.js';
import { publicClient } from '../lib/contracts.js';
import { devtools } from 'frog/dev';
import { handle } from 'frog/vercel';
import { serve } from '@hono/node-server';
// import { BACKEND_URL } from '../constant/config.js';
import { BlankInput } from 'hono/types';
import { assignPokemonToUser, createBattle, getBattleById, getPokemonImage, getPokemonsByPlayerId } from '../lib/database.js';
import { SHARE_INTENT, SHARE_TEXT, SHARE_EMBEDS, FRAME_URL, SHARE_GACHA, title } from '../constant/config.js';
import { boundIndex } from '../lib/utils/boundIndex.js';
import { fromHex } from 'viem';
import { generateGame, generateFight } from '../image-generation/generators.js';
import { Attack } from '../types/types.js';

type State = {
  verifiedAddresses?: `0x${string}`[];
  pfp_url: any;
  userName: any;
  selectedPokemons?: number[];
  lastSelectedPokemon?: number;
  currentTxId?: `0x${string}`;
}

export const app = new Frog<{ State: State }>({
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
    image: '/pikachu.png',
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
    image: '/ok.png',
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
    image: '/battle2.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/pokemons/0/0`}>POKEMONS</Button>,
      <Button action={`/verify`}>BACK</Button>,
    ],
  })
})

app.frame('/pokemons/:position/:index', async (c) => {
  const { frameData } = c;
  const fid = frameData?.fid;
  const position = Number(c.req.param('position'));

  // fetch user pokemons
  const selectedPokemons = c.previousState?.selectedPokemons || [];
  const playerPokemons = await getPokemonsByPlayerId(fid!, selectedPokemons);
  // TODO: check if user has 3 or more pokemons
  console.log(playerPokemons)

  const pokemonId = playerPokemons[position];
  console.log(pokemonId)
  const totalPlayerPokemons = playerPokemons.length;
  const index = Number(c.req.param('index'));
  const image = await getPokemonImage(pokemonId);

  c.deriveState((prevState: any) => {
    prevState.lastSelectedPokemon = position;
  });

  return c.res({
    title,
    image,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/pokemons/${boundIndex(position - 1, totalPlayerPokemons)}/${index}`}>⬅️</Button>,
      <Button action={`/pokemons/${boundIndex(position + 1, totalPlayerPokemons)}/${index}`}>➡️</Button>,
      <Button action={`/pokemons/0/${index}/confirm`}>✅</Button>,
      <Button action={`/`}>BACK 🏠</Button>,
    ],
  })
})

app.frame('/pokemons/:position/:index/confirm', async (c) => {
  const index = Number(c.req.param('index'));
  const { frameData } = c;
  const fid = frameData?.fid;
  
  const position = Number(c.req.param('position'));
  const lastSelectedPokemon = c.previousState?.lastSelectedPokemon!;

  if(index == 2) {
    // fetch user pokemons
    const selectedPokemons = c.previousState?.selectedPokemons || [];

    const playerPokemons = await getPokemonsByPlayerId(fid!, selectedPokemons);
    selectedPokemons.push(playerPokemons[lastSelectedPokemon]);
  
    c.deriveState((prevState: any) => {
      prevState.selectedPokemons = selectedPokemons;
    });

    return c.res({
      title,
      image: `/pokeball.gif`,
      imageAspectRatio: '1:1',
      intents: [
        <Button.Transaction action={`/battle/handle`} target='/create-battle'>✅</Button.Transaction>,
        <Button action={`/`}>BACK 🏠</Button>,
      ],
    })
  }

  // fetch user pokemons
  const selectedPokemons = c.previousState?.selectedPokemons || [];

  const playerPokemons = await getPokemonsByPlayerId(fid!, selectedPokemons);
  selectedPokemons.push(playerPokemons[lastSelectedPokemon]);

  c.deriveState((prevState: any) => {
    prevState.selectedPokemons = selectedPokemons;
  });

  playerPokemons.splice(lastSelectedPokemon, 1);
  console.log(playerPokemons)

  // TODO: check if user has 3 or more pokemons

  const pokemonId = playerPokemons[position];
  console.log(pokemonId)
  const totalPlayerPokemons = playerPokemons.length;
  const image = await getPokemonImage(pokemonId);

  return c.res({
    title,
    image,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/pokemons/${boundIndex(position - 1, totalPlayerPokemons)}/${index+1}`}>⬅️</Button>,
      <Button action={`/pokemons/${boundIndex(position + 1, totalPlayerPokemons)}/${index+1}`}>➡️</Button>,
      <Button action={`/pokemons/0/${index+1}/confirm`}>✅</Button>,
      <Button action={`/`}>BACK 🏠</Button>,
    ],
  })
})

app.frame('/battle/handle', async (c) => {
  const txId = c.transactionId ? c.transactionId : '0x';
  const fid = c.frameData?.fid;
  let currentTx : `0x${string}` = '0x';

  if(txId !== '0x') {
    c.deriveState((prevState: any) => {
      prevState.currentTxId = txId;
      currentTx = txId;
    })
  } else {
    currentTx = c.previousState?.currentTxId!;
  }

  if(currentTx !== '0x') {
    try {
      const transactionReceipt = await publicClient.getTransactionReceipt({hash: currentTx});

      console.log(transactionReceipt);

      if(transactionReceipt && transactionReceipt.status == 'reverted') {
        return c.error({ message: 'Transaction failed' });
      }

      if(!c.previousState?.selectedPokemons) {
        return c.error({ message: 'No pokemons selected' });
      }

      if(c.previousState?.selectedPokemons.length < 3) {
        return c.error({ message: 'Not enough pokemons selected' });
      }

      if(transactionReceipt?.status === 'success') {
        const newBattleId = await createBattle(fid!, c.previousState.selectedPokemons!);

        console.log(newBattleId);
      
        if(newBattleId === 'Failed to create battle') {
          return c.error({ message: 'Failed to create battle' });
        }

        return c.res({
          title,
          image: `/ok.jpg`,
          imageAspectRatio: '1:1',
          intents: [
            <Button.Link href={`${SHARE_INTENT}/${SHARE_TEXT}/${SHARE_EMBEDS}/${FRAME_URL}/battle/handle/${newBattleId}/${c.transactionId}`}>SHARE</Button.Link>,
            <Button action={`/battle/${newBattleId}`}>BATTLE!</Button>,
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
      <Button action={`/battle/handle`}>REFRESH 🔄️</Button>,
    ],
  })
})

//render pokemon active pokemons and basic stats (hp) 
app.frame('/battle/:gameId', async (c) => {
  const gameId = Number(c.req.param('gameId'));

  const battle = await getBattleById(gameId);
  const battleStatus = battle.status;

  switch(battleStatus) {
    case "waiting":
      return c.res({
        title,
        image: '/battle2.png',
        imageAspectRatio: '1:1',
        intents: [
          <Button action={`/battle/${gameId}/join`}>ACCEPT</Button>,
        ]
      });
  }

  console.log(battle);

  return c.res({
    title,
    image: '/image/vs/',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${gameId}/fight`}>FIGHT</Button>,
      <Button action={`/battle/${gameId}/pokemon/0`}>POKEMON</Button>,
      <Button action={`/battle/${gameId}/run`}>RUN</Button>
    ]
  })
});

app.frame('/battle/share/:gameId', async (c) => {
  const gameId = c.req.param('gameId') as string;
  return c.res({
    title,
    image: '/join-battle.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${gameId}`}>BATTLE!</Button>,
    ]
  })
});


app.frame('/battle/:gameId/fight', async (c) => {
  const gameId = c.req.param('gameId') as string;
  // TODO: a function to update the battle log and status
  return c.res({
    title,
    image: '/image/fight',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${gameId}`}>1</Button>,
      <Button action={`/battle/${gameId}`}>2</Button>,
      <Button action={`/battle/${gameId}`}>3</Button>,
      <Button action={`/battle/${gameId}`}>↩️</Button>
    ]
  })
});

app.frame('/battle/:gameId/pokemon/:id', async (c) => {
  const id = c.req.param('id') as string;
  const gameId = c.req.param('gameId') as string;
  // TODO make a get for pokemons in the battle and a set for the active pokemon
  return c.res({
    title,
    image: '/image/fight',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${gameId}`}>🔄️</Button>,
      <Button action={`/battle/${gameId}`}>ENEMY 🔎</Button>,
      <Button action={`/battle/${gameId}`}>↩️</Button>
    ]
  })
});

app.frame('/battle/:gameId/run', async (c) => {
  const gameId = c.req.param('gameId') as string;
  //TODO Backend function to set a winner and end the battle 
  return c.res({
    title,
    image: '/RUN.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${gameId}`}>NO</Button>,
      <Button action={`/battle/${gameId}`}>YES</Button>,
    ]
  })
});

app.frame('/pokedex/:id', async (c) => {
  const { frameData } = c;
  const fid = frameData?.fid;
  const { verifiedAddresses } = c.previousState ? c.previousState : await getFarcasterUserInfo(fid);
  const playerAddress = verifiedAddresses[0] as `0x${string}`;
  const playerPokemons = ['1', '2'];
  //// uncomment when database is ready
  // const playerPokemons = await getPokemonsByPlayerId(fid!);
  const id = Number(c.req.param('id')) || 0;
  const totalPlayerPokemons = playerPokemons.length;

  return c.res({
    title,
    image: `/${playerPokemons[boundIndex(id + 1, totalPlayerPokemons)]}.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/pokedex/${boundIndex(id - 1, totalPlayerPokemons)}`}>⬅️</Button>,
      <Button action={`/pokedex/${boundIndex(id + 1, totalPlayerPokemons)}`}>➡️</Button>,
      <Button action={`/verify`}>OK ✅</Button>,
      <Button action={`/new`}>NEW 🎲</Button>,
    ],
  })
})

app.frame('/new', (c) => {
  return c.res({
    title,
    image: '/gacha2.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button.Transaction action={`/loading`} target={`/mint`}>CAPTURE 🍀</Button.Transaction>,
      <Button action={`/`}>BACK</Button>,
    ],
  })
})

app.frame('/loading', async (c) => {
  const txId = c.transactionId ? c.transactionId : '0x';
  const fid = c.frameData?.fid;
  let currentTx : `0x${string}` = '0x';

  console.log(txId);
  if(txId !== '0x') {
    c.deriveState((prevState: any) => {
      prevState.currentTxId = txId;
      currentTx = txId;
    })
  } else {
    currentTx = c.previousState?.currentTxId!;
  }

  if (currentTx !== '0x') {
    try {
      const transactionReceipt = await publicClient.getTransactionReceipt({
        hash: currentTx,
      });

      console.log(transactionReceipt);

      if (transactionReceipt && transactionReceipt.status == 'reverted') {
        return c.error({ message: 'Transaction failed' });
      }

      if (transactionReceipt?.status === 'success') {
        const pokemonId = await assignPokemonToUser(fid!, txId as `0x${string}`);

        console.log(pokemonId);
        
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
      <Button action={`/loading`}>REFRESH 🔄️</Button>,
    ],
  })
})


app.transaction('/mint', (c) => {
  const mintCost = '0.000777';
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

//// TODO nothing has been done in this frame so... 
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

// app.frame('/vs', (c) => {
//   return c.res({
//     title,
//     image: '/image/vs/',
//     imageAspectRatio: '1:1',
//     intents: [
//       <Button action={`/vs`}>Refresh</Button>,
//     ],
//   })
// })

// test routing with dynamic img
app.hono.get('/image/vs', async (c) => {
  try {
    const image = await generateGame(`pikachu`, `chupacu`, 20, 4, 30, 23);

    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', //try no-cache later
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

app.hono.get('/image/fight', async (c) => {
  try {
    const attacks = [{atk: 'Light', type: {name:'normal', color:'000000'}, PP:20}, {atk: 'Light', type: {name:'normal', color:'000000'}, PP:20}, {atk: 'Light', type: {name:'normal', color:'000000'}, PP:20}] as Attack[];
    const image = await generateFight('pikachu', 20, 20, attacks)

    return c.newResponse(image, 200, {
      'Content-Type': 'image/png',
      'Cache-Control': 'max-age=0', //try no-cache later
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return c.newResponse("Error generating image", 500);
  }
});

if (process.env.NODE_ENV !== 'production') {
  devtools(app, { serveStatic });
}

serve({ fetch: app.fetch, port: Number(process.env.PORT) || 5173 });
console.log(`Server started: ${new Date()} `);

export const GET = handle(app)
export const POST = handle(app)