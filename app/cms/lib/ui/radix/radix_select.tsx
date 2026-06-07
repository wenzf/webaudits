import {
    Root, ItemText, ItemIndicator, Trigger,
    Value, Content,
    ScrollUpButton, ScrollDownButton,
    Viewport, Item, Icon,
    type SelectTriggerProps, type SelectProps
} from "@radix-ui/react-select";
import {
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@radix-ui/react-icons";


const RadixSelect = ({
    placeholder, selectItems,
    selectTriggerProps, selectRootProps, id }: {
        placeholder?: string,
        selectItems: [string, string | number][] // label, value
        id?: string

        selectTriggerProps?: SelectTriggerProps & React.RefAttributes<HTMLButtonElement>
        selectRootProps?: SelectProps
    }) => {
    if (!selectTriggerProps?.className) {
        selectTriggerProps = {}
        selectTriggerProps.className = "btn_1 reg gap-2"
    }

    let optionalId = id ? { id } : {}


    return (
        <Root {...selectRootProps}>
            <Trigger {...selectTriggerProps} {...optionalId}>
                {placeholder && <Value placeholder={placeholder} />}
                <Icon className="flex p-1">
                    <ChevronDownIcon aria-hidden width={16} height={16} />
                </Icon>
            </Trigger>

                <Content className="overflow-hidden z-[122] rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 shadow-md shadow-neutral-200 dark:shadow-neutral-950">
                    <ScrollUpButton className="flex items-center justify-center h-8 cursor-default">
                        <ChevronUpIcon width={16} height={16} />
                    </ScrollUpButton>
                    <Viewport className="p-[5px]">
                        {selectItems.map((it) => (
                            <Item
                                className="rounded leading-none text-sm cursor-pointer flex items-center h-8 relative select-none pl-6 pr-4 py-0 text-neutral-950 dark:text-neutral-50 hover:bg-neutral-300 dark:hover:bg-neutral-700 hover:outline-1 outline-neutral-600 dark:outline-neutral-400"
                                value={it[1].toString()}
                                key={it[0]}
                            >
                                <ItemText>{it[0]}</ItemText>
                                <ItemIndicator className="absolute w-6 inline-flex items-center justify-center left-0">
                                    <CheckIcon width={16} height={16} aria-hidden />
                                </ItemIndicator>
                            </Item>
                        ))}
                    </Viewport>
                    <ScrollDownButton className="flex items-center justify-center h-8 cursor-default">
                        <ChevronDownIcon width={16} height={16} />
                    </ScrollDownButton>
                </Content>

        </Root>
    )
};


export default RadixSelect;
