import { useRouteLoaderData } from "react-router";
import { VisxDonutWithPie } from "~/site/ui/charts/visx_donut_with_pie";
import { createTransferResourceData } from "~/site/utils/data";

export default function AuditStatsTransferByType({
    type, data_raw }:
    {
        type: "requests" | "sizes",
        data_raw: PageAuditResult["audit_data_points"]["lh"]["resources"]
    }) {

    const { locTxt } = useRouteLoaderData('site/routes/pages/audits_ecos_v1_id')
    const { resources, origin, total } = createTransferResourceData(
        data_raw,
        type,
        locTxt.lh_resource_types
    )

    const labels = locTxt[`lh_resources_${type}`]

    let title, aria_label

    if (type === "requests") {
        title = locTxt?.aria_labels_and_titles?.file_composition_requests?.title
        aria_label = locTxt?.aria_labels_and_titles?.file_composition_requests?.aria_label
    } else if (type === "sizes") {
        title = locTxt?.aria_labels_and_titles?.file_composition_size?.title
        aria_label = locTxt?.aria_labels_and_titles?.file_composition_requests?.aria_label
    }


    return (
        <div className="flex mt-16 flex-col lg:flex-row gap-4">

            <div className="lg:w-1/3">


                <table className="table_1">
                    <caption>{labels.table_caption}</caption>
                    <thead>
                        <tr>
                            <th><span className="visually-hidden" >empty space</span></th>
                            <th>{labels.data_absolute}</th>
                            <th>{labels.data_relative}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th className="bg-neutral-50 dark:bg-neutral-950 font-semibold" colSpan={3}>{labels.data_types}</th>
                        </tr>
                        {resources.map((it) => (
                            <tr key={it.key}>
                                <th>{it.label}</th>
                                <td className="font-mono">{it.absolute}</td>
                                <td className="font-mono">{it.relative}%</td>
                            </tr>
                        ))}
                        {total.map((it) => (
                            <tr key={it.key}>
                                <th className="font-semibold">{it.label}</th>
                                <td className="font-mono">{it.absolute}</td>
                                <td className="font-mono">{it.relative}%</td>
                            </tr>
                        ))}
                        <tr>
                            <th className="bg-neutral-50 dark:bg-neutral-950 font-semibold" colSpan={3}>{labels.data_origin}</th>
                        </tr>
                        {origin.map((it, ind) => (
                            <tr key={ind}>
                                <th>{it.label}</th>
                                <td className="font-mono">{it.absolute}</td>
                                <td className="font-mono">{it.relative}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="max-w-full lg:w-2/3">
                <VisxDonutWithPie dataDonut={resources} dataPie={origin} dataTotal={total} width={768} height={512}
                    aria_label={aria_label} title={title}
                />
            </div>

        </div>
    )
}