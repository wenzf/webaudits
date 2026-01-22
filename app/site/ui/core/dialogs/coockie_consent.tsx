import * as Toast from "@radix-ui/react-toast";
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { useFetcher, useRouteLoaderData } from "react-router";
import { useCurrentURL } from "~/common/shared/hooks";
import MarkdownWithCustomElements from "~/site/shared/markdown";


export default function CookieConsent() {
    const currentURL = useCurrentURL()
    const settingsFetchter = useFetcher({ key: 'settingsFetcher' })
    const { locTxt } = useRouteLoaderData('site/routes/layouts/site_layout')

    const onChangeSettings = () => {
        settingsFetchter.submit({
            payload: JSON.stringify({ show_cookie_consent_message: false }),
            redirect_to: currentURL
        }, {
            method: "post",
            action: "/actions/cu-settings",
            encType: "application/x-www-form-urlencoded",
            preventScrollReset: true
        })
    }


    return (
        <>
            <Toast.Root duration={300_000}>
                <VisuallyHidden.VisuallyHidden>
                    <Toast.Title>
                        {locTxt.cookie_consent.title}
                    </Toast.Title>
                </VisuallyHidden.VisuallyHidden>

                <div className="flex flex-col gap-2">
                    <div className="border_squircle rounded flex flex-col gap-4 justify-between 
                    p-2 
                     bg-neutral-200 dark:bg-neutral-800 shadow shadow-neutral-500/80 text-neutral-950 dark:text-neutral-50"
                    >
                        <Toast.Description className="md_1 text-sm">
                            <MarkdownWithCustomElements
                                markup={locTxt.cookie_consent.msg_1}
                            />
                        </Toast.Description>
                        <Toast.Action

                            asChild
                            altText="OK"
                        >
                            <button
                                onClick={() => onChangeSettings()}
                                type="button"
                                className="b_1 reg ri active text-sm grow text-center">
                                {locTxt.cookie_consent.link_label}
                            </button>
                        </Toast.Action>
                    </div>
                </div>
            </Toast.Root>
        </>
    )
}