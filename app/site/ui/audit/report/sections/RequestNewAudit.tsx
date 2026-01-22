import { NavLink, useParams, useRouteLoaderData } from "react-router";
import { CONFIG_AUDIT_RENEWAL_INTERVAL_IN_MS } from "~/audit_api/v1/audit.config";
import { langByParam } from "~/common/shared/lang";
import { formatTimestamp } from "~/site/utils/time";
import { localizedPath } from "~/common/shared/lang";

export default function RequestNewAudit({ auditResult }: { auditResult: PageAuditResult }) {
    const { is_bot } = useRouteLoaderData('root')
    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    const { lang } = useParams()

    const now = Date.now()

    if (((auditResult.created_at + CONFIG_AUDIT_RENEWAL_INTERVAL_IN_MS) > now)
        || is_bot) {
        return null
    }

    const { lang_html } = langByParam(lang)

    const sp = new URLSearchParams()
    sp.set('auditURL', encodeURI(auditResult.final_url))
    let path = localizedPath(lang, "NS_ECOS_V1") + "?" + sp.toString()

    return (
        <div className="my-6 flex justify-end">

            <div className="bg-neutral-50 dark:bg-neutral-950 p-2 flex gap-4 flex-wrap items-center border_squircle rounded ring ring-neutral-300 dark:ring-neutral-700 text-neutral-950 dark:text-neutral-50">
                <div className="p-2 text-lg">
                    {locTxt.request_new_audit.msg_1?.replace('{{date}}',
                        formatTimestamp(auditResult.created_at, lang_html)?.readable)}
                </div>

                <NavLink
                    viewTransition
                    className="b_1 reg ri active inline-flex items-center grow justify-center"
                    to={path}>
                    {locTxt.request_new_audit.link_label}
                </NavLink>
            </div>
        </div>
    )


}