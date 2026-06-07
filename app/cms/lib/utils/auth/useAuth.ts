import { useRouteLoaderData } from "react-router";

export const useAuth = (): number => {
  const da = useRouteLoaderData('root');
  const auth = da?.auth
  if (!isNaN(auth)) return auth
  return 0
}