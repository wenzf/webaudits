import { redirect, type LoaderFunction } from "react-router";

import invariant from 'tiny-invariant'
import { Resource } from "sst";
import { destroyAuthSession, getAuthSession } from "~/cms/utils/auth/auth.server";
import { createLangPathByParam } from "~/common/shared/lang";


// import type { Route } from "./+types/cms_logout";



export const loader:LoaderFunction = async ({ request, params }) => {


  invariant(Resource.session_secret_1.value)
  const session = await getAuthSession(
    request.headers.get("Cookie")
  );


  return redirect(createLangPathByParam(params.lang, '/login'), {
    headers: new Headers({
      'Set-Cookie': await destroyAuthSession(session)
    })
  })

}


