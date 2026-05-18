import { useLocation, useMatches, useNavigate, type LinkProps } from "react-router"
import type { ExtendedUIMatch, SiteUIMatch } from "../../../types/site"


export function useCurrentURL() {
  let location = useLocation()
  return location.pathname + location.search
}

export const usePathHandle = (): string | undefined => {
  const matches = useMatches() as ExtendedUIMatch[];
  const match = matches.find((it) => it.handle);
  if (match?.handle?.page) return match.handle.page as string
  return undefined
}

export const useCurrentMatch = (): undefined | SiteUIMatch => {
  const matches = useMatches()
  const le = matches?.length
  if (!le) return undefined

  return matches[le - 1] as SiteUIMatch
} 
