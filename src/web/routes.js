const routes = ['/login', '/workspace'];

export const isAuthorizedRoute = pathname => routes.indexOf(pathname) >= 0;

export const isDefinedRoute = pathname => routes.includes(pathname);

export const defaultRouteLoggedIn = '/workspace';

export default routes;
