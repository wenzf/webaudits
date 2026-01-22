import { getProperty, setProperty, deleteProperty } from 'dot-prop';


function groupBySortPos(data: AuditResponseStruc[]): AuditResponseStruc[][] {
    const grouped = data.reduce((acc, item) => {
        const key = item.iteration_step;
        if (acc[key]) {
            acc[key].push(item)
        } else {
            acc[key] = [item]
        }
        return acc;
    }, {} as Record<number, AuditResponseStruc[]>);
    return Object.values(grouped)
}


function raw_responses_to_obj_by_config(
    raw_response_object: Record<string, unknown>,
    audit_response_strucs: AuditResponseStruc[],
    _outp?: Record<string, unknown>
) {
    let outp = _outp ?? {}
    for (let i = 0; i < audit_response_strucs.length; i += 1) {
        const { get, set, method, func } = audit_response_strucs[i]
        let input_value
        if (typeof get === "string") {
            if (get === "*") {
                input_value = raw_response_object
            } else {
                input_value = getProperty(raw_response_object, get)
            }
        }
        let output_value

        if (method === "delete") {
            deleteProperty(outp, set)
        } else {
            if (method === "func") {
                if (typeof func === "function") {
                    if (input_value !== undefined) {
                        output_value = func(input_value)
                    } else {
                        output_value = func()
                    }
                }
            } else if (method === "get_set") {
                output_value = input_value
            }
            if (set?.length) {
                setProperty(outp, set, output_value)
            } else if (output_value) {
                outp = output_value
            }

        }
    }
    return outp
}


export default function compose_data_by_config(
    raw_response_object: Record<string, unknown>,
    audit_response_strucs: AuditResponseStruc[],
    _outp: Record<string, unknown>
) {
    const sorted_response_structure = groupBySortPos(audit_response_strucs)
    let outp = _outp
    for (let i = 0; i < sorted_response_structure.length; i += 1) {
        outp = raw_responses_to_obj_by_config(
            Object.keys(_outp).length ? outp : raw_response_object,
            sorted_response_structure[i],
            outp
        )
    }
    return outp
}