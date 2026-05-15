import {  MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import * as Accordion from '@radix-ui/react-accordion';
import MarkdownWithCustomElements from "~/site/shared/markdown";


export default function RadixAccordion({ title, description, items }: {
    title?: string,
    description?: string
    items: {
        q: string
        a: string // markdown
    }[]
}) {

    return (
        <div 
        className="max-w-2xl"
        //className="max-w-2xl my-6 md:my-12 xl:my-24"
        >
            {title && <h2 className="rf_36">{title}</h2>}
            {description && <p>{description}</p>}
            <Accordion.Root
                type="multiple"
            //		defaultValue={["dd"]}
            //collapsible
            >
                {items.map((it, ind) => (
                    <Accordion.Item value={`item-${ind}`} key={ind} className="w-full not-last:border-b py-6">
                        <Accordion.Header>
                            <Accordion.Trigger className="group flex justify-between w-full items-center p-1 focus-visible:ring cursor-pointer">
                                <span style={{marginTop: '0.75rem', marginBottom: "0.75rem"}} className="rf_28 text-[var(--col_text_2)] text-left">{it.q}</span>
                                <div className="group-data-[state=open]:hidden bg-[var(--col-bg-2)] rounded-full p-3 duration-200 group-hover:scale-110">
                                    <PlusIcon width={16} height={16} aria-hidden />
                                </div>
                                <div className="group-data-[state=closed]:hidden bg-[var(--col-overlay-1)] rounded-full p-3 duration-200 group-hover:scale-110">
                                    <MinusIcon width={16} height={16} aria-hidden />
                                </div>
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="AccordionContent overflow-hidden">
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