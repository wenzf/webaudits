import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router";
import { useCurrentURL } from "~/common/shared/hooks";
import SITE_CONFIG from "~/site/site.config";

export default function FeeedPagination({ lastKey, locs }: { lastKey?: string, locs: Record<string, string> }) {
    const { PAGE_CONFIG: { NS_BLOG } } = SITE_CONFIG
    const navigate = useNavigate()
    const [params] = useSearchParams();
    const tagParams = params.getAll('tags')
    const sps = new URLSearchParams()

    if (lastKey) sps.set('last', lastKey)

    if (tagParams?.length) {
        for (let i = 0; i < tagParams?.length; i += 1) {
            sps.append('tags', tagParams[i])
        }
    }

    const to = sps.get('last') ? `/${NS_BLOG.path_fragment}?${sps.toString()}` : null

    return (
        <div className="flex gap-4 justify-center mb-8 text-2xl">
            {params.get('last') ? (
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="underline focus-visible:ring-2 font-bold cusor-pointer"
                >
                    {locs?.back}
                </button>
            ) : null}
            {to && (
                <NavLink
                    viewTransition
                    rel="next"
                    to={to}
                    className="underline focus-visible:ring-2 font-bold cursor-pointer"
                >
                    {locs?.next}
                </NavLink>
            )}
        </div>
    )
}