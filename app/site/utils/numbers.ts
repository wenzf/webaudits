export function clamp(number: number, lowerBound: number, upperBound: number) {
    return Math.min(Math.max(number, lowerBound), upperBound);
}

export function decimalToScore(numb:number) {
    return Math.round(numb * 100)
}

export const invertNumbers = (numb: number, max: number) => {
    if (numb <= max) return numb
    return numb - max
}

export function formatNumber(
  value: number, 
  locale: string = 'de-CH', 
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export const getFullDaysByMS = (ms: number): number => {
  return Math.floor(ms / 86400000);
};

export function msToFullHours(ms: number): number {
  const msInHour = 3_600_000; // 1000 * 60 * 60
  return Math.floor(ms / msInHour);
}


export function getSecureRandom(max: number): number {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const randomBuffer = new Uint32Array(1);
        crypto.getRandomValues(randomBuffer);
        return Math.floor((randomBuffer[0] / (0xFFFFFFFF + 1)) * max);
    }
    return Math.floor(Math.random() * max);
}