import dotenv from 'dotenv';

dotenv.config();

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "NEYNAR_API_DOCS" as string;

export const getFarcasterUserInfo = async (fid?: number) => {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=3`,
    {
      method: 'GET',
      headers: { accept: 'application/json', api_key: NEYNAR_API_KEY },
    },
  );
  const { users } = await response.json();
  const { pfp_url, username: userName, verified_addresses } = users[0];
  const verifiedAddresses = verified_addresses.eth_addresses;

  console.log({ pfp_url, userName, verifiedAddresses });
  
  return { pfp_url, userName, verifiedAddresses };
};

export const getFarcasterUserInfoByAddress = async (address: `0x${string}`) => {
  const userInfo = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}&viewer_fid=3`,
    {
      method: 'GET',
      headers: { accept: 'application/json', api_key: NEYNAR_API_KEY },
    },
  );

  const userData = await userInfo.json();
  const addressLowerCase = address.toLowerCase();
  const pfp_url = userData[addressLowerCase]?.[0].pfp_url || '';
  const userName = userData[addressLowerCase]?.[0].username || '???';
  const verifiedAddresses =
    userData[addressLowerCase]?.[0].verified_addresses.eth_addresses || [];

  return { pfp_url, userName, verifiedAddresses };
};