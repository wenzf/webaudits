
import { createContext, createCookie, createCookieSessionStorage } from "react-router";
import { Resource } from "sst/resource";
import invariant from "tiny-invariant";
import type { Settings } from "../../../../types/site";

invariant(Resource.cookie_secret_2.value)
invariant(Resource.session_secret_2.value)


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


 const settingsSessionContext = createContext<Settings | null>(null);

export {
  getSession as getSettingsSession,
  commitSession as commitSettingsSession,
  destroySession as destroyAuthSession,
  settingsSessionContext
}


