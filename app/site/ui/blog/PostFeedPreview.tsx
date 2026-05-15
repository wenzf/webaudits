
import { NavLink } from "react-router";
import type { BlogPostFeed } from "../../../../types/site";
import SITE_CONFIG from "~/site/site.config";




export default function PostFeedPreview({ post }: { post: BlogPostFeed }) {
    const { PAGE_CONFIG: { NS_BLOG } } = SITE_CONFIG
    const { sk, tags, h1_title, main_image } = post

    return (
        <section className="p-3 rounded-2xl break-inside-avoid">
            {main_image && (
                <img
                    className="h-auto w-full rounded-2xl"
                    src={main_image.src}
                    alt={main_image.alt}
                    srcSet={main_image.srcSet}
                    width={main_image.width}
                    height={main_image.height}
                    data-jpgs={main_image.jpgFallbacks}
                />
            )}
            <div className="tag_1 my-8">{tags.length ? tags.map((it, ind) => (
                <div key={ind}>
                    {it.tag}
                </div>
            )) : null}</div>
            <h2 className="text-[2rem] font-bold mb-4 leading-[1.25]">{h1_title}</h2>

            <NavLink
                to={`/${NS_BLOG.path_fragment}/${sk}`}


                className="mb-3 font-bold underline inline-flex gap-5 items-center ring-current"

            >
                "Read full post"
            </NavLink>
        </section>
    )
}