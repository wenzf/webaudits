import { NavLink, useParams } from "react-router";
import type { PageConfig, PKMainKey } from "../../../types/site";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { langByParam } from "../shared/lang";

export default function EditButton({ is_editable }: {
    is_editable?: {
        pk_main: PKMainKey,
        sk: string,
        has_param: boolean
    }
}) {
    const params = useParams()
    if (!is_editable) return null
    const { lang_code } = langByParam(params.lang)
    const { pk_main, sk, has_param } = is_editable
    let path = `/cms/editor/${pk_main}_${lang_code}/`

    if (has_param) {
        path += params[sk]
    } else {
        path += sk
    }

    return (
        <div className="fixed bottom-1/2 right-1 z-[999] flex">
            <NavLink to={path} aria-label="edit document"
                className="inline-flex bg-slate-700 dark:bg-slate-300 text-slate-50 dark:text-slate-950 rounded hover:bg-slate-800 dark:hover:bg-slate-200"
            >
                <Pencil2Icon width={33} height={33} aria-hidden />
            </NavLink>
        </div>
    )
}