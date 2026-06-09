
import { createCookie, createCookieSessionStorage } from "react-router";
import { Resource } from "sst/resource";
import invariant from "tiny-invariant";

invariant(Resource.cookie_secret_4.value)
invariant(Resource.session_secret_1.value)


const cookie = createCookie(
    "__nobots", {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secrets: [Resource.cookie_secret_4.value],
    secure: true,
    domain: process.env.NODE_ENV === 'development' ? undefined : 'webaudits.org'
});

const { getSession, commitSession, destroySession } = createCookieSessionStorage({ cookie })

export {
    getSession as getClientToken,
    commitSession as commitClientTokenSession,
    destroySession as destroyClientTokenSession,
}

