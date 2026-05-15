
import type { BlogPostFeed } from "../../../../types/site";
import SITE_CONFIG from "~/site/site.config";
import { NavLink } from "react-router";



export default function PostRelatedPreview({ post }: { post: BlogPostFeed }) {

    const { PAGE_CONFIG: { NS_BLOG } } = SITE_CONFIG
    const { sk, tags, h1_title, preview_image } = post

    return (
        <NavLink
            to={`/${NS_BLOG.path_fragment}/${sk}`}
            className="p-3 rounded-2xl break-inside-avoid block group">
            {preview_image && (
                <div className="overflow-hidden rounded-xl">
                    <img
                        className="h-auto w-full rounded-2xl group-hover:scale-105 duration-200"
                        src={preview_image.src}
                        srcSet={preview_image.srcSet}
                        alt={preview_image.alt}
                        width={preview_image.width}
                        height={preview_image.height}
                        loading="lazy"
                        data-jpgs={preview_image.jpgFallbacks}
                    />
                </div>
            )}
            <div className="my-4">{tags.length ? tags.map((it, ind) => (
                <div key={ind}>
                    {it.tag} 
                </div>
            )) : null}</div>

            <h3 className="font-bold">{h1_title}</h3>


        </NavLink>
    )
}