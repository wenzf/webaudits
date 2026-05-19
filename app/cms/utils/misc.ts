import type { DBImageBase } from "../../../types/site";



export const copyToClipboard = async (text: string) => {
    if (typeof navigator === "object" && "clipboard" in navigator) {
        navigator.clipboard.writeText(text)
    }
}


export function sortDBImageBase(
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


export const createSrcsetsAndSizes = (inp: [string, number][]): {
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




function stripHtmlTags(htmlString: string): string {
    const htmlTagRegex = /<[^>]*>/g;
    let plainText = htmlString.replace(htmlTagRegex, '');
    plainText = plainText.replace(/\s+/g, ' ').trim();
    return plainText;
}

function replaceNonAlphanumeric(inputString: string, replacementChar: string = ''): string {
    const nonAlphanumericAndNonWhitespaceRegex = /[^\p{L}\p{N}\s]/gu;
    const cleanedString = inputString.replace(nonAlphanumericAndNonWhitespaceRegex, replacementChar);
    return cleanedString;
}



export function createPlainText(inp: string): string {
    const one = stripHtmlTags(inp)
    const two = replaceNonAlphanumeric(one)
    return two.toLowerCase().trim()
}
