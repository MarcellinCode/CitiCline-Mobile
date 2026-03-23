import { ROUTES, AppRoute } from '../constants/routes';
import { logError } from './logger';

export const navigateSafe = (router: any, route?: AppRoute | string | any, params?: any) => {
  if (!route) return;

  if (typeof route === 'string' && route.startsWith('/') && !route.includes('?')) {
    const isRouteValid = Object.values(ROUTES).some(val => 
      typeof val === 'string' && val === route 
      || (typeof val === 'function' && route.startsWith(val('test').split('test')[0]))
    );
    if (!isRouteValid && __DEV__) {
      console.warn(`⚠️ Warning: Route "${route}" n'est pas répertoriée dans ROUTES.`);
    }
  }

  try {
    if (params) {
      router.push({ pathname: route, params });
    } else {
      router.push(route);
    }
  } catch (e) {
    logError(`Navigation Crash vers la route: ${JSON.stringify(route)}`, e);
  } // anti-crash !
};
