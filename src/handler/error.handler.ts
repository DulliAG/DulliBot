import { log } from '../core/log';

export async function handleError(error: any, category: string) {
  try {
    log(
      'ERROR',
      category,
      typeof error === 'string'
        ? error
        : JSON.stringify({ stack: error.stack, message: error.message })
    );
  } catch (error) {
    console.log(error);
  }
}
