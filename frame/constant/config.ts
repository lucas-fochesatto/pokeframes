import dotenv from 'dotenv';

dotenv.config();

export const BACKEND_URL = process.env.BACKEND_URL as string;
export const BACKEND_INSPECT_URL = process.env.BACKEND_INSPECT_URL as string;