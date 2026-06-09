import { CopyIcon } from "@radix-ui/react-icons";
import { type ButtonHTMLAttributes } from "react";

import { useCMSStates } from "~/cms/lib/cms_states";

export default function CopytToClipboardButton({
    copyText,
    buttonProps
}: {
    copyText: string,
    buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>,
}) {
    const [, setCMSStates] = useCMSStates()
    const copyToClip = async () => {
        if (typeof navigator === "object" && "clipboard" in navigator) {
            await navigator.clipboard.writeText(copyText)
            setCMSStates({ type: "change_bool", key: "ui_show_copied_to_clipboard" })
        }
    }

    return (
        <button
            onClick={() => copyToClip()}
            {...buttonProps}
        >
            <CopyIcon width={20} height={20} aria-label="Copy to clipboard" />
        </button>

    )
}