import Markdown, { type Components as MarkdownComponents } from "react-markdown"
import { Link, NavLink } from "react-router";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import remarkBreaks from 'remark-breaks';
import type { Root, Parent } from 'mdast';
import type { PluggableList, Plugin } from 'unified';
import type { Element as HastElement } from 'hast';
import type { ExtraProps } from 'react-markdown';
import React,
 {
     type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import SortableAuditTableList, { type SortableAuditTableListProps } from "~/site/ui/lists/SortableAuditTableList";
import { convertToId } from "~/site/utils/strings";


// interface MyCustomBlockProps {
//     id: string;
//     variant: string;
// }
type CustomComponentProps = HTMLAttributes<HTMLElement> & ExtraProps & { encodedprops?: string };

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & ExtraProps;

const decodeProps = <T,>(props: CustomComponentProps): T => {
    if (!props.encodedprops) return props as T;
    try {
        return JSON.parse(props.encodedprops) as T;
    } catch {
        return props as T;
    }
};

const extractJson = (text: string): string | null => {
    const start = text.indexOf('{');
    if (start === -1) return null;
    let depth = 0;
    for (let i = start; i < text.length; i++) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') {
            depth--;
            if (depth === 0) return text.slice(start, i + 1);
        }
    }
    return null;
};

const remarkCustomComponents: Plugin<[], Root> = () => {
    return (tree: Root) => {
        visit(tree, 'paragraph', (node: any, index: number | undefined, parent: Parent | undefined) => {
            if (!parent || typeof index !== 'number') return;

            const text = node.children?.map((child: any) => {
                if (child.type === 'text') return child.value;
                if (child.type === 'link') return child.children?.map((c: any) => c.value ?? '').join('') ?? '';
                return '';
            }).join('') ?? '';

            const trimmed = text.trim();
            const regex = /^\{\{(cc_[\w]+),\s*/;
            const match = regex.exec(trimmed);
            if (!match) return;

            const componentName = match[1];
            const afterName = trimmed.slice(match[0].length);
            const propsString = extractJson(afterName);
            if (!propsString) return;

            try {
                JSON.parse(propsString);
                const newNode = {
                    type: 'ccBlock' as any,
                    data: {
                        hName: componentName,
                        hProperties: {
                            encodedprops: propsString,
                        },
                    },
                    children: [],
                };
                parent.children.splice(index, 1, newNode as any);
            } catch (e) {
                console.error("Failed to parse props for custom component", e);
            }
        });
    };
};


/*
const MyCustomBlock = ({ id, variant }: MyCustomBlockProps) => (
    <div className={`block-${variant}`} id={id}>
        <h3>Custom Block: {id}</h3>
        <p>Variant: {variant}</p>
    </div>
);

const MyCustomBlock2 = ({ id, variant }: MyCustomBlockProps) => {
    const [st, setSt] = useState('some');

    useEffect(() => {
        setSt('not some');
    }, []);

    return (
        <div className={`block-${variant}`} id={id}>
            <h3>Custom Block2: {id}</h3>
            <p>Variant: {variant}</p>
            <p>State: {st}</p>
        </div>
    );
};

*/

// Helper to extract pure text from React children 
// (handles strings, numbers, or nested elements like bold/italics inside headings)
function flattenChildren(children: React.ReactNode): string {
    return React.Children.toArray(children)
        .map((child) => {
            if (typeof child === 'string' || typeof child === 'number') {
                return child.toString();
            }

            // Check if it's a valid React element before accessing props
            if (React.isValidElement(child)) {
                // Cast it to an element with an optional children prop
                const element = child as React.ReactElement<{ children?: React.ReactNode }>;

                if (element.props.children) {
                    return flattenChildren(element.props.children);
                }
            }

            return '';
        })
        .join('');
}

const components: MarkdownComponents & {
   // cc_block_name?: (props: CustomComponentProps) => ReactNode;
   // cc_block_name2?: (props: CustomComponentProps) => ReactNode;
    cc_sortable_audit_list?: (props: CustomComponentProps) => ReactNode;
} = {
    a(props: AnchorProps) {
        const { className, children, href, ...rest } = props;
        const elProps = (rest.node as HastElement | undefined)?.properties as Record<string, unknown> | undefined;
        let El: typeof Link | typeof NavLink | undefined;

        if (elProps?.dataMarkup && href) {
            if (elProps.dataMarkup === "external") {
                El = Link;
                elProps.rel = "noopener noreferrer";
                elProps.target = "_blank";
                elProps.className = className;
            } else if (elProps.dataMarkup === "internal") {
                El = NavLink;
                elProps.viewTransition = true;
                elProps.className = className;
            }
            const _elProps = { ...elProps };
            delete _elProps.dataMarkup;
            if (El) return <El to={href} {...(_elProps as any)}>{children}</El>;
        }
        if (elProps?.dataMarkup) delete elProps.dataMarkup;
        return <a href={href} {...(elProps as AnchorHTMLAttributes<HTMLAnchorElement>)}>{children}</a>;
    },
    h2: ({ children, node, ...props }) => {
        // Destructuring 'node' prevents it from staying inside 'props'
        const id = convertToId(flattenChildren(children));
        return <h2 id={id} {...props}>{children}</h2>;
    },
    h3: ({ children, node, ...props }) => {
        const id = convertToId(flattenChildren(children));
        return <h3 id={id} {...props}>{children}</h3>;
    },
    h4: ({ children, node, ...props }) => {
        const id = convertToId(flattenChildren(children));
        return <h4 id={id} {...props}>{children}</h4>;
    },
    table: ({ children, node, ...props }) => {
        if (props?.className?.includes("escape_md1")) {
            return <table {...props}>{children}</table>
        } else {
            return <div className="table-wrap"><table>{children}</table></div>
        }
    },
   // cc_block_name: (raw) => <MyCustomBlock {...decodeProps<MyCustomBlockProps>(raw)} />,
   // cc_block_name2: (raw) => <MyCustomBlock2 {...decodeProps<MyCustomBlockProps>(raw)} />,
    cc_sortable_audit_list: (raw) => (
        <div className="overflow-x-auto my-12">
            <SortableAuditTableList {...decodeProps<SortableAuditTableListProps>(raw)} />
        </div>),
};

const remarkPluginsDefault = [remarkGfm, remarkBreaks] as PluggableList;
const remarkPluginsWithCustom = [remarkGfm, remarkBreaks, remarkCustomComponents] as PluggableList;

export default function MarkdownWithCustomElements({ markup, withCustomComponents = false }: {
    markup: string;
    withCustomComponents?: boolean;
}) {
    return (
        <Markdown
            remarkPlugins={withCustomComponents ? remarkPluginsWithCustom : remarkPluginsDefault}
            rehypePlugins={[rehypeRaw]}
            children={markup}
            components={components}
        />
    );
}