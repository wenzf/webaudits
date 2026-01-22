import { ApiReferenceReact } from '@scalar/api-reference-react';
import {  useEffect } from 'react';
import clsx from 'clsx';

import { useDetectTheme } from '~/site/shared/hooks';
import '@scalar/api-reference-react/style.css';


export default function ScalarAPIDocs() {
    const theme = useDetectTheme()

    useEffect(() => {
        if (typeof document === "object") {
            if (document.body.classList.contains('light-mode')) {
                document.body.classList.remove('light-mode')
            } else if (document.body.classList.contains('dark-mode')) {
                document.body.classList.remove('dark-mode')
            }
        }
    }, [])

    return (
        <div className={clsx({
            'light-mode': theme !== "dark",
            'dark-mode': theme === "dark" || !theme
        })}>
            <ApiReferenceReact
                configuration={{
                    url: "https://raw.githubusercontent.com/wenzf/webaudits/refs/heads/master/app/audit_api/v1/openapi.json",
                    hideTestRequestButton: true,
                    forceDarkModeState: theme ?? 'dark',
                    showSidebar: false,
                    hideDarkModeToggle: false,
                    hiddenClients: true,
                    withDefaultFonts: false,
                    servers: [{ url: 'https://webaudits.org/api/ecos/v1' }],
                    theme: "default",
                    customCss: `:root { 
                --scalar-font: "Mada Variable", sans-serif, ui-sans-serif;
                --scalar-font-code: "Ubuntu Sans Mono Variable", monospace; 
                --scalar-color-1: var(--c-1);
                --scalar-color-2: var(--c-2);
                --scalar-color-3: var(--c-3);
                --scalar-background-1: var(--b-1);
                --scalar-background-2: var(--b-2);
                --scalar-background-3: var(--b-3);
                }
                `
                }}
            />
        </div>
    )
}
