import dotenv from 'dotenv';
dotenv.config();
import { Client } from '@kleithor/logger';
import { PRODUCTION } from '../constants';

export const logger = new Client(process.env.LOG_DATABASE_URL as string, {
  application: process.env.APPLICATION as string,
  saveLogs: PRODUCTION,
});
