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
// import { assignPokemonToUser, getGameInfoByGameId, getPokemonsByPlayerId } from '../lib/database.js';
import { SHARE_INTENT, SHARE_TEXT, SHARE_EMBEDS, FRAME_URL, SHARE_GACHA, title } from '../constant/config.js';
import { boundIndex } from '../lib/utils/boundIndex.js';
import { fromHex } from 'viem';

type State = {
  verifiedAddresses?: `0x${string}`[];
  pfp_url: any;
  userName: any;
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
    image: '/battle2.png',
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
        <Button action={`/pokemons/${boundIndex(pokemonId, totalPlayerPokemons)}/${index + 1}`}>✅</Button>,
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
        <Button action={`/pokemons/${boundIndex(pokemonId, totalPlayerPokemons)}/${index + 1}`}>✅</Button>,
        <Button action={`/`}>BACK 🏠</Button>,
      ],
    })
  }
})

app.frame('/battle/handle/:gameId/:txid', async (c) => {
  const { frameData } = c;
  const fid = frameData?.fid;
  const { verifiedAddresses } = c.previousState ? c.previousState : await getFarcasterUserInfo(fid);
  const playerAddress = verifiedAddresses[0] as `0x${string}` || "0xSug0u";
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

//render pokemon active pokemons and basic stats (hp) 
app.frame('/battle/:gameId', async (c) => {
  const gameId = c.req.param('gameId') as string;
  return await battleFrame(c, gameId);
});

const battleFrame = async (
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
      <Button action={`/battle/${gameId}/fight`}>FIGHT</Button>,
      <Button action={`/battle/${gameId}/pokemon`}>POKEMON</Button>,
      <Button action={`/battle/${gameId}/run`}>RUN</Button>
    ]
  })
}

// app.frame('/battle/:gameId/fight', async (c) => {
//   const gameId = c.req.param('gameId') as string;
//   // const img = await generateGame(`pikachu`,`chupacu`,10,20,30,50);
//   return c.res({
//     title,
//     image: 'https://i.imgur.com/Izd0SLP.png',
//     imageAspectRatio: '1:1',
//     intents: [
//       <Button action={`/battle/${gameId}`}>1</Button>,
//       <Button action={`/battle/${gameId}`}>2</Button>,
//       <Button action={`/battle/${gameId}`}>3</Button>,
//       <Button action={`/battle/${gameId}`}>↩️</Button>
//     ]
//   })
// });

app.frame('/battle/:gameId/fight', async (c) => {
  const gameId = c.req.param('gameId') as string;
  // const img = await generateGame(`pikachu`,`chupacu`,10,20,30,50);
  return c.res({
    title,
    image: '',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/battle/${gameId}`}>1</Button>,
      <Button action={`/battle/${gameId}`}>2</Button>,
      <Button action={`/battle/${gameId}`}>3</Button>,
      <Button action={`/battle/${gameId}`}>↩️</Button>
    ]
  })
});

app.frame('/battle/:gameId/pokemon', async (c) => {
  const gameId = c.req.param('gameId') as string;
  return c.res({
    title,
    image: 'https://i.imgur.com/Izd0SLP.png',
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
        const data = await assignPokemonToUser(fid!, txId as `0x${string}`)
        const report = data.reports[0].payload;
        const str = JSON.parse(fromHex(report, 'string')).message; // { message: "Player 1 created with pokemon 2" }
        const pokemonId = str.pokemonId;

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

//// @todo ////
// -> mint a NFT on the mainnet for the appContract address 
// -> associate the user to the pokemon in our database (cartesi) 
// -> associate ownership to the user when he withdraws his NFT
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


// test frame routing
app.frame('/vs', (c) => {
  return c.res({
    title,
    image: '/image/vs/',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/vs`}>Refresh</Button>,
    ],
  })
})

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

