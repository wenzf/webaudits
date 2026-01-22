import { useRouteLoaderData } from "react-router"

export default function AuditResultWarnings({ auditResult }: {
    auditResult: PageAuditResult
}) {
    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')

    const runWarnings = auditResult?.audit_about?.lh_run_warnings
    const lh_data_warnings = auditResult?.audit_about?.lh_data_warnings

    if (!runWarnings?.length && !lh_data_warnings?.length) return null

    let messages: string[] = []
    if (runWarnings?.length) messages = [...messages, ...runWarnings]
    if (lh_data_warnings?.length) messages = [...messages, ...lh_data_warnings]

    return (
        <div className="my-6 flex justify-end">

            <div className="bg-neutral-50 dark:bg-neutral-950 flex gap-4 p-2 max-w-full flex-wrap items-center border_squircle rounded ring ring-neutral-300 dark:ring-neutral-700 text-neutral-950 dark:text-neutral-50">
                <div className="text-lg p-2">
                    {locTxt.audit_warnings.msg_1}
                </div>

                <details className="md_1 flex flex-col grow max-w-full">
                    <summary
                        className=" b_1 reg ri active flex  grow items-center text-center justify-center"
                    >{locTxt.audit_warnings.show_details}</summary>
                    <ul className="mt-4 p-2 bg-neutral-100 dark:bg-neutral-900 overflow-x-auto">
                        {messages.map((it, ind) => (
                            <li key={ind}>
                                {it}
                            </li>
                        ))}
                    </ul>
                </details>

            </div>
        </div>
    )
} 