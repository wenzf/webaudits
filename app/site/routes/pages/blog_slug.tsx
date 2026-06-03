import { data, Link, NavLink, useLoaderData, useParams } from "react-router"

import { getDynamoDB } from "~/common/utils/server/dynamodb.server"
import type {
    BlogPostFeed, BlogPostView, IMAGE_TYPE_1, IMAGE_TYPE_OG,
    RouteHandle
} from "../../../../types/site"
import { formatTimestamp } from '~/site/utils/time';
import SITE_CONFIG from '~/site/site.config';
import { getTimingCollector } from "~/middleware/servertiming.server";

import {
    createJsonLdArticleObject, createJsonLdFaqPageObject, createJsonLdImageObject,
    jsonLdBuilder
} from '~/site/seo_metadata/json_ld';
import type { Route } from './+types/blog_slug';
import { createLangPathByParam, langByParam, localizedPath } from '~/common/shared/lang';
import MarkdownWithCustomElements from "~/common/shared/markdown"
import { getStaticData } from "~/common/utils/server/get_static_data.server";
import PostFeedPreview from "~/site/ui/blog/PostFeedPreview";
import PostImage from "~/site/ui/blog/PostImage";
import { ClockIcon } from "@radix-ui/react-icons";
import RadixAccordion from "~/site/ui/radix/radixAccordion";
import CpuIconSVG from "~/site/icons/cpuIconSVG";


export const handle: RouteHandle = {
    page_key: "NS_BLOG_SLUG",
    bc: true
};

export function headers({ parentHeaders }: { parentHeaders: Headers }) {
    parentHeaders.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=86400");
    parentHeaders.set("No-Vary-Search", `params=("faq")`);
    return parentHeaders;
}

export const meta = ({ loaderData }: Route.MetaArgs) => {
    if (!loaderData?.post || loaderData?.catch) return []
    let imageObjects: Partial<IMAGE_TYPE_1 & IMAGE_TYPE_OG>[] = []
    if (loaderData.post?.preview_image) imageObjects = [...imageObjects, loaderData.post?.preview_image]
    if (loaderData.post?.thumb_image) imageObjects = [...imageObjects, loaderData.post?.thumb_image]
    if (loaderData.post?.og_image) imageObjects = [...imageObjects, loaderData.post?.og_image]

    const mainImage = loaderData.post?.main_image ? createJsonLdImageObject({ imgSourceObject: loaderData.post?.main_image }) : []
    const ogImage = loaderData.post?.og_image ? createJsonLdImageObject({ imgSourceObject: loaderData.post?.og_image }) : []
    const images = [...mainImage, ...ogImage,]
    const propsToInject1 = images?.length ? { image: images } : {}
    const articleJsonObjects = createJsonLdArticleObject({
        blogPostView: loaderData.post as any,
        propsToInject: { ...propsToInject1 }
    })
    const faqJsonObject = createJsonLdFaqPageObject({
        faq_title: loaderData?.post?.faq_title,
        faq_description: loaderData.post?.faq_description,
        faq_qa_pairs: loaderData?.post?.faq_qa_pairs
    })

    return [
        jsonLdBuilder([
            ...articleJsonObjects,
            ...faqJsonObject
        ])
    ];
};


export const loader = async ({ params, context }: Route.LoaderArgs) => {
    let collector = getTimingCollector(context);

    const { lang_code } = langByParam(params.lang)

    return await collector.measure("postloader", "post resources waterfall", async () => {
        const reqPost = getDynamoDB(`BP#${lang_code}`, params.slug)
        const reqLocTxt = getStaticData(['loc_blog_slug'], lang_code) as Promise<Record<string, Record<string, string>>>
        const [resPost, locTxt] = await Promise.all([
            reqPost, reqLocTxt
        ])

        if (!resPost?.Item) return data({ catch: 'item_not_found', post: null, faq: null, locTxt }, { status: 404 })

        const post = resPost.Item as BlogPostView
        const related_posts_keys = post?.related_posts_list

        let reqRelatedJobs: Promise<unknown>[] = []
        let relatedCount = 0

        for (let i = 0; i < related_posts_keys.length; i += 1) {
            relatedCount += 1
            const post_keys = related_posts_keys[i]
            reqRelatedJobs = [
                ...reqRelatedJobs,
                getDynamoDB(
                    post_keys.pk,
                    post_keys.sk,
                    '_table',
                    "pk, sk, createdAt, h1_title, main_image, tags, eyebrow"
                )
            ]
        }

        const [...rest] = await Promise.all([...reqRelatedJobs])

        const restItems = (rest as { Item: BlogPostFeed }[]).map((it) => it?.Item)
        const relatedPosts = restItems
        const { related_posts_list, ...postReduced } = post

        return data({
            post: postReduced,
            catch: null,
            relatedPosts,
            locTxt
        })
    });
}

