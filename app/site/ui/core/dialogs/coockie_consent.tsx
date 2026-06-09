import * as Toast from "@radix-ui/react-toast";
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { useFetcher, useRouteLoaderData } from "react-router";

import { useCurrentURL } from "~/common/shared/hooks";
import MarkdownWithCustomElements from "~/common/shared/markdown"


export default function CookieConsent() {
    const currentURL = useCurrentURL()
    const settingsFetchter = useFetcher({ key: 'settingsFetcher' })
    const { locTxt } = useRouteLoaderData('site/routes/layouts/site_layout')
    const { csrfToken } = useRouteLoaderData('root')

    const onChangeSettings = () => {
        try {
            settingsFetchter.submit({
                payload: JSON.stringify({ show_cookie_consent_message: false }),
                redirect_to: currentURL,
                csrf: csrfToken
            }, {
                method: "post",
                action: "/actions/cu-settings",
                encType: "application/x-www-form-urlencoded",
                preventScrollReset: true,
                defaultShouldRevalidate: true
            })
        } catch {
            null
        }
    }


    return (
        <>
            <Toast.Root duration={300_000}>
                <VisuallyHidden.VisuallyHidden>
                    <Toast.Title>
                        {locTxt.cookie_consent.title}
                    </Toast.Title>
                </VisuallyHidden.VisuallyHidden>

                <div className="flex flex-col gap-2 max-w-[calc(100vw_-_4px)]">
                    <div className="border_squircle rounded flex flex-col ml-2 gap-4 justify-between p-2 bg-pink-950 ring ring-pink-900 text-pink-50">
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
                                className="text font-medium rounded-sm grow text-center bg-pink-50 text-pink-950 hover:bg-pink-100 p-2"
                            >
                                {locTxt.cookie_consent.link_label}
                            </button>
                        </Toast.Action>
                    </div>
                </div>
            </Toast.Root>
        </>
    )
}