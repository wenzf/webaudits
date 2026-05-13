import { Cross1Icon } from "@radix-ui/react-icons";
import { useEffect, useReducer, useRef, useState, type HTMLProps, type TextareaHTMLAttributes } from "react";
import { Rnd } from "react-rnd";
import { Link, useRouteLoaderData } from "react-router";
import { setProperty } from 'dot-prop';

import { useDebouncedCallback } from 'use-debounce';
import { useCMSStates } from "~/cms/cms_states";
import RadixSelect from "../radix/radix_select";
import CopytToClipboardButton from "../generics/g_copy_to_clipboard_button";
import { softwareApplicationformStructure, type FormConf } from "./ld_json_configs";
import clsx from "clsx";


export default function MarkupGenerator() {
    const [scrollYPos, setScrollYPos] = useState<null | number>(null)

    const [{
        ui_window_width,
    }, setCMSStates] = useCMSStates()

    const { locTxt: { ui_labels: { btn_close } }
    } = useRouteLoaderData('cms/routes/layouts/cms_root_layout')

    let markup = {}

    const [{
        markupType,
        formConfig,
        markupAsString

    }, dispatch] = useReducer(((st, act) => {
        return {
            ...st,
            ...act.reduce((
                i: Record<string, unknown>,
                j: Record<string, unknown>
            ) => ({ ...i, ...j }), {})
        }
    }), {
        markupType: null,
        formConfig: [],
        markupAsString: ""

    })

    const forms_ref = useRef<{ [key: string]: HTMLInputElement | HTMLTextAreaElement }>({})

    const setInputRef = (itemKey: string) => (element: HTMLInputElement | HTMLTextAreaElement | null) => {
        if (!forms_ref?.current) return
        if (element) {
            forms_ref.current[itemKey] = element;
        } else {
            delete forms_ref.current[itemKey];
        }
    };

    const onCloseComponent = () => {
        setCMSStates({
            type: 'change_bool',
            key: 'ui_show_markup_generator'
        })
    }

    const createInitObject = (conf: FormConf[]) => {
        for (let i = 0; i < conf.length; i += 1) {
            const item = conf[i]
            if (item.element_type === "input") {
                if (item?.input_props?.required && item.dataNamespaces && item.defaultValue) {
                    for (let j = 0; j < item.dataNamespaces.length; j += 1) {
                        setProperty(markup, item.dataNamespaces[j], item.defaultValue)
                    }
                }
            }
        }
        if (forms_ref?.current) {
            forms_ref.current.output.value = JSON.stringify(markup, null, 2)
            dispatch([{ markupAsString: JSON.stringify(markup, null, 2) }])
            // @ts-expect-error todo type
            if (forms_ref.current.output?.rows) forms_ref.current.output.rows = 20
        }
    }

    const onChangeInput = useDebouncedCallback(() => {
        if (forms_ref.current && formConfig.length) {
            for (let i = 0; i < formConfig.length; i += 1) {
                const configItem: FormConf = formConfig[i]
                const itemVal = forms_ref.current[configItem.id]?.value
                if (itemVal && configItem.dataNamespaces?.length) {
                    for (let i = 0; i < configItem.dataNamespaces.length; i += 1) {
                        setProperty(markup, configItem.dataNamespaces[i], itemVal)
                    }
                }
            }
        }
        forms_ref.current.output.value = JSON.stringify(markup, null, 2)
        dispatch([{ markupAsString: JSON.stringify(markup, null, 2) }])
    }, 1300)



    useEffect(() => {
        if (typeof window === "object") {
            setScrollYPos(window.scrollY)
        }
    }, [])


    return (
        <>
            {scrollYPos !== null && (
                <Rnd
                    className="z-[111] h-full w-full"
                    default={{
                        x: Math.round(ui_window_width / 2) - 12,
                        y: scrollYPos + 24,
                        width: '50%',
                        height: '90%',

                    }}
                >
                    <div className="overflow-auto z-[111] bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 rounded h-full w-full border border-neutral-500 overflow-hidden">
                        <div className="flex p-2 gap-2 justify-between">
                            <div className='p-2 text-slate-800 dark:text-slate-200 text-xl font-semibold text-2xl'>
                                LD+JSON Generator
                            </div>
                            <div className="flex gap-2 ">

                                <button
                                    type="button"
                                    className="btn_1 icon small"
                                    onClick={() => onCloseComponent()}
                                >
                                    <Cross1Icon aria-label={btn_close} width={16} height={16} />
                                </button>
                            </div>
                        </div>

                        <div className="p-2">
                            <RadixSelect
                                placeholder="Type"
                                selectItems={[
                                    ["Software Application", "ld_json_schema_software"]
                                ]}
                                selectRootProps={{
                                    onValueChange: (e) => {
                                        dispatch([{ markupType: e }])

                                        if (e === "ld_json_schema_software") {
                                            dispatch([{ formConfig: softwareApplicationformStructure }])
                                            createInitObject(softwareApplicationformStructure)
                                        }
                                    }
                                }}
                            />
                        </div>

                        <div className="p-2 overflow-y-auto max-h-full">

                            {markupType === "ld_json_schema_software" &&
                                <div className="my-8 text-right">
                                    <Link className="underline text-slate-800 dark:text-slate-200" target="_blank" rel="noopener noreferrer" to="https://developers.google.com/search/docs/appearance/structured-data/software-app">
                                        Google Documentation
                                    </Link>
                                </div>}

                            {formConfig?.length ? formConfig.map((it: FormConf) => (
                                <div key={it.id} className={clsx({ "pb-3": it.input_type !== "hidden" })}>
                                    {it.element_type === "section" && (
                                        <div className="mt-4 text-xl border-b border-neutral-300 dark:border-neutral-700">{it.label}</div>
                                    )}

                                    {it.element_type === "input" && (
                                        <>
                                            {(!it.input_type?.startsWith('custom_') && !it.input_type?.startsWith('textarea')) && (
                                                <div className={clsx({ "flex gap-2 py-2": it.input_type !== "hidden" })}>
                                                    {it.input_type !== "hidden" &&
                                                        <label htmlFor={it.id}>{it.label}
                                                            {it.input_props?.required &&
                                                                <span className="text-amber-700 dark:text-amber-300"> *</span>}
                                                        </label>
                                                    }
                                                    <input
                                                        onChange={() => onChangeInput()}
                                                        // @ts-expect-error todo type
                                                        ref={setInputRef(it.id)}
                                                        className={clsx({ "inp_1 grow": it.input_type !== "hidden" })}
                                                        type={it.input_type}
                                                        id={it.id}
                                                        defaultValue={it.defaultValue}
                                                        {...it.input_props}
                                                    />
                                                </div>
                                            )}

                                            {it.input_type === "textarea" && (
                                                <div className={clsx("flex gap-2 py-2")}>

                                                    <label htmlFor={it.id}>{it.label}
                                                        {it.input_props?.required &&
                                                            <span className="text-amber-700 dark:text-amber-300"> *</span>}
                                                    </label>
                                                    <textarea
                                                        onChange={() => onChangeInput()}
                                                        // @ts-expect-error todo type
                                                        ref={setInputRef(it.id)}
                                                        className={clsx("inp_1 grow")}
                                                        id={it.id}
                                                        defaultValue={it.defaultValue}
                                                        {...it.input_props}
                                                    />
                                                </div>
                                            )}


                                            {it.input_type === "custom_select" && (
                                                <div className="flex gap-2 items-center">

                                                    <div>{it.label}
                                                        {it.input_props?.required &&
                                                            <span className="text-amber-700 dark:text-amber-300"> *</span>}
                                                    </div>
                                                    <RadixSelect

                                                        placeholder="Type"
                                                        selectItems={it.options.selectItems}
                                                        selectRootProps={{
                                                            onValueChange: (e) => {
                                                                if (it.dataNamespaces?.length) {
                                                                    for (let i = 0; i < it.dataNamespaces.length; i += 1) {
                                                                        setProperty(markup, it.dataNamespaces[i], e)
                                                                    }
                                                                }
                                                                onChangeInput()
                                                            }
                                                        }}
                                                    />

                                                    <input type="hidden"
                                                        defaultValue={it.defaultValue}
                                                        id={it.id}
                                                        ref={setInputRef(it.id)}
                                                    />

                                                </div>
                                            )}

                                            {it?.note && <div className="text-right"><em>{it.note}</em></div>}

                                        </>
                                    )}
                                </div>
                            )) : null}

                            <div className={clsx("relative", { "hidden": !markupAsString })}
                            >
                                <textarea
                                    ref={setInputRef('output')}
                                    className="inp_1 resize w-full"
                                    onChange={(e) => dispatch([{ markupAsString: e.target.value }])}
                                />

                                <CopytToClipboardButton
                                    buttonProps={{ className: 'btn_3 icon small absolute top-2 right-2' }}
                                    copyText={"[" + markupAsString + "]"}
                                />
                            </div>
                        </div>
                    </div>
                </Rnd>

            )}
        </>
    )
}