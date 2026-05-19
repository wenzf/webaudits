import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import * as Accordion from '@radix-ui/react-accordion';
import MarkdownWithCustomElements from "~/common/shared/markdown";


export default function RadixAccordion({ title, description, items }: {
    title?: string,
    description?: string
    items: {
        q: string
        a: string // markdown
    }[]
}) {

    return (
        <div className="max-w-2xl md_art_hr">
            <div className="md_art_hr" />
            {title && <h2 className="md_art_h2">{title}</h2>}
            {description && <p>{description}</p>}
            <Accordion.Root type="multiple"            >
                {items.map((it, ind) => (
                    <Accordion.Item value={`item-${ind}`} key={ind} className="w-full md_art_hr pt-6">
                        <Accordion.Header>
                            <Accordion.Trigger className="group flex justify-between w-full items-center p-1 focus-visible:ring cursor-pointer">
                                <span style={{ marginTop: '0.75rem', marginBottom: "0.75rem" }} className="text-xl font-regular text-left">{it.q}</span>
                                <span className="group-data-[state=open]:hidden rounded-full p-3 duration-200 group-hover:scale-110 bg-neutral-100 dark:bg-neutral-900 group-hover:bg-neutral-200 group-hover:dark:bg-neutral-800">
                                    <PlusIcon width={16} height={16} aria-hidden />
                                </span>
                                <span className="group-data-[state=closed]:hidden rounded-full p-3 duration-200 group-hover:scale-110 ring-2 ring-neutral-400 dark:ring-neutral-600">
                                    <MinusIcon width={16} height={16} aria-hidden />
                                </span>
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="AccordionContent overflow-hidden md_1 art">
                            <MarkdownWithCustomElements
                                markup={it.a}
                            />
                        </Accordion.Content>
                    </Accordion.Item>
                ))}
            </Accordion.Root>
        </div>
    )
}