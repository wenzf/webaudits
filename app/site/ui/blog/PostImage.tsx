import { Link } from "react-router";
import type { IMAGE_TYPE_1 } from "../../../../types/site";


export default function PostImage({
    image_type_1,
    loading,
    sizes = "(max-width: 1024px) 100vw, 1024px"
}: {
    image_type_1: IMAGE_TYPE_1,
    loading?: "lazy" | "eager"
    sizes?: string
}) {
    if (!image_type_1) return null
    const image_type_1_author_name = image_type_1?.author_name
    const image_type_1_author_url = image_type_1?.author_url
    const image_type_1_license_url = image_type_1?.license_url
    const image_type_1_license_name = image_type_1?.license_name
    const image_type_1_figcaption = image_type_1?.figCaption
    const hasCaption = Boolean(image_type_1_author_name || image_type_1_license_name || image_type_1_figcaption)
    const hasLicense = Boolean(image_type_1_license_name)

    return (
        <figure className='pt-8 max-w-5xl h-auto'>
            <img
                className="w-full"
                loading={loading}
                height={image_type_1.height}
                width={image_type_1.width}
                src={image_type_1.src}
                alt={image_type_1.alt}
                srcSet={image_type_1.srcSet}
                sizes={sizes}
            />

            {hasCaption && (
                <figcaption className="flex flex-wrap justify-between pt-1 gap-x-8">
                    {image_type_1_figcaption ? (
                        <div className="text-sm md:text-base">{image_type_1_figcaption}</div>
                    ) : <div />}
                    {image_type_1_author_name ? (
                        <div className="text-right grow">
                            <small>
                                {(image_type_1_author_url && image_type_1_author_url) ? (
                                    <Link
                                        className="hover:underline"
                                        rel="noopener noreferrer author"
                                        target="_blank"
                                        to={image_type_1_author_url}
                                    >
                                        {image_type_1_author_name}
                                    </Link>
                                ) : (
                                    <span>{image_type_1_author_name}</span>
                                )}
                                {hasLicense && (
                                    <>
                                        {" / "}
                                        {(image_type_1_license_name && image_type_1_license_url) ? (
                                            <Link
                                                className="hover:underline"
                                                rel="noopener noreferrer license"
                                                target="_blank"
                                                to={image_type_1_license_url}
                                            >
                                                {image_type_1_license_name}
                                            </Link>
                                        ) : (
                                            <span>{image_type_1_license_name}</span>
                                        )}
                                    </>
                                )}
                            </small>
                        </div>
                    ) : null}
                </figcaption>
            )}
        </figure>
    )
}