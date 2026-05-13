import { Outlet } from "react-router";

import { DefaultErrorBoundary } from "~/site/ui/core/other/defaultErrorBoundary";
import type { RouteHandle } from "../../../../types/site";



export const handle: RouteHandle = {
    bc: true,
    page_key: "NS_ECOS_V1_LAYOUT"
};



export default function EcosLayout() {
    return <Outlet />
}


export function ErrorBoundary({ error }: { error: Error }) {
    return <DefaultErrorBoundary error={error} />
}
