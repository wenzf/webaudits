import { createCsrfTokenMiddleware } from "remix-utils/middleware/csrf-token";
import { createCookie } from "react-router";
import invariant from "tiny-invariant";
import { Resource } from "sst";

// https://github.com/sergiodxa/remix-utils?tab=readme-ov-file#csrf-token-middleware

invariant(Resource.cookie_secret_3)
invariant(Resource.session_secret_3)


let cookie = createCookie("__csrf", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    secrets: [Resource.cookie_secret_3.value],
});

export const [csrfTokenMiddleware, getCsrfToken] = createCsrfTokenMiddleware({
    cookie,
    origin: process.env.NODE_ENV === "production" ? /\.webaudits\.org$/ : undefined,
    //	formDataKey: "csrf",
    // A secret to sign the token for extra security
    secret: Resource.cookie_secret_3.value,
    // Custom handler for invalid tokens
    onInvalidToken(error, request, context) {
        return new Response("Invalid CSRF token" + error, { status: 403 });
    },
});

