import { BACKEND_URL, GRAPHQL_URL } from "../constant/config";
import { Battle } from "../types/types";
import { fromHex } from 'viem'

export const getBattleById = async (id: number) => {
  const response = await fetch(`${BACKEND_URL}/battle/${id}`);

  const data = await response.json();

  return data as Battle;
}

let isMinting = false;
let canQuery = false;
let mintData : any = null;

export const assignPokemonToUser = async (senderId: number, hash: `0x${string}`) => {
  if(!isMinting) {
    isMinting = true;
    const response = await fetch(`${BACKEND_URL}/assign-pokemon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ senderId, hash })
    })
  
    mintData = await response.json();
  
    if(response.ok) {
      console.log("Minted pokemon", mintData);
      canQuery = true;
    } else {
      return "Failed to assign pokemon";
    }
  }

  if(canQuery) {
    console.log('Data on query: ', mintData);
    canQuery = false;
    const pokemonId = await queryInputNotice(fromHex(mintData!.pokemonId.hex, `number`))
    isMinting = false;
    return pokemonId;
  }

  return 0;
}

export const getPokemonsByPlayerId = async (senderId: number, selectedPokemons: number[] = []) => {
  const response = await fetch(`${BACKEND_URL}/user/${senderId}/pokemons`);

  const data = await response.json();

  const inventory = data.inventory as number[];

  // gotta remove the selected pokemons from the inventory
  selectedPokemons.forEach(pokemonId => {
    const index = inventory.indexOf(pokemonId);
    if(index > -1) {
      inventory.splice(index, 1);
    }
  });

  return inventory; // { "inventory": [ 25, 25, 1, 10 ] }
}

export const getPokemonName = async (pokemonId : number) => {
  const response = await fetch(`${BACKEND_URL}/pokemon/${pokemonId}/name`);

  const data = await response.json();

  return data.name;
}

let isCreatingBattle = false;

export const createBattle = async (maker: number, maker_pokemons: number[]) => {
  if(!isCreatingBattle) {
    isCreatingBattle = true;
    const response = await fetch(`${BACKEND_URL}/create-battle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ maker, maker_pokemons: JSON.stringify(maker_pokemons) })
    })
  
    if(response.ok) {
      const data = await response.json();
  
      const newBattle = data.newBattle;
  
      isCreatingBattle = false;

      return newBattle.id;
    } else {
      return "Failed to create battle";
    }
  } else {
    return "Already creating battle";
  }
}

export const queryInputNotice = async (inputIndex: number) => {
  try {
    const query = `
      query noticesByInput($inputIndex: Int!) {
        input(index: $inputIndex) {
          notices {
            edges {
              node {
                index
                input {
                  index
                }
                payload
              }
            }
          }
        }
      }
    `;
  
    const variables = {
      inputIndex, // Replace 123 with the desired value
    };
  
    const response = await fetch(`${GRAPHQL_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables })
    })
  
    const result = await response.json();
  
    if(!result.data) {
      return "Input not found";
    }
  
    const payload = JSON.parse(fromHex(result.data.input.notices.edges[0].node.payload, 'string'));
  
    const pokemonId = payload.pokemonId;
  
    return pokemonId;
  } catch (error) {
    console.log("Wait...");
    return 0;
  }
}

let isJoiningBattle = false;

export const joinBattle = async (battleId: number, taker: number, taker_pokemons: number[]) => {
  if(!isJoiningBattle) {
    isJoiningBattle = true;
    const response = await fetch(`${BACKEND_URL}/join-battle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ battleId, taker, taker_pokemons: JSON.stringify(taker_pokemons) })
    })
  
    if(response.ok) {
      const data = await response.json();

      const { message } = data.message;

      isJoiningBattle = false;
  
      return message;
    } else {
      return "Failed to join battle";
    }
  } else {
    return "Already joining battle";
  }
}

export const setSelectedPokemons = async (battleId: number, userFid: number, selectedPokemons: number[]) => {
  const response = await fetch(`${BACKEND_URL}/select-pokemons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ battleId, userFid, pokemons: JSON.stringify(selectedPokemons) })
  })

  if(response.ok) {
    return "Selected pokemons updated";
  } else {
    return "Failed to update selected pokemons";
  }
}