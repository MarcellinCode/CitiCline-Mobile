import { logError } from './logger';
import { ServiceResult } from '@/lib/types';

export const getErrorMessage = (err: unknown, fallback = 'Erreur réseau ou serveur'): string => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    return (err as any).message;
  }
  return fallback;
};

export const safeFetch = async <T,>(
  fn: () => PromiseLike<{ data: T | null; error: unknown }>
): Promise<ServiceResult<T>> => {
  try {
    const { data, error } = await fn();

    if (error) {
      const message = getErrorMessage(error);
      logError('Supabase Fetch Error', error);
      return { data: null, error: message };
    }

    return { data, error: null };
  } catch (e) {
    const message = getErrorMessage(e);
    logError('Unhandled Fetch Crash', e);
    return { data: null, error: message };
  }
};
