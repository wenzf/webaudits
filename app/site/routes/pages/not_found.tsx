import { data } from "react-router"
import NotFoundLang from "~/site/ui/core/other/notFoundLang"


export const loader = async () => {
    return data(null, {status: 404})
}


export default function NotFound() {
    return <NotFoundLang />
}