import { createCookie, createCookieSessionStorage } from "react-router";
import { Resource } from "sst/resource";
import invariant from "tiny-invariant";

invariant(Resource.cookie_secret_2.value)
invariant(Resource.session_secret_1.value)


const cookie = createCookie(
     "__csrf_like", {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secrets: [Resource.cookie_secret_2.value],
    secure: true,
   // domain: 'webaudits.org'
});


const { getSession, commitSession, destroySession } = createCookieSessionStorage({ cookie })

export {
    getSession as getCsrfLikeSession,
    commitSession as commitCsrfLikeSession,
    destroySession as destroyCsrfLikeSession
}

