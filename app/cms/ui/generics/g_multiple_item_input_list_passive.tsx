import { CheckCircledIcon, CrossCircledIcon, MinusCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons"
import {
    useCallback, useEffect, useId, useState, type ButtonHTMLAttributes,
    type HTMLInputTypeAttribute, type InputHTMLAttributes,
    type TextareaHTMLAttributes
} from "react"
import { parseJSON } from "~/common/shared/misc"
import RadixSelect from "../radix/radix_select"


export type Items_Config = {
    item_namespace: string
    input_type: "number" | "text" | "textarea" | "url" | "custom_select",
    input_label: string,
    input_props?: InputHTMLAttributes<HTMLInputElement | HTMLInputTypeAttribute> & TextareaHTMLAttributes<HTMLTextAreaElement>,
    is_json?: boolean
    check_json?: boolean,
    in_search?: boolean,
    custom_config?: Record<string, any>
}

export default function MulitpleItemInputListPassive({
    data_namespace,
    group_label,
    items_config,
    add_button_attributes,
    default_value,
}: {
    data_namespace: string
    group_label: string
    items_config: Items_Config[]
    add_button_attributes?: ButtonHTMLAttributes<HTMLButtonElement>
    default_value?: Record<string, string | number | Record<string, string | number>>[],
}) {
    const dv: [string, Record<string, string | number | Record<string, string | number>>][] = default_value?.length
        ? default_value.map((it, ind) => [(Date.now() - ind).toString(32), it])
        : []

    const [list, setList] = useState<[string, Record<string, string | number | Record<string, string | number>>][]>(dv)
    const [trig, setTrig] = useState(0)
    const [jsonCheck, setJsonCheck] = useState({})
    const uid = useId()
    const [isClient, setIsClient] = useState(false)

    const empty_item = items_config ? items_config.reduce((acc: Record<string, string | number>, it) => {
        acc[it.item_namespace] = '';
        return acc;
    }, {}) : {};

    const outputCB = useCallback(() => {
        const red = list.map((it) => it[1])
        try {
            let outp: any = []
            red.forEach((itt) => {
                if (typeof itt === "object") {
                    const oe = Object.entries(itt)
                    let pa = {}
                    oe.forEach((iii) => {
                        pa = { ...pa, [iii[0]]: parseJSON(iii[1]) ?? iii[1] }
                    })
                    outp = [...outp, pa]
                }
            })
            return JSON.stringify(outp)
        } catch {
            null
        }
    }, [trig])

    useEffect(() => setTrig((prev) => prev + 1), [])
    const output = outputCB()

    useEffect(() => setIsClient(true), [])

    if (!isClient) return null

    return (
        <div className="w-full">
            <div className="flex gap-4 pb-4">
                <div>{group_label}</div>
                <button
                    type="button"
                    className='btn_1 icon small'
                    onClick={() => setList((prev) => [...prev, [Date.now().toString(32), empty_item]])}
                    {...add_button_attributes}
                >
                    <PlusCircledIcon width={16} height={16} aria-label={"add item"} />
                </button>
            </div>
            <ul>
                {list.map(([key, value], idx) => (
                    <li key={`${uid}-${key}`}>
                        <div className="flex gap-4 border-t border-neutral-300 dark:border-neutral-700 py-2">
                            <ul className="list-disc pl-6 w-full">
                                {Object.entries(value).map(([item_key, item_value]) => {
                                    const item = items_config.find((ii) => ii.item_namespace === item_key)
                                    return (
                                        <li key={`${uid}-${item_key}-${key}`} className="pb-2 w-full">
                                            <div className="flex gap-2 flex-wrap relative">
                                                <label htmlFor={`${uid}-id-${key}-${item_key}`}>
                                                    {item?.input_label}
                                                </label>
                                                {item?.input_type === "textarea" && (
                                                    <textarea
                                                        onChange={(e) => {
                                                            setTrig((prev) => prev + 1)
                                                            setList((prev) => {
                                                                const copy = prev;
                                                                copy[idx][1][item.item_namespace] = e.target.value
                                                                return copy
                                                            })
                                                            if (item?.check_json) {
                                                                setJsonCheck((prev) => ({
                                                                    ...prev, [`${uid}-id-${key}-${item_key}`]: parseJSON(e.target.value)
                                                                }))
                                                            }
                                                        }
                                                        }
                                                        id={`${uid}-id-${key}-${item_key}`}
                                                        className="inp_1 grow resize"
                                                        defaultValue={item.is_json ? JSON.stringify(item_value, null, 2) : item_value as string}
                                                        {...item.input_props}
                                                    />
                                                )}
                                                {(item?.input_type === "number" || item?.input_type === "text" || item?.input_type === "url") && (
                                                    <input
                                                        className="inp_1 grow"
                                                        id={`${uid}-id-${key}-${item_key}`}
                                                        defaultValue={
                                                            item.is_json ? JSON.stringify(item_value, null, 2) :
                                                                (item.input_type === "url" && !item_value) ? "https://" :
                                                                    item_value as string | number
                                                        }

                                                        onChange={(e) => {
                                                            setTrig((prev) => prev + 1)
                                                            setList((prev) => {
                                                                const copy = prev;
                                                                copy[idx][1][item.item_namespace] = e.target.value
                                                                return copy
                                                            })
                                                            if (item?.check_json) {
                                                                setJsonCheck((prev) => ({
                                                                    ...prev, [`${uid}-id-${key}-${item_key}`]: parseJSON(e.target.value)
                                                                }))
                                                            }
                                                        }}
                                                        {...item.input_props}
                                                        type={item.input_type}
                                                    />
                                                )}
                                                {item?.input_type === "custom_select" && item?.custom_config ? (
                                                    <div>
                                                        <RadixSelect
                                                            id={`${uid}-id-${key}-${item_key}`}
                                                            placeholder={item.custom_config?.placeholder ?? 'SELECT'}
                                                            selectItems={item.custom_config?.select_items as [string, string][] ?? []}
                                                            selectRootProps={{
                                                                name: item.item_namespace,
                                                                defaultValue: (item_value ?? '') as string,
                                                                onValueChange: (e) => {
                                                                    setTrig((prev) => prev + 1)
                                                                    setList((prev) => {
                                                                        const copy = prev;
                                                                        copy[idx][1][item.item_namespace] = e
                                                                        return copy
                                                                    })
                                                                }
                                                            }}
                                                        />

                                                    </div>
                                                ) : null}

                                                {item?.check_json && `${uid}-id-${key}-${item_key}` in jsonCheck ? (
                                                    <div className="absolute bottom-1 right-3 z-40">
                                                        { // @ts-expect-error asdfasfd
                                                            jsonCheck[`${uid}-id-${key}-${item_key}`] ? (
                                                                <CheckCircledIcon width={20} height={20}
                                                                    aria-hidden
                                                                    className="text-green-800 dark:text-green-300" />
                                                            ) : (
                                                                <CrossCircledIcon width={20} height={20}
                                                                    aria-hidden
                                                                    className="text-red-800 dark:text-red-300" />
                                                            )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                            <button
                                type='button'
                                className='btn_1 icon small'
                                onClick={() => {
                                    setTrig((prev) => prev + 1)
                                    setList((prev) => prev.filter((pre) => pre[0] !== key))
                                }}
                            >
                                <MinusCircledIcon width={16} height={16} aria-label="remove item" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <input type="hidden" value={output} name={data_namespace} />
        </div>
    )
}


