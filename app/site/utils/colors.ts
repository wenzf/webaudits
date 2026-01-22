export function valueToRgb(value: number, minValue: number, maxValue: number): string {
    const clampedValue = Math.max(minValue, Math.min(maxValue, value));
    const normalizedValue = (clampedValue - minValue) / (maxValue - minValue);
    const hue = normalizedValue * 120; // 0 (Red) -> 120 (Green)
    const h = hue / 60;
    const c = 1; 
    const x = c * (1 - Math.abs(h % 2 - 1));

    let r_prime = 0;
    let g_prime = 0;
    let b_prime = 0;

    if (h >= 0 && h < 1) {
        r_prime = c; g_prime = x; b_prime = 0;
    } else if (h >= 1 && h < 2) {
        r_prime = x; g_prime = c; b_prime = 0;
    } else if (h >= 2 && h < 3) {
        r_prime = 0; g_prime = c; b_prime = x;
    } else if (h >= 3 && h < 4) {
        r_prime = 0; g_prime = x; b_prime = c;
    } else if (h >= 4 && h < 5) {
        r_prime = x; g_prime = 0; b_prime = c;
    } else if (h >= 5 && h < 6) {
        r_prime = c; g_prime = 0; b_prime = x;
    }
    const r = Math.round(r_prime * 205);
    const g = Math.round(g_prime * 205);
    const b = Math.round(b_prime * 205);

    return `${r} ${g} ${b}`
}