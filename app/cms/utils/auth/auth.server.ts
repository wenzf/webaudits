import { createCookie, createCookieSessionStorage, redirect } from "react-router";
import { Resource } from "sst/resource";
import invariant from "tiny-invariant";

invariant(Resource.cookie_secret_1.value)
invariant(Resource.session_secret_1.value)

const cookie = createCookie(
  process.env.NODE_ENV === "production" ? "__Secure-auth" : "__auth", {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secrets: [Resource.cookie_secret_1.value],
  secure: true
});


const { getSession, commitSession, destroySession
} = createCookieSessionStorage({ cookie })




async function isAuth(request: Request, throwNonAuth?: boolean) {
  const auth = await getSession(request.headers.get('Cookie'))
  if (auth.data.auth_lvl > 0) {
    return auth.data.auth_lvl
  } else {
    if (throwNonAuth) {
      throw redirect(`/login`, {
        status: 302,
        headers: new Headers({
          'Set-Cookie': await destroySession(auth),
          error: "Forbidden",
        })
      })
    } else {
      return 0
    }


    //    return redirect(`/login`, {status: 405})
  }

}


export {
  getSession as getAuthSession,
  commitSession as commitAuthSession,
  destroySession as destroyAuthSession,
  isAuth
}

