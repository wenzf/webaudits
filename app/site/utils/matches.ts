import type { PageNamespaces, SiteUIMatch } from "types/site";

export const getCurrentMatchByMatches = (matches: SiteUIMatch[]): {
    match: SiteUIMatch, pageKey: PageNamespaces | null
} | undefined => {
    const le = matches?.length
    if (!le) return undefined

    return {
        match: matches[le - 1],
        pageKey: matches[le - 1]?.handle?.page_key ?? null
    }
}