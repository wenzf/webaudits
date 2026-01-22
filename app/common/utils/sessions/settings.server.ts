import { createCookie, createCookieSessionStorage } from "react-router";
import { Resource } from "sst/resource";
import invariant from "tiny-invariant";

invariant(Resource.cookie_secret_2.value)
invariant(Resource.session_secret_1.value)


const cookie = createCookie(
   "__settings", {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secrets: [Resource.cookie_secret_2.value],
  secure: true,
  maxAge: 31536000 * 3 // 3 years
});


const { getSession, commitSession, destroySession
} = createCookieSessionStorage({ cookie })


export {
  getSession as getSettingsSession,
  commitSession as commitSettingsSession,
  destroySession as destroyAuthSession
}
