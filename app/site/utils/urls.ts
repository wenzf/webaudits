export const pathToUrl = (url: string, finalUrl: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const rootUrl = new URL(finalUrl).host
  return `${rootUrl}${url}`
}

export function safeUrl(finalUrl: string, probablyUrl: string) {
  if (probablyUrl.startsWith('http://') || probablyUrl.startsWith('https://')) {
    return probablyUrl
  }
  const path = new URL(finalUrl).pathname
  const fi = finalUrl.replace(path, '')
  return fi + probablyUrl.substring(1)
}

export const getDomainFromURL = (urlString: string): string => {
  try {
    const formattedUrl = urlString.includes("://")
      ? urlString
      : `https://${urlString}`;

    const url = new URL(formattedUrl);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return "";
  }
};

export function isUrlValid(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function titleToAnchor(title: string) {
  return title
    .normalize("NFD")
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase()
    .replace(/--/g, '-');
}


