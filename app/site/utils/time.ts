const defaultOptions1: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // hour: 'numeric',
    // minute: 'numeric',
    // second: 'numeric',
    // timeZoneName: 'short',

    // hour: "2-digit",
    // minute: 'numeric',
    // second: 'numeric',
    // timeZoneName: 'short',
};


export function formatTimestamp(
    timestamp: string | number,
    locale: string = 'de-CH',
    options: Intl.DateTimeFormatOptions = {},
    timeZone: string = "Europe/London"
): {
    readable: string,
    ISO: string
} | null {
    const epochMilliseconds = typeof timestamp === "number"
        ? timestamp
        : parseInt(timestamp, 10);

    if (isNaN(epochMilliseconds)) return null

    const date = new Date(epochMilliseconds);

    if (timeZone) {
        defaultOptions1.timeZone = timeZone;
    }

    const combinedOptions: Intl.DateTimeFormatOptions = {
        ...defaultOptions1,
        ...options,
    };

    try {
        return {
            readable: new Intl.DateTimeFormat(locale, combinedOptions).format(date),
            ISO: date.toISOString()
        };
    } catch (error) {
        return null
    }
}



export function convertUnixToDatetimeLocal(unixTimestampMs: unknown) {
    let date;

    if (typeof unixTimestampMs === 'number' && !isNaN(unixTimestampMs)) {
        date = new Date(unixTimestampMs);
    } else {
        date = new Date();
    }

    if (isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function unixToNewsSitemapDate(unixTimestamp:number) {
  // Fallback: If the timestamp is in seconds (10 digits), convert to milliseconds (13 digits)
  let timestamp = Number(unixTimestamp);
  if (String(timestamp).length === 10) {
    timestamp *= 1000;
  }

  const date = new Date(timestamp);
  
  // Guard against invalid dates
  if (isNaN(date.getTime())) {
    return "";
  }
  
  const pad = (num:number) => String(num).padStart(2, '0');
  
  const YYYY = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const DD = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  
  // Calculate timezone offset
  const offsetMinutes = date.getTimezoneOffset();
  if (offsetMinutes === 0) return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}Z`;
  
  // getTimezoneOffset() returns positive for western zones (e.g. UTC-5 is 300)
  // and negative for eastern zones (e.g. UTC+7 is -420)
  const sign = offsetMinutes > 0 ? '-' : '+';
  const absMinutes = Math.abs(offsetMinutes);
  const offsetH = pad(Math.floor(absMinutes / 60));
  const offsetM = pad(absMinutes % 60);
  
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}${sign}${offsetH}:${offsetM}`;
}

