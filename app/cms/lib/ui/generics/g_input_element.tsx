import { useId } from "react"
import type {  HTMLAttributes, HTMLInputTypeAttribute, InputHTMLAttributes, LabelHTMLAttributes } from "react"


/**
 * @param label label text, used for htmlFor and input id
 * @param wrapperProps className: input_wrapper
 * @param inputProps type: text, className: inp_1
 * @param uid useId()
 * @returns input and label element, wrapped in a div
 */


export default function InputElement({
    label,
    wrapperProps = {},
    labelProps = {},
    inputProps = {},
    uid,
    isRequired
}: {
    label: string
    wrapperProps?: HTMLAttributes<HTMLDivElement>
    labelProps?: LabelHTMLAttributes<HTMLLabelElement>
    inputProps?: InputHTMLAttributes<HTMLInputElement | HTMLInputTypeAttribute> & React.RefAttributes<HTMLInputElement>
    uid?: boolean,
    isRequired?: boolean
}) {
    if (!uid) {
        const id = label.toLowerCase().replaceAll(' ', '-')
        if (!labelProps?.htmlFor) labelProps.htmlFor = id
        if (!inputProps?.id) inputProps.id = id
    } else {
        const uniqueId = useId()
        inputProps.id = uniqueId
        labelProps.htmlFor = uniqueId
    }
    if (!wrapperProps?.className) wrapperProps.className = "input_wrapper flex gap-4 items-center wrap"
    if (!inputProps?.className) inputProps.className = 'inp_1'
    if (!inputProps?.type) inputProps.type = 'text'
    if (isRequired) {
        inputProps.required = true
        labelProps.className ? labelProps.className += ' required' : labelProps.className = 'required'
    }

    return (
        <div {...wrapperProps}>
            <label {...labelProps}>{label}</label>
            <input {...inputProps} />
        </div>
    )
}