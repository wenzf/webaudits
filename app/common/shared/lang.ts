import { createPath, type Params, type Path } from "react-router";

import SITE_CONFIG from "../../site/site.config";
import type { PageNamespaces, SiteLangs } from "types/site";


/**
 * @description `SiteLangs` entry by lang param
 * @param langParam `:lang?`
 * @returns `SiteLangs` / `SITE_LANGS`
 */


export const langByParam = (
    langParam: string | undefined | Params
): SiteLangs & {is_fallback?:boolean} => {
    const { SITE_LANGS } = SITE_CONFIG
    const config = SITE_LANGS as SiteLangs[];

    let defaultCase = config[0];
    if (typeof langParam === 'string') {
        for (let i = 0; i < config.length; i += 1) {
            const entry = config[i];
            if (entry.default) defaultCase = entry;
            if (langParam === entry.lang_param) return entry
        }

        return {
            ...defaultCase,
            is_fallback: true
        }
    }
    return {
        ...defaultCase 
    }
}


/**
 * @description `SiteLangs` entry by `SiteLangs.lang_code`
 * @param langCode `SiteLangs.lang_code`
 * @returns `SiteLangs` / `SITE_LANGS`
 */

export const langByLangCode = (
    langCode: SiteLangs["lang_code"]
): SiteLangs => {
    const { SITE_LANGS } = SITE_CONFIG
    const config = SITE_LANGS as SiteLangs[];
    for (let i = 0; i < config.length; i += 1) {
        if (config[i].lang_code === langCode) return config[i]
    }
    // fallback
    return config[0]
}

export function replaceDoubleTrailingSlash(path: string) {
    if (path.startsWith('//')) {
        return createPath({ pathname: path.replace('//', '/') })
    }
    return createPath({ pathname: path })
}

export const langSwitcher = (
    param: string | undefined | Params,
    path: string,
    targetLang: SiteLangs["lang_code"]
): string => {
    const target = langByLangCode(targetLang);
    const target_lang_param = target.lang_param;
    let out = '';
    if (path === '/' && param === undefined) {
        out = replaceDoubleTrailingSlash(`/${target_lang_param}`)
    } else if (param === undefined) {
        out = replaceDoubleTrailingSlash(`/${target_lang_param}${path}`)
    } else if (target_lang_param === '') {
        out = replaceDoubleTrailingSlash(
            path.replace(`/${param}`, `/${target_lang_param}`))
    } else {
        out = replaceDoubleTrailingSlash(
            path.replace(`/${param}`, `/${target_lang_param}`))
    }

    if (out.endsWith('/')) out = out.substring(0, out.length - 1);

    return createPath({ pathname: out })
}


/**
 * @description creates localized URL path by lang param and path fragment `:lang?/<path>`
 * @param langParam `:lang?`
 * @param pathFragment <path>
 * @returns localized URL pathname
 */

export const createLangPathByParam = (
    langParam: string | undefined,
    pathFragment: string
): Path["pathname"] => {
    const { SITE_LANGS } = SITE_CONFIG
    let newPath = ''
    const langParams = SITE_LANGS.map((it) => it.lang_param)
    const param = langParam ?? ''
    if (langParams.includes(param as SiteLangs["lang_code"])) {
        newPath = `/${param}${pathFragment}`
    } else {
        if (pathFragment === '/') {
            newPath = '/'
        } else {
            newPath = pathFragment
        }
    }
    if (newPath.endsWith('/')) newPath = newPath.substring(0, newPath.length - 1);
    if (newPath.startsWith('//')) newPath = newPath.substring(1)
    return createPath({ pathname: newPath })
}

export function createPathByPageNS(pageNamespace: PageNamespaces): Path["pathname"] {
  const { PAGE_CONFIG } = SITE_CONFIG
  let path = PAGE_CONFIG?.[pageNamespace]?.absolute_path
  if (path) return path
  return '/'
}

const replacePathParams = (path: string, params: Params): string => {
  return path.replace(/:([^/]+)/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
};

export function localizedPath(
  lang: Params["lang"],
  pageNamespace: PageNamespaces,
  param?:Params
): Path["pathname"] {
   let path = createPathByPageNS(pageNamespace)
   if (param) {
    path = replacePathParams(path, param)
   }
  return createLangPathByParam(lang, path)

}