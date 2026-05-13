import { MinusCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import {
    useEffect, useReducer, useRef, useState, type ButtonHTMLAttributes, type Dispatch,
    type HTMLAttributes, type HTMLInputTypeAttribute,
    type InputHTMLAttributes, type SetStateAction
} from "react";
import { useRouteLoaderData } from "react-router";


export default function InputList({
    setter,
    addButtonAttributes,
    minusButtonAttributes,
    inputAttributes,
    wrapperDivAttributes,
    defaultValues
}: {
    setter: Dispatch<SetStateAction<(string | number)[]>>
    addButtonAttributes?: ButtonHTMLAttributes<HTMLButtonElement>
    minusButtonAttributes?: ButtonHTMLAttributes<HTMLButtonElement>
    inputAttributes?: InputHTMLAttributes<HTMLInputElement | HTMLInputTypeAttribute>
    wrapperDivAttributes?: HTMLAttributes<HTMLDivElement>
    defaultValues?: (string | number)[]
}) {

    const initialDefault = useRef(defaultValues)

    const {
        locTxt: {
            ui_labels: {
                add, remove
            }
        } } = useRouteLoaderData('cms/routes/layouts/cms_root_layout')

    const dv: [string, (string | number)][] = defaultValues?.length
        ? defaultValues.map((it, ind) => [(Date.now() - ind).toString(32), it])
        : []

    const [list, setList] = useState<[string, (string | number)][]>(dv)
    const [_, forceUpdate] = useReducer((x) => (x += 1), 0)

    const listAsString = JSON.stringify(list)
    const defaultValuesAsString = JSON.stringify(defaultValues)


    useEffect(() => {
        setter(list.map((it) => it[1]))
    }, [listAsString])

    useEffect(() => {
        if (defaultValues !== initialDefault.current) {
            const dv2: [string, (string | number)][] = defaultValues?.length
                ? defaultValues.map((it, ind) => [(Date.now() - ind).toString(32), it])
                : []
            setList(dv2)
        }
    }, [defaultValuesAsString])


    return (
        <div
            className="input_wrapper flex gap-4 items-center flex-wrap"
            {...wrapperDivAttributes}
        >
            <button
                type="button"
                className='btn_1 icon small'
                onClick={() => setList((prev) => [...prev, [Date.now().toString(32), '']])}
                {...addButtonAttributes}
            >
                <PlusCircledIcon width={16} height={16} aria-label={add} />
            </button>
            {list?.length ? (
                <div>
                    {list.map((it, ind) => (
                        <div
                            key={it[0]}
                            className="pb-1 flex gap-4 items-center flex-wrap"
                        >
                            <label htmlFor={`tag_${ind}`}>
                                <code>{ind.toString()}</code>
                            </label>
                            <input
                                defaultValue={it[1]}
                                type='text'
                                className='inp_1'
                                id={`tag_${ind}`}
                                onChange={(e) => {
                                    setList((prev) => {
                                        const copy = prev
                                        copy[ind][1] = e.target.value
                                        return copy
                                    })

                                       forceUpdate()
                                         // e.currentTarget.focus()

                                }}
                                {...inputAttributes}
                            />
                            <button
                                type='button'
                                className='btn_1 icon small'
                                onClick={() => {
                                    setList((prev) => prev.filter((pre) => pre[0] !== it[0]))
                                }}
                                {...minusButtonAttributes}
                            >
                                <MinusCircledIcon width={16} height={16} aria-label={remove} />
                            </button>

                        </div>
                    ))}
                </div>
            ): null}
        </div>
    )
}