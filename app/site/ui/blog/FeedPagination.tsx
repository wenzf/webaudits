import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router";
import { useCurrentURL } from "~/common/shared/hooks";
import SITE_CONFIG from "~/site/site.config";

export default function FeeedPagination({ lastKey }: { lastKey?: string }) {
    const { PAGE_CONFIG: { NS_BLOG } } = SITE_CONFIG
    const navigate = useNavigate()
    const location = useLocation();
    const [params] = useSearchParams();
    const from = useCurrentURL()

    const to = lastKey ? `/${NS_BLOG.path_fragment}?last=${lastKey}` : null
    const back = location?.state?.from ?? -1

    return (
        <div className="flex gap-4 justify-center mb-8">
            {params.get('last') ? (
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="underline focus-visible:ring-2 font-bold cusor-pointer"
                >
                    Previous
                </button>
            ) : null}
            {to && (
                <NavLink
                rel="next"
                    //                    props={{ to, state: { from }, rel: 'next' }}
                     to={to} 

                    className="underline focus-visible:ring-2 font-bold cursor-pointer"
                >
                    Next
                </NavLink>
            )}
        </div>
    )
}