import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { NavLink } from "react-router";
import { isRouteErrorResponse } from "react-router";

export function DefaultErrorBoundary({ error }: {error:Error}) {
    let message = "Oops!"
    let details = "An unexpected error occurred."
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error"
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error?.message;
        stack = error?.stack;
    }

    return (

        <div className="main_container flex justify-center items-center">

            <div className="max-w-xl">
                <ExclamationTriangleIcon width={64} height={64} className="text-neutral-700 dark:text-neutral-300" />
                <div className="md_1 text-xl">
                    <p>{message}</p>
                    {details && <p>{details}</p>}
<p>
                    You can return to
                    the <NavLink viewTransition to="/">Homepage</NavLink> or visit
                    the <NavLink viewTransition to="/docs">Docs</NavLink>.
                    </p>
                </div>
            </div>
        </div>


    );
}
