import { logError } from './logger';

export const safeFetch = async <T,>(fn: () => PromiseLike<{ data: T | null; error: any }>) => {
  try {
    const { data, error } = await fn();

    if (error) {
      logError('Supabase Fetch Error', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (e) {
    logError('Unhandled Fetch Crash', e);
    return { data: null, error: e };
  }
};
