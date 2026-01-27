import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { NavLink } from "react-router";

export default function NotFoundLang() {
    return (
        <div className="main_container flex justify-center items-center">

            <div className="max-w-xl px-2">
                <ExclamationTriangleIcon width={64} height={64} className="text-neutral-700 dark:text-neutral-300" />
                <p className="md_1 text-xl">
                    The requested resource does not exist or has been moved. You can return to
                    the <NavLink viewTransition to="/">Homepage</NavLink> or visit
                    the <NavLink viewTransition to="/docs">Docs</NavLink>.
                </p>
            </div>
        </div>
    )
}