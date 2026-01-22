import { useLocation, useMatches, useNavigate, type LinkProps } from "react-router"
import type { ExtendedUIMatch, SiteUIMatch } from "types/site"


export function useBackNavigation() {
  let navigate = useNavigate()
  const handleClick: LinkProps['onClick'] = (e) => {
    if (typeof history === "object") {
      const idx = history?.state?.idx
      if (Number.isNaN(idx)) {
        const le = history?.length
        if (!Number.isNaN(le)) {
          if (le > 1) {
            e.preventDefault()
            navigate(-1)
          }
        }
      } else if (idx > 0) {
        e.preventDefault()
        navigate(-1)
      }
    }
  }
  return handleClick
}

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
