
import { NavLink, useParams } from "react-router";
import type { BlogPostFeed } from "../../../../types/site";
import SITE_CONFIG from "~/site/site.config";
import { createLangPathByParam } from "~/common/shared/lang";




export default function PostFeedPreview({ post }: { post: BlogPostFeed }) {
    const { PAGE_CONFIG: { NS_BLOG } } = SITE_CONFIG
    const { sk, tags, h1_title, main_image, eyebrow } = post
    const { lang } = useParams()

    return (
        <section className="p-3 rounded-2xl break-inside-avoid relative">
            <div className="flex flex-wrap gap-x-2 gap-y-1 font-semibold mb-3">{tags.length ? tags.map((it, ind) => (
                <div key={ind} className="bg-neutral-100/80 dark:bg-neutral-900/80 p-1 text-sm grow-[0.3] text-center">
                    {it.tag}
                </div>
            )) : null}
            </div>


            <NavLink
                to={createLangPathByParam(lang, `/${NS_BLOG.path_fragment}/${sk}`)}
                className=" flex flex-col bg-neutral-100 dark:bg-neutral-900 p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:ring ring-neutral-300 dark:ring-neutral-700 rounded"
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
                <div className="pt-1 font-normal">{eyebrow}</div>
                <h2 className="md_art_h2"
                    style={{ marginTop: '0.5rem', marginBottom: "0.5rem" }}
                >{h1_title}
                </h2>
            </NavLink>

        </section>
    )
}