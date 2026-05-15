
import type { BlogPostFeedAside } from "../../../../types/site";
import SITE_CONFIG from "~/site/site.config";

import { NavLink } from "react-router";



export default function PostAsidePreview({ post }: { post: BlogPostFeedAside }) {

    const { PAGE_CONFIG: { NS_BLOG } } = SITE_CONFIG
    const { sk, tags, h1_title, main_image } = post

    return (
        <NavLink
            to={`/${NS_BLOG.path_fragment}/${sk}`}
            className="py-8 grid group grid-cols-4 gap-4 items-center">
            {main_image && (
                <div className="overflow-hidden rounded-xl col-span-1 min-w-20 h-auto w-full">
                    <img
                        className="h-auto w-full rounded-2xl group-hover:scale-105 duration-200"
                        src={main_image.src}
                        alt={main_image.alt}
                        srcSet={main_image.srcSet}
                        width={main_image.width}
                        height={main_image.height}
                        loading="lazy"
                        data-jpgs={main_image.jpgFallbacks}
                    />
                </div>
            )}
            <div className="col-span-3">
                {tags.length ? tags.map((it, ind) => <div key={ind}>{it.tag}</div>) : null}


                <div>{h1_title}</div>
            </div>



        </NavLink>
    )
}