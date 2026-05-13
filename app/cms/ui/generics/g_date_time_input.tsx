import { useId, useState, type BaseSyntheticEvent, type HTMLProps } from "react";
import { convertUnixToDatetimeLocal } from "~/site/utils/time";


export default function DateTimeInput({
    default_value,
    data_namespace,
    inputProps
}: {
    default_value?: number
    data_namespace: string
    inputProps?: HTMLProps<HTMLInputElement>
}) {
    const [timeStamp, setTimestamp] = useState(default_value ?? Date.now)
    const uid = useId()

    const onChangeDate = (e: BaseSyntheticEvent) => {
        const inp = e.currentTarget.value

        const unixEpoche = Date.parse(inp)
        if (isNaN(unixEpoche)) {
            setTimestamp(1)
        }
        setTimestamp(unixEpoche)
    }

    return (
        <div>
            <input
                className="inp_1"
                onChange={onChangeDate}
                type="datetime-local"
                defaultValue={convertUnixToDatetimeLocal(timeStamp)}
                {...inputProps}
            />
            {" "}
            <input id={`asint-${uid}`} className="font-mono" type="text"
                readOnly value={`(UNIX epoch: ${timeStamp})`} />
            <input type="hidden" name={data_namespace} value={timeStamp} />
        </div>
    )
}