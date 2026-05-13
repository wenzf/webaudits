import * as Tooltip from '@radix-ui/react-tooltip';
import { micromark } from 'micromark'
import { frontmatter, frontmatterHtml } from 'micromark-extension-frontmatter';
import { useState, type ButtonHTMLAttributes, type HTMLAttributes, type RefAttributes } from 'react';
import { NavLink, type NavLinkProps } from 'react-router';

export default function TooltipButton({
    triggerProps,
    tooltipText,
    children,
    isNavLink = false,
    triggerElement,
    textAsMarkdown = false,
    contentProps,
    rootProps
}: {
    triggerProps?: HTMLAttributes<HTMLButtonElement>
    | ButtonHTMLAttributes<HTMLButtonElement>
    | NavLinkProps & RefAttributes<HTMLButtonElement>
    tooltipText: string | React.ReactNode,
    children?: React.ReactNode,
    isNavLink?: boolean
    triggerElement?: React.ReactNode
    textAsMarkdown?: boolean
    contentProps?: Tooltip.TooltipContentProps & RefAttributes<HTMLDivElement>
    rootProps?:Tooltip.TooltipProps
}) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Tooltip.Provider >
            <Tooltip.Root open={isOpen} onOpenChange={(e) => setIsOpen(e)} {...rootProps}>
                <Tooltip.Trigger asChild onClick={() => setIsOpen((prev) => !prev)}>
                    {triggerElement ? triggerElement : isNavLink ? (
                        <NavLink {...triggerProps as NavLinkProps} viewTransition>
                            {children}
                        </NavLink>
                    ) : (
                        <button {...triggerProps as HTMLAttributes<HTMLButtonElement>
                            | ButtonHTMLAttributes<HTMLButtonElement>}>
                            {children}
                        </button>
                    )}
                </Tooltip.Trigger>

                    <Tooltip.Content
                       // className="rdx-tt-content z-[33] rounded text-[0.9375rem] leading-[1.4] select-none max-w-xs px-3 py-2 bg_gray_1 col_gray_11"
                        className="z-40 rounded text-sm select-none max-w-xs px-2 py-1 dark:bg-neutral-800 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-600"
                        sideOffset={5}
                        {...contentProps}
                    >
                        {textAsMarkdown && typeof tooltipText === "string" ? (
                            <div className='md page'
                                dangerouslySetInnerHTML={{
                                    __html: micromark(tooltipText,
                                        {
                                            extensions: [frontmatter()],
                                            htmlExtensions: [frontmatterHtml()],
                                            allowDangerousProtocol: false,
                                            allowDangerousHtml: true
                                        })
                                }} />
                        ) : tooltipText}

                        <Tooltip.Arrow className="fill-neutral-300 dark:fill-neutral-600"  />
                    </Tooltip.Content>

            </Tooltip.Root>
        </Tooltip.Provider>
    )
}