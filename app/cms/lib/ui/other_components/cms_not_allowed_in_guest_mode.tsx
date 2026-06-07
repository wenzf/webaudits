import { CircleBackslashIcon } from "@radix-ui/react-icons";
import { useRouteLoaderData } from "react-router";

export default function NotAllowedInGuestMode() {
    const {
        locTxt: {
            ui_labels: {
                ui_not_allowed_in_guest_mode
            } } } = useRouteLoaderData('cms/lib/routes/layouts/cms_root_layout')
    return (
        <span className="flex justify-center items-center ml-2">
          ({ui_not_allowed_in_guest_mode}
            <CircleBackslashIcon className="ml-1 mr-0.5 rotate-90" width={15} height={15} />)
        </span>
    )
}