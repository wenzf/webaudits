import type { DBILFull, DBImageBase } from "../../../../../../types/site"

const createSrcsetsAndSizes = (inp: [string, number][]): {
    srcSet: string, sizes: string
} => {
    let le = inp.length
    let srcSet = ''
    let sizes = ''

    if (!le) return { srcSet, sizes }

    for (let i = 0; i < le; i += 1) {
        const [url, width] = inp[i]
        srcSet += `${url} ${width}w`

        if (i + 1 !== le) {
            srcSet += ', '
            sizes = `, ${width}px${sizes}`
        } else { // last
            sizes = `(max-width: ${width}px) ${width}px${sizes}`
        }
    }
    return { sizes, srcSet }
}



function sortDBImageBase(
    sources: DBImageBase["sources"]
): DBImageBase["sources"] {
    const mimeTypeOrder: { [key: string]: number } = {
        "image/webp": 1,
        "image/jpeg": 2,
        "image/png": 3,
    };

    return sources.sort((a, b) => {
        // Sort by MIME type
        const mimeTypeA = mimeTypeOrder[a.mimeType] || 4; // Default to 4 if MIME type is unknown
        const mimeTypeB = mimeTypeOrder[b.mimeType] || 4;

        if (mimeTypeA !== mimeTypeB) {
            return mimeTypeA - mimeTypeB;
        }

        // If MIME types are the same, sort by width (descending)
        return b.width - a.width;
    });
}



export const convertImageDataToImageProps = (imageData: DBILFull) => {
    let srcset = ""
    let jpgFallbacks = ""
    let mainSrc = ""
    let mainSrcWidth = 0
    let mainSrcHeight = 0
    const aspect = imageData.sources[0]?.aspect ?? null

    let thumbnail = ""
    let thumbnailWidth = 0
    let thumbnailHeight = 0

    const sourcesSorted = sortDBImageBase(imageData.sources)

    let webps: [string, number][] = []
    let jpgs: [string, number][] = []
    let pngs: [string, number][] = []

    for (let i = 0; i < sourcesSorted.length; i += 1) {
        const { imgUrl, width, mimeType } = sourcesSorted[i]
        if (mimeType === "image/webp") {
            webps = [...webps, [imgUrl, width]]
        } else if (mimeType === "image/jpeg") {
            jpgs = [...jpgs, [imgUrl, width]]
        } else if (mimeType === "image/png") {
            pngs = [...pngs, [imgUrl, width]]
        }
    }
    if (pngs?.length) {
        srcset = createSrcsetsAndSizes(pngs).srcSet
        mainSrc = pngs[0][0]
        mainSrcWidth = pngs[0][1]
        mainSrcHeight = Math.round(mainSrcWidth / aspect)
    } else {
        srcset = createSrcsetsAndSizes(webps).srcSet

        if (jpgs) {
            jpgFallbacks = createSrcsetsAndSizes(jpgs).srcSet
            mainSrc = jpgs[0][0]
            mainSrcWidth = jpgs[0][1]
            mainSrcHeight = Math.round(mainSrcWidth / aspect)

        } else {
            mainSrc = webps[0][0]
            mainSrcWidth = webps[0][1]
            mainSrcHeight = Math.round(mainSrcWidth / aspect)
        }
    }

    if (pngs?.length) {
        const last = pngs.length - 1
        thumbnail = pngs[last][0]
        thumbnailWidth = pngs[last][1]
        thumbnailHeight = Math.round(thumbnailWidth / aspect)
    } else if (webps?.length) {
        const last = webps.length - 1
        thumbnail = webps[last][0]
        thumbnailWidth = webps[last][1]
        thumbnailHeight = Math.round(thumbnailWidth / aspect)
    } else if (jpgs?.length) {
        const last = jpgs.length - 1
        thumbnail = jpgs[last][0]
        thumbnailWidth = jpgs[last][1]
        thumbnailHeight = Math.round(thumbnailWidth / aspect)
    }

    return {
        srcset,
        jpgFallbacks, mainSrc,
        mainSrcWidth, mainSrcHeight, aspect,
        thumbnail, thumbnailHeight, thumbnailWidth
    }

}