import { Attack } from "../types/types"

export const moves =((
    attackName: string
  ) => {
        return (
        `<svg width="200" height="65">
        <text x="5" y="32" text-anchor="middle" font-family="Handjet" font-size="35" fill="white">${attackName}</text>
        </svg>`
        )
  })

export const typeBox = ((
    attackType: Attack
  ) => {
        return(
        `
            <svg width="98" height="36">
            <rect width="98" height="36" fill="#919191"/>
            </svg>
        `
        )
  })

export const attackType = ((
    attackType: Attack
  ) => {
        return(`
        <svg width="98" height="36">
            <text x="50" y="25" text-anchor="middle" font-family="Handjet" font-size="35" fill="white">${attackType.type.name}</text>
        </svg>
        `
        )
  })

export const pp = ((
    attackPP: number,
    currentPP: number
  ) => {
        return(`
        <svg width="200" height="75">
            <text x="50" y="25" text-anchor="middle" font-family="Handjet" font-size="35" fill="white">${currentPP.toString()}/${attackPP.toString()}</text>
        </svg>
        `)
    })


// Create SVG overlays for health bars
export const hpSVG = ((
    currentHp: number,
    totalHp: number
    ) => {
        const hpBarSize = 200;
        const hpWidth = (currentHp / totalHp ) * hpBarSize;
        return (`
            <svg width="200" height="100">
              <rect width="${hpWidth}" height="10" fill="${(hpWidth < 46) ? 'red' : 'green'}"/>
              <rect x="${hpWidth}" width="${hpBarSize - hpWidth}" height="12" fill="black"/>
              <text x="170" y="35" text-anchor="middle" font-family="Arial" font-size="24" fill="white">${currentHp}/${totalHp}</text>
            </svg> 
        `)
    })

// Create SVG overlays for Pokemon names
export const pokemonSVG = ((
    pokemonName: string
    ) => {
        return( `
            <svg width="200" height="75">
            <text x="50" y="25" text-anchor="middle" font-family="Arial" font-size="25" fill="white">${pokemonName}</text>
            </svg>
      `)
    })