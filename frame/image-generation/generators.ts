import sharp from "sharp";
import { Attack } from "../types/types";
import { attackType, hpSVG, moves, pokemonSVG, typeBox } from "./functions";

export const generateGame = async (
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
        const cardSVG = `
        <svg width="255" height="100">
          <rect x="2" y="2" width="220" height="80" rx="12" fill="#3D3359" stroke="#5A534B" stroke-width="3"/>
        </svg>
      `;
        components.push({ input: Buffer.from(cardSVG), top: 440, left: 335 });
        components.push({ input: Buffer.from(cardSVG), top: 40, left: 35 });
  
        const hp1SVG = hpSVG(currentHp1, totalHP1);
        const hp2SVG = hpSVG(currentHp2, totalHP2);
  
        components.push({ input: Buffer.from(hp1SVG), top: 480, left: 350 });
        components.push({ input: Buffer.from(hp2SVG), top: 80, left: 50 });
  
        

        const pokemon1SVG = pokemonSVG(pokemon1Name);
        const pokemon2SVG = pokemonSVG(pokemon2Name);
  
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
}

export const generateFight = async (
    pokemonName: string,
    totalHp: number,
    currentHp: number,
    attacks: Attack [],
  ) => {
    try {
      const fightComponents = (() => {
        const components = [];
        const sentence = `        
          <svg width="600" height="65">
            <text x="164" y="32" text-anchor="middle" font-family="Handjet" font-size="30" fill="white">What will ${pokemonName} do?</text>
          </svg>
        `;
        components.push({ input: Buffer.from(sentence), top: 40, left: 60 });
        const atk1 = moves(attacks[0].atk);
        const atk2 = moves(attacks[1].atk);
        const atk3 = moves(attacks[2].atk);
        const back = `
          <svg width="200" height="75">
            <text x="50" y="25" text-anchor="middle" font-family="Handjet" font-size="35" fill="white">BACK</text>
          </svg>         
        `
        const hp1SVG = hpSVG(currentHp, totalHp);
        components.push({ input: Buffer.from(atk1), top: 190, left: 110 });
        components.push({ input: Buffer.from(atk2), top: 190, left: 383 });
        components.push({ input: Buffer.from(atk3), top: 320, left: 110 });
        components.push({ input: Buffer.from(back), top: 338, left: 385 });
        components.push({ input: Buffer.from(hp1SVG), top: 480, left: 180 });
        components.push({  input: Buffer.from(typeBox(attacks[0])), top:228, left:58 });
        components.push({  input: Buffer.from(attackType(attacks[0])), top:228, left:58 });
        components.push({  input: Buffer.from(typeBox(attacks[1])), top:228, left:323 });
        components.push({  input: Buffer.from(attackType(attacks[0])), top:228, left:323 });
        components.push({  input: Buffer.from(typeBox(attacks[2])), top:357, left:58 });
        components.push({  input: Buffer.from(attackType(attacks[0])), top:357, left:58 });
        return components;
     })

    const fightComponentsArray = fightComponents();
    const baseImageBuffer = await sharp('./public/battle-fight.png')
    .resize(600, 600)
    .png()
    .toBuffer();
    const pokemon1ImageBuffer = await sharp('./public/pikachu2.png')
    .resize(100, 100)
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

