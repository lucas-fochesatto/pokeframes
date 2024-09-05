import sharp from "sharp";
import { Attack } from "../types/types";
import { attackType, hpHp, hpSVG, moves, moves2, pokemonSVG, statusPokemon, typeBox, typeBox2 } from "./functions";

export const generateGame = async (
    pokemon1Name: string,
    pokemon1Id: number,
    pokemon2Name: string,
    pokemon2Id: number,
    totalHP1: number,
    currentHp1: number,
    totalHP2: number,
    currentHp2: number
  ) => {
    try {
  
      // have to rewrite this a little better later (and maybe do it in a separate file as a function)
      const gameComponents = (() => {
        const components = [];
  
  
        const hp1SVG = hpSVG(currentHp1, totalHP1);
        const hp2SVG = hpSVG(currentHp2, totalHP2);
  
        components.push({ input: Buffer.from(hp1SVG), top: 496, left: 351 });
        components.push({ input: Buffer.from(hp2SVG), top: 104, left: 53 });
        const pokemon1SVG = pokemonSVG(pokemon1Name);
        const pokemon2SVG = pokemonSVG(pokemon2Name);
        components.push({ input: Buffer.from(pokemon1SVG), top: 455, left: 351 });
        components.push({ input: Buffer.from(pokemon2SVG), top: 59, left: 53 });
  
        return components;
      })
  
      const baseImageBuffer = await sharp('./public/battle-playground.png')
        .resize(600, 600)
        .png()
        .toBuffer();
  
      const gameComponentsArray = gameComponents();
  
      const pokemon1ImageBuffer = await sharp(`./public/pokemons/${pokemon1Id}.png`)
        .resize(200, 200)
        .png()
        .toBuffer();
  
      const pokemon2ImageBuffer = await sharp(`./public/pokemons/${pokemon2Id}.png`)
        .resize(200, 200)
        .png()
        .toBuffer();
  
      const hphp = hpHp(currentHp1, totalHP1);
      gameComponentsArray.push({ input: pokemon1ImageBuffer, top: 350, left: 50 });
      gameComponentsArray.push({ input: pokemon2ImageBuffer, top: 50, left: 350 });
      gameComponentsArray.push({ input: Buffer.from(hphp), top: 524, left: 484 });
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
}

export const generateFight = async (
    pokemonName: string,
    pokemonId: number,
    totalHp: number,
    currentHp: number,
    attacks: Attack [],
    stats: any
  ) => {
    try {
      const fightComponents = (() => {
        const components = [];
        const sentence = `        
          <svg width="600" height="65">
            <text x="0" y="32" text-anchor="left" font-family="Handjet" font-size="30" fill="white">What will ${pokemonName} do?</text>
          </svg>
        `;
        components.push({ input: Buffer.from(sentence), top: 40, left: 60 });
        const atk1 = moves(attacks[0].atk);
        const atk2 = moves(attacks[1].atk);
        const atk3 = moves(attacks[2].atk);
        const back = `
          <svg width="220" height="75">
            <text x="15" y="25" text-anchor="left" font-family="Handjet" font-size="35" fill="white">BACK</text>
          </svg>         
        `
        const hphp = hpHp(currentHp, totalHp);
        const pokemon1SVG = pokemonSVG(pokemonName);
        const hp1SVG = hpSVG(currentHp, totalHp);
        const attack = statusPokemon(stats.atk);
        const defense = statusPokemon(stats.def);
        const speed = statusPokemon(stats.spd);
        const accuracy = statusPokemon('6');
        const evasiveness = statusPokemon('6');
        components.push({ input: Buffer.from(atk1), top: 183, left: 59 });
        components.push({ input: Buffer.from(atk2), top: 183, left: 324 });
        components.push({ input: Buffer.from(atk3), top: 313, left: 59 });
        components.push({ input: Buffer.from(back), top: 340, left: 330 });
        components.push({ input: Buffer.from(hphp), top: 526, left: 156 });
        components.push({ input: Buffer.from(pokemon1SVG), top: 455, left: 154 });
        components.push({ input: Buffer.from(hp1SVG), top: 494, left: 154 });
        components.push({  input: Buffer.from(typeBox(attacks[0])), top:226, left:58 });
        components.push({  input: Buffer.from(attackType(attacks[0])), top:226, left:58 });
        components.push({  input: Buffer.from(typeBox(attacks[1])), top:226, left:323 });
        components.push({  input: Buffer.from(attackType(attacks[1])), top:226, left:323 });
        components.push({  input: Buffer.from(typeBox(attacks[2])), top:355, left:60 });
        components.push({  input: Buffer.from(attackType(attacks[2])), top:355, left:60 });
        components.push({  input: Buffer.from(attack), top:202, left:133 });
        components.push({  input: Buffer.from(defense), top:231, left:133 });
        components.push({  input: Buffer.from(speed), top:257, left:133 });
        components.push({  input: Buffer.from(accuracy), top:292, left:133 });
        components.push({  input: Buffer.from(evasiveness), top:316, left:133 });

        return components;
     })

    const fightComponentsArray = fightComponents();
    const baseImageBuffer = await sharp('./public/battle-fight.png')
    .resize(600, 600)
    .png()
    .toBuffer();
    const pokemon1ImageBuffer = await sharp(`./public/pokemons/${pokemonId}.png`)
    .resize(108, 108)
    .png()
    .toBuffer();

    fightComponentsArray.push({input: pokemon1ImageBuffer, top: 438, left: 41});
    const finalImage = await sharp(baseImageBuffer)
    .composite(fightComponentsArray)
    .png()
    .toBuffer();

    return finalImage;
    } catch(error) {
        console.error("Error during fight menu generation:", error);
        throw error;
    }
}

export const generateBattleConfirm = async (
  pokemonIds: number[],
) => {
  try {
  const ComponentsArray = [];
  
  const baseImageBuffer = await sharp('./public/battle-checkout.png')
  .resize(600, 600)
  .png()
  .toBuffer();

  const pokemon1ImageBuffer = await sharp(`./public/pokemons/${pokemonIds[0]}.png`)
  .resize(125, 125)
  .png()
  .toBuffer();

  const pokemon2ImageBuffer = await sharp(`./public/pokemons/${pokemonIds[1]}.png`)
  .resize(125, 125)
  .png()
  .toBuffer();

  const pokemon3ImageBuffer = await sharp(`./public/pokemons/${pokemonIds[2]}.png`)
  .resize(125, 125)
  .png()
  .toBuffer();

  ComponentsArray.push({input: pokemon1ImageBuffer, top: 191, left: 68});
  ComponentsArray.push({input: pokemon2ImageBuffer, top: 191, left: 238});
  ComponentsArray.push({input: pokemon3ImageBuffer, top: 191, left: 409});
  const finalImage = await sharp(baseImageBuffer)
  .composite(ComponentsArray)
  .png()
  .toBuffer();

  return finalImage;
  } catch(error) {
      console.error("Error during battle checkout generation:", error);
      throw error;
  }
}

export const generateWaitingRoom = async (
  pfp_url: string,
) => {
  try {
  const ComponentsArray = [];
  
  const baseImageBuffer = await sharp('./public/waiting-room.png')
  .resize(600, 600)
  .png()
  .toBuffer();

  const usr1ImageBuffer = await sharp('./public/pokemons/25.png')
  .resize(170, 170)
  .png()
  .toBuffer();

  ComponentsArray.push({input: usr1ImageBuffer, top: 324, left: 48});

  const finalImage = await sharp(baseImageBuffer)
  .composite(ComponentsArray)
  .png()
  .toBuffer();

  return finalImage;
  } catch(error) {
      console.error("Error during battle checkout generation:", error);
      throw error;
  }
}

function prettyName(inputString: string): string {
  let lowerString = inputString.toLowerCase();
  let resultString = lowerString.charAt(0).toUpperCase() + lowerString.slice(1);
  return resultString;
}

export const generatePokemonCard = async (
  pokemonId: number,
  pokemonName: string,
) => {
  try {
  const ComponentsArray = [];
  
  const baseImageBuffer = await sharp('./public/pokemons-base.png')
  .resize(600, 600)
  .png()
  .toBuffer();

  const usr1ImageBuffer = await sharp(`./public/pokemons/${pokemonId}.png`)
  .resize(400, 400)
  .png()
  .toBuffer();

  const pokemon = `
  <svg width="248" height="65">
    <text x="120" y="48" text-anchor="middle" font-family="Handjet" font-size="38" fill="white">${prettyName(pokemonName)}</text>
  </svg>        
  `

  ComponentsArray.push({input: usr1ImageBuffer, top: 138, left: 113});
  ComponentsArray.push({input: Buffer.from(pokemon), top: 23, left: 260});

  const finalImage = await sharp(baseImageBuffer)
  .composite(ComponentsArray)
  .png()
  .toBuffer();

  return finalImage;
  } catch(error) {
      console.error("Error during battle checkout generation:", error);
      throw error;
  }
}

export const generatePokemonMenu = async (
  pokemonName1: string,
  pokemonId1: number,
  pokemonName2: string,
  pokemonId2: number,  
  totalHp1: number,
  currentHp1: number,
  totalHp2: number,
  currentHp2: number,
  attacks: Attack [],
) => {
  try {
    const fightComponents = (() => {
      const components = [];
      const atk1 = moves2(attacks[0].atk);
      const atk2 = moves2(attacks[1].atk);
      const atk3 = moves2(attacks[2].atk);

      const pokemon1SVG = pokemonSVG(pokemonName1);
      const pokemon2SVG = pokemonSVG(pokemonName2);
      const hp1SVG = hpSVG(currentHp1, totalHp1);
      const hp2SVG = hpSVG(currentHp2, totalHp2);
      const hphp1 = hpHp(currentHp1, totalHp1);
      const hphp2 = hpHp(currentHp2, totalHp2);
      const attack = statusPokemon('6');
      const defense = statusPokemon('6');
      const speed = statusPokemon('6');
      const accuracy = statusPokemon('6');
      const evasiveness = statusPokemon('6');
      components.push({ input: Buffer.from(atk1), top: 189, left: 309 });
      components.push({ input: Buffer.from(atk2), top: 241, left: 309 });
      components.push({ input: Buffer.from(atk3), top: 293, left: 309 });
      components.push({ input: Buffer.from(pokemon1SVG), top: 44, left: 143 });
      components.push({ input: Buffer.from(pokemon2SVG), top: 435, left: 143 });
      components.push({ input: Buffer.from(hp1SVG), top: 89, left: 144 });
      components.push({ input: Buffer.from(hp2SVG), top: 480, left: 144 });
      components.push({ input: Buffer.from(hphp1), top: 121, left: 144 });
      components.push({ input: Buffer.from(hphp2), top: 512, left: 144 });
      components.push({  input: Buffer.from(typeBox2(attacks[0])), top:189, left:445 });
      components.push({  input: Buffer.from(attackType(attacks[0])), top:189, left:445 });
      components.push({  input: Buffer.from(typeBox2(attacks[1])), top:241, left:445 });
      components.push({  input: Buffer.from(attackType(attacks[1])), top:241, left:445 });
      components.push({  input: Buffer.from(typeBox2(attacks[2])), top:293, left:445 });
      components.push({  input: Buffer.from(attackType(attacks[2])), top:293, left:445 });
      components.push({  input: Buffer.from(attack), top:192, left:133 });
      components.push({  input: Buffer.from(defense), top:221, left:133 });
      components.push({  input: Buffer.from(speed), top:247, left:133 });
      components.push({  input: Buffer.from(accuracy), top:282, left:133 });
      components.push({  input: Buffer.from(evasiveness), top:306, left:133 });

      return components;
   })

  const fightComponentsArray = fightComponents();
  const baseImageBuffer = await sharp('./public/in-battle-change-pokemon.png')
  .resize(600, 600)
  .png()
  .toBuffer();

  const pokemon1ImageBuffer = await sharp(`./public/pokemons/${pokemonId1}.png`)
  .resize(108, 108)
  .png()
  .toBuffer();

  const pokemon2ImageBuffer = await sharp(`./public/pokemons/${pokemonId2}.png`)
  .resize(108, 108)
  .png()
  .toBuffer();

  fightComponentsArray.push({input: pokemon1ImageBuffer, top: 33, left: 31});
  fightComponentsArray.push({input: pokemon2ImageBuffer, top: 435, left: 30});
  const finalImage = await sharp(baseImageBuffer)
  .composite(fightComponentsArray)
  .png()
  .toBuffer();

  return finalImage;
  } catch(error) {
      console.error("Error during fight menu generation:", error);
      throw error;
  }
}