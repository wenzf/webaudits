import { Fragment } from "react"

export default function UrlWithLinebreaks({url}: {url:string}) {

    const splitUrl = url.split('.')

    return splitUrl.map((it, ind) => (
        <Fragment key={ind}>
            {it}{(ind +1)  !== splitUrl.length ? '.' : ''}<wbr/>
        </Fragment>
    ))
}