import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, parseEther } from 'frog'
import { getFarcasterUserInfo } from '../lib/neynar.js';
import { devtools } from 'frog/dev'
import { handle } from 'frog/vercel';
import { serve } from '@hono/node-server';

const title = 'cartesi-frame';

export const app = new Frog({
  title,
  assetsPath: '/',
  basePath: '/api',
  initialState: {
    verifiedAddresses: [],
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
    <Button action={`/online`}>ONLINE</Button>,
    <Button action={`/solo`}>SOLO</Button>,
    <Button action={`/pokedex/0`}>POKEDEX</Button>,
    <Button action={`/scores`}>SCORES</Button>,
    ],
  })
})

app.frame('/online', (c) => {
  return c.res({
    title,
    image: 'https://i.imgur.com/2tRZhkQ.jpeg',
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/`}>RESET</Button>,
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
  const totalPlayerPokemons = 10;
  

  function boundIndex (index: number) {
    return ((index % totalPlayerPokemons) + totalPlayerPokemons) % totalPlayerPokemons
  }

// Check how NFTs work in Cartesi and somehow fetch user collections as an array

  return c.res({
    title,
    image: 'https://i.imgur.com/2tRZhkQ.jpeg',
    imageAspectRatio: '1:1',
    intents: [
    <Button action={`/pokedex/${boundIndex(id-1)}`}>⬅️</Button>,
    <Button action={`/`}>OK ✅</Button>,
    <Button action={`/pokedex/${boundIndex(id+1)}`}>➡️</Button>,
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


app.transaction('/send-ether', (c) => {
  const { inputText } = c
  // Send transaction response.
  return c.send({
    chainId: 'eip155:11155111', //sepolia
    to: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
    value: parseEther(inputText as string),
  })
})

if (process.env.NODE_ENV !== 'production') {
  devtools(app, { serveStatic });
}

serve({ fetch: app.fetch, port: Number(process.env.PORT) || 5173 });
console.log(`Server started: ${new Date()} `);

export const GET = handle(app)
export const POST = handle(app)
