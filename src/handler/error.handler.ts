import { logger } from '../core/log';

export async function handleError(error: any, category: string) {
  await logger.log(
    'ERROR',
    category,
    typeof error === 'string'
      ? error
      : JSON.stringify({ stack: error.stack, message: error.message })
  );
}