export default function Route() {
    const loaderData = useLoaderData<typeof loader>()

    const { SITE_DEPLOYMENT: { DOMAIN_URL }, PAGE_CONFIG: { NS_BLOG } } = SITE_CONFIG
    const { lang } = useParams()
    const { lang_html } = langByParam(lang)
    const locTxt = loaderData?.locTxt

    if (!loaderData?.post || loaderData?.catch === "item_not_found") return (
        <div>
            {locTxt?.body?.not_found ?? "Not found"}
        </div>
    )

    const {
        post: {
            sk,
            h1_title,
            tags,
            md_lead,
            main_image,
            reading_time,
            date_modified,
            createdAt,
            md_body,
            title,
            description,
            faq_qa_pairs,
            faq_title,
            faq_description,
            main_keyword,
            alternative_keywords,
            schema_article_type,
            eyebrow,
            authors,
            ai_assistance
        },
        relatedPosts,
    } = loaderData

    const ai_assistance_aside = locTxt.body.ai_assisted_txt.split("{{models}}")
    const path = createLangPathByParam(lang, "/" + NS_BLOG.path_fragment + "/" + sk)
    const canonical = DOMAIN_URL + path
    const datePublishedTimeObj = formatTimestamp(
        createdAt,
        lang_html,
        { year: "numeric", month: "long" }
    )
    const dateModifiedTimeObj = formatTimestamp(
        date_modified,
        lang_html,
        { year: "numeric", month: "long" }
    )

    return (
        <article className="h-full pt-24 pb-12 z-[5] relative px-1 md:pl-16 2xl:pl-1"
            itemScope itemType={`https://schema.org/${schema_article_type ?? "Article"}`} itemID={`${canonical}#id`}>
            <title>{title}</title>
            <meta name="description" content={description} />

            {tags?.length ? (
                <menu className="flex gap-x-1 md:gap-x-4 px-5 sm:px-6 lg:px-0 flex-wrap">
                    {tags.map((it, ind) => (
                        <li key={ind} className="flex gap-x-1 md:gap-x-4">
                            <NavLink
                                className='font-semibold text-sm md:text-xl hover:underline focus-visible:ring inline-flex items-center'
                                to={localizedPath(lang, "NS_BLOG") + "?tags=" + encodeURIComponent(it.tag)}>
                                {it.tag}
                            </NavLink>
                            {(ind + 1) !== tags.length && <span>•</span>}
                        </li>
                    ))}
                </menu>
            ) : null}

            <div className='pt-6 max-w-5xl px-5 sm:px-6 lg:px-0'>
                <div className='mt-6 md:mt-12'>
                    {eyebrow && <div className="mb-3 md:mb-6 font-semibold text-xl">{eyebrow}</div>}
                    <h1 className="md_art_h1">{h1_title}</h1>
                    <div className='mb-4 md:mb-8 xl:mb-12 text-xl bg-neutral-50 dark:bg-neutral-950'>
                        <MarkdownWithCustomElements
                            markup={md_lead}
                        />
                    </div>
                </div>
            </div>

            <div className='flex items-center px-5 sm:px-6 lg:px-0'>
                <div className="flex gap-x-4 gap-y-1 flex-wrap">
                    <span>
                        {authors?.length ? authors.map((it, ind) => (
                            <span key={ind}>
                                {(it.author_url && it.author_name) ? (
                                    <Link
                                        className='hover:underline focus-visible:ring'
                                        rel="noreferrer noopener author"
                                        target="_blank" to={it.author_url}
                                    >
                                        {it.author_name}
                                    </Link>
                                ) : null}
                                {(it.author_name && !it.author_url)
                                    ? <span>{it.author_name}</span>
                                    : null}

                                {ind !== authors.length - 1 ? (
                                    <>
                                        {ind < (authors.length - 2) ? ", " : ` ${locTxt.body.and} `}
                                    </>
                                ) : null}
                            </span>
                        )) : (
                            <span>
                                <Link
                                    className='hover:underline focus-visible:ring'
                                    rel="noreferrer noopener author"
                                    target="_blank"
                                    to={DOMAIN_URL}
                                >
                                    Web Audits
                                </Link>
                            </span>
                        )}
                    </span>
                    <span className="hidden md:inline">|</span>
                    <time dateTime={datePublishedTimeObj?.ISO}>
                        {locTxt.body.published_on}{" "}{datePublishedTimeObj?.readable}
                    </time>

                    {reading_time && (
                        <span className='flex gap-1 md:gap-4'>
                            <span className='hidden md:inline'>|</span>
                            <span className="inline-flex gap-1.5 items-center">
                                <ClockIcon width={16} height={16} aria-hidden className="pb-0.5" />
                                {" "}{reading_time}{" "}{locTxt?.body?.min_read}
                            </span>
                        </span>
                    )}

                    {ai_assistance?.length ? (
                        <NavLink
                            to={`#${path}-ai-disclosure`}
                            aria-describedby={`#${path}-ai-disclosure`}
                            className="inline-flex flex-wrap items-center gap-1.5 ring ring-neutral-300 dark:ring-neutral-700 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-xs px-1 leading-3 gap-y-0.5">
                            <CpuIconSVG width={16} height={16} aria-hidden />
                            <span className="text-sm whitespace-nowrap">
                                {locTxt?.body?.ai_assisted_label}
                            </span>
                            <span>•</span>
                            <span className="inline-flex flex-wrap gap-x-1 text-sm text-neutral-800 dark:text-neutral-200">
                                {ai_assistance.map((it, ind) => (
                                    <span key={it.llm_name}>
                                        <span className="font-mono text-xs tracking-tight whitespace-nowrap"
                                            style={{ wordSpacing: "-0.325em" }}
                                        >
                                            {it.llm_name}
                                        </span>
                                        {ind !== ai_assistance.length - 1 ? (
                                            <>
                                                {ind < (ai_assistance.length - 2) ? ", " : ` ${locTxt.body.and} `}
                                            </>
                                        ) : null}
                                    </span>
                                ))}
                            </span>


                        </NavLink>
                    ) : null}

                </div>
            </div>

            {main_image && <PostImage
                image_type_1={main_image}
                loading="eager"
            />}

            <div className='pt-12'>
                <div className='mt-6 md:mt-12 xl:mt-16 col-span-5 md_1 art'>
                    <MarkdownWithCustomElements
                        markup={md_body}
                        withCustomComponents
                    />
                </div>
            </div>

            {faq_qa_pairs?.length ? (
                <RadixAccordion
                    items={faq_qa_pairs}
                    title={faq_title}
                    description={faq_description}
                />
            ) : null}


            {ai_assistance && (
                <aside
                    id={`${path}-ai-disclosure`}
                    className="md_art_cont my-12 md:my-24 xl:my-36 text-neutral-700 dark:text-neutral-300 border-t border-t-neutral-300 dark:border-t-neutral-700 pt-6">
                    <h2 className="text-2xl">{locTxt.body.ai_assisted_about_title}</h2>
                    <p className="my-2">
                        {ai_assistance_aside[0]}
                        {ai_assistance.map((it, ind) => (
                            <span key={it.llm_name}>
                                <span
                                    className="font-mono text-sm tracking-tight whitespace-nowrap"
                                    style={{ wordSpacing: "-0.25em" }}
                                >
                                    {it.llm_name}
                                </span>
                                {" "}
                                (
                                <span
                                    className="font-mono text-sm tracking-tight whitespace-nowrap"
                                    style={{ wordSpacing: "-0.25em" }}
                                >
                                    {it.llm_version}
                                </span>

                                {", "}
                                <Link className="md_art_a" target="_blank" rel="noreferrer nooppener" to={it.llm_vendor_url}>{it.llm_vendor_name}</Link>)
                                {ind !== ai_assistance.length - 1 ? (
                                    <>
                                        {ind < (ai_assistance.length - 2) ? ", " : ` ${locTxt.body.and} `}
                                    </>
                                ) : null}
                            </span>
                        ))}
                        {" "}
                        {ai_assistance_aside[1]}
                    </p>
                </aside>
            )}


            <div className='my-12 md:my-24 xl:my-36 border-b border-neutral-300 dark:border-neutral-700 w-full mx-auto'>
                <time dateTime={dateModifiedTimeObj?.ISO}>
                    {locTxt?.body?.modified_on}{" "}{dateModifiedTimeObj?.readable}
                </time>
            </div>

            {relatedPosts?.length ? (
                <aside className='pb-12'>
                    <h2 className='md_art_h2'>{locTxt?.body?.related_posts}</h2>
                    <nav className="columns-1 md:columns-2 gap-6 space-y-6 py-12">
                        {relatedPosts.map((it) => <PostFeedPreview key={it.sk + it.pk} post={it} />)}
                    </nav>
                </aside>
            ) : null}

        </article>
    )
} 