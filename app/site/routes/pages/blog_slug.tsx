// import Markdown from 'marked-react';
import { data, Link, NavLink, useLoaderData, useParams } from "react-router"

import { getDynamoDB } from "~/common/utils/server/dynamodb.server"

import type { BlogPostFeed, BlogPostView, DBBase, IMAGE_TYPE_1, IMAGE_TYPE_OG, RouteHandle } from "../../../../types/site"

import { formatTimestamp } from '~/site/utils/time';

import SITE_CONFIG from '~/site/site.config';
import { getTimingCollector } from "~/middleware/servertiming.server";
import PostRelatedPreview from '~/site/ui/blog/PostRelatedPreview';
import PostAsidePreview from '~/site/ui/blog/PostAsidePreview';

import RadixAccordion from '~/site/ui/radix/radixAccordion';
import { createJsonLdArticleObject, createJsonLdFaqPageObject, createJsonLdImageObject, jsonLdBuilder } from '~/site/seo_metadata/json_ld';
import type { Route } from './+types/blog_slug';
import { createLangPathByParam, langByParam, localizedPath } from '~/common/shared/lang';
import MarkdownWithCustomElements from "~/site/shared/markdown";


export const handle: RouteHandle = {
    page_key: "NS_BLOG_SLUG",
    bc: true
};



export const meta = ({ loaderData, params }: Route.MetaArgs) => {
    const { SITE_DEPLOYMENT: { DOMAIN_URL }, PAGE_CONFIG: { NS_BLOG } } = SITE_CONFIG

    if (!loaderData.post || loaderData.catch) return []
    let imageObjects: Partial<IMAGE_TYPE_1 & IMAGE_TYPE_OG>[] = []
    if (loaderData.post?.preview_image) imageObjects = [...imageObjects, loaderData.post?.preview_image]
    if (loaderData.post?.thumb_image) imageObjects = [...imageObjects, loaderData.post?.thumb_image]
    if (loaderData.post?.og_image) imageObjects = [...imageObjects, loaderData.post?.og_image]
    //const otherImages = imageObjects.map((it) => createJsonLdImageObject({ imgSourceObject: it }))
    const mainImage = loaderData.post?.main_image ? createJsonLdImageObject({ imgSourceObject: loaderData.post?.main_image }) : []
    const ogImage = loaderData.post?.og_image ? createJsonLdImageObject({ imgSourceObject: loaderData.post?.og_image }) : []
    // const previewImage = loaderData.post?.preview_image ? createJsonLdImageObject({ imgSourceObject: loaderData.post?.preview_image }) : []
    // const thumbImage = loaderData.post?.thumb_image ? createJsonLdImageObject({ imgSourceObject: loaderData.post?.thumb_image }) : []


    const images = [...mainImage, ...ogImage,]

    const propsToInject1 = images?.length ? { image: images } : {}

    //const propsToInject2 = thumbImage?.length ? { thumbnail: thumbImage } : {}

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
        // {
        ///    "script:ld+json": {
        //  "@context": "https://schema.org",
        //  "@type": "Organization",
        //  "name": "My App",
        //  "url": "https://example.com",
        //},

        jsonLdBuilder([
            ...articleJsonObjects,
            ...faqJsonObject
            // ...otherImages
        ])


    ];
};

export const loader = async ({ params, context }: Route.LoaderArgs) => {
    let collector = getTimingCollector(context);

    const { lang_code } = langByParam(params.lang)

    return await collector.measure("postloader", "post resources waterfall", async () => {
        const reqPost = getDynamoDB(`BP#${lang_code}`, params.slug)
        //    const reqAside = getDynamoDB(`BA#${lang_code}`, "main")
        //        const [resPost, resAside] = await Promise.all([reqPost, reqAside])
        const [resPost] = await Promise.all([reqPost])

        if (!resPost?.Item) return data({ catch: 'item_not_found', post: null, faq: null }, { status: 404 })
        const post = resPost.Item as BlogPostView

        //  const category_id = post?.category_id

        //        const popular_posts_keys = resAside?.Item?.popular_posts_list

        let reqAsideJobs: Promise<unknown>[] = []
        let asideCount = 0

        /*
        for (let i = 0; i < popular_posts_keys?.length; i += 1) {
            asideCount += 1
            const post_keys = popular_posts_keys[i]
            reqAsideJobs = [...reqAsideJobs,
            getDynamoDB(
                post_keys.pk,
                post_keys.sk,
                '_table',
                "pk, sk, createdAt, h1_title, main_image, category_id, tags"
            )]
        }
*/

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
                    "pk, sk, createdAt, h1_title, main_image, tags"
                )

            ]
        }


        // const reqFaq = getDynamoDB("CF#en", category_id)

        const [ //resFaq,
            ...rest] = await Promise.all([ // reqFaq, 
                ...reqAsideJobs,
                ...reqRelatedJobs])


        const restItems = (rest as { Item: BlogPostFeed }[]).map((it) => it?.Item)
        const asidePosts = restItems.slice(0, asideCount)
        //const relatedPosts = restItems.slice(asideCount, asideCount + relatedCount)
        const relatedPosts = restItems

        const { related_posts_list, ...postReduced } = post


        // let faqItems = undefined


        // if (resFaq?.Item) {
        //
        //     const { pk, sk, createdAt, ...reducedFaq } = resFaq.Item
        //
        //     faqItems = reducedFaq as { faq_title?: string, faq_description?: string, faq_qa_pairs: { a: string, q: string }[] }
        //
        //
        //
        // }






        return data({
            post: postReduced,
            //  faqItems,
            catch: null,
            asidePosts,
            relatedPosts
        })
    });
}

