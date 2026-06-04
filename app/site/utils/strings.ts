export const truncateString = (text: string, limit: number = 80): string => {
  if (text.length <= limit) {
    return text;
  }

  return text.slice(0, limit - 3) + "…";
};



export function convertToId(sentence:string) {
  return sentence
    .toLowerCase()
    .trim()
    // Remove everything that isn't a letter, number, or space
    .replace(/[^a-z0-9\s]/g, '')
    // Replace one or more consecutive spaces with a single hyphen
    .replace(/\s+/g, '-');
}


export const enumeratedBinding = ({ arr, ind, and }: { arr: unknown[], ind: number, and: string }) => {
    if (ind !== arr.length - 1) {
        return ind < (arr.length - 2) ? ", " : ` ${and} `
    }
    return ''
}
