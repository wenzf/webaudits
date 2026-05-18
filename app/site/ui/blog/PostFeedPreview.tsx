
import { NavLink, useParams } from "react-router";
import type { BlogPostFeed } from "../../../../types/site";
import SITE_CONFIG from "~/site/site.config";
import { createLangPathByParam } from "~/common/shared/lang";




export default function PostFeedPreview({ post }: { post: BlogPostFeed }) {
    const { PAGE_CONFIG: { NS_BLOG } } = SITE_CONFIG
    const { sk, tags, h1_title, main_image } = post
    const { lang} = useParams()

    return (
        <section className="p-3 rounded-2xl break-inside-avoid relative">
         
           

            <NavLink
                to={createLangPathByParam(lang,`/${NS_BLOG.path_fragment}/${sk}`)}
                className=" flex flex-col bg-neutral-100 dark:bg-neutral-900"
            >
                   {main_image && (
                <img
                    className="h-auto w-full rounded"
                    src={main_image.src}
                    alt={main_image.alt}
                    srcSet={main_image.srcSet}
                    width={main_image.width}
                    height={main_image.height}
                    data-jpgs={main_image.jpgFallbacks}
                    sizes="(min-width: 1280px) calc((100vw - 128px) / 3), (min-width: 768px) calc((100vw - 112px) / 2), calc(100vw - 48px)"
                />
            )}
            <h2 className="md_art_h2">{h1_title}</h2>
            </NavLink>
             <div className="flex flex-wrap gap-x-2 gap-y-1">{tags.length ? tags.map((it, ind) => (
                <div key={ind} className="bg-neutral-100/80 dark:bg-neutral-900/80 p-1 text-sm grow-[0.3] text-center">
                    {it.tag}
                </div>
            )) : null}
            </div>

        </section>
    )
}