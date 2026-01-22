export function roundToTwoDigits(numb: number): number {
    const multiplied = numb * 100
    const rounded = Math.round(multiplied)
    return rounded / 100
}


export const sum_of_arr_of_obj_numbs = (key: string) => (
    array: Record<string, unknown | number>[]) => {
    let outp = 0
    for (let i = 0; i < array.length; i += 1) {
        const obj = array[i]
        
        if (obj?.resourceType !== "total" && obj?.resourceType !== 'third-party') {
            if (obj && key in obj && typeof obj[key] === "number") {
                outp += obj[key]
            }
        }
    }
    return outp
}


export const get_item_with_fallback = (fallback: unknown) => (input: unknown) => {

  if (input === undefined || input === null) return fallback

  return input
} 


export const getDomainFromURL = (urlString: string): string => {
  try {
    const formattedUrl = urlString.includes("://")
      ? urlString
      : `https://${urlString}`

    const url = new URL(formattedUrl)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return "";
  }
};