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
