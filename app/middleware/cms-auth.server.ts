import { redirect, type MiddlewareFunction } from "react-router";
import { getAuthSession } from "~/cms/utils/auth/auth.server";

export function createAuthMiddleware(): MiddlewareFunction<Response> {
    return async ({ request, context }, next) => {

        const auth = await getAuthSession(request.headers.get("Cookie"))

        if (!auth?.data || !auth?.data?.auth_lvl || auth?.data?.auth_lvl < 1) {
            //   throw redirect("/login", { status: 404 });
            throw new Response(null, { status: 404 })
        }
    }
}


export const authMiddleware = createAuthMiddleware();