export default function Route() {

    const loaderData = useLoaderData<typeof loader>()
    const { SITE_DEPLOYMENT: { DOMAIN_URL }, PAGE_CONFIG: { NS_BLOG } } = SITE_CONFIG


    const { lang } = useParams()

    const { lang_html } = langByParam(lang)


    if (!loaderData?.post || loaderData?.catch === "item_not_found") return (
        <div>
            NOT FOUND
        </div>
    )




    const {
        post: {
            sk,
            h1_title,
            tags,
            md_lead,
            main_image,
            author_name,
            author_url,
            reading_time,
            date_modified,
            createdAt,
            md_body,
            title,
            description,
            og_image,
            faq_qa_pairs,
            faq_title,
            faq_description,
            main_keyword,
            alternative_keywords,
            schema_article_type,
            eyebrow

        },
        asidePosts,
        relatedPosts,

        // faqItems
    } = loaderData

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
        <div className="h-full pt-24 pb-12 z-[5] relative px-1 md:pl-16 2xl:pl-1"
            itemScope itemType={`https://schema.org/${schema_article_type ?? "Article"}`} itemID={`${canonical}#id`}
        >
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta property="og:image" content={DOMAIN_URL + og_image?.src} />
            <meta property="og:image:secure_url" content={DOMAIN_URL + og_image?.src} />
            <meta property="og:image:type" content={og_image?.mime} />
            <meta property="og:image:width" content={og_image?.width.toString()} />
            <meta property="og:image:height" content={og_image?.height.toString()} />
            <meta property="og:image:alt" content={og_image?.alt} />

            <link rel='canonical' href={canonical} />

            {tags?.length ? (
                <menu className="flex gap-x-4 px-5 sm:px-6 lg:px-0">
                    {tags.map((it, ind) => (
                        <li key={ind} className="flex gap-x-4">
                            <NavLink
                                className='font-normal text-xl hover:underline focus-visible:ring'
                                to={localizedPath(lang, "NS_BLOG") + "?tags=" + encodeURIComponent(it.tag)}>
                                {it.tag}
                            </NavLink>
                            {(ind + 1) !== tags.length && <span>|</span>}
                        </li>
                    ))}
                </menu>
            ) : null}

            <div className='pt-6 max-w-5xl px-5 sm:px-6 lg:px-0'>
                <div className='mt-6 md:mt-12'>
                    {eyebrow && <div className="mb-3 md:mb-6 font-semibold text-xl">{eyebrow}</div>}
                    <h1 className="md_art_h1">{h1_title}</h1>
                    <div className='mb-4 md:mb-8 xl:mb-12 text-xl'>
                        <MarkdownWithCustomElements
                            markup={md_lead}
                        />
                    </div>
                </div>
            </div>

            <div className='flex items-center px-5 sm:px-6 lg:px-0'>


                <div className="flex gap-x-4 flex-wrap">
                    {author_name && (
                        <span>By{" "}
                            {(author_url && author_name) ? <Link className='hover:underline focus-visible:ring' to={author_url}>{author_name}</Link> : null}
                            {(author_name && !author_url) ? <span>{author_name}</span> : null}
                        </span>
                    )}
                    <span className="hidden md:inline">|</span>
                    <time dateTime={datePublishedTimeObj?.ISO}>
                        Published on {datePublishedTimeObj?.readable}
                    </time>

                    {reading_time && (
                        <span className='flex gap-1 md:gap-4'>
                            <span className='hidden md:inline'>|</span>
                            <span>{reading_time} {reading_time > 1 ? "mins" : "min"}</span>
                        </span>
                    )}

                </div>
            </div>

            {main_image && (
                <div className='pt-8'>
                    <img
                        loading='eager'
                        height={main_image.height}
                        width={main_image.width}
                        src={main_image.src} alt={main_image.alt} srcSet={main_image.srcSet} />
                </div>
            )}

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


            <div className='my-12 md:my-24 xl:my-36 border-b max-w-3xl mx-auto' />


            {relatedPosts?.length ? (
                <aside className='pb-12'>
                    <h2 className='md_1_art_h2'>Here are some related posts you may find interesting:</h2>
                    <nav
                        className="columns-1 md:columns-2 gap-6 space-y-6 py-12"
                    >
                        {relatedPosts.map((it) => <PostRelatedPreview key={it.sk + it.pk} post={it} />)}
                    </nav>
                </aside>
            ) : null}


            <div>
                <time dateTime={dateModifiedTimeObj?.ISO}>
                    Modified on {dateModifiedTimeObj?.readable}
                </time>
            </div>

        </div>
    )
}