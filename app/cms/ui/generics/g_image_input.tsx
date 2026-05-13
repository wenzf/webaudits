import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons"
import { useEffect, useId, useReducer, type HTMLProps } from "react"
import { parseJSON } from "~/common/shared/misc"

export default function ImageInput({
    data_namespace,
    default_value,
    is_active,
    text_area_props = { className: 'inp_1 resize w-full grow' },
    wrapper_props = { className: 'w-full' },
    data_keys,
}: {
    data_keys: string[]
    data_namespace?: string
    default_value?: Record<string, string | number>
    is_active?: boolean
    text_area_props?: HTMLProps<HTMLTextAreaElement>
    wrapper_props?: HTMLProps<HTMLDivElement>
}) {

    const uid = useId()
    const id = `${data_namespace ?? 'id'}-${uid}`

    const [state, dispatch] = useReducer(((st, act) => {
        return {
            ...st,
            ...act.reduce((
                i: Record<string, unknown>,
                j: Record<string, unknown>
            ) => ({ ...i, ...j }), {})
        }
    }), {
        input_raw: JSON.stringify(default_value),
        input_parsed: default_value,
        is_json_valid: false,
        is_data_structure_valid: false,
        preview_image_props: {}
    })


    const onChangeInput = (e: string) => {
        const parsedJson = parseJSON(e) as Partial<HTMLProps<HTMLImageElement>>
        if (parsedJson) {
            let isValid = true

            for (let i = 0; i < data_keys.length; i += 1) {
                if (!parsedJson.hasOwnProperty(data_keys[i])) isValid = false
            }

            if (!isValid) {
                dispatch([
                    { is_data_structure_valid: false }
                ])
            } else {
                let previewImageProps: HTMLProps<HTMLImageElement> = {}

                if (parsedJson.hasOwnProperty('src')) {
                    previewImageProps = {
                        ...previewImageProps,
                        src: parsedJson.src
                    }
                }

                if (parsedJson.hasOwnProperty('srcSet')) {
                    previewImageProps = {
                        ...previewImageProps,
                        srcSet: parsedJson.srcSet
                    }
                }

                if (parsedJson.hasOwnProperty('width')) {
                    previewImageProps = {
                        ...previewImageProps,
                        width: parsedJson.width
                    }
                }

                if (parsedJson.hasOwnProperty('height')) {
                    previewImageProps = {
                        ...previewImageProps,
                        height: parsedJson.height
                    }
                }

                if (parsedJson.hasOwnProperty('alt')) {
                    previewImageProps = {
                        ...previewImageProps,
                        alt: parsedJson.alt
                    }
                }

                dispatch([
                    { is_data_structure_valid: true },
                    { preview_image_props: previewImageProps }
                ])


            }
            dispatch([{ is_json_valid: true }])
        } else {
            dispatch([
                { is_json_valid: false },
                { is_data_structure_valid: false }
            ])
        }

        dispatch([{ input_parsed: parsedJson }, { input_raw: e }])

    }


    let wrapperProps: HTMLProps<HTMLDivElement> = {
        ...wrapper_props
    }


    let textAreaProps: HTMLProps<HTMLTextAreaElement> = {
        id,
        ...text_area_props,
    }

    if (data_namespace) {
        textAreaProps = {
            ...textAreaProps,
            name: data_namespace
        }
    }

    if (default_value) {
        textAreaProps = {
            ...textAreaProps,
            defaultValue: JSON.stringify(default_value, null, 2)
        }
    }

    textAreaProps = {
        ...textAreaProps,
        onChange: (e) => onChangeInput(e.currentTarget.value),
    }

    useEffect(() => {
        onChangeInput(JSON.stringify(default_value))
    }, [default_value])


    return (
        <div {...wrapperProps}>

            <div className="relative">
                <textarea  {...textAreaProps} />
                {state.input_raw?.length ? (
                    <div className="absolute top-2 right-4 flex flex-col">
                        {state.is_json_valid ? (
                            <div className="text-green-800 dark:text-green-300 flex gap-2 justify-end">
                                <CheckCircledIcon width={20} height={20}
                                    aria-hidden />
                                JSON OK
                            </div>
                        ) : (
                            <div className="text-red-800 dark:text-red-300 flex gap-2 justify-end">
                                <CrossCircledIcon width={20} height={20}
                                    aria-hidden />
                                JSON NOK
                            </div>
                        )}

                        {state.is_data_structure_valid ? (
                            <div className="text-green-800 dark:text-green-300 flex gap-2 justify-end">
                                <CheckCircledIcon width={20} height={20}
                                    aria-hidden />
                                structure OK
                            </div>
                        ) : (
                            <div className="text-red-800 dark:text-red-300 flex gap-2 justify-end">
                                <CrossCircledIcon width={20} height={20}
                                    aria-hidden />
                                structure NOK
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            <div>
                {state.is_data_structure_valid
                    ? <img {...state.preview_image_props} />
                    : 'enter image config to see preview'}
                {
                    //@ts-expect-error TODO
                    state.preview_image_props?.alt ? (
                        <div className="bg-neutral-100 dark:bg-neutral-900 p-2">
                            alt: {
                                //@ts-expect-error TODO
                                state.preview_image_props?.alt}
                        </div>
                    ) : null}
            </div>
        </div>
    )

}