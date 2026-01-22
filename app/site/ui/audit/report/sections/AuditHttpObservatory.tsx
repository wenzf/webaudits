import { CheckIcon, Cross1Icon } from "@radix-ui/react-icons"

export default function AuditHttpObservatory({
    httpObservatoryResult,
    locTxt
}: {
    httpObservatoryResult: ObservatoryResult
    locTxt: Record<string, any>
}) {


    return (
        <div className="mt-12">
            <div className="overflow-auto">
                <table className="table_1 min-w-5xl">
                    <caption>
                        {locTxt.http_observatory_labels.hol_results_caption}
                    </caption>
                    <tbody>
                        <tr>
                            <th>{locTxt.http_observatory_labels.hol_orgingal_score}</th>
                            <td className="font-mono" colSpan={2}>{httpObservatoryResult.http_observatory_score}/100</td>
                        </tr>
                        <tr>
                            <th>{locTxt.http_observatory_labels.hol_grade}</th>
                            <td colSpan={2}>{httpObservatoryResult.grade}</td>
                        </tr>
                        <tr>
                            <th rowSpan={2}>{locTxt.http_observatory_labels.hol_tests}</th>

                            <th>{locTxt.http_observatory_labels.hol_passed}</th>
                            <td  className="font-mono">{httpObservatoryResult.testsPassed}</td>
                        </tr>
                        <tr>
                            <th>{locTxt.http_observatory_labels.hol_failed}</th>
                            <td  className="font-mono">{httpObservatoryResult.testsFailed}</td>
                        </tr>
                    </tbody>
                </table>

                <table className="table_1 mt-12 min-w-5xl">
                    <caption>{locTxt.http_observatory_labels.hol_details_caption}</caption>
                    <thead>
                        <tr>
                            <th>{locTxt.http_observatory_labels.hol_test}</th>
                            <th className="w-12">{locTxt.http_observatory_labels.hol_passed}</th>
                            <th className="w-12">{locTxt.http_observatory_labels.hol_modifier}</th>
                            <th>{locTxt.http_observatory_labels.hol_result}</th>
                            <th>{locTxt.http_observatory_labels.hol_description}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {httpObservatoryResult.tests.map((it, ind) => (
                            <tr key={ind}>
                                <td>{locTxt.http_observatory_tests[it.name]}</td>
                                <td>{it.pass ? <CheckIcon /> : <Cross1Icon />}</td>
                                <td  className="font-mono">{it.scoreModifier}</td>
                                <td  className="font-mono text-sm">{it.result}</td>
                                <td>{locTxt.http_observatory_results[it.result]}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>


            </div>
        </div>
    )

}