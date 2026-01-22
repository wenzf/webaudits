import Markdown from "react-markdown"
import { Link, NavLink } from "react-router";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';


export default function MarkdownWithCustomElements({ markup }: { markup: string }) {
    return (
        <Markdown
            rehypePlugins={[rehypeRaw, remarkGfm]}
            children={markup}
            components={{
                a(props) {
                    const { className, children, href, ...rest } = props
                    const elProps = rest.node?.properties
                    let El

                    if (elProps?.dataMarkup && href) {
                        if (elProps?.dataMarkup === "external") {
                            El = Link
                            elProps.rel = "noopener noreferrer"
                            elProps.target = "_blank"
                            elProps.className = className
                        } else if (elProps?.dataMarkup === "internal") {
                            El = NavLink
                            elProps.viewTransition = true
                                                        elProps.className = className

                        }
                        const _elProps = { ...elProps }
                        delete _elProps.dataMarkup
                        if (El) return <El to={href} {..._elProps}>{children}</El>
                    }
                    if (elProps?.dataMarkup) delete elProps.dataMarkup
                    return <a href={href} {...elProps}>{children}</a>
                }
            }}
        />)
}


