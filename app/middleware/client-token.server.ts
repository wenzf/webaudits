
import bcrypt from "bcryptjs";
import type { MiddlewareFunction } from "react-router";
import invariant from "tiny-invariant";

import {
    commitClientTokenSession, getClientToken
} from "~/common/utils/sessions/client_token_session.server";
import { Resource } from 'sst';
import { clientInfoSessionContext } from "./client-info.server";


invariant(Resource.session_secret_4.value)

export const clientTokenMiddleware: MiddlewareFunction = async ({ request, context }, next) => {
    const cookieHeader = request.headers.get("Cookie");
    const session = await getClientToken(cookieHeader);

    const clientInfo = context.get(clientInfoSessionContext)

    let isNewNonBotSession = false;

    if (!session.has("secret") && !clientInfo?.is_bot) {
        const secret = Resource.session_secret_4.value
        const salt = await bcrypt.genSalt()
        const hashedSecret = await bcrypt.hash(secret, salt)
        session.set("secret", hashedSecret)
        isNewNonBotSession = true;
    }

    const response = await next();

    if (isNewNonBotSession && response instanceof Response) {
        if (response instanceof Response) {
            response.headers.append(
                "Set-Cookie",
                await commitClientTokenSession(session)
            );
        }


        return response;
    }
};