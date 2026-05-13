import * as Switch from "@radix-ui/react-switch";
import { useId, type HTMLAttributes } from "react";


const RadixSwitch = ({
    label,
    frameHTMLDivAttributes,
    labelHTMLAttributes,
    switchRootProps,
    switchThumbProps
}: {
    label?: string,
    frameHTMLDivAttributes?: HTMLAttributes<HTMLDivElement>
    labelHTMLAttributes?: HTMLAttributes<HTMLLabelElement>
    switchRootProps?: Switch.SwitchProps
    switchThumbProps?: Switch.SwitchThumbProps

}) => {
    const id = `${label?.replaceAll(' ', '-').toLowerCase() ?? ''}${useId()}`

    return (
        <div {...frameHTMLDivAttributes}>
            {label && (
                <label
                    className="col_gray_11 leading-[1.4] select-none"
                    htmlFor={id}
                    {...labelHTMLAttributes}
                >
                    {label}
                </label>
            )}
            <Switch.Root className="rdx-switch-root"
                id={id}
                {...switchRootProps}
            >
                <Switch.Thumb
                    className="rdx-switch-thumb bg_gray_1"
                    {...switchThumbProps}
                />
            </Switch.Root>
        </div>
    )
};

export default RadixSwitch;
