import {
    NavLink, useLoaderData, useLocation,
    useNavigate
} from "react-router";

export default function Pagination() {
    let loaderData = useLoaderData();
    const { pathname, search } = useLocation()
    const navigate = useNavigate()

    const scrollTop = () => {
        if (typeof window === "object") window.scrollTo({
            top: 0, behavior: 'smooth'
        })
    }

    const feed = loaderData
    let nextUrl: null | string = null
    const lastSK = feed?.LastEvaluatedKey?.sk?.S
    const lastCreatedAt = feed?.LastEvaluatedKey?.createdAt?.N
    const hasLast = new URLSearchParams(search).get('last_sk')

    if (lastSK) {
        const searchParams = new URLSearchParams(search)
        searchParams.set('last_sk', lastSK)
        searchParams.set('last_created_at', lastCreatedAt)
        nextUrl = pathname + '?' + searchParams.toString()
    }

    return (hasLast || nextUrl) ? (
        <div className="px-2 py-4 flex justify-between">
            {hasLast ? (
                <button
                    rel="prev"
                    type="button"
                    className="btn_1 reg"
                    onClick={() => {
                        scrollTop()
                        navigate(-1)
                    }}>
                    back
                </button>
            ) : <div />}
            {nextUrl ? (
                <NavLink
                    viewTransition
                    end
                    rel="next"
                    className="btn_1 reg"
                    to={nextUrl}
                    onClick={() => scrollTop()}
                >
                    next
                </NavLink>
            ) : <div />}

        </div>
    ) : null
}