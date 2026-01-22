export function cleanUrl(url: string): string {
    if (!url) return ''
    const prefixRegex = /^(https?:\/\/)|^(www\.)/i
    let cleanedUrl = url.replace(prefixRegex, '')
    const trailingSlashRegex = /\/+$/
    cleanedUrl = cleanedUrl.replace(trailingSlashRegex, '').replace('www.', '')
    return cleanedUrl
}