const generateGame = async (
  pokemon1Name: string,
  pokemon2Name: string,
  totalHP1: number,
  currentHp1: number,
  totalHP2: number,
  currentHp2: number
) => {
  try {

    // have to rewrite this a little better later (and maybe do it in a separate file as a function)
    const gameComponents = (() => {
      const components = [];

      // SVG box card
      const card1SVG = `
        <svg width="255" height="100">
          <rect x="2" y="2" width="220" height="80" rx="12" fill="#3D3359" stroke="#5A534B" stroke-width="3"/>
        </svg>
      `;
      const card2SVG = `
        <svg width="255" height="100">
          <rect x="2" y="2" width="220" height="80" rx="12" fill="#3D3359" stroke="#5A534B" stroke-width="3"/>
        </svg>
      `;

      components.push({ input: Buffer.from(card1SVG), top: 440, left: 335 });
      components.push({ input: Buffer.from(card2SVG), top: 40, left: 35 });

      // Create SVG overlays for health bars
      const hpBarSize = 200;
      const hp1Width = (currentHp1 / totalHP1) * hpBarSize;
      const hp2Width = (currentHp2 / totalHP2) * hpBarSize;

      const hp1SVG = `
      <svg width="200" height="100">
        <rect width="${hp1Width}" height="10" fill="${(hp1Width < 46) ? 'red' : 'green'}"/>
        <rect x="${hp1Width}" width="${hpBarSize - hp1Width}" height="12" fill="black"/>
        <text x="170" y="35" text-anchor="middle" font-family="Arial" font-size="24" fill="white">${currentHp1}/${totalHP1}</text>
      </svg>
      `;
      const hp2SVG = `
      <svg width="200" height="100">
        <rect width="${hp2Width}" height="10" fill="${(hp2Width < 46) ? 'red' : 'green'}"/>
        <rect x="${hp2Width}" width="${hpBarSize - hp2Width}" height="12" fill="black"/>
        <text x="170" y="35" text-anchor="middle" font-family="Arial" font-size="24" fill="white">${currentHp2}/${totalHP2}</text>
      </svg>
      `;

      components.push({ input: Buffer.from(hp1SVG), top: 480, left: 350 });
      components.push({ input: Buffer.from(hp2SVG), top: 80, left: 50 });

      // Create SVG overlays for Pokemon names (monkey)
      const pokemon1SVG = `
        <svg width="200" height="75">
          <text x="50" y="25" text-anchor="middle" font-family="Arial" font-size="25" fill="white">${pokemon1Name}</text>
        </svg>
      `;
      const pokemon2SVG = `
        <svg width="200" height="75">
          <text x="50" y="25" text-anchor="middle" font-family="Arial" font-size="25" fill="white">${pokemon2Name}</text>
        </svg>
      `;

      components.push({ input: Buffer.from(pokemon1SVG), top: 445, left: 350 });
      components.push({ input: Buffer.from(pokemon2SVG), top: 45, left: 50 });

      return components;
    })

    const baseImageBuffer = await sharp('./public/pokemon-battle.png')
      .resize(600, 600)
      .png()
      .toBuffer();

    const gameComponentsArray = gameComponents();

    const pokemon1ImageBuffer = await sharp('./public/1.png')
      .resize(200, 200)
      .png()
      .toBuffer();

    const pokemon2ImageBuffer = await sharp('./public/2.png')
      .resize(200, 200)
      .png()
      .toBuffer();

    gameComponentsArray.push({ input: pokemon1ImageBuffer, top: 350, left: 50 });
    gameComponentsArray.push({ input: pokemon2ImageBuffer, top: 50, left: 350 });

    const finalImage = await sharp(baseImageBuffer)
      .composite(gameComponentsArray)
      .png()
      .toBuffer();

    // console.log("Final image composed successfully");

    return finalImage;
  } catch (error) {
    console.error("Error during game generation:", error);
    throw error;
  }
};


if (process.env.NODE_ENV !== 'production') {
  devtools(app, { serveStatic });
}

serve({ fetch: app.fetch, port: Number(process.env.PORT) || 5173 });
console.log(`Server started: ${new Date()} `);

export const GET = handle(app)
export const POST = handle(app)
