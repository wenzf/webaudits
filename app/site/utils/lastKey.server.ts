import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import { atob } from "node:buffer"
import { data } from "react-router"


export const lastKeyParamToJsonObject = (request: Request) => {
    const last = new URL(request.url).searchParams?.get('last') ?? null
    if (last) {
        try {
            const toStringified = atob(last)
            const parsed = JSON.parse(toStringified)
            return marshall(parsed)
        }
        catch {
            return data({
                feed: undefined,
                catch: 'last_key_invalid',
                lastKey: undefined
            })
        }
    }
    return undefined
}


export const lastKeyJsonObjectToParam = (obj?: {
    createdAt: { N: string },
    pk: { S: string },
    sk: { S: string },
}) => {
    const lastKeyObj = obj ? unmarshall(obj) : null
    if (lastKeyObj) {
        try {
            return btoa(JSON.stringify(lastKeyObj))
        }
        catch {
            return undefined
        }
    } else {
        return undefined
    }
}